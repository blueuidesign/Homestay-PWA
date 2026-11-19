// Thanh tab dưới cùng của chủ nhà (canvas A4, CN5: Lịch, Căn, Sale, Thống kê, Cá nhân). Vùng bấm 44 px.
import type { ReactNode } from 'react';
import { DaiMatKetNoi } from '../chung/matKetNoi';

export type TabChuTen = 'lich' | 'can' | 'sale' | 'thong-ke' | 'ca-nhan';

const ICON: Record<TabChuTen, ReactNode> = {
  lich: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
  can: <><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M15 3v6h6" /></>,
  sale: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  'thong-ke': <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  'ca-nhan': <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
};

const TAB: { ten: TabChuTen; chu: string }[] = [
  { ten: 'lich', chu: 'Lịch' }, { ten: 'can', chu: 'Căn' }, { ten: 'sale', chu: 'Sale' },
  { ten: 'thong-ke', chu: 'Thống kê' }, { ten: 'ca-nhan', chu: 'Cá nhân' },
];

export function Icon(props: { co?: number; children: ReactNode }) {
  const co = props.co ?? 16;
  return (
    <svg className="hh-icon" width={co} height={co} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{props.children}</svg>
  );
}

export const ICON_THEM = <><path d="M5 12h14" /><path d="M12 5v14" /></>;
export const ICON_TOI = <path d="m9 18 6-6-6-6" />;
export const ICON_LICH = ICON.lich;

export function ThanhTabChu(props: { dangMo: TabChuTen; onChon: (t: TabChuTen) => void }) {
  return (
    <nav className="hh-tabbar hh-tabbar--fixed" aria-label="Tab">
      {TAB.map((t) => (
        <button key={t.ten} type="button" className={t.ten === props.dangMo ? 'hh-tab hh-tab--on' : 'hh-tab'}
                aria-current={t.ten === props.dangMo ? 'page' : undefined} onClick={() => props.onChon(t.ten)}>
          <Icon co={22}>{ICON[t.ten]}</Icon>{t.chu}
        </button>
      ))}
    </nav>
  );
}

/** Khung một màn có tab của chủ nhà: tiêu đề, phần phụ bên phải, dải dưới tiêu đề, thân cuộn. */
export function KhungTabChu(props: { tieuDe: string; phai?: ReactNode; dai?: ReactNode; children: ReactNode }) {
  return (
    <div className="man man-chu">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <h1 className="chu-tieu-de">{props.tieuDe}</h1>
        {props.phai}
      </header>
      {props.dai}
      <div className="chu-than">{props.children}</div>
    </div>
  );
}
