// Các tab của chủ nhà (YC3.1): tab Lịch và tab Căn chưa có căn thì A4, tab Căn có căn thì CN5.
// Thêm căn CN5-A1 (YC3.2, US15), ảnh căn CN5-A2, CN5-A3 (YC3.3, US16): lưu được thì về CN5 với toast (CN5-A4, CN5-A4b).
// Căn mở từ CN5 có hai tab; tab Giá là CN6 (YC4.2, US21). Tab Lịch khi đã có căn là CN1 (YC2.1, US9).
// Tab Thông tin là Sửa căn CN5-02 (YC3.5, US18): lưu được thì về CN5 với toast "Đã lưu phòng 1509".
// Xóa căn ở CN5-02 (YC3.6, US19): xóa được thì về CN5 với toast "Đã xóa phòng 3402" (toast do CN5-02 hiện).
// Tab Sale là CN7 Danh sách sale (YC6.2, US36): CN7-04, CN7-05 mở trong tab, không đổi địa chỉ. Cá nhân: khung tạm, US sau thay.
// Tab Thống kê là CN8, CN8-00 (YC11.1, US58): màu căn theo thứ tự tab Lịch; tháng đã xem giữ trong phiên.
// Thêm đặt phòng CN4 (YC5.1, US26): mở từ nút "Đặt phòng" ở CN1 hay dòng căn trống ở CN3. Lưu được (YC5.2, YC5.3, US27)
// thì về tab Lịch với toast; CN4-03 (YC5.3 bước 10, US28): lịch mở ở tháng của ngày nhận, chi tiết ngày đó mở sẵn.
// Chi tiết đặt phòng CN3-02 (YC5.5, US30): mở từ dòng có khách ở CN3.
// Sửa đặt phòng CN4-02 (YC5.6, US31): mở từ nút Sửa ở CN3-02; lưu được thì toast "Đã lưu đặt phòng" và về đúng màn đã mở
// đặt phòng (YC5 Quy tắc "Về màn đã mở", YC5.6-NT7): mở từ chi tiết ngày thì về lịch với chi tiết ngày đó mở sẵn.
// Xóa đặt phòng khách lẻ ở CN3-02 (YC5.7, US32): xóa xong thì toast "Đã xóa đặt phòng" và về đúng màn đã mở chi tiết đặt phòng
// như khi sửa (YC5 Quy tắc "Về màn đã mở").
// Lịch tuần CN2 (YC2.5, US13): cặp nút "Tháng" "Tuần" ở CN1, CN2 đổi qua lại trong tab Lịch (nhớ trong ManChu, địa chỉ vẫn là "/").
// Bấm tab Lịch luôn mở lịch tháng (YC2-H4). Từ CN2 mở form đặt phòng hay chi tiết đặt phòng rồi quay về thì về lại tuần đang xem.
// Gửi lịch cho sale CN10 (YC6.6, US40): mở từ ô "Gửi lịch cho sale" ở CN1, trong tab Lịch, không đổi địa chỉ. Gửi xong thì về
// tab Lịch với toast "Đã gửi lịch" (CN10-02, HV8).
// Yêu cầu đặt phòng (YC9.2, US51): khối CN1-03 đọc mỗi lần mở tab Lịch; "Xem và trả lời" hay thông báo (moYeuCau) mở CN9 trong
// ManChu, không đổi địa chỉ. "Về lịch" về tab Lịch và đọc lại khối; "Xem đặt phòng" mở CN3-02 của đặt phòng vừa tạo.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../chung/Toast';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { tenCan, tenCanGiuaCau, thuHaiCuaTuan, type CanTomTat, type GiaTuan } from '../lib/can';
import { mauCan } from '../lib/lich';
import { chonManChu, DUONG_DAN_TAB, duongDanDatPhong, duongDanDatPhongMoi, duongDanSuaDatPhong } from '../lib/dieuHuong';
import { CAU_DA_LUU_SUA } from '../lib/datPhong';
import type { DichVuCan } from '../lib/dichVuCan';
import type { DichVuSale } from '../lib/dichVuSale';
import type { ThangLich } from '../lib/dichVuLich';
import { homNay, type Ngay } from '../lib/ngay';
import { A4ChuaCoCan } from './A4ChuaCoCan';
import { CN1LichThang } from './CN1LichThang';
import { CN2LichTuan } from './CN2LichTuan';
import { CN302ChiTietDatPhong } from './CN302ChiTietDatPhong';
import { CN4SuaDatPhong, CN4ThemDatPhong } from './CN4ThemDatPhong';
import { CN502SuaCan } from './CN502SuaCan';
import { CN5A1ThemCan } from './CN5A1ThemCan';
import { CN5DanhSachCan } from './CN5DanhSachCan';
import { CN6GiaCan } from './CN6GiaCan';
import { CN6DatGiaNhieu } from './CN6DatGiaNhieu';
import { CN7DanhSachSale } from './CN7DanhSachSale';
import { CN10GuiLich } from './CN10GuiLich';
import { CN9TraLoiYeuCau } from './CN9TraLoiYeuCau';
import { CN8ThongKe } from './CN8ThongKe';
import type { ThongKeThang } from '../lib/thongKeChu';
import type { DongYeuCauCho } from '../lib/traLoiYeuCau';
import { CAU_DA_GUI_LICH } from '../lib/dichVuGuiLich';
import { P6DemCuoiTuan } from './P6DemCuoiTuan';
import { KhungTabChu, ThanhTabChu, type TabChuTen } from './TabChu';
import { CaNhan } from './CaNhan';
import { P2HoSo } from './P2HoSo';
import { CAU_SE_CO, type KhoaDong } from '../lib/caNhan';
import { LINK_ZALO_HOME247, moLinkNgoai } from '../lib/home247';


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

