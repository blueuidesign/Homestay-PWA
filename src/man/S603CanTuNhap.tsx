// S6-03 · Chi tiết căn tự nhập, S6-03-00 · chưa ghi đặt phòng (YC10.3 bước 8 đến 13, YC10.3-NT6, NT8, NT9, QT6.4, QT3.1, QD11,
// PQ14.SALE, pwa.md P3, P5). Đọc qua fn_can_tu_nhap. Không bao giờ ghi "trống" cho ngày nào. "Gọi hỏi lịch" là link tel:;
// không còn số chủ căn thì không dùng được. "Xóa căn tự nhập" bấm hai lần (YC10 "Bấm hai lần", giả định GD23).
// Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV5 căn không còn, HV8 toast.
// US57 (YC10.4): có dv.datPhong thì "Đặt phòng" mở S6-05 phủ trên màn, chạm một đặt phòng mở form sửa, xóa (S606SuaDatPhong);
// lưu xong đọc lại và toast S6-06.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { CAU_THIEU_TINH_NANG, guiChu } from '../chung/chiaSe';
import { KhungXam } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import {
  CAU_CHI_XOA_CUA_BAN, CAU_CHUA_CO_DAT_PHONG, CAU_KHONG_PHAI_LICH, cauGoiChu, cauXacNhanXoa, cheSo, dongDatPhong, linkGoi,
  mucDatPhong, nutMoiChu, phuTheTuNhap, tenCanTuNhap,
} from '../lib/canTuNhap';
import type { ChiTietCanTuNhap, DichVuCanTuNhap } from '../lib/dichVuCanTuNhap';
import { cauDaLuu, cauDaSua, cauDaXoa } from '../lib/datPhongTuGhi';
import type { DatPhongTuGhi } from '../lib/canTuNhap';
import { homNay as homNayVN } from '../lib/ngay';
import { S605GhiDatPhong } from './S605GhiDatPhong';
import { S606SuaDatPhong } from './S606SuaDatPhong';
import { chuCaiDau, tenGiuaCau, tinMoiDungApp } from '../lib/tabCanSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon, ICON_THEM, ICON_TOI } from './TabChu';
import './S603CanTuNhap.css';

const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />;
const ICON_LICH = <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>;
const ICON_KHACH = <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>;
const ICON_SUA = <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />;
const ICON_NGUOI = <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>;

function Viec(props: { icon: ReactNode; chu: string; phu: string; onBam: () => void }) {
  return (
    <li>
      <button type="button" className="s603-viec" onClick={props.onBam}>
        <span className="s603-viec-icon"><Icon co={18}>{props.icon}</Icon></span>
        <span className="s603-viec-chu"><span className="s603-viec-ten">{props.chu}</span><span className="s603-viec-phu">{props.phu}</span></span>
        <span className="s603-toi"><Icon co={16}>{ICON_TOI}</Icon></span>
      </button>
    </li>
  );
}

