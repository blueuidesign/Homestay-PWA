// A6 · Soạn tin xin link (YC6.4 bước 1 đến 3, PQ18.SALE, pwa.md P3, P4, HV1, HV2, HV6, HV8).
// Mở màn thì lấy link (database tạo nếu chưa có, chưa tính là đã gửi). "Chia sẻ" mở bảng chia sẻ ngay trong lần bấm
// (máy không có thì sao chép, HV6), "Sao chép tin nhắn" sao chép tin; mỗi lần làm được ghi một lần gửi rồi về A7-01.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { ManChuaTai } from '../chung/matKetNoi';
import { CAU_DA_SAO_CHEP, CAU_THIEU_TINH_NANG, guiChu } from '../chung/chiaSe';
import { useToast } from '../chung/Toast';
import { duongDanLinkXinLich, tinXinLich, type DichVuXinLich } from '../lib/dichVuXinLich';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './A6XinLich.css';

const BUOC: [string, string][] = [
  ['Chủ nhà mở link trong Zalo', 'Chủ chưa dùng app sẽ tạo tài khoản bằng email trước'],
  ['Chủ nhà bấm "Đồng ý cho xem lịch"', 'Bạn nhận thông báo ngay'],
  ['Lịch của chủ hiện trong Nguồn phòng', 'Tìm phòng trống được ngay'],
];

export function A6XinLich(props: {
  ten: string | null | undefined;
  dv: Pick<DichVuXinLich, 'layLink' | 'ghiLanGui'>;
  onQuayLai: () => void;
  onDaGui: () => void;
}) {
  const { dv, onDaGui } = props;
  const hienToast = useToast();
  const [link, datLink] = useState<string | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [dangGui, datDangGui] = useState(false);

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      datLink(duongDanLinkXinLich(window.location.origin, await dv.layLink()));
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);

  const tin = link ? tinXinLich(props.ten, link) : '';

  // YC6.4-NT2: ghi một lần gửi; ghi không được (mất mạng) vẫn về A7, số đọc lại khi có mạng (HV3).
  const ghi = async () => {
    await dv.ghiLanGui().catch(() => undefined);
    onDaGui();
  };

  const chiaSe = async () => {
    if (!tin || dangGui) return;
    datDangGui(true);
    try {
      const kq = await guiChu(tin, (s) => hienToast(s, s === CAU_THIEU_TINH_NANG ? 'loi' : undefined));
      if (kq !== 'khong-lam-duoc') await ghi();
    } finally {
      datDangGui(false);
    }
  };

  const saoChep = async () => {
    if (!tin || dangGui) return;
    datDangGui(true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tin);
        hienToast(CAU_DA_SAO_CHEP);
        await ghi();
        return;
      }
      hienToast(CAU_THIEU_TINH_NANG, 'loi');
    } catch {
      hienToast(CAU_THIEU_TINH_NANG, 'loi');
    } finally {
      datDangGui(false);
    }
  };

  let than;
  if (!link) {
    than = loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />;
  } else {
    const [dau] = tin.split('\n');
    than = (
      <>
        <section className="a6-the" aria-label="Tin nhắn sẽ gửi">
          <h2 className="a6-muc">Tin nhắn sẽ gửi</h2>
          <p className="a6-tin">{dau}{'\n'}<span className="a6-link">{link}</span></p>
          <p className="a6-phu">Một link dùng được cho nhiều chủ nhà.</p>
        </section>
        <section className="a6-the" aria-label="Sau khi gửi">
          <h2 className="a6-muc">Sau khi gửi</h2>
          <ol className="a6-buoc">
            {BUOC.map(([dam, phu], i) => (
              <li key={dam}>
                <span className="a6-so" aria-hidden="true">{i + 1}</span>
                <span className="a6-buoc-chu"><span className="a6-buoc-dam">{dam}</span><span className="a6-phu">{phu}</span></span>
              </li>
            ))}
          </ol>
        </section>
      </>
    );
  }

  return (
    <div className="man man-chu">
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">Xin chủ nhà cho xem lịch</h1>
      </header>
      <div className="a6-than">
        <p className="a6-cau">Gửi tin này cho chủ nhà qua Zalo. Chủ nhà bấm link và đồng ý là bạn thấy lịch phòng trống.</p>
        {than}
      </div>
      <div className="a6-chan">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!link || dangGui} onClick={() => void chiaSe()}>
          Chia sẻ
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={!link || dangGui} onClick={() => void saoChep()}>
          Sao chép tin nhắn
        </button>
      </div>
    </div>
  );
}
