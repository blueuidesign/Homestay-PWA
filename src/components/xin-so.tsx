import React, { useCallback, useRef, useState } from "react";
import { getToi, postToiThongTinZalo } from "../services/api";
import { LoiApi, LoiMang, type HoSo } from "../services/kieu";
import { zalo, type KetQuaXinSo } from "../services/zalo";
import { boNhoHoSo } from "../stores/ho-so";
import { Icon } from "./icon";

// Popup giải thích và luồng "Để sau" dùng chung (YC1.5.1), gọi hộp thoại Zalo xin tên và số (YC1.5.2).
// Mọi nút ở danh sách "Khi nào xảy ra" của YC1.5 dùng lại phần này: CN7, CN7-00 (US5), sau này A6, A8, CN10...
// Mini App chỉ lấy token và gửi cho server; không đổi token ở app (zalo-rang-buoc 2.4).

export const CHU_LOI_MANG = "Chưa lưu được, bấm lại khi có mạng";
export const CHU_LOI_ZALO = "Chưa mở được hộp thoại của Zalo. Bấm lại";
export const CHU_LOI_CHUNG = "Có lỗi, chưa lưu được. Bấm lại";

export type NguoiKia = "sale" | "chu_nha";

// Tiêu đề theo YC1.5.1 bước 1. Canvas CN7-P1, A8-P1 ghi "tên và số điện thoại": YC và canvas khác nhau, làm theo YC (ghi trong PR).
export const tieuDePopup = (nguoiKia: NguoiKia) => `Chia sẻ số điện thoại với ${nguoiKia === "sale" ? "sale" : "chủ nhà"}`;
export const CHU_LY_DO =
  "Sale nhận ra bạn qua tên và số điện thoại trong Nguồn phòng của họ. Home247 lấy tên, ảnh và số từ Zalo trong một lần, lưu vào hồ sơ của bạn. Khách không bao giờ thấy số này.";
export const CHU_BUOC_ZALO = "Zalo sẽ hiện hộp thoại. Bật Tên và ảnh đại diện, Số điện thoại rồi bấm Cho phép.";
export const CHU_DA_TU_CHOI = "Cần tên và số điện thoại để kết nối với chủ nhà"; // HV4 bảng câu trên thẻ

export const PopupXinSo = ({
  nguoiKia,
  ghiChuDeSau,
  lyDo,
  daTuChoi,
  dangXin,
  loi,
  onDongY,
  onDeSau,
  onMoCaiDat,
}: {
  nguoiKia: NguoiKia;
  ghiChuDeSau: string;
  lyDo?: string; // chữ giải thích riêng của màn (A6-P1 nói "Chủ nhà nhận ra bạn…"); không có thì CHU_LY_DO
  daTuChoi: boolean;
  dangXin: boolean;
  loi: string | null;
  onDongY: () => void;
  onDeSau: () => void;
  onMoCaiDat: () => void;
}) => (
  <div className="hh-scrim" role="dialog" aria-modal="true" aria-label={tieuDePopup(nguoiKia)}>
    <div className="hh-sheet">
      <div className="hh-sheet__body" style={{ paddingTop: 24 }}>
        <span className="xin-so__icon">
          <Icon ten="dien-thoai" co={28} />
        </span>
        <h2 className="hh-sheet__title">{tieuDePopup(nguoiKia)}</h2>
        {daTuChoi && <span className="chu-loi" role="status">{CHU_DA_TU_CHOI.replace("chủ nhà", nguoiKia === "sale" ? "sale" : "chủ nhà")}</span>}
        <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{lyDo ?? CHU_LY_DO}</span>
        <div className="khoi" style={{ background: "var(--action-tint)", borderColor: "var(--action-ring)" }}>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{CHU_BUOC_ZALO}</span>
        </div>
        {loi && (
          <span className="chu-loi" role="alert">
            {loi}
          </span>
        )}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangXin} onClick={onDongY}>
          {dangXin ? "Đang xử lý…" : "Đồng ý, tiếp tục"}
        </button>
        {daTuChoi && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onMoCaiDat}>
            Mở cài đặt quyền
          </button>
        )}
        <button type="button" className="hh-btn hh-btn--text hh-btn--block" disabled={dangXin} onClick={onDeSau}>
          Để sau
        </button>
        <span className="chu-phu" style={{ textAlign: "center" }}>
          {ghiChuDeSau}
        </span>
      </div>
    </div>
  </div>
);

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// Cần hỏi không (YC1.5.1-NT1, NT2): chỉ khi hồ sơ chưa có số
export async function canXinSo(): Promise<boolean> {
  let h: HoSo | null = boNhoHoSo.lay();
  if (!h || !h.so_dien_thoai) {
    h = await getToi();
    boNhoHoSo.ghi(h);
  }
  return !h.so_dien_thoai;
}

export type KetQuaDongY = { loai: "tiep" } | { loai: "o_lai" } | { loai: "loi"; chu: string; giu?: Extract<KetQuaXinSo, { kq: "co" }> };

