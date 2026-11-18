import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DUONG } from "../components/duong-dan";
import { Icon, type TenIcon } from "../components/icon";
import { DU_LIEU_GIA, postPhien } from "../services/api";
import type { TaiKhoan } from "../services/kieu";
import { docMaLinkKhiMo } from "../services/zalo";
import { boNhoLink } from "../stores/link";
import { datVai } from "../stores/vai";
import { ghiDongYDieuKhoan } from "../stores/vao-app";

// A1 · Chào mừng (mục "Đăng nhập" (US1)). Hiện được không cần phiên, không xin tên hay số điện thoại (QD2).
export const GIA_TRI: { icon: TenIcon; chu: string }[] = [
  { icon: "lich", chu: "Ghi lịch các phòng nhanh hơn sổ tay" },
  { icon: "nhom-nguoi", chu: "Sale tự xem phòng trống, không cần gọi hỏi" },
  { icon: "dien-thoai", chu: "Gửi ảnh và giá phòng cho khách trong vài giây" },
];

export const NoiDungA1 = ({
  dangVao,
  onBatDau,
  onMo,
}: {
  dangVao: boolean;
  onBatDau: () => void;
  onMo: (duong: string) => void;
}) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "56px 24px 24px", gap: 32 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ font: "var(--text-stat-xl)", color: "var(--ink)" }}>🏠 Lịch phòng Hạ Long</span>
      <span style={{ font: "var(--text-input)", color: "var(--ink-secondary)" }}>
        Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {GIA_TRI.map((g) => (
        <div key={g.chu} style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span
            style={{
              flex: "0 0 auto",
              width: 44,
              height: 44,
              borderRadius: "var(--radius-full)",
              background: "var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-secondary)",
            }}
          >
            <Icon ten={g.icon} />
          </span>
          <span style={{ font: "var(--text-input)", color: "var(--ink-body)" }}>{g.chu}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangVao} onClick={onBatDau}>
        {dangVao ? "Đang vào…" : "Bắt đầu ngay"}
      </button>
      <span style={{ font: "var(--text-caption)", color: "var(--ink-muted)", textAlign: "center" }}>
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <a className="hh-link" onClick={() => onMo(DUONG.DIEU_KHOAN)}>
          Điều khoản
        </a>{" "}
        và{" "}
        <a className="hh-link" onClick={() => onMo(DUONG.CHINH_SACH)}>
          Chính sách quyền riêng tư
        </a>
        .
      </span>
    </div>
  </div>
);

// Chưa có tài khoản thì sang A3 (mục "Đăng nhập" (US1) bước 2); đã có thì vào thẳng màn đầu của vai
export const manSauPhien = (tai_khoan: TaiKhoan | null) =>
  !tai_khoan ? DUONG.A3 : tai_khoan.vai_chon === "sale" ? DUONG.LICH_SALE : DUONG.LICH;

export const A1ChaoMung = () => {
  const dieuHuong = useNavigate();
  const [dangVao, setDangVao] = useState(false);

  // Mở app từ link mời (zalo.me/s/<id>/?ma=...) thì sang luồng link, không hiện A1 thường (mục "Mở app từ link mời của chủ nhà" (US6))
  useEffect(() => {
    if (boNhoLink.daXuLy()) return;
    docMaLinkKhiMo().then((ma) => {
      if (!ma || boNhoLink.daXuLy()) return;
      boNhoLink.ghiDaXuLy();
      boNhoLink.dat(ma);
      dieuHuong(DUONG.LINK, { replace: true, animate: false });
    });
  }, []);

  const batDau = async () => {
    // Bấm "Bắt đầu ngay" là đồng ý điều khoản (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy tắc Điều khoản khi tiếp tục)
    ghiDongYDieuKhoan();
    setDangVao(true);
    try {
      // App thật lấy access token (getAccessToken, không hiện hộp thoại) rồi gọi POST /phien (server.md 1.2)
      const { tai_khoan } = await postPhien();
      datVai(tai_khoan?.vai_chon ?? null);
      dieuHuong(manSauPhien(tai_khoan), { replace: !!tai_khoan });
    } finally {
      setDangVao(false);
    }
  };

  return (
    <Page className="man man--trang" style={{ position: "relative" }}>
      {DU_LIEU_GIA && (
        <button type="button" className="nut-ban-thu" onClick={() => dieuHuong(DUONG.BAN_THU)}>
          Bản thử
        </button>
      )}
      <NoiDungA1 dangVao={dangVao} onBatDau={batDau} onMo={(d) => dieuHuong(d)} />
    </Page>
  );
};
