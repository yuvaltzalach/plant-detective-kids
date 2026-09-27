/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt": הגרסה החדשה מחכה, והאפליקציה מחילה אותה רק במסך הבית (src/lib/appUpdate.ts)
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.svg", "icon.svg"],
      manifest: {
        name: "בלש הצמחים",
        short_name: "בלש הצמחים",
        description: "מזהים צמחים ועצים לפי תמונה, אוספים ומשחקים!",
        lang: "he",
        dir: "rtl",
        theme_color: "#16a34a",
        background_color: "#f0fdf4",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: "jsdom"
  }
});
