<script setup lang="ts">
import { ref } from 'vue';

const color = ref('#ff0000');

// Based on https://stackoverflow.com/a/69963510/12356941
const colors = [
    { r: 0xe4, g: 0x3f, b: 0x00 },
    { r: 0xfa, g: 0xe4, b: 0x10 },
    { r: 0x55, g: 0xcc, b: 0x3b },
    { r: 0x09, g: 0xad, b: 0xff },
    { r: 0x6b, g: 0x0e, b: 0xfd },
    { r: 0xe7, g: 0x0d, b: 0x86 },
    { r: 0xe4, g: 0x3f, b: 0x00 },
];

function onMouseMove(e: MouseEvent) {
    if (!(e.buttons & 1)) return;
    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();

    const x = (2 * (e.clientX - rect.left)) / (rect.right - rect.left) - 1;
    const y = 1 - (2 * (e.clientY - rect.top)) / (rect.bottom - rect.top);

    let a = ((Math.PI / 2 - Math.atan2(y, x)) / Math.PI) * 180;
    if (a < 0) a += 360;
    a = (a / 360) * (colors.length - 1);

    const a0 = Math.floor(a) % colors.length;
    const a1 = (a0 + 1) % colors.length;
    const c0 = colors[a0];
    const c1 = colors[a1];

    const a1w = a - Math.floor(a);
    const a0w = 1 - a1w;

    let clrR = c0.r * a0w + c1.r * a1w;
    let clrG = c0.g * a0w + c1.g * a1w;
    let clrB = c0.b * a0w + c1.b * a1w;

    let r = Math.sqrt(x * x + y * y);
    if (r > 1) r = 1;
    var cw = r < 0.8 ? r / 0.8 : 1;
    var ww = 1 - cw;
    clrR = Math.round(clrR * cw + 255 * ww);
    clrG = Math.round(clrG * cw + 255 * ww);
    clrB = Math.round(clrB * cw + 255 * ww);

    const hex =
        '#' +
        clrR.toString(16).padStart(2, '0') +
        clrG.toString(16).padStart(2, '0') +
        clrB.toString(16).padStart(2, '0');

    color.value = hex;
}
</script>

<template>
    <div id="wheel" @mousemove="onMouseMove" @click="onMouseMove" />
</template>

<style scoped>
#wheel {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background:
        radial-gradient(white, transparent 80%),
        conic-gradient(#e43f00, #fae410, #55cc3b, #09adff, #6b0efd, #e70d86, #e43f00);
    cursor: pointer;
}
</style>
