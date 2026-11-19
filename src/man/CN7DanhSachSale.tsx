// CN7 · Sale của tôi, CN7-00 · chưa có sale nào (YC6.2 bước 1 đến 4, 7, YC6 quy tắc "Nhóm kết nối", PQ17.CHU, PQ23.CHU, QD13).
// Đọc qua fn_ds_sale_cua_toi. Ba nhóm "Đã kết nối", "Chưa kết nối", "Đã ngừng" (YC6-H16); không có nút "Nhắc lại" (YC6-H13).
// Chạm dòng mở CN7-04 (CN704ChiTietSale); "Thêm sale" mở CN7-05 (CN705ThemSale). Sale đã xóa tài khoản: tên kèm chữ đỏ nhỏ
// "Đã xoá tài khoản", không số, không mở được, chỉ "Bỏ dòng" (YC6-H1). "Chia sẻ link mời", "Sao chép link", "Đổi link mời":
// YC6.3 bước 1, YC6-H10, pwa.md P3 (US37). Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV8 toast.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, ManChuaTai } from '../chung/matKetNoi';
import { CAU_DA_SAO_CHEP, CAU_THIEU_TINH_NANG, guiChu } from '../chung/chiaSe';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { chiaNhom, dongPhuSale, type DichVuSale, type DongSale } from '../lib/dichVuSale';
import { vietTien } from '../lib/tien';
import { CAU_HOI_DOI_LINK, duongDanLinkMoi, tinMoi } from '../lib/dichVuLinkMoi';
import { CN704ChiTietSale, chuDau, HoiLai } from './CN704ChiTietSale';
import { CN705ThemSale } from './CN705ThemSale';
import { Icon, ICON_THEM, KhungTabChu } from './TabChu';
import './CN7DanhSachSale.css';

/** Dịch vụ không có link mời (bản thử không nối database) thì báo tạm. */
export const CAU_LINK_SE_CO = 'Link mời sẽ có ở bản sau';

function MoiSale(props: { trong: boolean; onChiaSe: () => void; onSaoChep: () => void; onDoi?: () => void }) {
  return (
    <section className="cn7-the" aria-label="Mời sale">
      <div className="cn7-moi-chu">
        {props.trong ? (
          <>
            <h2 className="cn7-moi-tieu-de">Chưa có sale nào xem lịch</h2>
            <p className="cn7-moi-cau">Gửi link cho sale qua Zalo. Sale mở link là thấy ngày trống, không cần gọi hỏi bạn.</p>
          </>
        ) : (
          <>
            <h2 className="cn7-moi-tieu-de">Mời sale xem lịch</h2>
            <p className="cn7-moi-cau">Sale mở link là thấy phòng trống và giá của bạn, không cần gọi hỏi.</p>
          </>
        )}
      </div>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onChiaSe}>Chia sẻ link mời</button>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onSaoChep}>Sao chép link</button>
      {props.onDoi && <button type="button" className="hh-btn hh-btn--text" onClick={props.onDoi}>Đổi link mời</button>}
    </section>
  );
}

/** YC6.2 bước 2, QD7: sale thấy gì, không thấy gì. Không có công tắc tắt giá. */
function SaleSeThay() {
  return (
    <section className="cn7-the" aria-label="Sale sẽ thấy">
      <h2 className="cn7-muc">Sale sẽ thấy</h2>
      <ul className="cn7-thay">
        <li className="cn7-thay-co">Phòng trống hay đã đặt</li>
        <li className="cn7-thay-co">Giá từng đêm</li>
        <li className="cn7-thay-khong">Không thấy tên, số điện thoại khách và doanh thu</li>
      </ul>
    </section>
  );
}

function DongCN7(props: { d: DongSale; onMo: () => void; onBo: () => Promise<unknown> }) {
  const d = props.d;
  const tron = <span className={'cn7-tron' + (d.nhom === 'chua_ket_noi' ? ' cn7-tron--cho' : '')} aria-hidden="true">{chuDau(d.ten)}</span>;
  const coTien = d.loai === 'ket_noi';
  if (d.daXoaTaiKhoan) {
    // YC6.2 bước 7, YC6.2-NT7, PQ23.CHU: không số, không "Gọi", không mở được; bỏ dòng được.
    return (
      <li className="cn7-dong cn7-dong--xoa">
        {tron}
        <div className="cn7-nguoi-chu">
          <span className="cn7-ten">{d.ten}</span>
          <span className="cn7-da-xoa">Đã xoá tài khoản</span>
        </div>
        <NutGhi chu="Bỏ dòng" chuDangGhi="Đang bỏ…" lop="hh-btn hh-btn--text cn7-bo-dong" onGhi={props.onBo} />
      </li>
    );
  }
  return (
    <li>
      <button type="button" className="cn7-dong" onClick={props.onMo}>
        {tron}
        <span className="cn7-nguoi-chu">
          <span className="cn7-ten">{d.ten}</span>
          <span className="cn7-phu-chu">{dongPhuSale(d)}</span>
        </span>
        {coTien && <b className="cn7-tien">{vietTien(d.tongTienPhong)}</b>}
      </button>
    </li>
  );
}

