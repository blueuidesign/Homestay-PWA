import React from "react";
import { LoiApi, LoiMang, type MucNgayLe } from "../services/kieu";
import { chuNgayNgan, chuThu, chuTien, congNgay, laCuoiTuan, soCuaNgay } from "../services/ngay";
import { OChon } from "./cn10-man";
import { docTien } from "./cn4-dat-phong";

// Phần vẽ của US8: CN6-02 (giá ngày lễ, dịp đặc biệt), CN6-03 (chọn quá 10 ngày), CN6-03-01 (bỏ trống tên), YC3.5.
// Không gọi server, không dùng zmp-sdk, để test render được. Phần tải và lưu ở cn6-gia-le.tsx.
// Chữ chưa vẽ (ghi ở PR): lỗi chồng ngày (TK23), dòng báo ngày kết thúc trước ngày bắt đầu, dòng báo dịp chưa có dải,
// nhắc nhập tên khi bật "Là ngày lễ" ([MỞ: YC3-H15]), toast sau khi lưu, báo sửa dải đã lưu chưa có cách làm.

export const DIP_TOI_DA_NGAY = 10;
export const NHAN_NHANH = ["Lễ 30/4 – 1/5", "Quốc khánh 2/9", "Tết Dương lịch", "Tết Âm lịch"];
export const CHU_GHI_CHU_NHANH =
  "Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày.";
export const CHU_GHI_CHU_LUOI = "Hiện tròn tuần, từ thứ 2 đến chủ nhật, để thấy dịp lễ có nối với cuối tuần không. Chạm một ô để nới dải ngày.";
export const CHU_CHUA_SUA_DAI = "Chưa có cách sửa dải đã lưu";
export const CHU_CAN_TEN_NGAY_LE = "Nhập tên cho ngày lễ";
export const CHU_NGAY_KET_THUC_TRUOC = "Ngày kết thúc không được trước ngày bắt đầu.";
export const chuChuaCoDai = (nhan: string, nam: number) => `Home247 chưa có dải ngày của ${nhan} năm ${nam}. Chọn ngày bằng tay.`;

// "4 ngày" của dải [tu, den], tính cả hai đầu. Dải chưa đủ ngày hoặc đảo ngược thì 0.
export const demNgayDai = (tu: string, den: string) => {
  if (!tu || !den || den < tu) return 0;
  let n = 1;
  for (let d = tu; d < den; d = congNgay(d, 1)) n++;
  return n;
};
// "T5 30/4": đầu mỗi ô và hai đầu dòng đếm
const chuNgayThu = (ngay: string) => `${chuThu(ngay)} ${soCuaNgay(ngay)}/${Number(ngay.slice(5, 7))}`;
// Dòng đếm ngày (YC3.5 bước 2): "4 ngày · T5 30/4 → CN 3/5"
export const chuDemNgay = (tu: string, den: string) => {
  const n = demNgayDai(tu, den);
  return n === 0 ? "" : `${n} ngày · ${chuNgayThu(tu)} → ${chuNgayThu(den)}`;
};
export const chuQua10Ngay = (n: number) => `Tối đa ${DIP_TOI_DA_NGAY} ngày. Đang chọn ${n} ngày, hãy rút ngắn ngày kết thúc.`;
// Tên server đặt khi ô tên trống (YC3.5 bước 4, CN6-03-01)
export const tenTuDat = (tu: string, den: string) => (tu && den ? `Dịp đặc biệt ${chuNgayNgan(tu)} – ${chuNgayNgan(den)}` : "");
export const chuGiaiThichTen = (tu: string, den: string) =>
  tu && den ? `Bỏ trống thì app đặt tên theo ngày: "${tenTuDat(tu, den)}".` : "Bỏ trống thì app đặt tên theo ngày của dịp.";
export const chuToastDaLuuDip = (ten: string) => `Đã lưu giá ${ten}`;

// Lưới tuần tròn, từ thứ 2 của tuần chứa ngày bắt đầu tới chủ nhật của tuần chứa ngày kết thúc (CN6-02, CN6-03)
export const luoiTuan = (tu: string, den: string): string[] => {
  if (!tu || !den || den < tu) return [];
  let dau = tu;
  while (chuThu(dau) !== "T2") dau = congNgay(dau, -1);
  const o: string[] = [];
  for (let d = dau; ; d = congNgay(d, 1)) {
    o.push(d);
    if (d >= den && chuThu(d) === "CN") break;
  }
  return o;
};

