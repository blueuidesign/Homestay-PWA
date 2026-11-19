// Test unit đường dẫn các tab của chủ nhà (YC3.1 bước 8, 13, 14).
import { describe, expect, it } from 'vitest';
import { chonManChu, duongDanDatPhongMoi } from './dieuHuong';

describe('YC3.1 · đường dẫn tab chủ nhà', () => {
  it('YC3.1 bước 8, 13, 14 /can, /can/moi, /can/<mã> và các tab', () => {
    expect(chonManChu('/')).toEqual({ tab: 'lich' });
    expect(chonManChu('/lich')).toEqual({ tab: 'lich' });
    expect(chonManChu('/can')).toEqual({ tab: 'can' });
    expect(chonManChu('/can/')).toEqual({ tab: 'can' });
    expect(chonManChu('/can/moi')).toEqual({ tab: 'can-moi' });
    expect(chonManChu('/can/00000000-0000-0000-0001-000000001509')).toEqual({ tab: 'can-chi-tiet', id: '00000000-0000-0000-0001-000000001509' });
    expect(chonManChu('/ca-nhan')).toEqual({ tab: 'ca-nhan' });
    expect(chonManChu('/la')).toEqual({ tab: 'lich' });
  });

  it('YC5.1 bước 1a, 1b /dat-phong/moi mở CN4; từ CN3 kèm căn và ngày nhận', () => {
    expect(chonManChu('/dat-phong/moi')).toEqual({ tab: 'dat-phong-moi' });
    expect(duongDanDatPhongMoi()).toBe('/dat-phong/moi');
    const d = duongDanDatPhongMoi({ canId: '00000000-0000-0000-0001-000000003402', ngay: '2026-10-10' });
    expect(chonManChu(d)).toEqual({ tab: 'dat-phong-moi', canId: '00000000-0000-0000-0001-000000003402', ngay: '2026-10-10' });
    expect(chonManChu('/dat-phong/moi/c3402/2026-02-30')).toEqual({ tab: 'lich' }); // ngày không có thật
  });
});
