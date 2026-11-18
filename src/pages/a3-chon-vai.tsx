import React, { useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DUONG } from "../components/duong-dan";
import { Icon, type TenIcon } from "../components/icon";
import { postTaiKhoan } from "../services/api";
import type { VaiChon } from "../services/kieu";
import { datVai } from "../stores/vai";
import { layDongYDieuKhoan } from "../stores/vao-app";

// A3 · Chọn vai trò, A3-00 khi chưa chọn (mục "Chọn vai trò" (US1))
const CAC_VAI: { vai: VaiChon; ten: string; mo_ta: string; icon: TenIcon }[] = [
  { vai: "chu_nha", ten: "Tôi là chủ nhà", mo_ta: "Ghi lịch phòng, đặt giá, mời sale xem lịch.", icon: "lich" },
  { vai: "sale", ten: "Tôi là sale", mo_ta: "Tìm phòng trống, gửi ảnh và giá cho khách.", icon: "nhom-nguoi" },
];

export const NoiDungA3 = ({
  vai,
  dangLuu,
  onChon,
  onTiepTuc,
}: {
  vai: VaiChon | null;
  dangLuu: boolean;
  onChon: (v: VaiChon) => void;
  onTiepTuc: () => void;
}) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 16px 24px", gap: 16 }}>
    <span style={{ font: "var(--text-stat-lg)", color: "var(--ink)", padding: "0 4px" }}>Bạn dùng app để làm gì?</span>
    {CAC_VAI.map((v) => (
      <button
        key={v.vai}
        type="button"
        className={"the-vai" + (vai === v.vai ? " the-vai--chon" : "")}
        aria-pressed={vai === v.vai}
        data-vai={v.vai}
        onClick={() => onChon(v.vai)}
      >
        <span className="the-vai__tich">✓</span>
        <span className="the-vai__bieu-tuong">
          <Icon ten={v.icon} co={30} />
        </span>
        <span className="the-vai__ten">{v.ten}</span>
        <span className="the-vai__mo-ta">{v.mo_ta}</span>
      </button>
    ))}
    <button
      type="button"
      className="hh-btn hh-btn--primary hh-btn--block"
      disabled={!vai || dangLuu}
      onClick={onTiepTuc}
    >
      {dangLuu ? "Đang lưu…" : "Tiếp tục"}
    </button>
    {!vai && (
      <span style={{ font: "var(--text-body)", color: "var(--ink-muted)", padding: "0 4px" }}>
        Chọn một mục để tiếp tục
      </span>
    )}
  </div>
);

// Chủ nhà sang A4 (tab Lịch khi chưa có căn), sale sang A5 (US6)
export const manSauChonVai = (vai: VaiChon) => (vai === "chu_nha" ? DUONG.LICH : DUONG.LICH_SALE);

export const A3ChonVai = () => {
  const dieuHuong = useNavigate();
  const [vai, setVai] = useState<VaiChon | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const tiepTuc = async () => {
    if (!vai) return;
    const dongYLuc = layDongYDieuKhoan();
    if (!dongYLuc) return dieuHuong(DUONG.A1, { replace: true });
    setDangLuu(true);
    try {
      await postTaiKhoan({ vai_chon: vai, dong_y_dieu_khoan_luc: dongYLuc });
      datVai(vai);
      dieuHuong(manSauChonVai(vai), { replace: true });
    } catch {
      // Phiên tạm mất (tải lại app): về A1 bấm lại
      dieuHuong(DUONG.A1, { replace: true });
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <NoiDungA3 vai={vai} dangLuu={dangLuu} onChon={setVai} onTiepTuc={tiepTuc} />
    </Page>
  );
};
