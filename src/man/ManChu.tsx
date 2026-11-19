// Các tab của chủ nhà (YC3.1): tab Lịch và tab Căn chưa có căn thì A4, tab Căn có căn thì CN5.
// Thêm căn CN5-A1 (YC3.2, US15), ảnh căn CN5-A2, CN5-A3 (YC3.3, US16): lưu được thì về CN5 với toast (CN5-A4, CN5-A4b).
// Căn mở từ CN5 có hai tab; tab Giá là CN6 (YC4.2, US21). Tab Lịch khi đã có căn là CN1 (YC2.1, US9).
// Tab Thông tin (Sửa căn CN5-02), Sale, Thống kê, Cá nhân: khung tạm, US sau thay.
// Thêm đặt phòng CN4 (YC5.1, US26): mở từ nút "Đặt phòng" ở CN1 hay dòng căn trống ở CN3. Lưu được (YC5.2, YC5.3, US27)
// thì về tab Lịch với toast; CN4-03 (YC5.3 bước 10, US28): lịch mở ở tháng của ngày nhận, chi tiết ngày đó mở sẵn.
// Chi tiết đặt phòng CN3-02 (YC5.5, US30): mở từ dòng có khách ở CN3.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../chung/Toast';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { tenCan, thuHaiCuaTuan, type CanTomTat, type GiaTuan } from '../lib/can';
import { mauCan } from '../lib/lich';
import { chonManChu, DUONG_DAN_TAB, duongDanDatPhong, duongDanDatPhongMoi } from '../lib/dieuHuong';
import type { DichVuCan } from '../lib/dichVuCan';
import type { ThangLich } from '../lib/dichVuLich';
import { homNay, type Ngay } from '../lib/ngay';
import { A4ChuaCoCan } from './A4ChuaCoCan';
import { CN1LichThang } from './CN1LichThang';
import { CN302ChiTietDatPhong } from './CN302ChiTietDatPhong';
import { CN4ThemDatPhong } from './CN4ThemDatPhong';
import { CN5A1ThemCan } from './CN5A1ThemCan';
import { CN5DanhSachCan } from './CN5DanhSachCan';
import { CN6GiaCan, KhungCan } from './CN6GiaCan';
import { P6DemCuoiTuan } from './P6DemCuoiTuan';
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

/** YC4.1 bước 1: giá tuần này của các căn, đọc mỗi lần mở tab Căn. Lỗi thì để trống, thẻ vẫn hiện (giá không phải dữ liệu chính của thẻ). */
function useGiaTuan(dv: DichVuCan | null, mo: boolean) {
  const [gia, datGia] = useState<Record<string, GiaTuan> | undefined>(undefined);
  useEffect(() => {
    const doc = dv?.gia?.layGiaTuan;
    if (!mo || !doc) return;
    let huy = false;
    doc.call(dv!.gia, thuHaiCuaTuan(homNay())).then((g) => { if (!huy) datGia(g); }, () => { /* để trống */ });
    return () => { huy = true; };
  }, [dv, mo]);
  return gia;
}

