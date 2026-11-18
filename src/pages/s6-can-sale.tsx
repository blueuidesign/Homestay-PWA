import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import {
  CHU_BO_KHOI_DANH_SACH,
  CHU_DA_XOA_PHU,
  CHU_DA_XOA_TAI_KHOAN,
  CHU_DE_SAU_S6,
  CHU_GUI_LOI_MOI,
  CHU_LOI_BO_DONG,
  CHU_LOI_MO_ZALO_MOI,
  CHU_NHAN_CUA_TOI,
  CHU_S6_00_MO_TA,
  CHU_S6_00_THEM_CAN,
  CHU_S6_00_TIEU_DE,
  CHU_S6_00_XIN_LICH,
  CHU_THEM_CAN,
  CHU_THEM_CAN_TU_NHAP,
  TEN_NHOM_S6,
  TIEU_DE_S6,
  chuCaiDau,
  chuGoiYMoi,
  chuToastBoDong,
  chuTinhTrangHomNay,
  demChuNhaConKetNoi,
  dongCanTuNhap,
  dongPhuCanSale,
  manKhiChamCan,
  manKhiChamChuNha,
  tenCanSale,
  tinMoiChuCan,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { Icon } from "../components/icon";
import { ThanhTab } from "../components/thanh-tab";
import { useToast } from "../components/toast";
import { useXinSo } from "../components/xin-so";
import { deleteKetNoi, getCanSale, getNguonPhong } from "../services/api";
import { LoiApi, LoiMang, type Can, type DongNguonPhong, type NguonPhong } from "../services/kieu";
import { zalo } from "../services/zalo";
import { boNhoLichSale } from "../stores/lich";
import { boNhoTabCan } from "../stores/can-sale";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { NoiDungS6 } from "./s6-man";
import { ChuaTaiDuoc } from "./cn1-lich-thang";

// Tab Căn của sale (S6, S6-00, S6-08; YC6.1). Mở màn: GET /can (căn của tôi, căn tự nhập) và GET /ket-noi (nguồn phòng).
// Chạm căn của tôi: S6-07. Chạm tên chủ nhà: S6-04. Chạm căn dưới chủ nhà: S3. Chạm căn tự nhập: S6-03.
// Dòng chủ nhà đã rút quyền (S6-08): không chạm vào mở gì, có nút "Bỏ khỏi danh sách", bỏ ngay không hỏi lại, không tính vào số đếm.
const khoaMoi = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

export const TabCanSale = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const [du, setDu] = useState(() => boNhoTabCan.tab() ?? null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [dangBoId, setDangBoId] = useState<string | null>(null);
  const [loiBo, setLoiBo] = useState<string | null>(null);
  const [loiMoi, setLoiMoi] = useState<string | null>(null);
  const lan = useRef(0);
  const khoaBo = useRef(khoaMoi());
  const dangBoRef = useRef(false);
  const xin = useXinSo("chu_nha", CHU_DE_SAU_S6);

  const tai = useCallback(async () => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      const [can, nguon] = await Promise.all([getCanSale(), getNguonPhong()]);
      if (l !== lan.current) return;
      boNhoTabCan.ghiTab({ can, nguon });
      setDu({ can, nguon });
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
    void tai();
  }, []);
  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const boDong = async (d: DongNguonPhong) => {
    if (dangBoRef.current) return;
    dangBoRef.current = true;
    setDangBoId(d.id);
    setLoiBo(null);
    try {
      await deleteKetNoi(d.id, khoaBo.current);
      khoaBo.current = khoaMoi();
      boNhoTabCan.lamMoi();
      boNhoLichSale.lamMoi();
      // Dòng biến ngay (YC6.1-NT7), không hỏi lại
      setDu((cu) => (cu ? { ...cu, nguon: { ...cu.nguon, nguon_phong: cu.nguon.nguon_phong.filter((x) => x.id !== d.id) } } : cu));
      toast(chuToastBoDong(d.ten_hien_thi));
    } catch (e) {
      if (!(e instanceof LoiMang)) khoaBo.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới
      setLoiBo(e instanceof LoiMang ? CHU_LOI_BO_DONG : "Có lỗi, chưa bỏ được. Bấm lại");
    } finally {
      dangBoRef.current = false;
      setDangBoId(null);
    }
  };

  // Lời mời: chạy YC1.5 nếu hồ sơ chưa có số (QD2), rồi mở cửa sổ chia sẻ của Zalo; app không tự gửi tin (YC6.1-NT3)
  const moi = (ten: string) =>
    void xin.chay(async () => {
      setLoiMoi(null);
      const kq = await zalo.chiaSeChu(tinMoiChuCan(ten));
      if (kq === "loi") setLoiMoi(CHU_LOI_MO_ZALO_MOI);
    });

  let noiDung: React.ReactNode;
  if (!du) {
    noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />;
  } else {
    noiDung = (
      <NoiDungS6
        can={du.can}
        nguon={du.nguon}
        dangBoId={dangBoId}
        loiBo={loiBo}
        loiMoi={loiMoi}
        onThemCanCuaToi={() => dieuHuong(DUONG.THEM_CAN)}
        onCanCuaToi={(c) => dieuHuong(manKhiChamCan("cua_toi", c.id).duong, { state: manKhiChamCan("cua_toi", c.id).state })}
        onChuNha={(d) => dieuHuong(manKhiChamChuNha(d.id).duong, { state: manKhiChamChuNha(d.id).state })}
        onCanChuNha={(_d, canId) => dieuHuong(manKhiChamCan("nguon_phong", canId).duong, { state: manKhiChamCan("nguon_phong", canId).state })}
        onCanTuNhap={(c) => dieuHuong(manKhiChamCan("tu_nhap", c.id).duong, { state: manKhiChamCan("tu_nhap", c.id).state })}
        onThemTuNhap={() => dieuHuong(DUONG.THEM_CAN_TU_NHAP)}
        onMoi={moi}
        onBoDong={(d) => void boDong(d)}
        onXinLich={() => dieuHuong(DUONG.XIN_LICH)}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten={TIEU_DE_S6} />
      {matMang && du ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Danh sách có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && du && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
      <ThanhTab dangO={DUONG.CAN_SALE} />
      {xin.popup}
    </Page>
  );
};
