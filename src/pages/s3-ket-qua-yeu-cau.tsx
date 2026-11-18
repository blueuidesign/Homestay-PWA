import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import type { TrangThaiTim } from "../components/tim-phong-hien-thi";
import { useToast } from "../components/toast";
import { CHU_KHONG_MO_DUOC_GOI, CHU_LOI_CHUNG, CHU_LOI_MO_ZALO, CHU_CHUA_GUI_DUOC, tinNhanChuNha } from "../components/yeu-cau-hien-thi";
import { getSaleTim, getYeuCau, postYeuCauHuy } from "../services/api";
import { LoiApi, LoiMang, type CanTim, type TrangThaiCanSale } from "../services/kieu";
import { zalo } from "../services/zalo";
import type { TrangThaiYeuCauMo, YeuCauSale } from "../services/yeu-cau";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungKetQuaSale } from "./s3-yeu-cau-man";

// S3-03 Chờ chủ nhà, S3-04 và S3-04-01 Đã chấp nhận, S3-05 Bị từ chối, S3-09 Hết hạn, S3-08 Đã hủy (mục "Sale gửi yêu cầu đặt phòng" (US15), mục "Sale nhận kết quả yêu cầu" (US15)).
// Một màn, mở với state { id } từ S3-02 (sau khi gửi) hoặc từ thông báo; trạng thái của yêu cầu quyết định vẽ gì.
// Quay lại từ nền (kể cả sau khi nhắn Zalo, gọi điện) thì tải lại ngầm, màn tự đổi sang kết quả mới (HV3 bước 2, HV3-NT3).
// Căn tương tự (S3-05, S3-09): GET /sale/tim cùng ngày, ghi_lich_su=false, bỏ căn đã gửi; chỉ hiện giá bán.
const khoaMoi = () => `huy-yeu-cau-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export const ManKetQuaYeuCau = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiYeuCauMo | null | undefined) ?? null;
  const id = st?.id ?? "";
  const [yc, setYc] = useState<YeuCauSale | null>(null);
  const [canTuongTu, setCanTuongTu] = useState<CanTim[] | null>(null);
  const [loiCanTuongTu, setLoiCanTuongTu] = useState(false);
  const [hoiHuy, setHoiHuy] = useState(false);
  const [dangLam, setDangLam] = useState<"huy" | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const lanTai = useRef(0);
  const dangHuy = useRef(false);
  const khoaHuy = useRef(khoaMoi());
  const daTaiTuongTu = useRef("");

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
    else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) setKhongQuyen(e.ly_do || null);
    else return false;
    return true;
  };

  const taiCanTuongTu = async (y: YeuCauSale) => {
    const khoa = `${y.id}|${y.trang_thai}`;
    if (daTaiTuongTu.current === khoa) return;
    daTaiTuongTu.current = khoa;
    setCanTuongTu(null);
    setLoiCanTuongTu(false);
    try {
      const kq = await getSaleTim({ ngay_nhan: y.ngay_nhan, ngay_tra: y.ngay_tra, ghi_lich_su: false, bo_can_ids: [y.can.id] });
      setCanTuongTu(kq.can);
    } catch {
      daTaiTuongTu.current = "";
      setLoiCanTuongTu(true);
    }
  };

  const tai = useCallback(async () => {
    if (!id) return;
    const l = ++lanTai.current;
    try {
      const y = (await getYeuCau(id)) as YeuCauSale;
      if (l !== lanTai.current) return;
      setYc(y);
      setLoiTai(null);
      setKhongQuyen(false);
      if (y.trang_thai !== "cho_chu") setHoiHuy(false);
      if (y.trang_thai === "bi_tu_choi" || y.trang_thai === "het_han") void taiCanTuongTu(y);
    } catch (e) {
      if (l !== lanTai.current) return;
      if (!xuLyLoi(e)) setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [id]);

  useEffect(() => {
    if (!st) {
      dieuHuong(DUONG.LICH_SALE, { replace: true, animate: false });
      return;
    }
    void tai();
  }, [id]);
  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const nhanZalo = async () => {
    const zaloId = yc?.chu_nha.zalo_id;
    if (!yc || !zaloId || !(await zalo.moChat(zaloId, tinNhanChuNha(yc)))) toast(CHU_LOI_MO_ZALO);
  };
  const goi = async () => {
    const so = yc?.chu_nha.so_dien_thoai;
    if (so && !(await zalo.goiDien(so))) toast(CHU_KHONG_MO_DUOC_GOI);
  };
  // Bấm lần đầu hỏi lại, lần hai mới hủy (S3-03: "Xác nhận hủy yêu cầu?")
  const huy = async () => {
    if (!yc || dangHuy.current) return;
    if (!hoiHuy) {
      setHoiHuy(true);
      return;
    }
    dangHuy.current = true;
    setDangLam("huy");
    setLoi(null);
    try {
      setYc(await postYeuCauHuy(yc.id, khoaHuy.current));
      setHoiHuy(false);
    } catch (e) {
      // Server trả lỗi (không phải mất mạng): lần bấm sau là lệnh mới, khóa mới (HV1, như CN5-A1)
      if (!(e instanceof LoiMang)) khoaHuy.current = khoaMoi();
      if (xuLyLoi(e)) return;
      if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") {
        // Chủ nhà vừa trả lời hay đã hết hạn: tải lại để thấy trạng thái thật (HV3 bước 4)
        setHoiHuy(false);
        await tai();
      } else setLoi(e instanceof LoiMang ? CHU_CHUA_GUI_DUOC : CHU_LOI_CHUNG);
    } finally {
      dangHuy.current = false;
      setDangLam(null);
    }
  };

  const veLich = () => dieuHuong(DUONG.LICH_SALE, { replace: true });
  const xemTatCa = () =>
    yc &&
    dieuHuong(DUONG.KET_QUA_TIM, {
      state: { dk: { ngay_nhan: yc.ngay_nhan, ngay_tra: yc.ngay_tra, so_phong_ngu: [], loai_view: [], toa_nha_id: [] }, ten_toa: {} } satisfies TrangThaiTim,
    });
  const moCan = (c: CanTim) =>
    yc && dieuHuong(DUONG.CAN_SALE_CHI_TIET, { state: { can_id: c.id, ngay_nhan: yc.ngay_nhan, ngay_tra: yc.ngay_tra } satisfies TrangThaiCanSale });

  if (!st) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = (
      <div className="noi-dung">
        <KhongConXem lyDo={khongQuyen || undefined} onVe={veLich} />
      </div>
    );
  } else if (!yc) {
    noiDung = (
      <div className="noi-dung">
        {loiTai ? (
          <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} />
        ) : (
          <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="khung-xam" style={{ height: 80 }} />
            <div className="khung-xam" style={{ height: 80 }} />
            <div className="khung-xam" style={{ height: 120 }} />
          </div>
        )}
      </div>
    );
  } else {
    noiDung = (
      <NoiDungKetQuaSale
        yc={yc}
        canTuongTu={canTuongTu}
        loiCanTuongTu={loiCanTuongTu}
        hoiHuy={hoiHuy}
        dangLam={dangLam}
        loi={loi}
        onNhanZalo={() => void nhanZalo()}
        onGoi={() => void goi()}
        onHuy={() => void huy()}
        onVeLich={veLich}
        onMoCan={moCan}
        onXemTatCa={xemTatCa}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Đặt phòng" coLui />
      {matMang && yc && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Trạng thái có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
    </Page>
  );
};
