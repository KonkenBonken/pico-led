<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
    brightness: number;
}>();

const frame = ref(new Uint8Array(540));
const mounted = ref(true);
onUnmounted(() => (mounted.value = false));

const leds = ref<string[]>([]);
watch(frame, frame => {
    const pxls = [];
    for (let i = 0; i < 540; i++) frame[i] /= props.brightness / 256;
    for (let i = 0; i < 540; i += 3)
        pxls.push(
            frame[i + 1].toString(16).padStart(2, '0') +
                frame[i].toString(16).padStart(2, '0') +
                frame[i + 2].toString(16).padStart(2, '0'),
        );
    leds.value = pxls;
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
                frame.value = buffer ?? new Uint8Array(540);
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
        <div v-for="led of leds" :style="{ backgroundColor: '#' + led }" />
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
