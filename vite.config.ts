import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    APPLICATION_VERSION: `"Accentor Game v${process.env.npm_package_version}"`,
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      drafts: {
        customMedia: true,
      },
    },
  },
  build: {
    cssMinify: "lightningcss",
  },
});
