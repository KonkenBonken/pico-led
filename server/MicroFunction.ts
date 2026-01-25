/** Contains MicroFunction code */
export class MicroFunction {
    readonly code: string;

    constructor(code: string) {
        this.code = code;
    }

    get buffer() {
        const codeBuffer = Buffer.from(this.code, 'utf-8');
        const flaggedBuffer = new Uint8ClampedArray(codeBuffer.length + 1);
        flaggedBuffer[0] = 1;
        flaggedBuffer.set(codeBuffer, 1);
        return flaggedBuffer;
    }
}
