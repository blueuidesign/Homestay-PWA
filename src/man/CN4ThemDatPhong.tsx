// CN4 · Thêm đặt phòng (YC5.1): chọn căn, ngày, số đêm, kiểm trùng sớm. PQ7.CHU, QT1.1, QT2.1.
// Trạng thái (YC5 Trạng thái màn): HV1 khung xám tại chỗ khi đọc căn, đặt phòng; HV2 dải mất mạng, vẫn nhập được;
// HV3 nháp trên máy, quay lại từ nền đọc lại đặt phòng và chạy lại dòng kiểm.
// US27 (YC5.2): hàng chip người đặt (CN4NguoiDat), tiền phòng và trạng thái tiền (CN4TienPhong, CN4-01), phần thêm chi
// tiết; nút "Thêm đặt phòng" gọi fn_tao_booking (YC5.3 bước 9), lưu được thì về tab Lịch với toast (bước 10).
// US28 (YC5.3 bước 11 tới 13, QT5.5, QT5.6, HV5): trùng đêm thì dòng kiểm đỏ và đọc lại đặt phòng; lỗi dữ liệu toast đỏ;
// mất mạng hay quá 15 giây thì toast mất mạng, bấm lại gửi cùng mã lần gửi; mất quyền với căn thì câu chung của HV5.
// HV7: hết phiên mà làm mới không được thì giữ nháp, đưa về đăng nhập, đăng nhập xong mở lại đúng form.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { CAU_KHOI_PHUC, useQuayLaiTuNen } from '../chung/nhap';
import { LoiHetPhien } from '../chung/phien';
import { useToast } from '../chung/Toast';
import {
  chipCuaSoDem, chipNguoiDat, demTrongDauTien, docBanNhapDatPhong, ghiBanNhapDatPhong, kiemNgay, loiTienCoc, loiTienPhong,
  ngayTraTheoSoDem, SO_DEM_TOI_DA, soDemGiua, tenNguoiDatToast, tomTatChiTiet, tongGiaDem, xoaBanNhapDatPhong,
  type ChipDem, type ChipNguoiDat, type GiaDem, type SaleKetNoi, type TrangThaiTienForm,
} from '../lib/datPhong';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import { CAU_MAT_MANG } from '../lib/kiemCan';
import { mauCan, type CanLich, type DatPhongLich } from '../lib/lich';
import { homNay as homNayVN, laNgay, type Ngay } from '../lib/ngay';
import { CN4NguoiDat } from './CN4NguoiDat';
import { CN4TienPhong } from './CN4TienPhong';
import { Icon } from './TabChu';
import './CN1LichThang.css';
import './CN4ThemDatPhong.css';

const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;
const CHIP_DEM: { gt: ChipDem; chu: string }[] = [
  { gt: 1, chu: '1 đêm' }, { gt: 2, chu: '2 đêm' }, { gt: 3, chu: '3 đêm' }, { gt: 'tuy-chon', chu: 'Tùy chọn' },
];

/** YC5.3 bước 11: câu database trả khi trùng đêm (QD6). */
export const CAU_TRUNG_DEM = 'Căn đã có đặt phòng trong những đêm này';
/** YC5 Trạng thái màn, HV5: căn bị ẩn hay chủ nhà mất quyền với căn trong lúc nhập. */
export const CAU_LOI_QUYEN = 'Có lỗi xảy ra. Bạn thử lại sau ít phút.';
/** YC5.3 bước 13, HV1-H1: quá 15 giây không có trả lời thì coi như mất mạng. */
export const THOI_GIAN_CHO_LUU_MS = 15000;

class LoiHetGio extends Error {}

function choToiDa<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((xong, hong) => {
    const hen = setTimeout(() => hong(new LoiHetGio('quá giờ')), ms);
    p.then((v) => { clearTimeout(hen); xong(v); }, (e) => { clearTimeout(hen); hong(e); });
  });
}

/** YC5.3 bước 13: lỗi không có mã của database (fetch hỏng, mất mạng, quá giờ) là lỗi mạng. */
function laLoiMang(e: unknown): boolean {
  if (e instanceof LoiHetGio || e instanceof TypeError) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const ma = (e as { code?: unknown } | null)?.code;
  return ma === undefined || ma === null || ma === '';
}

