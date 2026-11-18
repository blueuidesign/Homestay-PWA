import React from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import { banThu, DU_LIEU_GIA } from "../services/api";
import { boNhoGia } from "../stores/gia";
import { boNhoHoSo } from "../stores/ho-so";
import { boNhoLich } from "../stores/lich";
import { boNhoLink } from "../stores/link";
import { datVai } from "../stores/vai";
import { DUONG } from "./duong-dan";

// Menu "Bản thử" (QD22): nạp lại dữ liệu mẫu DLM hoặc xóa sạch về người dùng mới. Chỉ hiện khi chạy dữ liệu giả.
// Dữ liệu mẫu hiện chỉ có chủ nhà Chị Hoa. Ở màn sale (vaiSale) không cho nạp, để không bị đổi sang màn chủ nhà.
export const NoiDungBanThu = ({
  vaiSale,
  onNapMau,
  onXoaSach,
  onNapSale,
}: {
  vaiSale?: boolean;
  onNapMau: (coCanThuBa: boolean, coDatPhong?: boolean) => void;
  onXoaSach: () => void;
  // US6: nạp dữ liệu sale. nguoi là máy này; moLink thì mở thẳng link mời của Anh Tuấn (người mới: A1-link; sale đã có tài khoản: A10 hoặc A10-01)
  onNapSale?: (nguoi: "hung" | "lan" | "moi", moLink: boolean) => void;
}) => (
  <div className="khoi" style={{ borderStyle: "dashed" }}>
    <span className="nhan-muc">Bản thử</span>
    <span className="chu-phu">Dữ liệu giả, chỉ nằm trong máy này. Tải lại app là mất.</span>
    {onNapSale && (
      <>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapSale("hung", false)}>
          Nạp sale mẫu: Sale Hùng (4 căn của Chị Hoa, Anh Tuấn)
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapSale("lan", true)}>
          Nạp sale mẫu: Sale Lan, mở link của Anh Tuấn
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapSale("moi", true)}>
          Nạp sale mẫu: người mới, mở link của Anh Tuấn
        </button>
      </>
    )}
    {vaiSale ? null : (
      <>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapMau(false)}>
          Nạp dữ liệu mẫu chủ nhà (Chị Hoa, 2 căn)
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapMau(true)}>
          Nạp Chị Hoa 3 căn (thêm 2501)
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onNapMau(false, true)}>
          Nạp Chị Hoa có đặt phòng (B1 đến B9)
        </button>
        <span className="chu-phu">Dữ liệu mẫu đặt hôm nay là 07/10/2026 (DLM.1).</span>
      </>
    )}
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onXoaSach}>
      Xóa sạch, về người dùng mới
    </button>
  </div>
);

export const BanThu = ({ vaiSale }: { vaiSale?: boolean }) => {
  const dieuHuong = useNavigate();
  if (!DU_LIEU_GIA) return null;
  return (
    <NoiDungBanThu
      vaiSale={vaiSale}
      onNapSale={(nguoi, moLink) => {
        const ma = banThu.napDuLieuSale(nguoi);
        boNhoLich.xoa();
        boNhoGia.xoa();
        boNhoHoSo.xoa();
        boNhoLink.xoa();
        datVai(nguoi === "moi" ? null : "sale");
        if (moLink) {
          boNhoLink.ghiDaXuLy();
          boNhoLink.dat(ma.anh_tuan);
          dieuHuong(DUONG.LINK, { replace: true, animate: false });
        } else dieuHuong(DUONG.LICH_SALE, { replace: true, animate: false });
      }}
      onNapMau={(coCanThuBa, coDatPhong) => {
        banThu.napDuLieuMau(coCanThuBa, coDatPhong);
        boNhoLich.xoa();
        boNhoGia.xoa();
        boNhoHoSo.xoa();
        datVai("chu_nha");
        dieuHuong(DUONG.CAN, { replace: true, animate: false });
      }}
      onXoaSach={() => {
        banThu.xoaSach();
        boNhoLich.xoa();
        boNhoGia.xoa();
        boNhoHoSo.xoa();
        boNhoLink.xoa();
        datVai(null);
        dieuHuong(DUONG.A1, { replace: true, animate: false });
      }}
    />
  );
};
