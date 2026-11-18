import React from "react";
import { chuPhongNgu, tenThe } from "../components/can-hien-thi";
import { Icon } from "../components/icon";
import type { Can, DongKetNoi } from "../services/kieu";

// CN10 · Gửi lịch cho sale (YC1.8), CN10-00 khi chưa có sale đã lưu, CN10-01 khi đóng cửa sổ Zalo mà chưa gửi.
// Phần vẽ, tách khỏi cn10-gui-lich.tsx để test. Màn gốc theo canvas OwnerCalendar, CN10-00 và CN10-01 chỉ đổi phần trạng thái.

export const CHU_MO_TA_CN10 = "Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Không thấy tên khách và tiền cọc.";
export const CHU_GHI_CHU_SALE =
  "Sale bạn đã lưu trong tab Sale. Zalo mở sẵn tin nhắn kèm link lịch cho từng sale đã chọn, bạn bấm gửi. Không chọn ai thì Zalo mở cửa sổ chia sẻ để bạn chọn người nhận.";
export const CHU_CHUA_CO_SALE = 'Chưa có sale nào đã lưu. Bấm "Gửi lịch qua Zalo" rồi tự chọn sale trong danh bạ Zalo.';
export const CHU_DE_SAU_CN10 = "Để sau vẫn gửi lịch được. Sale chưa thấy tên và số của bạn.";
export const CHU_ZALO_SE_MO = "Zalo sẽ mở để bạn chọn người nhận";
export const CHU_CHUA_GUI = "Bạn chưa gửi";
export const CHU_CHUA_GUI_PHU = "Cửa sổ Zalo đã đóng mà chưa gửi cho ai. Bấm lại để gửi.";
export const CHU_CAN_CHON_CAN = "Chọn ít nhất một căn"; // YC không nói khi bỏ chọn hết căn: tạm chặn nút (ghi trong PR)

export const chuDaChonCan = (chon: number, tong: number) => `Căn · đã chọn ${chon}/${tong}`;
export const chuCanTrongBuoc = (c: Pick<Can, "ma_can" | "so_phong_ngu">) => `${tenThe(c.ma_can)} · ${chuPhongNgu(c.so_phong_ngu)}`;
// Cửa sổ Zalo mỗi sale một cái (tạm, [MỞ: YC1-H15]) nên chữ dưới nút nói rõ số tin
export const chuDuoiNut = (soSale: number) => (soSale === 0 ? CHU_ZALO_SE_MO : `Zalo sẽ mở ${soSale} tin, mỗi tin một sale. Bạn bấm gửi từng tin.`);
export const chuTrangThaiSale = (d: DongKetNoi) => (d.trang_thai === "da_ket_noi" ? "Đã kết nối" : "Chưa mở link");

// Chỉ sale chủ nhà còn gửi được: đã kết nối hoặc thêm tay chưa kết nối (không gồm đã xóa tài khoản)
export const saleGuiDuoc = (ds: { da_ket_noi: DongKetNoi[]; chua_ket_noi: DongKetNoi[] }) =>
  [...ds.da_ket_noi, ...ds.chua_ket_noi].filter((d) => d.trang_thai === "da_ket_noi" || d.trang_thai === "chua_ket_noi");

