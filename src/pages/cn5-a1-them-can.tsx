import React, { useRef, useState, useSyncExternalStore } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { CHIP_PHONG_NGU } from "../components/can-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useChonAnh } from "../components/dung-anh";
import { useMoRong } from "../components/dung-mo-rong";
import { KhoiMoRong, NutMoRong, type PropsMoRong } from "../components/khoi-mo-rong";
import { useToast } from "../components/toast";
import { KhoiAnh, dongBaoAnh } from "../components/khoi-anh";
import { MAX_ANH_CAN, postCan } from "../services/api";
import { layVai } from "../stores/vai";
import { BoAnhForm, chuLoiAnh, demTheo, type AnhForm } from "../stores/anh-form";
import { LoiApi, LoiMang, type SoPhongNgu } from "../services/kieu";

// CN5-A1 · Thêm căn, bản US1: chỉ mã căn và số phòng ngủ (mục "Thêm căn" (US1)). Ảnh: US1 (mục "Ảnh khi thêm căn" (US1)). Tòa nhà, view, số giường, mô tả: US1 (mục "Tòa nhà, loại view, số giường, mô tả" (US1)).

// Dòng dưới cùng (mục "Thêm căn" (US1) bước 2, 3)
export const dongConThieu = (ma: string, phongNgu: SoPhongNgu | null) => {
  const thieu = [!ma.trim() && "mã căn", phongNgu === null && "số phòng ngủ"].filter(Boolean);
  return thieu.length ? `Còn thiếu: ${thieu.join(", ")}` : null;
};

export type LoiForm = { ma_can?: string; so_phong_ngu?: string; anh?: string; chung?: string; so_giuong?: string };

// Lỗi từ POST /can thành lỗi dưới từng ô (mục "Thêm căn" (US1) bước 5, CN5-A3)
export const loiTuApi = (e: unknown, ma: string): LoiForm => {
  if (e instanceof LoiApi && e.loi === "MA_CAN_TRUNG") return { ma_can: `Đã có căn ${ma.trim()}. Kiểm tra lại mã căn.` };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "ma_can") return { ma_can: "Nhập mã căn" };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "so_phong_ngu") return { so_phong_ngu: "Chọn số phòng ngủ" };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "so_giuong") return { so_giuong: "Số giường từ 1 đến 50" };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "anh_ids") return { anh: `Tối đa ${MAX_ANH_CAN} ảnh. Bỏ bớt ảnh rồi thêm căn.` };
  return { chung: "Chưa lưu được, bấm lại khi có mạng" };
};

// Toast sau khi thêm (US1-NT17)
export const chuToastThemCan = (ma: string) => `Đã thêm phòng ${ma}`;

// Khóa chống bấm hai lần (server.md 1.6): giữ nguyên khi thử lại vì lỗi mạng, đổi khi server đã trả lỗi.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

const demLoi = (l: LoiForm) => [l.ma_can, l.so_phong_ngu, l.anh, l.so_giuong].filter(Boolean).length;

export const NoiDungCN5A1 = ({
  ma,
  phongNgu,
  loi,
  dangLuu,
  onMa,
  onPhongNgu,
  onThem,
  onChuaLam,
  anh = [],
  coTheQuyen = false,
  onThemAnh = () => {},
  onThuLai = () => {},
  onXoaAnh = () => {},
  onMoCaiDat = () => {},
  moRong,
}: {
  ma: string;
  phongNgu: SoPhongNgu | null;
  loi: LoiForm;
  dangLuu: boolean;
  onMa: (v: string) => void;
  onPhongNgu: (v: SoPhongNgu) => void;
  onThem: () => void;
  onChuaLam: (chu: string) => void;
  // US1 (mục "Ảnh khi thêm căn" (US1))
  anh?: AnhForm[];
  coTheQuyen?: boolean;
  onThemAnh?: () => void;
  onThuLai?: (khoa: string) => void;
  onXoaAnh?: (khoa: string) => void;
  onMoCaiDat?: () => void;
  // US1 (mục "Tòa nhà, loại view, số giường, mô tả" (US1)): phần tòa nhà, loại view, số giường, mô tả. Thu gọn mặc định.
  moRong?: { dangMo: boolean; onMo: () => void; khoi: PropsMoRong };
}) => {
  const conThieu = dongConThieu(ma, phongNgu);
  const soLoi = demLoi(loi);
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 140 }}>
        {(soLoi > 0 || loi.chung) && (
          <div className="hh-banner hh-banner--danger">
            <span>⚠️ {loi.chung ?? `Chưa thêm được căn. Sửa ${soLoi} chỗ bên dưới.`}</span>
          </div>
        )}
        <div className="khoi">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>
              Mã căn (tên căn hộ) <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <label className="hh-field">
              <input
                className="hh-input"
                type="text"
                name="ma_can"
                placeholder="VD: 1509 hoặc Greenbay"
                value={ma}
                onChange={(e) => onMa(e.target.value)}
              />
            </label>
            {loi.ma_can && <span className="chu-loi">⚠️ {loi.ma_can}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>
              Số phòng ngủ <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CHIP_PHONG_NGU.map((c) => (
                <button
                  key={c.gia_tri}
                  type="button"
                  className={"hh-chip hh-chip--sale" + (phongNgu === c.gia_tri ? " hh-chip--on" : "")}
                  aria-pressed={phongNgu === c.gia_tri}
                  onClick={() => onPhongNgu(c.gia_tri)}
                >
                  {c.chu}
                </button>
              ))}
            </div>
            {loi.so_phong_ngu && <span className="chu-loi">⚠️ {loi.so_phong_ngu}</span>}
          </div>
        </div>
        <KhoiAnh
          anh={anh}
          loiAnh={loi.anh}
          coTheQuyen={coTheQuyen}
          onThemAnh={onThemAnh}
          onThuLai={onThuLai}
          onXoa={onXoaAnh}
          onMoCaiDat={onMoCaiDat}
        />
        {moRong?.dangMo ? <KhoiMoRong {...moRong.khoi} coThuGon /> : <NutMoRong onMo={moRong?.onMo ?? (() => onChuaLam(""))} />}
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dongBaoAnh(anh) && (
            <span className="chu-phu" role="status" style={{ textAlign: "center" }}>
              {dongBaoAnh(anh)}
            </span>
          )}
          <span className="chu-phu" style={{ textAlign: "center", color: conThieu ? undefined : "var(--action)" }}>
            {conThieu ?? "Đủ thông tin. Ảnh, giá thêm sau cũng được."}
          </span>
          <button
            type="button"
            className="hh-btn hh-btn--primary hh-btn--block"
            disabled={!!conThieu || dangLuu || demTheo(anh, "dang_tai") > 0}
            onClick={onThem}
          >
            {dangLuu ? "Đang lưu…" : "Thêm căn"}
          </button>
        </div>
      </div>
    </>
  );
};

