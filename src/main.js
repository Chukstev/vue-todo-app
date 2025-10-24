import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./globals.css";
import { useAuthStore } from "./stores/auth";

async function initApp() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  // Initialize auth store before router
  const authStore = useAuthStore(pinia);
  await authStore.init();

  // Then use router after auth is initialized
  app.use(router);

  app.mount("#app");
}

initApp();
