import noisejs from 'noisejs';
import type { Controller } from './controller';

const LED_COUNT = 180;

const Animations = {
    *Fire(c) {
        const buffer = new Uint8ClampedArray(LED_COUNT * 3);
        const noise = new noisejs.Noise();
        let frame = Date.now();

        while (true) {
            for (let i = 0; i < buffer.length; i += 3) {
                const n = noise.simplex2(i / 100, frame);
                buffer[i + 0] = n * (101 - 1) + 1; //G
                buffer[i + 1] = n * (254 - 161) + 161; //R
                buffer[i + 2] = n * 13; //B
            }
            yield buffer;
            frame += c.speed / 11e4;
        }
    },

    *ColorSwipe(c) {
        const buffer = new Uint8ClampedArray(LED_COUNT * 3);
        let frame = 1;

        while (true) {
            const color = Math.random() * 256 ** 3;
            for (let i = 0; i < buffer.length; i += 3) {
                for (let j = 0; j < 3; j++) buffer[i + j] = (color >> (j * 8)) & 255;
                if (--frame < 1)
                    do {
                        yield buffer;
                        frame += c.speed / 128;
                    } while (frame < 0);
            }
        }
    },
} satisfies Record<string, (c: Controller) => Generator<Uint8ClampedArray, void, never>>;

export default Animations;

export function animationExists(name: string): name is keyof typeof Animations {
    return Object.hasOwn(Animations, name);
}
