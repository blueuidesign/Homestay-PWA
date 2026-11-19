/// <reference types="vite/client" />
// Biến môi trường app đọc (docs/ha-tang/Bi_mat_va_cau_hinh.md). Chỉ khóa công khai, không có bí mật.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_DANG_NHAP_THU?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
