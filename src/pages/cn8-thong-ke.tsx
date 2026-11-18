import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { ManTam } from "../components/man-tam";
import { ThanhTab } from "../components/thanh-tab";
import { getThongKeChu, homNay } from "../services/api";
import { LoiApi, LoiMang, type ThongKeChu } from "../services/kieu";
import { thangCua } from "../services/ngay";
import { boNhoThongKe } from "../stores/thong-ke";
import { layVai } from "../stores/vai";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { HangChonThang, KhungThongKeDangTai, NoiDungThongKe } from "./cn8-man";

// Số tháng của biểu đồ (YC7.2): 6 cột, tháng đang xem ở cuối
const SO_THANG_BIEU_DO = 6;

// Tab Thống kê của chủ nhà: CN8, CN8-00 (YC7.1 đến YC7.3). Một lời gọi GET /thong-ke/chu?thang=&so_thang=6 đủ cho mọi khối.
// Khối "CHƯA THU TIỀN" (YC7.4) chưa có: [MỞ: YC7.4 bước 1, DC53 US18-Q1].
const ManThongKeChu = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const [thang, setThang] = useState(() => boNhoThongKe.dangXem() ?? thangCua(homNay()));
  const [tk, setTk] = useState<ThongKeChu | null>(() => boNhoThongKe.lay(thang) ?? null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const lan = useRef(0);
  const dangXem = useRef(thang);
  dangXem.current = thang;

  const tai = useCallback(async (t: string) => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      const kq = await getThongKeChu({ thang: t, so_thang: SO_THANG_BIEU_DO });
      if (l !== lan.current) return;
      boNhoThongKe.ghi(kq);
      setTk(kq);
      setLoi(null);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") {
        dieuHuong(DUONG.A1, { replace: true, animate: false });
        return;
      }
      setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, []);

  // Đổi tháng: hiện ngay số đã xem của tháng đó nếu có, rồi tải mới. Giữ tháng đang xem để rời app quay lại vẫn đúng (HV3 bước 2)
  useEffect(() => {
    boNhoThongKe.ghiDangXem(thang);
    setTk(boNhoThongKe.lay(thang) ?? null);
    setLoi(null);
    tai(thang);
  }, [thang]);

  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const taiLai = useCallback(() => void tai(dangXem.current), []);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) taiLai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(taiLai);

  let noiDung: React.ReactNode;
  if (tk) noiDung = <NoiDungThongKe tk={tk} />;
  else if (loi) noiDung = <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => tai(thang)} />;
  else noiDung = <KhungThongKeDangTai />;

  return (
    <Page className="man">
      <DauMan ten="Thống kê" />
      {matMang && tk ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && tk && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">
        <HangChonThang thang={thang} onDoi={setThang} />
        {noiDung}
      </div>
      <ThanhTab dangO={DUONG.THONG_KE} />
    </Page>
  );
};

// Hai vai dùng chung đường tab Thống kê. Chủ nhà: CN8. Sale: thống kê của sale là US19, tạm màn chờ như trước.
export const TabThongKe = () =>
  layVai() === "sale" ? <ManTam ten="Thống kê" chu="Thống kê làm ở US sau." tab={DUONG.THONG_KE} /> : <ManThongKeChu />;
