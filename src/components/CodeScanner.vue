<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { QrcodeStream, setZXingModuleOverrides } from "vue-qrcode-reader";
import type { DetectedBarcode } from "barcode-detector/pure";
import { PlayIcon } from "@heroicons/vue/24/solid";
import zxingWasmLib from "zxing-wasm/reader/zxing_reader.wasm?url";
import { useI18n } from "vue-i18n";
import { VideoCameraIcon } from "@heroicons/vue/24/outline";
const { t } = useI18n();

type IdentifiedCode = {
  left: number;
  top: number;
  size: number;
  trackID: number;
};

type deviceConstraints = {
  deviceId?: string;
  facingMode?: string;
};

setZXingModuleOverrides({
  locateFile: (path, prefix) => {
    if (path.endsWith(".wasm")) return zxingWasmLib;
    return prefix + path;
  },
});

const emit = defineEmits(["trackSelected"]);
const identifiedCodes = reactive<Record<number, IdentifiedCode>>({});
const errorMessage = ref<string | null>(null);
const scannerInitialized = ref<boolean>(false);
const selectedConstraints = ref<deviceConstraints>({
  facingMode: "environment",
});
const constraintOptions = ref<
  Array<{
    label: string;
    constraints: deviceConstraints;
  }>
>([]);
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
  timeouts.push(window.setTimeout(resetCodes, 250));
});

function resetCodes() {
  for (const key in identifiedCodes) {
    delete identifiedCodes[key];
  }
}

function handleError(error: Error) {
  const handledErrors = [
    "NotAllowedError",
    "NotFoundError",
    "NotSupportedError",
    "NotReadableError",
    "OverconstrainedError",
    "StreamApiNotSupportedError",
  ];
  errorMessage.value = handledErrors.includes(error.name)
    ? error.name
    : "unknown";
}

async function onReady() {
  scannerInitialized.value = true;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(({ kind }) => kind === "videoinput");

  constraintOptions.value = [
    ...videoDevices.map(({ deviceId, label }) => ({
      label,
      constraints: { deviceId },
    })),
  ];
}

function selectNextDevice() {
  const currentIndex = constraintOptions.value.findIndex(
    (c) => c.constraints === selectedConstraints.value,
  );
  const next =
    constraintOptions.value[
      (currentIndex + 1) % constraintOptions.value.length
    ];
  selectedConstraints.value = next.constraints || {
    facingMode: "environment",
  };
}
</script>

<template>
  <div class="scanner" :class="{ 'scanner--loading': !scannerInitialized }">
    <div v-if="errorMessage" class="scanner__error error">
      {{ t(`scanner.errors.${errorMessage}`) }}
    </div>
    <qrcode-stream
      :track="updateCodes"
      :constraints="selectedConstraints"
      @error="handleError"
      @camera-on="onReady"
      @camera-off="scannerInitialized = false"
    ></qrcode-stream>
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
    <button
      v-if="constraintOptions.length > 1"
      class="scanner__camera-switch"
      @click="selectNextDevice"
    >
      <VideoCameraIcon />
    </button>
  </div>
</template>
