import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { ThanhTab } from "../components/thanh-tab";
import { getToi } from "../services/api";
import { LoiApi, LoiMang, type HoSo } from "../services/kieu";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungP2 } from "./p2-man";

// P2 · Thông tin cá nhân, chỉ phần Số điện thoại (YC1.5.3) và tên lấy từ Zalo. Phần sửa tên, ảnh, lưu: US21.
export const P2ThongTinCaNhan = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const [ho_so, setHoSo] = useState<HoSo | null>(() => boNhoHoSo.lay());
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);

  const tai = async () => {
    try {
      const h = await getToi();
      boNhoHoSo.ghi(h);
      setHoSo(h);
      setLoi(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    }
  };
  useEffect(() => {
    tai();
  }, []);
  useKhiQuayLai(tai);

  return (
    <Page className="man">
      <DauMan ten="Thông tin cá nhân" coLui />
      {matMang && ho_so && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      )}
      <div className="noi-dung">
        {ho_so ? <NoiDungP2 ho_so={ho_so} /> : loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={tai} /> : <KhungDangTai />}
      </div>
      <ThanhTab dangO={DUONG.CA_NHAN} />
    </Page>
  );
};
