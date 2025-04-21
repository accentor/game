<script setup lang="ts">
import { CodecConversion } from "@accentor/api-client-js";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { onMounted, onUnmounted, ref } from "vue";
import api from "../api";
import { useSettingsStore } from "../store";
const codecOptions = ref<CodecConversion[]>([]);
const settingsStore = useSettingsStore();
const detailsElement = ref<HTMLDetailsElement | null>(null);

function handleFocus(event: FocusEvent) {
  if (
    detailsElement.value &&
    !detailsElement.value.contains(event.target as HTMLElement)
  )
    detailsElement.value.open = false;
}

function handleClick(event: MouseEvent) {
  if (
    detailsElement.value &&
    !detailsElement.value.contains(event.target as HTMLElement)
  )
    detailsElement.value.open = false;
}

onMounted(async () => {
  const generator = api.codec_conversions.index(settingsStore.auth!);
  while (true) {
    const result = await generator.next();
    codecOptions.value.push(...result.value);
    if (result.done) break;
  }
  window.addEventListener("focusin", handleFocus);
  window.addEventListener("click", handleClick);
});

onUnmounted(() => {
  window.removeEventListener("focusin", handleFocus);
  window.removeEventListener("click", handleClick);
});

function handleChange(event: Event) {
  settingsStore.update({
    codecConversionID: +(event.target as HTMLSelectElement).value,
  });
}
</script>

<template>
  <details ref="detailsElement" class="settings">
    <summary class="settings__trigger">
      <Cog6ToothIcon />
    </summary>

    <div class="settings__content form">
      <div class="form__input">
        <label for="codecConversion" class="form__label">Selected codec</label>
        <select
          id="codecConversion"
          name="settings[codec_conversion_id]"
          class="form__field form__field--select"
          @change="handleChange"
        >
          <option value="">None</option>
          <option
            v-for="option in codecOptions"
            :key="option.id"
            :value="option.id"
            class=""
          >
            {{ option.name }}
          </option>
        </select>
      </div>
      <button
        class="button form__submit button--sign-out"
        @click="settingsStore.sign_out"
      >
        Sign out
      </button>
    </div>
  </details>
</template>
