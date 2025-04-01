import dgram from "dgram";
import Animations from "./animations";

const LED_COUNT = 180;
const FRAME_RATE = 30;

const client = dgram.createSocket("udp4");

let brightness = 1 / 16;
let currentAnimation: keyof typeof Animations = 'Fire';
const generator = Animations[currentAnimation]();

while (true) {
  const frame = generator.next().value;
  if (!frame) break;

  for (let i = 0; i < frame.length; i++)
    frame[i] = (frame[i] ?? 0) * brightness;

  client.send(frame, 0, LED_COUNT * 3, 12345, "192.168.86.21");

  await Bun.sleep(1000 / FRAME_RATE);
};

client.close();