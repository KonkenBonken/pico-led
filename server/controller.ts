import { EventEmitter } from 'stream';
import Animations from './animations';
import { map } from './utils';
import dgram from 'dgram';
import SizedFrame, { type Frame } from './Frame';

class Controller extends EventEmitter<{ frame: [Frame] }> {
    readonly LED_COUNT = 180;
    readonly FRAME_SIZE = this.LED_COUNT * 3;
    readonly FRAME_RATE = 30;
    readonly newFrame = SizedFrame(this);

    readonly socket = dgram.createSocket('udp4');

    brightness = 16;
    speed = 128;

    fadeDuration = Infinity;
    fadeStart = 0;
    private get fadeBrightness() {
        return map(Date.now(), this.fadeStart, this.fadeStart + this.fadeDuration, 1, 0);
    }

    turnOff() {
        this.fadeDuration = 500;
        this.fadeStart = Date.now();

        setTimeout(() => {
            this.stopLoop();
            this.sendBuffer();
            this.emit('frame', this.newFrame());
            this.fadeDuration = Infinity;
        }, 500);
    }

    private frameGenerator?: Generator<Frame, void, never>;
    startAnimation(name: keyof typeof Animations) {
        this.frameGenerator = Animations[name](this);
        this.beginLoop();
    }

    solidColor(color: number) {
        const buffer = this.newFrame();
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i + 0] = (color >> 16) & 255;
            buffer[i + 1] = (color >> 8) & 255;
            buffer[i + 2] = color & 255;
        }
        this.frameGenerator = (function* () {
            while (true) yield buffer;
        })();
        this.beginLoop();
    }

    private runningLoop?: NodeJS.Timeout;
    beginLoop() {
        this.runningLoop ??= setInterval(() => this.iteration(), 1000 / this.FRAME_RATE);
    }
    stopLoop() {
        clearInterval(this.runningLoop);
        delete this.runningLoop;
    }

    iteration() {
        const rawFrame = this.frameGenerator?.next().value;
        if (!rawFrame) return this.stopLoop();

        this.emit('frame', rawFrame);
        const frame = rawFrame.copy();

        frame.scale((this.brightness / 256) * this.fadeBrightness);
        frame.toGrb();

        this.sendBuffer(frame);
    }

    private pingInterval?: NodeJS.Timeout;
    sendBuffer(buffer = this.newFrame()) {
        this.socket.send(buffer, 0, this.FRAME_SIZE, 12345, '192.168.86.21');
        clearTimeout(this.pingInterval);
        this.pingInterval = setTimeout(() => this.sendBuffer(buffer), 60e3);
    }

    toJSON() {
        return {
            brightness: this.brightness,
            speed: this.speed,
            animations: Object.keys(Animations),
        };
    }
}

export default new Controller();
export type { Controller };