/** YC9.2 bước 1: yêu cầu chờ cho khối CN1-03, đọc khi mở tab Lịch. Lỗi thì không có khối (lịch vẫn là dữ liệu chính). */
function useYeuCauCho(dv: DichVuCan | null, mo: boolean) {
  const [ds, datDs] = useState<DongYeuCauCho[]>([]);
  const [lan, datLan] = useState(0);
  useEffect(() => {
    const doc = dv?.traLoiYeuCau;
    if (!mo || !doc) return;
    let huy = false;
    doc.layDangCho().then((d) => { if (!huy) datDs(d); }, () => { /* giữ khối cũ */ });
    return () => { huy = true; };
  }, [dv, mo, lan]);
  return { ds, taiLai: () => datLan((n) => n + 1) };
}

export function ManChu(props: {
  duongDan: string; den: (d: string) => void; dichVuCan: DichVuCan | null; onDangXuat: () => void;
  /** YC6.2: danh sách sale (src/lib/dichVuSale.ts). Không truyền thì lấy dichVuCan.sale khi dịch vụ căn có gắn. */
  dichVuSale?: DichVuSale | null;
  /** HV7 bước 2: phiên hết mà làm mới không được. */
  onHetPhien?: () => void;
  /** YC9.2-NT1: chạm thông báo "yêu cầu mới" (manTuThongBao) thì mở CN9 của yêu cầu này. */
  moYeuCau?: string;
}) {
  const man = chonManChu(props.duongDan);
  const { ds, dangTai, loi, tai } = useDanhSachCan(props.dichVuCan);
  const hienToast = useToast();
  const giaTuan = useGiaTuan(props.dichVuCan, man.tab === 'can');
  // HV1-NT2: tháng lịch đã xem giữ trong phiên, mở lại tab Lịch thấy ngay.
  const boNhoLich = useRef(new Map<string, ThangLich>());
  // YC11.1, HV1-NT2: tháng thống kê đã xem giữ trong phiên.
  const boNhoThongKe = useRef(new Map<string, ThongKeThang>());
  // CN5-A4, CN5-A4b: vừa thêm căn thì nút dưới danh sách là "Thêm căn khác"; rời tab Căn thì thôi.
  const [vuaThem, datVuaThem] = useState(false);
  useEffect(() => { if (man.tab !== 'can' && man.tab !== 'can-moi') datVuaThem(false); }, [man.tab]);
  // CN4-03: ngày nhận của đặt phòng vừa lưu. YC5 Quy tắc "Về màn đã mở": ngày đang xem khi mở một đặt phòng từ chi tiết
  // ngày, để quay về lịch thì chi tiết ngày đó mở sẵn. Rời tab Lịch và các màn đặt phòng thì thôi.
  const [ngayVuaLuu, datNgayVuaLuu] = useState<Ngay | null>(null);
  useEffect(() => {
    if (man.tab !== 'lich' && man.tab !== 'dat-phong-moi' && man.tab !== 'dat-phong' && man.tab !== 'dat-phong-sua') datNgayVuaLuu(null);
  }, [man.tab]);
  // YC2.5 (YC2-H4): thứ Hai của tuần đang xem ở CN2 (null là đang xem lịch tháng); tháng mở lại CN1 khi bấm "Tháng" ở CN2.
  const [xemTuan, datXemTuan] = useState<Ngay | null>(null);
  const [thangTuTuan, datThangTuTuan] = useState<Ngay | null>(null);
  useEffect(() => {
    if (man.tab !== 'lich' && man.tab !== 'dat-phong-moi' && man.tab !== 'dat-phong' && man.tab !== 'dat-phong-sua') {
      datXemTuan(null);
      datThangTuTuan(null);
    }
  }, [man.tab]);
  // YC6.6: CN10 đang mở trong tab Lịch; rời tab Lịch thì thôi.
  const [guiLich, datGuiLich] = useState(false);
  useEffect(() => { if (man.tab !== 'lich') datGuiLich(false); }, [man.tab]);
  // Ô ngày vừa chạm trên CN1 (data-ngay), để biết chi tiết ngày nào đang mở khi chạm một đặt phòng.
  const ngayDangXem = useRef<Ngay | null>(null);
  // YC5.6 bước 26: chi tiết đặt phòng mở từ lịch trong app, form sửa mở từ chi tiết; để biết lùi mấy bước khi lưu xong.
  const chiTietTuLich = useRef(false);
  const suaTuChiTiet = useRef(false);
  const canDanhSach = man.tab === 'lich' || man.tab === 'can' || man.tab === 'dat-phong-moi';
  // CN3-02 cần thứ tự căn cho màu; CN4-02 cần danh sách căn cho hàng chip.
  // CN8 cần thứ tự căn cho màu (YC11.1 bước 3, 7).
  const moCan = man.tab === 'can-chi-tiet' || man.tab === 'can-gia' || man.tab === 'can-gia-nhieu' || man.tab === 'dat-phong' || man.tab === 'dat-phong-sua'
    || man.tab === 'thong-ke';

  // Tải lại mỗi lần mở tab Lịch hay tab Căn (vừa thêm căn ở màn khác thì thấy ngay).
  useEffect(() => { if (canDanhSach) void tai(); }, [canDanhSach, man.tab, tai]);
  // Mở thẳng địa chỉ của một căn (chưa qua tab Căn) thì đọc danh sách để có mã căn cho tiêu đề "Phòng 3402".
  useEffect(() => { if (moCan && ds === undefined && !dangTai) void tai(); }, [moCan, ds, dangTai, tai]);

  // YC9.2: CN9 đang mở (id yêu cầu); mở từ CN1-03 hay từ thông báo.
  const [yeuCauMo, datYeuCauMo] = useState<string | null>(props.moYeuCau ?? null);
  useEffect(() => { if (props.moYeuCau) datYeuCauMo(props.moYeuCau); }, [props.moYeuCau]);
  const yeuCau = useYeuCauCho(props.dichVuCan, man.tab === 'lich' && !yeuCauMo && !guiLich);

  const themCan = () => props.den('/can/moi');
  const chonTab = (t: TabChuTen) => {
    if (t === 'lich') { datXemTuan(null); datThangTuTuan(null); } // YC2-H4: tab Lịch luôn mở lịch tháng
    props.den(DUONG_DAN_TAB[t]);
  };

  if (yeuCauMo) {
    // YC9.2 bước 2 đến 5: CN9, CN9-02, CN9-03. Trả lời xong thì lịch tháng đọc lại (đặt phòng mới vào lịch).
    const veLich = () => { boNhoLich.current.clear(); datYeuCauMo(null); yeuCau.taiLai(); props.den('/'); };
    return (
      <CN9TraLoiYeuCau key={yeuCauMo} id={yeuCauMo} dv={props.dichVuCan?.traLoiYeuCau}
                       onQuayLai={veLich} onVeLich={veLich}
                       onXemDatPhong={(id) => { boNhoLich.current.clear(); datYeuCauMo(null); props.den(duongDanDatPhong(id)); }} />
    );
  }

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
    // YC3.5 bước 35 đến 41: CN5-02 tab Thông tin. Lưu được thì về CN5 với toast (bước 39); danh sách đọc lại khi mở tab Căn.
    const dv = props.dichVuCan;
    const c = ds?.find((x) => x.id === man.id);
    return (
      <CN502SuaCan key={man.id} canId={man.id} tieuDeTam={c ? tenCan(c.maCan) : undefined}
                   layCan={dv?.layCan ? (id) => dv.layCan!(id) : undefined}
                   suaCan={dv?.suaCan ? (id, s) => dv.suaCan!(id, s) : undefined}
                   taiAnh={dv?.taiAnh}
                   layToa={dv?.layToa ? () => dv.layToa!() : undefined}
                   themToa={dv?.themToa ? (ten) => dv.themToa!(ten) : undefined}
                   onQuayLai={() => props.den('/can')} onChonGia={() => props.den(`/can/${man.id}/gia`)}
                   onVeLich={() => props.den('/')}
                   onDaLuu={(ma) => { hienToast(`Đã lưu ${tenCanGiuaCau(ma)}`); props.den('/can'); }}
                   xoaCan={dv?.xoaCan ? (id) => dv.xoaCan!(id) : undefined} // YC3.6 bước 42
                   onDaXoa={() => { boNhoLich.current.clear(); props.den('/can'); }} /> // lịch tháng đọc lại, không còn căn đã xóa
    );
  }
  if (man.tab === 'can-gia-nhieu') {
    // YC4.4: CN6-05 chọn căn, CN6-06 đặt giá. Áp dụng xong về tab Căn với toast.
    return (
      <CN6DatGiaNhieu ds={ds?.map((c) => ({ id: c.id, maCan: c.maCan }))} dv={props.dichVuCan?.gia}
                      onQuayLai={() => props.den('/can')} onDaApDung={(n) => { hienToast(`Đã áp dụng giá cho ${n} căn`); props.den('/can'); }} />
    );
  }
  if (man.tab === 'can-gia') {
    // YC4.2 bước 1: CN6 tab Giá; lưu giá xong ở lại tab Giá (YC4-H5).
    const c = ds?.find((x) => x.id === man.id);
    return (
      <CN6GiaCan key={man.id} canId={man.id} maCan={c?.maCan ?? null} dv={props.dichVuCan?.gia}
                 dsCan={ds?.map((x) => ({ id: x.id, maCan: x.maCan }))}
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
                            onQuayLai={veManTruoc} onKhongCon={veManTruoc}
                            onSua={() => { suaTuChiTiet.current = true; props.den(duongDanSuaDatPhong(man.id)); }}
                            onDaXoa={() => {
                              // YC5.7 bước 31: mở từ lịch thì lùi về lịch (chi tiết ngày mở sẵn); mở thẳng địa chỉ thì về tab Lịch.
                              boNhoLich.current.clear();
                              const tuLich = chiTietTuLich.current;
                              chiTietTuLich.current = false;
                              if (tuLich) window.history.back();
                              else props.den('/');
                            }} />
    );
  }

  if (man.tab === 'dat-phong-sua') {
    // YC5.6 bước 24 đến 29: CN4-02. Đóng thì về màn trước. Lưu được (bước 26, YC5.6-NT7): mở từ chi tiết đặt phòng mà chi tiết
    // mở từ lịch thì lùi hai bước về lịch (chi tiết ngày mở sẵn); chỉ mở từ chi tiết thì lùi một bước; mở thẳng địa chỉ thì
    // sang chi tiết đặt phòng. Bỏ tháng đã nhớ để lịch đọc lại.
    const id = man.id;
    const veSauKhiLuu = () => {
      boNhoLich.current.clear();
      hienToast(CAU_DA_LUU_SUA);
      const lui = suaTuChiTiet.current ? (chiTietTuLich.current ? 2 : 1) : 0;
      suaTuChiTiet.current = false;
      chiTietTuLich.current = false;
      if (lui) window.history.go(-lui);
      else props.den(duongDanDatPhong(id));
    };
    const dong = () => { suaTuChiTiet.current = false; window.history.back(); };
    return (
      <CN4SuaDatPhong key={id} id={id} ds={ds && [...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan }))}
                      dv={props.dichVuCan?.datPhong} onDong={dong} onKhongCon={dong} onHetPhien={props.onHetPhien}
                      onDaLuu={veSauKhiLuu} />
    );
  }

  if (man.tab === 'ho-so') {
    // YC1.4 bước 1: P2 mở từ tab Cá nhân; lưu xong ở lại màn, Quay lại về Cá nhân.
    return <P2HoSo dv={props.dichVuCan?.hoSo} onQuayLai={() => props.den('/ca-nhan')} />;
  }

  if (man.tab === 'dem-cuoi-tuan') {
    // YC4.6 bước 1, 4: P6 mở từ tab Cá nhân; lưu xong về Cá nhân với toast (YC4-H4).
    return <P6DemCuoiTuan dv={props.dichVuCan?.gia} onQuayLai={() => props.den('/ca-nhan')} onDaLuu={() => props.den('/ca-nhan')} />;
  }

  if (man.tab === 'sale') {
    // YC6.2 bước 1: CN7 (CN7-00 khi chưa có sale); thanh tab chỉ hiện ở danh sách.
    const dvSale = props.dichVuSale !== undefined ? props.dichVuSale
      : (props.dichVuCan as (DichVuCan & { sale?: DichVuSale }) | null)?.sale;
    return <CN7DanhSachSale dv={dvSale} thanhTab={<ThanhTabChu dangMo="sale" onChon={chonTab} />} />;
  }

  const dvSaleChung = props.dichVuSale !== undefined ? props.dichVuSale
    : (props.dichVuCan as (DichVuCan & { sale?: DichVuSale }) | null)?.sale;

  if (man.tab === 'lich' && guiLich && ds && ds.length > 0) {
    // YC6.6 bước 1 đến 5: CN10; căn theo thứ tự tab Lịch. Gửi xong về tab Lịch với toast (CN10-02).
    const dvLink = props.dichVuCan?.linkMoi;
    return (
      <CN10GuiLich ds={[...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan, soPhongNgu: c.soPhongNgu }))}
                   layDanhSachSale={dvSaleChung ? () => dvSaleChung.layDanhSach() : undefined}
                   guiLich={dvLink?.guiLich ? (ids) => dvLink.guiLich!(ids) : undefined}
                   onQuayLai={() => datGuiLich(false)}
                   onDaGui={() => { datGuiLich(false); hienToast(CAU_DA_GUI_LICH); }} />
    );
  }

  let than;
  if (man.tab === 'thong-ke') {
    // YC11.1 bước 1: CN8; màu căn theo thứ tự tab Lịch (căn thêm trước đứng trước), căn đã ẩn không có màu riêng.
    const theoLich = ds ? [...ds].reverse() : [];
    than = <CN8ThongKe dv={props.dichVuCan?.thongKe} boNho={boNhoThongKe.current}
                       mau={(canId) => { const i = theoLich.findIndex((c) => c.id === canId); return i < 0 ? undefined : mauCan(i); }} />;
  } else if (man.tab === 'ca-nhan') {
    // YC1.3 (US3): P1. Chạm dòng mở màn của dòng; màn chưa làm (US sau) báo tạm.
    const moDong = (khoa: KhoaDong) => {
      if (khoa === 'dem-cuoi-tuan') props.den('/ca-nhan/dem-cuoi-tuan'); // YC4.6: P6
      else if (khoa === 'ho-so') props.den('/ca-nhan/ho-so'); // YC1.4: P2
      else if (khoa === 'zalo') moLinkNgoai(LINK_ZALO_HOME247); // YC1.7 bước 4
      else hienToast(CAU_SE_CO);
    };
    than = <CaNhan vai="chu_nha" dv={props.dichVuCan?.caNhan} onMo={moDong} onDangXuat={props.onDangXuat} />;
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
                    onDatGiaNhieu={() => props.den('/can/gia-nhieu')} /> // YC4.1 bước 3, YC4.4 bước 1;
  } else if (xemTuan) {
    // YC2.5: CN2. Ô trống mở CN4 với căn và ngày (bước 23), thanh mở CN3-02. "Tháng" về CN1 tháng chứa thứ Hai của tuần.
    than = (
      <CN2LichTuan ds={[...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan, soPhongNgu: c.soPhongNgu, tenToa: c.tenToa }))}
                   dv={props.dichVuCan?.lich} ngayDau={xemTuan} onDoiTuan={datXemTuan}
                   onDatPhong={(c) => props.den(duongDanDatPhongMoi(c))}
                   onMoDatPhong={(id) => { chiTietTuLich.current = true; props.den(duongDanDatPhong(id)); }}
                   onXemThang={(t2) => { datXemTuan(null); datNgayVuaLuu(null); datThangTuTuan(t2); }} />
    );
  } else {
    // YC2.1: CN1, chạm ngày mở CN3 (YC2.2). Căn thêm trước đứng trước (danh sách đọc về căn mới trước).
    // YC5.1: "Đặt phòng" mở CN4. YC2.2 bước 9, YC2.4 bước 15, YC5.5: chạm dòng có khách (chi tiết ngày, đặt phòng sắp tới) mở CN3-02.
    // YC5 Quy tắc "Về màn đã mở": nhớ ô ngày vừa chạm (chi tiết ngày đang mở) để quay về lịch thì mở lại đúng ngày đó.
    than = (
      <div style={{ display: 'contents' }} onClickCapture={(e) => {
        const o = (e.target as Element).closest?.('[data-ngay]');
        const n = o?.getAttribute('data-ngay');
        if (n) ngayDangXem.current = n;
      }}>
        <CN1LichThang key={`${ngayVuaLuu ?? ''}|${thangTuTuan ?? ''}`} ngayMoSan={ngayVuaLuu ?? undefined}
                      thangDau={thangTuTuan ?? undefined} onXemTuan={(t2) => { datThangTuTuan(null); datXemTuan(t2); }}
                      onGuiLich={() => datGuiLich(true)}
                      yeuCau={yeuCau.ds} onMoYeuCau={datYeuCauMo}
                      ds={[...ds].reverse().map((c) => ({ id: c.id, maCan: c.maCan }))} dv={props.dichVuCan?.lich}
                      boNho={boNhoLich.current} onDatPhong={(c) => props.den(duongDanDatPhongMoi(c))}
                      onMoDatPhong={(id) => {
                        const ngay = ngayDangXem.current ?? ngayVuaLuu;
                        if (ngay) datNgayVuaLuu(ngay);
                        chiTietTuLich.current = true;
                        props.den(duongDanDatPhong(id));
                      }} />
      </div>
    );
  }

  return (
    <>
      {dangTai && ds !== undefined && canDanhSach && <div className="chu-cap-nhat"><DongDangCapNhat /></div>}
      {than}
      <ThanhTabChu dangMo={man.tab} onChon={chonTab} />
    </>
  );
}
