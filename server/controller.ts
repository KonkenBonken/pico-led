import Animations from './animations';
import dgram from 'dgram';

const LED_COUNT = 180;
const FRAME_SIZE = LED_COUNT * 3;
const FRAME_RATE = 30;
const PORT = [12345, '192.168.86.21'] as const;

class Controller {
    readonly socket = dgram.createSocket('udp4');

    brightness = 16;

    private frameGenerator?: Generator<Uint8ClampedArray, void, never>;
    startAnimation(name: keyof typeof Animations) {
        this.frameGenerator = Animations[name]();
        this.beginLoop();
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
        const frame = this.frameGenerator?.next().value;
        if (!frame) return this.stopLoop();

        for (let i = 0; i < FRAME_SIZE; i++)
            frame[i] = ((frame[i] ?? 0) * this.brightness) / 256;

        this.socket.send(frame, 0, FRAME_SIZE, ...PORT);
    }
}

export default new Controller();
