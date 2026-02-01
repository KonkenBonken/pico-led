import { EventEmitter } from 'events';
import { ref, watch } from '@vue/reactivity';
import Animations, { getAnimationJSON } from './animations';
import { map } from './utils';
import dgram from 'dgram';
import SizedFrame, { type Frame } from './Frame';

export class Controller extends EventEmitter<{ frame: [Frame] }> {
    readonly FRAME_SIZE: number;
    readonly FRAME_RATE: number;
    readonly newFrame = SizedFrame(this);

    readonly socket = dgram.createSocket('udp4');

    readonly brightness = ref(16);
    speed = 128;

    constructor(readonly LED_COUNT: number, readonly WHITE = false) {
        super();
        this.FRAME_SIZE = LED_COUNT * 3;
        this.FRAME_RATE = this.maxFrameRate * 0.9;

        watch(this.runningLoop, (_, prev?: NodeJS.Timeout) => clearInterval(prev));
        watch(this.pingInterval, (_, prev?: NodeJS.Timeout) => clearTimeout(prev));
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
            this.solidColor(0);
            this.fadeDuration = Infinity;
        }, 500);
    }

    readonly frameGenerator = ref<Generator<Frame, void, never> | null>(null);

    startAnimation(name: keyof typeof Animations) {
        this.frameGenerator.value = Animations[name].frames(this);
        this.beginLoop();
    }

    solidColor(color: number) {
        this.stopLoop();
        const hasW = !!((color >> 24) & 255);
        if (this.WHITE && hasW) {
            const buffer = new Uint8ClampedArray(this.LED_COUNT * 4);
            for (let i = 0; i < buffer.length; i += 4) {
                buffer[i + 0] = (color >> 16) & 255;
                buffer[i + 1] = (color >> 8) & 255;
                buffer[i + 2] = color & 255;
                buffer[i + 3] = (color >> 24) & 255;
            }
            this.sendBuffer(buffer);
        }

        const buffer = this.newFrame();
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i + 0] = (color >> 16) & 255;
            buffer[i + 1] = (color >> 8) & 255;
            buffer[i + 2] = color & 255;
        }
        if (this.WHITE && !hasW) this.sendBuffer(buffer.toGrbw());
        if (!this.WHITE) this.sendBuffer(buffer.toGrb());
        this.emit('frame', buffer.copy());
    }

    private readonly runningLoop = ref<NodeJS.Timeout | null>(null);

    beginLoop() {
        this.runningLoop.value ??= setInterval(
            () => this.animationIteration(),
            1000 / this.FRAME_RATE
        );
    }

    stopLoop() {
        this.runningLoop.value = null;
    }

    animationIteration() {
        const rawFrame = this.frameGenerator.value?.next().value;
        if (!rawFrame) return this.stopLoop();

        this.emit('frame', rawFrame);
        let frame = rawFrame.copy();

        frame.scale((this.brightness.value / 256) * this.fadeBrightness);

        const buffer = this.WHITE ? frame.toGrbw() : frame.toGrb();
        this.sendBuffer(buffer);
    }

    private readonly pingInterval = ref<NodeJS.Timeout | null>(null);

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
