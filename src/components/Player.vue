<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import api, { baseURL } from '../api';
import { Track } from '@accentor/api-client-js/src/types/track';
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline';
import Progress from "./Progress.vue";
import { ArrowRightIcon } from '@heroicons/vue/24/outline';
import { useSettingsStore } from '../store';

enum ErrorState {
  None,
  TrackMissing = "Track could not be found. Scan the next card",
  Unknown = "Something unexpected went wrong."
}

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
const errorState = ref(ErrorState.None);

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
  try {
    const info = await api.tracks.read(settingsStore.auth!, props.trackId);
    if (info.length === null || info.length === 0) {
      errorState.value = ErrorState.TrackMissing;
      return
    }

    trackInfo.value = info;
  } catch (error) {
    if (error && typeof error === "object" && error.hasOwnProperty("not_found")) {
      errorState.value = ErrorState.TrackMissing;
      return
    }
  }
});

onUnmounted(() => {
  clearInterval(interval);
})

const classObject = computed(() => ({
  "player--loading": trackInfo.value !== null,
  "player--error": errorState.value !== ErrorState.None,
}))

</script>

<template>
  <audio :src="audioURL" class="" ref="audioElement"></audio>
  <div class="player" :class="classObject">
    <Progress :progress="progress"></Progress>
    <button @click="playing = !playing" class="player__button" :data-playing="playing" :disabled="trackInfo === null">
      <PauseIcon v-if="playing" />
      <PlayIcon v-else />
    </button>
    <p class="player__error" v-if="errorState !== ErrorState.None">
      {{  errorState }}
    </p>
  </div>
  <button class="button button--next" @click="$emit('goToNext')">
    Next <ArrowRightIcon class="button__icon" />
  </button>
</template>

