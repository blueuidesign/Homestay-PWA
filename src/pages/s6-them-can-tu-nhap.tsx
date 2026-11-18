import React, { useRef, useState, useSyncExternalStore } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { CHIP_PHONG_NGU } from "../components/can-hien-thi";
import {
  CHU_GIA_CHU_GHI_CHU,
  CHU_QD11,
  CHU_S6_02_GIAI_THICH,
  CHU_S6_02_TIEU_DE,
  CHU_THEM_CAN,
  chuToastThemCanTuNhap,
  chuanSdtChuCan,
  docTien,
  dongConThieuTuNhap,
  viTien,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useChonAnh } from "../components/dung-anh";
import { useMoRong } from "../components/dung-mo-rong";
import { KhoiAnh, dongBaoAnh } from "../components/khoi-anh";
import { KhoiMoRong } from "../components/khoi-mo-rong";
import { useToast } from "../components/toast";
import { MAX_ANH_CAN, postCan } from "../services/api";
import { LoiApi, LoiMang, type SoPhongNgu } from "../services/kieu";
import { BoAnhForm, chuLoiAnh, demTheo } from "../stores/anh-form";
import { boNhoLichSale } from "../stores/lich";
import { boNhoTabCan } from "../stores/can-sale";

// S6-02 · Thêm căn tự nhập (mục "Thêm căn tự nhập" (US16)). Mở từ S6 "Thêm căn tự nhập" và A5 "Thêm căn thủ công".
// Bốn ô bắt buộc: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ (dòng "Còn thiếu"). Số giường, giá chủ, ảnh không bắt buộc (NT2, NT8).
// Tối đa 12 ảnh (NT4). Tên và số chủ căn chỉ sale này thấy (QD11). Ảnh qua POST /anh khi chọn, HV4 khi từ chối quyền ảnh.
// Khóa chống bấm hai lần giữ nguyên khi lỗi mạng, đổi khi server đã trả lỗi (HV1, server.md 1.6).
const khoaMoi = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

export type LoiFormTuNhap = { ten?: string; sdt?: string; ma_can?: string; so_phong_ngu?: string; so_giuong?: string; gia?: string; anh?: string; chung?: string };

// Lỗi từ POST /can thành lỗi dưới từng ô
export const loiTuApiTuNhap = (e: unknown, ma: string): LoiFormTuNhap => {
  if (e instanceof LoiApi && e.loi === "MA_CAN_TRUNG") return { ma_can: `Đã có căn ${ma.trim()}. Kiểm tra lại mã căn.` };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI") {
    if (e.o === "ma_can") return { ma_can: "Nhập mã căn" };
    if (e.o === "so_phong_ngu") return { so_phong_ngu: "Chọn số phòng ngủ" };
    if (e.o === "ten_chu_can") return { ten: "Nhập tên chủ nhà" };
    if (e.o === "sdt_chu_can") return { sdt: "Số điện thoại chưa đúng. Nhập 9 đến 15 chữ số" };
    if (e.o === "gia_chu_thuong" || e.o === "gia_chu_cuoi_tuan") return { gia: "Giá chưa đúng. Chỉ nhập số" };
    if (e.o === "so_giuong") return { so_giuong: "Số giường từ 1 đến 50" };
    if (e.o === "anh_ids") return { anh: `Tối đa ${MAX_ANH_CAN} ảnh. Bỏ bớt ảnh rồi thêm căn.` };
  }
  return { chung: "Chưa lưu được, bấm lại khi có mạng" };
};

const Nhan = ({ children, bat }: { children: React.ReactNode; bat?: boolean }) => (
  <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>
    {children}
    {bat && <span style={{ color: "var(--danger)", fontWeight: 700 }}> *</span>}
  </span>
);

