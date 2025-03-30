import dgram from "dgram";
import { Fire } from "./animations.js";

const LED_COUNT = 180;
const FRAME_RATE = 30;
const buffer = new Uint8ClampedArray(LED_COUNT * 3);

const client = dgram.createSocket("udp4");

const fire = Fire();

setInterval(() => {
  const buffer = fire.next().value;
  client.send(buffer, 0, LED_COUNT * 3, 12345, "192.168.86.21");
}, 1000 / FRAME_RATE);
