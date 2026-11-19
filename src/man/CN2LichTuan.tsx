// CN2 · Lịch tuần nhiều căn của chủ nhà (YC2.5, US13); CN2-00 tuần chưa có đặt phòng. PQ4.CHU, PQ7.CHU, PQ8.CHU, QT2, QT6.1.
// Mỗi căn một hàng, bảy cột T2 đến CN; ô trống hiện giá chủ nhà rút gọn (chưa đặt giá thì "–"), đêm có khách nối thành thanh.
// Trạng thái (YC2 Trạng thái màn): HV1 khung xám, HV2 đổi tuần không tải được thì báo và giữ tuần đang hiện, HV3 đọc lại.
// Cặp nút "Tháng" "Tuần" (YC2-H4) dùng chung với CN1.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { CAU_CHUA_TAI, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuLich, TuanLich } from '../lib/dichVuLich';
import {
  cacNgayTuan, chipLoc, dongCan, hangTuan, locCan, tenTuan, thuHaiTuan, tieuDeCot, tomTatTuan, type CanTuan,
} from '../lib/lichTuan';
import { congNgay, homNay as homNayVN, type Ngay } from '../lib/ngay';
import { Icon, ICON_THEM, KhungTabChu } from './TabChu';
import './CN2LichTuan.css';

const ICON_TRUOC = <path d="m15 18-6-6 6-6" />;
const ICON_SAU = <path d="m9 18 6-6-6-6" />;

/** YC2.5 (YC2-H4): cặp nút "Tháng" "Tuần" dưới tiêu đề CN1, CN2; nút đang xem tô đậm. */
export function NutThangTuan(props: { dangXem: 'thang' | 'tuan'; onThang: () => void; onTuan: () => void }) {
  const nut = (loai: 'thang' | 'tuan', chu: string, bam: () => void) => (
    <button type="button" aria-pressed={props.dangXem === loai}
            className={'cn2-kieu-nut' + (props.dangXem === loai ? ' cn2-kieu-nut--on' : '')}
            onClick={() => { if (props.dangXem !== loai) bam(); }}>{chu}</button>
  );
  return (
    <div className="cn2-kieu" role="group" aria-label="Kiểu xem lịch">
      {nut('thang', 'Tháng', props.onThang)}
      {nut('tuan', 'Tuần', props.onTuan)}
    </div>
  );
}

