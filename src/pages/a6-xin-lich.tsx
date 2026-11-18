import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { CHU_A6_TIEU_DE, CHU_DE_SAU_A6, CHU_LOI_SAO_CHEP, CHU_LOI_ZALO_GUI, CHU_LY_DO_A6 } from "../components/xin-lich-hien-thi";
import { CHU_LOI_MANG, useXinSo } from "../components/xin-so";
import { getToi, postLink } from "../services/api";
import { LoiApi, LoiMang, type LinkMoi } from "../services/kieu";
import { guiXinLichQuaZalo, saoChepXinLich, tinXinLich } from "../services/xin-lich";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungA6 } from "./a6-man";

// A6 · Soạn tin xin link (YC1.6). Vào từ A5 (nút "Gửi tin nhắn xin lịch đến chủ nhà"), từ A7 ("Gửi link cho chủ nhà khác")
// và từ Cá nhân. Bước 1 POST /link { loai: "xin_lich" } (mỗi sale một link, có thì trả link đó) rồi dựng tin; bước 2, 4 ở services/xin-lich.ts.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const A6XinLich = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const [link, setLink] = useState<LinkMoi | null>(null);
  const [ten, setTen] = useState<string | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [dangLam, setDangLam] = useState(false);
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const dangLamRef = useRef(false);
  const khoa = useRef(khoaMoi()); // đổi khóa khi server đã trả lỗi (không phải mất mạng): lần sau là lệnh mới (HV1)
  const xin = useXinSo("chu_nha", CHU_DE_SAU_A6, CHU_LY_DO_A6);

  const tai = useCallback(async () => {
    try {
      const [l, h] = await Promise.all([postLink({ loai: "xin_lich" }, khoa.current), boNhoHoSo.lay() ?? getToi()]);
      boNhoHoSo.ghi(h);
      setTen(h.ten_hien_thi ?? h.ho_ten);
      setLink(l);
      setLoi(null);
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    }
  }, []);
  useEffect(() => {
    void tai();
  }, []);
  // Quay lại từ nền: chưa có link thì tải lại (HV3 bước 2); đang mở Zalo thì để việc gửi chạy tiếp
  useKhiQuayLai(() => {
    if (!link && !dangLamRef.current) void tai();
  });

  const tin = link ? tinXinLich(ten, link.duong_dan) : "";

  const lam = (viec: () => Promise<void>) => async () => {
    if (dangLamRef.current) return;
    dangLamRef.current = true;
    setDangLam(true);
    setLoiViec(null);
    try {
      await viec();
    } catch (e) {
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa làm được. Bấm lại");
    } finally {
      dangLamRef.current = false;
      setDangLam(false);
    }
  };
  // "Gửi qua Zalo": gửi xong sang A7 (A7-01). Đóng cửa sổ mà chưa gửi thì ở lại, không báo gì (như CN7).
  const viecGui = lam(async () => {
    if (!link) return;
    const kq = await guiXinLichQuaZalo(link, tin);
    if (kq === "da_gui") dieuHuong(DUONG.XIN_LICH_DA_GUI, { replace: true, animate: false, state: { vuaGui: true } });
    else if (kq === "loi") setLoiViec(CHU_LOI_ZALO_GUI);
  });
  // "Sao chép tin nhắn": sao chép rồi sang A7 (YC1.6 bước 4, RV2-F9)
  const viecSaoChep = lam(async () => {
    if (!link) return;
    if (await saoChepXinLich(link, tin)) dieuHuong(DUONG.XIN_LICH_DA_GUI, { replace: true, animate: false, state: { vuaGui: false } });
    else setLoiViec(CHU_LOI_SAO_CHEP);
  });

  return (
    <Page className="man">
      <DauMan ten={CHU_A6_TIEU_DE} coLui />
      {matMang && link && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Bấm lại khi có mạng.
        </div>
      )}
      {link ? (
        <NoiDungA6 tin={tin} dangLam={dangLam} loi={loiViec} onGui={() => void xin.chay(viecGui)} onSaoChep={() => void xin.chay(viecSaoChep)} />
      ) : (
        <div className="noi-dung">{loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />}</div>
      )}
      {xin.popup}
    </Page>
  );
};
