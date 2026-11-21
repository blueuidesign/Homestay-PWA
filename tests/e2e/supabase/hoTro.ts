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

/** Đăng nhập tài khoản đã có từ A1 bằng mã gửi về hộp thư giả (A11, YC1.2). */
export async function dangNhapBangMa(page: Page, email: string): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tôi đã có tài khoản · Đăng nhập' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã đăng nhập' }).click();
  await nhapMa(page, await layMa(email));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

/** Id người dùng theo email (tài khoản tạo bằng taoTaiKhoan). */
export function idCua(email: string): string {
  return sql(`select id from auth.users where email = '${email}'`);
}

/**
 * US36: tạo một đặt phòng có sale đứng tên ở căn của chủ, kèm tiền từng đêm khớp tiền phòng (chia đều, phần lẻ dồn đêm cuối, QD10).
 * Ngày dạng 'YYYY-MM-DD'. Trả id đặt phòng.
 */
export function taoDatPhongCuaSale(canId: string, chuId: string, saleId: string, nhan: string, tra: string, tien: number): string {
  return sql(`with b as (
         insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien)
         values ('${canId}', '${nhan}', '${tra}', 'chu_ghi', '${saleId}', '${chuId}', ${tien}, 'chua_coc') returning id),
       n as (select ('${tra}'::date - '${nhan}'::date) as so),
       d as (insert into public.booking_dem (booking_id, dem, tien)
             select b.id, g::date,
                    case when g::date = '${tra}'::date - 1 then ${tien} - (${tien} / n.so) * (n.so - 1) else ${tien} / n.so end
             from b, n, generate_series('${nhan}'::date, '${tra}'::date - 1, interval '1 day') g)
       select id from b`).split('\n')[0]!;
}

/** US37: tạo một căn có lịch của chủ (tòa tạo nếu chưa có), kèm một dòng ảnh đại diện trong kho (không cần file thật). Trả id căn. */
export function taoCanCoAnh(chuId: string, maCan: string, toa: string, pn: number, giuong: number, view: string): string {
  sql(`insert into public.toa_nha (ten, home247_dat_san) values ('${toa}', true) on conflict do nothing`);
  const id = sql(`insert into public.can (nguoi_giu, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id)
                  select '${chuId}', '${maCan}', ${pn}, ${giuong}, '${view}', t.id from public.toa_nha t
                  where lower(btrim(t.ten)) = lower('${toa}') returning id`).split('\n')[0]!;
  const duongDan = `${chuId}/${id}.jpg`;
  sql(`insert into storage.objects (bucket_id, name, metadata) values ('anh-can', '${duongDan}', '{"mimetype":"image/jpeg","size":1}')`);
  sql(`insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu) values ('${id}', '${chuId}', '${duongDan}', 0)`);
  return id;
}

/** US37: tạo sẵn link mời đang dùng của chủ (như fn_lay_link_moi tạo). Trả mã link. */
export function taoLinkMoi(chuId: string): string {
  return sql(`insert into public.link_moi (ma, loai, chu_id) values (replace(gen_random_uuid()::text, '-', ''), 'moi_sale', '${chuId}')
              returning ma`).split('\n')[0]!;
}

/** YC13: đăng nhập trang quản trị /quan-tri bằng mã email. */
export async function vaoQuanTri(page: Page, email: string, thuThu = 1): Promise<void> {
  await page.goto('/quan-tri');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Gửi mã' }).click();
  await nhapMa(page, await layMa(email, thuThu));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

/** YC13: ghi quản trị viên đầu tiên bằng SQL như Tùng làm ở mỗi môi trường (Phat_hanh.md mục 5). */
export function datQuanTriGoc(): string {
  const email = emailMoi('qt');
  sql(`delete from public.admins; insert into public.admins (email, la_goc) values ('${email}', true)`);
  return email;
}
