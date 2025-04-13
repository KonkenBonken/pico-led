import { EventEmitter } from 'stream';
import Animations from './animations';
import { rgbToGrb } from './utils';
import dgram from 'dgram';

const LED_COUNT = 180;
const FRAME_SIZE = LED_COUNT * 3;
const FRAME_RATE = 30;

class Controller extends EventEmitter<{ frame: [Uint8ClampedArray] }> {
    readonly socket = dgram.createSocket('udp4');

    brightness = 16;
    speed = 128;

    turnOff() {
        this.stopLoop();
        this.sendBuffer();
    }

    private frameGenerator?: Generator<Uint8ClampedArray, void, never>;
    startAnimation(name: keyof typeof Animations) {
        this.frameGenerator = Animations[name](this);
        this.beginLoop();
    }

    solidColor(color: number) {
        this.stopLoop();
        const buffer = new Uint8ClampedArray(FRAME_SIZE);
        for (let i = 0; i < buffer.length; i += 3) {
            buffer[i + 0] = (color >> 16) & 255;
            buffer[i + 1] = (color >> 8) & 255;
            buffer[i + 2] = color & 255;
        }
        this.sendBuffer(buffer);
    }

    private runningLoop?: NodeJS.Timeout;
    beginLoop() {
        this.runningLoop ??= setInterval(() => this.iteration(), 1000 / FRAME_RATE);
    }
    stopLoop() {
        clearInterval(this.runningLoop);
        delete this.runningLoop;
    }

    iteration() {
        const _frame = this.frameGenerator?.next().value;
        if (!_frame) return this.stopLoop();

        const frame = new Uint8ClampedArray(_frame);

        for (let i = 0; i < FRAME_SIZE; i++)
            frame[i] = ((frame[i] ?? 0) * this.brightness) / 256;

        this.sendBuffer(frame);
    }

    private pingInterval?: NodeJS.Timeout;
    sendBuffer(buffer = new Uint8ClampedArray(FRAME_SIZE)) {
        this.socket.send(rgbToGrb(buffer), 0, FRAME_SIZE, 12345, '192.168.86.21');
        this.emit('frame', buffer);
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
