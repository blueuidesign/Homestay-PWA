import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { chuToastDaGuiLich } from "../components/sale-hien-thi";
import { useToast } from "../components/toast";
import { CHU_LOI_MANG, useXinSo } from "../components/xin-so";
import { getCan, getKetNoi } from "../services/api";
import { guiLichQuaZalo } from "../services/gui-lich";
import { LoiApi, LoiMang, type Can, type DongKetNoi } from "../services/kieu";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { CHU_DE_SAU_CN10, NoiDungCN10, saleGuiDuoc } from "./cn10-man";

// CN10 · Gửi lịch cho sale (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)). Vào từ nút "Gửi lịch cho sale" ở tab Lịch.
// Bước 1 GET /can, bước 3 GET /ket-noi, bước 4 POST /link { loai: "gui_lich", can_ids } rồi mở Zalo (services/gui-lich.ts).
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

const doi = (ds: string[], id: string) => (ds.includes(id) ? ds.filter((x) => x !== id) : [...ds, id]);

export const CN10GuiLich = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const [can, setCan] = useState<Can[] | null>(null);
  const [sale, setSale] = useState<DongKetNoi[] | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [canChon, setCanChon] = useState<string[]>([]);
  const [saleChon, setSaleChon] = useState<string[]>([]);
  const [dangGui, setDangGui] = useState(false);
  const [chuaGui, setChuaGui] = useState(false);
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const daCoCan = useRef(false);
  const dangGuiRef = useRef(false);
  // Một khóa cho một lựa chọn: bấm lại sau lỗi mạng dùng lại khóa, đổi lựa chọn thì khóa mới (HV2, server.md 1.6)
  const khoa = useRef(khoaMoi());
  const xin = useXinSo("sale", CHU_DE_SAU_CN10);

  const tai = useCallback(async () => {
    try {
      const [moiDau, k] = await Promise.all([getCan(), getKetNoi()]);
      const c = [...moiDau].reverse(); // GET /can xếp căn mới lên đầu; CN10 theo thứ tự tạo như canvas (1509 trước 3402)
      setCan(c);
      setSale(saleGuiDuoc(k));
      setLoi(null);
      // Lần đầu chọn sẵn mọi căn như canvas ("đã chọn 2/2"); lần tải lại chỉ bỏ id không còn
      if (!daCoCan.current) {
        daCoCan.current = true;
        setCanChon(c.map((x) => x.id));
      } else {
        const co = new Set(c.map((x) => x.id));
        setCanChon((cu) => cu.filter((id) => co.has(id)));
      }
      const coSale = new Set(saleGuiDuoc(k).map((x) => x.id));
      setSaleChon((cu) => cu.filter((id) => coSale.has(id)));
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    }
  }, []);

  useEffect(() => {
    tai();
  }, []);
  // Quay lại từ nền thì tải lại danh sách, giữ lựa chọn (HV3 bước 2); đang mở Zalo thì để việc gửi chạy tiếp
  useKhiQuayLai(() => {
    if (!dangGuiRef.current) tai();
  });

  const doiCan = (id: string) => {
    khoa.current = khoaMoi();
    setCanChon((cu) => doi(cu, id));
  };
  const doiSale = (id: string) => {
    khoa.current = khoaMoi();
    setSaleChon((cu) => doi(cu, id));
  };

  const viecGui = async () => {
    if (dangGuiRef.current || !can || !sale) return;
    dangGuiRef.current = true;
    setDangGui(true);
    setLoiViec(null);
    try {
      const nguoiNhan = sale.filter((d) => saleChon.includes(d.id)).map((d) => ({ id: d.id, ten: d.ten_hien_thi ?? "sale" }));
      const kq = await guiLichQuaZalo(canChon, nguoiNhan, khoa.current);
      if (kq.loai === "da_gui") {
        // CN10-02: về trang Lịch, toast chung tự tắt sau 3 giây (HV8)
        setChuaGui(false);
        toast(chuToastDaGuiLich);
        dieuHuong(DUONG.LICH, { replace: true, animate: false });
      } else if (kq.loai === "huy") {
        setChuaGui(true); // CN10-01
      } else {
        setLoiViec("Chưa mở được Zalo để gửi lịch. Bấm lại");
      }
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới (HV1)
      // Mất mạng: Zalo chưa mở, giữ nguyên lựa chọn, không tự gửi lại khi có mạng (US26-KB13)
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa gửi được. Bấm lại");
    } finally {
      dangGuiRef.current = false;
      setDangGui(false);
    }
  };

  let noiDung: React.ReactNode;
  if (!can || !sale) {
    noiDung = <div className="noi-dung">{loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={tai} /> : <KhungDangTai />}</div>;
  } else {
    noiDung = (
      <NoiDungCN10
        can={can}
        sale={sale}
        canChon={canChon}
        saleChon={saleChon}
        chuaGui={chuaGui}
        dangGui={dangGui}
        loi={loiViec}
        onDoiCan={doiCan}
        onTatCaCan={() => {
          khoa.current = khoaMoi();
          setCanChon(canChon.length === can.length ? [] : can.map((c) => c.id));
        }}
        onDoiSale={doiSale}
        onTatCaSale={() => {
          khoa.current = khoaMoi();
          setSaleChon(saleChon.length === sale.length ? [] : sale.map((d) => d.id));
        }}
        onGui={() => void xin.chay(viecGui)}
        onThemSale={() => dieuHuong(DUONG.SALE_THEM)}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Gửi lịch cho sale" coLui />
      {matMang && can && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Danh sách có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
      {xin.popup}
    </Page>
  );
};
