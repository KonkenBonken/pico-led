import dgram from "dgram";
import { Fire } from "./animations";

const LED_COUNT = 180;
const FRAME_RATE = 30;

const client = dgram.createSocket("udp4");

let brightness = 1 / 16;

const fire = Fire();

setInterval(() => {
  const buffer = fire.next().value;
  for (let i = 0; i < buffer.length; i++)
    buffer[i] = (buffer[i] ?? 0) * brightness;

  client.send(buffer, 0, LED_COUNT * 3, 12345, "192.168.86.21");
}, 1000 / FRAME_RATE);
