import dgram from "dgram";

const client = dgram.createSocket("udp4");
const msg = "Hello World";
client.send(msg, 0, msg.length, 12345, "192.168.86.21", function (err, bytes) {
  console.log(err, bytes);
  client.close();
});
