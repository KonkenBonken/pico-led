<script setup lang="ts">
import {computed, inject, type Ref, ref} from 'vue';

defineProps<{ supportsRGBW: boolean; }>();

const showing = inject('showing') as Ref<string | number>;
const renderHandles = computed(() => typeof showing.value === 'number');

const color = defineModel<string>();
const pickerPos = ref<[number, number]>([0, 0]);

function rgbToHex(w: number, r: number, g: number, b: number) {
    return '#' +
        w.toString(16).padStart(2, '0') +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');

}

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

function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    onColorPress({
        clientX: touch.clientX, clientY: touch.clientY,
        currentTarget: e.currentTarget
    });
}

function onMouseMove(e: MouseEvent | PointerEvent) {
    if (e.buttons & 1)
        onColorPress(e);
}

function onColorPress(e: { clientX: number, clientY: number, currentTarget: EventTarget | null }) {
    if (!e.currentTarget) return;

    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();

    pickerPos.value = [e.clientX - rect.left, e.clientY - rect.top];

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
    const cw = r < 0.8 ? r / 0.8 : 1;
    const ww = 1 - cw;
    clrR = Math.round(clrR * cw + 255 * ww);
    clrG = Math.round(clrG * cw + 255 * ww);
    clrB = Math.round(clrB * cw + 255 * ww);

    color.value = rgbToHex(0, clrR, clrG, clrB);
}

const colorNum = computed(() => parseInt((color.value ?? '0').slice(1), 16));
const red = computed({
    get: () => (colorNum.value >> 16) & 0xff,
    set: val => color.value = rgbToHex(white.value, val, green.value, blue.value),
});
const green = computed({
    get: () => (colorNum.value >> 8) & 0xff,
    set: val => color.value = rgbToHex(white.value, red.value, val, blue.value),
});
const blue = computed({
    get: () => (colorNum.value >> 0) & 0xff,
    set: val => color.value = rgbToHex(white.value, red.value, green.value, val),
});
const white = computed({
    get: () => (colorNum.value >> 24) & 0xff,
    set: val => color.value = rgbToHex(val, red.value, green.value, blue.value),
});

</script>

<template>
    <div id="wheel" @mousemove="onMouseMove" @mousedown="onMouseMove"
         @touchstart="onTouchMove" @touchmove="onTouchMove">
        <div
            :style="{
                left: pickerPos[0] + 'px',
                top: pickerPos[1] + 'px',
                backgroundColor: '#' + (color ?? '').slice(3) + 'aa',
            }"
        />
    </div>
    <input type="range" class="clr-slider" id="slider-red" :min="0" :max="255" :step="1" v-model.number="red"
           :class="renderHandles ? 'render-handles' : ''" />
    <input type="range" class="clr-slider" id="slider-green" :min="0" :max="255" :step="1" v-model.number="green" />
    <input type="range" class="clr-slider" id="slider-blue" :min="0" :max="255" :step="1" v-model.number="blue" />
    <input type="range" class="clr-slider" id="slider-white" :min="0" :max="255" :step="1" v-model.number="white"
           v-if="supportsRGBW" />
</template>

<style lang="scss">
@use '../colors.scss' as *;

#wheel {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background:
        radial-gradient(white, transparent 80%),
        conic-gradient(#e43f00, #fae410, #55cc3b, #09adff, #6b0efd, #e70d86, #e43f00);
    cursor: pointer;

    :has(.clr-slider:active) & {
        background:
            radial-gradient(transparent, cubic-bezier(0.39, 0, 0.58, 1.01), $clr-surface-a0),
            rgb(calc(1 * v-bind(red)), calc(1 * v-bind(green)), calc(1 * v-bind(blue)));
    }

    > div {
        position: relative;
        width: 24px;
        height: 24px;
        border: 2px solid white;
        border-radius: 50%;
        translate: -50% -50%;
        transition: opacity 0.5s 1s ease-out;
        pointer-events: none;
        opacity: 0;
    }

    &:active > div {
        opacity: 1;
        transition: none;
    }
}

.clr-slider {
    margin-bottom: .5lh;
    box-sizing: border-box;

    &::-webkit-slider-thumb {
        opacity: 0;
        border: 1px solid white;
        transition: opacity 1s ease 2s;
    }
}

:has(.clr-slider:active, .render-handles) > .clr-slider {
    border: 1px solid #fff3;

    &::-webkit-slider-thumb {
        transition-delay: 0s;
        transition-duration: .2s;
        opacity: 1;
    }
}

#slider-red {
    margin-top: .5lh;
    background: linear-gradient(to right, $clr-surface-a0, rgb(255, 0, 0));

    &::-webkit-slider-thumb, :has(.clr-slider:active) > & {
        background: color-mix(in hsl, rgb(255, 0, 0) calc(100% / 255 * v-bind(red)), $clr-surface-a0);
    }
}

#slider-green {
    background: linear-gradient(to right, $clr-surface-a0, rgb(0, 220, 0));

    &::-webkit-slider-thumb, :has(.clr-slider:active) > & {
        background: color-mix(in hsl, rgb(0, 220, 0) calc(100% / 255 * v-bind(green)), $clr-surface-a0);
    }
}

#slider-blue {
    background: linear-gradient(to right, $clr-surface-a0, rgb(40, 40, 255));

    &::-webkit-slider-thumb, :has(.clr-slider:active) > & {
        background: color-mix(in hsl, rgb(40, 40, 255) calc(100% / 255 * v-bind(blue)), $clr-surface-a0);
    }
}

#slider-white {
    background: linear-gradient(to right, $clr-surface-a0, rgb(255, 235, 205));

    &::-webkit-slider-thumb, :has(.clr-slider:active) > & {
        background: color-mix(in hsl, rgb(255, 235, 205) calc(100% / 255 * v-bind(white)), $clr-surface-a0);
    }
}
</style>
