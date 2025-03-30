import noisejs from "noisejs";

const LED_COUNT = 180;

export function* Fire() {
  const buffer = new Uint8ClampedArray(LED_COUNT * 3);
  const noise = new noisejs.Noise(Math.random());
  let frame = 0;

  while (true) {
    for (let i = 0; i < buffer.length; i += 3) {
      const n = noise.simplex2(i/ 100, ++frame / 100000);
      buffer[i + 0] = n * (101 - 1) + 1; //G
      buffer[i + 1] = n * (254 - 161) + 161; //R
      buffer[i + 2] = n * 13; //B
    }
    yield buffer;
  }
}
