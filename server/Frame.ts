import type { Controller } from './controller';

/** Contains RGB */
export class Frame extends Uint8ClampedArray {
    constructor(size: number) {
        super(size);
    }

    copy() {
        const clone = new Frame(this.length);
        clone.set(this);
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
