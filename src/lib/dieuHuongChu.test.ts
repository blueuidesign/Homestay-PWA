// Test unit đường dẫn các tab của chủ nhà (YC3.1 bước 8, 13, 14).
import { describe, expect, it } from 'vitest';
import { chonManChu } from './dieuHuong';

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
});
