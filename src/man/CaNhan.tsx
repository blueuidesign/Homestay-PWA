// Tab Cá nhân (YC1.3, US3): P1 chủ nhà, P4 sale. Đầu trang (ảnh hay chữ cái đầu, tên, số, vai), các nhóm dòng theo vai,
// "Đăng xuất" hỏi xác nhận rồi mới đăng xuất (YC1.3 bước 7). Trạng thái: HV1 khung xám, HV2 Thử lại (nút Đăng xuất vẫn có),
// HV3 quay lại từ nền đọc lại số chưa đọc. Chạm dòng thì màn cha mở màn của dòng (YC1.3-NT3).
import { useCallback, useEffect, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import type { Vai } from '../lib/dieuHuong';
import { chuCaiDau, chuVai, nhomMenu, tenHienCaNhan, type KhoaDong, type TongQuanCaNhan } from '../lib/caNhan';
import type { DichVuCaNhan } from '../lib/dichVuCaNhan';
import { Icon, ICON_TOI, KhungTabChu } from './TabChu';
import './CaNhan.css';

/** YC1.3 bước 7: câu hỏi xác nhận. */
export const CAU_XAC_NHAN_DANG_XUAT = 'Xác nhận đăng xuất? Dữ liệu vẫn giữ nguyên.';
/** YC1.3 bước 6. */
export const CHU_PHIEN_BAN = 'Home247 · phiên bản 1.0';

const ICON_RA = <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>;

export function CaNhan(props: {
  vai: Vai;
  dv?: DichVuCaNhan;
  /** Chạm một dòng (không phải dòng chỉ xem): màn cha mở màn của dòng. */
  onMo: (khoa: KhoaDong) => void;
  onDangXuat: () => void;
}) {
  const [tq, datTq] = useState<TongQuanCaNhan | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [hoi, datHoi] = useState(false);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      datTq(await dv.doc());
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  const chuNha = props.vai === 'chu_nha';
  const dangXuat = (
    <section className="cn-chan" aria-label="Đăng xuất">
      {hoi ? (
        <div className="cn-hoi" role="group" aria-label="Xác nhận đăng xuất">
          <p className="cn-hoi-cau">{CAU_XAC_NHAN_DANG_XUAT}</p>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onDangXuat}>Xác nhận đăng xuất</button>
          <button type="button" className="hh-btn hh-btn--text" onClick={() => datHoi(false)}>Hủy</button>
        </div>
      ) : (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datHoi(true)}>
          <Icon>{ICON_RA}</Icon>Đăng xuất
        </button>
      )}
      <p className="cn-phien-ban">{CHU_PHIEN_BAN}</p>
    </section>
  );

  const ten = tq ? tenHienCaNhan(tq) : '';
  return (
    <KhungTabChu tieuDe="Cá nhân">
      <div data-man={chuNha ? 'P1' : 'P4'} className="cn">
        {!tq ? (loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />) : (
          <>
            <section className="cn-dau" aria-label="Tài khoản của bạn">
              <span className="cn-anh" aria-hidden="true">{chuCaiDau(ten)}</span>
              <div className="cn-ten-khoi">
                <span className="cn-ten">{ten}</span>
                <span className="cn-phu">{[tq.soDienThoai, chuVai(props.vai)].filter(Boolean).join(' · ')}</span>
              </div>
            </section>
            {nhomMenu(props.vai, tq).map((n) => (
              <section key={n.tieuDe} className="cn-nhom" aria-label={n.tieuDe}>
                <h2 className="cn-nhom-ten">{n.tieuDe}</h2>
                <ul className="cn-ds">
                  {n.dong.map((d) => (
                    <li key={d.khoa}>
                      {d.tinh ? (
                        <div className="cn-dong" data-khoa={d.khoa}>
                          <span className="cn-dong-ten">{d.nhan}</span>
                          <span className="cn-dong-phu cn-dong-phu--email">{d.phu}</span>
                        </div>
                      ) : (
                        <button type="button" className="cn-dong" data-khoa={d.khoa} onClick={() => props.onMo(d.khoa)}>
                          <span className="cn-dong-ten">{d.nhan}</span>
                          {d.so !== undefined && d.so > 0 && <span className="cn-so" aria-label={`${d.so} chưa đọc`}>{d.so}</span>}
                          {d.phu && <span className="cn-dong-phu">{d.phu}</span>}
                          <span className="cn-toi" aria-hidden="true"><Icon>{ICON_TOI}</Icon></span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
        {dangXuat}
      </div>
    </KhungTabChu>
  );
}
