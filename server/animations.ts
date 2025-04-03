import noisejs from 'noisejs';

const LED_COUNT = 180;

const Animations = {
    *Fire() {
        const buffer = new Uint8ClampedArray(LED_COUNT * 3);
        const noise = new noisejs.Noise();

        while (true) {
            for (let i = 0; i < buffer.length; i += 3) {
                const n = noise.simplex2(i / 100, Date.now() / 3e4);
                buffer[i + 0] = n * (101 - 1) + 1; //G
                buffer[i + 1] = n * (254 - 161) + 161; //R
                buffer[i + 2] = n * 13; //B
            }
            yield buffer;
        }
    },

    *BlinkRed() {
        const buffer = new Uint8ClampedArray(LED_COUNT * 3);
        for (let i = 1; i < buffer.length; i += 3) buffer[i] = 255;
        yield buffer;
    },

    *ColorSwipe() {
        const buffer = new Uint8ClampedArray(LED_COUNT * 3);
        while (true) {
            const color = Math.random() * 256 ** 3;
            for (let i = 0; i < buffer.length; i += 3) {
                for (let j = 0; j < 3; j++) buffer[i + j] = (color >> (j * 8)) & 255;
                yield buffer;
            }
        }
    },
} satisfies Record<string, () => Generator<Uint8ClampedArray, void, never>>;

export default Animations;

export function animationExists(name: string): name is keyof typeof Animations {
    return Object.hasOwn(Animations, name);
}
