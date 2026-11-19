// S5 · Gửi cho khách (YC8.1 bước 1 đến 7, US48). YC8 "Chỉ giá bán trong tin", "Chữ và ảnh gửi riêng", "Mẫu tin gửi khách",
// YC8-H1, H3, H6, PQ11.SALE, PQ12.SALE, HV1, HV2, HV3, HV6, HV8. Mỗi căn một khối: số thứ tự, tên, số ảnh, chữ do database soạn
// (fn_soan_tin_gui_khach), "Chia sẻ chữ", "Gửi N ảnh", "Sao chép chữ"; đáy "Sao chép chữ cả N căn" theo mẫu tin của sale.
// Mỗi lần bấm gửi ghi lần gửi (fn_ghi_lan_gui). Quay lại từ bảng chia sẻ: màn giữ nguyên (HV3), không đọc lại.
// KhungGuiKhach (đặt ở ManSale) mở S5 phủ lên màn đang xem và giữ màn dưới (S2 giữ căn đã chọn), S2, S3 gọi qua MoGuiKhach.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { guiAnh, guiChu, saoChepChu } from '../chung/chiaSe';
import { KhungXam } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { tieuDeCan } from '../lib/chiTietCanSale';
import type { DichVuGuiKhach } from '../lib/dichVuGuiKhach';
import {
  anhSeGui, CAU_DA_SAO_CHEP_NGAN, CAU_HOAC_SAO_CHEP, chuDauMan, chuNutAnh, chuNutSaoChepTatCa, chuSoAnh, tinCaNCan,
  type CanGuiKhach, type TinGuiKhach,
} from '../lib/guiKhach';
import type { Ngay } from '../lib/ngay';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './S5GuiKhach.css';

/** Căn (theo thứ tự trên màn mở S5) và khoảng ngày gửi. */
export type MoS5 = { canIds: string[]; tu: Ngay; den: Ngay };

/** YC8.1 bước 1: S2, S3 mở S5 qua hàm này; không có (chưa nối dịch vụ) thì nút giữ báo tạm. */
export const MoGuiKhach = createContext<((m: MoS5) => void) | undefined>(undefined);

/** YC8.1 bước 1: S5 phủ lên màn đang xem; màn dưới vẫn giữ trạng thái để "Quay lại" về đúng chỗ. */
export function KhungGuiKhach(props: { dv?: DichVuGuiKhach; children: ReactNode }) {
  const [mo, datMo] = useState<MoS5 | null>(null);
  const moS5 = useCallback((m: MoS5) => datMo(m), []);
  return (
    <MoGuiKhach.Provider value={props.dv ? moS5 : undefined}>
      <div style={{ display: mo ? 'none' : 'contents' }}>{props.children}</div>
      {mo && props.dv && <S5GuiKhach {...mo} dv={props.dv} onQuayLai={() => datMo(null)} />}
    </MoGuiKhach.Provider>
  );
}

/** YC8.1 bước 3 đến 6: một khối căn. */
function KhoiCan(props: { so: number; c: CanGuiKhach; onChiaSe: () => void; onAnh: () => void; onSaoChep: () => void; dangGuiAnh: boolean }) {
  const { c } = props;
  const ten = tieuDeCan(c);
  return (
    <section className="s5-khoi" aria-label={ten}>
      <div className="s5-dau-khoi">
        <span className="s5-so" aria-hidden="true">{props.so}</span>
        <span className="s5-ten">{ten}</span>
        <span className="s5-so-anh">{chuSoAnh(c.soAnh)}</span>
      </div>
      <div className="s5-chu" data-testid="chu-can">{c.chu}</div>
      {c.anh.length > 0 && (
        <div className="s5-anh">
          {anhSeGui(c.anh).map((u, i) => <img key={u} src={u} alt={`Ảnh ${i + 1}`} className="s5-anh-mot" loading="lazy" />)}
        </div>
      )}
      <div className="s5-hai-nut">
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onChiaSe}>Chia sẻ chữ</button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onAnh}
                disabled={c.anh.length === 0 || props.dangGuiAnh}>{chuNutAnh(c.anh.length ? c.soAnh : 0)}</button>
      </div>
      <div className="s5-giua">
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline s5-nut-chu" onClick={props.onSaoChep}>Sao chép chữ</button>
      </div>
    </section>
  );
}

