import network
import socket
from time import sleep
from machine import Pin
from neopixel import NeoPixel


WIFI_SSID = "…"
WIFI_PASS = "…"
UDP_PORT = 12345
LED_PIN = 28
NUM_LEDS = 180

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(WIFI_SSID, WIFI_PASS)

print("Connecting to Wi‑Fi...")
while not wlan.isconnected():
    sleep(0.5)
print("Connected! IP:", wlan.ifconfig()[0])

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(("0.0.0.0", UDP_PORT))
s.settimeout(None)
print("Listening on UDP port", UDP_PORT)

np = NeoPixel(Pin(LED_PIN), NUM_LEDS)

framegen = None

while True:
    try:
        raw = s.recv(1500)
        flag, data = raw[0], raw[1:]

        if flag == 0:
            np.buf = bytearray(data)
            np.write()
            framegen = None
            s.settimeout(None)

        elif flag == 1:
            ns = dict()
            try:
                exec(data, ns)
            except Exception:
                continue
            framegen = ns["f"]()
            s.settimeout(0.01)

    except TimeoutError:
        if framegen:
            try:
                np.buf = bytearray(next(framegen))
                np.write()
            except (Exception, StopIteration):
                framegen = None
                s.settimeout(None)
                continue
