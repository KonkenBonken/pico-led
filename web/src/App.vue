<script setup lang="ts">
import { ref, watch } from 'vue';
import Peek from './components/Peek.vue';

const renderPeek = ref(false);

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
}
updateStatus();
setInterval(updateStatus, 60e3);

const startAnimation = (name: string) => fetch('api/startAnimation/' + name);
const turnOff = () => fetch('api/turnOff');
const warmWhite = () => fetch('/api/solidColor/ff000000');
</script>

<template>
    <h1>Led</h1>
    <Peek v-if="renderPeek" />
    <input type="range" :min="0" :max="255" :step="1" v-model="brightness" />
    <input type="range" :min="0" :max="255" :step="1" v-model="speed" />
    <button v-for="name in animations" @click="startAnimation(name)" :key="name">
        {{ name }}
    </button>
    <button @click="warmWhite">Warm White</button>
    <button @click="turnOff">Turn off</button>
    <button @click="renderPeek = !renderPeek">Peek</button>
    <input type="color" v-model="color" />
    <input type="number" v-model.number="fadeInput" :min="0" />
    <button @click="startFade">Start fade</button>
</template>

<style scoped>
h1 {
    color: darkblue;
}
</style>