/** YC8.1 bước 1 đến 7, YC8.1-NT1 đến NT5, NT12 đến NT15, HV6-NT2. */
export function S5GuiKhach(props: MoS5 & { dv: DichVuGuiKhach; onQuayLai: () => void }) {
  const { dv, canIds, tu, den } = props;
  const hienToast = useToast();
  const [tin, datTin] = useState<TinGuiKhach | undefined>(undefined);
  const [loi, datLoi] = useState<unknown>(null);
  const [dangGuiAnh, datDangGuiAnh] = useState<string | null>(null);
  const lan = useRef(0);
  const khoa = canIds.join(',');

  const doc = useCallback(async () => {
    const so = ++lan.current;
    datLoi(null);
    try {
      const t = await dv.soan(khoa ? khoa.split(',') : [], tu, den);
      if (so === lan.current) datTin(t);
    } catch (e) {
      if (so === lan.current) datLoi(e ?? new Error('lỗi'));
    }
  }, [dv, khoa, tu, den]);
  useEffect(() => { void doc(); }, [doc]);

  // YC8 "Báo căn đã gửi có người đặt": ghi lần gửi; lỗi ghi không chặn việc gửi của sale.
  const ghi = (ids: string[]) => { void dv.ghiLanGui(ids, tu, den).catch(() => undefined); };

  const chiaSe = async (c: CanGuiKhach) => {
    const kq = await guiChu(c.chu, hienToast);
    if (kq !== 'khong-lam-duoc') ghi([c.canId]);
  };
  const saoChep = async (c: CanGuiKhach) => {
    const kq = await saoChepChu(c.chu, CAU_DA_SAO_CHEP_NGAN, hienToast);
    if (kq !== 'khong-lam-duoc') ghi([c.canId]);
  };
  const anh = async (c: CanGuiKhach) => {
    datDangGuiAnh(c.canId);
    try {
      const files = await dv.taiAnh(anhSeGui(c.anh));
      const kq = await guiAnh(files, hienToast);
      if (kq !== 'khong-lam-duoc') ghi([c.canId]);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    } finally {
      datDangGuiAnh(null);
    }
  };
  const saoChepTatCa = async (t: TinGuiKhach) => {
    const kq = await saoChepChu(tinCaNCan(t), CAU_DA_SAO_CHEP_NGAN, hienToast);
    if (kq !== 'khong-lam-duoc') ghi(t.can.map((c) => c.canId));
  };

  let than: ReactNode;
  if (tin) {
    than = (
      <>
        <p className="s5-cau">{chuDauMan(tin.can.length, tin.tu, tin.den)}</p>
        {tin.can.map((c, i) => (
          <KhoiCan key={c.canId} so={i + 1} c={c} dangGuiAnh={dangGuiAnh === c.canId}
                   onChiaSe={() => void chiaSe(c)} onAnh={() => void anh(c)} onSaoChep={() => void saoChep(c)} />
        ))}
      </>
    );
  } else if (loi instanceof LoiNguoiDung) {
    than = <p className="s5-cau s5-loi" role="alert">{loi.message}</p>; // YC8.1-NT12, NT6
  } else if (loi) {
    than = <ManChuaTai onThuLai={() => void doc()} />; // HV2
  } else {
    than = <KhungXam />; // HV1
  }

  return (
    <div className="man man-chu s5" data-man="S5">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">Gửi cho khách</h1>
      </header>
      <div className="chu-than s5-than">{than}</div>
      {tin && tin.can.length > 0 && (
        <div className="s5-day">
          <span className="s5-phu">{CAU_HOAC_SAO_CHEP}</span>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => void saoChepTatCa(tin)}>
            {chuNutSaoChepTatCa(tin.can.length)}
          </button>
        </div>
      )}
    </div>
  );
}

/** YC8.1 bước 1: nút "Gửi cho khách" (S3) mở S5 cho các căn và khoảng ngày; chưa nối dịch vụ thì báo câu tạm. */
export function NutGuiKhach(props: MoS5 & { cauTam: string }) {
  const mo = useContext(MoGuiKhach);
  const hienToast = useToast();
  const { canIds, tu, den, cauTam } = props;
  return (
    <button type="button" className="hh-btn hh-btn--primary hh-btn--block"
            onClick={() => (mo ? mo({ canIds, tu, den }) : hienToast(cauTam))}>Gửi cho khách</button>
  );
}
