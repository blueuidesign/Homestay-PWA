// CN5-02 Sửa căn, tab Thông tin (YC3.5 bước 35 đến 41, YC3-H4, QT5.5, QT5.7, HV1, HV2, HV5, HV8).
// Dùng lại các mục của form Thêm căn: ô mã và số phòng ngủ (CN5A1ThemCan), Ảnh (MucAnhCan), phần thêm (MucThemCan).
// Tab Giá là CN6 (YC4), khung hai tab dùng chung KhungCan.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NutGhi, KhungXam, THOI_GIAN_CHO_LOI_MS } from '../chung/dangTai';
import { CAU_LOI_CHUNG, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { cauBoAnh } from '../lib/anh';
import { tenCanGiuaCau } from '../lib/can';
import { LoiKhongConCan, type CanSua, type SuaCan, type TaiAnh } from '../lib/dichVuCan';
import { CAU_MAT_MANG, docSoGiuong, kiemFormCan, oCuaCau, thayDoiCan, type GiaTriCan, type LoiCan, type OCan } from '../lib/kiemCan';
import type { DanhSachToa } from '../lib/toaNha';
import { choToiDa, LoiHetGio, laLoiMang, S_FORM_CAN as S, TheMaVaPhongNgu } from './CN5A1ThemCan';
import { KhungCan } from './CN6GiaCan';
import { MucAnhCan, useAnhCan } from './MucAnhCan';
import { MucThemCan, useDanhSachToa } from './MucThemCan';
import { Icon, ICON_THEM } from './TabChu';
import './CN502SuaCan.css';

/** HV5 bước 1. */
export const CAU_KHONG_CON = 'Bạn không còn xem được mục này';
/** YC3.5 bước 41. */
export const CAU_BO_THAY_DOI = 'Bỏ thay đổi chưa lưu?';

type Props = {
  canId: string;
  /** Tiêu đề khi chưa đọc xong căn (HV1, HV2): tên căn từ danh sách đã có, như "Phòng 1509". */
  tieuDeTam?: string;
  /** YC3.5 bước 35. Thiếu (chưa nối database) thì báo chưa tải được (HV2). */
  layCan?: (id: string) => Promise<CanSua | null>;
  /** YC3.5 bước 39. Thiếu thì bấm lưu báo như mất mạng. */
  suaCan?: (id: string, s: SuaCan) => Promise<void>;
  taiAnh?: TaiAnh;
  layToa?: () => Promise<DanhSachToa>;
  themToa?: (ten: string) => Promise<string>;
  /** YC3.5 bước 39: lưu được, mã căn sau khi sửa (đã bỏ khoảng trắng). */
  onDaLuu: (maCan: string) => void;
  onQuayLai: () => void;
  onChonGia: () => void;
  /** HV5 bước 1: nút "Về Lịch". */
  onVeLich: () => void;
};

/** YC3.5 bước 41, YC3-H4: hộp hỏi khi rời form đã sửa mà chưa lưu. */
function HoiBoThayDoi(props: { onBo: () => void; onOLai: () => void }) {
  return (
    <>
      <div className="cn502-man-toi" onClick={props.onOLai} aria-hidden="true" />
      <div className="cn502-hoi" role="alertdialog" aria-modal="true" aria-label={CAU_BO_THAY_DOI}>
        <p className="cn502-hoi-cau">{CAU_BO_THAY_DOI}</p>
        <div className="cn502-hoi-nut">
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onBo}>Bỏ thay đổi</button>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onOLai}>Ở lại</button>
        </div>
      </div>
    </>
  );
}

/** HV5 bước 1. */
function KhongCon(props: { onVeLich: () => void }) {
  return (
    <div className="cn502-khong-con" role="alert">
      <p className="cn502-khong-con-cau">{CAU_KHONG_CON}</p>
      <button type="button" className="hh-btn hh-btn--secondary" onClick={props.onVeLich}>Về Lịch</button>
    </div>
  );
}

