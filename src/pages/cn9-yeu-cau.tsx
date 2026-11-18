import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { useXinSo } from "../components/xin-so";
import { CHU_CHUA_GUI_DUOC, CHU_DE_SAU_CHAP_NHAN, CHU_KHONG_MO_DUOC_GOI, CHU_LOI_CHUNG } from "../components/yeu-cau-hien-thi";
import { getYeuCau, postYeuCauChapNhan, postYeuCauTuChoi } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { zalo } from "../services/zalo";
import type { KetQuaChapNhan, LyDoTuChoi, TrangThaiYeuCauMo, YeuCauChu } from "../services/yeu-cau";
import { boNhoLich } from "../stores/lich";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungCN9 } from "./cn9-man";

// CN9, CN9-02, CN9-03 (mục "Chủ nhà nhận và trả lời yêu cầu" (US15), mục "Yêu cầu trùng ngày" (US15)). Một màn, mở với state { id } từ CN1-03 "Xem và trả lời" hoặc từ thông báo (US15-NT8).
// Chấp nhận: chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) nếu hồ sơ chưa có số ("Để sau" vẫn chấp nhận), rồi POST /yeu-cau/:id/chap-nhan. Từ chối: ba chip, POST .../tu-choi.
// Yêu cầu không còn chờ (TRANG_THAI_DA_DOI): tải lại và hiện trạng thái thật (HV3 bước 4). Mỗi lần bấm một Idempotency-Key.
const khoaMoi = (loai: string) => `${loai}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export const CN9YeuCau = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const st = (viTri.state as TrangThaiYeuCauMo | null | undefined) ?? null;
  const id = st?.id ?? "";
  const [yc, setYc] = useState<YeuCauChu | null>(null);
  const [ketQua, setKetQua] = useState<KetQuaChapNhan | null>(null);
  const [hienChip, setHienChip] = useState(false);
  const [lyDo, setLyDo] = useState<LyDoTuChoi | null>(null);
  const [dangLam, setDangLam] = useState<"chap_nhan" | "tu_choi" | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const lanTai = useRef(0);
  const dangRef = useRef(false);
  const khoaChap = useRef(khoaMoi("chap-nhan"));
  const khoaTu = useRef(khoaMoi("tu-choi"));
  const xin = useXinSo("sale", CHU_DE_SAU_CHAP_NHAN);

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
    else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) setKhongQuyen(e.ly_do || null);
    else return false;
    return true;
  };

  const tai = useCallback(async () => {
    if (!id) return;
    const l = ++lanTai.current;
    try {
      const y = (await getYeuCau(id)) as YeuCauChu;
      if (l !== lanTai.current) return;
      setYc(y);
      setLoiTai(null);
      setKhongQuyen(false);
      if (y.trang_thai !== "cho_chu") setHienChip(false);
    } catch (e) {
      if (l !== lanTai.current) return;
      if (!xuLyLoi(e)) setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [id]);

  useEffect(() => {
    if (!st) {
      dieuHuong(DUONG.LICH, { replace: true, animate: false });
      return;
    }
    void tai();
  }, [id]);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  // Quay lại từ nền: tải lại ngầm, giữ chip và lý do đang chọn (HV3 bước 2). Không tải lại khi đang gửi.
  useKhiQuayLai(useCallback(() => void (dangRef.current || tai()), [tai]));

  const khiDaDoi = async () => {
    // TRANG_THAI_DA_DOI: yêu cầu đã hết hạn, bị hủy, hoặc đã trả lời ở máy khác
    setHienChip(false);
    await tai();
  };

  const chapNhan = async () => {
    if (!yc || dangRef.current) return;
    dangRef.current = true;
    setDangLam("chap_nhan");
    setLoi(null);
    try {
      const kq = await postYeuCauChapNhan(yc.id, khoaChap.current);
      boNhoLich.lamMoi();
      setKetQua(kq);
      setYc(kq.yeu_cau);
    } catch (e) {
      // Server trả lỗi (không phải mất mạng): lần bấm sau là lệnh mới, khóa mới (HV1, như CN5-A1)
      if (!(e instanceof LoiMang)) khoaChap.current = khoaMoi("chap-nhan");
      if (xuLyLoi(e)) return;
      if (e instanceof LoiApi && (e.loi === "TRANG_THAI_DA_DOI" || e.loi === "TRUNG_LICH")) await khiDaDoi();
      else setLoi(e instanceof LoiMang ? CHU_CHUA_GUI_DUOC : CHU_LOI_CHUNG);
    } finally {
      dangRef.current = false;
      setDangLam(null);
    }
  };

  const tuChoi = async () => {
    if (!yc || dangRef.current || !lyDo) return;
    dangRef.current = true;
    setDangLam("tu_choi");
    setLoi(null);
    try {
      const y = await postYeuCauTuChoi(yc.id, { ly_do: lyDo }, khoaTu.current);
      boNhoLich.lamMoi();
      setYc(y);
      setHienChip(false);
    } catch (e) {
      // Server trả lỗi (không phải mất mạng): lần bấm sau là lệnh mới, khóa mới (HV1, như CN5-A1)
      if (!(e instanceof LoiMang)) khoaTu.current = khoaMoi("tu-choi");
      if (xuLyLoi(e)) return;
      if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") await khiDaDoi();
      else setLoi(e instanceof LoiMang ? CHU_CHUA_GUI_DUOC : CHU_LOI_CHUNG);
    } finally {
      dangRef.current = false;
      setDangLam(null);
    }
  };

  const goi = async () => {
    const so = yc?.sale.so_dien_thoai;
    if (so && !(await zalo.goiDien(so))) toast(CHU_KHONG_MO_DUOC_GOI);
  };

  if (!st) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = (
      <div className="noi-dung">
        <KhongConXem lyDo={khongQuyen || undefined} onVe={() => dieuHuong(DUONG.LICH, { replace: true })} />
      </div>
    );
  } else if (!yc) {
    noiDung = (
      <div className="noi-dung">
        {loiTai ? (
          <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} />
        ) : (
          <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="khung-xam" style={{ height: 72 }} />
            <div className="khung-xam" style={{ height: 120 }} />
            <div className="khung-xam" style={{ height: 64 }} />
          </div>
        )}
      </div>
    );
  } else {
    noiDung = (
      <NoiDungCN9
        yc={yc}
        ketQua={ketQua}
        hienChip={hienChip}
        lyDo={lyDo}
        dangLam={dangLam}
        loi={loi}
        onGoi={() => void goi()}
        onChapNhan={() => void xin.chay(chapNhan)}
        onMoTuChoi={() => setHienChip(true)}
        onQuayLai={() => {
          setHienChip(false);
          setLoi(null);
        }}
        onChonLyDo={setLyDo}
        onGuiTuChoi={() => void (lyDo ? tuChoi() : setLoi("Chọn một lý do rồi gửi từ chối"))}
        onXemDatPhong={(bookingId) => dieuHuong(DUONG.CHI_TIET_DAT_PHONG, { state: { id: bookingId } })}
        onVeLich={() => dieuHuong(DUONG.LICH, { replace: true })}
      />
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Yêu cầu đặt phòng" coLui />
      {matMang && yc && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Trạng thái có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
      {xin.popup}
    </Page>
  );
};
