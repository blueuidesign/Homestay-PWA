import React from "react";
import { chuGiaNgan } from "../components/gia-hien-thi";
import { tenCanS3 } from "../components/muc-cong-hien-thi";
import {
  CHU_CHUA_CHON_NGAY,
  CHU_DA_DAT_ROI,
  CHU_DANG_GUI,
  CHU_GHI_CHU_S302,
  CHU_NHAN_CHU_NHA,
  CHU_NUT_CHON_NGAY,
  CHU_NUT_GOI_CHU,
  CHU_NUT_GUI_YEU_CAU,
  CHU_NUT_HUY,
  CHU_NUT_NHAN_ZALO,
  CHU_NUT_TIM_CAN_KHAC,
  CHU_NUT_VE_LICH_PHONG,
  CHU_NUT_XAC_NHAN_HUY,
  CHU_NUT_XEM_TAT_CA,
  NHAN_CAN_TUONG_TU,
  NHAN_DA_HUY,
  NHAN_YEU_CAU_BI_TU_CHOI,
  NHAN_YEU_CAU_HET_HAN,
  chuBanBan,
  chuDaChapNhan,
  chuDaGuiLuc,
  chuDaHuy,
  chuDangCho,
  chuDong,
  chuHetHan,
  chuKhoang,
  chuKhoangDem,
  chuLyDoTuChoi,
  chuVaoLich,
  tenCanYC,
  tenChuNha,
} from "../components/yeu-cau-hien-thi";
import type { CanTim, ChiTietCanSale } from "../services/kieu";
import { chuThu, soCuaNgay } from "../services/ngay";
import type { YeuCauSale } from "../services/yeu-cau";

// S3-02 Đặt phòng (YC4.5 bước 1 đến 3) và S3-03, S3-04, S3-05, S3-08, S3-09 (YC4.5 bước 4 đến 6, YC4.7). Phần vẽ, không gọi server.
// Hai giá: sale thấy giá bán cho khách và giá chủ nhà (quy tắc Sale thấy hai giá, chủ nhà thấy một giá).

const Dong = ({ nhan, gia_tri, dam }: { nhan: string; gia_tri: string; dam?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--text-body)", color: "var(--ink)" }}>
    <span>{nhan}</span>
    <span style={{ fontWeight: dam ? 700 : 400 }}>{gia_tri}</span>
  </div>
);

export const HaiGia = ({ giaBan, giaChu }: { giaBan: number | null | undefined; giaChu: number | null | undefined }) => (
  <div className="khoi" data-hai-gia>
    {typeof giaBan === "number" && (
      <div data-gia-ban>
        <Dong nhan="Giá bán cho khách" gia_tri={chuDong(giaBan)} dam />
      </div>
    )}
    {typeof giaChu === "number" && (
      <div data-gia-chu>
        <Dong nhan="Giá chủ nhà" gia_tri={chuDong(giaChu)} />
      </div>
    )}
  </div>
);

// Thẻ căn: S3-03 trở đi chỉ có mã căn (GET /yeu-cau/:id không trả số phòng ngủ), S3-02 có "2PN" từ GET /sale/can/:id
export const TheCanYeuCau = ({ ten, dong }: { ten: string; dong: string }) => (
  <div className="khoi">
    <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }} data-ten-can>
      {ten}
    </span>
    <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{dong}</span>
  </div>
);

export type OLichCan = { ngay: string; trang_thai: "trong" | "kin"; gia_ban?: number | null };

