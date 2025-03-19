def clr(r,g,b):
    r = int(max(0, min(r, 255)))
    g = int(max(0, min(g, 255)))
    b = int(max(0, min(b, 255)))
    return (r,g,b)


def hsv(h:float, s:float, v:float):
    if s:
        h %= 1
        if h == 1.0: h = 0.0
        i = int(h*6.0); f = h*6.0 - i

        w = int(255*( v * (1.0 - s) ))
        q = int(255*( v * (1.0 - s * f) ))
        t = int(255*( v * (1.0 - s * (1.0 - f)) ))
        v = int(255*v)
        
        if i==0: return (v, t, w)
        if i==1: return (q, v, w)
        if i==2: return (w, v, t)
        if i==3: return (w, q, v)
        if i==4: return (t, w, v)
        if i==5: return (v, w, q)
        print(i)
    else: v = int(255*v); return (v, v, v)