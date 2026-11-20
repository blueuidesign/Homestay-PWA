// Các tab của sale (YC7.1, canvas S1, A5: Lịch, Căn, Thống kê, Cá nhân). Không có tab "Tìm phòng" (YC7.1 bước 1, YC7.1-NT1).
// Tab Lịch: A5, A7 khi chưa có căn (YC6.4), S1 khi có căn (YC7.1). Căn, Thống kê, Cá nhân: khung tạm, US sau thay
// (Cá nhân giữ nút Đăng xuất). S1-05 xoay ngang thì ẩn thanh tab (YC7.1 bước 8). Tab nhớ trong phiên, địa chỉ vẫn là "/".
// YC7.2 (US44): ô "Tìm phòng trống theo ngày" ở S1 mở S1-02 toàn màn (không thanh tab), quay lại thì về S1.
// YC7.4 (US46), YC7 "Chạm căn mở đâu": chạm căn ở S1 mở S3 (căn chủ nhà, ngày đầu đang xem, 1 đêm, YC7-H6), S6-07, S6-03 bản
// tạm, toàn màn. HV5 "Về Lịch" ở S3 (kể cả mở từ kết quả tìm) đóng mọi màn trên và về S1.
// YC8.1 (US48): "Gửi cho khách" ở S2, S3 mở S5 phủ lên màn đang xem (KhungGuiKhach), quay lại thì về đúng màn đó.
// YC9.1 (US50): S3-07 "Tìm căn khác cùng ngày" mở S1-02 (mở S3 từ S1).
// YC7.5 (US47): tab Cá nhân có dòng "Mức cộng giá mặc định" mở P10 toàn màn; lưu xong hay Quay lại thì về Cá nhân.
// YC8.2 (US49): dòng "Mẫu tin gửi khách" mở P11 toàn màn, cùng cách với P10.
// YC9.4 (US53): chạm căn tương tự ở S3-05, S3-09 (mở từ S1 hay từ tìm phòng) mở S3 của căn đó với ngày của yêu cầu; moKetQua (từ thông báo) mở
// S3-04-01, S3-05, S3-09, quay lại về Thông báo (onVeThongBao).
// YC10.1 (US54): tab Căn là S6, S6-00, S6-08 (S6TabCan). Chạm căn của tôi mở S6-07 thật (qua S6Tam, KhungCanCuaToi), căn chủ nhà
// mở S3 (hôm nay, 1 đêm), căn tự nhập mở S6-03 tạm, tên chủ nhà mở S6-04 tạm. "Gửi tin nhắn xin lịch cho chủ nhà" mở A6.
// S6-07 "Gửi cho khách" mở S5 (hôm nay, 1 đêm); "Đặt phòng", "Sửa căn và giá", "Thêm căn", "Thêm căn tự nhập" báo tạm.
// YC10.2 (US55): tên chủ nhà mở S6-04 thật (S604ChiTietChuNha); chạm căn ở S6-04 mở S3 (hôm nay, 1 đêm); bỏ nguồn xong về S6.
// YC10.3 (US56): "Thêm căn tự nhập" mở S6-02, thêm xong về S6 (tab Căn đọc lại). Căn tự nhập mở S6-03 thật (qua S6Tam,
// KhungCanTuNhap): "Gửi cho khách" mở S5 (hôm nay, 1 đêm), "Sửa thông tin căn" mở S6-02 điền sẵn (GD23), lưu xong về S6-03,
// xóa xong về S6; "Đặt phòng" mở S6-05, chạm đặt phòng mở form sửa, xóa (YC10.4, US57; dịch vụ canTuNhap.datPhong).
// YC11.2 (US59): tab Thống kê là S7, S7-00 (S7ThongKe, dịch vụ thongKeSale). "Tìm phòng" ở S7-00 mở S1-02 như ô tìm ở S1;
// YC11.3 (US60): chạm yêu cầu chờ ở S7 mở S3-03; "Xem tất cả đặt phòng và yêu cầu" mở S7-03 (S703DanhSach). Chạm yêu cầu ở
// S7-03 mở màn kết quả theo trạng thái, quay lại về S7-03; chạm đặt phòng (chi tiết phía sale, YC5.9) báo tạm tới US34.
import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useToast } from '../chung/Toast';
import { khoangTuLich, tieuDeCan } from '../lib/chiTietCanSale';
import { tenCanChuNha } from '../lib/chiTietChuNha';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import type { DichVuGuiKhach } from '../lib/dichVuGuiKhach';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DichVuMauTin } from '../lib/dichVuMauTin';
import type { DichVuMucCong } from '../lib/dichVuMucCong';
import { manKhiCham } from '../lib/ketQuaTim';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import type { DichVuYeuCau } from '../lib/dichVuYeuCau';
import { congNgay, homNay } from '../lib/ngay';
import type { DichVuTabCanSale } from '../lib/dichVuTabCanSale';
import type { ChiTietCanTuNhap, DichVuCanTuNhap } from '../lib/dichVuCanTuNhap';
import type { NhomChuNha } from '../lib/tabCanSale';
import type { DichVuXinLich } from '../lib/dichVuXinLich';
import type { DichVuThongKeSale } from '../lib/dichVuThongKeSale';
import type { ThongKeSale } from '../lib/thongKeSale';
import { A6XinLich } from './A6XinLich';
import { CAU_THEM_CAN_SE_CO, ManLich } from './ManTam';
import { P10MucCong } from './P10MucCong';
import { P11MauTin } from './P11MauTin';
import { MoCanSale, MoTimPhong } from './S1LichSale';
import { S3ChiTietCan, VeLichSale, type MoS3 } from './S3ChiTietCan';
import { MoCanTuongTu, S3KetQuaYeuCau } from './S3KetQuaYeuCau';
import type { CanTuongTu } from '../lib/ketQuaYeuCau';
import { KhungGuiKhach, MoGuiKhach } from './S5GuiKhach';
import { S607CanCuaToi } from './S607CanCuaToi';
import { S6TabCan, type ChamCanTab } from './S6TabCan';
import { KhungCanCuaToi, KhungCanTuNhap, S6Tam } from './S6Tam';
import { S602ThemCanTuNhap } from './S602ThemCanTuNhap';
import { S603CanTuNhap } from './S603CanTuNhap';
import { S604ChiTietChuNha } from './S604ChiTietChuNha';
import { ManTimPhong } from './S102TimPhong';
import { S7ThongKe } from './S7ThongKe';
import { S310DatPhongSale } from './S310DatPhongSale';
import { S703DanhSach } from './S703DanhSach';
import type { DichVuDanhSachSale } from '../lib/dichVuDanhSachSale';
import type { DichVuDatPhongSale } from '../lib/dichVuDatPhongSale';
import { Icon, ICON_LICH } from './TabChu';
import { CaNhan } from './CaNhan';
import { P2HoSo } from './P2HoSo';
import { P9HuongDan } from './P9HuongDan';
import { P3CaiDatThongBao } from './P3CaiDatThongBao';
import type { DichVuCaiDatThongBao } from '../lib/dichVuCaiDatThongBao';
import type { DichVuHoSo } from '../lib/dichVuHoSo';
import type { KhoaDong } from '../lib/caNhan';
import type { DichVuCaNhan } from '../lib/dichVuCaNhan';
import { LINK_ZALO_HOME247, moLinkNgoai } from '../lib/home247';

