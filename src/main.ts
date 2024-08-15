import { createMemoryHistory, createRouter } from "vue-router";
import { createApp } from "vue";
import "./assets/styles/index.css";
import App from "./App.vue";
import GameView from "./views/GameView.vue";
import SignInView from "./views/SignInView.vue";
import { createPinia } from "pinia";
import { useSettingsStore } from "./store";

const pinia = createPinia();
const app = createApp(App).use(pinia);

const settingsStore = useSettingsStore();

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: GameView },
    { path: "/sign_in", component: SignInView, name: "SignIn" },
  ],
});

router.beforeEach(async (to) => {
  if (settingsStore.auth === null && to.name !== "SignIn") {
    return { name: "SignIn" };
  }
});

app.use(router).mount("#app");
