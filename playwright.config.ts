// Cấu hình test e2e (EN1). Khung điện thoại 390×844. Lệnh: docs/dev/chay-va-test.md mục Test.
// Mặc định chạy trên bản build ở máy (vite preview). Đặt E2E_BASE_URL để chạy trên bản Preview hay staging.
import { defineConfig, devices } from '@playwright/test';

const diaChiNgoai = process.env.E2E_BASE_URL;
const diaChiMay = 'http://localhost:4173';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: diaChiNgoai ?? diaChiMay,
    trace: 'off',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },
  projects: [
    {
      name: 'dien-thoai',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: diaChiNgoai
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --strictPort',
        url: diaChiMay,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
