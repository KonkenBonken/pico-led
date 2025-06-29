export function rgbToGrb(frame: Uint8ClampedArray) {
    for (let i = 0; i < frame.length; i += 3)
        [frame[i], frame[i + 1]] = [frame[i + 1], frame[i]];
}

export function scale(buffer: Uint8ClampedArray, factor: number) {
    for (let i = 0; i < buffer.length; i++) buffer[i] *= factor;
}

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
