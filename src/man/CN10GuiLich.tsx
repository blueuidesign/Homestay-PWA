// CN10 · Gửi lịch cho sale, CN10-00 · chưa có sale đã lưu, CN10-01 · đóng bảng chia sẻ mà chưa gửi (YC6.6, YC6-H8, H9, YC8-H5,
// PQ18.CHU, pwa.md P3). Bước 1 chọn căn (chưa chọn căn nào thì "Chia sẻ lịch" mờ); bước 2 chọn sale chỉ để nhắc mình gửi cho ai.
// "Chia sẻ lịch" tạo link gửi lịch mới qua fn_gui_lich rồi mở bảng chia sẻ; máy không có thì sao chép (HV6). Gửi xong: onDaGui
// (ManChu về tab Lịch với toast, CN10-02). Trạng thái: HV1 khung xám danh sách sale, HV2 toast lỗi, HV8 toast.
import { useEffect, useState } from 'react';
import { CAU_DA_SAO_CHEP, CAU_THIEU_TINH_NANG } from '../chung/chiaSe';
import { KhungXam } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { tenCan } from '../lib/can';
import { duongDanLinkMoi } from '../lib/dichVuLinkMoi';
import {
  CAU_CHON_IT_NHAT_MOT_CAN, CAU_CHUA_CO_SALE, CAU_CHUA_GUI, CAU_GIOI_THIEU_GUI_LICH, CAU_GUI_LICH_SE_CO, CAU_SALE_DA_LUU,
  chuDaChon, saleDeNhac, soAnGiua, tinGuiLich,
} from '../lib/dichVuGuiLich';
import type { DongSale } from '../lib/dichVuSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './CN4ThemDatPhong.css';
import './CN10GuiLich.css';

export type CanGuiLich = { id: string; maCan: string; soPhongNgu: number | null };

const ICON_DAU = <path d="M20 6 9 17l-5-5" />;

function O(props: { chon: boolean; chu: string; onDoi: () => void }) {
  return (
    <div className="cn10-o">
      <button type="button" role="checkbox" aria-checked={props.chon} className={props.chon ? 'hh-check hh-check--on' : 'hh-check'}
              onClick={props.onDoi}>
        <span className="hh-check__box cn10-hop" aria-hidden="true">{props.chon && <Icon co={13}>{ICON_DAU}</Icon>}</span>
        <span>{props.chu}</span>
      </button>
    </div>
  );
}

function DauBuoc(props: { so: number; ten: string; phu: string; nut?: { chu: string; onBam: () => void } }) {
  return (
    <div className="cn10-dau-buoc">
      <div className="cn10-buoc-chu">
        <div className="cn10-buoc-ten"><span className="cn10-so" aria-hidden="true">{props.so}</span><h2 className="cn10-ten">{props.ten}</h2></div>
        <span className="cn10-phu">{props.phu}</span>
      </div>
      {props.nut && <button type="button" className="hh-btn hh-btn--text hh-btn--inline cn10-nut-chu" onClick={props.nut.onBam}>{props.nut.chu}</button>}
    </div>
  );
}

