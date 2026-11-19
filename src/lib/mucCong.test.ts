// Test unit bộ chip mức cộng dùng chung P10 và S3, ví dụ ở P10 (YC7.5, YC7-H10, YC7-H11, glossary "Mức cộng của sale").
import { describe, expect, it } from 'vitest';
import { hangChip } from './chiTietCanSale';
import {
  boChipMucCong, CHU_BO_CHIP_MUC_CONG, chuMuc, docMucNghin, giaBanDem, mucHopLe, TIEU_DE_VI_DU, viDu,
} from './mucCong';

describe('YC7.5 · ví dụ ở P10 (1.100.000đ một đêm, 2 đêm, YC7-H11)', () => {
  it('YC7.5-NT1 chọn "+400k": ví dụ 2 đêm ghi "Bạn được 800.000đ"', () => {
    expect(viDu(400_000, false)).toEqual({ giaChu: 2_200_000, giaGuiKhach: 3_000_000, banDuoc: 800_000 });
  });
  it('YC7.5-NT2 chọn "Không cộng": giá gửi khách bằng giá chủ nhà', () => {
    const v = viDu(0, false);
    expect(v.giaGuiKhach).toBe(v.giaChu);
    expect(v.banDuoc).toBe(0);
  });
  it('YC7.5 bước 3 QT5.4 GD13 bật làm tròn: làm tròn từng đêm rồi mới cộng', () => {
    expect(viDu(130_000, true)).toEqual({ giaChu: 2_200_000, giaGuiKhach: 2_500_000, banDuoc: 300_000 });
    expect(giaBanDem(1_100_000, 130_000, true)).toBe(1_250_000);
    expect(giaBanDem(1_100_000, 130_000, false)).toBe(1_230_000);
  });
  it('YC7.5 YC7-H11 tiêu đề ví dụ không phụ thuộc căn của sale', () => {
    expect(TIEU_DE_VI_DU).toBe('Ví dụ: phòng 1.100.000đ/đêm, 2 đêm');
  });
});

describe('YC7.5 · bộ chip mức cộng', () => {
  it('YC7.5-NT5 bộ chip theo glossary: Không cộng, +100k … +500k, Tùy chọn', () => {
    expect(CHU_BO_CHIP_MUC_CONG).toEqual(['Không cộng', '+100k', '+200k', '+300k', '+400k', '+500k', 'Tùy chọn']);
    expect(boChipMucCong(null).map((c) => c.chu)).toEqual(CHU_BO_CHIP_MUC_CONG);
  });
  it('YC7.5-NT5 S3 dùng cùng bộ chip, chỉ thêm chip "Mặc định" ở đầu (YC7-H7)', () => {
    const s3 = hangChip({ mucCongRieng: null, mucCongMacDinh: 400_000 }).map((c) => c.chu);
    expect(s3[0]).toBe('Mặc định +400k');
    expect(s3.slice(1)).toEqual(CHU_BO_CHIP_MUC_CONG);
  });
  it('YC7.5 bước 2 mức đang lưu sáng đúng chip; mức lạ thì "Tùy chọn" sáng', () => {
    expect(boChipMucCong(400_000).filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['+400k']);
    expect(boChipMucCong(0).filter((c) => c.dangChon).map((c) => c.chu)).toEqual(['Không cộng']);
    expect(boChipMucCong(250_000).filter((c) => c.dangChon).map((c) => c.khoa)).toEqual(['tuy-chon']);
    expect(chuMuc(250_000)).toBe('+250k');
  });
});

describe('YC7.5 · ô Tùy chọn (YC7-H10)', () => {
  it('YC7.5 YC7-H10 gõ theo nghìn đồng: "250" là 250.000đ', () => {
    expect(docMucNghin('250')).toBe(250_000);
    expect(docMucNghin('0')).toBe(0);
    expect(docMucNghin('')).toBeNull();
    expect(docMucNghin('1.000')).toBe(1_000_000);
    expect(docMucNghin('-5')).toBeUndefined();
    expect(docMucNghin('2,5')).toBeUndefined();
  });
  it('YC7.5 YC7-H10 mức cộng từ 0 đến 5.000.000đ', () => {
    expect(mucHopLe(0)).toBe(true);
    expect(mucHopLe(5_000_000)).toBe(true);
    expect(mucHopLe(5_001_000)).toBe(false);
    expect(mucHopLe(-1)).toBe(false);
    expect(mucHopLe(null)).toBe(false);
  });
});