export const CN5A1ThemCan = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const [ma, setMa] = useState("");
  const [phongNgu, setPhongNgu] = useState<SoPhongNgu | null>(null);
  const [loi, setLoi] = useState<LoiForm>({});
  const [dangLuu, setDangLuu] = useState(false);
  const khoa = useRef(khoaMoi());
  const [bo] = useState(() => new BoAnhForm());
  const anh = useSyncExternalStore(bo.dangKy, bo.lay);
  const xoaLoiAnh = () => setLoi((l) => ({ ...l, anh: undefined, chung: undefined }));
  const { tuChoi, themAnh, moCaiDat, thuLai, xoaAnh } = useChonAnh(bo, toast, xoaLoiAnh);
  const mr = useMoRong(undefined, false, () => setLoi((l) => ({ ...l, so_giuong: undefined, chung: undefined })));

  const them = async () => {
    if (dongConThieu(ma, phongNgu) || dangLuu || demTheo(anh, "dang_tai") > 0) return;
    // Ảnh tải lỗi: chưa thêm căn cho tới khi thử lại hoặc xóa (US1-NT21)
    const soLoi = demTheo(anh, "loi");
    if (soLoi > 0) {
      setLoi({ anh: chuLoiAnh(soLoi) });
      return;
    }
    if (mr.giuong.loi) {
      setLoi({ so_giuong: mr.giuong.loi });
      return;
    }
    setDangLuu(true);
    setLoi({});
    try {
      const can = await postCan({
        ma_can: ma,
        so_phong_ngu: phongNgu,
        anh_ids: bo.anhIds(),
        so_giuong: mr.giuong.gia_tri,
        loai_view: mr.form.view,
        toa_nha_id: mr.form.toa?.id ?? null,
        mo_ta_gui_khach: mr.form.moTa.trim() || null,
      }, khoa.current);
      toast(chuToastThemCan(can.ma_can));
      // Sale thêm căn của mình (S6 "+ Thêm căn") thì về tab Căn của sale
      dieuHuong(layVai() === "sale" ? DUONG.CAN_SALE : DUONG.CAN, { replace: true, state: { vuaThemId: can.id } });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      setLoi(loiTuApi(e, ma));
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Thêm căn hộ" coLui />
      <NoiDungCN5A1
        ma={ma}
        phongNgu={phongNgu}
        loi={loi}
        dangLuu={dangLuu}
        onMa={(v) => {
          setMa(v);
          setLoi((l) => ({ ...l, ma_can: undefined, chung: undefined }));
        }}
        onPhongNgu={(v) => {
          setPhongNgu(v);
          setLoi((l) => ({ ...l, so_phong_ngu: undefined, chung: undefined }));
        }}
        onThem={them}
        onChuaLam={toast}
        anh={anh}
        coTheQuyen={tuChoi}
        onThemAnh={themAnh}
        onThuLai={thuLai}
        onXoaAnh={xoaAnh}
        onMoCaiDat={moCaiDat}
        moRong={{ dangMo: mr.dangMo, onMo: mr.moPhan, khoi: { ...mr.props, loiSoGiuong: loi.so_giuong ?? mr.props.loiSoGiuong } }}
      />
    </Page>
  );
};
