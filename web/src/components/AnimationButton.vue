<script setup lang="ts">
import {inject, type Ref} from "vue";

const { animation } = defineProps<{
    animation: { name: string; preview: string[] };
}>();

const showing = inject('showing') as Ref<string>;

const fetchApi = inject('fetchApi') as (route: string) => Promise<Response[]>;
const startAnimation = (name: string) => fetchApi('startAnimation/' + name).then(() => showing.value = name);
</script>

<template>
    <button
        id="animation-button"
        @click="startAnimation(animation.name)"
        :class="showing === animation.name ? 'active' : ''"
        :style="{
            '--preview-frame': `#${animation.preview.join(',#')}`,
        }"
    >
        {{ animation.name }}
    </button>
</template>

<style lang="scss">
@use '../colors.scss' as *;

#animation-button {
    appearance: none;
    border: 0;
    color: inherit;
    height: 50px;
    width: 300px;
    font: inherit;
    font-size: 1.2em;
    font-weight: 600;
    cursor: pointer;
    outline: inherit;
    border-radius: 8px;
    margin-block: 5px;
    background-size: 100% 150%;
    transition-timing-function: ease-in-out;
    transition:
        background-position 0.2s,
        font-weight 0.1s;
    background-image:
        linear-gradient(
            to top,
            #0000,
            cubic-bezier(0.13, 0.48, 0.48, 0.97),
            $clr-surface-a20
        ),
        linear-gradient(to right, var(--preview-frame));

    &.active {
        outline: 4px solid $clr-surface-tonal-a30;
    }

    &:hover,
    &:focus-visible,
    &.active {
        background-position-y: 25%;
        font-weight: 700;
    }

    &.active:hover,
    &.active:focus-visible,
    &:active {
        background-position-y: 50%;
        font-weight: 800;
    }
}
</style>