export function CN10GuiLich(props: {
  /** Căn chưa xóa của chủ nhà, theo thứ tự tab Lịch. */
  ds: CanGuiLich[];
  /** YC6.6 bước 3: sale đã lưu ở tab Sale (fn_ds_sale_cua_toi). */
  layDanhSachSale?: () => Promise<DongSale[]>;
  /** YC6.6 bước 4: tạo link gửi lịch (fn_gui_lich). */
  guiLich?: (canIds: string[]) => Promise<{ ma: string }>;
  onQuayLai: () => void;
  /** YC6.6 bước 5: bảng chia sẻ đã gửi. */
  onDaGui: () => void;
}) {
  const hienToast = useToast();
  const [canChon, datCanChon] = useState<Set<string>>(() => new Set(props.ds.map((c) => c.id)));
  const [sale, datSale] = useState<DongSale[] | undefined>(props.layDanhSachSale ? undefined : []);
  const [saleChon, datSaleChon] = useState<Set<string>>(new Set());
  const [chuaGui, datChuaGui] = useState(false);
  const [dangGui, datDangGui] = useState(false);

  const laySale = props.layDanhSachSale;
  useEffect(() => {
    if (!laySale) return;
    let huy = false;
    laySale().then((ds) => { if (!huy) datSale(saleDeNhac(ds)); }, () => { if (!huy) datSale([]); });
    return () => { huy = true; };
  }, [laySale]);

  const doi = (tap: Set<string>, id: string) => { const m = new Set(tap); if (m.has(id)) m.delete(id); else m.add(id); return m; };
  const tatCaCan = canChon.size === props.ds.length && props.ds.length > 0;
  const soChon = props.ds.filter((c) => canChon.has(c.id)).length;
  const duocBam = soChon > 0 && !dangGui; // YC6.6 bước 2, YC6-H8, YC6.6-NT6

  const chiaSe = async () => {
    if (!duocBam) return;
    if (!props.guiLich) { hienToast(CAU_GUI_LICH_SE_CO); return; }
    datDangGui(true);
    datChuaGui(false);
    try {
      let link: string;
      try {
        const { ma } = await props.guiLich(props.ds.filter((c) => canChon.has(c.id)).map((c) => c.id));
        link = duongDanLinkMoi(window.location.origin, ma);
      } catch (e) {
        hienToast(cauBaoLoi(e), 'loi');
        return;
      }
      const tin = tinGuiLich(link);
      // pwa.md P3, HV6: bảng chia sẻ của máy; đóng mà không gửi (AbortError) thì CN10-01; máy không có thì sao chép.
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ text: tin });
          props.onDaGui();
          return;
        } catch (e) {
          if ((e as Error)?.name === 'AbortError') { datChuaGui(true); return; }
        }
      }
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(tin);
          hienToast(CAU_DA_SAO_CHEP);
          return;
        }
      } catch { /* xuống nhánh báo */ }
      hienToast(CAU_THIEU_TINH_NANG, 'loi');
    } finally {
      datDangGui(false);
    }
  };

  let dsSale;
  if (sale === undefined) dsSale = <KhungXam />;
  else if (sale.length === 0) dsSale = <p className="cn10-cau">{CAU_CHUA_CO_SALE}</p>; // CN10-00
  else {
    dsSale = sale.map((d) => {
      const so = soAnGiua(d.soDienThoai);
      return <O key={d.id} chon={saleChon.has(d.id)} chu={so ? `${d.ten} · ${so}` : d.ten} onDoi={() => datSaleChon((t) => doi(t, d.id))} />;
    });
  }
  const tatCaSale = !!sale && sale.length > 0 && sale.every((d) => saleChon.has(d.id));

  return (
    <div className="man cn10">
      <DaiMatKetNoi />
      <header className="cn10-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn10-tieu-de">Gửi lịch cho sale</h1>
      </header>
      {chuaGui && (
        <div className="cn10-chua-gui" role="status"><span aria-hidden="true">⚠️</span><span>{CAU_CHUA_GUI}</span></div>
      )}
      <div className="cn10-than">
        <p className="cn10-cau">{CAU_GIOI_THIEU_GUI_LICH}</p>
        <section className="cn10-the" aria-label="Bước 1: Chọn căn">
          <DauBuoc so={1} ten="Bước 1: Chọn căn" phu={chuDaChon(soChon, props.ds.length)}
                   nut={props.ds.length > 0 ? {
                     chu: tatCaCan ? 'Bỏ chọn' : 'Chọn tất cả',
                     onBam: () => datCanChon(tatCaCan ? new Set() : new Set(props.ds.map((c) => c.id))),
                   } : undefined} />
          {props.ds.map((c) => (
            <O key={c.id} chon={canChon.has(c.id)} chu={[tenCan(c.maCan), c.soPhongNgu ? `${c.soPhongNgu}PN` : null].filter(Boolean).join(' · ')}
               onDoi={() => datCanChon((t) => doi(t, c.id))} />
          ))}
        </section>
        <section className="cn10-the" aria-label="Bước 2: Chọn sale để chia sẻ lịch">
          <DauBuoc so={2} ten="Bước 2: Chọn sale để chia sẻ lịch" phu="Sale đã lưu · không bắt buộc"
                   nut={sale && sale.length > 0 ? {
                     chu: tatCaSale ? 'Bỏ chọn' : 'Chọn tất cả',
                     onBam: () => datSaleChon(tatCaSale ? new Set() : new Set(sale.map((d) => d.id))),
                   } : undefined} />
          {dsSale}
          <span className="cn10-phu">{CAU_SALE_DA_LUU}</span>
        </section>
      </div>
      <div className="cn10-day">
        <span className="cn10-phu cn10-giua">{soChon > 0 ? 'Điện thoại mở bảng chia sẻ để bạn chọn người nhận' : CAU_CHON_IT_NHAT_MOT_CAN}</span>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!duocBam} onClick={() => void chiaSe()}>Chia sẻ lịch</button>
      </div>
    </div>
  );
}