function Nhom(props: { ten: string; ds: DongSale[]; onMo: (d: DongSale) => void; onBo: (d: DongSale) => Promise<unknown> }) {
  if (props.ds.length === 0) return null;
  const tieuDe = `${props.ten} · ${props.ds.length}`;
  return (
    <section className="cn7-nhom" aria-label={tieuDe}>
      <h2 className="cn7-muc">{tieuDe}</h2>
      <ul className="cn7-ds">
        {props.ds.map((d) => <DongCN7 key={d.id} d={d} onMo={() => props.onMo(d)} onBo={() => props.onBo(d)} />)}
      </ul>
    </section>
  );
}

export function CN7DanhSachSale(props: {
  dv?: DichVuSale | null;
  /** Thanh tab của chủ nhà; chỉ hiện ở CN7, không hiện ở CN7-04, CN7-05. */
  thanhTab?: ReactNode;
}) {
  const dv = props.dv ?? undefined;
  const hienToast = useToast();
  const [ds, datDs] = useState<DongSale[] | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [man, datMan] = useState<{ ten: 'ds' } | { ten: 'chi-tiet'; dong: DongSale } | { ten: 'them' }>({ ten: 'ds' });
  const [hoiDoiLink, datHoiDoiLink] = useState(false);

  const tai = useCallback(async () => {
    if (!dv) { datLoi(true); return; }
    datLoi(false);
    try {
      datDs(await dv.layDanhSach());
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); }); // HV3, YC6 Trạng thái màn: quay lại từ bảng chia sẻ hay từ nền thì đọc lại

  const veDanhSach = () => { datMan({ ten: 'ds' }); void tai(); };

  if (man.ten === 'them') {
    return (
      <CN705ThemSale themSaleTay={dv ? (ten, so) => dv.themSaleTay(ten, so) : undefined}
                     onQuayLai={() => datMan({ ten: 'ds' })}
                     onDaLuu={(ten) => { hienToast(`Đã thêm ${ten}`); veDanhSach(); }} />
    );
  }
  if (man.ten === 'chi-tiet') {
    return <CN704ChiTietSale dong={man.dong} dv={dv} onQuayLai={veDanhSach} onDaDoi={veDanhSach} />;
  }

  const boDong = async (d: DongSale) => {
    if (!dv) return;
    try {
      await dv.boDong(d.id);
      hienToast(`Đã bỏ ${d.ten} khỏi danh sách`);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    }
    await tai();
  };
  // YC6.3 bước 1: mỗi lần bấm lấy link (database tăng số lần gửi), link là https trên tên miền đang chạy app (pwa.md P4).
  const layLink = async (): Promise<string | null> => {
    if (!dv?.layLinkMoi) { hienToast(CAU_LINK_SE_CO); return null; }
    try {
      const { ma } = await dv.layLinkMoi();
      return duongDanLinkMoi(window.location.origin, ma);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      return null;
    }
  };
  const chiaSe = async () => {
    const link = await layLink();
    if (link) await guiChu(tinMoi(link), hienToast);
  };
  const saoChep = async () => {
    const link = await layLink();
    if (!link) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        hienToast(CAU_DA_SAO_CHEP);
        return;
      }
    } catch { /* xuống nhánh báo */ }
    hienToast(CAU_THIEU_TINH_NANG, 'loi');
  };
  const doiLink = async () => {
    if (!dv?.doiLinkMoi) return;
    try {
      await dv.doiLinkMoi();
      datHoiDoiLink(false);
      hienToast('Đã đổi link mời');
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    }
  };

  let than;
  if (ds === undefined) {
    than = loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />;
  } else {
    const n = chiaNhom(ds);
    const mo = (d: DongSale) => datMan({ ten: 'chi-tiet', dong: d });
    than = (
      <>
        <MoiSale trong={ds.length === 0} onChiaSe={() => void chiaSe()} onSaoChep={() => void saoChep()}
                 onDoi={dv?.doiLinkMoi ? () => datHoiDoiLink(true) : undefined} />
        {ds.length === 0 && <SaleSeThay />}
        <Nhom ten="Đã kết nối" ds={n.daKetNoi} onMo={mo} onBo={boDong} />
        <Nhom ten="Chưa kết nối" ds={n.chuaKetNoi} onMo={mo} onBo={boDong} />
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datMan({ ten: 'them' })}>
          <Icon>{ICON_THEM}</Icon>Thêm sale
        </button>
        <p className="cn7-phu-chu cn7-cau-them">Thêm tên và số điện thoại của sale chưa dùng app. Sale vào nhóm Chưa kết nối cho tới khi mở link.</p>
        <Nhom ten="Đã ngừng" ds={n.daNgung} onMo={mo} onBo={boDong} />
      </>
    );
  }

  return (
    <>
      <KhungTabChu tieuDe="Sale">{than}</KhungTabChu>
      {props.thanhTab}
      {hoiDoiLink && (
        <HoiLai cau={CAU_HOI_DOI_LINK} chuLam="Đổi link" chuDangLam="Đang đổi…" nhan="Đổi link mời"
                onLam={doiLink} onKhong={() => datHoiDoiLink(false)} />
      )}
    </>
  );
}
