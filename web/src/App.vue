<script setup lang="ts">
import { ref, watch } from 'vue';

const brightness = ref(16);
watch(brightness, brightness => fetch('/api/brightness/' + brightness));
const speed = ref(128);
watch(speed, speed => fetch('/api/speed/' + speed));
const color = ref();
watch(color, color => fetch('/api/solidColor/' + color.slice(1)));

const animations = ref<string[]>();
fetch('api/animations')
    .then(res => res.json())
    .then(names => (animations.value = names));

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
</script>

<template>
    <h1>Led</h1>
    <input type="range" :min="0" :max="255" :step="1" v-model="brightness" />
    <input type="range" :min="0" :max="255" :step="1" v-model="speed" />
    <button v-for="name in animations" @click="startAnimation(name)">{{ name }}</button>
    <button @click="turnOff">Turn off</button>
    <input type="color" v-model="color" />
</template>

<style scoped>
h1 {
    color: darkblue;
}
</style>
