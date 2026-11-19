// A4, A4-01 · Chủ nhà chưa có căn (YC3.1 bước 7, 8). A4-01 là A4 có dải xanh khi vừa cho một sale xem lịch (YC6).
import { Icon, ICON_LICH, ICON_THEM, ICON_TOI, KhungTabChu } from './TabChu';

export function A4ChuaCoCan(props: { onThemCan: () => void; tieuDe?: string; tenSaleVuaChoXem?: string }) {
  const sale = props.tenSaleVuaChoXem?.trim();
  return (
    <KhungTabChu
      tieuDe={props.tieuDe ?? 'Lịch'}
      dai={sale ? (
        <div className="a4-dai" role="status">✓ Bạn đã cho {sale} xem lịch. Thêm căn để {sale} thấy phòng trống.</div>
      ) : undefined}
    >
      <section className="the-chu a4-trong">
        <span className="a4-icon"><Icon co={32}>{ICON_LICH}</Icon></span>
        <span className="a4-tieu-de">Chưa có căn nào</span>
        <span className="a4-mo">Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống.</span>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onThemCan}>
          <Icon>{ICON_THEM}</Icon>Thêm căn đầu tiên
        </button>
      </section>
      <section className="the-chu a4-buoc">
        <span className="a4-nhan">3 bước để bắt đầu</span>
        <button type="button" className="a4-dong a4-dong--bam" onClick={props.onThemCan}>
          <span className="a4-so a4-so--on">1</span>
          <span className="a4-chu"><span className="a4-dong-ten">Thêm căn và ảnh</span>
            <span className="a4-dong-mo">Tòa nhà, số phòng ngủ, ảnh để sale gửi khách</span></span>
          <span className="a4-toi"><Icon>{ICON_TOI}</Icon></span>
        </button>
        <div className="a4-dong">
          <span className="a4-so">2</span>
          <span className="a4-chu"><span className="a4-dong-ten a4-dong-ten--mo">Đặt giá</span>
            <span className="a4-dong-mo">Ngày thường, cuối tuần, ngày lễ</span></span>
        </div>
        <div className="a4-dong a4-dong--cuoi">
          <span className="a4-so">3</span>
          <span className="a4-chu"><span className="a4-dong-ten a4-dong-ten--mo">Mời sale xem lịch</span>
            <span className="a4-dong-mo">Chia sẻ link</span></span>
        </div>
      </section>
      <p className="a4-meo">💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới.</p>
    </KhungTabChu>
  );
}
