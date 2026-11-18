import React, { useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useToast } from "../components/toast";
import {
  getGoiY,
  getKhachLe,
  getKiemTrung,
  getLichThang,
  getSaleKetNoi,
  homNay,
  postBooking,
} from "../services/api";
import {
  LoiApi,
  LoiMang,
  type CanTrenLich,
  type KiemTrung,
  type SaleKetNoi,
  type TrangThaiTien,
} from "../services/kieu";
import { chuNgayNgan, chuTien, congNgay, thangCua } from "../services/ngay";
import { boNhoLich } from "../stores/lich";
import { layVai } from "../stores/vai";
import { mauCuaCan } from "./cn1-lich-thang";

// CN4 · Thêm đặt phòng (mục "Chủ nhà ghi booking mới" (US3), mục "Căn, ngày và kiểm tra trùng lịch" (US3), mục "Người đặt, tiền phòng và tiền cọc" (US3)), CN4-01 tiền phòng trống, CN4-03 toast (HV8).
// US5: chọn sale đã kết nối làm người đặt thì đặt phòng tính cho sale đó (US5-NT13, mục "Booking chủ nhà ghi cho sale" (US28)). "+ Sale mới" là US sau.
// Chưa làm: giữ nháp khi app bị đóng hẳn (HV3 bước 3, US3-KB21) vì cần Native Storage.

export type SoDemChip = 1 | 2 | 3 | "tuy_chon";
export const CHIP_SO_DEM: { gia_tri: SoDemChip; chu: string }[] = [
  { gia_tri: 1, chu: "1 đêm" },
  { gia_tri: 2, chu: "2 đêm" },
  { gia_tri: 3, chu: "3 đêm" },
  { gia_tri: "tuy_chon", chu: "Tùy chọn" },
];
export const CHIP_TIEN: { gia_tri: TrangThaiTien; chu: string }[] = [
  { gia_tri: "chua_coc", chu: "Chưa cọc" },
  { gia_tri: "da_coc_con_thu", chu: "Đã cọc · còn thu" },
  { gia_tri: "da_thanh_toan", chu: "Đã thanh toán" },
];

// Ngày trả theo chip số đêm (US3-NT8: "2 đêm" thì ngày trả là ngày nhận cộng 2)
export const ngayTraTheoChip = (nhan: string, chip: SoDemChip, traTuyChon: string) =>
  chip === "tuy_chon" ? traTuyChon : congNgay(nhan, chip);

// Dòng kiểm trùng (mục "Căn, ngày và kiểm tra trùng lịch" (US3) bước 4)
export const dongKiemTrung = (nhan: string, tra: string, kq: KiemTrung | null) => {
  if (!kq) return { loai: "dang" as const, chu: "Đang kiểm tra lịch…" };
  if (kq.khong_trung) {
    return { loai: "ok" as const, chu: `✓ ${chuNgayNgan(nhan)} → ${chuNgayNgan(tra)} (${kq.so_dem} đêm) · không trùng lịch` };
  }
  return { loai: "trung" as const, chu: `⚠️ Trùng lịch: ${kq.dem_trung.map(chuNgayNgan).join(", ")} đã có khách. Chọn ngày khác.` };
};

// Số tiền gõ trong ô: chỉ giữ chữ số. Trống là chưa có tiền phòng (CN4-01).
export const docTien = (chu: string) => {
  const so = chu.replace(/\D/g, "");
  return so === "" ? null : Number(so);
};

// Toast sau khi lưu (US3-NT1, CN4-03)
export const chuToastDatPhong = (tenNguoiDat: string | null, maCan: string) =>
  `Đã thêm đặt phòng ${tenNguoiDat ?? "Khách lẻ"} · ${maCan}`;

export type FormCN4 = {
  canId: string | null;
  ngayNhan: string;
  chipDem: SoDemChip;
  traTuyChon: string;
  tenKhach: string | null; // null là "Khách lẻ" không tên
  saleId: string | null; // chọn sale đã kết nối làm người đặt (GET /ket-noi, id dòng ket_noi); có thì không kèm tên khách
  tienPhong: string;
  trangThaiTien: TrangThaiTien;
  tienCoc: string;
  moChiTiet: boolean;
  soKhach: number;
  ghiChu: string;
};

