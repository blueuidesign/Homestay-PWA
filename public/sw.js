// Service worker của Home247 (EN1, pwa.md).
// Chỉ giữ vỏ app để mở lại được khi mạng yếu; không bao giờ giữ dữ liệu:
// - Mở trang: lấy mạng trước, mất mạng thì dùng bản vỏ app đã lưu.
// - File trong /assets/ (tên có mã băm, không đổi nội dung): lấy bản đã lưu trước.
// - Mọi yêu cầu khác (Supabase, khác tên miền, không phải GET): đi thẳng mạng, không lưu.
const KHO = 'home247-vo-app-v1';
const VO_APP = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(KHO).then((kho) => kho.add(VO_APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((ten) => Promise.all(ten.filter((t) => t !== KHO).map((t) => caches.delete(t))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const banSao = res.clone();
            caches.open(KHO).then((kho) => kho.put(VO_APP, banSao));
          }
          return res;
        })
        .catch(() => caches.match(VO_APP).then((res) => res || Response.error())),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then(
        (daLuu) =>
          daLuu ||
          fetch(req).then((res) => {
            if (res.ok) {
              const banSao = res.clone();
              caches.open(KHO).then((kho) => kho.put(req, banSao));
            }
            return res;
          }),
      ),
    );
  }
});
