// A7 · Đã gửi, chờ chủ nhà; A7-00 · chưa gửi lần nào; A7-01 · sau khi chia sẻ (YC6.4 bước 4, 5, YC6.4-NT3, PQ18.SALE,
// YC6 quy tắc "Không biết gửi cho ai"). Chỉ hai con số, không có tên chủ nhà. "Thêm căn tự nhập" chờ US56.
import type { ReactNode } from 'react';
import { lucGuiGanNhat, type SoDemXinLich } from '../lib/dichVuXinLich';
import { KhungLichSale } from './A5ChuaCoNguon';
import { Icon, ICON_THEM } from './TabChu';
import './A5ChuaCoNguon.css';
import './A7ChoChuNha.css';

const ICON_CHO = <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></>;

function OSo(props: { so: string; nhan: string }) {
  return (
    <div className="a7-o" role="group" aria-label={`${props.so} ${props.nhan}`}>
      <span className="a7-so">{props.so}</span>
      <span className="a7-nhan">{props.nhan}</span>
    </div>
  );
}

export function A7ChoChuNha(props: {
  so: SoDemXinLich;
  /** A7-01: vừa chia sẻ hay sao chép xong. */
  vuaGui?: boolean;
  bayGio?: Date;
  onGuiLink: () => void;
  onThemCan: () => void;
  chan?: ReactNode;
}) {
  const { so } = props;
  const chuaGui = so.soLanGui === 0;
  return (
    <KhungLichSale chan={props.chan}>
      {props.vuaGui && !chuaGui && <p className="a7-dai" role="status">✓ Đã chia sẻ. Đang chờ chủ nhà đồng ý.</p>}
      <section className="xl-the" aria-label="Chờ chủ nhà">
        <div className="a7-tren">
          <span className="xl-tron xl-tron--cho" aria-hidden="true"><Icon co={20}>{ICON_CHO}</Icon></span>
          <div className="xl-chu">
            {chuaGui ? (
              <>
                <h2 className="xl-dong-dam">Chưa gửi link xin lịch</h2>
                <p className="xl-cau">Gửi tin xin lịch cho chủ nhà qua Zalo. Chủ nhà đồng ý là lịch hiện ở đây.</p>
              </>
            ) : (
              <>
                <h2 className="xl-dong-dam">Đang chờ chủ nhà đồng ý</h2>
                <p className="xl-cau">
                  {so.guiCuoiLuc ? `Lần gửi gần nhất lúc ${lucGuiGanNhat(so.guiCuoiLuc, props.bayGio)}. ` : ''}
                  Chủ nhà nào đồng ý, lịch của họ hiện ở đây và bạn nhận thông báo.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      <div className="a7-nhom">
        <p className="a7-muc">Link xin lịch của bạn</p>
        <div className="a7-hai-so">
          <OSo so={`${so.soLanGui} lần`} nhan="đã chia sẻ" />
          <OSo so={`${so.soChuDongY} chủ nhà`} nhan="đã đồng ý" />
        </div>
        <p className="a7-phu">
          Bạn gửi qua bảng chia sẻ của điện thoại nên app không biết bạn đã gửi cho ai. App chỉ đếm số lần bạn gửi và số chủ nhà đã đồng ý.
        </p>
      </div>
      {!chuaGui && <p className="a7-phu">Chủ nhà lâu chưa trả lời? Nhắn hoặc gọi để nhắc chủ mở link.</p>}
      {chuaGui ? (
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onGuiLink}>
          Gửi tin nhắn xin lịch cho chủ nhà
        </button>
      ) : (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onGuiLink}>
          Gửi link cho chủ nhà khác
        </button>
      )}
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onThemCan}>
        <Icon>{ICON_THEM}</Icon>Thêm căn tự nhập
      </button>
    </KhungLichSale>
  );
}
