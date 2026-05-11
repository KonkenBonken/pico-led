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

export function clr_interpolate(clr1: number, clr2: number, ratio: number) {
    const r1 = clr1 & 255;
    const r2 = clr2 & 255;
    const g1 = clr1 >> 8 & 255;
    const g2 = clr2 >> 8 & 255;
    const b1 = clr1 >> 16 & 255;
    const b2 = clr2 >> 16 & 255;

    return Math.round(map(ratio, 0, 1, r1, r2)) +
        Math.round(map(ratio, 0, 1, g1, g2) << 8) +
        Math.round(map(ratio, 0, 1, b1, b2) << 16);
}