export function S603CanTuNhap(props: {
  canId: string;
  /** Tiêu đề khi chưa đọc xong (HV1). */
  tenTam: string;
  dv: Pick<DichVuCanTuNhap, 'doc' | 'xoa' | 'datPhong'>;
  /** Ngày hôm nay giờ Việt Nam (chip "Hôm nay", "Mai" ở S6-05). Thiếu thì lấy theo đồng hồ máy. */
  homNay?: string;
  onQuayLai: () => void;
  /** YC10.3 bước 10: S5 với căn này. */
  onGuiKhach: (c: ChiTietCanTuNhap) => void;
  /** YC10.3 bước 12: form sửa (S6-02 điền sẵn). */
  onSua: (c: ChiTietCanTuNhap) => void;
  /** Ghi đặt phòng tự ghi khi không có dv.datPhong. */
  onDatPhong: (c: ChiTietCanTuNhap) => void;
  /** YC10.3 bước 13: xóa xong về S6. */
  onDaXoa: () => void;
}) {
  const { dv, canId } = props;
  const hienToast = useToast();
  const [ct, datCt] = useState<ChiTietCanTuNhap | undefined>(undefined);
  const [loi, datLoi] = useState<string | true | null>(null);
  const [hoiXoa, datHoiXoa] = useState(false);
  const [dangXoa, datDangXoa] = useState(false);
  const [moDp, datMoDp] = useState<{ ghi: true } | { sua: DatPhongTuGhi } | null>(null);
  const tai = useCallback(async () => {
    datLoi(null);
    try {
      datCt(await dv.doc(canId));
    } catch (e) {
      datLoi(e instanceof LoiNguoiDung ? e.message : true);
    }
  }, [dv, canId]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  const ten = ct ? tenCanTuNhap(ct) : props.tenTam;
  const ngayNay = props.homNay ?? homNayVN();

  // YC10.3 bước 13, YC10.3-NT9: lần một chỉ đổi chữ nút; lần hai mới xóa.
  const xoa = async () => {
    if (!hoiXoa) { datHoiXoa(true); return; }
    if (dangXoa) return;
    datDangXoa(true);
    try {
      await dv.xoa(canId);
      props.onDaXoa();
    } catch (e) {
      hienToast(e instanceof LoiNguoiDung ? e.message : cauBaoLoi(e), 'loi');
      datDangXoa(false);
    }
  };
  // YC10.3 bước 11 như YC10.1 bước 4: bảng chia sẻ với tin mời; app không tự gửi.
  const moiChu = async () => {
    await guiChu(tinMoiDungApp(window.location.origin), (s) => hienToast(s, s === CAU_THIEU_TINH_NANG ? 'loi' : undefined));
  };

  let than: ReactNode;
  if (!ct) {
    than = loi === null ? <KhungXam /> : typeof loi === 'string'
      ? <p className="s603-cau-loi" role="alert">{loi}</p>
      : <ManChuaTai onThuLai={() => void tai()} />;
  } else {
    const tenChu = ct.tenChu?.trim() || 'Chủ căn';
    const so = cheSo(ct.soDienThoai);
    const tel = linkGoi(ct.soDienThoai);
    const phu = phuTheTuNhap(ct);
    const n = ct.datPhong.length;
    than = (
      <>
        <section className="s603-the" aria-label="Chủ căn">
          <div className="s603-chu">
            <span className="s603-tron" aria-hidden="true">{chuCaiDau(tenChu)}</span>
            <span className="s603-chu-chu">
              <span className="s603-chu-ten">{tenChu}</span>
              <span className="s603-chu-phu">{so ? `${so} · chưa dùng app` : 'chưa dùng app'}</span>
            </span>
            {tel ? (
              <a className="hh-btn hh-btn--secondary hh-btn--pill s603-goi" href={tel}><Icon co={16}>{ICON_GOI}</Icon>Gọi hỏi lịch</a>
            ) : (
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--pill s603-goi" disabled><Icon co={16}>{ICON_GOI}</Icon>Gọi hỏi lịch</button>
            )}
          </div>
          {phu && <span className="s603-phu">{phu}</span>}
          <div className="s603-goi-y">
            <span className="s603-goi-y-icon" aria-hidden="true"><Icon co={16}>{ICON_LICH}</Icon></span>
            <span>{cauGoiChu(ct.tenChu)}</span>
          </div>
        </section>

        <section className="s603-the" aria-label={mucDatPhong(n)} data-man-con={n ? 'S6-03' : 'S6-03-00'}>
          <div className="s603-muc-dong">
            <h2 className="s603-muc">{mucDatPhong(n)}</h2>
            <span className="s603-nhan">Chỉ bạn thấy</span>
          </div>
          {n ? (
            <ul className="s603-ds-dp">
              {ct.datPhong.map((d) => {
                const x = dongDatPhong(d);
                const noiDung = (
                  <>
                    <span className="s603-dp-chu"><span className="s603-dp-ngay">{x.ngay}</span><span className="s603-dp-tien">{x.tien}</span></span>
                    {x.chenh && <span className="s603-dp-chenh">{x.chenh}</span>}
                  </>
                );
                // YC10.4-NT8: chạm một đặt phòng mở form sửa.
                return (
                  <li key={d.id} className={dv.datPhong ? 's603-dp s603-dp--cham' : 's603-dp'} data-testid="dat-phong">
                    {dv.datPhong ? (
                      <button type="button" className="s603-dp-nut" aria-label={`Sửa đặt phòng ${x.ngay}`} onClick={() => datMoDp({ sua: d })}>{noiDung}</button>
                    ) : noiDung}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="s603-trong">
              <span className="s603-trong-tieu-de">{CAU_CHUA_CO_DAT_PHONG}</span>
              <span className="s603-phu">
                Chốt khách với {ct.tenChu?.trim() ? tenGiuaCau(ct.tenChu) : 'chủ căn'} xong thì bấm "Đặt phòng" để tính vào thống kê.
              </span>
            </div>
          )}
          <span className="s603-ghi-chu">{CAU_KHONG_PHAI_LICH}</span>
        </section>

        <section aria-label="Căn này">
          <h2 className="s603-muc s603-muc--ngoai">Căn này</h2>
          <ul className="s603-ds" aria-label="Việc với căn này">
            <Viec icon={ICON_KHACH} chu="Gửi cho khách" phu="Ảnh và thông tin, giá bán của bạn" onBam={() => props.onGuiKhach(ct)} />
            <Viec icon={ICON_SUA} chu="Sửa thông tin căn" phu="Ảnh, giá chủ, số phòng ngủ" onBam={() => props.onSua(ct)} />
            <Viec icon={ICON_NGUOI} chu={nutMoiChu(ct.tenChu)} phu="Khi đó bạn thấy lịch trống thật, không cần gọi" onBam={() => void moiChu()} />
          </ul>
        </section>

        <div className="s603-xoa">
          <button type="button" className="hh-btn hh-btn--text s603-nut-xoa" onClick={() => void xoa()} disabled={dangXoa}>
            {hoiXoa ? cauXacNhanXoa(ten) : 'Xóa căn tự nhập'}
          </button>
          {hoiXoa && <span className="s603-phu">{CAU_CHI_XOA_CUA_BAN}</span>}
        </div>
      </>
    );
  }
  return (
    <div className="man man-chu s603" data-man={ct && ct.datPhong.length === 0 ? 'S6-03-00' : 'S6-03'}>
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{ten}</h1>
      </header>
      <div className="chu-than s603-than">{than}</div>
      {ct && (
        <div className="s603-duoi">
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block"
                  onClick={() => (dv.datPhong ? datMoDp({ ghi: true }) : props.onDatPhong(ct))}>
            <Icon>{ICON_THEM}</Icon>Đặt phòng
          </button>
        </div>
      )}
      {ct && dv.datPhong && moDp && ('ghi' in moDp ? (
        <S605GhiDatPhong canId={canId} tenCan={ten} tenChu={ct.tenChu} homNay={ngayNay} dv={dv.datPhong} onDong={() => datMoDp(null)}
                         onDaLuu={(g) => { datMoDp(null); hienToast(cauDaLuu(g.ngayNhan, g.ngayTra)); void tai(); }} />
      ) : (
        <S606SuaDatPhong key={moDp.sua.id} canId={canId} tenCan={ten} tenChu={ct.tenChu} homNay={ngayNay} datPhong={moDp.sua}
                         dv={dv.datPhong} onDong={() => datMoDp(null)}
                         onDaLuu={(g) => { datMoDp(null); hienToast(cauDaSua(g.ngayNhan, g.ngayTra)); void tai(); }}
                         onDaXoa={(d) => { datMoDp(null); hienToast(cauDaXoa(d.ngayNhan, d.ngayTra)); void tai(); }} />
      ))}
    </div>
  );
}