export const ManThemCanTuNhap = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const [ten, setTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [ma, setMa] = useState("");
  const [phongNgu, setPhongNgu] = useState<SoPhongNgu | null>(null);
  const [giaThuong, setGiaThuong] = useState("");
  const [giaCuoiTuan, setGiaCuoiTuan] = useState("");
  const [loi, setLoi] = useState<LoiFormTuNhap>({});
  const [dangLuu, setDangLuu] = useState(false);
  const khoa = useRef(khoaMoi());
  const dangLuuRef = useRef(false);
  const [bo] = useState(() => new BoAnhForm());
  const anh = useSyncExternalStore(bo.dangKy, bo.lay);
  const xoaLoi = (k: keyof LoiFormTuNhap) => setLoi((l) => ({ ...l, [k]: undefined, chung: undefined }));
  const { tuChoi, themAnh, moCaiDat, thuLai, xoaAnh } = useChonAnh(bo, toast, () => xoaLoi("anh"));
  const mr = useMoRong(undefined, true, () => setLoi((l) => ({ ...l, so_giuong: undefined, chung: undefined })));

  const conThieu = dongConThieuTuNhap({ ten, sdt, ma, phongNgu });
  const soLoi = [loi.ten, loi.sdt, loi.ma_can, loi.so_phong_ngu, loi.so_giuong, loi.gia, loi.anh].filter(Boolean).length;

  const them = async () => {
    if (conThieu || dangLuuRef.current || demTheo(anh, "dang_tai") > 0) return;
    const soAnhLoi = demTheo(anh, "loi");
    if (soAnhLoi > 0) return setLoi({ anh: chuLoiAnh(soAnhLoi) });
    if (mr.giuong.loi) return setLoi({ so_giuong: mr.giuong.loi });
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoi({});
    try {
      const can = await postCan(
        {
          loai: "tu_nhap",
          ma_can: ma,
          so_phong_ngu: phongNgu,
          anh_ids: bo.anhIds(),
          so_giuong: mr.giuong.gia_tri,
          loai_view: mr.form.view,
          toa_nha_id: mr.form.toa?.id ?? null,
          ten_chu_can: ten.trim(),
          sdt_chu_can: chuanSdtChuCan(sdt)!,
          gia_chu_thuong: docTien(giaThuong),
          gia_chu_cuoi_tuan: docTien(giaCuoiTuan),
        },
        khoa.current,
      );
      boNhoTabCan.lamMoi();
      boNhoLichSale.lamMoi();
      toast(chuToastThemCanTuNhap(can.ma_can));
      dieuHuong(DUONG.CAN_TU_NHAP, { replace: true, state: { can_id: can.id } });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới
      setLoi(loiTuApiTuNhap(e, ma));
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten={CHU_S6_02_TIEU_DE} coLui />
      <div className="noi-dung" style={{ paddingBottom: 150 }}>
        {(soLoi > 0 || loi.chung) && (
          <div className="hh-banner hh-banner--danger">
            <span>⚠️ {loi.chung ?? `Chưa thêm được căn. Sửa ${soLoi} chỗ bên dưới.`}</span>
          </div>
        )}
        <span className="chu-phu" data-giai-thich>{CHU_S6_02_GIAI_THICH}</span>

        <div className="khoi" data-khoi="chu-nha">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Nhan bat>Tên chủ nhà</Nhan>
            <label className="hh-field">
              <input
                className="hh-input"
                type="text"
                name="ten_chu_can"
                placeholder="VD: Chú Bình"
                maxLength={100}
                value={ten}
                onChange={(e) => {
                  setTen(e.target.value);
                  xoaLoi("ten");
                }}
              />
            </label>
            {loi.ten && <span className="chu-loi">⚠️ {loi.ten}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Nhan bat>Số điện thoại</Nhan>
            <label className="hh-field">
              <input
                className="hh-input"
                type="tel"
                inputMode="tel"
                name="sdt_chu_can"
                placeholder="VD: 0904 123 330"
                maxLength={30}
                value={sdt}
                onChange={(e) => {
                  setSdt(e.target.value);
                  xoaLoi("sdt");
                }}
              />
            </label>
            {loi.sdt && <span className="chu-loi">⚠️ {loi.sdt}</span>}
          </div>
          <span className="chu-phu">{CHU_QD11}</span>
        </div>

        <div className="khoi" data-khoi="can">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Nhan bat>Mã căn</Nhan>
            <label className="hh-field">
              <input
                className="hh-input"
                type="text"
                name="ma_can"
                placeholder="VD: Villa Tuần Châu"
                maxLength={50}
                value={ma}
                onChange={(e) => {
                  setMa(e.target.value);
                  xoaLoi("ma_can");
                }}
              />
            </label>
            {loi.ma_can && <span className="chu-loi">⚠️ {loi.ma_can}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Nhan bat>Số phòng ngủ</Nhan>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CHIP_PHONG_NGU.map((c) => (
                <button
                  key={c.gia_tri}
                  type="button"
                  className={"hh-chip hh-chip--sale" + (phongNgu === c.gia_tri ? " hh-chip--on" : "")}
                  aria-pressed={phongNgu === c.gia_tri}
                  onClick={() => {
                    setPhongNgu(c.gia_tri);
                    xoaLoi("so_phong_ngu");
                  }}
                >
                  {c.chu}
                </button>
              ))}
            </div>
            {loi.so_phong_ngu && <span className="chu-loi">⚠️ {loi.so_phong_ngu}</span>}
          </div>
        </div>

        <KhoiMoRong {...mr.props} anMoTa coThuGon={false} loiSoGiuong={loi.so_giuong ?? mr.props.loiSoGiuong} />

        <div className="khoi" data-khoi="gia-chu">
          <Nhan>Giá chủ báo (đ)</Nhan>
          <div style={{ display: "flex", gap: 8 }}>
            <label className="hh-field" style={{ flex: "1 1 0%" }}>
              <span className="hh-field__label">Ngày thường</span>
              <input
                className="hh-input"
                type="text"
                inputMode="numeric"
                name="gia_chu_thuong"
                placeholder="VD: 1.400.000"
                value={giaThuong}
                onChange={(e) => {
                  setGiaThuong(viTien(e.target.value));
                  xoaLoi("gia");
                }}
              />
            </label>
            <label className="hh-field" style={{ flex: "1 1 0%" }}>
              <span className="hh-field__label">Cuối tuần</span>
              <input
                className="hh-input"
                type="text"
                inputMode="numeric"
                name="gia_chu_cuoi_tuan"
                placeholder="VD: 1.600.000"
                value={giaCuoiTuan}
                onChange={(e) => {
                  setGiaCuoiTuan(viTien(e.target.value));
                  xoaLoi("gia");
                }}
              />
            </label>
          </div>
          {loi.gia && <span className="chu-loi">⚠️ {loi.gia}</span>}
          <span className="chu-phu">{CHU_GIA_CHU_GHI_CHU}</span>
        </div>

        <KhoiAnh
          anh={anh}
          loiAnh={loi.anh}
          coTheQuyen={tuChoi}
          onThemAnh={themAnh}
          onThuLai={thuLai}
          onXoa={xoaAnh}
          onMoCaiDat={moCaiDat}
        />
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dongBaoAnh(anh) && (
            <span className="chu-phu" role="status" style={{ textAlign: "center" }}>
              {dongBaoAnh(anh)}
            </span>
          )}
          <span className="chu-phu" data-con-thieu style={{ textAlign: "center", color: conThieu ? undefined : "var(--action)" }}>
            {conThieu ?? "Đủ thông tin. Ảnh, giá thêm sau cũng được."}
          </span>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!!conThieu || dangLuu || demTheo(anh, "dang_tai") > 0} onClick={() => void them()}>
            {dangLuu ? "Đang lưu…" : CHU_THEM_CAN}
          </button>
        </div>
      </div>
    </Page>
  );
};
