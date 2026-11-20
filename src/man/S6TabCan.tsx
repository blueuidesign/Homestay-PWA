// S6 · Tab Căn của sale, S6-00 · chưa có căn nào, S6-08 · chủ nhà đã xóa tài khoản (YC10.1 bước 1 đến 11, YC10 "Quy tắc của
// nhóm", QT6.4, PQ2.SALE, PQ3.SALE, PQ13, PQ14.SALE, PQ17.SALE, PQ23.SALE, QD13). Đọc qua fn_tab_can_sale.
// Chạm căn của tôi mở S6-07, căn chủ nhà mở S3, căn tự nhập mở S6-03, tên chủ nhà mở S6-04 (ManSale nối).
// "Chia sẻ lời mời": bảng chia sẻ của máy, không có thì sao chép (pwa.md P3, HV6). "Bỏ khỏi danh sách": dòng biến ngay,
// không hỏi lại. Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV8 toast.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam } from '../chung/dangTai';
import { CAU_THIEU_TINH_NANG, guiChu } from '../chung/chiaSe';
import { cauBaoLoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuTabCanSale } from '../lib/dichVuTabCanSale';
import {
  cauMoiChuCan, chuCaiDau, chuCapNhat, soChuNha, tabTrong, tinMoiDungApp,
  type NhomChuNha, type TabCan, type TheCanTab,
} from '../lib/tabCanSale';
import { Icon, ICON_THEM, ICON_TOI, KhungTabChu } from './TabChu';
import './S6TabCan.css';

export type ChamCanTab = { canId: string; nhom: 'cua_toi' | 'nguon' | 'tu_nhap'; ten: string };

const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />;

function Anh(props: { url: string | null }) {
  return props.url
    ? <img className="s6-anh" src={props.url} alt="" />
    : <span className="s6-anh s6-anh--trong" aria-hidden="true" />;
}

function DongCan(props: { c: TheCanTab; phai?: ReactNode; onCham: () => void }) {
  return (
    <li>
      <button type="button" className="s6-can" aria-label={props.c.ten} onClick={props.onCham}>
        <Anh url={props.c.anh} />
        <span className="s6-can-chu">
          <span className="s6-can-ten">{props.c.ten}</span>
          <span className="s6-can-phu">{props.c.phu}</span>
        </span>
        {props.phai}
        <span className="s6-toi"><Icon co={16}>{ICON_TOI}</Icon></span>
      </button>
    </li>
  );
}

/** YC10.1 bước 2, 5, 6, 9, 10, S6-08. */
function ChuNha(props: { n: NhomChuNha; onMoChu: () => void; onCham: (c: TheCanTab) => void; onBo: () => void }) {
  const n = props.n;
  if (n.daXoa) {
    // YC10.1-NT7, QD13: tên cũ và nhãn đỏ, không số, không căn, không "Cập nhật"; chạm không mở gì.
    return (
      <section className="s6-the s6-chu s6-chu--xoa" aria-label={n.ten}>
        <div className="s6-chu-dau">
          <span className="s6-tron s6-tron--xoa" aria-hidden="true">{chuCaiDau(n.ten)}</span>
          <span className="s6-chu-chu">
            <span className="s6-can-ten">{n.ten}<span className="s6-da-xoa">đã xóa tài khoản</span></span>
            <span className="s6-chu-phu">Căn và lịch không còn trên app</span>
          </span>
        </div>
        <div className="s6-bo">
          <button type="button" className="s6-bo-nut" onClick={props.onBo}>Bỏ khỏi danh sách</button>
        </div>
      </section>
    );
  }
  const capNhat = chuCapNhat(n.capNhat);
  return (
    <section className="s6-the s6-chu" aria-label={n.ten}>
      <div className="s6-chu-dau">
        <button type="button" className="s6-chu-mo" onClick={props.onMoChu}>
          <span className="s6-tron" aria-hidden="true">{chuCaiDau(n.ten)}</span>
          <span className="s6-chu-chu">
            <span className="s6-can-ten">{n.ten}</span>
            {capNhat && <span className="s6-cap-nhat">{capNhat}</span>}
          </span>
        </button>
        {n.soDienThoai && (
          <a className="hh-iconbtn s6-goi" href={`tel:${n.soDienThoai}`} aria-label="Gọi chủ nhà" title="Gọi chủ nhà">
            <Icon co={20}>{ICON_GOI}</Icon>
          </a>
        )}
      </div>
      {n.can.length > 0 && (
        <ul className="s6-ds s6-ds--trong-the">
          {n.can.map((c) => <DongCan key={c.canId} c={c} onCham={() => props.onCham(c)} />)}
        </ul>
      )}
    </section>
  );
}

