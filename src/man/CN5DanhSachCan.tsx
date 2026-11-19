// CN5 · Danh sách căn (YC3.1 bước 9 đến 14, GD14). Giá trên thẻ và "Đặt giá nhiều căn" thuộc YC4, chưa làm ở đây.
import { canGoiYAnh, CAU_GOI_Y_ANH, dongThongTin, tenCan, tinhTrangHomNay, type CanTomTat } from '../lib/can';
import { Icon, ICON_THEM, ICON_TOI, KhungTabChu } from './TabChu';

function TheCan(props: { c: CanTomTat; onMo: () => void }) {
  const { c } = props;
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
          <span className={tt.co ? 'cn5-tinh-trang' : 'cn5-tinh-trang cn5-tinh-trang--trong'}>{tt.chu}</span>
          {canGoiYAnh(c.soAnh) && <span className="cn5-goi-y">💡 {CAU_GOI_Y_ANH}</span>}
        </span>
      </button>
    </li>
  );
}

export function CN5DanhSachCan(props: { ds: CanTomTat[]; onMoCan: (id: string) => void; onThemCan: () => void }) {
  return (
    <KhungTabChu tieuDe="Căn của tôi" phai={<span className="chu-dem">{props.ds.length} căn</span>}>
      <ul className="cn5-ds">
        {props.ds.map((c) => <TheCan key={c.id} c={c} onMo={() => props.onMoCan(c.id)} />)}
      </ul>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onThemCan}>
        <Icon>{ICON_THEM}</Icon>Thêm căn
      </button>
    </KhungTabChu>
  );
}