export function CN502SuaCan(props: Props) {
  const [can, datCan] = useState<CanSua | null | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const { canId } = props;
  // Hàm đọc có thể là hàm mới mỗi lần màn cha vẽ lại: giữ trong ref để chỉ đọc lại khi đổi căn hay bấm Thử lại.
  const layCan = useRef(props.layCan);
  layCan.current = props.layCan;
  const tai = useCallback(async () => {
    datLoi(false);
    try {
      const doc = layCan.current;
      if (!doc) throw new TypeError('chưa nối database');
      datCan(await choToiDa(doc(canId), THOI_GIAN_CHO_LOI_MS));
    } catch {
      datLoi(true);
    }
  }, [canId]);
  useEffect(() => { void tai(); }, [tai]);

  if (can) return <FormSua key={can.id} can={can} {...props} />;
  const khung = (than: ReactNode) => (
    <KhungCan tieuDe={props.tieuDeTam ?? 'Căn'} tab="thong-tin" onQuayLai={props.onQuayLai} onChonTab={(t) => { if (t === 'gia') props.onChonGia(); }}>
      {than}
    </KhungCan>
  );
  if (can === null) return khung(<KhongCon onVeLich={props.onVeLich} />);
  return khung(loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />); // HV2, HV1
}

function FormSua(props: Props & { can: CanSua }) {
  const { can } = props;
  const hienToast = useToast();
  const [maCan, datMaCan] = useState(can.maCan);
  const [soPhongNgu, datSoPhongNgu] = useState<number | null>(can.soPhongNgu);
  const [toaNhaId, datToaNhaId] = useState<string | null>(can.toaNhaId);
  const [loaiView, datLoaiView] = useState<string | null>(can.loaiView);
  const [soGiuongChu, datSoGiuongChu] = useState(can.soGiuong == null ? '' : String(can.soGiuong));
  const [moTa, datMoTa] = useState(can.moTa ?? '');
  // CN5-02: phần thêm mở sẵn như canvas; Thu gọn chỉ ẩn, giữ giá trị.
  const [moRong, datMoRong] = useState(true);
  const dsToa = useDanhSachToa(props.layToa, moRong);
  const [loi, datLoi] = useState<LoiCan>({});
  const [cauDau, datCauDau] = useState<string | null>(null);
  const [khongCon, datKhongCon] = useState(false);
  const [hoi, datHoi] = useState<null | (() => void)>(null);
  const baoLoi = useCallback((cau: string) => hienToast(cau, 'loi'), [hienToast]); // HV8-NT4
  const anh = useAnhCan(props.taiAnh, baoLoi, can.anh); // YC3.5 bước 35, 36, 37
  const chonAnh = (files: File[]) => { const bo = anh.them(files); if (bo > 0) hienToast(cauBoAnh(bo)); };

  const sua = <T,>(o: OCan, dat: (v: T) => void) => (v: T) => { dat(v); datLoi((l) => ({ ...l, [o]: undefined })); };

  const dau = useMemo<GiaTriCan>(() => ({
    maCan: can.maCan, soPhongNgu: can.soPhongNgu, soGiuong: can.soGiuong, loaiView: can.loaiView,
    toaNhaId: can.toaNhaId, moTa: can.moTa, anh: can.anh.map((a) => a.id),
  }), [can]);
  const soGiuong = docSoGiuong(soGiuongChu);
  const nay: GiaTriCan = { maCan, soPhongNgu, soGiuong: Number.isNaN(soGiuong) ? null : soGiuong, loaiView, toaNhaId,
                           moTa, anh: anh.idDaTai };
  const thayDoi = thayDoiCan(dau, nay);
  // Ảnh đang tải, tải lỗi hay số giường gõ sai cũng là đã sửa (chưa nằm trong danh sách gửi đi).
  const daSua = Object.keys(thayDoi).length > 0 || anh.ds.some((o) => o.tt !== 'xong') || Number.isNaN(soGiuong);

  const loiPhanThem = kiemFormCan({ maCan: 'x', soPhongNgu: 0, soGiuong, moTa });
  const loiHien: LoiCan = { ...loi, soGiuong: loi.soGiuong ?? loiPhanThem.soGiuong, moTa: loi.moTa ?? loiPhanThem.moTa };

  /** YC3.5 bước 41: đã sửa mà chưa lưu thì hỏi trước khi rời form. */
  const roi = (di: () => void) => { if (daSua) datHoi(() => di); else di(); };

  const themToa = async (ten: string): Promise<string | null> => {
    try {
      if (!props.themToa) throw new LoiHetGio('chưa nối database');
      const id = await choToiDa(props.themToa(ten), THOI_GIAN_CHO_LOI_MS);
      const cu = dsToa.toa;
      if (cu && !cu.ds.some((t) => t.id === id)) dsToa.datToa({ ...cu, ds: [...cu.ds, { id, ten, khuVuc: null, home247: false }] });
      sua<string | null>('toaNha', datToaNhaId)(id);
      return null;
    } catch (e) {
      if (e instanceof LoiNguoiDung) return e.message;
      hienToast(laLoiMang(e) ? CAU_MAT_MANG : CAU_LOI_CHUNG, 'loi');
      return null;
    }
  };

  // YC3.5 bước 39, 40.
  const ghi = async () => {
    const l = kiemFormCan({ maCan, soPhongNgu, soGiuong, loaiView, moTa });
    if (Object.keys(l).length) {
      datLoi(l);
      if (l.soGiuong || l.moTa || l.loaiView) datMoRong(true);
      return;
    }
    if (anh.soDangTai > 0) return;
    // YC3.3-NT2: ảnh tải lỗi thì chưa lưu được; mục Ảnh đã có dòng cảnh báo và nút Thử lại.
    if (anh.soLoi > 0) return;
    datCauDau(null);
    try {
      if (!props.suaCan) throw new LoiHetGio('chưa nối database');
      await choToiDa(props.suaCan(can.id, thayDoi), THOI_GIAN_CHO_LOI_MS);
      props.onDaLuu(maCan.trim());
    } catch (e) {
      if (e instanceof LoiKhongConCan) { datKhongCon(true); return; } // HV5
      if (e instanceof LoiNguoiDung) {
        // YC3.5 bước 40: ở lại, giữ dữ liệu, câu lỗi dưới ô sai như bước 20.
        const o = oCuaCau(e.message);
        if (o) {
          if (o !== 'maCan' && o !== 'soPhongNgu') datMoRong(true);
          datLoi((cu) => ({ ...cu, [o]: e.message }));
        } else {
          datCauDau(e.message);
        }
      } else {
        hienToast(laLoiMang(e) ? CAU_MAT_MANG : CAU_LOI_CHUNG, 'loi'); // HV2, HV8-NT4
      }
    }
  };

  const tieuDe = `Sửa ${tenCanGiuaCau(can.maCan)}`;
  const khoaNut = anh.soDangTai > 0 || !!loiPhanThem.soGiuong || !!loiPhanThem.moTa;

  return (
    <KhungCan tieuDe={tieuDe} tab="thong-tin" onQuayLai={() => roi(props.onQuayLai)}
              onChonTab={(t) => { if (t === 'gia') roi(props.onChonGia); }}>
      {khongCon ? <KhongCon onVeLich={props.onVeLich} /> : (
        <div className="cn502-than">
          {cauDau && <div style={S.dai} role="alert"><span aria-hidden="true">⚠️</span><span>{cauDau}</span></div>}
          <TheMaVaPhongNgu maCan={maCan} onDoiMa={sua('maCan', datMaCan)} soPhongNgu={soPhongNgu}
                           onChonPhong={sua('soPhongNgu', datSoPhongNgu)} loi={loi} />
          <MucAnhCan ds={anh.ds} soDangTai={anh.soDangTai} soLoi={anh.soLoi}
                     onChon={chonAnh} onThuLai={anh.thuLai} onBo={anh.bo} onDoiCho={anh.doiCho} />
          {moRong ? (
            <MucThemCan toa={dsToa.toa} dangTaiToa={dsToa.dangTai} loiTaiToa={dsToa.loi} onTaiLaiToa={() => void dsToa.tai()}
                        toaNhaId={toaNhaId} onChonToa={sua('toaNha', datToaNhaId)} onThemToa={themToa}
                        loaiView={loaiView} onChonView={sua('loaiView', datLoaiView)}
                        soGiuong={soGiuongChu} onDoiSoGiuong={sua('soGiuong', datSoGiuongChu)}
                        moTa={moTa} onDoiMoTa={sua('moTa', datMoTa)} loi={loiHien} onThuGon={() => datMoRong(false)} />
          ) : (
            <button type="button" className="hh-btn hh-btn--text" style={{ justifyContent: 'flex-start', padding: 0 }}
                    aria-expanded={false} onClick={() => datMoRong(true)}>
              <Icon>{ICON_THEM}</Icon>Thêm tòa nhà, mô tả gửi khách, view...
            </button>
          )}
        </div>
      )}
      {!khongCon && (
        <div style={S.thanhDuoi}>
          <NutGhi chu="Lưu thay đổi" chuDangGhi="Đang lưu…" onGhi={ghi} disabled={khoaNut} />
        </div>
      )}
      {hoi && <HoiBoThayDoi onBo={() => { const di = hoi; datHoi(null); di(); }} onOLai={() => datHoi(null)} />}
    </KhungCan>
  );
}
