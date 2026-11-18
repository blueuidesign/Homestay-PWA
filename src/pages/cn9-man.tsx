import React from "react";
import {
  CHU_CHUA_CHON_LY_DO,
  CHU_DANG_GUI,
  CHU_NUT_CHAP_NHAN,
  CHU_NUT_GUI_TU_CHOI,
  CHU_NUT_QUAY_LAI,
  CHU_NUT_TU_CHOI,
  CHU_NUT_VE_LICH,
  CHU_NUT_XEM_DAT_PHONG,
  NHAN_SALE_NHAN,
  TEN_LY_DO,
  chuBiTuChoiKem,
  chuCanhBaoTrung,
  chuDaNhan,
  chuDaTuChoi,
  chuDaVaoLich,
  chuDong,
  chuKhoangDem,
  chuKhongConCho,
  chuTuChoiKem,
  tenCanYC,
  tenSale,
} from "../components/yeu-cau-hien-thi";
import { CAC_LY_DO_TU_CHOI, type KetQuaChapNhan, type LyDoTuChoi, type YeuCauChu } from "../services/yeu-cau";

// CN9 Yêu cầu đặt phòng (mục "Chủ nhà nhận và trả lời yêu cầu" (US15) bước 3 đến 5, mục "Yêu cầu trùng ngày" (US15) bước 2), CN9-02 Đã chấp nhận, CN9-03 Đã từ chối. Phần vẽ, không gọi server.
// Chủ nhà chỉ thấy "Giá của bạn": YeuCauChu không có gia_ban, tien_chenh (quy tắc Sale thấy hai giá, chủ nhà thấy một giá, PQ11.CHU).
// Số "đã bán N đặt phòng của bạn": [MỞ: CH-022], không vẽ.

const Dong = ({ nhan, gia_tri, dam }: { nhan: string; gia_tri: string; dam?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--text-body)", color: "var(--ink)" }}>
    <span style={{ color: "var(--ink-secondary)" }}>{nhan}</span>
    <span style={{ fontWeight: dam ? 700 : 400 }}>{gia_tri}</span>
  </div>
);

const ChiTiet = ({ yc }: { yc: YeuCauChu }) => (
  <div className="khoi" data-chi-tiet>
    <Dong nhan="Phòng" gia_tri={tenCanYC({ ten_toa_nha: null, ma_can: yc.can.ma_can })} />
    <Dong nhan="Ngày ở" gia_tri={chuKhoangDem(yc.ngay_nhan, yc.ngay_tra)} />
    <Dong nhan="Giá của bạn" gia_tri={chuDong(yc.gia_chu)} dam />
  </div>
);

export type PropsCN9 = {
  yc: YeuCauChu;
  ketQua: KetQuaChapNhan | null; // vừa chấp nhận ở màn này
  hienChip: boolean;
  lyDo: LyDoTuChoi | null;
  dangLam: "chap_nhan" | "tu_choi" | null;
  loi: string | null;
  onGoi: () => void;
  onChapNhan: () => void;
  onMoTuChoi: () => void;
  onQuayLai: () => void;
  onChonLyDo: (l: LyDoTuChoi) => void;
  onGuiTuChoi: () => void;
  onXemDatPhong: (bookingId: string) => void;
  onVeLich: () => void;
};

const TheSale = ({ yc, onGoi }: { yc: YeuCauChu; onGoi: () => void }) => (
  <div className="khoi" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }} data-the-sale>
    <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{tenSale(yc)}</span>
    {yc.sale.so_dien_thoai && (
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" style={{ minHeight: 44 }} onClick={onGoi}>
        Gọi
      </button>
    )}
  </div>
);

