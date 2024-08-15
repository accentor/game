<script setup lang="ts">
import { reactive, watch } from "vue";
import { QrcodeStream, setZXingModuleOverrides } from "vue-qrcode-reader";
import type { DetectedBarcode } from "barcode-detector/pure";
import { PlayIcon } from "@heroicons/vue/24/solid";
import zxingWasmLib from "zxing-wasm/reader/zxing_reader.wasm?url";

type IdentifiedCode = {
  left: number;
  top: number;
  size: number;
  trackID: number;
};

setZXingModuleOverrides({
  locateFile: (path, prefix) => {
    if (path.endsWith(".wasm")) return zxingWasmLib;
    return prefix + path;
  },
});

const emit = defineEmits(["trackSelected"]);
const identifiedCodes = reactive<Record<number, IdentifiedCode>>({});
const timeouts: number[] = [];

function identifyCode(code: DetectedBarcode): IdentifiedCode | null {
  try {
    const decoded = JSON.parse(atob(code.rawValue));
    if (Object.keys(decoded).includes("__accentor_game")) {
      const trackID = +decoded["__accentor_game"];
      const { left, right, top, bottom, width, height } = code.boundingBox;
      const size = width > height ? width : height;
      return {
        size,
        trackID,
        left: left + (right - left) / 2,
        top: top + (bottom - top) / 2,
      };
    }
  } catch {
    // If any error occurs while decoding and parsing, we don't have the right QR-code
    // We simply ignore this and move on.
  }
  return null;
}

function updateCodes(detectedCodes: DetectedBarcode[]) {
  detectedCodes.forEach((code, index) => {
    const identified = identifyCode(code);
    if (identified) {
      identifiedCodes[index] = identified;
    } else {
      delete identifiedCodes[index];
    }
  });
}

watch(identifiedCodes, () => {
  while (timeouts.length) {
    clearTimeout(timeouts.shift());
  }
  timeouts.push(setTimeout(resetCodes, 250));
});

function resetCodes() {
  for (const key in identifiedCodes) {
    delete identifiedCodes[key];
  }
}
</script>

<template>
  <div class="scanner">
    <qrcode-stream :track="updateCodes"></qrcode-stream>
    <span
      v-for="code in identifiedCodes"
      :key="code.trackID"
      class="scanner__play"
      :style="{
        top: `${code?.top}px`,
        left: `${code?.left}px`,
        width: `${code?.size}px`,
        height: `${code?.size}px`,
      }"
    >
      <button
        v-if="code"
        class="scanner__play-button"
        :data-id="code.trackID"
        @click="(e) => $emit('trackSelected', e, code.trackID)"
      >
        <PlayIcon />
      </button>
    </span>
  </div>
</template>
