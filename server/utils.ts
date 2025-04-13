export function rgbToGrb(frame: Uint8ClampedArray): Uint8ClampedArray {
    for (let i = 0; i < frame.length; i += 3)
        // @ts-expect-error
        [frame[i], frame[i + 1]] = [frame[i + 1], frame[i]];
    return frame;
}