// Chạm một ô để nới dải (YC3.5 bước 3): ô ngoài dải kéo đầu hoặc đuôi tới ô đó; ô trong dải thì giữ nguyên.
// Chưa chọn ngày nào thì ô chạm là cả hai đầu.
export const chamONoiDai = (tu: string, den: string, ngay: string): { tu: string; den: string } => {
  if (!tu || !den || den < tu) return { tu: ngay, den: ngay };
  if (ngay < tu) return { tu: ngay, den };
  if (ngay > den) return { tu, den: ngay };
  return { tu, den };
};

// Chọn nhanh một dịp (YC3.5 bước 2): điền sẵn ngày, tên dịp
export const dienTuNgayLe = (m: MucNgayLe) => ({ tu: m.tu_ngay, den: m.den_ngay, ten: m.ten, ngayLeId: m.id });
export const timNgayLe = (muc: MucNgayLe[] | null, nhan: string) => muc?.find((m) => m.ten === nhan);

// Điều gì đang chặn nút "Lưu giá" (YC3.5-NT2: quá 10 ngày thì không lưu được). null là lưu được.
export const kiemDip = (f: { tu: string; den: string; ten: string; gia: string; laLe: boolean }): string | null => {
  if (!f.tu || !f.den) return "ngay";
  if (f.den < f.tu) return "den_truoc_tu";
  if (demNgayDai(f.tu, f.den) > DIP_TOI_DA_NGAY) return "qua_10";
  if (docTien(f.gia) === null) return "gia";
  if (f.laLe && f.ten.trim() === "") return "ten";
  return null;
};

// Lỗi khi lưu không được: HV2 bước 3, YC3.5-NT2 (server báo DU_LIEU_SAI ở den_ngay), YC3.5 bước 8 (DIP_CHONG_NGAY)
export const loiKhiLuuDip = (e: unknown) => {
  if (e instanceof LoiMang) return "Chưa lưu được, bấm lại khi có mạng";
  if (e instanceof LoiApi) {
    if (e.loi === "DIP_CHONG_NGAY" && e.dai_chong) {
      const d = e.dai_chong;
      return `Trùng ngày với dải đã có: ${d.ten}, ${chuNgayNgan(d.tu_ngay)} – ${chuNgayNgan(d.den_ngay)}. Chọn ngày khác.`;
    }
    if (e.loi === "DU_LIEU_SAI" && e.o === "den_ngay" && e.ly_do) return e.ly_do;
    if (e.loi === "DU_LIEU_SAI" && e.o === "gia_moi_dem") return "Giá mỗi đêm phải từ 1đ đến 1.000.000.000đ. Nhập lại giá.";
    if (e.loi === "DU_LIEU_SAI" && e.o === "ten") return CHU_CAN_TEN_NGAY_LE;
    if (e.loi === "KHONG_TIM_THAY") return "Không tìm thấy căn này. Quay lại danh sách căn rồi thử lại.";
  }
  return "Có lỗi, chưa lưu được. Bấm lại";
};

export type PropsGiaLe = {
  maCan: string;
  ngayLe: MucNgayLe[] | null; // null là đang tải
  tu: string;
  den: string;
  ten: string;
  gia: string;
  laLe: boolean;
  dangLuu: boolean;
  loiChung: string | null;
  chuNhanh: string | null; // dòng báo khi chạm dịp chưa có dải
  matMang: boolean;
  onChonNhanh: (nhan: string) => void;
  onDoiNgay: (o: "tu" | "den", ngay: string) => void;
  onChamO: (ngay: string) => void;
  onDoiTen: (chu: string) => void;
  onDoiGia: (chu: string) => void;
  onDoiLe: () => void;
  onLuu: () => void;
};

