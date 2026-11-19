// S2-00 · Không có căn trống (YC7.2 bước 6, YC7.2-NT3, US44). QT6.4, PQ4.SALE, HV1, HV2.
// Dòng điều kiện kèm "Sửa", câu đã kín, mục "GỢI Ý" mỗi dòng kèm số căn trống (database đếm, chỉ căn sale được xem), nút
// "Sửa tìm kiếm", ghi chú căn tự nhập. Chạm gợi ý thì tìm lại theo điều kiện của gợi ý.
import { DaiMatKetNoi } from '../chung/matKetNoi';
import {
  CAU_TU_NHAP_KHONG_LICH, cauKhongCoCan, chuGoiY, tieuDeKetQua, type DieuKienTim, type GoiY, type KetQuaTim,
} from '../lib/timPhong';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './S102TimPhong.css';

const ICON_SAU = <path d="m9 18 6-6-6-6" />;
const ICON_GOI_Y = <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" /></>;
const ICON_SUA = <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>;

export function S200KhongCoCan(props: {
  dieuKien: DieuKienTim;
  kq: KetQuaTim;
  tenToa: ReadonlyMap<string, string>;
  dangTim?: boolean;
  onQuayLai: () => void;
  onSua: () => void;
  onGoiY: (dk: DieuKienTim, g: GoiY) => void;
}) {
  const goiY = props.kq.goiY.filter((g) => g.soCan > 0);
  return (
    <div className="man man-chu tp">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{tieuDeKetQua(props.dieuKien)}</h1>
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={props.onSua}>Sửa</button>
      </header>
      <div className="tp-than tp-than--khong">
        <section className="tp-the">
          <h2 className="tp-lon">Không có căn trống</h2>
          <p className="tp-cau">{cauKhongCoCan(props.dieuKien, props.tenToa, goiY.length > 0)}</p>
        </section>
        {goiY.length > 0 && (
          <section aria-label="Gợi ý" className="tp-goi-y">
            <h2 className="tp-muc tp-muc--ngoai">Gợi ý</h2>
            <div className="tp-the tp-the--danh-sach">
              {goiY.map((g, i) => {
                const c = chuGoiY(g, props.dieuKien);
                return (
                  <button key={i} type="button" className="tp-dong-goi-y" disabled={props.dangTim}
                          onClick={() => props.onGoiY(g.dieuKien, g)}>
                    <span className="tp-icon-chinh"><Icon co={20}>{ICON_GOI_Y}</Icon></span>
                    <span className="tp-goi-y-chu">
                      <span className="tp-goi-y-chinh">{c.chinh}</span>
                      <span className="tp-phu">{c.phu}</span>
                    </span>
                    <span className="tp-icon-phu"><Icon co={16}>{ICON_SAU}</Icon></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onSua}>
          <Icon co={18}>{ICON_SUA}</Icon>Sửa tìm kiếm
        </button>
        <p className="tp-phu tp-ghi">{CAU_TU_NHAP_KHONG_LICH}</p>
      </div>
    </div>
  );
}
