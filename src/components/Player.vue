<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import api, { baseURL } from '../api';
import { Track } from '@accentor/api-client-js/src/types/track';
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline';
import Progress from "./Progress.vue";
import { ArrowRightIcon } from '@heroicons/vue/24/outline';
import { useSettingsStore } from '../store';

const emit = defineEmits(['goToNext']);
const settingsStore = useSettingsStore();
const props = defineProps({
  trackId: {
    type: Number,
    required: true,
  },
})
const playing = ref(false);
const trackInfo = ref<Track | null>(null);
const audioURL = computed(() => `${baseURL}/tracks/${props.trackId}/audio?secret=${settingsStore.auth?.secret}&device_id=${settingsStore.auth?.device_id}&codec_conversion_id=${settingsStore.codecConversionID || ""}`);
const progress = ref<number>(100);

function checkTime() {
  if (audioElement.value === null || trackInfo.value === null) {
    progress.value = 100;
    return;
  }
  const time = audioElement.value!.currentTime;
  const length = trackInfo.value!.length!;
  
  progress.value = (time / length * 100);
}

// Every 16ms is ±60fps
const interval = setInterval(checkTime, 16);

const audioElement = ref<HTMLAudioElement | null>(null);

watch(trackInfo, async (newValue) => {
  // Only start playing once we know how long the track is
  if (newValue) playing.value = true;
})

watch(playing, async (newValue) => {
  if (audioElement.value === null) return;
  try {
    await (newValue ? audioElement.value.play() : audioElement.value.pause());
  } catch (error) {
    playing.value = false;
  }
});

onMounted(async () => {
  trackInfo.value = await api.tracks.read(settingsStore.auth!, props.trackId);
})

onUnmounted(() => {
  clearInterval(interval);
})

</script>

<template>
  <audio :src="audioURL" class="" ref="audioElement"></audio>
  <div class="player">
    <Progress :progress="progress"></Progress>
    <button @click="playing = !playing" class="player__button" :data-playing="playing">
      <PauseIcon v-if="playing" />
      <PlayIcon v-else />
    </button>
  </div>
  <button class="button button--next" @click="$emit('goToNext')">
    Next <ArrowRightIcon class="button__icon" />
  </button>
</template>

