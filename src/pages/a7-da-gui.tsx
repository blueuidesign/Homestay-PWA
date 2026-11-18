import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { ThanhTab } from "../components/thanh-tab";
import { getXinLichThongKe } from "../services/api";
import { LoiApi, LoiMang, type ThongKeXinLich } from "../services/kieu";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { NoiDungA7 } from "./a7-man";
import { ChuaTaiDuoc } from "./cn1-lich-thang";

// A7 · Đã gửi, chờ chủ nhà (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 3). Vào từ A6 sau khi gửi hay sao chép (state { vuaGui }), hoặc từ Cá nhân.
// GET /xin-lich/thong-ke; quay lại từ nền thì đọc lại để số đếm cập nhật (A7-01, HV3).
export const A7DaGui = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const matMang = useMatMang();
  const vuaGui = (viTri.state as { vuaGui?: boolean } | null)?.vuaGui === true;
  const [tk, setTk] = useState<ThongKeXinLich | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const lan = useRef(0);
  const coTk = useRef(false);

  const tai = useCallback(async () => {
    const l = ++lan.current;
    try {
      const kq = await getXinLichThongKe();
      if (l !== lan.current) return;
      coTk.current = true;
      setTk(kq);
      setLoi(null);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (!coTk.current) setLoi(e instanceof LoiMang ? "mang" : "khac"); // đã có số cũ thì giữ, chỉ báo mất kết nối ở banner
    }
  }, []);
  useEffect(() => {
    void tai();
  }, []);
  useKhiQuayLai(tai);

  return (
    <Page className="man">
      <DauMan ten="Lịch phòng" />
      {matMang && tk && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Số đếm có thể chưa mới nhất.
        </div>
      )}
      <div className="noi-dung">
        {tk ? (
          <NoiDungA7
            tk={tk}
            vuaGui={vuaGui}
            onGuiChoChuKhac={() => dieuHuong(DUONG.XIN_LICH)}
            onThemCanTuNhap={() => dieuHuong(DUONG.THEM_CAN_TU_NHAP)}
          />
        ) : loi ? (
          <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} />
        ) : (
          <KhungDangTai />
        )}
      </div>
      <ThanhTab dangO={DUONG.LICH_SALE} />
    </Page>
  );
};
