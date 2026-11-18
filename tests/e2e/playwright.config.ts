// Playwright cho Home247.
// - Có E2E_BASE_URL (CI trên bản xem thử của Vercel): chạy vào địa chỉ đó.
// - Không có: tự dựng app đã build (npm run build trước) ở cổng 4173, chế độ thử bằng dữ liệu mẫu. Chỉ các spec không cần đăng nhập chạy được.
// Khung 390×844 như điện thoại; ảnh chụp mỗi luồng lưu ở test-results/ và được CI đính kèm.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4173',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_BASE_URL ? undefined : { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, cwd: '../..' },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'] } },          // WebKit, gần Safari và trình duyệt trong Zalo trên iPhone
    { name: 'android', use: { ...devices['Pixel 7'] } },           // Chromium
  ],
});