/** YC10.1 bước 11, YC10.1-NT10: S6-00 với ba nút. */
function ChuaCoCan(props: { onThemCan: () => void; onXinLich: () => void; onThemTuNhap: () => void }) {
  return (
    <section className="s6-the s6-trong" aria-label="Chưa có căn nào">
      <span className="s6-trong-icon" aria-hidden="true"><Icon co={32}>{ICON_THEM}</Icon></span>
      <h2 className="s6-trong-tieu-de">Chưa có căn nào</h2>
      <p className="s6-trong-cau">Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app.</p>
      <div className="s6-trong-nut">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onThemCan}>+ Thêm căn của tôi</button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onXinLich}>Gửi tin nhắn xin lịch cho chủ nhà</button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onThemTuNhap}>Thêm căn tự nhập</button>
      </div>
    </section>
  );
}

export function S6TabCan(props: {
  dv?: DichVuTabCanSale;
  onCham: (c: ChamCanTab) => void;
  onMoChuNha: (n: NhomChuNha) => void;
  onThemCan: () => void;
  onXinLich: () => void;
  onThemTuNhap: () => void;
}) {
  const { dv } = props;
  const hienToast = useToast();
  const [tab, datTab] = useState<TabCan | undefined>(undefined);
  const [loi, datLoi] = useState(false);

  const tai = useCallback(async () => {
    if (!dv) { datLoi(true); return; }
    datLoi(false);
    try {
      datTab(await dv.doc());
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  // YC10.1 bước 10, YC10.1-NT8, YC10 "Bấm hai lần": bỏ ngay khỏi màn, không hỏi lại; lỗi thì trả dòng về và báo.
  const boDong = async (n: NhomChuNha) => {
    if (!dv) return;
    datTab((t) => (t ? { ...t, chuNha: t.chuNha.filter((x) => x.ketNoiId !== n.ketNoiId) } : t));
    try {
      await dv.boDongChu(n.ketNoiId);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      await tai();
    }
  };
  // YC10.1 bước 4, YC10.1-NT9: mở bảng chia sẻ với tin mời; app không tự gửi.
  const chiaSeLoiMoi = async () => {
    await guiChu(tinMoiDungApp(window.location.origin), (s) => hienToast(s, s === CAU_THIEU_TINH_NANG ? 'loi' : undefined));
  };

  let than;
  if (tab === undefined) {
    than = loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />;
  } else if (tabTrong(tab)) {
    than = <ChuaCoCan onThemCan={props.onThemCan} onXinLich={props.onXinLich} onThemTuNhap={props.onThemTuNhap} />;
  } else {
    const tuNhapDau = tab.tuNhap[0];
    than = (
      <>
        <section className="s6-nhom" aria-label={`Căn của tôi · ${tab.cuaToi.length}`}>
          <div className="s6-muc-dong">
            <h2 className="s6-muc">Căn của tôi · {tab.cuaToi.length}</h2>
            <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={props.onThemCan}>+ Thêm căn</button>
          </div>
          {tab.cuaToi.length > 0 && (
            <ul className="s6-ds">
              {tab.cuaToi.map((c) => (
                <DongCan key={c.canId} c={c}
                         phai={<span className={'s6-tinh-trang' + (c.tinhTrang.co ? '' : ' s6-tinh-trang--trong')}>{c.tinhTrang.chu}</span>}
                         onCham={() => props.onCham({ canId: c.canId, nhom: 'cua_toi', ten: c.ten })} />
              ))}
            </ul>
          )}
        </section>
        <h2 className="s6-muc s6-muc--lon">Nguồn phòng</h2>
        <section className="s6-nhom" aria-label={`Chủ nhà đã kết nối · ${soChuNha(tab)}`}>
          <h2 className="s6-muc">Chủ nhà đã kết nối · {soChuNha(tab)}</h2>
          {tab.chuNha.map((n) => (
            <ChuNha key={n.ketNoiId} n={n} onMoChu={() => props.onMoChuNha(n)} onBo={() => void boDong(n)}
                    onCham={(c) => props.onCham({ canId: c.canId, nhom: 'nguon', ten: c.ten })} />
          ))}
        </section>
        <section className="s6-nhom" aria-label={`Căn tự nhập · ${tab.tuNhap.length}`}>
          <h2 className="s6-muc">Căn tự nhập · {tab.tuNhap.length}</h2>
          {tab.tuNhap.length > 0 && (
            <ul className="s6-ds">
              {tab.tuNhap.map((c) => (
                <DongCan key={c.canId} c={c} onCham={() => props.onCham({ canId: c.canId, nhom: 'tu_nhap', ten: c.ten })} />
              ))}
            </ul>
          )}
          {tuNhapDau && (
            <div className="s6-goi-y">
              <p className="s6-goi-y-cau">💡 {cauMoiChuCan(tuNhapDau.tenChuCan)}</p>
              <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={() => void chiaSeLoiMoi()}>Chia sẻ lời mời</button>
            </div>
          )}
        </section>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onThemTuNhap}>
          <Icon>{ICON_THEM}</Icon>Thêm căn tự nhập
        </button>
      </>
    );
  }
  return <KhungTabChu tieuDe="Căn"><div className="s6-than">{than}</div></KhungTabChu>;
}
