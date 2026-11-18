import React from "react";
import { chuPhongNgu } from "../components/can-hien-thi";
import { chuGiaNgan } from "../components/gia-hien-thi";
import { Icon } from "../components/icon";
import type { CanLichTuan, DatPhongLichTuan, LichTuan, OLichTuan, TrangThaiTien } from "../services/kieu";
import { chuNgayNgan, chuThanhTuan, chuThu } from "../services/ngay";
import { chuTenNguoiDat } from "./cn1-tom-tat";

// CN2 · Lịch tuần nhiều căn (YC2.5), CN2-00 khi tuần chưa có đặt phòng. Phần vẽ, không gọi server. Phần tải ở cn2-man.tsx.
// Giá trên bảng là giá chủ nhà (màn của chủ nhà). Chữ tạm (canvas chưa vẽ, ghi trong PR):
// ba ô tóm tắt "Đêm có khách", "Đêm trống" (canvas ghi "Có khách hôm nay 1/6", "Trống tối T7 3 căn", [MỞ: YC2-H5]),
// ô chưa đặt giá ghi "—" [MỞ: DC53 YC2.5 ô chưa đặt giá].

// Chip lọc: "" là Tất cả, "toa:<id>" là một tòa, "pn:<số>" là số phòng ngủ
export type LocTuan = string;
export const locTuanRaThamSo = (loc: LocTuan): { toa_nha_id?: string; so_phong_ngu?: number } => {
  if (loc.startsWith("toa:")) return { toa_nha_id: loc.slice(4) };
  if (loc.startsWith("pn:")) return { so_phong_ngu: Number(loc.slice(3)) };
  return {};
};

export const chuChipPhongNgu = (n: number) => (n === 0 ? "Studio" : `${n} phòng ngủ`);

// Chip theo các căn của chủ nhà: Tất cả, mỗi tòa một chip, mỗi số phòng ngủ một chip (chỉ khi có từ 2 số khác nhau)
export const cacChipLoc = (can: CanLichTuan[]): { loc: LocTuan; chu: string }[] => {
  const chip = [{ loc: "", chu: "Tất cả" }];
  const toa = new Map<string, string>();
  for (const c of can) if (c.toa_nha) toa.set(c.toa_nha.id, c.toa_nha.ten);
  for (const [id, ten] of toa) chip.push({ loc: `toa:${id}`, chu: ten });
  const pn = [...new Set(can.map((c) => c.so_phong_ngu))].sort((a, b) => a - b);
  if (pn.length > 1) for (const n of pn) chip.push({ loc: `pn:${n}`, chu: chuChipPhongNgu(n) });
  return chip;
};

// Nhãn tiền trên thanh đặt phòng: "Đã cọc / đã thanh toán" cùng màu, "Chưa cọc" màu cảnh báo
export const chuNhanTienThanh = (t: TrangThaiTien) => (t === "chua_coc" ? "Chưa cọc" : t === "da_thanh_toan" ? "Đã thanh toán" : "Đã cọc");

export const dongPhuCanTuan = (c: Pick<CanLichTuan, "so_phong_ngu" | "toa_nha">) =>
  [chuPhongNgu(c.so_phong_ngu), c.toa_nha?.ten].filter(Boolean).join(" · ");

// Ô trống: giá đêm rút gọn (YC2 quy tắc Giá rút gọn); chưa đặt giá thì "—"
export const chuOTrong = (o: OLichTuan) => (o.gia_dem === null ? "—" : chuGiaNgan(o.gia_dem));

type Doan = { tu: number; so: number; bookingId: string | null };
// Gộp các ô liền nhau cùng một đặt phòng thành một thanh nối nhiều ngày
export const gopDoan = (o: OLichTuan[]): Doan[] => {
  const kq: Doan[] = [];
  o.forEach((x, i) => {
    const cuoi = kq[kq.length - 1];
    if (x.booking_id !== null && cuoi && cuoi.bookingId === x.booking_id) cuoi.so++;
    else kq.push({ tu: i, so: 1, bookingId: x.booking_id });
  });
  return kq;
};

const HangCan = ({ can, datPhong, hom }: { can: CanLichTuan; datPhong: Map<string, DatPhongLichTuan>; hom: string }) => (
  <div className="tuan-hang" data-can={can.ma_can}>
    <div className="tuan-can">
      <span className="s1-hang__ten">{can.ma_can}</span>
      <span className="s1-hang__phu">{dongPhuCanTuan(can)}</span>
    </div>
    {gopDoan(can.o).map((d) => {
      const o = can.o[d.tu];
      const dp = d.bookingId ? datPhong.get(d.bookingId) : undefined;
      const vitri = { gridColumn: `${d.tu + 2} / span ${d.so}` };
      if (dp) {
        return (
          <div
            key={d.tu}
            className={"tuan-thanh" + (dp.trang_thai_tien === "chua_coc" ? " tuan-thanh--chua-coc" : "")}
            style={vitri}
            data-ngay={o.ngay}
            data-so-ngay={d.so}
          >
            <span className="tuan-thanh__ten">{chuTenNguoiDat(dp.nguoi_dat)}</span>
            <span className="tuan-thanh__nhan">{chuNhanTienThanh(dp.trang_thai_tien)}</span>
          </div>
        );
      }
      return (
        <div
          key={d.tu}
          className={"tuan-o" + (o.ngay === hom ? " tuan-o--nay" : "") + (o.gia_dem === null ? " tuan-o--chua-gia" : "")}
          style={vitri}
          data-ngay={o.ngay}
        >
          {chuOTrong(o)}
        </div>
      );
    })}
  </div>
);

