import React, { useState } from "react";
import { CAC_CACH_XEP, CHU_GHI_CHU_XEP, chuCachXep, dongPhuLuoi } from "../components/can-sale-hien-thi";
import { chuGiaNgan } from "../components/gia-hien-thi";
import { Icon } from "../components/icon";
import type { CanLichSale, LichSale, OLichSale, SapXepLich } from "../services/kieu";
import { chuNgayNgan, chuThu } from "../services/ngay";

// S1 · Lịch phòng 7 ngày của sale (YC5.1 bước 1 đến 5). Phần vẽ, không gọi server.
// Nút "Xoay ngang" / "Xoay dọc" (S1-05, YC5.1 bước 7): xoay giả, phần khung quay ở components/xoay-ngang.tsx.
// US16: nhóm "Căn của tôi" ở đầu, căn tự nhập ghi "?" và "Bạn" (YC5.1-NT3), sắp xếp S1-04 (YC5.1 bước 6).
// Chạm một căn mở chi tiết (onMoCan): căn của chủ nhà mở S3, căn của tôi mở S6-07, căn tự nhập mở S6-03. Không có onMoCan thì báo bằng toast.

export const tenCanTrenLuoi = (c: Pick<CanLichSale, "toa_nha" | "ma_can">) => [c.toa_nha?.ten, c.ma_can].filter(Boolean).join(" ");
export const dongPhuCan = (c: CanLichSale) => dongPhuLuoi(c);

export const chuKhoangTuan = (l: Pick<LichSale, "tu" | "ngay">, hom: string) =>
  `${l.tu === hom ? "7 ngày tới" : "7 ngày"} · ${chuNgayNgan(l.ngay[0])} → ${chuNgayNgan(l.ngay[l.ngay.length - 1])}`;

export const TEN_NHOM: Record<string, string> = { cua_toi: "Căn của tôi", nguon_phong: "Nguồn phòng", tu_nhap: "Căn tự nhập" };

// Chữ trong một ô ngày. Kín theo QT2.1; có giá thì viết ngắn; "?" chỉ cho căn tự nhập (US16), không bao giờ ghi "trống" cho căn tự nhập.
// Chủ nhà tắt giá: server không gửi giá nên ô trống chỉ ghi "Trống" [MỞ: YC5-H3, TK23 chưa vẽ ô không giá; chữ này là tạm].
export const chuO = (o: OLichSale): string => {
  if (o.trang_thai === "kin") return "Kín";
  if (o.trang_thai === "chua_biet") return "?";
  if (o.trang_thai === "cua_ban") return "Bạn";
  if (!("gia_ban" in o)) return "Trống";
  return o.gia_ban === null || o.gia_ban === undefined ? "—" : chuGiaNgan(o.gia_ban);
};

export const lopO = (o: OLichSale, homNayChuoi: string) =>
  "s1-o" +
  (o.trang_thai === "kin" ? " s1-o--kin" : o.trang_thai === "chua_biet" ? " s1-o--hoi" : o.trang_thai === "cua_ban" ? " s1-o--ban" : "") +
  (o.ngay === homNayChuoi && o.trang_thai === "trong" ? " s1-o--nay" : "");

// S1-04 · Sắp xếp (YC5.1 bước 6): chọn "Theo tên", "Giá tăng dần" hoặc "Bán nhiều nhất". Căn của tôi luôn hiện đầu danh sách.
export const HopSapXep = ({ sapXep, onChon, onDong }: { sapXep: SapXepLich; onChon: (ma: SapXepLich) => void; onDong: () => void }) => (
  <div className="hh-scrim" role="dialog" aria-modal="true" aria-label="Sắp xếp" data-man="S1-04" onClick={onDong}>
    <div className="hh-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="hh-sheet__body" style={{ paddingTop: 16 }}>
        <h2 className="hh-sheet__title">Sắp xếp</h2>
        {CAC_CACH_XEP.map((c) => (
          <button
            key={c.ma}
            type="button"
            className={"hh-btn hh-btn--block " + (c.ma === sapXep ? "hh-btn--primary" : "hh-btn--secondary")}
            aria-pressed={c.ma === sapXep}
            onClick={() => onChon(c.ma)}
          >
            {c.chu}
          </button>
        ))}
        <span className="chu-phu">{CHU_GHI_CHU_XEP}</span>
      </div>
    </div>
  </div>
);

