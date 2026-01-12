<script setup lang="ts">
import { ref } from "vue";
import AudioPlayer from "../components/AudioPlayer.vue";
import SettingsPanel from "../components/SettingsPanel.vue";
import CodeScanner from "../components/CodeScanner.vue";
const currentNumber = ref<number | null>(null);
const trackMap: Map<number, number> = new Map();

import.meta.env.VITE_TRACK_MAP?.split(";").forEach((item: string) => {
  const [prev_id, new_id] = item.split(":");
  trackMap.set(+prev_id, +new_id);
});

function setCurrentNumber(_event: Event, trackID: number) {
  currentNumber.value = trackMap.get(trackID) || trackID;
}
</script>

<template>
  <header class="page__header">
    <SettingsPanel />
  </header>
  <main class="page__contents">
    <CodeScanner
      v-if="currentNumber === null"
      @track-selected="setCurrentNumber"
    ></CodeScanner>
    <AudioPlayer
      v-if="currentNumber !== null"
      :track-id="currentNumber"
      @go-to-next="currentNumber = null"
    />
  </main>
  <footer class="page__footer"></footer>
</template>
