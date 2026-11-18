import React from "react";
import { Icon } from "../components/icon";
import type { CanTrenLich, DatPhongTrongNgay, LichNgay, LichThang } from "../services/kieu";
import {
  chuNgay,
  chuNgayNgan,
  chuThang,
  chuThangNgan,
  chuTien,
  congThang,
  luoiThang,
  soCuaNgay,
  THU_TRONG_TUAN,
} from "../services/ngay";

// CN1 · Lịch tháng (mục "Lịch tháng và lọc theo căn" (US2)), CN1-00 khi chưa có đặt phòng, CN3 · Chi tiết một ngày (mục "Chi tiết một ngày" (US2)).
// Phần vẽ, không gọi server, để test render được. Phần tải dữ liệu ở tab-lich.tsx.

// Màu theo căn (nhóm Lịch chủ nhà quy tắc Màu theo căn): căn thứ nhất, hai, ba theo thứ tự tạo lấy ba màu của canvas.
// Tên lớp là tên màu trên canvas (r1509...), không phải mã căn. Từ căn thứ tư lặp lại màu (canvas chưa vẽ).
const MAU = ["r1509", "r3402", "r2501"];
export const mauCuaCan = (thuTu: number) => MAU[thuTu % MAU.length];

// Chip đầu: 2 căn là "Cả 2 phòng" (CN1, US2-NT1), từ 3 căn là "Tất cả" (CN1-02, US2-NT2)
export const chuChipDau = (soCan: number) => (soCan === 2 ? "Cả 2 phòng" : "Tất cả");

type ThangProps = {
  lich: LichThang;
  homNay: string;
  ngayChon: string | null;
  canChon: string | null;
  onChonNgay: (ngay: string) => void;
  onDoiThang: (thang: string) => void;
  onChonCan: (canId: string | null) => void;
};

