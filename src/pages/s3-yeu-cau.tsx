import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import type { TrangThaiTim } from "../components/tim-phong-hien-thi";
import { CHU_CHUA_GUI_DUOC, CHU_DE_SAU_YEU_CAU, CHU_LOI_CHUNG, TIEU_DE_S302, chuLoiKhongGui } from "../components/yeu-cau-hien-thi";
import { useXinSo } from "../components/xin-so";
import { getSaleCan, getSaleLich, postYeuCau } from "../services/api";
import { LoiApi, LoiMang, type ChiTietCanSale, type TrangThaiCanSale } from "../services/kieu";
import { congNgay } from "../services/ngay";
import { boNhoCanSale } from "../stores/lich";
import { boNhoLoiNhan } from "../stores/yeu-cau";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS302, type OLichCan } from "./s3-yeu-cau-man";

// S3-02 · Đặt phòng (mục "Sale gửi yêu cầu đặt phòng" (US15) bước 1 đến 3, 3a, 3b), S3-07 khi đêm vừa có người đặt. Mở từ S3 với state { can_id, ngay_nhan, ngay_tra }.
// Mở màn: GET /sale/can/:id?ngay_nhan&ngay_tra (giá chủ nhà, giá bán do server tính). Gửi: POST /yeu-cau (chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) trước nếu hồ sơ chưa có số,
// "Để sau" vẫn gửi). Lời nhắn giữ khi rời app (HV3), không tự gửi lại khi có mạng (HV2 bước 4). Cùng một lần gửi dùng một Idempotency-Key.
const khoaMoi = () => `yeu-cau-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export const ManYeuCauDatPhong = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiCanSale | null | undefined) ?? null;
  const canId = st?.can_id ?? "";
  const nhan = st?.ngay_nhan ?? null;
  const tra = st?.ngay_tra ?? null;
  const ngay = nhan && tra ? { nhan, tra } : null;
  const [can, setCan] = useState<ChiTietCanSale | null>(() => (st ? boNhoCanSale.lay(canId, nhan, tra)?.can ?? null : null));
  const [loiNhan, setLoiNhan] = useState(() => boNhoLoiNhan.lay(canId, nhan, tra));
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [datRoi, setDatRoi] = useState<{ o: OLichCan[] } | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const dangRef = useRef(false);
  const khoa = useRef(khoaMoi());
  const lanTai = useRef(0);
  const xin = useXinSo("chu_nha", CHU_DE_SAU_YEU_CAU);

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
    else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) setKhongQuyen(e.ly_do || null);
    else return false;
    return true;
  };

  const tai = useCallback(async () => {
    if (!canId) return;
    const l = ++lanTai.current;
    try {
      const c = await getSaleCan(canId, ngay ? { ngay_nhan: ngay.nhan, ngay_tra: ngay.tra } : {});
      if (l !== lanTai.current) return;
      setCan(c);
      setLoiTai(null);
      setKhongQuyen(false);
    } catch (e) {
      if (l !== lanTai.current) return;
      if (!xuLyLoi(e)) setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [canId, nhan, tra]);

  useEffect(() => {
    if (!st) {
      dieuHuong(DUONG.TIM_PHONG, { replace: true, animate: false });
      return;
    }
    void tai();
  }, []);
  // Quay lại từ nền (sau khi nhắn Zalo, gọi điện) thì tải lại căn; lời nhắn đang gõ giữ nguyên (HV3 bước 2)
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const doiLoiNhan = (chu: string) => {
    setLoiNhan(chu);
    boNhoLoiNhan.ghi(canId, nhan, tra, chu);
  };

  // Lịch của căn tải lại cho S3-07: từ trước ngày nhận một ngày tới ngày trả, tối đa 6 ô
  const taiLichSauTrung = async () => {
    if (!ngay) return [];
    try {
      const ls = await getSaleLich({ tu: congNgay(ngay.nhan, -1), so_ngay: 7 });
      const o = ls.can.find((x) => x.id === canId)?.o ?? [];
      return o.filter((x) => x.ngay <= ngay.tra).slice(0, 6) as OLichCan[];
    } catch {
      return [];
    }
  };

  const guiThat = async () => {
    if (!ngay || dangRef.current) return;
    dangRef.current = true;
    setDangGui(true);
    setLoi(null);
    try {
      const yc = await postYeuCau({ can_id: canId, ngay_nhan: ngay.nhan, ngay_tra: ngay.tra, loi_nhan: loiNhan.trim() ? loiNhan : null }, khoa.current);
      boNhoLoiNhan.xoa(canId, nhan, tra);
      khoa.current = khoaMoi();
      dieuHuong(DUONG.YEU_CAU_SALE, { state: { id: yc.id }, replace: true });
    } catch (e) {
      // Server trả lỗi (không phải mất mạng): lần bấm sau là lệnh mới, khóa mới (HV1, như CN5-A1)
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      if (xuLyLoi(e)) return;
      if (e instanceof LoiApi && e.loi === "TRUNG_LICH") {
        // mục "Sale gửi yêu cầu đặt phòng" (US15) bước 3a: không tạo yêu cầu, tải lại lịch của căn để thấy đêm đã kín
        setDatRoi({ o: await taiLichSauTrung() });
        void tai();
      } else if (e instanceof LoiApi && e.loi === "KHONG_CON_QUYEN") setLoi(chuLoiKhongGui(e.ly_do || "Bạn không còn gửi được yêu cầu cho căn này"));
      else setLoi(e instanceof LoiMang ? CHU_CHUA_GUI_DUOC : CHU_LOI_CHUNG);
    } finally {
      dangRef.current = false;
      setDangGui(false);
    }
  };

  const timCanKhac = () =>
    ngay &&
    dieuHuong(DUONG.KET_QUA_TIM, {
      state: { dk: { ngay_nhan: ngay.nhan, ngay_tra: ngay.tra, so_phong_ngu: [], loai_view: [], toa_nha_id: [] }, ten_toa: {} } satisfies TrangThaiTim,
    });

  if (!st) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = (
      <div className="noi-dung">
        <KhongConXem lyDo={khongQuyen || undefined} onVe={() => dieuHuong(DUONG.LICH_SALE, { replace: true })} />
      </div>
    );
  } else if (!can) {
    noiDung = (
      <div className="noi-dung">
        {loiTai ? (
          <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} />
        ) : (
          <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="khung-xam" style={{ height: 80 }} />
            <div className="khung-xam" style={{ height: 80 }} />
            <div className="khung-xam" style={{ height: 120 }} />
          </div>
        )}
      </div>
    );
  } else {
    noiDung = (
      <NoiDungS302
        can={can}
        ngay={ngay}
        loiNhan={loiNhan}
        dangGui={dangGui}
        loi={loi}
        datRoi={datRoi}
        onDoiLoiNhan={doiLoiNhan}
        onGui={() => void xin.chay(guiThat)}
        onTimCanKhac={timCanKhac}
        onChonNgay={() => dieuHuong(DUONG.TIM_PHONG)}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten={TIEU_DE_S302} coLui />
      {matMang && can && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Giá và lịch có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
      {xin.popup}
    </Page>
  );
};
