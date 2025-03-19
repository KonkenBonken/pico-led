from time import ticks_ms
from machine import Pin
from neopixel import NeoPixel

LED_PIN = 16
NUM_LEDS = 180

np = NeoPixel(Pin(LED_PIN), NUM_LEDS)


def init(draw):
    print("controller init")
    while True:
        draw(np, ticks_ms())
        np.write()
