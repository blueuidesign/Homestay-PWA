// Tiền là số nguyên đồng; cách viết đầy đủ và rút gọn trên màn. QT5.2, glossary.md mục Viết số tiền (QT5-H1 đã trả lời).

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

/**
 * Viết rút gọn cho ô lịch, ô tháng: "900k", "1,1tr". glossary.md mục Viết số tiền, QT5-H1.
 * Dưới 1.000.000: làm tròn tới nghìn (từ 500đ lên), tròn ra 1.000k thì "1tr".
 * Từ 1.000.000: làm tròn tới chục nghìn, ghi triệu tối đa 2 chữ số sau dấu phẩy, bỏ số 0 thừa.
 */
export function vietTienGon(dong: number): string {
  if (!laTienNguyen(dong) || dong < 0) throw new RangeError(`Tiền phải là số nguyên đồng không âm: ${dong}`);
  if (dong < 1_000_000) {
    const nghin = Math.floor((dong + 500) / 1000);
    if (nghin < 1000) return `${nghin}k`;
    return '1tr';
  }
  const chucNghin = Math.floor((dong + 5000) / 10_000); // số chục nghìn: 1.130.000 là 113
  const nguyen = Math.floor(chucNghin / 100);
  const le = String(chucNghin % 100).padStart(2, '0').replace(/0+$/, '');
  return le ? `${nguyen},${le}tr` : `${nguyen}tr`;
}

/** Khoảng giá một tháng: "800k–1,1tr" (gạch ngang dài); hai đầu viết ra giống nhau thì một số. QT5-H1 */
export function vietKhoangGia(thap: number, cao: number): string {
  const a = vietTienGon(Math.min(thap, cao));
  const b = vietTienGon(Math.max(thap, cao));
  return a === b ? a : `${a}–${b}`;
}