export const formMoi = (canId: string | null, ngayNhan: string): FormCN4 => ({
  canId,
  ngayNhan,
  chipDem: 1,
  traTuyChon: congNgay(ngayNhan, 1),
  tenKhach: null,
  saleId: null,
  tienPhong: "",
  trangThaiTien: "chua_coc",
  tienCoc: "",
  moChiTiet: false,
  soKhach: 2,
  ghiChu: "",
});

type Props = {
  can: CanTrenLich[];
  sale: SaleKetNoi[];
  khachLe: string[];
  form: FormCN4;
  kiemTra: KiemTrung | null;
  daSuaTien: boolean;
  dangLuu: boolean;
  loiChung: string | null;
  onDoi: (moi: Partial<FormCN4>) => void;
  onLuu: () => void;
  onChuaLam: (chu: string) => void;
  // CN4-02 (US10): sửa đặt phòng. Người đặt giữ nguyên (đổi người đặt còn [MỞ: DC53]); nút "Lưu thay đổi".
  sua?: { laSale: boolean; tenNguoiDat: string | null };
};

const Nhan = ({ children }: { children: React.ReactNode }) => (
  <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>{children}</span>
);

export const NoiDungCN4 = ({ can, sale, khachLe, form, kiemTra, daSuaTien, dangLuu, loiChung, onDoi, onLuu, onChuaLam, sua }: Props) => {
  const tra = ngayTraTheoChip(form.ngayNhan, form.chipDem, form.traTuyChon);
  const dong = form.canId ? dongKiemTrung(form.ngayNhan, tra, kiemTra) : null;
  const tien = docTien(form.tienPhong);
  const thieuTien = tien === null && daSuaTien;
  const khongLuuDuoc = tien === null || !form.canId || dangLuu;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 140 }}>
        {loiChung && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loiChung}</span>
          </div>
        )}
        <div className="khoi">
          <Nhan>Phòng</Nhan>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {can.map((c, i) => (
              <button
                key={c.can_id}
                type="button"
                className={`hh-chip hh-chip--${mauCuaCan(i)}` + (form.canId === c.can_id ? " hh-chip--on" : "")}
                aria-pressed={form.canId === c.can_id}
                onClick={() => onDoi({ canId: c.can_id })}
              >
                <span className="hh-chip__dot" />
                {c.ma_can}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CHIP_SO_DEM.map((c) => (
              <button
                key={String(c.gia_tri)}
                type="button"
                className={"hh-chip hh-chip--sale" + (form.chipDem === c.gia_tri ? " hh-chip--on" : "")}
                aria-pressed={form.chipDem === c.gia_tri}
                onClick={() => onDoi({ chipDem: c.gia_tri, traTuyChon: tra })}
              >
                {c.chu}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label className="hh-field">
              <span className="hh-field__label">Ngày nhận phòng</span>
              <input
                className="hh-input"
                type="date"
                name="ngay_nhan"
                value={form.ngayNhan}
                onChange={(e) => e.target.value && onDoi({ ngayNhan: e.target.value })}
              />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Ngày trả phòng</span>
              <input
                className="hh-input"
                type="date"
                name="ngay_tra"
                value={tra}
                min={congNgay(form.ngayNhan, 1)}
                disabled={form.chipDem !== "tuy_chon"}
                onChange={(e) => e.target.value > form.ngayNhan && onDoi({ traTuyChon: e.target.value })}
              />
            </label>
          </div>
          {dong && (
            <span
              className={dong.loai === "trung" ? "chu-loi" : "chu-phu"}
              style={dong.loai === "ok" ? { color: "var(--action)" } : undefined}
              role="status"
            >
              {dong.chu}
            </span>
          )}
        </div>
        {sua?.laSale ? (
          <div className="khoi">
            <Nhan>Khách / Sale</Nhan>
            <span style={{ font: "var(--text-input)", color: "var(--ink)" }}>{sua.tenNguoiDat ?? "Sale"}</span>
            <span className="chu-phu">Đặt phòng của sale: người đặt giữ nguyên. Sale sẽ được báo khi bạn lưu.</span>
          </div>
        ) : (
        <div className="khoi">
            <Nhan>Khách / Sale</Nhan>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button type="button" className="hh-chip hh-chip--sale" onClick={() => onChuaLam("Thêm sale mới làm ở US sau")}>
                + Sale mới
              </button>
              <button
                type="button"
                className={"hh-chip hh-chip--sale" + (form.tenKhach === null && form.saleId === null ? " hh-chip--on" : "")}
                aria-pressed={form.tenKhach === null && form.saleId === null}
                onClick={() => onDoi({ tenKhach: null, saleId: null })}
              >
                Khách lẻ
              </button>
              {sale.map((s) => (
                <button
                  key={s.sale_id}
                  type="button"
                  className={"hh-chip hh-chip--sale" + (form.saleId === s.sale_id ? " hh-chip--on" : "")}
                  aria-pressed={form.saleId === s.sale_id}
                  onClick={() => onDoi({ saleId: s.sale_id, tenKhach: null })}
                >
                  {s.ten}
                </button>
              ))}
              {khachLe.map((ten) => (
                <button
                  key={ten}
                  type="button"
                  className={"hh-chip hh-chip--sale" + (form.saleId === null && form.tenKhach === ten ? " hh-chip--on" : "")}
                  aria-pressed={form.saleId === null && form.tenKhach === ten}
                  onClick={() => onDoi({ tenKhach: ten, saleId: null })}
                >
                  {ten}
                </button>
              ))}
            </div>
            <span className="chu-phu">
              {form.saleId
                ? `Đặt phòng này tính cho ${sale.find((x) => x.sale_id === form.saleId)?.ten ?? "sale"}. Sale thấy như đặt phòng của mình.`
                : "Khách lẻ: khách tự liên hệ bạn, không qua sale."}
            </span>
          </div>
        )}
        <div className="khoi">
          <label className="hh-field">
            <span className="hh-field__label">
              Tiền phòng (đ) <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <input
              className="hh-input"
              type="text"
              inputMode="numeric"
              name="tien_phong"
              aria-invalid={thieuTien}
              style={thieuTien ? { borderColor: "var(--danger)", outlineColor: "var(--danger)" } : undefined}
              value={tien === null ? "" : chuTien(tien)}
              onChange={(e) => onDoi({ tienPhong: e.target.value })}
            />
          </label>
          {thieuTien && <span className="chu-loi">⚠️ Nhập tiền phòng trước khi lưu</span>}
          {kiemTra && kiemTra.dem.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px" }}>
              {kiemTra.dem.map((d) => (
                <span key={d.ngay} className="chu-phu">
                  {chuNgayNgan(d.ngay)}: {d.gia_chu === null ? "chưa đặt giá" : `${chuTien(d.gia_chu)}đ`}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {CHIP_TIEN.map((c) => (
              <button
                key={c.gia_tri}
                type="button"
                className={"hh-chip hh-chip--sale" + (form.trangThaiTien === c.gia_tri ? " hh-chip--on" : "")}
                aria-pressed={form.trangThaiTien === c.gia_tri}
                style={{ fontSize: 14 }}
                onClick={() => onDoi({ trangThaiTien: c.gia_tri })}
              >
                {c.chu}
              </button>
            ))}
          </div>
          {form.trangThaiTien === "da_coc_con_thu" && (
            <label className="hh-field">
              <span className="hh-field__label">Số tiền cọc (đ)</span>
              <input
                className="hh-input"
                type="text"
                inputMode="numeric"
                name="tien_coc"
                value={docTien(form.tienCoc) === null ? "" : chuTien(docTien(form.tienCoc)!)}
                onChange={(e) => onDoi({ tienCoc: e.target.value })}
              />
            </label>
          )}
        </div>
        <div className="khoi">
          <button
            type="button"
            className="hh-btn hh-btn--text hh-btn--inline"
            style={{ justifyContent: "flex-start" }}
            aria-expanded={form.moChiTiet}
            onClick={() => onDoi({ moChiTiet: !form.moChiTiet })}
          >
            {form.moChiTiet ? "Ẩn chi tiết" : "Thêm chi tiết"}
          </button>
          {form.moChiTiet && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Nhan>Số khách</Nhan>
                <button
                  type="button"
                  className="hh-btn hh-btn--secondary"
                  aria-label="Bớt một khách"
                  style={{ minWidth: 44, minHeight: 44 }}
                  disabled={form.soKhach <= 1}
                  onClick={() => onDoi({ soKhach: form.soKhach - 1 })}
                >
                  −
                </button>
                <span style={{ font: "var(--text-input)", minWidth: 24, textAlign: "center" }} aria-live="polite">
                  {form.soKhach}
                </span>
                <button
                  type="button"
                  className="hh-btn hh-btn--secondary"
                  aria-label="Thêm một khách"
                  style={{ minWidth: 44, minHeight: 44 }}
                  disabled={form.soKhach >= 99}
                  onClick={() => onDoi({ soKhach: form.soKhach + 1 })}
                >
                  +
                </button>
              </div>
              <span className="chu-phu">Giờ nhận, trả: 14:00 → 12:00</span>
              <label className="hh-field">
                <span className="hh-field__label">Ghi chú</span>
                <textarea
                  className="hh-input"
                  name="ghi_chu"
                  rows={2}
                  maxLength={500}
                  value={form.ghiChu}
                  onChange={(e) => onDoi({ ghiChu: e.target.value })}
                />
              </label>
            </>
          )}
        </div>
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={khongLuuDuoc} onClick={onLuu}>
          {dangLuu ? "Đang lưu…" : sua ? "Lưu thay đổi" : "Thêm đặt phòng"}
        </button>
      </div>
    </>
  );
};

// Chữ lỗi khi lưu không được (HV2 bước 3, US3-NT3)
export const loiKhiLuu = (e: unknown) => {
  if (e instanceof LoiMang) return "Chưa lưu được, bấm lại khi có mạng";
  if (e instanceof LoiApi && e.loi === "TRUNG_LICH") {
    return `Trùng lịch: ${(e.dem_trung ?? []).map(chuNgayNgan).join(", ")} đã có khách. Chọn ngày khác.`;
  }
  if (e instanceof LoiApi && e.loi === "KHONG_TIM_THAY") return "Không tìm thấy căn này. Quay lại lịch rồi thử lại.";
  return "Có lỗi, chưa lưu được. Bấm lại";
};

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN4DatPhong = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const viTri = useLocation();
  const moTu = (viTri.state as { can_id?: string; ngay?: string } | null) ?? {};
  const [can, setCan] = useState<CanTrenLich[]>([]);
  const [sale, setSale] = useState<SaleKetNoi[]>([]);
  const [khachLe, setKhachLe] = useState<string[]>([]);
  const [form, setForm] = useState<FormCN4>(() => formMoi(moTu.can_id ?? null, moTu.ngay ?? homNay()));
  const [daSuaTien, setDaSuaTien] = useState(false);
  const [kiemTra, setKiemTra] = useState<KiemTrung | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const dangLuuRef = useRef(false);
  const lanKiem = useRef(0);
  // Một khóa cho một nội dung form (server.md 1.6): gửi lại cùng nội dung sau lỗi mạng dùng lại khóa (HV2)
  const khoa = useRef(khoaMoi());

  const tra = ngayTraTheoChip(form.ngayNhan, form.chipDem, form.traTuyChon);

  useEffect(() => {
    const huy = { da: false };
    (async () => {
      try {
        const lich = await getLichThang({ thang: thangCua(homNay()) });
        if (huy.da) return;
        setCan(lich.can);
        const canId = moTu.can_id ?? lich.can[0]?.can_id ?? null;
        if (!moTu.ngay && canId) {
          // Mở từ nút "Đặt phòng" ở đầu lịch: đêm trống đầu tiên (mục "Chủ nhà ghi booking mới" (US3) trạng thái rỗng)
          const g = await getGoiY({ can_id: canId });
          if (!huy.da) setForm((f) => ({ ...f, canId, ...(g.ngay_nhan ? { ngayNhan: g.ngay_nhan, traTuyChon: g.ngay_tra! } : {}) }));
        } else if (!huy.da) {
          setForm((f) => ({ ...f, canId }));
        }
        const [s, k] = await Promise.all([getSaleKetNoi(), getKhachLe()]);
        if (huy.da) return;
        setSale(s);
        setKhachLe(k.muc.map((m) => m.ten_khach));
      } catch (e) {
        if (!huy.da) setLoiChung(loiKhiLuu(e));
      }
    })();
    return () => {
      huy.da = true;
    };
  }, []);

  // Kiểm trùng và điền sẵn tiền phòng mỗi khi đổi căn hay ngày (mục "Căn, ngày và kiểm tra trùng lịch" (US3) bước 4, mục "Người đặt, tiền phòng và tiền cọc" (US3) bước 2, QT4.1)
  useEffect(() => {
    if (!form.canId) return;
    const lan = ++lanKiem.current;
    setKiemTra(null);
    getKiemTrung({ can_id: form.canId, ngay_nhan: form.ngayNhan, ngay_tra: tra }).then(
      (kq) => {
        if (lan !== lanKiem.current) return;
        setKiemTra(kq);
        if (kq.tong_gia_chu !== null) setForm((f) => ({ ...f, tienPhong: String(kq.tong_gia_chu) }));
      },
      () => {
        // Kiểm sớm không được thì vẫn cho lưu; lúc lưu server kiểm lại
      },
    );
  }, [form.canId, form.ngayNhan, tra]);

  const doi = (moi: Partial<FormCN4>) => {
    if ("tienPhong" in moi) setDaSuaTien(true);
    khoa.current = khoaMoi();
    setLoiChung(null);
    setForm((f) => ({ ...f, ...moi }));
  };

  const luu = async () => {
    const tien = docTien(form.tienPhong);
    if (tien === null) {
      setDaSuaTien(true);
      return;
    }
    if (!form.canId || dangLuuRef.current) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      const dp = await postBooking(
        {
          can_id: form.canId,
          ngay_nhan: form.ngayNhan,
          ngay_tra: tra,
          sale_id: form.saleId,
          ten_khach: form.saleId ? null : form.tenKhach,
          tien_phong: tien,
          trang_thai_tien: form.trangThaiTien,
          tien_coc: form.trangThaiTien === "da_coc_con_thu" ? docTien(form.tienCoc) : null,
          so_khach: form.moChiTiet ? form.soKhach : null,
          gio_nhan: null,
          gio_tra: null,
          ghi_chu: form.moChiTiet && form.ghiChu.trim() ? form.ghiChu.trim() : null,
        },
        khoa.current,
      );
      toast(chuToastDatPhong(dp.nguoi_dat.ten, dp.ma_can));
      // Về lịch, ngày nhận mở sẵn trong chi tiết ngày (mục "Chủ nhà ghi booking mới" (US3) bước 3)
      boNhoLich.ghiDangXem({ thang: thangCua(dp.ngay_nhan), ngay: dp.ngay_nhan });
      // Sale ghi đặt phòng cho căn của tôi (S6-07) thì về Lịch của sale
      dieuHuong(layVai() === "sale" ? DUONG.LICH_SALE : DUONG.LICH, { replace: true, state: { vuaGhi: dp.ngay_nhan } });
    } catch (e) {
      setLoiChung(loiKhiLuu(e));
      if (e instanceof LoiApi && e.loi === "TRUNG_LICH" && form.canId) {
        getKiemTrung({ can_id: form.canId, ngay_nhan: form.ngayNhan, ngay_tra: tra }).then(setKiemTra, () => {});
      }
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Thêm đặt phòng" coLui />
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
      />
    </Page>
  );
};