export function ManChu(props: {
  duongDan: string; den: (d: string) => void; dichVuCan: DichVuCan | null; onDangXuat: () => void;
  /** HV7 bước 2: phiên hết mà làm mới không được. */
  onHetPhien?: () => void;
}) {
  const man = chonManChu(props.duongDan);
  const { ds, dangTai, loi, tai } = useDanhSachCan(props.dichVuCan);
  const hienToast = useToast();
  const giaTuan = useGiaTuan(props.dichVuCan, man.tab === 'can');
  // HV1-NT2: tháng lịch đã xem giữ trong phiên, mở lại tab Lịch thấy ngay.
  const boNhoLich = useRef(new Map<string, ThangLich>());
  // CN5-A4, CN5-A4b: vừa thêm căn thì nút dưới danh sách là "Thêm căn khác"; rời tab Căn thì thôi.
  const [vuaThem, datVuaThem] = useState(false);
  useEffect(() => { if (man.tab !== 'can' && man.tab !== 'can-moi') datVuaThem(false); }, [man.tab]);
  // CN4-03: ngày nhận của đặt phòng vừa lưu; rời tab Lịch thì thôi.
  const [ngayVuaLuu, datNgayVuaLuu] = useState<Ngay | null>(null);
  useEffect(() => { if (man.tab !== 'lich' && man.tab !== 'dat-phong-moi') datNgayVuaLuu(null); }, [man.tab]);
  const canDanhSach = man.tab === 'lich' || man.tab === 'can' || man.tab === 'dat-phong-moi';
  const moCan = man.tab === 'can-chi-tiet' || man.tab === 'can-gia' || man.tab === 'dat-phong'; // CN3-02 cần thứ tự căn cho màu

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

  if (man.tab === 'dat-phong-moi') {
    // YC5.1 bước 1a, 1b: CN4; hàng chip căn theo thứ tự tab Lịch (căn thêm trước đứng trước). Đóng thì về màn trước.
    return (
      <CN4ThemDatPhong key={`${man.canId ?? ''}|${man.ngay ?? ''}`} ds={ds && [...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan }))}
                       dv={props.dichVuCan?.datPhong} canIdBanDau={man.canId} ngayBanDau={man.ngay}
                       onDong={() => window.history.back()}
                       onHetPhien={props.onHetPhien}
                       onDaLuu={(v) => {
                         // YC5.3 bước 10, YC5.3-NT1: về tab Lịch với toast; bỏ tháng đã nhớ để lịch đọc lại có đặt phòng mới.
                         boNhoLich.current.clear();
                         datNgayVuaLuu(v.ngayNhan);
                         hienToast(`Đã thêm đặt phòng ${v.nguoiDat} · ${v.maCan}`);
                         props.den('/');
                       }} />
    );
  }

  if (man.tab === 'dat-phong') {
    // YC5.5, YC2.2 bước 9: CN3-02; màu căn theo thứ tự tab Lịch. Quay lại hay đặt phòng không còn (HV5) thì về màn trước.
    // Thu đủ, hoàn tác đổi trạng thái tiền: bỏ tháng đã nhớ để CN3 đọc lại.
    const theoLich = ds ? [...ds].reverse() : [];
    const veManTruoc = () => { boNhoLich.current.clear(); window.history.back(); };
    return (
      <CN302ChiTietDatPhong key={man.id} id={man.id} dv={props.dichVuCan?.datPhong} mau={(canId) => { const i = theoLich.findIndex((c) => c.id === canId); return i < 0 ? undefined : mauCan(i); }}
                            onQuayLai={veManTruoc} onKhongCon={veManTruoc} />
    );
  }

  if (man.tab === 'dem-cuoi-tuan') {
    // YC4.6 bước 1, 4: P6 mở từ tab Cá nhân; lưu xong về Cá nhân với toast (YC4-H4).
    return <P6DemCuoiTuan dv={props.dichVuCan?.gia} onQuayLai={() => props.den('/ca-nhan')} onDaLuu={() => props.den('/ca-nhan')} />;
  }

  let than;
  if (man.tab === 'sale' || man.tab === 'thong-ke' || man.tab === 'ca-nhan') {
    than = (
      <KhungTabChu tieuDe={TIEU_DE_TAM[man.tab]}>
        {man.tab === 'ca-nhan' && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => props.den('/ca-nhan/dem-cuoi-tuan')}>Ngày tính giá cuối tuần</button>
        )}
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
    than = <CN5DanhSachCan ds={ds} onMoCan={(id) => props.den(`/can/${id}`)} onThemCan={themCan} vuaThem={vuaThem}
                    giaTuan={giaTuan} onDatGia={(id) => props.den(`/can/${id}/gia`)} // YC4.1 bước 1, 2
                    onDatGiaNhieu={() => hienToast('Sẽ có ở bản sau')} /> // YC4.1 bước 3, YC4.4 làm ở US sau;
  } else {
    // YC2.1: CN1, chạm ngày mở CN3 (YC2.2). Căn thêm trước đứng trước (danh sách đọc về căn mới trước).
    // YC5.1: "Đặt phòng" mở CN4. YC2.2 bước 9, YC5.5: chạm dòng có khách mở CN3-02.
    than = <CN1LichThang key={ngayVuaLuu ?? ''} ngayMoSan={ngayVuaLuu ?? undefined}
                         ds={[...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan }))} dv={props.dichVuCan?.lich}
                         boNho={boNhoLich.current} onDatPhong={(c) => props.den(duongDanDatPhongMoi(c))}
                         onMoDatPhong={(id) => props.den(duongDanDatPhong(id))} />;
  }

  return (
    <>
      {dangTai && ds !== undefined && canDanhSach && <div className="chu-cap-nhat"><DongDangCapNhat /></div>}
      {than}
      <ThanhTabChu dangMo={man.tab} onChon={chonTab} />
    </>
  );
}
