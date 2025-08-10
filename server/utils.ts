export function map(
    n: number,
    start1: number,
    stop1: number,
    start2 = 0,
    stop2 = 1,
    bounds = true
) {
    const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    if (!bounds) return newval;
    return clamp(newval, start2, stop2);
}

export function clamp(n: number, min: number, max: number) {
    if (min > max) [min, max] = [max, min];
    return Math.max(min, Math.min(n, max));
}

export function powerConsumption(frame: Uint8ClampedArray, white = false) {
    const mA = {
        R: 7.98 / 255,
        G: 8.11 / 255,
        B: 7.98 / 255,
        W: 16.11 / 255,
    };
    let sum = 0;
    for (let i = 0; i < frame.length; i += white ? 4 : 3) {
        sum += frame[i + 0] * mA.R + frame[i + 1] * mA.G + frame[i + 2] * mA.B;
        if (white) sum += frame[i + 3] * mA.W;
    }
    return (sum * 5) / 1000; // W
}
