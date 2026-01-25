/** Contains MicroFunction code */
export class MicroFunction {
    readonly code: string;

    constructor(code: string) {
        const minIndentation = Math.min(...code.split('\n').map(line => line.search(/\S/)).filter(i => i >= 0));
        code = code.replace(new RegExp(`(?<=\\n)[\\t ]{${minIndentation}}`, 'g'), '');
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
