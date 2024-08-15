<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  progress: {
    type: Number,
    required: true,
  },
});

const size = 100;
const strokeWidth = 10;
const center = size / 2;
const radius = center - strokeWidth;
const arcLength = 2 * Math.PI * radius;
const arcOffset = computed<number>(
  () => arcLength * ((100 - props.progress) / 100),
);
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${size} ${size}`"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    fill="none"
    class="player__progress"
  >
    <circle
      class="player__progress-track"
      :cy="center"
      :cx="center"
      :r="radius"
    />
    <circle
      class="player__progress-indicator"
      :cy="center"
      :cx="center"
      :r="radius"
      :stroke-dasharray="arcLength"
      :stroke-dashoffset="arcOffset"
    />
  </svg>
</template>
