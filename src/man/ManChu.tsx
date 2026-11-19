// Các tab của chủ nhà (YC3.1): tab Lịch và tab Căn chưa có căn thì A4, tab Căn có căn thì CN5.
// Lịch khi đã có căn (YC5), Thêm căn CN5-A1 (US15), Sửa căn CN5-02, Sale, Thống kê, Cá nhân: khung tạm, US sau thay.
import { useCallback, useEffect, useState } from 'react';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { tenCan, type CanTomTat } from '../lib/can';
import { chonManChu, DUONG_DAN_TAB } from '../lib/dieuHuong';
import type { DichVuCan } from '../lib/dichVuCan';
import { A4ChuaCoCan } from './A4ChuaCoCan';
import { CN5DanhSachCan } from './CN5DanhSachCan';
import { KhungMan } from './khung';
import { KhungTabChu, ThanhTabChu, type TabChuTen } from './TabChu';

const TIEU_DE_TAM: Record<'sale' | 'thong-ke' | 'ca-nhan', string> = { sale: 'Sale', 'thong-ke': 'Thống kê', 'ca-nhan': 'Cá nhân' };

/** HV1: lần đầu khung xám; có dữ liệu cũ thì hiện ngay kèm "Đang cập nhật…". HV2: chưa tải được thì Thử lại. */
function useDanhSachCan(dv: DichVuCan | null) {
  const [ds, datDs] = useState<CanTomTat[] | undefined>(dv ? undefined : []);
  const [dangTai, datDangTai] = useState(!!dv);
  const [loi, datLoi] = useState(false);
  const tai = useCallback(async () => {
    if (!dv) return;
    datDangTai(true);
    datLoi(false);
    try {
      datDs(await dv.layCanCuaToi());
    } catch {
      datLoi(true);
    } finally {
      datDangTai(false);
    }
  }, [dv]);
  return { ds, dangTai, loi, tai };
}

export function ManChu(props: { duongDan: string; den: (d: string) => void; dichVuCan: DichVuCan | null; onDangXuat: () => void }) {
  const man = chonManChu(props.duongDan);
  const { ds, dangTai, loi, tai } = useDanhSachCan(props.dichVuCan);
  const canDanhSach = man.tab === 'lich' || man.tab === 'can';

  // Tải lại mỗi lần mở tab Lịch hay tab Căn (vừa thêm căn ở màn khác thì thấy ngay).
  useEffect(() => { if (canDanhSach) void tai(); }, [canDanhSach, man.tab, tai]);

  const themCan = () => props.den('/can/moi');
  const chonTab = (t: TabChuTen) => props.den(DUONG_DAN_TAB[t]);

  if (man.tab === 'can-moi') {
    return <KhungMan tieuDe="Thêm căn" onQuayLai={() => window.history.back()}><p className="dong-mo">Form thêm căn làm ở US15.</p></KhungMan>;
  }
  if (man.tab === 'can-chi-tiet') {
    const c = ds?.find((x) => x.id === man.id);
    return <KhungMan tieuDe={c ? tenCan(c.maCan) : 'Căn'} onQuayLai={() => props.den('/can')}><p className="dong-mo">Sửa căn làm ở US sau.</p></KhungMan>;
  }

  let than;
  if (man.tab === 'sale' || man.tab === 'thong-ke' || man.tab === 'ca-nhan') {
    than = (
      <KhungTabChu tieuDe={TIEU_DE_TAM[man.tab]}>
        {man.tab === 'ca-nhan' && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onDangXuat}>Đăng xuất</button>
        )}
      </KhungTabChu>
    );
  } else if (ds === undefined) {
    than = (
      <KhungTabChu tieuDe={man.tab === 'lich' ? 'Lịch' : 'Căn của tôi'}>
        {loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />}
      </KhungTabChu>
    );
  } else if (ds.length === 0) {
    than = <A4ChuaCoCan onThemCan={themCan} tieuDe={man.tab === 'lich' ? 'Lịch' : 'Căn của tôi'} />;
  } else if (man.tab === 'can') {
    than = <CN5DanhSachCan ds={ds} onMoCan={(id) => props.den(`/can/${id}`)} onThemCan={themCan} />;
  } else {
    than = <KhungTabChu tieuDe="Lịch"><p className="dong-mo">Lịch các căn làm ở YC5.</p></KhungTabChu>;
  }

  return (
    <>
      {dangTai && ds !== undefined && canDanhSach && <div className="chu-cap-nhat"><DongDangCapNhat /></div>}
      {than}
      <ThanhTabChu dangMo={man.tab} onChon={chonTab} />
    </>
  );
}
