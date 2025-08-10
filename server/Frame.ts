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

    offset(offset: number) {
        const clone = new Frame(this.length + offset);
        clone.set(this, offset);
        return clone;
    }

    toGrbw() {
        const clone = new Frame((this.length / 3) * 4);
        let j = 0;
        for (let i = 0; i < this.length; i += 3, j++)
            [clone[i + 0 + j], clone[i + 1 + j], clone[i + 2 + j], clone[i + 3 + j]] = [
                this[i + 1],
                this[i + 0],
                this[i + 2],
                0,
            ];
        return clone;
    }

    toGrb() {
        for (let i = 0; i < this.length; i += 3)
            [this[i], this[i + 1]] = [this[i + 1], this[i]];
    }

    scale(factor: number) {
        for (let i = 0; i < this.length; i++) this[i] *= factor;
    }
}

export default function SizedFrame(c: Controller) {
    return () => new Frame(c.FRAME_SIZE);
}
