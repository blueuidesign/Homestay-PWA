// Hỗ trợ test e2e trên Supabase chạy ở máy (US2): đọc mã 6 số từ hộp thư giả Mailpit, đọc database bằng psql,
// tạo sẵn tài khoản đã đăng ký. Không có tài khoản thật, email giả đuôi vidu.test.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import type { Page } from '@playwright/test';

export const MAILPIT = process.env.E2E_MAILPIT_URL ?? 'http://127.0.0.1:54324';
const DB_URL = process.env.E2E_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

/** Email giả không trùng giữa các lượt chạy. */
export function emailMoi(ten: string): string {
  return `${ten}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}@vidu.test`;
}

/** Số giả không trùng: 09 + 8 chữ số ngẫu nhiên. */
export function soMoi(): string {
  return '09' + String(parseInt(randomBytes(4).toString('hex'), 16) % 100_000_000).padStart(8, '0');
}

type ThuMailpit = { ID: string; Subject: string; Created: string; To: { Address: string }[] };

/** Các thư gửi tới email (mới nhất trước). */
export async function thuToi(email: string): Promise<ThuMailpit[]> {
  const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
  if (!r.ok) throw new Error(`Mailpit trả ${r.status}`);
  const d = (await r.json()) as { messages: ThuMailpit[] };
  return d.messages ?? [];
}

/** Chờ thư thứ `thuThu` (đếm từ 1) tới email rồi lấy mã 6 số trong tiêu đề. */
export async function layMa(email: string, thuThu = 1, choMs = 20_000): Promise<string> {
  const het = Date.now() + choMs;
  while (Date.now() < het) {
    const ds = await thuToi(email);
    if (ds.length >= thuThu) {
      const m = /(\d{6})/.exec(ds[0]!.Subject);
      if (m) return m[1]!;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Không thấy thư mã gửi tới ${email}`);
}

/** Chạy một câu SQL bằng chủ database của Supabase trên máy, trả chuỗi kết quả (psql -At). */
export function sql(cau: string): string {
  return execFileSync('psql', [DB_URL, '-X', '-At', '-c', cau], { encoding: 'utf8' }).trim();
}

/** Nhập mã vào 6 ô (ô đầu nhận cả mã, app rải ra các ô). */
export async function nhapMa(page: Page, ma: string): Promise<void> {
  await page.getByLabel('Số thứ 1').fill(ma);
}

/**
 * Tạo sẵn một tài khoản đã đăng ký xong bằng SQL (không gửi thư, nên lần xin mã đăng nhập ngay sau đó
 * không vướng giới hạn 60 giây giữa hai lần gửi). Hồ sơ ghi như fn_dang_ky ghi.
 */
export function taoTaiKhoan(vai: 'chu_nha' | 'sale' | null, ten = 'Chủ Thử'): { email: string; so: string } {
  const email = emailMoi('chu');
  const so = soMoi();
  const vaiSql = vai ? `'${vai}'` : 'null';
  sql(`with u as (
         insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at,
                                 raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token,
                                 email_change_token_new, email_change)
         values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
                 '${email}', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', '', '', '', '')
         returning id)
       insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon, dong_y_dieu_khoan_luc)
       select id, '${ten}', '${ten}', '${so}', ${vaiSql}, now() from u`);
  return { email, so };
}
