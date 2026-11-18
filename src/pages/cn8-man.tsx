import React from "react";
import { Icon } from "../components/icon";
import type { ThongKeChu, ThongKeTheoNguoiBan } from "../services/kieu";
import { chuThang, chuThangNgan, chuTien, congThang } from "../services/ngay";
import { chuCongSuat, chuPhanTram, chuSoRutGon, congSuat, phanTramSoVoiThangTruoc } from "../services/thong-ke";

// CN8, CN8-00: Thống kê tháng của chủ nhà (mục "Thống kê tháng của chủ nhà" (US18), mục "Doanh thu 6 tháng" (US18), mục "Doanh thu theo người bán" (US18)). Phần vẽ, không gọi server, để test render được.
// Phần tải dữ liệu ở cn8-thong-ke.tsx. Màn này là của chủ nhà, tiền là giá chủ nhà, không có giá bán hay tiền chênh (PQ11.CHU).
// Khối "CHƯA THU TIỀN" (mục "Chưa thu tiền" (US18)) chưa vẽ: còn [MỞ: mục "Chưa thu tiền" (US18) bước 1, DC53 US18-Q1].
// Chữ 13 px ở số trên cột biểu đồ (màn dày thông tin, CL13.4); chữ còn lại 14 px trở lên.

const chuTienDong = (n: number) => `${chuTien(n)}đ`;
const soThang = (thang: string) => Number(thang.slice(5, 7));
const nhanCot = (thang: string) => `T${soThang(thang)}`;

// Tháng chưa có đặt phòng nào (CN8-00, mục "Thống kê tháng của chủ nhà" (US18) bước 6)
export const laThangTrong = (tk: ThongKeChu) => tk.doanh_thu === 0 && tk.dem_co_khach === 0;

// Dòng dưới số doanh thu: "+22.9% so với tháng 9" (US18-NT3). Tháng chưa có đặt phòng ghi "Chưa có đặt phòng", không có dòng phần trăm
// (US18-NT5). Tháng trước bằng 0 thì không có dòng phần trăm [MỞ: CH-079].
export const chuSoSanh = (tk: ThongKeChu): { chu: string; phanTram: number | null } => {
  if (laThangTrong(tk)) return { chu: "Chưa có đặt phòng", phanTram: null };
  const p = phanTramSoVoiThangTruoc(tk.doanh_thu, tk.doanh_thu_thang_truoc);
  if (p === null) return { chu: "", phanTram: null };
  return { chu: `${chuPhanTram(p)} so với tháng ${soThang(congThang(tk.thang, -1))}`, phanTram: p };
};

// Thẻ "ĐÊM CÓ KHÁCH": "13/62" (số đêm có khách chia số căn nhân số đêm của tháng, mục "Thống kê tháng của chủ nhà" (US18) bước 4). Tháng chưa có đặt phòng ghi "0" (CN8-00).
export const chuDemCoKhach = (tk: ThongKeChu) =>
  laThangTrong(tk) ? "0" : `${tk.dem_co_khach}/${tk.so_can_cong_suat * tk.so_dem_trong_thang}`;

export const chuCongSuatThang = (tk: ThongKeChu) => chuCongSuat(congSuat(tk.dem_co_khach, tk.so_can_cong_suat, tk.so_dem_trong_thang));

// Hàng chọn tháng: ‹ [T09] Tháng 10/2026 [T11] › (mục "Thống kê tháng của chủ nhà" (US18) bước 1, 5). Mọi nút cao 44 px.
export const HangChonThang = ({ thang, onDoi }: { thang: string; onDoi: (thang: string) => void }) => {
  const truoc = congThang(thang, -1);
  const sau = congThang(thang, 1);
  return (
    <div className="tk-thang">
      <button type="button" className="tk-thang__mui" aria-label="Tháng trước" data-tk="thang-truoc" onClick={() => onDoi(truoc)}>
        <Icon ten="mui-trai" co={16} />
      </button>
      <button type="button" className="tk-thang__chip" data-tk="chip-truoc" onClick={() => onDoi(truoc)}>
        {chuThangNgan(truoc)}
      </button>
      <span className="tk-thang__ten" data-tk="ten-thang" aria-live="polite">
        {chuThang(thang)}
      </span>
      <button type="button" className="tk-thang__chip" data-tk="chip-sau" onClick={() => onDoi(sau)}>
        {chuThangNgan(sau)}
      </button>
      <button type="button" className="tk-thang__mui" aria-label="Tháng sau" data-tk="thang-sau" onClick={() => onDoi(sau)}>
        <Icon ten="mui-phai" co={16} />
      </button>
    </div>
  );
};

// Khung xám đúng bố cục các thẻ lúc chưa có số (HV1 bước 1)
export const KhungThongKeDangTai = () => (
  <div className="tk-khung" aria-busy="true">
    <div className="khung-xam" style={{ height: 104 }} />
    <div className="tk-luoi">
      <div className="khung-xam" style={{ height: 72 }} />
      <div className="khung-xam" style={{ height: 72 }} />
    </div>
    <div className="tk-luoi">
      <div className="khung-xam" style={{ height: 72 }} />
      <div className="khung-xam" style={{ height: 72 }} />
    </div>
    <div className="khung-xam" style={{ height: 200 }} />
    <div className="khung-xam" style={{ height: 160 }} />
  </div>
);

