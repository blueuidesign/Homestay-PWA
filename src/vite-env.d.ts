/// <reference types="vite/client" />
// Biến build của app (docs/dev/chay-va-test.md). Khóa anon của Supabase là công khai.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
