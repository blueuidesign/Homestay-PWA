import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { BUOC_SAU_LUU_SUA, quayVeNoiMo } from "../components/quay-ve";
import { useToast } from "../components/toast";
import { getBooking, getKhachLe, getKiemTrung, getLichThang, getSaleKetNoi, homNay, patchBooking } from "../services/api";
import {
  LoiApi,
  LoiMang,
  type CanTrenLich,
  type DatPhong,
  type KiemTrung,
  type SaleKetNoi,
} from "../services/kieu";
import { thangCua } from "../services/ngay";
import { boNhoLich } from "../stores/lich";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem, tenNguoiDat } from "./cn3-man";
import { docTien, NoiDungCN4, ngayTraTheoChip, type FormCN4 } from "./cn4-dat-phong";
import { chuToastDaSua, formTuDatPhong, loiKhiSua, thanSua } from "./cn4-sua-man";

// CN4-02 · Sửa đặt phòng (YC4.3): phần tải dữ liệu và gọi server. Điền sẵn và thân PATCH ở cn4-sua-man.ts.

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN4SuaDatPhong = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const id = (useLocation().state as { id?: string } | null)?.id;
  const [dp, setDp] = useState<DatPhong | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | "khong" | null>(null);
  const [can, setCan] = useState<CanTrenLich[]>([]);
  const [sale, setSale] = useState<SaleKetNoi[]>([]);
  const [khachLe, setKhachLe] = useState<string[]>([]);
  const [form, setForm] = useState<FormCN4 | null>(null);
  const [kiemTra, setKiemTra] = useState<KiemTrung | null>(null);
  const [daSuaTien, setDaSuaTien] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const dangLuuRef = useRef(false);
  const lanKiem = useRef(0);
  const khoa = useRef(khoaMoi());

  const tai = useCallback(async () => {
    if (!id) return;
    try {
      const d = await getBooking(id);
      setDp(d);
      setForm((f) => f ?? formTuDatPhong(d));
      setLoiTai(null);
      const lich = await getLichThang({ thang: thangCua(homNay()) });
      setCan(lich.can);
      const [s, k] = await Promise.all([getSaleKetNoi(), getKhachLe()]);
      setSale(s);
      setKhachLe(k.muc.map((m) => m.ten_khach));
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi) setLoiTai("khong");
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [id]);

  useEffect(() => {
    if (!id) dieuHuong(DUONG.LICH, { replace: true, animate: false });
    else tai();
  }, []);

  const tra = form ? ngayTraTheoChip(form.ngayNhan, form.chipDem, form.traTuyChon) : "";

  // Kiểm trùng bỏ qua chính đặt phòng này (YC4.3 bước 2, QT1.2)
  useEffect(() => {
    if (!form?.canId || !id) return;
    const lan = ++lanKiem.current;
    setKiemTra(null);
    getKiemTrung({ can_id: form.canId, ngay_nhan: form.ngayNhan, ngay_tra: tra, bo_qua_id: id }).then(
      (kq) => lan === lanKiem.current && setKiemTra(kq),
      () => {},
    );
  }, [form?.canId, form?.ngayNhan, tra]);

  const doi = (moi: Partial<FormCN4>) => {
    if ("tienPhong" in moi) setDaSuaTien(true);
    khoa.current = khoaMoi();
    setLoiChung(null);
    setForm((f) => (f ? { ...f, ...moi } : f));
  };

  const luu = async () => {
    if (!dp || !form || dangLuuRef.current) return;
    if (docTien(form.tienPhong) === null) {
      setDaSuaTien(true);
      return;
    }
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      await patchBooking(dp.id, thanSua(dp, form), khoa.current);
      boNhoLich.lamMoi();
      toast(chuToastDaSua);
      // Về đúng màn đã mở chức năng sửa, bỏ qua CN3-02 ở giữa (US10, Tùng quyết 04/11/2026)
      quayVeNoiMo(dieuHuong, BUOC_SAU_LUU_SUA);
    } catch (e) {
      setLoiChung(loiKhiSua(e));
      if (e instanceof LoiApi && e.loi === "TRUNG_LICH" && form.canId) {
        getKiemTrung({ can_id: form.canId, ngay_nhan: form.ngayNhan, ngay_tra: tra, bo_qua_id: dp.id }).then(setKiemTra, () => {});
      }
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  let noiDung: React.ReactNode;
  if (dp && form) {
    noiDung = (
      <NoiDungCN4
        can={can}
        sale={sale}
        khachLe={khachLe}
        form={form}
        kiemTra={kiemTra}
        daSuaTien={daSuaTien}
        dangLuu={dangLuu}
        loiChung={loiChung}
        onDoi={doi}
        onLuu={luu}
        onChuaLam={toast}
        sua={{ laSale: dp.nguoi_dat.loai === "sale", tenNguoiDat: dp.nguoi_dat.ten }}
      />
    );
  } else if (loiTai === "khong") {
    noiDung = <KhongConXem onVe={() => dieuHuong(DUONG.LICH, { replace: true })} />;
  } else if (loiTai) {
    noiDung = <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={tai} />;
  } else {
    noiDung = (
      <div className="noi-dung" aria-busy="true">
        <KhungDangTai />
      </div>
    );
  }

  return (
    <Page className="man">
      <DauMan ten={dp ? `Sửa đặt phòng · ${tenNguoiDat(dp)}` : "Sửa đặt phòng"} coLui />
      {matMang && form && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Bấm lưu khi có mạng.
        </div>
      )}
      {noiDung}
    </Page>
  );
};