export const NoiDungCN9 = ({ yc, ketQua, hienChip, lyDo, dangLam, loi, onGoi, onChapNhan, onMoTuChoi, onQuayLai, onChonLyDo, onGuiTuChoi, onXemDatPhong, onVeLich }: PropsCN9) => {
  const baoLoi = loi && (
    <div className="hh-banner hh-banner--danger" role="alert">
      <span>⚠️ {loi}</span>
    </div>
  );
  // CN9-02
  if (ketQua || yc.trang_thai === "da_chot") {
    const bookingId = ketQua?.booking.id ?? yc.booking_id;
    return (
      <div className="noi-dung" data-man="CN9-02">
        <div className="khoi" role="status" style={{ background: "var(--action-tint)", borderColor: "var(--action-ring)" }}>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuDaNhan(yc)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{chuDaVaoLich(yc)}</span>
        </div>
        <ChiTiet yc={yc} />
        <div className="khoi">
          <Dong nhan="Sale" gia_tri={tenSale(yc)} />
        </div>
        {ketQua?.yeu_cau_bi_tu_choi.map((t) => (
          <div key={t.id} className="khoi" data-bi-tu-choi>
            <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{chuBiTuChoiKem(t)}</span>
          </div>
        ))}
        {bookingId && (
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={() => onXemDatPhong(bookingId)}>
            {CHU_NUT_XEM_DAT_PHONG}
          </button>
        )}
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onVeLich}>
          {CHU_NUT_VE_LICH}
        </button>
      </div>
    );
  }
  // CN9-03
  if (yc.trang_thai === "bi_tu_choi") {
    return (
      <div className="noi-dung" data-man="CN9-03">
        <div className="khoi" role="status">
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuDaTuChoi(yc)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{chuTuChoiKem(yc)}</span>
        </div>
        <ChiTiet yc={yc} />
        <div className="khoi">
          <Dong nhan="Sale" gia_tri={tenSale(yc)} />
        </div>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVeLich}>
          {CHU_NUT_VE_LICH}
        </button>
      </div>
    );
  }
  // Hết hạn, sale đã hủy: không trả lời được nữa (chữ tạm)
  const khongCon = chuKhongConCho(yc);
  if (khongCon) {
    return (
      <div className="noi-dung" data-man="CN9-het">
        <div className="khoi" role="status">
          <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{khongCon}</span>
        </div>
        <ChiTiet yc={yc} />
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVeLich}>
          {CHU_NUT_VE_LICH}
        </button>
      </div>
    );
  }
  // CN9
  const dangXuLy = dangLam !== null;
  return (
    <>
      <div className="noi-dung" data-man="CN9" style={{ paddingBottom: 200 }}>
        <TheSale yc={yc} onGoi={onGoi} />
        <ChiTiet yc={yc} />
        {yc.loi_nhan && (
          <div className="khoi" data-sale-nhan>
            <span className="nhan-muc">{NHAN_SALE_NHAN}</span>
            <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{yc.loi_nhan}</span>
          </div>
        )}
        {(yc.trung_yeu_cau ?? []).map((t) => (
          <div key={t.id} className="hh-banner hh-banner--warning" role="status" data-canh-bao-trung style={{ borderRadius: "var(--radius-md)" }}>
            <span>⚠️ {chuCanhBaoTrung(yc, t)}</span>
          </div>
        ))}
        {baoLoi}
        {hienChip && (
          <div className="khoi" data-chip-ly-do>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CAC_LY_DO_TU_CHOI.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={"hh-chip hh-chip--neutral" + (lyDo === l ? " hh-chip--on" : "")}
                  aria-pressed={lyDo === l}
                  onClick={() => onChonLyDo(l)}
                >
                  {TEN_LY_DO[l]}
                </button>
              ))}
            </div>
            {!lyDo && <span className="chu-phu">{CHU_CHUA_CHON_LY_DO}</span>}
          </div>
        )}
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hienChip ? (
            <>
              <button type="button" className="hh-btn hh-btn--danger hh-btn--block" disabled={dangXuLy} onClick={onGuiTuChoi}>
                {dangLam === "tu_choi" ? CHU_DANG_GUI : CHU_NUT_GUI_TU_CHOI}
              </button>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangXuLy} onClick={onQuayLai}>
                {CHU_NUT_QUAY_LAI}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangXuLy} onClick={onChapNhan}>
                {dangLam === "chap_nhan" ? CHU_DANG_GUI : CHU_NUT_CHAP_NHAN}
              </button>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangXuLy} onClick={onMoTuChoi}>
                {CHU_NUT_TU_CHOI}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
