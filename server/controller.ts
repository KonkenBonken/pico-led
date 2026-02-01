import { EventEmitter } from 'events';
import { ref, shallowRef, watch } from '@vue/reactivity';
import Animations, { getAnimationJSON } from './animations';
import { map } from './utils';
import dgram from 'dgram';
import SizedFrame, { type Frame } from './Frame';

type State = {
    type: 'animation'
    frameGenerator: Generator<Frame, void, never>
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

    constructor(readonly LED_COUNT: number, readonly WHITE = false) {
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
        this.fadeDuration = 500;
        this.fadeStart = Date.now();

        setTimeout(() => {
            this.currentState.value = offState;
            this.fadeDuration = Infinity;
        }, 500);
    }


    startAnimation(name: keyof typeof Animations) {
        this.currentState.value = {
            type: 'animation',
            frameGenerator: Animations[name].frames(this)
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

        setTimeout(
            () => this.animationIteration(),
            1000 / this.FRAME_RATE
        );
    }

    private readonly pingInterval = ref<NodeJS.Timeout | null>(null);

    sendFrame(_frame: Frame) {
        this.emit('frame', _frame);
        const frame = _frame.copy();
        frame.scale((this.brightness.value / 256) * this.fadeBrightness);
        this.sendBuffer(this.WHITE ? frame.toGrbw() : frame.toGrb());
    }

    sendBuffer(buffer?: Uint8ClampedArray) {
        if (!buffer)
            buffer = new Uint8ClampedArray(this.LED_COUNT * (this.WHITE ? 4 : 3));
        this.socket.send(buffer, 0, buffer.length, 12345, '192.168.0.16');
        this.pingInterval.value = setTimeout(() => this.sendBuffer(buffer), 10e3);
    }

    toJSON() {
        return {
            brightness: this.brightness.value,
            speed: this.speed,
            animations: getAnimationJSON(),
            supportsRGBW: this.WHITE
        };
    }
}

export default new Controller(180, false);
