<script setup lang="ts">
import { ref, watch } from 'vue';

const brightness = ref(16);
watch(brightness, brightness => fetch('/api/brightness/' + brightness));
</script>

<template>
    <h1>Led</h1>
    <input type="range" :min="0" :max="255" :step="1" v-model="brightness" />
</template>

<style scoped>
h1 {
    color: darkblue;
}
</style>
