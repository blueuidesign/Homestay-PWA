// Tiền là số nguyên đồng; cách viết đầy đủ trên màn. QT5.2, glossary.md mục Viết số tiền
//
// Cách viết rút gọn ("900k", "1,1tr") chưa làm ở đây: đặc tả chưa nói làm tròn
// thế nào khi số không chẵn (QT5-H1 trong work/cau-hoi.md).

/** Số tiền hợp lệ: số nguyên, không phần lẻ, nằm trong giới hạn số nguyên an toàn. QT5.2 */
export function laTienNguyen(x: number): boolean {
  return Number.isSafeInteger(x);
}

/** Viết đầy đủ, ví dụ 1300000 thành "1.300.000đ". QT5.2 */
export function vietTien(soTien: number): string {
  if (!laTienNguyen(soTien)) throw new RangeError(`Tiền phải là số nguyên đồng: ${soTien}`);
  const am = soTien < 0;
  const chu = String(Math.abs(soTien)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${am ? '-' : ''}${chu}đ`;
}
