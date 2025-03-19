import machine
import neopixel
from time import sleep
from math import sin

from clr import clr,hsv

print('start')

LED_PIN = 16
NUM_LEDS = 180
FRAME_RATE = 300

np = neopixel.NeoPixel(machine.Pin(LED_PIN), NUM_LEDS)

#for i in range(NUM_LEDS):
    #np[i] = clr(0,abs(sin(i / 4))*200,0)
    #np[i] = clr(255, 0, 0)
#print(list(np))

sec = 0.0

while True:
    #for i in range(NUM_LEDS):
    #    np[i] = hsv(sec,1,.2)
    np.fill(hsv(sec,1,.2))
    print(np[0],sec)
    np.write()
    sec+=1/FRAME_RATE
    sleep(1)
