// Các tab của sale (YC7.1, canvas S1, A5: Lịch, Căn, Thống kê, Cá nhân). Không có tab "Tìm phòng" (YC7.1 bước 1, YC7.1-NT1).
// Tab Lịch: A5, A7 khi chưa có căn (YC6.4), S1 khi có căn (YC7.1). Căn, Thống kê, Cá nhân: khung tạm, US sau thay
// (Cá nhân giữ nút Đăng xuất). S1-05 xoay ngang thì ẩn thanh tab (YC7.1 bước 8). Tab nhớ trong phiên, địa chỉ vẫn là "/".
// YC7.2 (US44): ô "Tìm phòng trống theo ngày" ở S1 mở S1-02 toàn màn (không thanh tab), quay lại thì về S1.
import { useCallback, useState, type ReactNode } from 'react';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import { homNay } from '../lib/ngay';
import type { DichVuXinLich } from '../lib/dichVuXinLich';
import { ManLich } from './ManTam';
import { MoTimPhong } from './S1LichSale';
import { ManTimPhong } from './S102TimPhong';
import { Icon, ICON_LICH, KhungTabChu } from './TabChu';

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

const TIEU_DE_TAM: Record<Exclude<TabSaleTen, 'lich'>, string> = { can: 'Căn', 'thong-ke': 'Thống kê', 'ca-nhan': 'Cá nhân' };

export function ManSale(props: {
  ten?: string | null;
  /** YC6.4: link xin lịch và số đếm. Thiếu thì tab Lịch là bản tạm. */
  dv?: DichVuXinLich;
  /** YC7.1: lịch 7 ngày của sale. */
  dvLich?: DichVuLichSale & { timPhong?: DichVuTimPhong };
  /** YC7.2: tìm phòng. Thiếu thì dùng dvLich.timPhong; cả hai thiếu thì ô tìm không làm gì. */
  dvTim?: DichVuTimPhong;
  onDangXuat: () => void;
}) {
  const [tab, datTab] = useState<TabSaleTen>('lich');
  const [ngang, datNgang] = useState(false);
  const onXoay = useCallback((x: boolean) => datNgang(x), []);
  const dvTim = props.dvTim ?? props.dvLich?.timPhong;
  const [moTim, datMoTim] = useState(false);
  const mo = useCallback(() => datMoTim(true), []);

  if (moTim && dvTim) return <ManTimPhong dv={dvTim} homNay={homNay()} onQuayLai={() => datMoTim(false)} />;

  let than: ReactNode;
  if (tab === 'lich') {
    than = (
      <MoTimPhong.Provider value={dvTim ? mo : undefined}>
        <ManLich vai="sale" ten={props.ten} dv={props.dv} dvLich={props.dvLich} onDangXuat={props.onDangXuat} onXoay={onXoay} />
      </MoTimPhong.Provider>
    );
  } else {
    than = (
      <KhungTabChu tieuDe={TIEU_DE_TAM[tab]}>
        {tab === 'ca-nhan' ? (
          <>
            <p className="dong-phu">Sale</p>
            <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangXuat}>Đăng xuất</button>
          </>
        ) : <p className="dong-phu">Sẽ có ở bản sau</p>}
      </KhungTabChu>
    );
  }
  return (
    <>
      {than}
      {!(tab === 'lich' && ngang) && <ThanhTabSale dangMo={tab} onChon={(t) => { datNgang(false); datTab(t); }} />}
    </>
  );
}
