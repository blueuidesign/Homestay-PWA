// Cấu hình test e2e (EN1, EN3). Khung điện thoại 390×844. Lệnh: docs/dev/chay-va-test.md mục Test.
// Dự án "dien-thoai": bản build không bật đăng nhập (vite preview, cổng 4173), hoặc E2E_BASE_URL nếu đặt.
// Dự án "dang-nhap-thu" (EN3): chỉ chạy khi có E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY (GitHub Secrets của staging);
// build riêng có bật đăng nhập thử ra dist-thu/, chạy ở cổng 4174.
import { defineConfig, devices } from '@playwright/test';

const diaChiNgoai = process.env.E2E_BASE_URL;
const diaChiMay = 'http://localhost:4173';
const diaChiThu = 'http://localhost:4174';
const coStaging = !!process.env.E2E_SUPABASE_URL && !!process.env.E2E_SUPABASE_ANON_KEY;

const dienThoai = {
  ...devices['Desktop Chrome'],
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'off',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },
  projects: [
    {
      name: 'dien-thoai',
      testIgnore: /dang-nhap-thu\.spec\.ts/,
      use: { ...dienThoai, baseURL: diaChiNgoai ?? diaChiMay },
    },
    ...(coStaging
      ? [{ name: 'dang-nhap-thu', testMatch: /dang-nhap-thu\.spec\.ts/, use: { ...dienThoai, baseURL: diaChiThu } }]
      : []),
  ],
  webServer: [
    ...(diaChiNgoai
      ? []
      : [{
          command: 'npm run build && npm run preview -- --strictPort',
          url: diaChiMay,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        }]),
    ...(coStaging
      ? [{
          command: 'npx vite build --outDir dist-thu && npx vite preview --outDir dist-thu --port 4174 --strictPort',
          url: diaChiThu,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            VITE_DANG_NHAP_THU: '1',
            VITE_SUPABASE_URL: process.env.E2E_SUPABASE_URL ?? '',
            VITE_SUPABASE_ANON_KEY: process.env.E2E_SUPABASE_ANON_KEY ?? '',
          },
        }]
      : []),
  ],
});
