import type { Controller } from './controller';

/** Contains RGB */
export class Frame extends Uint8ClampedArray {
    static fromBuffer(buffer: ArrayBuffer) {
        const frame = new Frame(buffer.byteLength);
        frame.set(new Uint8ClampedArray(buffer));
        return frame;
    }

    constructor(size: number) {
        super(size);
    }

    copy() {
        const clone = new Frame(this.length);
        clone.set(this);
        return clone;
    }

    toGrbw() {
        // RGBW(150, 66, 6, 0) ≡ RGBW(0, 0, 0, 64)
        const Rw = 2.34375;
        const Gw = 1.03125;
        const Bw = 0.09375;

        const clone = new Uint8ClampedArray((this.length / 3) * 4);
        let j = 0;
        for (let i = 0; i < this.length; i += 3, j++) {
            let W = Math.min(this[i + 0] / Rw, this[i + 1] / Gw, this[i + 2] / Bw);
            W = Math.max(0, W);

            [clone[i + 0 + j], clone[i + 1 + j], clone[i + 2 + j], clone[i + 3 + j]] = [
                this[i + 1] - W * Gw,
                this[i + 0] - W * Rw,
                this[i + 2] - W * Bw,
                W,
            ];
        }
        return clone;
    }

    toGrb() {
        const clone = new Uint8ClampedArray(this.length);
        for (let i = 0; i < clone.length; i += 3)
            [clone[i], clone[i + 1], clone[i + 2]] = [this[i + 1], this[i], this[i + 2]];
        return clone;
    }

    scale(factor: number) {
        for (let i = 0; i < this.length; i++) this[i] *= factor;
    }
}

export default function SizedFrame(c: Controller) {
    return () => new Frame(c.FRAME_SIZE);
}
