import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { CHU_DE_SAU_S5, diDenGuiKhach } from "../components/gui-khach-hien-thi";
import { useToast } from "../components/toast";
import { useXinSo } from "../components/xin-so";
import { laCanCuaToi, type TrangThaiTim } from "../components/tim-phong-hien-thi";
import { getSaleTim, getSaleTimLichTuan } from "../services/api";
import { LoiApi, LoiMang, type CanTim, type DieuKienTim, type GoiYTim, type KetQuaTim, type LichTuanTim, type TrangThaiCanSale } from "../services/kieu";
import { boNhoTim } from "../stores/lich";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungS200, NoiDungS2, NoiDungS4 } from "./s2-man";

// S2, S2-00, S4 · Kết quả tìm phòng (mục "Kết quả tìm phòng" (US12)). Mở từ "Tìm phòng trống" ở S1-03 với state { dk, ten_toa }.
// Lần mở đầu ghi Tìm gần đây (ghi_lich_su); tải lại (quay lại từ nền, có mạng lại) thì không ghi thêm.
// Dấu tích giữ trong bộ nhớ của màn: chuyển Danh sách / Lịch tuần, tải lại không mất. Căn không còn trong kết quả thì bỏ tích (HV5).
// "Gửi cho khách" (US14): hồ sơ chưa có số thì popup xin tên và số trước (mục "Gửi thông tin cho khách qua Zalo" (US14) bước 0), rồi mở S5 với các căn đã tích theo thứ tự tích. Chạm thẻ căn mở S3 (US13).
const KhungKetQuaDangTai = () => (
  <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="khung-xam" style={{ height: 44 }} />
    <div className="khung-xam" style={{ height: 44 }} />
    <div className="khung-xam" style={{ height: 110 }} />
    <div className="khung-xam" style={{ height: 110 }} />
  </div>
);

export const ManKetQuaTim = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiTim | null | undefined) ?? null;
  const [dk, setDk] = useState<DieuKienTim | null>(st?.dk ?? null);
  const tenToa = st?.ten_toa ?? {};
  const [che, setChe] = useState<"ds" | "tuan">("ds");
  const [ket, setKet] = useState<KetQuaTim | null>(() => (st ? boNhoTim.ketQua(st.dk) ?? null : null));
  const [lich, setLich] = useState<LichTuanTim | null>(() => (st ? boNhoTim.lichTuan(st.dk) ?? null : null));
  const [chon, setChon] = useState<string[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const lan = useRef(0);
  const xin = useXinSo("chu_nha", CHU_DE_SAU_S5);
  const daGhi = useRef(false);
  const dangXem = useRef({ dk, che });
  dangXem.current = { dk, che };

  const tai = useCallback(async (d: DieuKienTim, c: "ds" | "tuan") => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      if (c === "ds") {
        const kq = await getSaleTim({ ...d, ghi_lich_su: !daGhi.current });
        daGhi.current = true;
        if (l !== lan.current) return;
        boNhoTim.ghiKetQua(d, kq);
        setKet(kq);
        setChon((cu) => cu.filter((id) => kq.can.some((x) => x.id === id)));
      } else {
        const kq = await getSaleTimLichTuan(d);
        if (l !== lan.current) return;
        boNhoTim.ghiLichTuan(d, kq);
        setLich(kq);
        setChon((cu) => cu.filter((id) => kq.can.some((x) => x.id === id)));
      }
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
    if (!dk) {
      dieuHuong(DUONG.TIM_PHONG, { replace: true, animate: false });
      return;
    }
    setKet(boNhoTim.ketQua(dk) ?? null);
    setLich(boNhoTim.lichTuan(dk) ?? null);
    setLoi(null);
    void tai(dk, che);
  }, [dk, che]);

  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang && dangXem.current.dk) void tai(dangXem.current.dk, dangXem.current.che);
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => dangXem.current.dk && void tai(dangXem.current.dk, dangXem.current.che), []));

  if (!dk) return null;
  const tich = (id: string) => setChon((cu) => (cu.includes(id) ? cu.filter((x) => x !== id) : [...cu, id]));
  const sua = () => dieuHuong(DUONG.TIM_PHONG, { state: { dk, ten_toa: tenToa } satisfies TrangThaiTim });
  const goiYChon = (g: GoiYTim) => {
    daGhi.current = false; // điều kiện mới là một lần tìm mới
    setDk(g.dieu_kien);
  };
  const gui = () => {
    const d = diDenGuiKhach(chon, dk.ngay_nhan, dk.ngay_tra);
    void xin.chay(() => dieuHuong(d.duong, { state: d.state }));
  };
  // Chạm thẻ căn nguồn phòng mở S3 với đúng căn và ngày đang tìm (mục "Kết quả tìm phòng" (US12) bước 6). Căn của tôi, căn tự nhập: S3 chưa chốt [MỞ: DC53 api/sale.md câu hỏi 2]
  const moCan = (c: CanTim) =>
    laCanCuaToi(c)
      ? toast("Chi tiết căn của bạn làm ở US16")
      : dieuHuong(DUONG.CAN_SALE_CHI_TIET, { state: { can_id: c.id, ngay_nhan: dk.ngay_nhan, ngay_tra: dk.ngay_tra } satisfies TrangThaiCanSale });

  const daCo = che === "ds" ? ket : lich;
  let noiDung: React.ReactNode;
  if (!daCo) {
    noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai(dk, che)} /> : <KhungKetQuaDangTai />;
  } else if (che === "tuan" && lich) {
    noiDung = <NoiDungS4 lich={lich} dk={dk} tenToa={tenToa} chon={chon} onTich={tich} onChe={setChe} onSua={sua} onGui={gui} />;
  } else if (ket && ket.can.length === 0) {
    noiDung = <NoiDungS200 dk={dk} tenToa={tenToa} goiY={ket.goi_y} onSua={sua} onGoiY={goiYChon} />;
  } else if (ket) {
    noiDung = <NoiDungS2 ket={ket} dk={dk} tenToa={tenToa} chon={chon} onTich={tich} onMoCan={moCan} onChe={setChe} onSua={sua} onGui={gui} />;
  }

  return (
    <Page className="man">
      <DauMan ten="Kết quả" coLui />
      {matMang && daCo ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && daCo && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
      {xin.popup}
    </Page>
  );
};
