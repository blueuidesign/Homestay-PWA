import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-180.png"],
      manifest: {
        name: "Home247 · Lịch phòng Hạ Long",
        short_name: "Home247",
        description: "Lịch phòng homestay Hạ Long cho chủ nhà và sale",
        lang: "vi",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f9fafb",
        theme_color: "#059669",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      // Chỉ lưu sẵn vỏ app (HTML, JS, CSS, icon). Dữ liệu luôn lấy từ mạng: lịch và giá cũ còn nguy hiểm hơn không có.
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,ico}"], navigateFallback: "/index.html" },
    }),
  ],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
