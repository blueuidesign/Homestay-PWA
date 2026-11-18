import React from "react";
import {
  CHU_DUNG_LAI_MAU,
  CHU_LUU_P11,
  NHAN_CHAM_DE_CHEN,
  NHAN_KHACH_NHAN,
  NHAN_MAU_TIN,
} from "../components/gui-khach-hien-thi";
import { CAC_O_CHEN, xemTruocMau } from "../services/mau-tin";

// P11 · Mẫu tin gửi khách (mục "Mẫu tin gửi khách" (US14)). Phần vẽ, không gọi server. Bản xem trước dựng ở app từ mẫu đang gõ và ba căn mẫu (mục "Mẫu tin gửi khách" (US14) bước 3).
export type PropsP11 = {
  mau: string;
  tenSale: string | null;
  dangLuu: boolean;
  loi: string | null;
  oNhap: React.Ref<HTMLTextAreaElement>;
  onDoiMau: (mau: string) => void;
  onChenO: (o: string) => void;
  onDungLai: () => void;
  onLuu: () => void;
};

export const NoiDungP11 = ({ mau, tenSale, dangLuu, loi, oNhap, onDoiMau, onChenO, onDungLai, onLuu }: PropsP11) => (
  <>
    <div className="noi-dung" style={{ paddingBottom: 120 }}>
      {loi && (
        <div className="hh-banner hh-banner--danger" role="alert">
          <span>⚠️ {loi}</span>
        </div>
      )}
      <div className="khoi">
        <label className="nhan-muc" htmlFor="p11-mau">
          {NHAN_MAU_TIN}
        </label>
        <textarea id="p11-mau" ref={oNhap} className="p11-o" rows={7} value={mau} onChange={(e) => onDoiMau(e.target.value)} />
        <span className="nhan-muc">{NHAN_CHAM_DE_CHEN}</span>
        <div className="p11-chip" data-chip-chen>
          {CAC_O_CHEN.map((o) => (
            <button key={o} type="button" className="hh-chip hh-chip--neutral" onClick={() => onChenO(o)}>
              {o}
            </button>
          ))}
        </div>
        <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={onDungLai}>
          {CHU_DUNG_LAI_MAU}
        </button>
      </div>
      <div className="khoi" data-xem-truoc>
        <span className="nhan-muc">{NHAN_KHACH_NHAN}</span>
        <div className="s5-khoi__chu">{xemTruocMau(mau, tenSale)}</div>
      </div>
    </div>
    <div className="thanh-duoi">
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLuu} onClick={onLuu}>
        {dangLuu ? "Đang lưu…" : CHU_LUU_P11}
      </button>
    </div>
  </>
);