export const TheDoanhThu = ({ tk }: { tk: ThongKeChu }) => {
  const sanh = chuSoSanh(tk);
  return (
    <div className="khoi" style={{ gap: 4 }} data-tk="doanh-thu">
      <span className="nhan-muc">DOANH THU THÁNG {soThang(tk.thang)}</span>
      <span className="doanh-thu__so">{chuTienDong(tk.doanh_thu)}</span>
      {sanh.chu && (
        <span className="chu-phu" data-tk="so-sanh">
          {sanh.chu}
        </span>
      )}
    </div>
  );
};

// Mỗi căn một thẻ "PHÒNG 1509" (mục "Thống kê tháng của chủ nhà" (US18) bước 3), kể cả căn 0đ
export const TheCan = ({ tk }: { tk: ThongKeChu }) => (
  <div className="tk-luoi" data-tk="theo-can">
    {tk.theo_can.map((c) => (
      <div key={c.can_id} className="khoi tk-the" data-can={c.can_id}>
        <span className="nhan-muc">PHÒNG {c.ma_can}</span>
        <span className="tk-the__so">{chuTienDong(c.doanh_thu)}</span>
      </div>
    ))}
  </div>
);

export const TheKin = ({ tk }: { tk: ThongKeChu }) => (
  <div className="tk-luoi" data-tk="kin">
    <div className="khoi tk-the">
      <span className="nhan-muc">ĐÊM CÓ KHÁCH</span>
      <span className="tk-the__so">{chuDemCoKhach(tk)}</span>
    </div>
    <div className="khoi tk-the">
      <span className="nhan-muc">CÔNG SUẤT</span>
      <span className="tk-the__so">{chuCongSuatThang(tk)}</span>
    </div>
  </div>
);

// "DOANH THU 6 THÁNG": 6 cột, số rút gọn trên đầu, nhãn tháng dưới chân. Cột tháng đang xem đậm, các cột khác nhạt (US18-NT7).
// Cột 0đ không có thanh, không có số (mục "Doanh thu 6 tháng" (US18) trạng thái rỗng).
export const BieuDo6Thang = ({ tk }: { tk: ThongKeChu }) => {
  const cao = Math.max(...tk.chuoi_thang.map((t) => t.doanh_thu), 0);
  return (
    <div className="khoi" data-tk="bieu-do">
      <span className="nhan-muc">DOANH THU {tk.chuoi_thang.length} THÁNG</span>
      <div className="tk-bd">
        {tk.chuoi_thang.map((t) => {
          const dam = t.thang === tk.thang;
          return (
            <div key={t.thang} className="tk-bd__cot" data-cot={t.thang} data-dam={dam ? "1" : "0"} data-so={t.doanh_thu}>
              <span className="tk-bd__so">{chuSoRutGon(t.doanh_thu)}</span>
              <div className="tk-bd__khung">
                {t.doanh_thu > 0 && (
                  <div
                    className={"tk-bd__thanh" + (dam ? " tk-bd__thanh--dam" : "")}
                    style={{ height: `${Math.max(4, Math.round((t.doanh_thu / cao) * 100))}%` }}
                  />
                )}
              </div>
              <span className={"tk-bd__nhan" + (dam ? " tk-bd__nhan--dam" : "")}>{nhanCot(t.thang)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DongNguoiBan = ({ d }: { d: ThongKeTheoNguoiBan }) => (
  <div className="tk-ban__dong" data-nguoi-ban={d.sale_id ?? "khach-le"}>
    <span className="tk-ban__ten">
      <span>{d.ten}</span>
      {d.da_xoa_tai_khoan && <span className="tk-ban__xoa">Đã xoá tài khoản</span>}
    </span>
    <span className="tk-ban__tien">{chuTienDong(d.doanh_thu)}</span>
  </div>
);

// "DOANH THU THEO NGƯỜI BÁN": giá chủ nhà, xếp theo thứ tự server trả (giảm dần, mục "Doanh thu theo người bán" (US18) bước 2). Khách lẻ là dòng như sale (US18-NT10).
export const KhoiNguoiBan = ({ tk }: { tk: ThongKeChu }) => (
  <div className="khoi" style={{ gap: 0 }} data-tk="nguoi-ban">
    <span className="nhan-muc" style={{ paddingBottom: 8 }}>
      DOANH THU THEO NGƯỜI BÁN
    </span>
    {tk.theo_nguoi_ban.length === 0 ? (
      <span className="chu-phu">Chưa có đặt phòng trong tháng.</span>
    ) : (
      tk.theo_nguoi_ban.map((d) => <DongNguoiBan key={d.sale_id ?? "khach-le"} d={d} />)
    )}
  </div>
);

// Phần thân màn khi đã có số: doanh thu, phòng, độ kín, biểu đồ, người bán (CN8, CN8-00)
export const NoiDungThongKe = ({ tk }: { tk: ThongKeChu }) => (
  <>
    <TheDoanhThu tk={tk} />
    <TheCan tk={tk} />
    <TheKin tk={tk} />
    <BieuDo6Thang tk={tk} />
    <KhoiNguoiBan tk={tk} />
  </>
);
