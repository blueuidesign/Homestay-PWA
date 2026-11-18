import React from "react";
import {
  CHU_GHI_CHU_TU_NHAP,
  CHU_GUI_KHACH,
  CHU_KHONG_CO_CAN_TRONG,
  CHU_SUA_TIM_KIEM,
  chiaNhomKetQua,
  NHAN_NHOM_TU_NHAP,
  chuDaChon,
  chuDieuKien,
  chuDoTuoi,
  chuGiaCanTim,
  chuGiaiThichKhongTrong,
  chuGoiY,
  chuKhoangNgay,
  chuSoCanTrong,
  dongPhuCanTim,
  tenCanTim,
  type TenToa,
} from "../components/tim-phong-hien-thi";
import type { CanLichSale, CanTim, DieuKienTim, GoiYTim, KetQuaTim, LichTuanTim } from "../services/kieu";
import { chuThu } from "../services/ngay";
import { chuO, dongPhuCan, lopO, tenCanTrenLuoi } from "./s1-man";

// S2 · Kết quả, danh sách (YC5.3 bước 1 đến 4, 6). S2-00 · Không có căn trống (YC5.2 bước 6). S4 · Kết quả, lịch tuần (YC5.3 bước 5).
// Phần vẽ, không gọi server. Giá và quyền do server quyết: chỗ nào server không gửi giá thì thẻ không có số.

export const NhanDemKhachHoi = "Đêm khách hỏi";

// Đầu kết quả: điều kiện, "Sửa", số căn trống, hai chế độ (dùng chung S2 và S4)
export const DauKetQua = ({
  dk,
  tenToa,
  soCanTrong,
  che,
  onChe,
  onSua,
  coSapXep = true,
}: {
  dk: DieuKienTim;
  tenToa: TenToa;
  soCanTrong: number;
  che: "ds" | "tuan";
  onChe: (c: "ds" | "tuan") => void;
  onSua: () => void;
  coSapXep?: boolean;
}) => (
  <>
    <div className="kq-dk">
      <span className="kq-dk__chu">{che === "tuan" ? chuKhoangNgay(dk) : chuDieuKien(dk, tenToa)}</span>
      <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onSua}>
        Sửa
      </button>
    </div>
    <div className="kq-so">
      <span className="kq-so__chu">{chuSoCanTrong(soCanTrong)}</span>
      <div className="kq-che" role="group" aria-label="Chế độ xem">
        <button type="button" className={"hh-chip hh-chip--neutral" + (che === "ds" ? " hh-chip--on" : "")} aria-pressed={che === "ds"} onClick={() => onChe("ds")}>
          Danh sách
        </button>
        <button type="button" className={"hh-chip hh-chip--neutral" + (che === "tuan" ? " hh-chip--on" : "")} aria-pressed={che === "tuan"} onClick={() => onChe("tuan")}>
          Lịch tuần
        </button>
      </div>
      {coSapXep && (
        <span className="s1-sapxep kq-sapxep" aria-label="Sắp xếp">
          Theo tên
        </span>
      )}
    </div>
  </>
);

// Dấu tích chọn căn. Dừng nổi bọt để chạm dấu tích không mở chi tiết căn.
const NutTich = ({ ten, chon, onTich }: { ten: string; chon: boolean; onTich: () => void }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={chon}
    aria-label={`Chọn ${ten}`}
    className={"kq-tich" + (chon ? " kq-tich--on" : "")}
    onClick={(e) => {
      e.stopPropagation();
      onTich();
    }}
  >
    {chon ? "✓" : ""}
  </button>
);

export const TheCanTim = ({
  can,
  chon,
  bayGio,
  onTich,
  onMo,
}: {
  can: CanTim;
  chon: boolean;
  bayGio?: number;
  onTich: () => void;
  onMo: () => void;
}) => {
  const gia = chuGiaCanTim(can);
  const tuoi = chuDoTuoi(can, bayGio);
  return (
    <div className={"kq-the" + (chon ? " kq-the--chon" : "")} data-can={tenCanTim(can)} data-nhom={can.nhom} role="button" tabIndex={0} onClick={onMo}>
      <div className="kq-the__than">
        <span className="kq-the__ten">{tenCanTim(can)}</span>
        <span className="kq-the__phu">{dongPhuCanTim(can)}</span>
        {gia && <span className="kq-the__gia">{gia}</span>}
        {tuoi && <span className={"kq-the__tuoi" + (can.khong_co_lich ? " kq-the__tuoi--hoi" : "")}>{tuoi}</span>}
      </div>
      <NutTich ten={tenCanTim(can)} chon={chon} onTich={onTich} />
    </div>
  );
};

export const ThanhDay = ({ soChon, onGui }: { soChon: number; onGui: () => void }) =>
  soChon > 0 ? (
    <div className="thanh-duoi kq-day">
      <span className="kq-day__chu">{chuDaChon(soChon)}</span>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--pill" onClick={onGui}>
        {CHU_GUI_KHACH}
      </button>
    </div>
  ) : null;

