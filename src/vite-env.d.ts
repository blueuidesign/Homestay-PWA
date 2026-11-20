/// <reference types="vite/client" />
// Biến build của app (docs/dev/chay-va-test.md). Khóa anon của Supabase là công khai.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Địa chỉ chat Zalo của Home247 (YC1.7); thiếu thì dùng địa chỉ chung ở src/lib/home247.ts. */
  readonly VITE_ZALO_HOME247?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
