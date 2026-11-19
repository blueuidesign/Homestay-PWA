/// <reference types="vitest/config" />
// Cấu hình build và test unit (EN1, EN3). Lệnh: docs/dev/chay-va-test.md.
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  // YC1.2: đăng nhập thử không bao giờ bật ở production. Vercel đặt VERCEL_ENV khi build.
  if (env.VERCEL_ENV === 'production' && env.VITE_DANG_NHAP_THU === '1') {
    throw new Error('VITE_DANG_NHAP_THU=1 chỉ dùng cho bản thử. Gỡ biến này khỏi môi trường Production của Vercel.');
  }
  return {
    plugins: [react()],
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/test/setup.ts'],
      restoreMocks: true,
    },
  };
});
