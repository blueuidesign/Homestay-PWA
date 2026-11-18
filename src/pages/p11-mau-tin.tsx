import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { CHU_MAU_QUA_DAI, CHU_MAU_TRONG, TIEU_DE_P11 } from "../components/gui-khach-hien-thi";
import { CHU_CHUA_LUU } from "../components/muc-cong-hien-thi";
import { getToi, patchToi } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { chenO, MAU_MAC_DINH, mauDeLuu, TOI_DA_KY_TU_MAU } from "../services/mau-tin";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungP11 } from "./p11-man";

// P11 · Mẫu tin gửi khách (mục "Mẫu tin gửi khách" (US14)): tải GET /toi, lưu PATCH /toi { mau_tin_gui_khach }.
// Chữ đang gõ nằm trong trạng thái của màn: rời app rồi quay lại vẫn còn (HV3 bước 2). Lưu lỗi thì giữ nguyên chữ, không tự lưu lại (HV2 bước 3, 4).
const khoaMoi = () => `mau-tin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const P11MauTin = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const cu = boNhoHoSo.lay();
  const coCu = cu?.mau_tin_gui_khach !== undefined;
  const [mau, setMau] = useState<string | null>(coCu ? cu!.mau_tin_gui_khach ?? MAU_MAC_DINH : null);
  const [tenSale, setTenSale] = useState<string | null>(cu?.ten_hien_thi ?? null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const khoa = useRef(khoaMoi());
  const daSua = useRef(false);
  const o = useRef<HTMLTextAreaElement>(null);
  const conTro = useRef<number | null>(null); // đặt lại con trỏ sau khi chèn ô

  const tai = async () => {
    try {
      const h = await getToi();
      boNhoHoSo.ghi(h);
      if (h.vai_chon !== "sale" || h.mau_tin_gui_khach === undefined) return dieuHuong(DUONG.CA_NHAN, { replace: true, animate: false });
      setTenSale(h.ten_hien_thi);
      if (!daSua.current) setMau(h.mau_tin_gui_khach ?? MAU_MAC_DINH);
      setLoiTai(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  };
  useEffect(() => {
    void tai();
  }, []);
  useLayoutEffect(() => {
    if (conTro.current !== null && o.current) {
      o.current.focus();
      o.current.setSelectionRange(conTro.current, conTro.current);
      conTro.current = null;
    }
  });

  const sua = (m: string) => {
    daSua.current = true;
    khoa.current = khoaMoi();
    setLoi(null);
    setMau(m);
  };
  // Chèn tại con trỏ; chưa đặt con trỏ thì ở cuối (mục "Mẫu tin gửi khách" (US14) bước 2)
  const chen = (ô: string) => {
    if (mau === null) return;
    const tu = o.current?.selectionStart ?? mau.length;
    const den = o.current?.selectionEnd ?? tu;
    const kq = chenO(mau, tu, den, ô);
    conTro.current = kq.conTro;
    sua(kq.mau);
  };

  const luu = async () => {
    if (mau === null || dangLuu) return;
    if (mau.trim() === "") return setLoi(CHU_MAU_TRONG);
    if (mau.length > TOI_DA_KY_TU_MAU) return setLoi(CHU_MAU_QUA_DAI);
    setDangLuu(true);
    setLoi(null);
    try {
      const h = await patchToi({ mau_tin_gui_khach: mauDeLuu(mau) }, khoa.current);
      boNhoHoSo.ghi(h);
      dieuHuong(DUONG.CA_NHAN, { replace: true });
    } catch (e) {
      setLoi(e instanceof LoiMang || !(e instanceof LoiApi) ? CHU_CHUA_LUU : "Có lỗi, chưa làm được. Bấm lại");
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten={TIEU_DE_P11} coLui />
      {matMang && mau !== null && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      )}
      {mau !== null ? (
        <NoiDungP11 mau={mau} tenSale={tenSale} dangLuu={dangLuu} loi={loi} oNhap={o} onDoiMau={sua} onChenO={chen} onDungLai={() => sua(MAU_MAC_DINH)} onLuu={() => void luu()} />
      ) : (
        <div className="noi-dung">{loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />}</div>
      )}
    </Page>
  );
};