export const LuoiLichThang = ({ lich, homNay, ngayChon, canChon, onChonNgay, onDoiThang, onChonCan }: ThangProps) => {
  const truoc = congThang(lich.thang, -1);
  const sau = congThang(lich.thang, 1);
  const coKhach = new Map(lich.ngay.map((n) => [n.ngay, new Set(n.can_ids)]));
  const canHien = canChon ? lich.can.filter((c) => c.can_id === canChon) : lich.can;
  return (
    <div className="lich-thang">
      <div className="lich-thang__thanh">
        <button type="button" className="lich-thang__chuyen" aria-label={chuThang(truoc)} onClick={() => onDoiThang(truoc)}>
          <span className="hh-iconbtn">
            <Icon ten="mui-trai" co={16} />
          </span>
          {chuThangNgan(truoc)}
        </button>
        <span className="lich-thang__ten">{chuThang(lich.thang)}</span>
        <button type="button" className="lich-thang__chuyen" aria-label={chuThang(sau)} onClick={() => onDoiThang(sau)}>
          {chuThangNgan(sau)}
          <span className="hh-iconbtn">
            <Icon ten="mui-phai" co={16} />
          </span>
        </button>
      </div>
      {lich.can.length > 1 && (
        <div className="lich-thang__chip">
          <button
            type="button"
            className={"hh-chip hh-chip--neutral" + (canChon === null ? " hh-chip--on" : "")}
            aria-pressed={canChon === null}
            onClick={() => onChonCan(null)}
          >
            {chuChipDau(lich.can.length)}
          </button>
          {lich.can.map((c, i) => (
            <button
              key={c.can_id}
              type="button"
              className={`hh-chip hh-chip--${mauCuaCan(i)}` + (canChon === c.can_id ? " hh-chip--on" : "")}
              aria-pressed={canChon === c.can_id}
              onClick={() => onChonCan(c.can_id)}
            >
              <span className="hh-chip__dot" />
              {c.ma_can}
            </button>
          ))}
        </div>
      )}
      {lich.co_dat_phong_nao && (
        <div className="lich-thang__chu-thich">
          {lich.can.map((c, i) => (
            <span key={c.can_id}>
              <span className="lich-thang__vach" style={{ background: `var(--room-${mauCuaCan(i).slice(1)})` }} />
              {c.ma_can} đã đặt
            </span>
          ))}
        </div>
      )}
      <div className="lich-thang__luoi">
        {THU_TRONG_TUAN.map((t) => (
          <div key={t} className="lich-thang__thu">
            {t}
          </div>
        ))}
        {luoiThang(lich.thang).map((ngay, i) =>
          ngay === null ? (
            <div key={"o" + i} />
          ) : (
            <button
              key={ngay}
              type="button"
              className={
                "hh-cell" + (ngay === homNay ? " hh-cell--today" : "") + (ngay === ngayChon ? " hh-cell--selected" : "")
              }
              aria-label={chuNgay(ngay)}
              aria-pressed={ngay === ngayChon}
              onClick={() => onChonNgay(ngay)}
            >
              <span className="hh-cell__day">{soCuaNgay(ngay)}</span>
              <span className="hh-cell__bars">
                {lich.can.map((c, j) =>
                  canHien.includes(c) ? (
                    <span
                      key={c.can_id}
                      className={"hh-cell__bar " + (coKhach.get(ngay)?.has(c.can_id) ? `hh-bar--${mauCuaCan(j)}` : "hh-bar--empty")}
                    />
                  ) : null,
                )}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
};

// CN1-00 (mục "Lịch tháng và lọc theo căn" (US2) trạng thái rỗng, US2-NT3)
export const ChuaCoDatPhong = ({ onDatPhong }: { onDatPhong: () => void }) => (
  <>
    <div className="khoi">
      <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>Chưa có đặt phòng nào</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)", textWrap: "pretty" } as React.CSSProperties}>
        Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.
      </span>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onDatPhong}>
        <Icon ten="cong" co={16} />
        Đặt phòng
      </button>
    </div>
    <div
      style={{
        background: "var(--warning-tint)",
        border: "1px solid var(--warning-border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        font: "var(--text-body)",
        color: "var(--warning-ink)",
      }}
    >
      💡 Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.
    </div>
  </>
);

// Người đặt trên thẻ có khách (US2-NT7): tên sale, tên khách lẻ chủ nhà nhập, hoặc "Khách lẻ"
export const chuNguoiDat = (dp: DatPhongTrongNgay) => dp.nguoi_dat.ten ?? (dp.nguoi_dat.loai === "sale" ? "Sale" : "Khách lẻ");

// Số tiền trên thẻ: "2.200.000đ · Cọc: 1.000.000đ" khi đã cọc còn thu (US2-NT7, US3-KB10)
export const chuTienDatPhong = (dp: DatPhongTrongNgay) =>
  `${chuTien(dp.tien_phong)}đ` +
  (dp.trang_thai_tien === "da_coc_con_thu" && dp.tien_coc !== null ? ` · Cọc: ${chuTien(dp.tien_coc)}đ` : "");

// CN3 · Chi tiết một ngày (mục "Chi tiết một ngày" (US2)). Tiêu đề hiện ngay khi chạm, khối từng căn hiện khi có kết quả GET /lich/ngay.
// Căn trống có nút "Đặt phòng" mở CN4 với căn và ngày điền sẵn (US3-NT10, QD12); căn có khách hiện người đặt,
// ngày, số đêm, số tiền (US2-NT7).
export const ChiTietNgay = ({
  ngay,
  lich,
  canTheoThuTu,
  loi,
  onThuLai,
  onDatPhong,
  onSua,
}: {
  ngay: string;
  lich: LichNgay | null;
  canTheoThuTu: CanTrenLich[];
  loi: boolean;
  onThuLai: () => void;
  onDatPhong?: (canId: string, ngay: string) => void;
  onSua?: (bookingId: string) => void; // nút "Sửa" trên thẻ có khách mở CN3-02 (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10), US10)
}) => {
  const thuTu = (canId: string) => canTheoThuTu.findIndex((c) => c.can_id === canId);
  return (
    <div className="khoi" style={{ gap: "var(--space-2)" }} aria-live="polite">
      <span className="lich-ngay__ten">{chuNgay(ngay)}</span>
      {lich ? (
        lich.can.map((c) =>
          c.dat_phong ? (
            <div key={c.can_id} className={`hh-room hh-room--${mauCuaCan(Math.max(0, thuTu(c.can_id)))}`}>
              <div className="hh-room__head">
                <span className="hh-room__title">Phòng {c.ma_can}</span>
                {onSua && (
                  <div className="hh-room__actions">
                    <button
                      type="button"
                      className="hh-btn hh-btn--secondary"
                      style={{ minHeight: 44 }}
                      onClick={() => onSua(c.dat_phong!.id)}
                    >
                      Sửa
                    </button>
                  </div>
                )}
              </div>
              <div className="hh-room__rows">
                <div className="hh-room__row">
                  <span className="hh-room__guest">{chuNguoiDat(c.dat_phong)}</span>
                </div>
                <div className="hh-room__row">
                  <span>
                    {chuNgayNgan(c.dat_phong.ngay_nhan)} → {chuNgayNgan(c.dat_phong.ngay_tra)} ({c.dat_phong.so_dem} đêm)
                  </span>
                </div>
                <div className="hh-room__row">
                  <span>{chuTienDatPhong(c.dat_phong)}</span>
                </div>
                {c.dat_phong.ghi_chu && (
                  <div className="hh-room__row">
                    <span className="hh-room__note">{c.dat_phong.ghi_chu}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={c.can_id} className="hh-room">
              <div className="hh-room__head">
                <span className="hh-room__title">
                  Phòng {c.ma_can} <span className="hh-room__free">· Trống ✓</span>
                </span>
                {onDatPhong && (
                  <div className="hh-room__actions">
                    <button
                      type="button"
                      className="hh-btn hh-btn--secondary"
                      style={{ minHeight: 44 }}
                      onClick={() => onDatPhong(c.can_id, ngay)}
                    >
                      Đặt phòng
                    </button>
                  </div>
                )}
              </div>
            </div>
          ),
        )
      ) : loi ? (
        <>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
            Chưa tải được. Kiểm tra mạng rồi bấm Thử lại
          </span>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThuLai}>
            Thử lại
          </button>
        </>
      ) : (
        canTheoThuTu.map((c) => <div key={c.can_id} className="khung-xam" style={{ height: 58 }} />)
      )}
    </div>
  );
};

// Tải lần đầu (HV1 bước 1): khung xám đúng bố cục lịch tháng
export const KhungLichDangTai = () => (
  <div className="lich-thang" aria-busy="true">
    <div className="khung-xam" style={{ height: 44 }} />
    <div className="khung-xam" style={{ height: 44, width: "70%" }} />
    <div className="khung-xam" style={{ height: 320 }} />
  </div>
);

// Chưa có dữ liệu mà gọi server không được (HV2 bước 2, bước 5)
export const ChuaTaiDuoc = ({ matMang, onThuLai }: { matMang: boolean; onThuLai: () => void }) => (
  <div className="khoi" style={{ margin: 12, padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
    <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
      {matMang ? "Chưa tải được. Kiểm tra mạng rồi bấm Thử lại" : "Có lỗi, chưa làm được. Bấm Thử lại"}
    </span>
    <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onThuLai}>
      Thử lại
    </button>
  </div>
);