// S3-07: bốn ô ngày của lịch căn tải lại, đêm vừa có người đặt ghi "Kín"
export const LichCanTaiLai = ({ o }: { o: OLichCan[] }) => (
  <div data-lich-tai-lai style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, o.length)}, minmax(0, 1fr))`, gap: 4 }}>
    {o.map((x) => (
      <div
        key={x.ngay}
        data-ngay={x.ngay}
        data-trang-thai={x.trang_thai}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 56,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          background: x.trang_thai === "kin" ? "var(--border-subtle)" : "var(--surface)",
          color: "var(--ink-body)",
          font: "var(--text-body)",
        }}
      >
        <span>
          {chuThu(x.ngay)} {String(soCuaNgay(x.ngay)).padStart(2, "0")}
        </span>
        <span style={{ fontWeight: 700 }}>{x.trang_thai === "kin" ? "Kín" : typeof x.gia_ban === "number" ? chuGiaNgan(x.gia_ban) : "Trống"}</span>
      </div>
    ))}
  </div>
);

export type PropsS302 = {
  can: ChiTietCanSale;
  ngay: { nhan: string; tra: string } | null;
  loiNhan: string;
  dangGui: boolean;
  loi: string | null; // lỗi thường: mạng, quyền, chung
  datRoi: { o: OLichCan[] } | null; // S3-07
  onDoiLoiNhan: (chu: string) => void;
  onGui: () => void;
  onTimCanKhac: () => void;
  onChonNgay: () => void;
};

export const NoiDungS302 = ({ can, ngay, loiNhan, dangGui, loi, datRoi, onDoiLoiNhan, onGui, onTimCanKhac, onChonNgay }: PropsS302) => {
  const ten = tenCanS3(can);
  const tenChu = can.chu_nha.ten_hien_thi ?? "Chủ nhà";
  if (!ngay) {
    return (
      <div className="noi-dung">
        <TheCanYeuCau ten={ten} dong={tenChu} />
        <div className="khoi">
          <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{CHU_CHUA_CHON_NGAY}</span>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onChonNgay}>
            {CHU_NUT_CHON_NGAY}
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 160 }}>
        <TheCanYeuCau ten={ten} dong={`${tenChu} · ${chuKhoangDem(ngay.nhan, ngay.tra)}`} />
        <HaiGia giaBan={can.tong_gia_ban} giaChu={can.tong_gia_chu} />
        <div className="khoi" data-bang-dat-phong>
          <span className="nhan-muc">ĐẶT PHÒNG</span>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>
            {tenCanYC({ ten_toa_nha: can.toa_nha?.ten ?? null, ma_can: can.ma_can })} · {chuKhoang(ngay.nhan, ngay.tra)}
          </span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
            Chủ nhà: {tenChu}
            {typeof can.tong_gia_chu === "number" ? ` · ${chuDong(can.tong_gia_chu)}` : ""}
          </span>
        </div>
        {datRoi && (
          <div className="hh-banner hh-banner--danger" role="alert" data-loi-dat-roi style={{ flexDirection: "column" }}>
            <span style={{ fontWeight: 700 }}>⚠️ {CHU_DA_DAT_ROI}</span>
            <span>Một số đêm vừa có người đặt. Yêu cầu chưa được gửi. Lịch của căn đã tải lại:</span>
            <LichCanTaiLai o={datRoi.o} />
          </div>
        )}
        {loi && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loi}</span>
          </div>
        )}
        <label className="hh-field">
          <span className="hh-field__label">{CHU_NHAN_CHU_NHA}</span>
          <textarea
            className="hh-input"
            name="loi_nhan"
            rows={3}
            maxLength={500}
            value={loiNhan}
            placeholder={CHU_NHAN_CHU_NHA}
            onChange={(e) => onDoiLoiNhan(e.target.value)}
          />
        </label>
        <span className="chu-phu">{CHU_GHI_CHU_S302}</span>
      </div>
      <div className="thanh-duoi">
        {datRoi ? (
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onTimCanKhac}>
            {CHU_NUT_TIM_CAN_KHAC}
          </button>
        ) : (
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangGui} onClick={onGui}>
            {dangGui ? CHU_DANG_GUI : CHU_NUT_GUI_YEU_CAU}
          </button>
        )}
      </div>
    </>
  );
};

// ---- Kết quả của sale: S3-03 (chờ), S3-04 (chấp nhận), S3-05 (từ chối), S3-09 (hết hạn), S3-08 (đã hủy) ----
export type PropsKetQua = {
  yc: YeuCauSale;
  canTuongTu: CanTim[] | null; // null: chưa tải hoặc lỗi
  loiCanTuongTu: boolean;
  hoiHuy: boolean;
  dangLam: "huy" | null;
  loi: string | null;
  onNhanZalo: () => void;
  onGoi: () => void;
  onHuy: () => void;
  onVeLich: () => void;
  onMoCan: (c: CanTim) => void;
  onXemTatCa: () => void;
};

const KhoiCanTuongTu = ({ can, loi, onMoCan, onXemTatCa }: { can: CanTim[] | null; loi: boolean } & Pick<PropsKetQua, "onMoCan" | "onXemTatCa">) => (
  <>
    <div className="khoi" data-can-tuong-tu>
      <span className="nhan-muc">{NHAN_CAN_TUONG_TU}</span>
      {can === null && !loi && <div aria-busy="true" className="khung-xam" style={{ height: 64 }} />}
      {loi && <span className="chu-phu">Chưa tải được các căn tương tự</span>}
      {can?.map((c) => (
        <button
          key={c.id}
          type="button"
          className="hh-btn hh-btn--secondary hh-btn--block"
          style={{ justifyContent: "space-between", textAlign: "left" }}
          data-can-tuong-tu-id={c.id}
          onClick={() => onMoCan(c)}
        >
          <span>
            {[c.toa_nha?.ten, c.ma_can].filter(Boolean).join(" ")}
            {c.so_phong_ngu ? ` · ${c.so_phong_ngu}PN` : ""}
          </span>
          {typeof c.tong_gia_ban === "number" && <span>{chuBanBan(c.tong_gia_ban, c.chu_nha?.ten_hien_thi ?? null)}</span>}
        </button>
      ))}
      {can && can.length === 0 && <span className="chu-phu">Không có căn trống cùng ngày</span>}
    </div>
    <div className="thanh-duoi">
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onXemTatCa}>
        {CHU_NUT_XEM_TAT_CA}
      </button>
    </div>
  </>
);

export const NoiDungKetQuaSale = ({ yc, canTuongTu, loiCanTuongTu, hoiHuy, dangLam, loi, onNhanZalo, onGoi, onHuy, onVeLich, onMoCan, onXemTatCa }: PropsKetQua) => {
  const the = <TheCanYeuCau ten={tenCanYC(yc.can)} dong={`${tenChuNha(yc)} · ${chuKhoangDem(yc.ngay_nhan, yc.ngay_tra)}`} />;
  const gia = <HaiGia giaBan={yc.gia_ban} giaChu={yc.gia_chu} />;
  const baoLoi = loi && (
    <div className="hh-banner hh-banner--danger" role="alert">
      <span>⚠️ {loi}</span>
    </div>
  );
  if (yc.trang_thai === "cho_chu") {
    return (
      <div className="noi-dung" data-man="S3-03">
        {the}
        {gia}
        <div className="khoi" data-the-cho>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuDangCho(yc)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{chuDaGuiLuc(yc)}</span>
        </div>
        {baoLoi}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onNhanZalo}>
          {CHU_NUT_NHAN_ZALO}
        </button>
        {yc.chu_nha.so_dien_thoai && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onGoi}>
            {CHU_NUT_GOI_CHU}
          </button>
        )}
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangLam === "huy"} onClick={onHuy}>
          {hoiHuy ? CHU_NUT_XAC_NHAN_HUY : CHU_NUT_HUY}
        </button>
      </div>
    );
  }
  if (yc.trang_thai === "da_chot") {
    return (
      <div className="noi-dung" data-man="S3-04">
        {the}
        {gia}
        <div className="khoi" role="status" style={{ background: "var(--action-tint)", borderColor: "var(--action-ring)" }}>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuDaChapNhan(yc)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{chuVaoLich(yc)}</span>
        </div>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVeLich}>
          {CHU_NUT_VE_LICH_PHONG}
        </button>
      </div>
    );
  }
  if (yc.trang_thai === "da_huy") {
    return (
      <div className="noi-dung" data-man="S3-08">
        {the}
        {gia}
        <div className="khoi" role="status">
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{NHAN_DA_HUY}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{chuDaHuy(yc)}</span>
        </div>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVeLich}>
          {CHU_NUT_VE_LICH_PHONG}
        </button>
      </div>
    );
  }
  const tuChoi = yc.trang_thai === "bi_tu_choi";
  return (
    <>
      <div className="noi-dung" data-man={tuChoi ? "S3-05" : "S3-09"} style={{ paddingBottom: 96 }}>
        {the}
        {gia}
        <div
          className="khoi"
          role="status"
          style={
            tuChoi
              ? { background: "var(--danger-tint)", borderColor: "var(--danger-border)" }
              : { background: "var(--warning-tint)", borderColor: "var(--warning-border)" }
          }
        >
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{tuChoi ? NHAN_YEU_CAU_BI_TU_CHOI : NHAN_YEU_CAU_HET_HAN}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{tuChoi ? chuLyDoTuChoi(yc) : chuHetHan(yc)}</span>
        </div>
        <KhoiCanTuongTu can={canTuongTu} loi={loiCanTuongTu} onMoCan={onMoCan} onXemTatCa={onXemTatCa} />
      </div>
    </>
  );
};
