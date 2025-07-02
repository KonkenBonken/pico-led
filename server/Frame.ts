import type { Controller } from './controller';

/** Contains RGB */
export class Frame extends Uint8ClampedArray {
    constructor(size: number) {
        super(size);
    }
}

export default function SizedFrame(c: Controller) {
    return () => new Frame(c.FRAME_SIZE);
}
