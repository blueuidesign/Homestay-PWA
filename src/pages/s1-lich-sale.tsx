import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { manKhiChamCan } from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { ThanhTab } from "../components/thanh-tab";
import { HopToast, TOAST_TU_TAT_MS, useToast } from "../components/toast";
import { KhungXoayNgang, useXoayNgang } from "../components/xoay-ngang";
import { getSaleLich, getXinLichThongKe, homNay } from "../services/api";
import { LoiApi, LoiMang, type CanLichSale, type LichSale, type SapXepLich, type ThongKeXinLich } from "../services/kieu";
import { congNgay } from "../services/ngay";
import { boNhoLichSale } from "../stores/lich";
import { NoiDungA5 } from "./a5-sale-moi";
import { NoiDungA7 } from "./a7-man";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungS1 } from "./s1-man";

// Tab Lịch của sale: S1, hoặc A5 khi chưa có nguồn phòng (YC1.4-NT2). Phần vẽ ở s1-man.tsx.

// Khung xám khi tải lần đầu (HV1 bước 1)
const KhungS1DangTai = () => (
  <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="khung-xam" style={{ height: 48 }} />
    <div className="khung-xam" style={{ height: 44 }} />
    <div className="khung-xam" style={{ height: 300 }} />
  </div>
);

export const TabLichSale = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const hom = homNay();
  const [tu, setTu] = useState(hom);
  const [sapXep, setSapXep] = useState<SapXepLich>("ten"); // S1-04
  const [lich, setLich] = useState<LichSale | null>(() => boNhoLichSale.tuan(hom) ?? null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const { dangNgang, gui } = useXoayNgang();
  const [toastNgang, setToastNgang] = useState("");
  // US17: chưa có nguồn phòng mà đã gửi link xin lịch thì tab Lịch là A7 (chờ chủ nhà), chưa gửi thì A5 [MỞ: YC1-H28]. undefined: đang đọc.
  const [tkXin, setTkXin] = useState<ThongKeXinLich | null | undefined>(undefined);
  const lan = useRef(0);
  const dangXem = useRef(tu);
  dangXem.current = tu;
  const dangXep = useRef(sapXep);
  dangXep.current = sapXep;

  const tai = useCallback(async (t: string) => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      const xep = dangXep.current;
      const kq = await getSaleLich({ tu: t, so_ngay: 7, sap_xep: xep });
      if (l !== lan.current) return;
      boNhoLichSale.ghi(kq, xep);
      setLich(kq);
      setLoi(null);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, []);

  useEffect(() => {
    setLich(boNhoLichSale.tuan(tu, sapXep) ?? null);
    setLoi(null);
    void tai(tu);
  }, [tu, sapXep]);

  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai(dangXem.current);
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(dangXem.current), []));

  const trong = !!lich && lich.can.length === 0;
  const trongRef = useRef(trong);
  trongRef.current = trong;
  const taiXin = useCallback(() => {
    getXinLichThongKe().then(setTkXin, () => setTkXin((cu) => cu ?? null)); // không đọc được thì A5, như trước US17
  }, []);
  useEffect(() => {
    if (trong) taiXin();
  }, [trong]);
  useKhiQuayLai(useCallback(() => void (trongRef.current && taiXin()), []));

  // Toast ở màn xoay giả tự vẽ trong khung quay, không dùng showToast của Zalo (S1-05 mục 4)
  useEffect(() => {
    if (!toastNgang) return;
    const hen = setTimeout(() => setToastNgang(""), TOAST_TU_TAT_MS);
    return () => clearTimeout(hen);
  }, [toastNgang]);
  useEffect(() => {
    if (!dangNgang) setToastNgang("");
  }, [dangNgang]);

  // Chạm một căn (YC5.1 bước 8): căn chủ nhà mở S3, căn của tôi mở S6-07, căn tự nhập mở S6-03
  const moCan = (c: CanLichSale) => {
    const m = manKhiChamCan(c.nhom, c.id);
    dieuHuong(m.duong, { state: m.state });
  };

  let noiDung: React.ReactNode;
  if (!lich) {
    noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai(tu)} /> : <KhungS1DangTai />;
  } else if (lich.can.length === 0) {
    noiDung =
      tkXin === undefined ? (
        <KhungS1DangTai />
      ) : tkXin && tkXin.so_lan_gui > 0 ? (
        <NoiDungA7 tk={tkXin} vuaGui={false} onGuiChoChuKhac={() => dieuHuong(DUONG.XIN_LICH)} onThemCanTuNhap={() => dieuHuong(DUONG.THEM_CAN_TU_NHAP)} />
      ) : (
        <NoiDungA5 onXinLich={() => dieuHuong(DUONG.XIN_LICH)} onThemThuCong={() => dieuHuong(DUONG.THEM_CAN_TU_NHAP)} />
      );
  } else {
    noiDung = (
      <NoiDungS1
        lich={lich}
        hom={hom}
        onDoiTuan={(h) => setTu(congNgay(tu, 7 * h))}
        onChuaLam={toast}
        xoay={false}
        onXoay={() => gui("bam-xoay-ngang")}
        onTim={() => dieuHuong(DUONG.TIM_PHONG)}
        sapXep={sapXep}
        onSapXep={setSapXep}
        onMoCan={moCan}
      />
    );
  }

  // S1-05: cả bảng quay 90 độ, không có thanh tab; "Xoay dọc" để trở lại
  if (dangNgang && lich && lich.can.length > 0) {
    return (
      <KhungXoayNgang>
        <NoiDungS1
          lich={lich}
          hom={hom}
          onDoiTuan={(h) => setTu(congNgay(tu, 7 * h))}
          onChuaLam={setToastNgang}
          xoay
          onXoay={() => gui("bam-xoay-doc")}
        />
        {toastNgang && <HopToast chu={toastNgang} onDong={() => setToastNgang("")} />}
      </KhungXoayNgang>
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Lịch phòng" />
      {matMang && lich ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && lich && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
      <ThanhTab dangO={DUONG.LICH_SALE} />
    </Page>
  );
};