export const NoiDungCN2 = ({
  lich,
  hom,
  chip,
  loc,
  onDoiTuan,
  onLoc,
  onThemDatPhong,
}: {
  lich: LichTuan;
  hom: string;
  chip: { loc: LocTuan; chu: string }[];
  loc: LocTuan;
  onDoiTuan: (huong: -1 | 1) => void;
  onLoc: (loc: LocTuan) => void;
  onThemDatPhong: () => void;
}) => {
  const datPhong = new Map(lich.dat_phong.map((d) => [d.id, d]));
  const ngay = lich.can[0]?.o.map((o) => o.ngay) ?? [];
  return (
    <>
      <div className="tuan-thanh-tuan">
        <button type="button" className="tuan-nut" onClick={() => onDoiTuan(-1)}>
          <Icon ten="mui-trai" co={16} />
          Trước
        </button>
        <span className="s1-thanh__ten">{chuThanhTuan(lich.tu, lich.den)}</span>
        <button type="button" className="tuan-nut" onClick={() => onDoiTuan(1)}>
          Sau
          <Icon ten="mui-phai" co={16} />
        </button>
      </div>
      {chip.length > 1 && (
        <div className="lich-thang__chip">
          {chip.map((c) => (
            <button
              key={c.loc}
              type="button"
              className={"hh-chip hh-chip--neutral" + (c.loc === loc ? " hh-chip--on" : "")}
              aria-pressed={c.loc === loc}
              onClick={() => onLoc(c.loc)}
            >
              {c.chu}
            </button>
          ))}
        </div>
      )}
      {lich.dat_phong.length === 0 ? (
        // CN2-00: thẻ tóm tắt, không vẽ lưới tuần trống
        <div className="khoi">
          <span className="lich-ngay__ten">
            {chuNgayNgan(lich.tu)} – {chuNgayNgan(lich.den)}
          </span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>Tuần này chưa có đặt phòng nào. Mọi căn đều trống.</span>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onThemDatPhong}>
            <Icon ten="cong" co={16} />
            Thêm đặt phòng
          </button>
        </div>
      ) : (
        <>
          <div className="tuan-tt">
            <div className="tuan-tt__o">
              <span className="tuan-tt__nhan">Đêm có khách</span>
              <span className="tuan-tt__so">{lich.tom_tat.dem_co_khach} đêm</span>
            </div>
            <div className="tuan-tt__o">
              <span className="tuan-tt__nhan">Đêm trống</span>
              <span className="tuan-tt__so">{lich.tom_tat.dem_trong} đêm</span>
            </div>
            <div className="tuan-tt__o">
              <span className="tuan-tt__nhan">Chưa cọc</span>
              <span className="tuan-tt__so">{lich.tom_tat.dat_phong_chua_coc} đặt phòng</span>
            </div>
          </div>
          <div className="tuan-bang">
            <div className="tuan-hang tuan-hang--dau">
              <div className="tuan-can">
                <span className="s1-hang__phu">CĂN</span>
              </div>
              {ngay.map((n) => (
                <div key={n} className={"s1-ngay" + (n === hom ? " s1-ngay--nay" : "")}>
                  <span>{chuThu(n)}</span>
                  <span>{n.slice(8, 10)}</span>
                </div>
              ))}
            </div>
            {lich.can.map((c) => (
              <HangCan key={c.can_id} can={c} datPhong={datPhong} hom={hom} />
            ))}
          </div>
          <div className="s1-chu-thich">
            <span>
              <i className="s1-mau s1-mau--ban" />
              Đã cọc / đã thanh toán
            </span>
            <span>
              <i className="s1-mau tuan-mau--chua-coc" />
              Chưa cọc
            </span>
            <span>800k: trống, giá đêm</span>
          </div>
        </>
      )}
    </>
  );
};

// Tải lần đầu (HV1 bước 1): khung xám đúng bố cục
export const KhungLichTuanDangTai = () => (
  <div aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="khung-xam" style={{ height: 44 }} />
    <div className="khung-xam" style={{ height: 64 }} />
    <div className="khung-xam" style={{ height: 240 }} />
  </div>
);

// Lối vào tạm tới CN2 từ tab Lịch [MỞ: DC53 YC2-H4]; không phải lối vào chính thức
export const TheXemLichTuan = ({ onBam }: { onBam: () => void }) => (
  <button
    type="button"
    className="khoi"
    style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", minHeight: 56, textAlign: "left", cursor: "pointer", font: "inherit" }}
    onClick={onBam}
  >
    <span className="o-chu-cai">
      <Icon ten="lich" co={20} />
    </span>
    <span style={{ flex: "1 1 0%", display: "flex", flexDirection: "column" }}>
      <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>Lịch tuần</span>
      <span className="chu-phu">Cả tuần của mọi căn trên một bảng</span>
    </span>
    <Icon ten="mui-phai" co={16} />
  </button>
);
