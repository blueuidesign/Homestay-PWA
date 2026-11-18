import React from "react";
import { ChipMucCong } from "../components/chip-muc-cong";
import {
  CHU_GHI_CHU_CHI_BAN_THAY,
  CHU_NUT_GUI_KHACH,
  CHU_NUT_YEU_CAU,
  chuAnhSo,
  chuChuNha,
  chuDong,
  chuGioNhanTra,
  chuNgayO,
  dongThongTinS3,
  tenCanS3,
} from "../components/muc-cong-hien-thi";
import { chuTuoi } from "../components/tim-phong-hien-thi";
import type { CanLichSale, ChiTietCanSale } from "../services/kieu";
import { chuNgayNgan } from "../services/ngay";

// S3 · Chi tiết căn (mục "Chi tiết căn và giá bán" (US13)). Phần vẽ, không gọi server. Giá chủ nhà, giá bán do server gửi; căn đã chia sẻ luôn có giá
// (QD20 r2 điểm 3, EN53). Không có tổng (đêm chưa đặt giá) thì không có số nào để hiện.

export type TongGiaS3 = { tong_gia_chu?: number | null; tong_gia_ban?: number | null };

// Bộ ảnh vuốt ngang, góc ghi "1/6". viTri đếm từ 0.
export const BoAnh = ({ anh, viTri, onDoi }: { anh: ChiTietCanSale["anh"]; viTri: number; onDoi: (i: number) => void }) =>
  anh.length === 0 ? (
    <div className="khung-xam" style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-secondary)" }}>
      Chưa có ảnh
    </div>
  ) : (
    <div style={{ position: "relative" }}>
      <div
        data-bo-anh
        style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", borderRadius: "var(--radius-lg)" }}
        onScroll={(e) => {
          const t = e.currentTarget;
          const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
          if (i !== viTri) onDoi(Math.min(anh.length - 1, Math.max(0, i)));
        }}
      >
        {anh.map((a) => (
          <img key={a.thu_tu} src={a.duong_dan} alt="" style={{ flex: "0 0 100%", width: "100%", height: 220, objectFit: "cover", scrollSnapAlign: "start" }} />
        ))}
      </div>
      <span
        data-so-anh
        style={{ position: "absolute", right: 8, bottom: 8, padding: "2px 10px", borderRadius: "var(--radius-full)", background: "rgba(0,0,0,0.6)", color: "#fff", font: "var(--text-micro)" }}
      >
        {chuAnhSo(viTri + 1, anh.length)}
      </span>
    </div>
  );

// Lịch 2 tuần tới: Trống, Kín, không có tên người đặt (PQ4.SALE). Ngày khách hỏi được tô.
export const LichHaiTuan = ({ o, ngayKhachHoi }: { o: CanLichSale["o"]; ngayKhachHoi: string[] }) => (
  <div data-lich-2-tuan style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
    {o.map((x) => {
      const hoi = ngayKhachHoi.includes(x.ngay);
      const kin = x.trang_thai === "kin";
      return (
        <div
          key={x.ngay}
          data-ngay={x.ngay}
          data-trang-thai={x.trang_thai}
          data-dem-khach-hoi={hoi}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
            borderRadius: "var(--radius-sm)",
            border: "1px solid " + (hoi ? "var(--action)" : "var(--border)"),
            background: kin ? "var(--border-subtle)" : hoi ? "var(--action-tint)" : "var(--surface)",
            color: kin ? "var(--ink-secondary)" : "var(--ink-body)",
          }}
        >
          <span style={{ font: "var(--text-body-strong)" }}>{chuNgayNgan(x.ngay)}</span>
          <span style={{ font: "var(--text-micro)" }}>{kin ? "Kín" : "Trống"}</span>
        </div>
      );
    })}
  </div>
);

export const NoiDungS3 = ({
  can,
  ngay,
  muc,
  gia,
  moTuyChon,
  chuNhap,
  viTriAnh,
  lich,
  ngayKhachHoi,
  bayGio,
  loiLuu,
  onDoiAnh,
  onGoi,
  onChonMuc,
  onMoTuyChon,
  onNhap,
  onYeuCau,
  onGuiKhach,
}: {
  can: ChiTietCanSale;
  ngay: { nhan: string; tra: string } | null;
  muc: number;
  gia: TongGiaS3;
  moTuyChon: boolean;
  chuNhap: string;
  viTriAnh: number;
  lich: CanLichSale["o"] | null;
  ngayKhachHoi: string[];
  bayGio?: number;
  loiLuu: string | null;
  onDoiAnh: (i: number) => void;
  onGoi: () => void;
  onChonMuc: (soTien: number) => void;
  onMoTuyChon: () => void;
  onNhap: (chu: string) => void;
  onYeuCau: () => void;
  onGuiKhach: () => void;
}) => (
  <>
    <div className="noi-dung" style={{ paddingBottom: 160 }}>
      <BoAnh anh={can.anh} viTri={viTriAnh} onDoi={onDoiAnh} />
      <div className="khoi">
        <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{tenCanS3(can)}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{dongThongTinS3(can)}</span>
        {can.lich_cap_nhat_luc && (
          <span className="chu-phu" data-do-tuoi>
            ✓ Lịch cập nhật {chuTuoi(can.lich_cap_nhat_luc, bayGio)}
          </span>
        )}
      </div>
      <div className="khoi" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuChuNha(can)}</span>
        {can.chu_nha.so_dien_thoai && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" style={{ minHeight: 44 }} onClick={onGoi}>
            Gọi
          </button>
        )}
      </div>
      {ngay && (
        <div className="khoi" data-khoi-gia>
          <span style={{ font: "var(--text-input)", color: "var(--ink)" }}>{chuNgayO(ngay.nhan, ngay.tra)}</span>
          {typeof can.tong_gia_chu === "number" && (
            <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }} data-gia-chu>
              Giá chủ nhà {chuDong(can.tong_gia_chu)}
            </span>
          )}
        </div>
      )}
      <div className="khoi">
        <span className="nhan-muc">CỘNG THÊM CHO BẠN</span>
        <ChipMucCong soTien={muc} moTuyChon={moTuyChon} chuNhap={chuNhap} onChon={onChonMuc} onMoTuyChon={onMoTuyChon} onNhap={onNhap} />
        {typeof gia.tong_gia_ban === "number" && (
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-body)", color: "var(--ink)" }} data-gia-ban>
            <span>Giá bán cho khách</span>
            <span style={{ fontWeight: 700 }}>{chuDong(gia.tong_gia_ban)}</span>
          </div>
        )}
        {loiLuu && (
          <span role="alert" className="chu-phu" style={{ color: "var(--danger)" }}>
            {loiLuu}
          </span>
        )}
        <span className="chu-phu">{CHU_GHI_CHU_CHI_BAN_THAY}</span>
      </div>
      {lich && (
        <div className="khoi">
          <span className="nhan-muc">LỊCH 2 TUẦN TỚI</span>
          <LichHaiTuan o={lich} ngayKhachHoi={ngayKhachHoi} />
        </div>
      )}
      <div className="khoi">
        <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{chuGioNhanTra(can)}</span>
      </div>
    </div>
    <div className="thanh-duoi">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onYeuCau}>
          {CHU_NUT_YEU_CAU}
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onGuiKhach}>
          {CHU_NUT_GUI_KHACH}
        </button>
      </div>
    </div>
  </>
);
