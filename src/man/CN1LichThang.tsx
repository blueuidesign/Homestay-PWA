// CN1 · Lịch tháng của chủ nhà (YC2.1): CN1 hai căn, CN1-02 từ ba căn, CN1-00 chưa có đặt phòng nào. PQ4.CHU, QT2.
// Trạng thái (YC2 Trạng thái màn): HV1 khung xám, mở lại thì hiện tháng đã xem kèm "Đang cập nhật…"; HV2 dải mất mạng,
// đổi tháng không tải được thì báo và giữ tháng đang hiện; HV3 quay lại từ nền đọc lại tháng đang xem.
// Chạm ngày thì CN3 chi tiết một ngày mở ngay dưới lưới (YC2.2, US10), theo chip đang chọn.
// Doanh thu tháng, đặt phòng sắp tới (mục khác của YC2) làm ở US sau.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { CAU_CHUA_TAI, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuLich, ThangLich } from '../lib/dichVuLich';
import { cacDemCuaThang, congThang, soOTrongDau, tenThangNgan } from '../lib/gia';
import { canCoKhach, chuChipTatCa, demTheoCan, mauCan, nhanO, tenThang, type CanLich } from '../lib/lich';
import { homNay as homNayVN, type Ngay } from '../lib/ngay';
import { CN3ChiTietNgay } from './CN3ChiTietNgay';
import { Icon, ICON_THEM, KhungTabChu } from './TabChu';
import './CN1LichThang.css';

const ICON_TRUOC = <path d="m15 18-6-6 6-6" />;
const ICON_SAU = <path d="m9 18 6-6-6-6" />;
const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const khoaThang = (canIds: string[], nam: number, thang: number) => `${canIds.join(',')}|${nam}-${thang}`;

/**
 * Đọc tháng [nam, thang]. boNho giữ tháng đã xem trong phiên (ManChu giữ, HV1-NT2).
 * Tháng mới chưa có trong bộ nhớ thì vẫn hiện tháng cũ tới khi đọc xong; đọc lỗi thì giữ tháng cũ (HV2).
 */
function useThang(dv: DichVuLich | undefined, canIds: string[], muon: [number, number], boNho: Map<string, ThangLich>,
                  onLoiDoiThang: (dangHien: [number, number]) => void) {
  const khoa = khoaThang(canIds, muon[0], muon[1]);
  const [hien, datHien] = useState<{ thang: [number, number]; duLieu: ThangLich } | undefined>(() => {
    const c = boNho.get(khoa);
    return c ? { thang: muon, duLieu: c } : undefined;
  });
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);
  const hienRef = useRef(hien);
  hienRef.current = hien;
  const loiDoi = useRef(onLoiDoiThang);
  loiDoi.current = onLoiDoiThang;

  const tai = useCallback(async () => {
    const so = ++lan.current;
    const c = boNho.get(khoa);
    if (c) datHien({ thang: muon, duLieu: c });
    datDangTai(true);
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const d = await dv.layThang(canIds, muon[0], muon[1]);
      if (so !== lan.current) return;
      boNho.set(khoa, d);
      datHien({ thang: muon, duLieu: d });
    } catch {
      if (so !== lan.current) return;
      const cu = hienRef.current;
      if (!cu) datLoi(true);
      else if (!c) loiDoi.current(cu.thang); // HV2: giữ tháng đang hiện
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [dv, khoa, boNho]); // khoa gồm canIds và tháng muốn

  useEffect(() => { void tai(); }, [tai]);
  return { hien, dangTai, loi, tai };
}

