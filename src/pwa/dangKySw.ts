// Đăng ký service worker để app cài được và mở lại khi mạng yếu (EN1, pwa.md).
// Không xin quyền gì khi vừa mở app. Trình duyệt không hỗ trợ hay lỗi thì app vẫn chạy bình thường.
export function dangKyServiceWorker(nav: Navigator = navigator): void {
  if (!('serviceWorker' in nav)) return;
  window.addEventListener('load', () => {
    nav.serviceWorker.register('/sw.js').catch(() => {
      // Không có service worker thì chỉ mất phần mở khi mất mạng; không báo người dùng.
    });
  });
}