export const NoiDungS2 = ({
  ket,
  dk,
  tenToa,
  chon,
  bayGio,
  onTich,
  onMoCan,
  onChe,
  onSua,
  onGui,
}: {
  ket: KetQuaTim;
  dk: DieuKienTim;
  tenToa: TenToa;
  chon: string[];
  bayGio?: number;
  onTich: (id: string) => void;
  onMoCan: (c: CanTim) => void;
  onChe: (c: "ds" | "tuan") => void;
  onSua: () => void;
  onGui: () => void;
}) => {
  const { cuaToi, nguon, tuNhap } = chiaNhomKetQua(ket.can);
  const the = (c: CanTim) => <TheCanTim key={c.id} can={c} chon={chon.includes(c.id)} bayGio={bayGio} onTich={() => onTich(c.id)} onMo={() => onMoCan(c)} />;
  return (
    <>
      <DauKetQua dk={dk} tenToa={tenToa} soCanTrong={ket.so_can_trong} che="ds" onChe={onChe} onSua={onSua} />
      {cuaToi.length > 0 && (
        <section className="kq-nhom">
          <div className="nhan-muc">Của tôi · {cuaToi.length}</div>
          {cuaToi.map(the)}
        </section>
      )}
      {nguon.length > 0 && (
        <section className="kq-nhom">
          <div className="nhan-muc">Nguồn phòng · {nguon.length}</div>
          {nguon.map(the)}
        </section>
      )}
      {tuNhap.length > 0 && (
        <section className="kq-nhom">
          <div className="nhan-muc">
            {NHAN_NHOM_TU_NHAP} · {tuNhap.length}
          </div>
          {tuNhap.map(the)}
        </section>
      )}
      <ThanhDay soChon={chon.length} onGui={onGui} />
    </>
  );
};

// S2-00 · Không có căn trống
export const NoiDungS200 = ({
  dk,
  tenToa,
  goiY,
  onSua,
  onGoiY,
}: {
  dk: DieuKienTim;
  tenToa: TenToa;
  goiY: GoiYTim[];
  onSua: () => void;
  onGoiY: (g: GoiYTim) => void;
}) => (
  <>
    <div className="kq-dk">
      <span className="kq-dk__chu">{chuDieuKien(dk, tenToa)}</span>
      <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onSua}>
        Sửa
      </button>
    </div>
    <div className="khoi">
      <span className="kq-trong__tieu-de">{CHU_KHONG_CO_CAN_TRONG}</span>
      <span className="chu-phu kq-trong__giai-thich">{chuGiaiThichKhongTrong(dk, tenToa)}</span>
    </div>
    {goiY.length > 0 && (
      <div className="kq-nhom">
        <div className="nhan-muc">Gợi ý</div>
        {goiY.map((g, i) => (
          <button key={i} type="button" className="kq-goi-y" onClick={() => onGoiY(g)}>
            <span className="kq-goi-y__chu">{chuGoiY(g, dk)}</span>
            <span className="kq-goi-y__so">{chuSoCanTrong(g.so_can_trong)}</span>
          </button>
        ))}
      </div>
    )}
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onSua}>
      {CHU_SUA_TIM_KIEM}
    </button>
    <span className="chu-phu">{CHU_GHI_CHU_TU_NHAP}</span>
  </>
);

// S4 · Lịch tuần. Mỗi hàng là một căn; chạm hàng để chọn, bỏ chọn (S4 mục Hành động).
export const NoiDungS4 = ({
  lich,
  dk,
  tenToa,
  chon,
  onTich,
  onChe,
  onSua,
  onGui,
}: {
  lich: LichTuanTim;
  dk: DieuKienTim;
  tenToa: TenToa;
  chon: string[];
  onTich: (id: string) => void;
  onChe: (c: "ds" | "tuan") => void;
  onSua: () => void;
  onGui: () => void;
}) => (
  <>
    <DauKetQua dk={dk} tenToa={tenToa} soCanTrong={lich.so_can_trong} che="tuan" onChe={onChe} onSua={onSua} coSapXep={false} />
    <div className="s1-bang">
      <div className="s1-hang s1-hang--dau">
        <div className="s1-hang__can">Căn</div>
        {lich.ngay.map((n) => {
          const dem = lich.dem_khach_hoi.includes(n);
          return (
            <div key={n} className={"s1-ngay" + (dem ? " s1-ngay--dem" : "")} data-dem-khach-hoi={dem}>
              <span>{chuThu(n)}</span>
              <span>{n.slice(8, 10)}</span>
            </div>
          );
        })}
      </div>
      {lich.can.map((c: CanLichSale) => (
        <div key={c.id} className="s1-hang" data-can={tenCanTrenLuoi(c)} role="button" tabIndex={0} aria-pressed={chon.includes(c.id)} onClick={() => onTich(c.id)}>
          <div className="s1-hang__can">
            <span className="s1-hang__ten">
              {chon.includes(c.id) ? "✓ " : ""}
              {tenCanTrenLuoi(c)}
            </span>
            <span className="s1-hang__phu">{dongPhuCan(c)}</span>
          </div>
          {c.o.map((o) => (
            <div
              key={o.ngay}
              className={lopO(o, "") + (lich.dem_khach_hoi.includes(o.ngay) ? " s1-o--dem" : "")}
              data-trang-thai={o.trang_thai}
            >
              {chuO(o)}
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="s1-chu-thich">
      <span>
        <i className="s1-mau s1-mau--dem" />
        {NhanDemKhachHoi}
      </span>
      <span>
        <i className="s1-mau s1-mau--kin" />
        Kín
      </span>
      <span>
        <i className="s1-mau s1-mau--hoi">?</i>
        Căn tự nhập: gọi chủ hỏi
      </span>
      <span>Số là giá đêm của bạn</span>
    </div>
    <ThanhDay soChon={chon.length} onGui={onGui} />
  </>
);
