import network
import socket
import time

WIFI_SSID = "…"
WIFI_PASS = "…"
UDP_PORT = 12345

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(WIFI_SSID, WIFI_PASS)

print("Connecting to Wi‑Fi...")
while not wlan.isconnected():
    time.sleep(0.5)
print("Connected! IP:", wlan.ifconfig()[0])

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(("0.0.0.0", UDP_PORT))
s.settimeout(None)
print("Listening on UDP port", UDP_PORT)

while True:
    # Awaits UPD message of 11 bytes
    data = s.recv(11)
    message = data.decode("utf-8")
    print("Received message: {}".format(message))
