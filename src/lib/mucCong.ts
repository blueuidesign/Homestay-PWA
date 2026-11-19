// Mức cộng của sale dùng chung P10 (mặc định, YC7.5) và S3 (riêng từng căn, YC7.4): bộ chip theo glossary "Mức cộng của sale",
// giá bán một đêm (QT5.4, GD13), ô "Tùy chọn" theo nghìn đồng và khoảng 0 đến 5.000.000đ (YC7-H10), ví dụ ở P10 (YC7-H11).
// Tiền là số nguyên đồng.
import { vietTien } from './tien';

/** Glossary "Mức cộng của sale": Không cộng, +100k … +500k; "Tùy chọn" là ô gõ số. */
export const MUC_CO_SAN = [0, 100_000, 200_000, 300_000, 400_000, 500_000] as const;

/** YC7-H10: mức cộng mỗi đêm từ 0 tới 5.000.000đ, database cũng chặn. */
export const MUC_CONG_TOI_DA = 5_000_000;
export const CAU_NGOAI_KHOANG = 'Mức cộng từ 0 đến 5.000.000đ';

/** "+200k", "+1.200.000đ", 0 là "Không cộng". */
export function chuMuc(muc: number): string {
  if (muc === 0) return 'Không cộng';
  if (muc % 1000 === 0 && muc < 1_000_000) return `+${muc / 1000}k`;
  return `+${vietTien(muc)}`;
}

export function laMucCoSan(muc: number | null): boolean {
  return muc != null && (MUC_CO_SAN as readonly number[]).includes(muc);
}

/** Một chip: muc là số (0 là "Không cộng") hay 'tuy-chon'. */
export type ChipMucCong = { khoa: string; chu: string; muc: number | 'tuy-chon'; dangChon: boolean };

/**
 * YC7.5 bước 2, YC7.4 bước 4, YC7.5-NT5: bộ chip của cả P10 và S3. `dangChon` là mức đang chọn (null: không chip nào);
 * mức không có chip thì "Tùy chọn" sáng và ghi kèm mức.
 */
export function boChipMucCong(dangChon: number | null): ChipMucCong[] {
  const la = dangChon != null && !laMucCoSan(dangChon);
  return [
    ...MUC_CO_SAN.map((m): ChipMucCong => ({ khoa: `m${m}`, chu: chuMuc(m), muc: m, dangChon: dangChon === m })),
    { khoa: 'tuy-chon', chu: la ? `Tùy chọn ${chuMuc(dangChon)}` : 'Tùy chọn', muc: 'tuy-chon', dangChon: la },
  ];
}

/** Chữ của bộ chip khi chưa chọn gì, đúng như glossary. */
export const CHU_BO_CHIP_MUC_CONG: readonly string[] = boChipMucCong(null).map((c) => c.chu);

/** QT5.4, GD13: giá bán một đêm = giá chủ + mức cộng; bật làm tròn thì làm tròn lên 50.000đ từng đêm. */
export function giaBanDem(giaChu: number, muc: number, lamTron: boolean): number {
  const g = giaChu + muc;
  return lamTron ? Math.ceil(g / 50_000) * 50_000 : g;
}

/** YC7-H10: mức hợp lệ là số nguyên đồng từ 0 tới 5.000.000đ. */
export function mucHopLe(muc: number | null | undefined): muc is number {
  return muc != null && Number.isSafeInteger(muc) && muc >= 0 && muc <= MUC_CONG_TOI_DA;
}

/**
 * YC7-H10: ô "Tùy chọn" ở P10 tính theo nghìn đồng ("250" là 250.000đ). Null khi ô trống; undefined khi chữ không nhận
 * (dấu trừ, dấu phẩy) để ô giữ chữ cũ. Dấu chấm, khoảng trắng bỏ qua.
 */
export function docMucNghin(chu: string): number | null | undefined {
  if (/[-,]/.test(chu)) return undefined;
  const so = chu.replace(/\D/g, '');
  if (!so) return null;
  const n = Number(so) * 1000;
  return Number.isSafeInteger(n) ? n : undefined;
}

/** YC7-H11: ví dụ ở P10 dùng giá cố định, không phụ thuộc sale có căn nào. */
export const VI_DU_GIA_DEM = 1_100_000;
export const VI_DU_SO_DEM = 2;
export const TIEU_DE_VI_DU = `Ví dụ: phòng ${vietTien(VI_DU_GIA_DEM)}/đêm, ${VI_DU_SO_DEM} đêm`;

/** YC7.5 bước 4, YC7.5-NT1, NT2: giá chủ nhà, giá gửi khách (làm tròn từng đêm rồi cộng), tiền sale được. */
export function viDu(muc: number, lamTron: boolean): { giaChu: number; giaGuiKhach: number; banDuoc: number } {
  const giaChu = VI_DU_GIA_DEM * VI_DU_SO_DEM;
  const giaGuiKhach = giaBanDem(VI_DU_GIA_DEM, muc, lamTron) * VI_DU_SO_DEM;
  return { giaChu, giaGuiKhach, banDuoc: giaGuiKhach - giaChu };
}
