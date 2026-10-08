import { EventEmitter } from 'events';
import { ref, shallowRef, watch } from '@vue/reactivity';
import Animations, { getAnimationJSON } from './animations';
import { map } from './utils';
import dgram from 'dgram';
import SizedFrame, { type Frame } from './Frame';

type State = {
    type: 'animation'
    name: keyof typeof Animations
    frameGenerator: Generator<Frame, void, never>
} | {
    type: 'microfunction',
    name: keyof typeof Animations
    codeBuffer: Uint8ClampedArray
} | {
    type: 'solidcolor'
    color: number
};

const offState: State = { type: 'solidcolor', color: 0 };

export class Controller extends EventEmitter<{ frame: [Frame] }> {
    readonly FRAME_RATE: number;
    readonly newFrame = SizedFrame(this);

    readonly socket = dgram.createSocket('udp4');

    private readonly currentState = shallowRef<Readonly<State>>(offState);

    readonly brightness = ref(16);
    speed = 128;

    constructor(readonly IP: string, readonly LED_COUNT: number, readonly WHITE = false, readonly RICH_UDP = false) {
        super();
        this.FRAME_RATE = this.maxFrameRate * 0.9;

        watch(this.pingInterval, (_, prev?: NodeJS.Timeout) => clearTimeout(prev));

        watch(this.currentState, (state: State) => {
            if (state.type === 'animation') {
                this.animationIteration();
            } else if (state.type === 'solidcolor') {
                const { color } = state;
                const RGB = color & 0xFFFFFF;
                const W = (color >> 24) & 255;

                const frame = this.newFrame();
                frame.fillColor(RGB);

                if (this.WHITE) {
                    if (W) frame.whiteChannel.fill(W);
                    else frame.populateWhiteChannel();
                }

                this.sendFrame(frame);
            } else if (state.type === 'microfunction') {
                this.sendMicroFunction(state.codeBuffer);
            }
        });

        watch(this.brightness, () => {
            if (this.currentState.value.type === 'solidcolor') {
                this.currentState.value = { ...this.currentState.value };
            }
        });
    }

    private get maxFrameRate() {
        if (this.WHITE) return 1 / (1.25e-6 * 32 * this.LED_COUNT + 80e-6);
        else return 1 / (1.25e-6 * 24 * this.LED_COUNT + 50e-6);
    }

    fadeDuration = Infinity;
    fadeStart = 0;

    private get fadeBrightness() {
        return map(Date.now(), this.fadeStart, this.fadeStart + this.fadeDuration, 1, 0);
    }

    turnOff() {
        this.startFade(500);
    }

    startFade(duration: number) {
        const now = Date.now();
        this.fadeDuration = duration;
        this.fadeStart = now;

        if (this.currentState.value.type === 'solidcolor') {
            this.pingDuration = 2 * 1000 / this.FRAME_RATE;
            this.currentState.value = { ...this.currentState.value };
        }

        setTimeout(() => {
            if (this.fadeStart !== now) return;
            this.currentState.value = offState;
            this.fadeDuration = Infinity;
            this.pingDuration = 10e3;
        }, duration + 200);
    }

    private animationInterval = setTimeout(() => 0);

    startAnimation(name: keyof typeof Animations) {
        clearTimeout(this.animationInterval);
        const animation = Animations[name];
        if ('microFunction' in animation && this.RICH_UDP)
            this.currentState.value = {
                type: 'microfunction',
                name,
                codeBuffer: animation.microFunction(this).buffer
            };
        else
            this.currentState.value = {
                type: 'animation',
                name,
                frameGenerator: animation.frames(this)
            };
    }

    solidColor(color: number) {
        this.currentState.value = {
            type: 'solidcolor',
            color
        };
    }

    animationIteration() {
        if (this.currentState.value.type !== 'animation') return;

        const _frame = this.currentState.value.frameGenerator.next().value;
        if (!_frame) return this.currentState.value = offState;
        const frame = _frame.copy();

        if (this.WHITE) frame.populateWhiteChannel();
        this.sendFrame(frame);

        this.animationInterval = setTimeout(
            () => this.animationIteration(),
            1000 / this.FRAME_RATE
        );
    }

    pingDuration = 10e3;
    private readonly pingInterval = ref<NodeJS.Timeout | null>(null);

    sendFrame(_frame = this.newFrame()) {
        this.emit('frame', _frame);
        this.pingInterval.value = setTimeout(() => this.sendFrame(_frame), this.pingDuration);

        const frame = _frame.copy();
        frame.scale((this.brightness.value / 256) * this.fadeBrightness);

        const buffer = this.WHITE ? frame.toGrbw() : frame.toGrb();

        if (!this.RICH_UDP)
            return this.sendBuffer(buffer);

        const flaggedBuffer = new Uint8ClampedArray(buffer.length + 1);
        flaggedBuffer.set(buffer, 1);

        this.sendBuffer(flaggedBuffer);
    }

    sendMicroFunction(codeBuffer: Uint8ClampedArray) {
        this.pingInterval.value = null;
        this.sendBuffer(codeBuffer);
    }

    sendBuffer(buffer: Uint8ClampedArray) {
        this.socket.send(buffer, 0, buffer.length, 12345, this.IP);
    }

    toJSON() {
        const state = this.currentState.value;
        return {
            stateType: state.type,
            showing: state.type === 'solidcolor' ? state.color : state.name,
            brightness: this.brightness.value,
            speed: this.speed,
            animations: getAnimationJSON(),
            supportsRGBW: this.WHITE
        };
    }
}

export const strips = {
    ws2812: new Controller('192.168.0.16', 180, false, false),
    sk6812: new Controller('192.168.0.2', 120, true, true)
}

export default function getController(req: Bun.BunRequest) {
    const strip = (req.params as { strip: string }).strip;
    if (!(strip in strips)) throw 'Strip not found';
    return strips[strip as 'ws2812'];
}