export function CN1LichThang(props: {
  /** Căn có lịch, chưa ẩn của chủ nhà, theo thứ tự hiện (căn thêm trước đứng trước). */
  ds: CanLich[];
  dv: DichVuLich | undefined;
  /** YC2.1 bước 5, YC5.1 bước 1a: mở CN4. YC5.1 bước 1b: từ dòng căn trống ở CN3 thì kèm căn và ngày đang xem. */
  onDatPhong: (chon?: { canId: string; ngay: Ngay }) => void;
  /** YC2.2 bước 9: chạm dòng căn có khách ở chi tiết ngày thì mở chi tiết đặt phòng CN3-02 (YC5). */
  onMoDatPhong?: (id: string) => void;
  /** Tháng đã xem trong phiên; ManChu giữ để mở lại tab Lịch thấy ngay (HV1-NT2). */
  boNho?: Map<string, ThangLich>;
  /** Hôm nay theo giờ Việt Nam; test truyền ngày cố định. */
  homNay?: Ngay;
}) {
  const homNay = props.homNay ?? homNayVN();
  const hienToast = useToast();
  const boNhoRieng = useRef(new Map<string, ThangLich>());
  const boNho = props.boNho ?? boNhoRieng.current;
  const canIdsChu = props.ds.map((c) => c.id).join(',');
  const canIds = useMemo(() => (canIdsChu ? canIdsChu.split(',') : []), [canIdsChu]);
  const [muon, datMuon] = useState<[number, number]>([Number(homNay.slice(0, 4)), Number(homNay.slice(5, 7))]);
  const [canLoc, datCanLoc] = useState<string | null>(null);
  const [chon, datChon] = useState<Ngay | null>(null);
  // HV2: đổi tháng không tải được thì báo, quay về tháng đang hiện (lần bấm sau tính từ tháng đó).
  const { hien, dangTai, loi, tai } = useThang(props.dv, canIds, muon, boNho, (dangHien) => {
    hienToast(CAU_CHUA_TAI, 'loi');
    datMuon(dangHien);
  });

  // HV3: quay lại từ nền đọc lại tháng đang xem. HV2 bước 4: có mạng lại thì tải lại.
  useQuayLaiTuNen(() => { void tai(); });
  useEffect(() => {
    const lai = () => { void tai(); };
    window.addEventListener('online', lai);
    return () => window.removeEventListener('online', lai);
  }, [tai]);
  // Căn đang lọc bị xóa ở máy khác thì về mọi căn.
  useEffect(() => { if (canLoc && !canIds.includes(canLoc)) datCanLoc(null); }, [canIds, canLoc]);

  const chuTatCa = chuChipTatCa(props.ds.length);
  const nutDatPhong = (
    <button type="button" className="hh-btn hh-btn--primary hh-btn--pill" onClick={() => props.onDatPhong()}>
      <Icon>{ICON_THEM}</Icon>Đặt phòng
    </button>
  );

  const [nam, thang] = hien?.thang ?? muon;
  const doiThang = (buoc: number) => datMuon(congThang(nam, thang, buoc));
  const [, thangTruoc] = congThang(nam, thang, -1);
  const [, thangSau] = congThang(nam, thang, 1);
  const chuaCoDatPhong = hien ? !hien.duLieu.coDatPhong : false; // CN1-00
  const canHien = canLoc ? props.ds.filter((c) => c.id === canLoc) : props.ds;
  const mau = new Map(props.ds.map((c, i) => [c.id, mauCan(i)]));
  const maCan = new Map(props.ds.map((c) => [c.id, c.maCan]));
  const dem = hien ? demTheoCan(hien.duLieu.datPhong, nam, thang) : null;

  return (
    <KhungTabChu tieuDe="Lịch" phai={nutDatPhong}>
      {dangTai && hien && <DongDangCapNhat />}
      <section className="cn1-lich" aria-label="Lịch tháng">
        <div className="cn1-thang">
          <button type="button" className="cn1-chuyen" aria-label={tenThangNgan(thangTruoc)} onClick={() => doiThang(-1)}>
            <Icon co={20}>{ICON_TRUOC}</Icon><span aria-hidden="true">{tenThangNgan(thangTruoc)}</span>
          </button>
          <h2 className="cn1-ten-thang">{tenThang(nam, thang)}</h2>
          <button type="button" className="cn1-chuyen" aria-label={tenThangNgan(thangSau)} onClick={() => doiThang(1)}>
            <span aria-hidden="true">{tenThangNgan(thangSau)}</span><Icon co={20}>{ICON_SAU}</Icon>
          </button>
        </div>

        {chuTatCa && (
          <div className="cn1-chips" role="group" aria-label="Lọc theo căn">
            <button type="button" aria-pressed={canLoc === null}
                    className={'hh-chip hh-chip--neutral' + (canLoc === null ? ' hh-chip--on' : '')} onClick={() => datCanLoc(null)}>
              {chuTatCa}
            </button>
            {props.ds.map((c) => (
              <button key={c.id} type="button" aria-pressed={canLoc === c.id} style={{ '--mau-can': mau.get(c.id) } as CSSProperties}
                      className={'hh-chip cn1-chip' + (canLoc === c.id ? ' hh-chip--on' : '')} onClick={() => datCanLoc(c.id)}>
                <span className="hh-chip__dot" aria-hidden="true" />{c.maCan}
              </button>
            ))}
          </div>
        )}

        {hien && !chuaCoDatPhong && (
          <div className="cn1-chu-thich">
            {canHien.map((c) => (
              <span key={c.id} className="cn1-chu-thich-muc">
                <i className="cn1-chu-thich-vach" style={{ background: mau.get(c.id) }} aria-hidden="true" />{c.maCan} đã đặt
              </span>
            ))}
          </div>
        )}

        {!hien ? (loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={5} />) : (
          <div className="cn1-luoi" role="grid" aria-label={tenThang(nam, thang)}>
            {THU.map((t) => <div key={t} className="cn1-thu" role="columnheader">{t}</div>)}
            {Array.from({ length: soOTrongDau(nam, thang) }, (_, i) => <div key={'t' + i} />)}
            {cacDemCuaThang(nam, thang).map((ngay) => {
              const co = new Set(canCoKhach(dem!, ngay, canLoc));
              const ma = canHien.filter((c) => co.has(c.id)).map((c) => maCan.get(c.id)!);
              const lop = ['hh-cell', 'cn1-o'];
              if (ngay === homNay) lop.push('hh-cell--today');
              if (ngay === chon) lop.push('cn1-o--chon');
              return (
                <button key={ngay} type="button" role="gridcell" className={lop.join(' ')} data-ngay={ngay}
                        aria-pressed={ngay === chon} aria-label={nhanO(Number(ngay.slice(8)), ma)} onClick={() => datChon(ngay)}>
                  <span className="hh-cell__day">{Number(ngay.slice(8))}</span>
                  <span className="hh-cell__bars" aria-hidden="true">
                    {canHien.map((c) => (
                      <span key={c.id} data-can={c.maCan} className={'hh-cell__bar' + (co.has(c.id) ? ' cn1-vach--co' : '')}
                            style={co.has(c.id) ? { background: mau.get(c.id) } : undefined} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* YC2.2 bước 7: chi tiết ngày dùng dữ liệu tháng đã đọc; ngày chọn ở tháng khác thì ẩn tới khi quay lại tháng đó. */}
      {hien && chon && chon.slice(0, 7) === `${nam}-${String(thang).padStart(2, '0')}` && (
        <CN3ChiTietNgay ngay={chon} ds={canHien} datPhong={hien.duLieu.datPhong} mau={mau}
                        onMoDatPhong={(id) => props.onMoDatPhong?.(id)}
                        onDatPhong={(canId, ngay) => props.onDatPhong({ canId, ngay })} />
      )}

      {chuaCoDatPhong && (
        <>
          <div className="cn1-trong">
            <span className="cn1-trong-ten">Chưa có đặt phòng nào</span>
            <span className="cn1-trong-mo">Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.</span>
            <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={() => props.onDatPhong()}>
              <Icon>{ICON_THEM}</Icon>Đặt phòng
            </button>
          </div>
          <p className="a4-meo">💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.</p>
        </>
      )}
    </KhungTabChu>
  );
}