// Bước bấm "Đồng ý, tiếp tục" (YC1.5.2 bước 1, 2). giu: kết quả Zalo đã có từ lần trước, gửi lại cùng khóa khi mất mạng
// để không xin Zalo lần hai và token một lần không bị dùng hai lần (api/phien-ho-so.md Chống bấm hai lần).
export async function dongYXinSo(giu: Extract<KetQuaXinSo, { kq: "co" }> | null, khoa: string): Promise<KetQuaDongY> {
  const kq = giu ?? (await zalo.xinTenVaSo());
  if (kq.kq === "tu_choi") {
    // Không báo lỗi, về màn cũ (HV4 bước 2). Lần bấm sau popup có thêm nút mở cài đặt quyền.
    boNhoHoSo.ghiTuChoi(true);
    return { loai: "o_lai" };
  }
  if (kq.kq === "loi") return { loai: "loi", chu: CHU_LOI_ZALO };
  const than = {
    ...(kq.token_sdt ? { token_sdt: kq.token_sdt } : {}),
    ...(kq.ho_ten ? { ho_ten: kq.ho_ten } : {}),
    ...(kq.anh_zalo ? { anh_zalo: kq.anh_zalo } : {}),
  };
  try {
    const h = await postToiThongTinZalo(than, khoa, kq.access_token);
    boNhoHoSo.ghi(h);
    boNhoHoSo.ghiTuChoi(kq.token_sdt === null);
    return { loai: "tiep" };
  } catch (e) {
    // Token đã dùng hoặc quá 2 phút: làm tiếp việc gốc như "Để sau" (server.md 1.5)
    if (e instanceof LoiApi && e.loi === "TOKEN_SDT_HET_HAN") return { loai: "tiep" };
    if (e instanceof LoiMang) return { loai: "loi", chu: CHU_LOI_MANG, giu: kq };
    return { loai: "loi", chu: CHU_LOI_CHUNG, giu: kq };
  }
}

type DangMo = { viecGoc: () => void | Promise<void>; daTuChoi: boolean };

// Điều khiển luồng popup, tách khỏi React để test được. capNhat được gọi mỗi khi trạng thái đổi.
export class DieuKhienXinSo {
  mo: DangMo | null = null;
  dangXin = false;
  loi: string | null = null;
  private giu: Extract<KetQuaXinSo, { kq: "co" }> | null = null;
  private khoa = khoaMoi();
  private dangChay = false;

  constructor(private capNhat: () => void = () => {}) {}

  private dong() {
    this.mo = null;
    this.loi = null;
    this.giu = null;
    this.khoa = khoaMoi();
    this.capNhat();
  }

  // Chạy việc gốc ngay nếu hồ sơ đã có số (YC1.5.1-NT2), không thì hiện popup (NT1)
  async chay(viecGoc: () => void | Promise<void>) {
    if (this.dangChay || this.mo) return;
    this.dangChay = true;
    try {
      let can = true;
      try {
        can = await canXinSo();
      } catch {
        can = false; // Không đọc được hồ sơ thì không chặn việc gốc; việc gốc tự báo lỗi mạng của nó
      }
      if (!can) return await viecGoc();
      const daTuChoi = boNhoHoSo.daTuChoi() || (await zalo.daTuChoiSo());
      this.mo = { viecGoc, daTuChoi };
      this.capNhat();
    } finally {
      this.dangChay = false;
    }
  }

  // "Đồng ý, tiếp tục": xin Zalo một lần, gửi token cho server, rồi làm việc gốc. Từ chối thì về màn cũ, không chạy việc gốc.
  async dongY() {
    if (!this.mo || this.dangXin) return;
    this.dangXin = true;
    this.loi = null;
    this.capNhat();
    let tiep: (() => void | Promise<void>) | null = null;
    try {
      const kq = await dongYXinSo(this.giu, this.khoa);
      if (kq.loai === "loi") {
        this.giu = kq.giu ?? null;
        this.loi = kq.chu;
      } else {
        if (kq.loai === "tiep") tiep = this.mo.viecGoc;
        this.dong();
      }
    } finally {
      this.dangXin = false;
      this.capNhat();
    }
    if (tiep) await tiep();
  }

  // "Để sau": việc gốc vẫn hoàn tất, không gọi POST /toi/thong-tin-zalo (YC1.5.1-NT3)
  async deSau() {
    if (!this.mo) return;
    const viecGoc = this.mo.viecGoc;
    this.dong();
    await viecGoc();
  }
}

// Dùng ở màn gốc: chay(viecGoc) chạy việc gốc ngay nếu hồ sơ đã có số, không thì hiện popup rồi mới chạy.
export const useXinSo = (nguoiKia: NguoiKia, ghiChuDeSau: string, lyDo?: string) => {
  const [, doi] = useState(0);
  const dk = useRef<DieuKhienXinSo>();
  if (!dk.current) dk.current = new DieuKhienXinSo(() => doi((n) => n + 1));
  const d = dk.current;
  const chay = useCallback((viecGoc: () => void | Promise<void>) => d.chay(viecGoc), [d]);
  const popup = d.mo ? (
    <PopupXinSo
      nguoiKia={nguoiKia}
      ghiChuDeSau={ghiChuDeSau}
      lyDo={lyDo}
      daTuChoi={d.mo.daTuChoi}
      dangXin={d.dangXin}
      loi={d.loi}
      onDongY={() => void d.dongY()}
      onDeSau={() => void d.deSau()}
      onMoCaiDat={() => void zalo.moCaiDatQuyen()}
    />
  ) : null;
  return { chay, popup };
};