// CN6-02, CN6-03, CN6-03-01 · một màn, ba trạng thái (đủ dải, quá 10 ngày, bỏ trống tên)
export const NoiDungGiaLe = (p: PropsGiaLe) => {
  const n = demNgayDai(p.tu, p.den);
  const luoi = luoiTuan(p.tu, p.den);
  const trongDai = (d: string) => p.tu !== "" && d >= p.tu && d <= p.den;
  const gia = docTien(p.gia);
  const kiem = kiemDip(p);
  return (
    <div className="noi-dung" style={{ paddingBottom: 100 }}>
      {p.matMang && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Giá có thể chưa mới nhất.
        </div>
      )}
      <div className="khoi">
        <span style={{ font: "var(--text-title)", color: "var(--ink)" }}>Giá ngày lễ, dịp đặc biệt</span>
        <span className="chu-phu">{`Phòng ${p.maCan}`}</span>
      </div>
      <div className="khoi">
        <span className="nhan-muc">Chọn nhanh ngày lễ</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NHAN_NHANH.map((nhan) => {
            const m = timNgayLe(p.ngayLe, nhan);
            return (
              <button
                key={nhan}
                type="button"
                className="hh-btn hh-btn--secondary"
                style={{ minHeight: 44 }}
                aria-pressed={m !== undefined && m.tu_ngay === p.tu && m.den_ngay === p.den}
                onClick={() => p.onChonNhanh(nhan)}
              >
                {nhan}
              </button>
            );
          })}
        </div>
        {p.chuNhanh && (
          <span className="chu-phu" role="status">
            {p.chuNhanh}
          </span>
        )}
        <span className="chu-phu">{CHU_GHI_CHU_NHANH}</span>
      </div>
      <div className="khoi">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8 }}>
          <label className="hh-field">
            <span className="hh-field__label">Từ ngày</span>
            <input className="hh-input" type="date" name="tu_ngay" style={{ minHeight: 44 }} value={p.tu} onChange={(e) => p.onDoiNgay("tu", e.target.value)} />
          </label>
          <label className="hh-field">
            <span className="hh-field__label">Đến ngày</span>
            <input className="hh-input" type="date" name="den_ngay" style={{ minHeight: 44 }} value={p.den} onChange={(e) => p.onDoiNgay("den", e.target.value)} />
          </label>
        </div>
        {n > 0 && (
          <div style={{ font: "var(--text-body-strong)", color: "var(--ink)" }} role="status">
            {chuDemNgay(p.tu, p.den)}
          </div>
        )}
        {n > DIP_TOI_DA_NGAY && (
          <div className="hh-banner hh-banner--warning" role="alert">
            <span>⚠️ {chuQua10Ngay(n)}</span>
          </div>
        )}
        {p.tu !== "" && p.den !== "" && p.den < p.tu && (
          <span className="chu-loi" role="alert">
            {CHU_NGAY_KET_THUC_TRUOC}
          </span>
        )}
        {luoi.length > 0 && (
          <div className="gia-luoi-ngay" data-luoi-tuan="true">
            {luoi.map((d) => (
              <button
                key={d}
                type="button"
                className={"gia-ngay" + (trongDai(d) ? " gia-ngay--dip" : "") + (laCuoiTuan(d) ? " gia-ngay--cuoi-tuan" : "")}
                data-ngay={d}
                data-chon={trongDai(d) ? "true" : undefined}
                aria-pressed={trongDai(d)}
                aria-label={`${chuNgayThu(d)}${trongDai(d) ? ", đã chọn" : ""}`}
                onClick={() => p.onChamO(d)}
              >
                <span className="gia-ngay__gia">{chuThu(d)}</span>
                <span className="gia-ngay__so">{chuNgayNgan(d)}</span>
              </button>
            ))}
          </div>
        )}
        <span className="chu-phu">{CHU_GHI_CHU_LUOI}</span>
      </div>
      <div className="khoi">
        <label className="hh-field">
          <span className="hh-field__label">Tên (không bắt buộc)</span>
          <input
            className="hh-input"
            type="text"
            name="ten"
            maxLength={80}
            placeholder={tenTuDat(p.tu, p.den) || "Dịp đặc biệt dd/mm – dd/mm"}
            value={p.ten}
            onChange={(e) => p.onDoiTen(e.target.value)}
          />
          {p.ten.trim() === "" && <span className="hh-field__hint">{chuGiaiThichTen(p.tu, p.den)}</span>}
        </label>
        <label className="hh-field">
          <span className="hh-field__label">Giá mỗi đêm (đ)</span>
          <input
            className="hh-input"
            type="text"
            inputMode="numeric"
            name="gia_moi_dem"
            placeholder="VD: 1.300.000"
            value={gia === null ? "" : chuTien(gia)}
            onChange={(e) => p.onDoiGia(e.target.value)}
          />
        </label>
        <OChon chon={p.laLe} chu="Là ngày lễ (hiện trong mục Giá ngày lễ)" onDoi={p.onDoiLe} />
        {kiem === "ten" && <span className="chu-loi">{CHU_CAN_TEN_NGAY_LE}</span>}
        {p.loiChung && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {p.loiChung}</span>
          </div>
        )}
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={p.dangLuu || kiem !== null} onClick={p.onLuu}>
          {p.dangLuu ? "Đang lưu…" : "Lưu giá"}
        </button>
      </div>
    </div>
  );
};