export type TabSaleTen = 'lich' | 'can' | 'thong-ke' | 'ca-nhan';

const ICON: Record<TabSaleTen, ReactNode> = {
  lich: ICON_LICH,
  can: <><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M15 3v6h6" /></>,
  'thong-ke': <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  'ca-nhan': <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
};

/** Canvas S1, A5: bốn tab của sale theo thứ tự. */
export const TAB_SALE: { ten: TabSaleTen; chu: string }[] = [
  { ten: 'lich', chu: 'Lịch' }, { ten: 'can', chu: 'Căn' }, { ten: 'thong-ke', chu: 'Thống kê' }, { ten: 'ca-nhan', chu: 'Cá nhân' },
];

export function ThanhTabSale(props: { dangMo: TabSaleTen; onChon: (t: TabSaleTen) => void }) {
  return (
    <nav className="hh-tabbar hh-tabbar--fixed" aria-label="Tab">
      {TAB_SALE.map((t) => (
        <button key={t.ten} type="button" className={t.ten === props.dangMo ? 'hh-tab hh-tab--on' : 'hh-tab'}
                aria-current={t.ten === props.dangMo ? 'page' : undefined} onClick={() => props.onChon(t.ten)}>
          <Icon co={22}>{ICON[t.ten]}</Icon>{t.chu}
        </button>
      ))}
    </nav>
  );
}

