// Địa chỉ ngoài app của Home247 (pwa.md P5).
/**
 * Chat Zalo của Home247 (YC1.7 bước 4, pwa.md P5). Mã OA chưa có (giả định GD31, ghi ở work/cho-tung.md): tới khi Tùng đưa mã thật,
 * đặt biến build VITE_ZALO_HOME247 (ví dụ https://zalo.me/<OA>); không đặt thì dùng địa chỉ chung dưới.
 */
export const LINK_ZALO_HOME247: string = (import.meta.env.VITE_ZALO_HOME247 as string | undefined) || 'https://zalo.me/home247';

/** Mở một địa chỉ ngoài app ở tab mới (bản PWA được mở link ra ngoài, pwa.md P5). */
export function moLinkNgoai(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
