// Khối xin hủy, trả lời xin hủy ở chi tiết đặt phòng có sale của chủ nhà (CN3-02) và của sale (S3-10) (YC5.8, QD12).
// Vị trí: cuối chi tiết đặt phòng, như nút "Xóa đặt phòng" của khách lẻ (YC5-H17 Claude tự chốt US33). Hỏi lại trước khi xin
// (bước 33); bên kia thấy "<tên> xin hủy đặt phòng này" và hai nút (bước 34); nhãn ở cả hai bên (bước 35, 36). HV5 lỗi quyền.
import { useCallback, useEffect, useRef, useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuHuyDatPhong } from '../lib/dichVuHuyDatPhong';
import {
  CAU_DA_DONG_Y_HUY, CAU_DA_XIN_HUY, CAU_KHONG_DONG_Y_HUY, cauHoiXinHuy, cauNguoiXin, nhanHuy, type TinhTrangHuy,
} from '../lib/huyDatPhong';
import './KhoiHuyDatPhong.css';

export function KhoiHuyDatPhong(props: {
  bookingId: string; dv: DichVuHuyDatPhong | undefined;
  maCan: string; ngayNhan: string; ngayTra: string; tenBenKia: string;
  /** Sau khi xin hay trả lời: màn cha đọc lại đặt phòng (đã hủy thì đổi nhãn, ẩn nút sửa). */
  onDoi?: () => void;
}) {
  const { bookingId, dv, onDoi } = props;
  const [tt, datTt] = useState<TinhTrangHuy | null>(null);
  const [hoi, datHoi] = useState(false);
  const hienToast = useToast();
  const lan = useRef(0);

  const doc = useCallback(async () => {
    if (!dv) return;
    const so = ++lan.current;
    try {
      const r = await dv.tinhTrangHuy(bookingId);
      if (so === lan.current) datTt(r);
    } catch {
      // HV2: không đọc được thì không hiện khối; màn cha đã có báo lỗi mạng.
    }
  }, [dv, bookingId]);
  useEffect(() => { void doc(); }, [doc]);

  const lam = async (viec: () => Promise<void>, cau: string) => {
    try {
      await viec();
      hienToast(cau);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    }
    datHoi(false);
    await doc();
    onDoi?.();
  };

  if (!dv || !tt) return null;
  const nhan = nhanHuy(tt);
  return (
    <section className="khuy" aria-label="Hủy đặt phòng">
      {nhan && <span className={`khuy-nhan khuy-nhan--${tt.tinhTrang}`} role="status">{nhan}</span>}
      {tt.traLoiDuoc && (
        <>
          <p className="khuy-cau">{cauNguoiXin(tt)}</p>
          <div className="khuy-nut">
            <NutGhi chu="Không đồng ý" chuDangGhi="Đang lưu…" lop="hh-btn hh-btn--secondary hh-btn--block"
                    onGhi={() => lam(() => dv.traLoiHuy(bookingId, false), CAU_KHONG_DONG_Y_HUY)} />
            <NutGhi chu="Đồng ý hủy" chuDangGhi="Đang lưu…" lop="hh-btn hh-btn--primary hh-btn--block khuy-nut-huy"
                    onGhi={() => lam(() => dv.traLoiHuy(bookingId, true), CAU_DA_DONG_Y_HUY)} />
          </div>
        </>
      )}
      {tt.xinHuyDuoc && (
        <button type="button" className="hh-btn hh-btn--text khuy-xin" onClick={() => datHoi(true)}>Xin hủy</button>
      )}
      {hoi && (
        <>
          <div className="khuy-man-toi" onClick={() => datHoi(false)} aria-hidden="true" />
          <div className="khuy-hoi" role="alertdialog" aria-modal="true" aria-label="Xác nhận xin hủy">
            <p className="khuy-hoi-cau">{cauHoiXinHuy(props.maCan, props.ngayNhan, props.ngayTra, props.tenBenKia)}</p>
            <div className="khuy-nut">
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datHoi(false)}>Không</button>
              <NutGhi chu="Xin hủy" chuDangGhi="Đang gửi…" lop="hh-btn hh-btn--primary hh-btn--block khuy-nut-huy"
                      onGhi={() => lam(() => dv.xinHuy(bookingId), CAU_DA_XIN_HUY)} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
