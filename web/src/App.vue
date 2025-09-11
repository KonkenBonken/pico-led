<script setup lang="ts">
import { ref, watch } from 'vue';
import Peek from './components/Peek.vue';
import ColorPicker from './components/ColorPicker.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons/faPersonRunning';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';

const renderPeek = ref(false);

const supportsRGBW = ref(false);
const brightness = ref(16);
watch(brightness, brightness => fetch('/api/brightness/' + brightness));
const speed = ref(128);
watch(speed, speed => fetch('/api/speed/' + speed));
const color = ref('#ff00aa');
watch(color, color => fetch('/api/solidColor/' + color.slice(1)));

const fadeInput = ref<number>(15);
const startFade = () => fetch('api/startFade/' + Math.round(fadeInput.value * 60e3));

const animations = ref<string[]>();
async function updateStatus() {
    const res = await fetch('api/status').then(res => res.json());
    brightness.value = res.brightness;
    speed.value = res.speed;
    animations.value = res.animations;
    supportsRGBW.value = res.supportsRGBW;
}
updateStatus();
setInterval(updateStatus, 60e3);

const startAnimation = (name: string) => fetch('api/startAnimation/' + name);
const turnOff = () => fetch('api/turnOff');
const warmWhite = () => fetch('/api/solidColor/ff000000');
</script>

<template>
    <header>
        <Peek v-if="renderPeek" />
        <FontAwesomeIcon
            @click="renderPeek = !renderPeek"
            :icon="renderPeek ? faEyeSlash : faEye"
        />
        <div>
            <FontAwesomeIcon :icon="faSun" />
            <input type="range" :min="0" :max="255" :step="1" v-model="brightness" />
        </div>
        <div>
            <FontAwesomeIcon :icon="faPersonRunning" />
            <input type="range" :min="0" :max="255" :step="1" v-model="speed" />
        </div>
        <FontAwesomeIcon @click="turnOff" :icon="faPowerOff" />
    </header>
    <ColorPicker />
    <button v-for="name in animations" @click="startAnimation(name)" :key="name">
        {{ name }}
    </button>
    <button v-if="supportsRGBW" @click="warmWhite">Warm White</button>
    <input type="color" v-model="color" />
    <input type="number" v-model.number="fadeInput" :min="0" />
    <button @click="startFade">Start fade</button>
</template>

<style lang="scss">
@import './colors.scss';

:root,
body,
#app {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: linear-gradient(to top, $clr-surface-tonal-a10, $clr-surface-a0);
    overflow: hidden;
}

#app {
    padding-top: 85px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

header {
    background-color: $clr-surface-a10;
    position: fixed;
    top: 0;
    height: 60px;
    width: 100vw;

    display: grid;
    grid-template-columns: 1fr 225px 1fr;
    grid-template-rows: 12px 1fr 1fr 8px;
    place-items: center;

    > #peek {
        grid-area: 1 / 1 / 2 / 4;
    }
    > .fa-eye,
    > .fa-eye-slash {
        grid-area: 2 / 1 / 4 / 2;
    }
    > .fa-power-off {
        grid-area: 2 / 3 / 4 / 4;
    }
    > div:first-of-type {
        grid-area: 2 / 2 / 3 / 3;
    }
    > div:last-of-type {
        grid-area: 3 / 2 / 4 / 3;
    }
    > div {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 15px;
    }
    > svg {
        font-size: 1.2em;
    }
}

svg {
    color: $clr-primary-a50;
}

input[type='range'] {
    -webkit-appearance: none;
    width: 200px;
    height: 8px;
    border-radius: 4px;
    background: $clr-surface-a20;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: $clr-primary-a50;
        cursor: pointer;
    }

    &::-moz-range-thumb {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: $clr-primary-a50;
        cursor: pointer;
    }
}
</style>
