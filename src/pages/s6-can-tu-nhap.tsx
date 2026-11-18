import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import {
  CHU_CAN_NAY,
  CHU_CHI_BAN_THAY,
  CHU_CHUA_CO_DAT_PHONG,
  CHU_CHUA_DUNG_APP,
  CHU_CHUA_THIET_KE_SUA,
  CHU_DAT_PHONG_DA_GHI,
  CHU_DE_SAU_S6,
  CHU_GHI_CHU_DAT_PHONG,
  CHU_GOI_HOI_LICH,
  CHU_GUI_CHO_KHACH,
  CHU_GUI_CHO_KHACH_PHU,
  CHU_GUI_KHACH_CHON_NGAY,
  CHU_HUONG_DAN_DAT_PHONG,
  CHU_KHONG_XOA,
  CHU_LOI_MO_ZALO_MOI,
  CHU_MOI_DUNG_APP_PHU,
  CHU_NUT_DAT_PHONG,
  CHU_SUA_THONG_TIN,
  CHU_SUA_THONG_TIN_PHU,
  CHU_XOA_CAN_TU_NHAP,
  CHU_XOA_GHI_CHU,
  chuCaiDau,
  chuKhoangDem,
  chuKhongCoLich,
  chuMoiDungApp,
  chuSdtChe,
  chuTienChenh,
  chuToastXoaCan,
  chuXacNhanXoa,
  dongPhuCanSale,
  tenCanSale,
  tinMoiChuCan,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { Icon } from "../components/icon";
import { useToast } from "../components/toast";
import { useXinSo } from "../components/xin-so";
import { deleteCan, getCanChiTiet } from "../services/api";
import { LoiApi, LoiMang, type CanChiTiet } from "../services/kieu";
import { chuDong } from "../services/mau-tin";
import { cacDem } from "../services/ngay";
import { zalo } from "../services/zalo";
import { boNhoLichSale } from "../stores/lich";
import { boNhoTabCan } from "../stores/can-sale";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS6CanTuNhap } from "./s6-can-tu-nhap-man";

// S6-03 · Chi tiết căn tự nhập, S6-03-00 khi chưa ghi đặt phòng nào (mục "Chi tiết căn tự nhập" (US16)). Mở từ nhóm "Căn tự nhập" ở S6, state { can_id }.
// Tải GET /can/:id (chỉ sale tạo đọc được, PQ14.SALE). Ngày không có đặt phòng không bao giờ ghi "trống" (US16-NT25).
// "Xóa căn tự nhập" phải bấm hai lần (US16-NT26): lần một chỉ hiện nút xác nhận, chưa gọi server.
// "Sửa thông tin căn" chưa có màn [MỞ: CH-076]. "Gửi cho khách" cần ngày khách hỏi (CH-078).
const khoaMoi = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

export const ManCanTuNhap = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const canId = (viTri.state as { can_id?: string } | null)?.can_id ?? "";
  const [can, setCan] = useState<CanChiTiet | null>(() => (canId ? boNhoTabCan.canChiTiet(canId) ?? null : null));
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState(false);
  const [xacNhanXoa, setXacNhanXoa] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);
  const [loiXoa, setLoiXoa] = useState<string | null>(null);
  const [loiMoi, setLoiMoi] = useState<string | null>(null);
  const lan = useRef(0);
  const khoaXoa = useRef(khoaMoi());
  const dangXoaRef = useRef(false);
  const xin = useXinSo("chu_nha", CHU_DE_SAU_S6);

  const tai = useCallback(async () => {
    if (!canId) return;
    const l = ++lan.current;
    setDangTai(true);
    try {
      const c = await getCanChiTiet(canId);
      if (l !== lan.current) return;
      if (c.loai !== "tu_nhap") {
        setCan(null);
        setKhongQuyen(true); // căn có lịch không phải căn tự nhập: không mở ở màn này
        return;
      }
      boNhoTabCan.ghiCanChiTiet(c);
      setCan(c);
      setLoi(null);
      setKhongQuyen(false);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi && (e.loi === "KHONG_TIM_THAY" || e.loi === "KHONG_CON_QUYEN")) {
        setCan(null);
        setKhongQuyen(true); // PQ14.SALE: căn tự nhập của sale khác hay đã xóa
      } else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, [canId]);

  useEffect(() => {
    if (!canId) {
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
      return;
    }
    void tai();
  }, [canId]);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const xacNhanXoaCan = async () => {
    if (dangXoaRef.current || !can) return;
    dangXoaRef.current = true;
    setDangXoa(true);
    setLoiXoa(null);
    try {
      await deleteCan(can.id, khoaXoa.current);
      boNhoTabCan.lamMoi();
      boNhoLichSale.lamMoi();
      toast(chuToastXoaCan(can.ma_can));
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoaXoa.current = khoaMoi();
      setLoiXoa(e instanceof LoiMang ? "Chưa xóa được, bấm lại khi có mạng" : "Có lỗi, chưa xóa được. Bấm lại");
      dangXoaRef.current = false;
      setDangXoa(false);
    }
  };

  const moi = () =>
    void xin.chay(async () => {
      setLoiMoi(null);
      const kq = await zalo.chiaSeChu(tinMoiChuCan(can?.ten_chu_can || "chủ căn"));
      if (kq === "loi") setLoiMoi(CHU_LOI_MO_ZALO_MOI);
    });

  if (!canId) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen) {
    noiDung = <div className="noi-dung"><KhongConXem onVe={() => dieuHuong(DUONG.CAN_SALE, { replace: true })} /></div>;
  } else if (!can) {
    noiDung = <div className="noi-dung">{loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />}</div>;
  } else {
    noiDung = (
      <NoiDungS6CanTuNhap
        can={can}
        xacNhanXoa={xacNhanXoa}
        dangXoa={dangXoa}
        loiXoa={loiXoa}
        loiMoi={loiMoi}
        onGoi={() => can.sdt_chu_can && void zalo.goiDien(can.sdt_chu_can)}
        onGuiKhach={() => {
          toast(CHU_GUI_KHACH_CHON_NGAY);
          dieuHuong(DUONG.TIM_PHONG);
        }}
        onSua={() => toast(CHU_CHUA_THIET_KE_SUA)}
        onMoi={moi}
        onXoa={() => setXacNhanXoa(true)}
        onXacNhanXoa={() => void xacNhanXoaCan()}
        onKhongXoa={() => {
          setXacNhanXoa(false);
          setLoiXoa(null);
        }}
        onDatPhong={() => dieuHuong(DUONG.GHI_DAT_PHONG, { state: { can_id: can.id } })}
      />
    );
  }
  return (
    <Page className="man">
      <DauMan ten={can ? tenCanSale(can) : "Căn tự nhập"} coLui />
      {matMang && can ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && can && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      {noiDung}
      {xin.popup}
    </Page>
  );
};
