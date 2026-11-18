import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { CHU_CHUA_LUU, CHU_KHONG_MO_DUOC_GOI, chipDangChon, diDenTuS3, docSoTienMucCong } from "../components/muc-cong-hien-thi";
import { CHU_DE_SAU_S5 } from "../components/gui-khach-hien-thi";
import { useToast } from "../components/toast";
import { useXinSo } from "../components/xin-so";
import { getSaleCan, getSaleLich, homNay, putSaleCanMucCong } from "../services/api";
import { LoiApi, LoiMang, type ChiTietCanSale, type TrangThaiCanSale } from "../services/kieu";
import { cacDem, chuTien } from "../services/ngay";
import { zalo } from "../services/zalo";
import { boNhoCanSale, type CanSaleDaXem } from "../stores/lich";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS3, type TongGiaS3 } from "./s3-can-man";

// S3 · Chi tiết căn (mục "Chi tiết căn và giá bán" (US13)). Mở từ thẻ căn ở S2 với state { can_id, ngay_nhan, ngay_tra } (TrangThaiCanSale).
// Tải GET /sale/can/:id (giá do server tính), lịch 2 tuần từ GET /sale/lich?so_ngay=14. Chọn chip thì PUT /sale/can/:id/muc-cong
// và "Giá bán cho khách" lấy từ kết quả server. Lưu không được thì chip về mức đã lưu, báo "Chưa lưu được, bấm lại khi có mạng" (HV2 bước 3).
// Mở lại căn đã xem thì hiện ngay dữ liệu cũ kèm "Đang cập nhật…" (HV1 bước 2). Mất quyền: "Bạn không còn xem được mục này" (HV5).
const khoaMoi = () => `muc-cong-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
const CHO_NHAP_MS = 500;

const KhungS3DangTai = () => (
  <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="khung-xam" style={{ height: 220 }} />
    <div className="khung-xam" style={{ height: 80 }} />
    <div className="khung-xam" style={{ height: 64 }} />
    <div className="khung-xam" style={{ height: 120 }} />
  </div>
);

export const ManChiTietCanSale = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiCanSale | null | undefined) ?? null;
  const canId = st?.can_id ?? "";
  const nhan = st?.ngay_nhan ?? null;
  const tra = st?.ngay_tra ?? null;
  const ngay = nhan && tra ? { nhan, tra } : null;
  const cu = st ? boNhoCanSale.lay(canId, nhan, tra) : undefined;

  const [can, setCan] = useState<ChiTietCanSale | null>(cu?.can ?? null);
  const [lich, setLich] = useState<CanSaleDaXem["lich"]>(cu?.lich ?? null);
  const [muc, setMuc] = useState(cu?.can.muc_cong.so_tien ?? 0);
  const [gia, setGia] = useState<TongGiaS3>({ tong_gia_ban: cu?.can.tong_gia_ban });
  const [moTuyChon, setMoTuyChon] = useState(cu ? chipDangChon(cu.can.muc_cong.so_tien) === "tuy_chon" : false);
  const [chuNhap, setChuNhap] = useState(cu && chipDangChon(cu.can.muc_cong.so_tien) === "tuy_chon" ? chuTien(cu.can.muc_cong.so_tien) : "");
  const [viTriAnh, setViTriAnh] = useState(0);
  const [loiLuu, setLoiLuu] = useState<string | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const daLuu = useRef(cu?.can.muc_cong.so_tien ?? 0);
  const lanLuu = useRef(0);
  const dangLuu = useRef(false);
  const lanTai = useRef(0);
  const hen = useRef<ReturnType<typeof setTimeout>>();
  const xin = useXinSo("chu_nha", CHU_DE_SAU_S5);

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
    else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) setKhongQuyen(e.ly_do || null);
    else return false;
    return true;
  };

  const tai = useCallback(async () => {
    if (!canId) return;
    const l = ++lanTai.current;
    setDangTai(true);
    try {
      const c = await getSaleCan(canId, ngay ? { ngay_nhan: ngay.nhan, ngay_tra: ngay.tra } : {});
      // Lịch 2 tuần: lỗi riêng thì S3 vẫn hiện, chỉ thiếu lịch
      let o: CanSaleDaXem["lich"] = null;
      try {
        const ls = await getSaleLich({ tu: homNay(), so_ngay: 14 });
        o = ls.can.find((x) => x.id === canId)?.o ?? null;
      } catch (e) {
        if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") throw e;
      }
      if (l !== lanTai.current) return;
      const khachHoi = ngay ? cacDem(ngay.nhan, ngay.tra) : [];
      boNhoCanSale.ghi(canId, nhan, tra, { can: c, lich: o, ngay_khach_hoi: khachHoi });
      setCan(c);
      setLich(o);
      // Đang lưu dở thì không ghi đè chip người dùng vừa chọn (HV3)
      if (!dangLuu.current) {
        daLuu.current = c.muc_cong.so_tien;
        setMuc(c.muc_cong.so_tien);
        setGia({ tong_gia_ban: c.tong_gia_ban });
      }
      setKhongQuyen(false);
      setLoi(null);
    } catch (e) {
      if (l !== lanTai.current) return;
      if (!xuLyLoi(e)) setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lanTai.current) setDangTai(false);
    }
  }, [canId, nhan, tra]);

  useEffect(() => {
    if (!st) {
      dieuHuong(DUONG.TIM_PHONG, { replace: true, animate: false });
      return;
    }
    void tai();
    return () => clearTimeout(hen.current);
  }, [canId, nhan, tra]);

  // Có mạng lại hoặc quay lại từ nền (kể cả sau khi gọi điện) thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const luu = async (soTien: number) => {
    const l = ++lanLuu.current;
    dangLuu.current = true;
    setLoiLuu(null);
    try {
      const kq = await putSaleCanMucCong(canId, { so_tien: soTien, ...(ngay ? { ngay_nhan: ngay.nhan, ngay_tra: ngay.tra } : {}) }, khoaMoi());
      if (l !== lanLuu.current) return;
      daLuu.current = kq.so_tien;
      setGia({ tong_gia_ban: kq.tong_gia_ban });
      setCan((c) => {
        if (!c) return c;
        const moi = { ...c, muc_cong: { so_tien: kq.so_tien, rieng: true }, tong_gia_ban: kq.tong_gia_ban };
        boNhoCanSale.ghi(canId, nhan, tra, { can: moi, lich, ngay_khach_hoi: ngay ? cacDem(ngay.nhan, ngay.tra) : [] });
        return moi;
      });
    } catch (e) {
      if (l !== lanLuu.current) return;
      if (xuLyLoi(e)) return;
      // Chưa lưu: chip về mức đã lưu để giá bán đang hiện khớp chip (HV2 bước 3)
      setMuc(daLuu.current);
      setMoTuyChon(chipDangChon(daLuu.current) === "tuy_chon");
      setLoiLuu(e instanceof LoiMang ? CHU_CHUA_LUU : "Có lỗi, chưa làm được. Bấm lại");
    } finally {
      if (l === lanLuu.current) dangLuu.current = false;
    }
  };

  const chonMuc = (soTien: number) => {
    clearTimeout(hen.current);
    setMoTuyChon(false);
    setMuc(soTien);
    void luu(soTien);
  };
  const moTuy = () => {
    setMoTuyChon(true);
    setChuNhap(chipDangChon(muc) === "tuy_chon" ? chuTien(muc) : "");
  };
  const nhap = (chu: string) => {
    setChuNhap(chu);
    clearTimeout(hen.current);
    const n = docSoTienMucCong(chu);
    if (n === null) return;
    setMuc(n);
    hen.current = setTimeout(() => void luu(n), CHO_NHAP_MS);
  };

  const goi = async () => {
    const so = can?.chu_nha.so_dien_thoai;
    if (so && !(await zalo.goiDien(so))) toast(CHU_KHONG_MO_DUOC_GOI);
  };
  const di = (loai: "yeu_cau" | "gui_khach") => {
    const d = diDenTuS3(loai, canId, nhan, tra);
    dieuHuong(d.duong, { state: d.state });
  };

  if (!st) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = (
      <div className="noi-dung">
        <KhongConXem lyDo={khongQuyen || undefined} onVe={() => dieuHuong(DUONG.LICH_SALE, { replace: true })} />
      </div>
    );
  } else if (!can) {
    noiDung = (
      <div className="noi-dung">
        {loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungS3DangTai />}
      </div>
    );
  } else {
    noiDung = (
      <NoiDungS3
        can={can}
        ngay={ngay}
        muc={muc}
        gia={gia}
        moTuyChon={moTuyChon}
        chuNhap={chuNhap}
        viTriAnh={viTriAnh}
        lich={lich}
        ngayKhachHoi={ngay ? cacDem(ngay.nhan, ngay.tra) : []}
        loiLuu={loiLuu}
        onDoiAnh={setViTriAnh}
        onGoi={() => void goi()}
        onChonMuc={chonMuc}
        onMoTuyChon={moTuy}
        onNhap={nhap}
        onYeuCau={() => di("yeu_cau")}
        onGuiKhach={() => void xin.chay(() => di("gui_khach"))}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Chi tiết căn" coLui />
      {matMang && can ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && can && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      {noiDung}
      {xin.popup}
    </Page>
  );
};