/** YC10.1: việc chưa có màn ở phía sale (US sau) báo tạm. */
export const CAU_SE_CO = 'Sẽ có ở bản sau';
export const CAU_THEM_CAN_CUA_TOI_SE_CO = 'Thêm căn của tôi sẽ có ở bản sau';

/** YC8.1: các tab của sale, bọc trong KhungGuiKhach để S2, S3 mở S5. */
export function ManSale(props: Parameters<typeof ManSaleTrong>[0]) {
  return <KhungGuiKhach dv={props.dvLich?.guiKhach}><ManSaleTrong {...props} /></KhungGuiKhach>;
}

function ManSaleTrong(props: {
  ten?: string | null;
  /** YC6.4: link xin lịch và số đếm. Thiếu thì tab Lịch là bản tạm. */
  dv?: DichVuXinLich;
  /** YC7.1: lịch 7 ngày của sale. */
  dvLich?: DichVuLichSale & { timPhong?: DichVuTimPhong; chiTietCan?: DichVuChiTietCanSale & { yeuCau?: DichVuYeuCau }; guiKhach?: DichVuGuiKhach; mucCong?: DichVuMucCong; mauTin?: DichVuMauTin; tabCan?: DichVuTabCanSale; canTuNhap?: DichVuCanTuNhap; thongKeSale?: DichVuThongKeSale; danhSachSale?: DichVuDanhSachSale; datPhongSale?: DichVuDatPhongSale };
  /** YC11.2: thống kê của sale (S7). Thiếu thì dùng dvLich.thongKeSale; cả hai thiếu thì tab báo chưa tải được. */
  dvThongKe?: DichVuThongKeSale;
  /** YC7.2: tìm phòng. Thiếu thì dùng dvLich.timPhong; cả hai thiếu thì ô tìm không làm gì. */
  dvTim?: DichVuTimPhong;
  /** YC7.5: mức cộng mặc định (P10). Thiếu thì dùng dvLich.mucCong. */
  dvMucCong?: DichVuMucCong;
  /** YC8.2: mẫu tin gửi khách (P11). Thiếu thì dùng dvLich.mauTin. */
  dvMauTin?: DichVuMauTin;
  /** YC1.3: tab Cá nhân (P4). Thiếu thì tab báo chưa tải được, vẫn đăng xuất được. */
  dvCaNhan?: DichVuCaNhan;
  /** YC1.4: hồ sơ (P2). */
  dvHoSo?: DichVuHoSo;
  /** YC12.4: cài đặt thông báo (P12). */
  dvCaiDatThongBao?: DichVuCaiDatThongBao;
  onDangXuat: () => void;
  /** YC9.4: chạm thông báo kết quả yêu cầu (manTuThongBao 'S3-KQ') thì mở màn kết quả của yêu cầu này. */
  moKetQua?: string;
  /** YC9.4 S3-04-01: quay lại về Thông báo. Thiếu thì về tab Lịch. */
  onVeThongBao?: () => void;
}) {
  const [tab, datTab] = useState<TabSaleTen>('lich');
  const [ngang, datNgang] = useState(false);
  const onXoay = useCallback((x: boolean) => datNgang(x), []);
  const dvTim = props.dvTim ?? props.dvLich?.timPhong;
  const [moTim, datMoTim] = useState(false);
  const mo = useCallback(() => datMoTim(true), []);
  const dvCt = props.dvLich?.chiTietCan ?? dvTim?.chiTietCan;
  const [moCan, datMoCan] = useState<{ s3: MoS3 } | { s6: 'S6-07' | 'S6-03'; ten: string; canId: string } | null>(null);
  const chamCan = useCallback((h: ChamCanTab, tu: string) => {
    const man = manKhiCham(h);
    if (man === 'S3') {
      if (dvCt) datMoCan({ s3: { canId: h.canId, tenTam: h.ten, ...khoangTuLich(tu) } });
    } else {
      datMoCan({ s6: man, ten: h.ten, canId: h.canId });
    }
  }, [dvCt]);
  const hienToast = useToast();
  const moGuiKhach = useContext(MoGuiKhach);
  const dvTab = props.dvLich?.tabCan;
  const [moChuNha, datMoChuNha] = useState<NhomChuNha | null>(null);
  const [moXinLich, datMoXinLich] = useState(false);
  // YC10.1 bước 7, YC10.1-NT5: S6-07 thật cho căn của tôi.
  const veCanCuaToi = useCallback((m: { canId: string; ten: string; onQuayLai: () => void }) => dvTab ? (
    <S607CanCuaToi canId={m.canId} tenTam={m.ten} dv={dvTab} homNay={homNay()} onQuayLai={m.onQuayLai}
                   onDatPhong={() => hienToast(CAU_SE_CO)} onSuaCan={() => hienToast(CAU_SE_CO)}
                   onGuiKhach={(c) => {
                     const nay = homNay();
                     if (moGuiKhach) moGuiKhach({ canIds: [c.canId], tu: nay, den: congNgay(nay, 1) });
                     else hienToast(CAU_SE_CO);
                   }} />
  ) : null, [dvTab, hienToast, moGuiKhach]);
  // YC10.3: S6-02 thêm (them) hay sửa (sua, điền sẵn); lanDoc đổi thì S6-03 đọc lại sau khi sửa.
  const dvTuNhap = props.dvLich?.canTuNhap;
  const [moTuNhap, datMoTuNhap] = useState<{ them: true } | { sua: ChiTietCanTuNhap } | null>(null);
  const [lanDoc, datLanDoc] = useState(0);
  const veCanTuNhap = useCallback((m: { canId: string; ten: string; onQuayLai: () => void }) => dvTuNhap ? (
    <S603CanTuNhap key={`${m.canId}|${lanDoc}`} canId={m.canId} tenTam={m.ten} dv={dvTuNhap} homNay={homNay()} onQuayLai={m.onQuayLai}
                   onDaXoa={m.onQuayLai} onSua={(c) => datMoTuNhap({ sua: c })} onDatPhong={() => hienToast(CAU_SE_CO)}
                   onGuiKhach={(c) => {
                     const nay = homNay();
                     if (moGuiKhach) moGuiKhach({ canIds: [c.canId], tu: nay, den: congNgay(nay, 1) });
                     else hienToast(CAU_SE_CO);
                   }} />
  ) : null, [dvTuNhap, lanDoc, hienToast, moGuiKhach]);
  const boNhoThongKe = useRef(new Map<string, ThongKeSale>()); // YC11.2, HV1-NT2: số đã xem giữ trong phiên
  const [moP10, datMoP10] = useState(false);
  const [moP11, datMoP11] = useState(false);
  const [moP2, datMoP2] = useState(false);
  const [moP9, datMoP9] = useState(false);
  const [moP12, datMoP12] = useState(false);
  const [ketQuaMo, datKetQuaMo] = useState<string | null>(props.moKetQua ?? null);
  useEffect(() => { if (props.moKetQua) datKetQuaMo(props.moKetQua); }, [props.moKetQua]);
  const veLich = useCallback(() => { datMoCan(null); datMoTim(false); datKetQuaMo(null); datTab('lich'); }, []);
  const moCanTuongTu = useCallback((c: CanTuongTu) => {
    datKetQuaMo(null);
    datMoCan({ s3: { canId: c.canId, tenTam: tieuDeCan(c), tu: c.tu, den: c.den, khachHoi: true } });
  }, []);

  // YC11.3: S7-03 và màn kết quả mở từ S7, S7-03 (tu: nơi quay lại).
  const [moDs, datMoDs] = useState(false);
  const [kqThongKe, datKqThongKe] = useState<string | null>(null);
  // YC5.9 (US34): chạm đặt phòng ở S7-03 mở chi tiết đặt phòng phía sale (S3-10).
  const [dpThongKe, datDpThongKe] = useState<{ id: string; tenTam: string } | null>(null);
  if (tab === 'thong-ke' && dpThongKe && !moCan && !moTim) {
    return (
      <S310DatPhongSale key={dpThongKe.id} id={dpThongKe.id} tenTam={dpThongKe.tenTam} dv={props.dvLich?.datPhongSale}
                        onQuayLai={() => datDpThongKe(null)} onVeLich={() => { datDpThongKe(null); datMoDs(false); veLich(); }} />
    );
  }
  if (tab === 'thong-ke' && kqThongKe && !moCan && !moTim) {
    return (
      <MoCanTuongTu.Provider value={dvCt ? moCanTuongTu : undefined}>
        <S3KetQuaYeuCau key={kqThongKe} id={kqThongKe} dv={props.dvLich?.chiTietCan?.yeuCau}
                        onQuayLai={() => datKqThongKe(null)} onVeLich={() => { datKqThongKe(null); datMoDs(false); veLich(); }}
                        onXemTatCa={dvTim ? () => { datKqThongKe(null); datMoTim(true); } : undefined} />
      </MoCanTuongTu.Provider>
    );
  }
  if (ketQuaMo && !moCan && !moTim) {
    const veThongBao = () => { datKetQuaMo(null); props.onVeThongBao?.(); };
    return (
      <MoCanTuongTu.Provider value={dvCt ? moCanTuongTu : undefined}>
        <S3KetQuaYeuCau key={ketQuaMo} id={ketQuaMo} dv={props.dvLich?.chiTietCan?.yeuCau} tuThongBao onQuayLai={veThongBao} onVeLich={veLich}
                        onXemTatCa={dvTim ? () => { datKetQuaMo(null); datMoTim(true); } : undefined} />
      </MoCanTuongTu.Provider>
    );
  }
  if (moCan && 's3' in moCan && dvCt) {
    return (
      <VeLichSale.Provider value={veLich}>
        <MoCanTuongTu.Provider value={moCanTuongTu}>
          <S3ChiTietCan key={`${moCan.s3.canId}|${moCan.s3.tu}|${moCan.s3.den}`} {...moCan.s3} dv={dvCt} homNay={homNay()}
                        onQuayLai={() => datMoCan(null)}
                        onTimCanKhac={dvTim ? () => { datMoCan(null); datMoTim(true); } : undefined} />
        </MoCanTuongTu.Provider>
      </VeLichSale.Provider>
    );
  }
  if (moP10) {
    const dong = () => { datMoP10(false); datTab('ca-nhan'); };
    return <P10MucCong dv={props.dvMucCong ?? props.dvLich?.mucCong} onQuayLai={dong} onDaLuu={dong} />;
  }
  if (moP12) {
    const dong = () => { datMoP12(false); datTab('ca-nhan'); };
    return <P3CaiDatThongBao vai="sale" dv={props.dvCaiDatThongBao} onQuayLai={dong} onDaLuu={dong} />;
  }
  if (moP9) {
    const dong = () => { datMoP9(false); datTab('ca-nhan'); };
    return <P9HuongDan vai="sale" onQuayLai={dong} />;
  }
  if (moP2) {
    const dong = () => { datMoP2(false); datTab('ca-nhan'); };
    return <P2HoSo dv={props.dvHoSo} onQuayLai={dong} />;
  }
  if (moP11) {
    const dong = () => { datMoP11(false); datTab('ca-nhan'); };
    return <P11MauTin dv={props.dvMauTin ?? props.dvLich?.mauTin} tenSale={props.ten} onQuayLai={dong} onDaLuu={dong} />;
  }
  if (moTuNhap) {
    const sua = 'sua' in moTuNhap ? moTuNhap.sua : undefined;
    return (
      <S602ThemCanTuNhap dv={dvTuNhap} dau={sua} onQuayLai={() => datMoTuNhap(null)}
                         onXong={() => { datMoTuNhap(null); if (sua) datLanDoc((n) => n + 1); else { datMoCan(null); datTab('can'); } }} />
    );
  }
  if (moCan && 's6' in moCan) {
    return (
      <KhungCanCuaToi.Provider value={dvTab ? veCanCuaToi : undefined}>
        <KhungCanTuNhap.Provider value={dvTuNhap ? veCanTuNhap : undefined}>
          <S6Tam man={moCan.s6} tenCan={moCan.ten} canId={moCan.canId} onQuayLai={() => datMoCan(null)} />
        </KhungCanTuNhap.Provider>
      </KhungCanCuaToi.Provider>
    );
  }
  if (moChuNha) {
    return (
      <S604ChiTietChuNha key={moChuNha.ketNoiId} ketNoiId={moChuNha.ketNoiId} tenTam={moChuNha.ten} dv={dvTab?.chiTietChuNha}
                         onQuayLai={() => datMoChuNha(null)} onDaBo={() => datMoChuNha(null)}
                         onChamCan={dvCt ? (c) => chamCan({ canId: c.canId, nhom: 'nguon', ten: tenCanChuNha(c) }, homNay()) : undefined} />
    );
  }
  if (moXinLich && props.dv) {
    return <A6XinLich ten={props.ten} dv={props.dv} onQuayLai={() => datMoXinLich(false)} onDaGui={() => datMoXinLich(false)} />;
  }
  if (moTim && dvTim) {
    return (
      <VeLichSale.Provider value={veLich}>
        <MoCanTuongTu.Provider value={dvCt ? moCanTuongTu : undefined}>
          <ManTimPhong dv={dvTim} homNay={homNay()} onQuayLai={() => datMoTim(false)} />
        </MoCanTuongTu.Provider>
      </VeLichSale.Provider>
    );
  }

  let than: ReactNode;
  if (tab === 'lich') {
    than = (
      <MoTimPhong.Provider value={dvTim ? mo : undefined}>
        <MoCanSale.Provider value={chamCan}>
          <ManLich vai="sale" ten={props.ten} dv={props.dv} dvLich={props.dvLich} onDangXuat={props.onDangXuat} onXoay={onXoay} />
        </MoCanSale.Provider>
      </MoTimPhong.Provider>
    );
  } else if (tab === 'can') {
    // YC10.1: căn chủ nhà mở S3 từ hôm nay, 1 đêm (như chạm ở S1 với ngày đầu là hôm nay).
    than = (
      <S6TabCan dv={dvTab} onCham={(h) => chamCan(h, homNay())} onMoChuNha={datMoChuNha}
                onThemCan={() => hienToast(CAU_THEM_CAN_CUA_TOI_SE_CO)} onThemTuNhap={() => (dvTuNhap ? datMoTuNhap({ them: true }) : hienToast(CAU_THEM_CAN_SE_CO))}
                onXinLich={() => (props.dv ? datMoXinLich(true) : hienToast(CAU_SE_CO))} />
    );
  } else if (tab === 'thong-ke') {
    than = (
      <S7ThongKe dv={props.dvThongKe ?? props.dvLich?.thongKeSale} boNho={boNhoThongKe.current}
                 onTimPhong={dvTim ? mo : undefined} onChoChu={(y) => datKqThongKe(y.yeuCauId)} onXemTatCa={() => datMoDs(true)} />
    );
    if (moDs) {
      than = (
        <S703DanhSach dv={props.dvLich?.danhSachSale} onQuayLai={() => datMoDs(false)} onTimPhong={dvTim ? mo : undefined}
                      onChamYeuCau={(d) => datKqThongKe(d.id)} onChamDatPhong={(d) => datDpThongKe({ id: d.id, tenTam: [d.tenToa, d.maCan].filter(Boolean).join(' ') })} />
      );
    }
  } else {
    // YC1.3 (US3): P4. Chạm dòng mở màn của dòng; màn chưa làm (US sau) báo tạm.
    const moDong = (khoa: KhoaDong) => {
      if (khoa === 'ho-so') datMoP2(true); // YC1.4
      else if (khoa === 'muc-cong') datMoP10(true); // YC7.5
      else if (khoa === 'mau-tin') datMoP11(true); // YC8.2
      else if (khoa === 'link-xin-lich') (props.dv ? datMoXinLich(true) : hienToast(CAU_SE_CO)); // YC6.4: A6
      else if (khoa === 'cai-dat-thong-bao') datMoP12(true); // YC12.4: P12
      else if (khoa === 'huong-dan') datMoP9(true); // YC1.7: P9
      else if (khoa === 'zalo') moLinkNgoai(LINK_ZALO_HOME247); // YC1.7 bước 4
      else hienToast(CAU_SE_CO);
    };
    than = <CaNhan vai="sale" dv={props.dvCaNhan} onMo={moDong} onDangXuat={props.onDangXuat} />;
  }
  return (
    <>
      {than}
      {!(tab === 'lich' && ngang) && <ThanhTabSale dangMo={tab} onChon={(t) => { datNgang(false); datMoDs(false); datKqThongKe(null); datDpThongKe(null); datTab(t); }} />}
    </>
  );
}
