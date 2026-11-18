import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { CHU_LOI_MANG, useXinSo } from "../components/xin-so";
import { LoiMang } from "../services/kieu";
import { batDauTuLink, chuToastDaThemLich, moLink, themLich, type ManLink } from "../services/mo-link";
import { boNhoLich } from "../stores/lich";
import { boNhoLink } from "../stores/link";
import { layVai } from "../stores/vai";
import { CHU_DE_SAU_A10, NoiDungA10, NoiDungA1001 } from "./a10-man";
import { A8DuyetXinLich } from "./a8-duyet";
import { NoiDungA1Link, NoiDungA1LinkLoi } from "./a1-link";
import { ChuaTaiDuoc } from "./cn1-lich-thang";

// Màn mở từ link (mục "Mở app từ link mời của chủ nhà" (US6)): chọn A1-link, A1-link-01, A10 hoặc A10-01 theo tài khoản và link. Phần vẽ ở a10-man.tsx.

// Khung xám khi tải lần đầu (HV1 bước 1)
const KhungDangTaiLink = () => (
  <div className="noi-dung" aria-busy="true">
    <div className="khung-xam" style={{ height: 80 }} />
    <div className="khung-xam" style={{ height: 72 }} />
    <div className="khung-xam" style={{ height: 72 }} />
  </div>
);

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// Màn mở từ link: chọn A1-link, A1-link-01, A10 hoặc A10-01 theo tài khoản và link (mục "Mở app từ link mời của chủ nhà" (US6))
export const ManMoLink = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const ma = boNhoLink.ma();
  const [man, setMan] = useState<ManLink | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [dangVao, setDangVao] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const khoa = useRef(khoaMoi());
  const xin = useXinSo("chu_nha", CHU_DE_SAU_A10);

  const tai = useCallback(async () => {
    if (!ma) return dieuHuong(DUONG.A1, { replace: true, animate: false });
    try {
      setMan(await moLink(ma));
      setLoiTai(null);
    } catch (e) {
      setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, []);
  useEffect(() => {
    void tai();
  }, []);
  // Quay lại từ nền thì xem lại link (HV3 bước 2), trừ lúc đang lưu
  useKhiQuayLai(useCallback(() => void (!dangLuu && man && tai()), [dangLuu, man]));

  const loiViecChu = (e: unknown) => (e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa làm được. Bấm lại");

  const batDau = async () => {
    if (!ma) return;
    setDangVao(true);
    setLoiViec(null);
    try {
      const kq = await batDauTuLink(ma);
      if (kq.man === "a10" && man && "xem" in man) setMan({ man: "a10", xem: man.xem });
      else setMan({ man: "loi_link", coTaiKhoan: false });
    } catch (e) {
      setLoiViec(loiViecChu(e));
    } finally {
      setDangVao(false);
    }
  };

  const viecThem = async () => {
    if (!ma || !man || !("xem" in man)) return;
    setDangLuu(true);
    setLoiViec(null);
    try {
      const kq = await themLich(ma, khoa.current);
      if (kq.loai === "loi_link") return setMan({ man: "loi_link", coTaiKhoan: true });
      boNhoLich.xoa(); // lịch cũ của sale chưa có căn này
      if (kq.loai === "da_co") return setMan({ man: "a10_01", xem: man.xem });
      toast(chuToastDaThemLich(kq.ket_qua.so_can, kq.ket_qua.ten_hien_thi_chu_nha));
      dieuHuong(DUONG.LICH_SALE, { replace: true, animate: false });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới (HV1)
      setLoiViec(loiViecChu(e));
    } finally {
      setDangLuu(false);
    }
  };

  const vaoApp = () => {
    const v = layVai();
    dieuHuong(v === "sale" ? DUONG.LICH_SALE : v === "chu_nha" ? DUONG.LICH : DUONG.A3, { replace: true, animate: false });
  };

  if (!man) {
    return (
      <Page className="man">
        <DauMan ten="Thêm lịch" />
        {loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} /> : <KhungDangTaiLink />}
      </Page>
    );
  }
  // Link xin lịch của sale, chủ nhà mở (US17): A8, A8-01
  if (man.man === "a8" || man.man === "a8_01") return ma ? <A8DuyetXinLich ma={ma} man={man} /> : null;
  if (man.man === "a1_link") {
    return (
      <Page className="man man--trang">
        <NoiDungA1Link
          tenChuNha={man.xem.chu_nha.ten_hien_thi}
          soCan={man.xem.so_can}
          dangVao={dangVao}
          loi={loiViec}
          onBatDau={() => void batDau()}
          onMo={(d) => dieuHuong(d)}
        />
      </Page>
    );
  }
  if (man.man === "loi_link") {
    return (
      <Page className="man man--trang">
        <NoiDungA1LinkLoi dangVao={false} onVaoApp={vaoApp} />
      </Page>
    );
  }
  return (
    <Page className="man">
      <DauMan ten="Thêm lịch" />
      {matMang && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      )}
      {man.man === "a10" ? (
        <NoiDungA10 xem={man.xem} dangLuu={dangLuu} loi={loiViec} onThem={() => void xin.chay(viecThem)} />
      ) : (
        <NoiDungA1001 xem={man.xem} onXemLich={() => dieuHuong(DUONG.LICH_SALE, { replace: true, animate: false })} />
      )}
      {xin.popup}
    </Page>
  );
};
