import React from "react";
import { Icon } from "../components/icon";
import {
  chuChuaDoc,
  chuGioDong,
  CHU_P13_DANH_DAU,
  CHU_P13_RONG,
  CHU_P13_RONG_PHU,
  dongThongBao,
  laHomNay,
} from "../components/thong-bao-hien-thi";
import type { MucThongBao } from "../services/kieu";

// P13 · Thông báo (mục "Thông báo kết quả kết nối cho sale" (US17) bước 3), P13-00 khi chưa có. Phần vẽ, tách khỏi p13-thong-bao.tsx để test.
// Chưa đọc: nền xanh nhạt, chấm xanh, chữ đậm. Đã đọc: nền trắng, chữ thường. Nhóm "Hôm nay" và "Trước đó" theo ngày Việt Nam.
export type PropsP13 = {
  muc: MucThongBao[];
  soChuaDoc: number;
  bayGio?: number;
  dangLam: boolean;
  loi: string | null;
  conNua: boolean;
  onDanhDauHet: () => void;
  onCham: (m: MucThongBao) => void;
  onXemThem: () => void;
};

const DongP13 = ({ m, bayGio, onCham }: { m: MucThongBao; bayGio?: number; onCham: (m: MucThongBao) => void }) => {
  const d = dongThongBao(m);
  const chuaDoc = m.da_doc_luc === null;
  return (
    <button
      type="button"
      data-dong-tb
      data-chua-doc={chuaDoc ? "1" : "0"}
      onClick={() => onCham(m)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        minHeight: 56,
        padding: "12px 16px",
        textAlign: "left",
        border: 0,
        borderBottom: "1px solid var(--border-subtle)",
        background: chuaDoc ? "var(--action-tint)" : "var(--surface)",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <span
        aria-hidden="true"
        style={{ flex: "0 0 auto", width: 10, height: 10, marginTop: 6, borderRadius: "var(--radius-full)", background: chuaDoc ? "var(--action-bright)" : "transparent" }}
      />
      <span style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: chuaDoc ? "var(--text-body-strong)" : "var(--text-body)", color: "var(--ink)" }}>{d.tieuDe}</span>
        {d.chiTiet && <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{d.chiTiet}</span>}
      </span>
      <span className="chu-phu" style={{ flex: "0 0 auto" }}>
        {chuGioDong(m.tao_luc, bayGio)}
      </span>
    </button>
  );
};

const Nhom = ({ ten, ds, bayGio, onCham }: { ten: string; ds: MucThongBao[]; bayGio?: number; onCham: (m: MucThongBao) => void }) =>
  ds.length === 0 ? null : (
    <div data-nhom={ten} style={{ display: "flex", flexDirection: "column" }}>
      <span className="nhan-muc" style={{ padding: "12px 16px 6px" }}>
        {ten}
      </span>
      {ds.map((m) => (
        <DongP13 key={m.id} m={m} bayGio={bayGio} onCham={onCham} />
      ))}
    </div>
  );

export const NoiDungP13 = ({ muc, soChuaDoc, bayGio, dangLam, loi, conNua, onDanhDauHet, onCham, onXemThem }: PropsP13) => {
  if (muc.length === 0) {
    // P13-00
    return (
      <div className="noi-dung">
        <div className="khoi" style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
          <span style={{ width: 72, height: 72, borderRadius: "var(--radius-full)", background: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-secondary)" }}>
            <Icon ten="ca-nhan" co={32} />
          </span>
          <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_P13_RONG}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_P13_RONG_PHU}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="noi-dung" style={{ padding: 0 }}>
      {loi && (
        <div className="hh-banner hh-banner--danger" role="alert" style={{ margin: 12 }}>
          <span>⚠️ {loi}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", minHeight: 48 }}>
        <span data-so-chua-doc style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>
          {chuChuaDoc(soChuaDoc)}
        </span>
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline" disabled={dangLam || soChuaDoc === 0} onClick={onDanhDauHet}>
          {CHU_P13_DANH_DAU}
        </button>
      </div>
      <Nhom ten="Hôm nay" ds={muc.filter((m) => laHomNay(m.tao_luc, bayGio))} bayGio={bayGio} onCham={onCham} />
      <Nhom ten="Trước đó" ds={muc.filter((m) => !laHomNay(m.tao_luc, bayGio))} bayGio={bayGio} onCham={onCham} />
      {conNua && (
        <div style={{ padding: 16 }}>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onXemThem}>
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};
