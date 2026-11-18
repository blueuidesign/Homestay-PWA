import React from "react";
import { chuPhongNgu } from "../components/can-hien-thi";
import type { DatPhongSale, ThongBaoChuSua } from "../services/kieu";
import { chuNgayNgan, chuTien } from "../services/ngay";

// S3-10 · Đặt phòng chủ nhà đã sửa (mục "Sửa booking" (US3) bước 4, 5). Sale xem đặt phòng của mình mà chủ nhà vừa sửa hộ: đổi gì, lúc nào.
// Hai giá của chính sale: giá bán cho khách GIỮ như đã báo khách (mục "Sửa booking" (US3) bước 5, QT3.1), giá chủ nhà là giá mới.
// Canvas S3-10 ghi thẻ vàng "Giá bán tính lại theo mức cộng", trái mục "Sửa booking" (US3) bước 5 [MỞ: DC53]: làm theo YC, bỏ câu đó, chờ Tùng chọn.
// Không có tiền cọc, trạng thái tiền, tên hay số điện thoại khách chủ nhà nhập (QD20 điểm 2, QD11).
// Chưa có lối vào từ dòng thông báo S1-06 và P13 (US30, US17): màn mở bằng state { id } của DUONG.DAT_PHONG_SALE.
// Chữ tạm: "Chủ nhà đã lưu thay đổi khác" khi ngày và giá chủ nhà không đổi.

type ThongBao = ThongBaoChuSua;

// "10:15 hôm nay" hoặc "10:15 ngày 05/10", giờ Việt Nam
export const chuLucSua = (iso: string, hom: string) => {
  const vn = new Date(Date.parse(iso) + 7 * 3600_000).toISOString();
  const ngay = vn.slice(0, 10);
  return `${vn.slice(11, 16)} ${ngay === hom ? "hôm nay" : `ngày ${chuNgayNgan(ngay)}`}`;
};

export const tenCanTrenThe = (bk: Pick<DatPhongSale, "toa_nha" | "ma_can" | "so_phong_ngu">) =>
  [[bk.toa_nha, bk.ma_can].filter(Boolean).join(" "), bk.so_phong_ngu === null ? null : chuPhongNgu(bk.so_phong_ngu)]
    .filter(Boolean)
    .join(" · ");

const dem = (nhan: string, tra: string) => Math.round((Date.parse(tra) - Date.parse(nhan)) / 86_400_000);

const Gach = ({ children }: { children: React.ReactNode }) => <s>{children}</s>;

export const NoiDungS310 = ({
  bk,
  tb,
  hom,
  onGoi,
  onVe,
}: {
  bk: DatPhongSale;
  tb: ThongBao | null;
  hom: string;
  onGoi: () => void;
  onVe: () => void;
}) => {
  const d = tb?.du_lieu;
  const tenChu = bk.chu_nha.ten ?? "Chủ nhà";
  const doiNgay = !!d && (d.ngay_nhan_cu !== d.ngay_nhan || d.ngay_tra_cu !== d.ngay_tra);
  const doiGia = !!d && d.tien_phong_cu !== d.tien_phong;
  const doiCan = !!d?.can_cu;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 24 }}>
        <div className="khoi">
          <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{tenCanTrenThe(bk)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
            {tenChu} · {chuNgayNgan(bk.ngay_nhan)} → {chuNgayNgan(bk.ngay_tra)} ({bk.so_dem} đêm)
          </span>
        </div>
        <div className="khoi">
          <span className="nhan-muc">HAI GIÁ</span>
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-body)", color: "var(--ink)" }}>
            <span>Giá bán cho khách</span>
            <span style={{ fontWeight: 700 }}>{chuTien(bk.gia_ban)}đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-body)", color: "var(--ink)" }}>
            <span>Giá chủ nhà</span>
            <span style={{ fontWeight: 700 }}>{chuTien(bk.tien_phong)}đ</span>
          </div>
        </div>
        {d && tb && (
          <div
            className="khoi"
            role="status"
            style={{ background: "var(--warning-tint)", borderColor: "var(--warning-border)", color: "var(--warning-ink)" }}
          >
            <span style={{ font: "var(--text-body)", fontWeight: 700 }}>
              {d.ten_chu_nha ?? tenChu} đã sửa đặt phòng này lúc {chuLucSua(tb.tao_luc, hom)}
            </span>
            {doiCan && (
              <span style={{ font: "var(--text-body)" }}>
                Căn: <Gach>{d.can_cu!.ma_can}</Gach> → {d.can.ma_can}
              </span>
            )}
            {doiNgay && (
              <span style={{ font: "var(--text-body)" }}>
                Ngày: <Gach>{chuNgayNgan(d.ngay_nhan_cu)} → {chuNgayNgan(d.ngay_tra_cu)}</Gach> → {chuNgayNgan(d.ngay_nhan)} →{" "}
                {chuNgayNgan(d.ngay_tra)} ({dem(d.ngay_nhan, d.ngay_tra)} đêm)
              </span>
            )}
            {doiGia && (
              <span style={{ font: "var(--text-body)" }}>
                Giá chủ nhà: <Gach>{chuTien(d.tien_phong_cu)}đ</Gach> → {chuTien(d.tien_phong)}đ
              </span>
            )}
            {!doiNgay && !doiGia && !doiCan && <span style={{ font: "var(--text-body)" }}>Chủ nhà đã lưu thay đổi khác.</span>}
            <span style={{ font: "var(--text-body)" }}>
              {doiNgay || doiGia ? "Báo lại khách ngày và giá mới. " : ""}Giá bán cho khách của bạn giữ nguyên.
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bk.chu_nha.so_dien_thoai && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onGoi}>
              Gọi {tenChu}
            </button>
          )}
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVe}>
            Về lịch phòng
          </button>
        </div>
      </div>
    </>
  );
};