/** Đọc tuần từ thứ Hai `muon`. Đọc lỗi khi đã có tuần đang hiện thì giữ tuần đó (HV2). */
function useTuan(dv: DichVuLich | undefined, canIds: string[], muon: Ngay, homNay: Ngay, onLoiDoiTuan: (dangHien: Ngay) => void) {
  const [hien, datHien] = useState<{ t2: Ngay; duLieu: TuanLich } | undefined>(undefined);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);
  const hienRef = useRef(hien);
  hienRef.current = hien;
  const loiDoi = useRef(onLoiDoiTuan);
  loiDoi.current = onLoiDoiTuan;
  const khoa = canIds.join(',');

  const tai = useCallback(async () => {
    const so = ++lan.current;
    datDangTai(true);
    datLoi(false);
    try {
      if (!dv?.layTuan) throw new TypeError('chưa nối database');
      const d = await dv.layTuan(canIds, muon, homNay);
      if (so !== lan.current) return;
      datHien({ t2: muon, duLieu: d });
    } catch {
      if (so !== lan.current) return;
      const cu = hienRef.current;
      if (!cu) datLoi(true);
      else if (cu.t2 !== muon) loiDoi.current(cu.t2); // HV2: giữ tuần đang hiện
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [dv, khoa, muon, homNay]); // khoa đại diện canIds

  useEffect(() => { void tai(); }, [tai]);
  return { hien, dangTai, loi, tai };
}

export function CN2LichTuan(props: {
  /** Căn có lịch, chưa ẩn của chủ nhà, theo thứ tự hiện (căn thêm trước đứng trước). */
  ds: CanTuan[];
  dv: DichVuLich | undefined;
  /** Một ngày trong tuần mở đầu (YC2-H4: ngày đang chọn ở CN1 hay hôm nay). */
  ngayDau: Ngay;
  /** YC2.5 bước 17, 23: nút "Đặt phòng" mở CN4; ô trống mở CN4 với căn và ngày đó (YC5). */
  onDatPhong: (chon?: { canId: string; ngay: Ngay }) => void;
  /** YC2.5 bước 23: chạm thanh mở chi tiết đặt phòng CN3-02 (YC5). */
  onMoDatPhong: (id: string) => void;
  /** YC2-H4: bấm "Tháng" thì về CN1 ở tháng chứa thứ Hai này. */
  onXemThang: (t2: Ngay) => void;
  /** Tuần muốn xem đổi (Trước, Sau): ManChu nhớ để quay lại từ form đặt phòng thì mở đúng tuần (YC5 Quy tắc "Về màn đã mở"). */
  onDoiTuan?: (t2: Ngay) => void;
  /** Hôm nay theo giờ Việt Nam; test truyền ngày cố định. */
  homNay?: Ngay;
}) {
  const homNay = props.homNay ?? homNayVN();
  const hienToast = useToast();
  const canIdsChu = props.ds.map((c) => c.id).join(',');
  const canIds = useMemo(() => (canIdsChu ? canIdsChu.split(',') : []), [canIdsChu]);
  const [muon, datMuon] = useState<Ngay>(() => thuHaiTuan(props.ngayDau));
  const [chip, datChip] = useState('tat-ca');
  const { hien, dangTai, loi, tai } = useTuan(props.dv, canIds, muon, homNay, (dangHien) => {
    hienToast(CAU_CHUA_TAI, 'loi');
    datMuon(dangHien);
  });

  // HV3: quay lại từ nền đọc lại tuần đang xem. HV2 bước 4: có mạng lại thì tải lại.
  useQuayLaiTuNen(() => { void tai(); });
  useEffect(() => {
    const lai = () => { void tai(); };
    window.addEventListener('online', lai);
    return () => window.removeEventListener('online', lai);
  }, [tai]);

  const doiTuan = useRef(props.onDoiTuan);
  doiTuan.current = props.onDoiTuan;
  useEffect(() => { doiTuan.current?.(muon); }, [muon]);

  const dsChip = chipLoc(props.ds);
  // Chip không còn (căn bị xóa ở máy khác) thì về "Tất cả".
  useEffect(() => { if (!dsChip.some((c) => c.khoa === chip)) datChip('tat-ca'); }, [dsChip, chip]);

  const t2 = hien?.t2 ?? muon;
  const ngay = cacNgayTuan(t2);
  const canHien = locCan(props.ds, chip);
  const duLieu = hien?.duLieu;
  const chuaCoDatPhong = !!duLieu && duLieu.datPhong.length === 0; // CN2-00
  const tom = duLieu ? tomTatTuan(canHien, t2, duLieu.datPhong, duLieu.coKhachHomNay) : null;
  const hang = duLieu ? canHien.map((c) => ({ can: c, o: hangTuan(c, t2, duLieu.datPhong, duLieu.gia) })) : [];
  const coChuaGia = hang.some((h) => h.o.some((o) => o.loai === 'trong' && o.gia === null));

  const nutDatPhong = (
    <button type="button" className="hh-btn hh-btn--primary hh-btn--pill" onClick={() => props.onDatPhong()}>
      <Icon>{ICON_THEM}</Icon>Đặt phòng
    </button>
  );
  const dai = (
    <>
      <NutThangTuan dangXem="tuan" onThang={() => props.onXemThang(t2)} onTuan={() => {}} />
      {chuaCoDatPhong && <div className="cn2-dai-trong" role="status">Tuần này chưa có đặt phòng nào. Mọi căn đều trống.</div>}
    </>
  );

  return (
    <KhungTabChu tieuDe="Lịch tuần" phai={nutDatPhong} dai={dai}>
      {dangTai && hien && <DongDangCapNhat />}
      <div className="cn2-tuan">
        <button type="button" className="cn2-chuyen" aria-label="Trước" onClick={() => datMuon((m) => congNgay(m, -7))}>
          <Icon co={20}>{ICON_TRUOC}</Icon><span aria-hidden="true">Trước</span>
        </button>
        <span className="cn2-ten-tuan">{tenTuan(t2)}</span>
        <button type="button" className="cn2-chuyen" aria-label="Sau" onClick={() => datMuon((m) => congNgay(m, 7))}>
          <span aria-hidden="true">Sau</span><Icon co={20}>{ICON_SAU}</Icon>
        </button>
      </div>

      {dsChip.length > 1 && (
        <div className="cn2-chips" role="group" aria-label="Lọc căn">
          {dsChip.map((c) => (
            <button key={c.khoa} type="button" aria-pressed={chip === c.khoa}
                    className={'hh-chip hh-chip--neutral' + (chip === c.khoa ? ' hh-chip--on' : '')} onClick={() => datChip(c.khoa)}>
              {c.chu}
            </button>
          ))}
        </div>
      )}

      {!duLieu ? (loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={5} />) : (
        <>
          <div className="cn2-tom-tat" role="group" aria-label="Tóm tắt tuần">
            <div className="cn2-o-tom"><span className="cn2-o-tom-nhan">Có khách hôm nay</span><span className="cn2-o-tom-so">{tom!.coKhach}</span></div>
            <div className="cn2-o-tom"><span className="cn2-o-tom-nhan">Trống tối T7</span><span className="cn2-o-tom-so">{tom!.trongT7}</span></div>
            <div className="cn2-o-tom"><span className="cn2-o-tom-nhan">Chưa cọc</span><span className="cn2-o-tom-so">{tom!.chuaCoc}</span></div>
          </div>

          <div className="cn2-cuon">
            <div className="cn2-bang" role="table" aria-label={`Lịch tuần ${tenTuan(t2)}`}>
              <div className="cn2-hang cn2-hang--dau" role="row">
                <div className="cn2-dau-can" role="columnheader">Căn</div>
                {ngay.map((d) => {
                  const [thu, so] = tieuDeCot(d).split(' ');
                  return (
                    <div key={d} role="columnheader" className={'cn2-dau-ngay' + (d === homNay ? ' cn2-dau-ngay--nay' : '')}>
                      <span>{thu}</span> <span>{so}</span>
                    </div>
                  );
                })}
              </div>
              {hang.map(({ can, o }) => (
                <div key={can.id} className="cn2-hang" role="row" aria-label={[can.maCan, dongCan(can)].filter(Boolean).join(' ')}>
                  <div className="cn2-ten" role="rowheader">
                    <span className="cn2-hang-ma">{can.maCan}</span>
                    <span className="cn2-hang-phu">{dongCan(can)}</span>
                  </div>
                  {o.map((x) => x.loai === 'trong' ? (
                    <button key={x.ngay} type="button" data-o={`${can.id}|${x.ngay}`} style={{ gridColumn: String(x.cot + 2) }}
                            className={'cn2-o' + (x.gia === null ? ' cn2-o--chua-gia' : '')}
                            aria-label={`${can.maCan} ${tieuDeCot(x.ngay)}, trống, ${x.gia === null ? 'chưa đặt giá' : x.chu}`}
                            onClick={() => props.onDatPhong({ canId: can.id, ngay: x.ngay })}>
                      {x.chu}
                    </button>
                  ) : (
                    <button key={x.datPhong.id} type="button" data-o={x.datPhong.id} style={{ gridColumn: `${x.cot + 2} / span ${x.soCot}` }}
                            className="cn2-o-thanh" aria-label={`${can.maCan} ${[x.nguoi, x.nhan].filter(Boolean).join(' · ')}`}
                            onClick={() => props.onMoDatPhong(x.datPhong.id)}>
                      <span className={'cn2-thanh' + (x.daTra ? '' : ' cn2-thanh--chua-coc')}>
                        <span className="cn2-thanh-nguoi">{x.nguoi}</span>{x.nhan && ' '}
                        {x.nhan && <span className="cn2-thanh-nhan">{x.nhan}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="cn2-chu-thich">
            <span className="cn2-chu-thich-muc"><i className="cn2-mau cn2-mau--da-tra" aria-hidden="true" />Đã cọc / đã thanh toán</span>
            <span className="cn2-chu-thich-muc"><i className="cn2-mau cn2-mau--chua-coc" aria-hidden="true" />Chưa cọc</span>
            <span>800k: trống, giá đêm</span>
            {coChuaGia && <span>–: trống, chưa đặt giá</span>}
          </div>
        </>
      )}
    </KhungTabChu>
  );
}