export const OChon = ({ chon, chu, phu, onDoi }: { chon: boolean; chu: string; phu?: string; onDoi: () => void }) => (
  <div style={{ minHeight: 44, display: "flex", alignItems: "center" }}>
    <button
      type="button"
      role="checkbox"
      aria-checked={chon}
      className={"hh-check" + (chon ? " hh-check--on" : "")}
      style={{ width: "100%", minHeight: 44 }}
      onClick={onDoi}
    >
      <span className="hh-check__box" aria-hidden="true">
        {chon && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column" }}>
        <span>{chu}</span>
        {phu && <span className="chu-phu">{phu}</span>}
      </span>
    </button>
  </div>
);

const DauBuoc = ({ so, ten, phu, nut, onNut }: { so: number; ten: string; phu: string; nut: string; onNut: () => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{ flex: "0 0 auto", width: 24, height: 24, borderRadius: "var(--radius-full)", background: "var(--ink)", color: "var(--on-action)", font: "var(--text-label)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {so}
        </span>
        <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>{ten}</span>
      </div>
      <span className="chu-phu" style={{ paddingLeft: 32 }}>
        {phu}
      </span>
    </div>
    <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onNut}>
      {nut}
    </button>
  </div>
);

export type PropsCN10 = {
  can: Can[];
  sale: DongKetNoi[];
  canChon: string[];
  saleChon: string[];
  chuaGui: boolean; // CN10-01
  dangGui: boolean;
  loi: string | null;
  onDoiCan: (id: string) => void;
  onTatCaCan: () => void;
  onDoiSale: (id: string) => void;
  onTatCaSale: () => void;
  onGui: () => void;
  onThemSale: () => void;
};

export const NoiDungCN10 = (p: PropsCN10) => {
  const tatCaCan = p.can.length > 0 && p.canChon.length === p.can.length;
  const tatCaSale = p.sale.length > 0 && p.saleChon.length === p.sale.length;
  const khongChonCan = p.canChon.length === 0;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 140 }}>
        {p.chuaGui && (
          <div className="hh-banner hh-banner--warning" role="status" style={{ borderRadius: "var(--radius-md)", flexDirection: "column" }}>
            <b>{CHU_CHUA_GUI}</b>
            <span>{CHU_CHUA_GUI_PHU}</span>
            <button type="button" className="hh-btn hh-btn--secondary" disabled={p.dangGui || khongChonCan} onClick={p.onGui}>
              Gửi link qua Zalo
            </button>
          </div>
        )}
        {p.loi && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {p.loi}</span>
          </div>
        )}
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)", padding: "0 4px" }}>{CHU_MO_TA_CN10}</span>
        <div className="khoi">
          <DauBuoc
            so={1}
            ten="Bước 1: Chọn căn"
            phu={chuDaChonCan(p.canChon.length, p.can.length)}
            nut={tatCaCan ? "Bỏ chọn" : "Chọn tất cả"}
            onNut={p.onTatCaCan}
          />
          {p.can.map((c) => (
            <OChon key={c.id} chon={p.canChon.includes(c.id)} chu={chuCanTrongBuoc(c)} onDoi={() => p.onDoiCan(c.id)} />
          ))}
        </div>
        <div className="khoi">
          <DauBuoc
            so={2}
            ten="Bước 2: Chọn sale để chia sẻ lịch"
            phu="Sale đã lưu · không bắt buộc"
            nut={tatCaSale ? "Bỏ chọn" : "Chọn tất cả"}
            onNut={p.onTatCaSale}
          />
          {p.sale.length === 0 ? (
            <>
              <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_CHUA_CO_SALE}</span>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={p.onThemSale}>
                <Icon ten="cong" co={16} />
                Thêm sale
              </button>
            </>
          ) : (
            p.sale.map((d) => (
              <OChon key={d.id} chon={p.saleChon.includes(d.id)} chu={d.ten_hien_thi ?? "Sale chưa có tên"} phu={chuTrangThaiSale(d)} onDoi={() => p.onDoiSale(d.id)} />
            ))
          )}
          <span className="chu-phu">{CHU_GHI_CHU_SALE}</span>
        </div>
      </div>
      <div className="thanh-duoi" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="chu-phu" style={{ textAlign: "center" }}>
          {khongChonCan ? CHU_CAN_CHON_CAN : chuDuoiNut(p.saleChon.length)}
        </span>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={p.dangGui || khongChonCan} onClick={p.onGui}>
          {p.dangGui ? "Đang xử lý…" : "Gửi lịch qua Zalo"}
        </button>
      </div>
    </>
  );
};

// Thẻ "Gửi lịch cho sale · Lịch chung các căn" ở tab Lịch (CN1 thành phần 6, YC2 bước 6)
export const TheGuiLich = ({ onBam }: { onBam: () => void }) => (
  <button
    type="button"
    className="khoi"
    style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", minHeight: 56, textAlign: "left", cursor: "pointer", font: "inherit" }}
    onClick={onBam}
  >
    <span className="o-chu-cai">
      <Icon ten="nhom-nguoi" co={20} />
    </span>
    <span style={{ flex: "1 1 0%", display: "flex", flexDirection: "column" }}>
      <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>Gửi lịch cho sale</span>
      <span className="chu-phu">Lịch chung các căn</span>
    </span>
    <Icon ten="mui-phai" co={16} />
  </button>
);
