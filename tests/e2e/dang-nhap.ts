// Đăng nhập tài khoản thử trên STAGING cho E2E, không đi qua màn đăng nhập (cách đăng nhập thật còn chờ CH-001).
// Tài khoản thử dùng email và mật khẩu, chỉ bật trên project staging. Bí mật lấy từ biến môi trường, không ghi vào repo.
import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

export type Vai = 'chu' | 'sale';

export async function dangNhap(page: Page, vai: Vai) {
  const url = must('E2E_SUPABASE_URL');
  const key = must('E2E_SUPABASE_ANON_KEY');
  const email = must(vai === 'chu' ? 'E2E_CHU_EMAIL' : 'E2E_SALE_EMAIL');
  const password = must(vai === 'chu' ? 'E2E_CHU_MAT_KHAU' : 'E2E_SALE_MAT_KHAU');
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Không đăng nhập được tài khoản thử ${vai}: ${error?.message}`);
  // supabase-js trong app đọc phiên từ localStorage với khóa sb-<ref>-auth-token
  const ref = new URL(url).hostname.split('.')[0];
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [`sb-${ref}-auth-token`, JSON.stringify(data.session)]);
}

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name} (xem docs/van-hanh/Bi_mat_va_cau_hinh.md)`);
  return v;
}

// Mở một trang của app. Preview của Vercel có thể bị khóa bằng Vercel Authentication: có VERCEL_BYPASS thì lần mở đầu
// gửi mã vượt khóa qua tham số trên địa chỉ để Vercel đặt cookie (không gửi header, vì header lạ làm hỏng lời gọi tới Supabase).
const daDatCookie = new WeakSet<object>();   // mỗi test có một context mới, cookie đặt lại cho từng context
export async function moTrang(page: Page, duongDan = '/') {
  const bypass = process.env.VERCEL_BYPASS;
  if (bypass && !daDatCookie.has(page.context())) {
    const dau = duongDan.includes('?') ? '&' : '?';
    await page.goto(`${duongDan}${dau}x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`);
    daDatCookie.add(page.context());
    return;
  }
  await page.goto(duongDan);
}
