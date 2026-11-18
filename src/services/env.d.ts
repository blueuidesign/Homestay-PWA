/// <reference types="vite/client" />
// Biến môi trường của app (.env.example). Cả hai là khóa công khai của Supabase.
//   Không đặt: app chạy chế độ thử bằng dữ liệu mẫu trong máy (services/api.ts), không gọi mạng.
//   Có đặt: services/supabase.ts tạo kết nối. Việc chuyển từng hàm của services/api.ts sang Supabase làm theo từng story (docs/Ghi_chu_code.md).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
