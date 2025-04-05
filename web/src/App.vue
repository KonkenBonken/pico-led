<script setup lang="ts">
import { ref, watch } from 'vue';

const brightness = ref(16);
watch(brightness, brightness => fetch('/api/brightness/' + brightness));
const speed = ref(128);
watch(speed, speed => fetch('/api/speed/' + speed));

const animations = ref<string[]>();
fetch('api/animations')
    .then(res => res.json())
    .then(names => (animations.value = names));

const startAnimation = (name: string) => fetch('api/startAnimation/' + name);
const turnOff = () => fetch('api/turnOff');
</script>

<template>
    <h1>Led</h1>
    <input type="range" :min="0" :max="255" :step="1" v-model="brightness" />
    <input type="range" :min="0" :max="255" :step="1" v-model="speed" />
    <button v-for="name in animations" @click="startAnimation(name)">{{ name }}</button>
    <button @click="turnOff">Turn off</button>
</template>

<style scoped>
h1 {
    color: darkblue;
}
</style>
