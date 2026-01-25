import noisejs from 'noisejs';
import convert from 'color-convert';
import { map } from './utils';
import { Controller } from './controller';
import type { Frame } from './Frame';
import { MicroFunction } from './MicroFunction.ts';

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
        previewFrame: 18e4,
        microFunction(c) {
            return new MicroFunction(`
            from random import getrandbits
            
            def f():
                buf = bytearray(${c.FRAME_SIZE})
                frame = 1
                
                while True:
                    color = getrandbits(24).to_bytes(3) 
                    for i in range(0, ${c.FRAME_SIZE}, 3):
                        buf[i:i+3] = color
                        yield buf
        `);
        },
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
        }
    }
} satisfies Record<
    string,
    {
        previewFrame?: number;
        frames(c: Controller): Generator<Frame, void, never>;
        microFunction?(c: Controller): MicroFunction
    }
>;

export default Animations;

export function animationExists(name: string): name is keyof typeof Animations {
    return Object.hasOwn(Animations, name);
}

export function getFramePreview(
    animation: (typeof Animations)[keyof typeof Animations]
) {
    const c = new Controller(30);
    if ('previewFrame' in animation) c.speed = animation.previewFrame;
    else c.speed = 0;

    const generator = animation.frames(c);
    generator.next();
    return generator.next().value;
}

export function getAnimationJSON() {
    return Object.entries(Animations).map(([name, animation]) => ({
        name,
        preview: getFramePreview(animation),
    }));
}
