<script setup lang="ts">
import { ref } from "vue";
import Player from '../components/Player.vue';
import Settings from '../components/Settings.vue';
import Scanner from '../components/Scanner.vue';
const currentNumber = ref<number | null>(null);

function setCurrentNumber(_event: Event, trackID: number) {
  currentNumber.value = trackID;
}
</script>

<template>
  <header class="page__header">
    <Settings></Settings>
  </header>
  <main class="page__contents">
    <Scanner v-if="currentNumber === null" @track-selected="setCurrentNumber"></Scanner>
    <Player v-if="currentNumber !== null" :track-id="currentNumber" @go-to-next="currentNumber = null" />
  </main>
  <footer class="page__footer"></footer>
</template>

