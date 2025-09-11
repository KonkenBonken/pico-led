import noisejs from 'noisejs';
import convert from 'color-convert';
import { map } from './utils';
import type { Controller } from './controller';
import type { Frame } from './Frame';

// Returns RGB frames
const Animations = {
    Fire: {
        *frames(c) {
            const buffer = c.newFrame();
            const noise = new noisejs.Noise();
            let frame = Date.now();

            const H = 11;
            const L = 42;
            const ΔH = 11;
            const ΔL = 25;

            while (true) {
                for (let i = 0; i < buffer.length; i += 3) {
                    const n = noise.simplex2(i / 20, frame);
                    const rgb = convert.hsl.rgb(
                        map(n, -1, 1, H - ΔH, H + ΔH),
                        100,
                        map(n, -1, 1, L - ΔL, L + ΔL)
                    );
                    [buffer[i + 0], buffer[i + 1], buffer[i + 2]] = rgb;
                }
                yield buffer;
                frame += c.speed / 2e3 / c.FRAME_RATE;
            }
        },
    },

    ColorSwipe: {
        *frames(c) {
            const buffer = c.newFrame();
            let frame = 1;

            while (true) {
                const color = Math.random() * 256 ** 3;
                for (let i = 0; i < buffer.length; i += 3) {
                    for (let j = 0; j < 3; j++) buffer[i + j] = (color >> (j * 8)) & 255;
                    if (--frame < 1)
                        do {
                            yield buffer;
                            frame += c.speed / 5 / c.FRAME_RATE;
                        } while (frame < 0);
                }
            }
        },
    },
} satisfies Record<string, { frames(c: Controller): Generator<Frame, void, never> }>;

export default Animations;

export function animationExists(name: string): name is keyof typeof Animations {
    return Object.hasOwn(Animations, name);
}