function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** YC5.1 bước 1a: đặt phòng chưa hủy các căn của chủ nhà. HV1 khung xám, HV2 lỗi thì Thử lại, HV3 đọc lại khi quay lại. */
function useDatPhong(dv: DichVuDatPhong | undefined, canIds: string[]) {
  const [ds, datDs] = useState<DatPhongLich[] | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);
  const khoa = canIds.join(',');
  const tai = useCallback(async () => {
    if (!khoa) return;
    const so = ++lan.current;
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const d = await dv.layDatPhong(khoa.split(','));
      if (so === lan.current) datDs(d);
    } catch {
      if (so === lan.current) datLoi(true);
    }
  }, [dv, khoa]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });
  useEffect(() => {
    const lai = () => { void tai(); };
    window.addEventListener('online', lai);
    return () => window.removeEventListener('online', lai);
  }, [tai]);
  return { ds, loi, tai };
}

export function CN4ThemDatPhong(props: {
  /** Căn có lịch, chưa ẩn của chủ nhà, theo thứ tự ở tab Lịch; undefined khi đang đọc. */
  ds: CanLich[] | undefined;
  dv: DichVuDatPhong | undefined;
  /** YC5.1 bước 1b: căn và ngày nhận khi mở từ dòng căn trống ở chi tiết ngày CN3. */
  canIdBanDau?: string;
  ngayBanDau?: Ngay;
  /** Hôm nay theo giờ Việt Nam; test truyền ngày cố định. */
  homNay?: Ngay;
  onDong: () => void;
  /** YC5.3 bước 10: lưu được; ManChu về tab Lịch với toast "Đã thêm đặt phòng <người đặt> · <căn>". */
  onDaLuu?: (v: { nguoiDat: string; maCan: string; canId: string; ngayNhan: Ngay }) => void;
  /** HV7 bước 2: làm mới phiên không được; nháp đã ghi, App đưa về đăng nhập rồi quay lại đúng địa chỉ này. */
  onHetPhien?: () => void;
}) {
  const hienToast = useToast();
  const homNay = props.homNay ?? homNayVN();
  // HV3 bước 3: mở lại form (không kèm căn, ngày từ CN3) có nháp thì điền lại. Mở từ CN3 thì theo căn, ngày đã chọn.
  const [dau] = useState(() => {
    const tuCN3 = !!props.canIdBanDau && !!props.ngayBanDau && laNgay(props.ngayBanDau);
    // HV7 bước 2: mở lại đúng địa chỉ từ CN3 sau khi đăng nhập lại thì nháp cùng căn, cùng ngày nhận vẫn được dùng.
    const docNhap = docBanNhapDatPhong();
    const nhap = !tuCN3 ? docNhap
      : docNhap && docNhap.canId === props.canIdBanDau && docNhap.ngayNhan === props.ngayBanDau ? docNhap : null;
    if (nhap) return { ...nhap, khoiPhuc: true };
    return {
      canId: tuCN3 ? props.canIdBanDau! : '',
      ngayNhan: tuCN3 ? props.ngayBanDau! : '',
      ngayTra: tuCN3 ? ngayTraTheoSoDem(props.ngayBanDau!, 1) : '',
      tuyChon: false, clientId: taoMaLanGui(), khoiPhuc: false,
    };
  });
  const [canId, datCanId] = useState(dau.canId);
  const [ngayNhan, datNgayNhan] = useState<string>(dau.ngayNhan);
  const [ngayTra, datNgayTra] = useState<string>(dau.ngayTra);
  const [tuyChon, datTuyChon] = useState(dau.tuyChon);
  const [moTra, datMoTra] = useState(dau.tuyChon);
  const [clientId] = useState(dau.clientId || taoMaLanGui());
  // YC5.3 bước 11: database từ chối vì trùng đêm; dòng kiểm đỏ tới khi đổi căn hay ngày.
  const [loiTrung, datLoiTrung] = useState(false);
  const daSua = useRef(dau.khoiPhuc);

  const canIds = (props.ds ?? []).map((c) => c.id);
  const { ds: datPhong, loi, tai } = useDatPhong(props.dv, canIds);

  // YC5.1 bước 1a: căn chọn sẵn là căn đầu tiên; căn trong nháp hay đường dẫn không còn (đã ẩn) thì cũng về căn đầu.
  const canDau = props.ds?.[0]?.id ?? '';
  const canHopLe = !!props.ds?.some((c) => c.id === canId);
  useEffect(() => { if (props.ds && !canHopLe && canDau) datCanId(canDau); }, [props.ds, canHopLe, canDau]);

  // YC5.1 bước 1a, YC5.1-NT4: ngày nhận điền sẵn là đêm trống đầu tiên của căn từ hôm nay, số đêm 1.
  // Chưa đọc được đặt phòng (HV2) thì điền hôm nay; dòng kiểm báo chưa tải được.
  useEffect(() => {
    if (ngayNhan || !canHopLe || (datPhong === undefined && !loi)) return;
    const nhan = datPhong ? demTrongDauTien(datPhong, canId, homNay) : homNay;
    datNgayNhan(nhan);
    datNgayTra(ngayTraTheoSoDem(nhan, 1));
  }, [ngayNhan, canHopLe, datPhong, loi, canId, homNay]);

  // HV3 bước 1: lưu nháp mỗi lần người dùng sửa.
  useEffect(() => {
    if (!daSua.current || !canId || !laNgay(ngayNhan) || !laNgay(ngayTra)) return;
    ghiBanNhapDatPhong({ canId, ngayNhan, ngayTra, tuyChon, clientId });
  }, [canId, ngayNhan, ngayTra, tuyChon, clientId]);

  const soDem = laNgay(ngayNhan) && laNgay(ngayTra) ? soDemGiua(ngayNhan, ngayTra) : null;
  const chipSang: ChipDem = tuyChon ? 'tuy-chon' : chipCuaSoDem(soDem);

  // YC5.1 bước 2: đổi căn giữ ngày; dòng kiểm tự chạy lại.
  const chonCan = (id: string) => { daSua.current = true; datLoiTrung(false); datCanId(id); };
  // YC5.1 bước 3: chip số đêm đặt ngày trả; "Tùy chọn" mở ô ngày trả.
  const chonDem = (c: ChipDem) => {
    daSua.current = true;
    datLoiTrung(false);
    if (c === 'tuy-chon') { datTuyChon(true); datMoTra(true); return; }
    datTuyChon(false);
    datMoTra(false);
    if (laNgay(ngayNhan)) datNgayTra(ngayTraTheoSoDem(ngayNhan, c));
  };
  // YC5.1 bước 3b: đổi ngày nhận giữ số đêm đang chọn, dời ngày trả theo.
  const doiNhan = (v: string) => {
    daSua.current = true;
    datLoiTrung(false);
    datNgayNhan(v);
    if (laNgay(v)) datNgayTra(ngayTraTheoSoDem(v, soDem && soDem > 0 ? soDem : 1));
  };
  // YC5.1 bước 3: đổi ngày trả bằng tay thì chip tương ứng tự sáng.
  const doiTra = (v: string) => { daSua.current = true; datLoiTrung(false); datTuyChon(false); datNgayTra(v); };
  // HV3 bước 5: bỏ form thì xóa nháp.
  const dong = () => { xoaBanNhapDatPhong(); props.onDong(); };

  const kiem = canHopLe && datPhong ? kiemNgay(datPhong, canId, ngayNhan, ngayTra) : null;

  // ===== YC5.2 · người đặt =====
  // Bước 5: sale đang kết nối và tên khách lẻ đã nhập, đọc một lần khi mở form. Lỗi thì chỉ còn "+ Sale mới", "Khách lẻ".
  const [nguoi, datNguoi] = useState<{ sale: SaleKetNoi[]; tenKhach: string[] } | undefined>(undefined);
  useEffect(() => {
    const lay = props.dv?.layNguoiDat;
    if (!lay) { datNguoi({ sale: [], tenKhach: [] }); return; }
    let huy = false;
    lay.call(props.dv).then((v) => { if (!huy) datNguoi(v); }, () => { if (!huy) datNguoi({ sale: [], tenKhach: [] }); });
    return () => { huy = true; };
  }, [props.dv]);
  const chips = nguoi && chipNguoiDat(nguoi.sale, nguoi.tenKhach);
  // Bước 5: chưa chip nào được chọn.
  const [chon, datChon] = useState<string | null>(null);
  const [tenKhach, datTenKhach] = useState('');
  const [sdtKhach, datSdtKhach] = useState('');
  const chipChon = chips?.find((c) => c.khoa === chon);
  const laKhachLe = chipChon?.loai === 'le' || chipChon?.loai === 'khach';
  const chonNguoi = (c: ChipNguoiDat) => {
    if (c.loai === 'sale-moi') { hienToast('Sẽ có ở bản sau'); return; } // YC6: thêm sale mới
    datChon(c.khoa);
    if (c.loai === 'le') datTenKhach(''); // bước 6: khách lẻ không tên
    if (c.loai === 'khach') datTenKhach(c.ten); // bước 6b: ô tên điền sẵn tên đã dùng
  };

  // ===== YC5.2 · tiền phòng (bước 7 tới 7d, QT4.1) =====
  const [giaDem, datGiaDem] = useState<GiaDem[] | undefined>(undefined);
  const [tien, datTien] = useState<number | null>(null);
  const demHopLe = canHopLe && soDem !== null && soDem >= 1 && soDem <= SO_DEM_TOI_DA;
  useEffect(() => {
    const lay = props.dv?.layGiaDem;
    if (!demHopLe || !lay) { datGiaDem([]); return; }
    let huy = false;
    datGiaDem(undefined);
    // Bước 7, 7c: điền sẵn tổng giá chủ nhà các đêm; đổi căn hay ngày thì điền lại, bỏ số đã gõ.
    lay.call(props.dv, canId, ngayNhan, ngayTra).then(
      (g) => { if (!huy) { datGiaDem(g); datTien(tongGiaDem(g)); } },
      () => { if (!huy) datGiaDem([]); },
    );
    return () => { huy = true; };
  }, [props.dv, demHopLe, canId, ngayNhan, ngayTra]);

  // ===== YC5.2 · trạng thái tiền (bước 8a, 8b; giả định GD19, GD20) =====
  const [trangThai, datTrangThai] = useState<TrangThaiTienForm>('chua_coc');
  const [coc, datCoc] = useState<number | null>(null);
  const doiTrangThai = (v: TrangThaiTienForm) => { datTrangThai(v); if (v !== 'da_coc_con_thu') datCoc(null); };

  // ===== YC5.2 · thêm chi tiết (bước 8c, YC5.2-NT10, NT11) =====
  const [moChiTiet, datMoChiTiet] = useState(false);
  const [daMoChiTiet, datDaMoChiTiet] = useState(false);
  const [soKhach, datSoKhach] = useState(1);
  const [gio, datGio] = useState({ gioNhan: '14:00', gioTra: '12:00' });
  const [ghiChu, datGhiChu] = useState('');
  useEffect(() => {
    const lay = props.dv?.layGioMacDinh;
    if (!lay) return;
    let huy = false;
    lay.call(props.dv).then((g) => { if (!huy) datGio(g); }, () => { /* giữ 14:00, 12:00 */ });
    return () => { huy = true; };
  }, [props.dv]);
  const doiChiTiet = () => { datMoChiTiet((m) => !m); datDaMoChiTiet(true); };

  // YC5.2-NT3, NT7, NT8, YC5.1 bước 4: chưa đủ thì nút không bấm được.
  const loiTien = giaDem === undefined ? null : loiTienPhong(tien);
  const loiCoc = loiTienCoc(trangThai, coc, tien);
  const coTheLuu = !!props.dv?.taoDatPhong && !loiTrung && kiem?.loai === 'khong-trung' && !!chipChon && chipChon.loai !== 'sale-moi'
    && giaDem !== undefined && !loiTienPhong(tien) && !loiCoc;

  // YC5.3 bước 9 tới 12: lưu; database từ chối thì ở lại form, toast đỏ là câu database trả về (QT5.5).
  const luu = async () => {
    const tao = props.dv?.taoDatPhong;
    if (!tao || !coTheLuu || !chipChon || tien === null) return;
    const sale = chipChon.loai === 'sale' ? chipChon : null;
    try {
      // YC5.3 bước 13, QT5.6: bấm lại sau mất mạng gửi cùng mã lần gửi (clientId giữ suốt form).
      await choToiDa(tao.call(props.dv, {
        canId, ngayNhan, ngayTra, tienPhong: tien, clientId,
        saleId: sale?.id ?? null,
        tenKhach: laKhachLe ? tenKhach.trim() || null : null,
        sdtKhach: laKhachLe ? sdtKhach.trim() || null : null,
        trangThaiTien: trangThai, tienCoc: trangThai === 'da_coc_con_thu' ? coc : null,
        soKhach: daMoChiTiet ? soKhach : null,
        gioNhan: daMoChiTiet ? gio.gioNhan : null, gioTra: daMoChiTiet ? gio.gioTra : null,
        ghiChu: ghiChu.trim() || null,
      }), THOI_GIAN_CHO_LUU_MS);
    } catch (e) {
      if (e instanceof LoiHetPhien) {
        // HV7 bước 2, HV7-NT2: giữ nội dung đang nhập (HV3) cùng mã lần gửi, rồi đưa về đăng nhập.
        ghiBanNhapDatPhong({ canId, ngayNhan, ngayTra, tuyChon, clientId });
        props.onHetPhien?.();
        return;
      }
      if (e instanceof LoiNguoiDung && e.message === CAU_TRUNG_DEM) {
        // Bước 11: ở lại form, dòng kiểm đỏ; đọc lại đặt phòng để dòng kiểm ở bước 4 đúng với dữ liệu mới.
        datLoiTrung(true);
        void tai();
      } else if (e instanceof LoiNguoiDung) {
        hienToast(e.message, 'loi'); // bước 12, QT5.5: nguyên câu database trả về
      } else if (laLoiMang(e)) {
        hienToast(CAU_MAT_MANG, 'loi'); // bước 13, HV8-NT4
      } else {
        hienToast(CAU_LOI_QUYEN, 'loi'); // YC5 Trạng thái màn, HV5: mất quyền với căn
        void tai();
      }
      return;
    }
    xoaBanNhapDatPhong(); // HV3 bước 5
    props.onDaLuu?.({
      nguoiDat: tenNguoiDatToast({ sale: sale?.chu ?? null, tenKhach: laKhachLe ? tenKhach : null }),
      maCan: props.ds?.find((c) => c.id === canId)?.maCan ?? '', canId, ngayNhan,
    });
  };

  let dongKiem;
  if (loiTrung) dongKiem = <p className="cn4-kiem cn4-kiem--do" role="alert">{CAU_TRUNG_DEM}</p>;
  else if (loi) dongKiem = <ManChuaTai onThuLai={() => void tai()} />;
  else if (!kiem) dongKiem = <KhungXam soDong={1} />;
  else if (kiem.loai === 'khong-trung') dongKiem = <p className="cn4-kiem">{kiem.chu}</p>;
  else if (kiem.loai !== 'chua-du') dongKiem = <p className="cn4-kiem cn4-kiem--do" role="alert">{kiem.chu}</p>;

  return (
    <div className="man cn4">
      <header className="cn4-dau">
        <h1 className="cn4-tieu-de">Thêm đặt phòng</h1>
        <button type="button" className="cn4-dong" aria-label="Đóng" onClick={dong}><Icon co={24}>{ICON_DONG}</Icon></button>
      </header>
      <DaiMatKetNoi />
      <div className="cn4-than">
        {dau.khoiPhuc && <p className="cn4-khoi-phuc" role="status">{CAU_KHOI_PHUC}</p>}

        <div className="cn4-muc">
          <span className="cn4-nhan" id="cn4-phong">Phòng</span>
          {props.ds === undefined ? <KhungXam soDong={1} /> : (
            <div className="cn4-chips" role="group" aria-labelledby="cn4-phong">
              {props.ds.map((c, i) => (
                <button key={c.id} type="button" aria-pressed={c.id === canId} style={{ '--mau-can': mauCan(i) } as CSSProperties}
                        className={'hh-chip cn1-chip' + (c.id === canId ? ' hh-chip--on' : '')} onClick={() => chonCan(c.id)}>
                  <span className="hh-chip__dot" aria-hidden="true" />{c.maCan}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cn4-dem" role="group" aria-label="Số đêm">
          {CHIP_DEM.map((c) => (
            <button key={c.chu} type="button" role="checkbox" aria-checked={chipSang === c.gt}
                    className={'hh-check' + (chipSang === c.gt ? ' hh-check--on' : '')} onClick={() => chonDem(c.gt)}>
              <span className="hh-check__box" aria-hidden="true" /><span>{c.chu}</span>
            </button>
          ))}
        </div>

        <div className="cn4-ngay">
          <label className="hh-field">
            <span className="hh-field__label">Ngày nhận phòng</span>
            <input type="date" className="hh-input" value={ngayNhan} onChange={(e) => doiNhan(e.target.value)} />
          </label>
          <label className="hh-field">
            <span className="hh-field__label">Ngày trả phòng</span>
            <input type="date" className="hh-input" value={ngayTra} disabled={!moTra}
                   min={laNgay(ngayNhan) ? ngayTraTheoSoDem(ngayNhan, 1) : undefined} onChange={(e) => doiTra(e.target.value)} />
          </label>
        </div>
        {/* YC5.1 bước 4: báo sớm; chặn thật ở database (QD6). */}
        <div className="cn4-dong-kiem">{dongKiem}</div>

        <CN4NguoiDat chips={chips} chon={chon} onChon={chonNguoi} ten={tenKhach} sdt={sdtKhach}
                     onTen={datTenKhach} onSdt={datSdtKhach} />

        <CN4TienPhong tien={tien} loiTien={loiTien} giaDem={giaDem} onTien={datTien}
                      trangThai={trangThai} onTrangThai={doiTrangThai} coc={coc} loiCoc={loiCoc} onCoc={datCoc} />

        <div className="cn4-chi-tiet">
          <div className="cn4-chi-tiet__dau">
            <button type="button" className="hh-btn hh-btn--text" aria-expanded={moChiTiet} onClick={doiChiTiet}>Thêm chi tiết</button>
            {!moChiTiet && <span className="cn4-tom-tat">{tomTatChiTiet(soKhach, gio.gioNhan, gio.gioTra, ghiChu)}</span>}
          </div>
          {moChiTiet && (
            <>
              <div className="cn4-so-khach" role="group" aria-label="Số khách">
                <span className="cn4-nhan">Số khách</span>
                <button type="button" className="hh-btn hh-btn--secondary" aria-label="Bớt một khách" disabled={soKhach <= 1}
                        onClick={() => datSoKhach((n) => Math.max(1, n - 1))}>−</button>
                <output aria-label="Số khách">{soKhach}</output>
                <button type="button" className="hh-btn hh-btn--secondary" aria-label="Thêm một khách" disabled={soKhach >= 99}
                        onClick={() => datSoKhach((n) => Math.min(99, n + 1))}>+</button>
              </div>
              <div className="cn4-gio">
                <label className="hh-field">
                  <span className="hh-field__label">Giờ nhận</span>
                  <input type="time" className="hh-input" value={gio.gioNhan} onChange={(e) => datGio((g) => ({ ...g, gioNhan: e.target.value }))} />
                </label>
                <label className="hh-field">
                  <span className="hh-field__label">Giờ trả</span>
                  <input type="time" className="hh-input" value={gio.gioTra} onChange={(e) => datGio((g) => ({ ...g, gioTra: e.target.value }))} />
                </label>
              </div>
              <label className="hh-field">
                <span className="hh-field__label">Ghi chú</span>
                <textarea className="hh-input" rows={3} maxLength={500} value={ghiChu} onChange={(e) => datGhiChu(e.target.value)} />
              </label>
            </>
          )}
        </div>
      </div>

      <div className="cn4-thanh-duoi">
        {/* YC5.2-NT3, NT7, NT8, YC5.1 bước 4: chưa chọn người đặt, thiếu tiền phòng, cọc quá tiền, trùng đêm thì không bấm được. */}
        <NutGhi chu="Thêm đặt phòng" disabled={!coTheLuu} onGhi={luu} />
      </div>
    </div>
  );
}
