<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import Peek from './components/Peek.vue';
import ColorPicker from './components/ColorPicker.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons/faPersonRunning';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import AnimationButton from './components/AnimationButton.vue';

const renderPeek = ref(false);

const allStrips = ['ws2812', 'sk6812'];
const selectedStrips = ref(new Set(['ws2812']));

function toggleStrip(strip: string) {
    if (selectedStrips.value.has(strip))
        selectedStrips.value.delete(strip);
    else
        selectedStrips.value.add(strip);

    if (!selectedStrips.value.size) {
        selectedStrips.value = new Set(allStrips);
        selectedStrips.value.delete(strip);
    }
    updateStatus();
}

function fetchApi(route: string) {
    return Promise.all([...selectedStrips.value].sort().map(strip =>
        fetch(`/api/${strip}/${route}`)
    ));
}

provide('fetchApi', fetchApi);

const sliderBrightness = ref(158);
const brightness = computed({
    get() {
        const t = sliderBrightness.value / 1000;
        return Math.round(255 * t ** 1.5);
    },
    set(val) {
        const t = val / 255;
        sliderBrightness.value = 1000 * t ** (1 / 1.5);
    },
});

const showing = ref<string | number>('');
provide('showing', showing);

const supportsRGBW = ref(false);
watch(brightness, brightness => fetchApi('brightness/' + brightness));
const speed = ref(128);
watch(speed, speed => fetchApi('speed/' + speed));
const color = ref('ff00aa');
watch(color, color => {
    fetchApi('solidColor/' + color);
    showing.value = parseInt(color, 16);
});

const fadeInput = ref<number>(15);
const startFade = () => fetchApi('startFade/' + Math.round(fadeInput.value * 60e3));

const animations = ref<{ name: string; preview: string[] }[]>();
async function updateStatus() {
    const res = await fetchApi('status').then(res => res[0].json());
    brightness.value = res.brightness;
    speed.value = res.speed;
    animations.value = res.animations;
    showing.value = res.showing;

    if (typeof res.showing === 'number')
        color.value = res.showing.toString(16);
    supportsRGBW.value = res.supportsRGBW;
}
updateStatus();
setInterval(updateStatus, 60e3);

const turnOff = () => fetchApi('turnOff');
const warmWhite = () => fetchApi('solidColor/ff000000');
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
            <input type="range" :max="1000" v-model="sliderBrightness" />
        </div>
        <div>
            <FontAwesomeIcon :icon="faPersonRunning" />
            <input type="range" :min="0" :max="255" :step="1" v-model="speed" />
        </div>
        <FontAwesomeIcon @click="turnOff" :icon="faPowerOff" />
    </header>
    <ColorPicker v-model="color" :supportsRGBW="supportsRGBW" />
    <AnimationButton
        v-for="animation in animations"
        :animation="animation"
        :key="animation.name"
    />
    <button v-if="supportsRGBW" @click="warmWhite">Warm White</button>
    <input type="number" v-model.number="fadeInput" :min="0" />
    <button @click="startFade">Start fade</button>
    <footer>
        <input v-for="s in allStrips" type="checkbox" :key="s" :id="s"
               @change="toggleStrip(s)" :checked="selectedStrips.has(s)" />
    </footer>
</template>

<style lang="scss">
@use './colors.scss' as *;
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,100..900;1,62.5..100,100..900&display=swap');

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
    color: $clr-primary-a60;
    font-family: 'Noto Sans', sans-serif;
    font-optical-sizing: auto;
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
    color: $clr-primary-a40;
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

footer {
    height: 50px;
    width: 100vw;
    display: flex;
    justify-content: space-around;
    position: fixed;
    bottom: 2vh;
    left: 0;

    > input {
        all: unset;
        width: min(200px, 40vw);
        height: 50px;
        display: inline-block;
        position: relative;
        background-color: $clr-surface-a20;
        border-radius: 8px;

        &::before {
            position: absolute;
            inset: 0;
            display: grid;
            place-content: center;
            font-size: 20px;
            font-weight: 500;
            letter-spacing: .1ch;
            transition: background-color 0.1s, font-weight 0.1s;
        }

        &:checked {
            background-image: linear-gradient(to top, rgba($clr-primary-a0, .5), #0000);

            &::before {
                font-weight: 800;
            }
        }
    }

    > #ws2812::before {
        content: 'WS2812B';
    }

    > #sk6812::before {
        content: 'SK6812';
    }
}
</style>
