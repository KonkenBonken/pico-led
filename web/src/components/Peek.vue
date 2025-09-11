<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const frame = ref(new Uint8Array());
const mounted = ref(true);
onUnmounted(() => (mounted.value = false));

const leds = computed(() => {
    const leds = [];
    for (let i = 0; i < frame.value.length; i += 3)
        leds.push(
            frame.value[i].toString(16).padStart(2, '0') +
                frame.value[i + 1].toString(16).padStart(2, '0') +
                frame.value[i + 2].toString(16).padStart(2, '0'),
        );
    return leds;
});

onMounted(async () => {
    while (mounted.value) {
        const reader = await fetch('/api/frameStream')
            .then(res => res.body?.getReader())
            .catch(() => null);
        if (reader) {
            while (mounted.value) {
                const res = await reader.read().catch(() => null);
                if (!res) break;
                const buffer = res.value;
                if (!buffer) break;
                frame.value = buffer;
                if (res.done) break;
            }
            reader.cancel().catch(() => null);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
});
</script>

<template>
    <section>
        <div v-for="(led, i) of leds" :style="{ backgroundColor: '#' + led }" :key="i" />
    </section>
</template>

<style scoped>
section {
    position: fixed;
    display: flex;
    top: 0;
    right: 0;
    left: 0;
    height: 0.5em;

    > div {
        height: inherit;
        flex: 1;
    }
}
</style>