export const NoiDungS1 = ({
  lich,
  hom,
  onDoiTuan,
  onChuaLam,
  xoay = false,
  onXoay,
  onTim,
  sapXep = "ten",
  onSapXep,
  onMoCan,
}: {
  lich: LichSale;
  hom: string;
  onDoiTuan: (huong: -1 | 1) => void;
  onChuaLam: (chu: string) => void;
  xoay?: boolean;
  onXoay?: () => void;
  onTim?: () => void;
  sapXep?: SapXepLich;
  onSapXep?: (ma: SapXepLich) => void;
  onMoCan?: (c: CanLichSale) => void;
}) => {
  const [moXep, setMoXep] = useState(false);
  const nhom = (["cua_toi", "nguon_phong", "tu_nhap"] as const).filter((n) => lich.so_can[n] > 0);
  return (
    <>
      {xoay && <div className="s1-ngang__ten">Lịch phòng</div>}
      <div className="s1-tim" role="button" tabIndex={0} onClick={() => (onTim ? onTim() : onChuaLam("Tìm phòng trống làm ở US12"))}>
        <span className="s1-tim__chu">Tìm phòng trống theo ngày</span>
      </div>
      <div className="s1-thanh">
        <div className="s1-thanh__tuan">
          <button type="button" className="hh-iconbtn" aria-label="7 ngày trước" onClick={() => onDoiTuan(-1)}>
            <Icon ten="mui-trai" co={16} />
          </button>
          <span className="s1-thanh__ten">{chuKhoangTuan(lich, hom)}</span>
          <button type="button" className="hh-iconbtn" aria-label="7 ngày sau" onClick={() => onDoiTuan(1)}>
            <Icon ten="mui-phai" co={16} />
          </button>
        </div>
        <div className="s1-thanh__nut">
          <button type="button" className="s1-sapxep" aria-haspopup="dialog" onClick={() => (onSapXep ? setMoXep(true) : onChuaLam("Sắp xếp làm ở US16"))}>
            {chuCachXep(sapXep)}
          </button>
          {onXoay && (
            <button type="button" className="s1-sapxep s1-xoay" onClick={onXoay}>
              {xoay ? "Xoay dọc" : "Xoay ngang"}
            </button>
          )}
        </div>
      </div>
      <div className={"s1-bang" + (xoay ? " s1-bang--ngang" : "")}>
        <div className="s1-hang s1-hang--dau">
          <div className="s1-hang__can">Căn</div>
          {lich.ngay.map((n) => (
            <div key={n} className={"s1-ngay" + (n === hom ? " s1-ngay--nay" : "")}>
              <span>{n === hom ? "Nay" : chuThu(n)}</span>
              <span>{n.slice(8, 10)}</span>
            </div>
          ))}
        </div>
        {nhom.map((nh) => (
          <React.Fragment key={nh}>
            <div className="s1-nhom">
              {TEN_NHOM[nh]} · {lich.so_can[nh]}
            </div>
            {lich.can
              .filter((c) => c.nhom === nh)
              .map((c) => (
                <div
                  key={c.id}
                  className="s1-hang"
                  data-can={tenCanTrenLuoi(c)}
                  role="button"
                  tabIndex={0}
                  onClick={() => (onMoCan ? onMoCan(c) : onChuaLam("Chi tiết căn làm ở US13"))}
                >
                  <div className="s1-hang__can">
                    <span className="s1-hang__ten">{tenCanTrenLuoi(c)}</span>
                    <span className="s1-hang__phu">{dongPhuCan(c)}</span>
                  </div>
                  {c.o.map((o) => (
                    <div key={o.ngay} className={lopO(o, hom)} data-trang-thai={o.trang_thai}>
                      {chuO(o)}
                    </div>
                  ))}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="s1-chu-thich">
        <span>
          <i className="s1-mau s1-mau--nay" />
          Hôm nay
        </span>
        <span>
          <i className="s1-mau s1-mau--kin" />
          Kín
        </span>
        <span>
          <i className="s1-mau s1-mau--hoi">?</i>
          Căn tự nhập: gọi chủ hỏi
        </span>
        <span>
          <i className="s1-mau s1-mau--ban" />
          Đặt phòng bạn đã ghi
        </span>
        <span>Số là giá đêm của bạn · chạm căn để xem</span>
      </div>
      {moXep && onSapXep && (
        <HopSapXep
          sapXep={sapXep}
          onChon={(ma) => {
            setMoXep(false);
            if (ma !== sapXep) onSapXep(ma);
          }}
          onDong={() => setMoXep(false)}
        />
      )}
    </>
  );
};
