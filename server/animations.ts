import noisejs from 'noisejs';
import convert from 'color-convert';
import { map } from './utils';
import { Controller } from './controller';
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

    Mello: {
        previewSize: 100,
        * frames(c) {
            const buffer = c.newFrame();

            const segmentSize = 10;
            const colors = [
                0x0693C6,
                0x7912B5,
                0xF6047D,
                0xE08700
            ];
            let colorIndex = 0;

            while (true) {
                for (let i = 0; i < buffer.length; i += 3 * segmentSize) {
                    colorIndex += Math.floor(Math.random() * (colors.length - 1)) + 1;
                    colorIndex %= colors.length;
                    const color = colors[colorIndex];


                    for (let j = 0; j < segmentSize; j++)
                        for (let k = 0; k < 3; k++)
                            buffer[i + j * 3 + k] = (color >> (k * 8)) & 255;
                }
                for (let f = 0; f < c.FRAME_RATE * 100 / c.speed; f++)
                    yield buffer;
            }
        }
    },

    ColorSwipe: {
        previewSize: 8,
        previewFrame: 17e4,
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
} satisfies Record<
    string,
    { previewFrame?: number; previewSize?: number; frames(c: Controller): Generator<Frame, void, never> }
>;

export default Animations;

export function animationExists(name: string): name is keyof typeof Animations {
    return Object.hasOwn(Animations, name);
}

export function getFramePreview(
    animation: (typeof Animations)[keyof typeof Animations]
) {
    const c = new Controller(('previewSize' in animation) ? animation.previewSize : 45);
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
