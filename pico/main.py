from controller import init
from clr import clr, hsv

print("main")


def draw(np, ms):
    np.fill(hsv(ms / 3000, 1, 0.5))


init(draw)
