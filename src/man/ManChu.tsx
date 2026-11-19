// Các tab của chủ nhà (YC3.1): tab Lịch và tab Căn chưa có căn thì A4, tab Căn có căn thì CN5.
// Thêm căn CN5-A1 (YC3.2, US15), ảnh căn CN5-A2, CN5-A3 (YC3.3, US16): lưu được thì về CN5 với toast (CN5-A4, CN5-A4b).
// Căn mở từ CN5 có hai tab; tab Giá là CN6 (YC4.2, US21); tab Thông tin (Sửa căn CN5-02), Lịch khi đã có căn (YC5), Sale, Thống kê, Cá nhân: khung tạm, US sau thay.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../chung/Toast';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { tenCan, type CanTomTat } from '../lib/can';
import { chonManChu, DUONG_DAN_TAB } from '../lib/dieuHuong';
import type { DichVuCan } from '../lib/dichVuCan';
import { A4ChuaCoCan } from './A4ChuaCoCan';
import { CN5A1ThemCan } from './CN5A1ThemCan';
import { CN5DanhSachCan } from './CN5DanhSachCan';
import { CN6GiaCan, KhungCan } from './CN6GiaCan';
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
  const hienToast = useToast();
  // CN5-A4, CN5-A4b: vừa thêm căn thì nút dưới danh sách là "Thêm căn khác"; rời tab Căn thì thôi.
  const [vuaThem, datVuaThem] = useState(false);
  useEffect(() => { if (man.tab !== 'can' && man.tab !== 'can-moi') datVuaThem(false); }, [man.tab]);
  const canDanhSach = man.tab === 'lich' || man.tab === 'can';
  const moCan = man.tab === 'can-chi-tiet' || man.tab === 'can-gia';

  // Tải lại mỗi lần mở tab Lịch hay tab Căn (vừa thêm căn ở màn khác thì thấy ngay).
  useEffect(() => { if (canDanhSach) void tai(); }, [canDanhSach, man.tab, tai]);
  // Mở thẳng địa chỉ của một căn (chưa qua tab Căn) thì đọc danh sách để có mã căn cho tiêu đề "Phòng 3402".
  useEffect(() => { if (moCan && ds === undefined && !dangTai) void tai(); }, [moCan, ds, dangTai, tai]);

  const themCan = () => props.den('/can/moi');
  const chonTab = (t: TabChuTen) => props.den(DUONG_DAN_TAB[t]);

  if (man.tab === 'can-moi') {
    const dv = props.dichVuCan;
    return (
      <CN5A1ThemCan
        taoCan={dv?.taoCan ? (c) => dv.taoCan!(c) : undefined}
        taiAnh={dv?.taiAnh} // YC3.3 bước 23
        layToa={dv?.layToa ? () => dv.layToa!() : undefined} // YC3.4 bước 29
        themToa={dv?.themToa ? (ten) => dv.themToa!(ten) : undefined} // YC3.4 bước 33, QT6.3
        onQuayLai={() => window.history.back()}
        onXong={(ma) => { datVuaThem(true); hienToast(`Đã thêm phòng ${ma}`); props.den('/can'); }} // YC3.2 bước 19
      />
    );
  }
  if (man.tab === 'can-chi-tiet') {
    // CN5-02 tab Thông tin: sửa căn làm ở US sau.
    const c = ds?.find((x) => x.id === man.id);
    return (
      <KhungCan tieuDe={c ? tenCan(c.maCan) : 'Căn'} tab="thong-tin" onQuayLai={() => props.den('/can')}
                onChonTab={(t) => { if (t === 'gia') props.den(`/can/${man.id}/gia`); }}>
        <p className="dong-mo">Sửa thông tin căn sẽ có ở bản sau.</p>
      </KhungCan>
    );
  }
  if (man.tab === 'can-gia') {
    // YC4.2 bước 1: CN6 tab Giá; lưu giá xong ở lại tab Giá (YC4-H5).
    const c = ds?.find((x) => x.id === man.id);
    return (
      <CN6GiaCan key={man.id} canId={man.id} maCan={c?.maCan ?? null} dv={props.dichVuCan?.gia}
                 onQuayLai={() => props.den('/can')} onThongTin={() => props.den(`/can/${man.id}`)} />
    );
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
    than = <CN5DanhSachCan ds={ds} onMoCan={(id) => props.den(`/can/${id}`)} onThemCan={themCan} vuaThem={vuaThem} />;
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
