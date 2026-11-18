import React from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import type { VaiChon } from "../services/kieu";
import { layVai } from "../stores/vai";
import { DUONG } from "./duong-dan";
import { Icon, type TenIcon } from "./icon";

// Thanh tab của chủ nhà, 5 tab như canvas (A4, CN5)
export const CAC_TAB: { ten: string; icon: TenIcon; duong: string }[] = [
  { ten: "Lịch", icon: "lich", duong: DUONG.LICH },
  { ten: "Căn", icon: "can", duong: DUONG.CAN },
  { ten: "Sale", icon: "nhom-nguoi", duong: DUONG.SALE },
  { ten: "Thống kê", icon: "thong-ke", duong: DUONG.THONG_KE },
  { ten: "Cá nhân", icon: "ca-nhan", duong: DUONG.CA_NHAN },
];

// Thanh tab của sale: Lịch, Căn, Thống kê, Cá nhân. Không có "Sale" (TK2) và không có "Tìm phòng" (YC1.4-NT2)
export const CAC_TAB_SALE: { ten: string; icon: TenIcon; duong: string }[] = [
  { ten: "Lịch", icon: "lich", duong: DUONG.LICH_SALE },
  { ten: "Căn", icon: "can", duong: DUONG.CAN_SALE },
  { ten: "Thống kê", icon: "thong-ke", duong: DUONG.THONG_KE },
  { ten: "Cá nhân", icon: "ca-nhan", duong: DUONG.CA_NHAN },
];

export const NoiDungThanhTab = ({
  dangO,
  onChon,
  vai,
}: {
  dangO: string;
  onChon: (duong: string) => void;
  vai?: VaiChon | null;
}) => (
  <nav className="hh-tabbar hh-tabbar--fixed">
    {(vai === "sale" ? CAC_TAB_SALE : CAC_TAB).map((t) => (
      <button
        key={t.duong}
        type="button"
        className={"hh-tab" + (t.duong === dangO ? " hh-tab--on" : "")}
        aria-current={t.duong === dangO ? "page" : undefined}
        onClick={() => t.duong !== dangO && onChon(t.duong)}
      >
        <Icon ten={t.icon} />
        {t.ten}
      </button>
    ))}
  </nav>
);

export const ThanhTab = ({ dangO }: { dangO: string }) => {
  const dieuHuong = useNavigate();
  return <NoiDungThanhTab dangO={dangO} vai={layVai()} onChon={(d) => dieuHuong(d, { animate: false, replace: true })} />;
};
