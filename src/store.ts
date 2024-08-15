import { defineStore } from "pinia";
import { AuthInterface } from "@accentor/api-client-js/src/types/auth";

const SETTINGS_LOCAL_STORAGE_KEY = "settings";

interface StateInterface {
  auth: null | AuthInterface;
  codecConversionID: null | number;
}

interface StateActions {
  update: (partialState: Partial<StateInterface>) => void;
  sign_out: () => void;
}

export const useSettingsStore = defineStore<
  "settings",
  StateInterface,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {},
  StateActions
>("settings", {
  state: () => {
    const defaultState = {
      auth: null,
      codecConversionID: null,
    };
    const existingState = localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY);
    if (existingState) {
      try {
        const json = JSON.parse(atob(existingState));
        defaultState.auth = json.auth;
        defaultState.codecConversionID = json.codecConversionID;
      } catch {
        // We simply ignore error when parsing
      }
    }
    return defaultState;
  },
  actions: {
    update(partialState) {
      this.$patch(partialState);
      const state = btoa(JSON.stringify(this.$state));
      localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, state);
    },
    sign_out() {
      this.$patch({ auth: null });
      localStorage.clear();
      // Force reload to get rid of the current state
      window.location.reload();
    },
  },
});
