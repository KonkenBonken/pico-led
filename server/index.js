import dgram from "dgram";

const LED_COUNT = 180;
const buffer = new Uint8ClampedArray(LED_COUNT * 3);

const client = dgram.createSocket("udp4");

setInterval(() => {
  for (let i = 0; i < buffer.length; i++) buffer[i] = Math.random() * 256;
  client.send(buffer, 0, LED_COUNT * 3, 12345, "192.168.86.21", (err) => {
    if (err) console.log(err);
  });
}, 1000);
