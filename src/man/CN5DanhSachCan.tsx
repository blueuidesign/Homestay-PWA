// CN5 · Danh sách căn (YC3.1 bước 9 đến 14, GD14). Giá trên thẻ (YC4.1 bước 1, 2) và nút "Đặt giá nhiều căn" (YC4.1 bước 3).
import { canGoiYAnh, CAU_GOI_Y_ANH, chuGiaTuan, dongThongTin, tenCan, tinhTrangHomNay, type CanTomTat, type GiaTuan } from '../lib/can';
import { Icon, ICON_THEM, ICON_TOI, KhungTabChu } from './TabChu';

function TheCan(props: { c: CanTomTat; gia?: GiaTuan; onMo: () => void; onDatGia?: () => void }) {
  const { c, gia } = props;
  const chuGia = gia ? chuGiaTuan(gia) : null;
  const tt = tinhTrangHomNay(c);
  const dong = dongThongTin(c);
  return (
    <li className="cn5-muc">
      <button type="button" className="cn5-the" onClick={props.onMo} aria-label={tenCan(c.maCan)}>
        <span className="cn5-anh">
          {c.soAnh === 0 ? <span className="cn5-chua-anh">Chưa có ảnh</span> : (
            <>
              {c.anhDaiDien && <img src={c.anhDaiDien} alt="" loading="lazy" />}
              <span className="cn5-so-anh">{c.soAnh} ảnh</span>
            </>
          )}
          {c.moiThem && <span className="cn5-moi">Mới thêm</span>}
        </span>
        <span className="cn5-noi-dung">
          <span className="cn5-dau-the">
            <span className="cn5-ten">{tenCan(c.maCan)}</span>
            <span className="cn5-toi"><Icon>{ICON_TOI}</Icon></span>
          </span>
          {dong && <span className="cn5-dong">{dong}</span>}
          {chuGia && <span className="cn5-gia">{chuGia}</span>}
          {gia && !chuGia && <span className="cn5-gia cn5-gia--chua">Chưa đặt giá</span>}
          <span className={tt.co ? 'cn5-tinh-trang' : 'cn5-tinh-trang cn5-tinh-trang--trong'}>{tt.chu}</span>
          {canGoiYAnh(c.soAnh) && <span className="cn5-goi-y">💡 {CAU_GOI_Y_ANH}</span>}
        </span>
      </button>
      {gia && !chuGia && (
        <button type="button" className="hh-btn hh-btn--secondary cn5-dat-gia" onClick={props.onDatGia}>Đặt giá cho căn này</button>
      )}
    </li>
  );
}

/** vuaThem: vừa thêm căn (CN5-A4, CN5-A4b, YC3.2 bước 19) thì nút ghi "Thêm căn khác". */
/** giaTuan: giá tuần này theo mã căn (YC4.1); thiếu thì thẻ không ghi giá. */
export function CN5DanhSachCan(props: {
  ds: CanTomTat[]; onMoCan: (id: string) => void; onThemCan: () => void; vuaThem?: boolean;
  giaTuan?: Record<string, GiaTuan>; onDatGia?: (id: string) => void; onDatGiaNhieu?: () => void;
}) {
  return (
    <KhungTabChu tieuDe="Căn của tôi" phai={<span className="chu-dem">{props.ds.length} căn</span>}>
      <button type="button" className="hh-btn hh-btn--text cn5-gia-nhieu" onClick={props.onDatGiaNhieu}>Đặt giá nhiều căn</button>
      <ul className="cn5-ds">
        {props.ds.map((c) => (
          <TheCan key={c.id} c={c} gia={props.giaTuan?.[c.id]} onMo={() => props.onMoCan(c.id)} onDatGia={() => props.onDatGia?.(c.id)} />
        ))}
      </ul>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onThemCan}>
        <Icon>{ICON_THEM}</Icon>{props.vuaThem ? 'Thêm căn khác' : 'Thêm căn'}
      </button>
    </KhungTabChu>
  );
}
