import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import {
  CHU_DANG_LUU,
  CHU_GHI_CHU_GIA_DIEN_SAN,
  CHU_GHI_CHU_THEM_SAU,
  CHU_LOI_LUU_CHUNG,
  CHU_LOI_LUU_MANG,
  CHU_NUT_DAT_PHONG,
  CHU_S6_05_TIEU_DE,
  TOI_DA_DEM_GHI,
  chuBanLoi,
  chuBaoTrung,
  chuDaChot,
  chuKhoangDem,
  chuToastDaLuuDatPhong,
  docTien,
  tenCanSale,
  viTien,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { getCanChiTiet, getKiemTrung, homNay, postBooking } from "../services/api";
import { LoiApi, LoiMang, type CanChiTiet, type KiemTrung } from "../services/kieu";
import { congNgay, chuNgayNgan } from "../services/ngay";
import { boNhoLichSale } from "../stores/lich";
import { boNhoTabCan } from "../stores/can-sale";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS6GhiDatPhong, type FormGhi } from "./s6-ghi-dat-phong-man";

// S6-05 · Đặt phòng căn tự nhập, một màn (YC6.5), và S6-06 (toast "Đã lưu đặt phòng ..., tính vào thống kê tháng 10").
// Mở từ S6-03, state { can_id }. Ngày nhận chọn bằng chip Hôm nay, Mai, Ngày khác; số đêm bằng − và +. Tiền điền sẵn từ
// GET /booking/kiem-trung (giá chủ đã lưu, giá bán cộng mức cộng), sale sửa được; đã sửa tay thì không điền đè nữa.
// Không có trạng thái tiền, cọc, số khách, ghi chú (thêm sau). Trùng đặt phòng đã ghi của chính căn này: báo trùng, không lưu (QT1.3).
// Khóa chống bấm hai lần giữ nguyên khi lỗi mạng, đổi khi server đã trả lỗi (HV1).
const khoaMoi = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

export const ManGhiDatPhongTuNhap = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const canId = (viTri.state as { can_id?: string } | null)?.can_id ?? "";
  const hom = homNay();
  const [can, setCan] = useState<CanChiTiet | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState(false);
  const [form, setForm] = useState<FormGhi>({ chip: "hom", ngayNhan: hom, soDem: 1, tra: "", thu: "" });
  const [trung, setTrung] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const daSuaTra = useRef(false);
  const daSuaThu = useRef(false);
  const lanKiem = useRef(0);
  const khoa = useRef(khoaMoi());
  const dangLuuRef = useRef(false);

  const taiCan = useCallback(async () => {
    if (!canId) return;
    try {
      const c = await getCanChiTiet(canId);
      if (c.loai !== "tu_nhap") setKhongQuyen(true);
      else setCan(c);
      setLoiTai(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi && (e.loi === "KHONG_TIM_THAY" || e.loi === "KHONG_CON_QUYEN")) setKhongQuyen(true);
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [canId]);

  useEffect(() => {
    if (!canId) {
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
      return;
    }
    void taiCan();
  }, [canId]);

  // Điền sẵn tiền và báo trùng mỗi khi đổi khoảng ngày (YC6.5 bước 4, 5a). Ô đã sửa tay thì giữ nguyên.
  const ngayTra = congNgay(form.ngayNhan, form.soDem);
  useEffect(() => {
    if (!can) return;
    const l = ++lanKiem.current;
    getKiemTrung({ can_id: can.id, ngay_nhan: form.ngayNhan, ngay_tra: ngayTra })
      .then((k: KiemTrung) => {
        if (l !== lanKiem.current) return;
        setTrung(k.khong_trung ? null : k.dem_trung[0] ?? null);
        setForm((f) => ({
          ...f,
          tra: daSuaTra.current ? f.tra : k.tong_gia_chu === null ? "" : viTien(String(k.tong_gia_chu)),
          thu: daSuaThu.current ? f.thu : k.tong_gia_ban === null || k.tong_gia_ban === undefined ? "" : viTien(String(k.tong_gia_ban)),
        }));
      })
      .catch(() => {
        // Báo sớm không được thì thôi: lúc lưu server vẫn chặn trùng (QT1.3)
      });
  }, [can?.id, form.ngayNhan, ngayTra]);

  const doiKhoangNgay = (moi: Partial<FormGhi>) => {
    khoa.current = khoaMoi(); // đổi nội dung thì là lệnh mới (HV1)
    setLoi(null);
    setForm((f) => ({ ...f, ...moi }));
  };

  const luu = async () => {
    if (dangLuuRef.current || !can) return;
    const tra = docTien(form.tra);
    const thu = docTien(form.thu);
    if (tra === null || thu === null) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoi(null);
    try {
      await postBooking(
        { can_id: can.id, ngay_nhan: form.ngayNhan, ngay_tra: ngayTra, ten_khach: null, tien_phong: tra, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null, gia_ban: thu },
        khoa.current,
      );
      boNhoTabCan.lamMoi();
      boNhoLichSale.lamMoi();
      // S6-06: toast, rồi về S6-03 với danh sách có thêm dòng mới
      toast(chuToastDaLuuDatPhong(form.ngayNhan, ngayTra));
      dieuHuong(DUONG.CAN_TU_NHAP, { replace: true, state: { can_id: can.id } });
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "TRUNG_LICH") {
        setTrung(e.dem_trung?.[0] ?? form.ngayNhan);
        setLoi(null);
        khoa.current = khoaMoi();
      } else if (e instanceof LoiMang) {
        setLoi(CHU_LOI_LUU_MANG); // giữ khóa: bấm lại không tạo hai đặt phòng
      } else {
        khoa.current = khoaMoi();
        setLoi(CHU_LOI_LUU_CHUNG);
      }
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  if (!canId) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen) noiDung = <div className="noi-dung"><KhongConXem onVe={() => dieuHuong(DUONG.CAN_SALE, { replace: true })} /></div>;
  else if (!can) noiDung = <div className="noi-dung">{loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void taiCan()} /> : <KhungDangTai />}</div>;
  else {
    noiDung = (
      <NoiDungS6GhiDatPhong
        can={can}
        hom={hom}
        form={form}
        trung={trung}
        loi={loi}
        dangLuu={dangLuu}
        onChip={(c) => doiKhoangNgay({ chip: c, ...(c === "hom" ? { ngayNhan: hom } : c === "mai" ? { ngayNhan: congNgay(hom, 1) } : {}) })}
        onNgayKhac={(n) => doiKhoangNgay({ ngayNhan: n })}
        onSoDem={(n) => doiKhoangNgay({ soDem: Math.min(TOI_DA_DEM_GHI, Math.max(1, n)) })}
        onTra={(c) => {
          daSuaTra.current = true;
          doiKhoangNgay({ tra: viTien(c) });
        }}
        onThu={(c) => {
          daSuaThu.current = true;
          doiKhoangNgay({ thu: viTien(c) });
        }}
        onLuu={() => void luu()}
      />
    );
  }
  return (
    <Page className="man">
      <DauMan ten={can ? tenCanSale(can) : CHU_S6_05_TIEU_DE} coLui />
      {matMang && can && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Bấm Đặt phòng khi có mạng.
        </div>
      )}
      {noiDung}
    </Page>
  );
};
