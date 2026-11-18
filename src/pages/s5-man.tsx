import React from "react";
import {
  CHU_GUI_CHU,
  CHU_HOAC_SAO_CHEP,
  CHU_SAO_CHEP,
  chuGhiChuNhieuAnh,
  chuNutGuiAnh,
  chuNutSaoChepTatCa,
  chuSoAnh,
  chuSoCanVaNgay,
} from "../components/gui-khach-hien-thi";
import { anhGuiDuoc } from "../services/gui-khach";
import type { CanGuiKhach, KetQuaGuiKhachXem } from "../services/kieu";

// S5 · Gửi cho khách (YC5.5 bước 1, 2). Phần vẽ, không gọi server. Chữ do server dựng, màn chỉ hiện (giá bán, không giá chủ).
// Mỗi căn một khối: số thứ tự, tên, số ảnh, chữ, ba nút. Cuối màn: dòng "Hoặc sao chép chữ..." và nút sao chép cả lô.
export type PropsS5 = {
  ket: KetQuaGuiKhachXem;
  dangMo: string | null; // id căn đang mở cửa sổ Zalo: khóa nút của căn đó để không mở hai cửa sổ
  loi: string | null;
  onGuiChu: (c: CanGuiKhach) => void;
  onGuiAnh: (c: CanGuiKhach) => void;
  onSaoChep: (c: CanGuiKhach) => void;
  onSaoChepTatCa: () => void;
};

export const KhoiCanGuiKhach = ({ can, thuTu, dangMo, onGuiChu, onGuiAnh, onSaoChep }: { can: CanGuiKhach; thuTu: number; dangMo: boolean } & Pick<PropsS5, "onGuiChu" | "onGuiAnh" | "onSaoChep">) => {
  const ghiChu = chuGhiChuNhieuAnh(can);
  return (
    <section className="khoi s5-khoi" data-khoi-can={can.ten}>
      <div className="s5-khoi__dau">
        <span className="s5-khoi__so" aria-hidden="true">
          {thuTu}
        </span>
        <span className="s5-khoi__ten">{can.ten}</span>
        <span className="chu-phu">{chuSoAnh(can.so_anh)}</span>
      </div>
      <div className="s5-khoi__chu" data-chu-can>
        {can.chu}
      </div>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangMo} onClick={() => onGuiChu(can)}>
        {CHU_GUI_CHU}
      </button>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangMo || anhGuiDuoc(can).length === 0} onClick={() => onGuiAnh(can)}>
        {chuNutGuiAnh(can)}
      </button>
      {ghiChu && <span className="chu-phu">{ghiChu}</span>}
      <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={() => onSaoChep(can)}>
        {CHU_SAO_CHEP}
      </button>
    </section>
  );
};

export const NoiDungS5 = ({ ket, dangMo, loi, onGuiChu, onGuiAnh, onSaoChep, onSaoChepTatCa }: PropsS5) => (
  <div className="noi-dung">
    <span className="s5-mo-ta">{chuSoCanVaNgay(ket.can.length, ket.ngay_nhan, ket.ngay_tra)}</span>
    {loi && (
      <div className="hh-banner hh-banner--danger" role="alert">
        <span>⚠️ {loi}</span>
      </div>
    )}
    {ket.can.map((c, i) => (
      <KhoiCanGuiKhach key={c.id} can={c} thuTu={i + 1} dangMo={dangMo === c.id} onGuiChu={onGuiChu} onGuiAnh={onGuiAnh} onSaoChep={onSaoChep} />
    ))}
    <div className="khoi">
      <span className="chu-phu">{CHU_HOAC_SAO_CHEP}</span>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onSaoChepTatCa}>
        {chuNutSaoChepTatCa(ket.can.length)}
      </button>
    </div>
  </div>
);
