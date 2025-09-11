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

while True:
    # Awaits UPD message
    data = s.recv(NUM_LEDS * 3)
    np.buf = bytearray(data)
    np.write()
