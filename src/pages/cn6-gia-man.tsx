import React from "react";
import { chuCacThang, chuGiaNgan, chuKhoangThang } from "../components/gia-hien-thi";
import { chuCacThuCuoiTuan, chuCacThuNgayThuong } from "../components/can-hien-thi";
import { Icon } from "../components/icon";
import { LoiApi, LoiMang, type BangGia, type DaiDip, type DemGia } from "../services/kieu";
import { chuNgayNgan, chuTien, congThang, chuThangNgan, luoiThang, soCuaNgay, THU_TRONG_TUAN } from "../services/ngay";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { CHU_CHUA_SUA_DAI } from "./cn6-gia-le-man";
import { docTien } from "./cn4-dat-phong";

// Phần vẽ của CN5-02 · Chi tiết căn, hai tab "Thông tin" (US11) và "Giá" (US4).
// Tab Giá: CN6 (mục "Đặt giá theo tháng" (US4)), CN6-00 căn chưa có giá, CN6-04 toast sau khi áp dụng, CN6-09 chọn năm.
// Không gọi server, không dùng zmp-sdk, để test render được. Phần tải và lưu ở cn6-gia.tsx.
// Giá ngày lễ, dịp đặc biệt (CN6-02, US8): nút và ô ngày mở màn qua onMoGiaLe; sửa dải đã lưu chưa có cách làm (mục "Giá ngày lễ và dịp đặc biệt" (US8) [MỞ]). Sao chép giá (CN6-07, US7): nút mở màn qua onSaoChep.

export const CHU_CHUA_CHON_THANG = "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.";
export const CHU_CAN_CHUA_CO_GIA =
  "Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt.";
export const CHU_CHUA_CO_GIA_LE = 'Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5.';
export const CHU_CHUA_CO_DIP = "Chưa có dịp đặc biệt.";

// Nút áp dụng (mục "Đặt giá theo tháng" (US4) bước 4): có tháng thì ghi rõ tháng nào
export const chuNutApDung = (thangChon: number[]) =>
  thangChon.length === 0 ? "Áp dụng cho tháng đã chọn" : `Áp dụng cho ${chuCacThang(thangChon)}`;
export const chuDangChon = (thangChon: number[]) =>
  `Đang chọn: ${chuCacThang(thangChon)} (${thangChon.length} tháng)`;
// Toast CN6-04, ví dụ "Đã áp dụng giá cho Tháng 11 – 12" (toast tự thêm dấu ✓)
export const chuToastApDung = (thangChon: number[]) => `Đã áp dụng giá cho ${chuCacThang(thangChon)}`;

// Chữ lỗi khi áp dụng không được (HV2 bước 3, US4-NT4, luật kiểm giá của PUT /can/:id/gia-thang)
export const loiKhiApDung = (e: unknown) => {
  if (e instanceof LoiMang) return "Chưa lưu được, bấm lại khi có mạng";
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI") {
    if (e.o === "thang") return CHU_CHUA_CHON_THANG;
    if (e.o === "gia_ngay_thuong" || e.o === "gia_cuoi_tuan") {
      return "Giá mỗi đêm phải từ 1đ đến 1.000.000.000đ. Nhập lại giá.";
    }
  }
  if (e instanceof LoiApi && e.loi === "KHONG_TIM_THAY") return "Không tìm thấy căn này. Quay lại danh sách căn rồi thử lại.";
  return "Có lỗi, chưa lưu được. Bấm lại";
};

const tenDip = (d: DaiDip) => `${chuNgayNgan(d.tu_ngay)} – ${chuNgayNgan(d.den_ngay)}`;

export const DanhSachDip = ({ dai, laNgayLe, onCham }: { dai: DaiDip[]; laNgayLe: boolean; onCham: () => void }) => {
  const ds = dai.filter((d) => d.la_ngay_le === laNgayLe);
  return (
    <div className="khoi" style={{ gap: 4, padding: "12px 16px 4px" }}>
      <span className="nhan-muc">{laNgayLe ? "Giá ngày lễ" : "Dịp đặc biệt"}</span>
      {ds.length === 0 ? (
        <span className="chu-phu" style={{ paddingBottom: 8 }}>
          {laNgayLe ? CHU_CHUA_CO_GIA_LE : CHU_CHUA_CO_DIP}
        </span>
      ) : (
        ds.map((d) => (
          <div key={d.id} className="gia-dong" style={{ cursor: "pointer" }} onClick={onCham}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{tenDip(d)}</span>
              <span className="chu-phu">{d.ten}</span>
            </div>
            <span style={{ font: "var(--text-body-strong)", fontWeight: 700, color: "var(--ink)" }}>{chuTien(d.gia_moi_dem)}đ</span>
          </div>
        ))
      )}
    </div>
  );
};

// Lịch giá một tháng (mục "Đặt giá theo tháng" (US4) bước 6): giá từng đêm, tô dịp đặc biệt, ngày lễ, có khách
export const LichGia = ({
  thang,
  dem,
  dai,
  tieuDe,
  onDoiThang,
  onChamNgay,
}: {
  thang: string;
  dem: DemGia[] | null;
  dai: DaiDip[];
  tieuDe: string;
  onDoiThang: (thang: string) => void;
  onChamNgay: (ngay: string) => void;
}) => {
  const truoc = congThang(thang, -1);
  const sau = congThang(thang, 1);
  const theoNgay = new Map((dem ?? []).map((d) => [d.ngay, d]));
  const laLe = (id: string | null) => dai.find((d) => d.id === id)?.la_ngay_le ?? false;
  return (
    <div className="khoi">
      <div className="lich-thang__thanh">
        <button type="button" className="lich-thang__chuyen" aria-label={`Tháng ${truoc}`} onClick={() => onDoiThang(truoc)}>
          <span className="hh-iconbtn">
            <Icon ten="mui-trai" co={16} />
          </span>
          {chuThangNgan(truoc)}
        </button>
        <span className="lich-thang__ten">{tieuDe}</span>
        <button type="button" className="lich-thang__chuyen" aria-label={`Tháng ${sau}`} onClick={() => onDoiThang(sau)}>
          {chuThangNgan(sau)}
          <span className="hh-iconbtn">
            <Icon ten="mui-phai" co={16} />
          </span>
        </button>
      </div>
      {dem ? (
        <div className="gia-luoi-ngay">
          {THU_TRONG_TUAN.map((t) => (
            <div key={t} className="lich-thang__thu">
              {t}
            </div>
          ))}
          {luoiThang(thang).map((ngay, i) => {
            if (ngay === null) return <div key={"o" + i} />;
            const d = theoNgay.get(ngay);
            const lop =
              "gia-ngay" +
              (d?.loai_dem === "dip" ? (laLe(d.gia_dip_id) ? " gia-ngay--le" : " gia-ngay--dip") : "") +
              (d?.co_khach ? " gia-ngay--khach" : "");
            return (
              <button
                key={ngay}
                type="button"
                className={lop}
                data-ngay={ngay}
                data-loai={d?.loai_dem}
                data-co-khach={d?.co_khach ? "true" : undefined}
                aria-label={`${chuNgayNgan(ngay)}${d?.gia != null ? `, ${chuTien(d.gia)}đ` : ", chưa đặt giá"}${d?.co_khach ? ", có khách" : ""}`}
                onClick={() => onChamNgay(ngay)}
              >
                <span className="gia-ngay__so">{soCuaNgay(ngay)}</span>
                <span className="gia-ngay__gia">{d?.gia != null ? chuGiaNgan(d.gia) : "–"}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="khung-xam" style={{ height: 280 }} aria-busy="true" />
      )}
      <div className="lich-thang__chu-thich" style={{ gap: "4px 14px" }}>
        <span>
          <span style={{ width: 16, height: 12, borderRadius: 4, background: "var(--warning-tint)", border: "1px solid var(--warning-border)" }} />
          Dịp đặc biệt
        </span>
        <span>
          <span style={{ width: 16, height: 12, borderRadius: 4, background: "var(--danger-tint)", border: "1px solid var(--danger-border)" }} />
          Ngày lễ
        </span>
        <span>
          <span style={{ width: 16, height: 12, borderRadius: 4, background: "var(--room-3402-tint)", border: "1px solid var(--room-3402-border)" }} />
          Có khách
        </span>
      </div>
      <span className="chu-phu">💡 Chạm một ngày để đặt giá ngày lễ, dịp đặc biệt.</span>
    </div>
  );
};

// CN6-09 · Chọn năm (mục "Đặt giá theo tháng" (US4) bước 5)
export const BangChonNam = ({
  namNay,
  nam,
  onChon,
  onDong,
}: {
  namNay: number;
  nam: number;
  onChon: (nam: number) => void;
  onDong: () => void;
}) => (
  <>
    <div className="gia-scrim" onClick={onDong} />
    <div className="gia-sheet" role="dialog" aria-label="Đặt giá cho năm">
      <div className="gia-sheet__dau">
        <span style={{ flex: "1 1 0%", font: "var(--text-title)", color: "var(--ink)" }}>Đặt giá cho năm</span>
        <button type="button" className="hh-iconbtn" aria-label="Đóng" onClick={onDong}>
          ✕
        </button>
      </div>
      {[
        { n: namNay, ghi: "Năm nay" },
        { n: namNay + 1, ghi: "Năm sau" },
      ].map(({ n, ghi }) => (
        <button key={n} type="button" className="gia-sheet__hang" aria-pressed={n === nam} onClick={() => onChon(n)}>
          <span style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--text-body)", fontWeight: n === nam ? 700 : 400, color: "var(--ink)" }}>{`Năm ${n}`}</span>
            <span className="chu-phu">{ghi}</span>
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--action)" }}>{n === nam ? "✓" : ""}</span>
        </button>
      ))}
    </div>
  </>
);

// Khối "GIÁ THEO THÁNG" (mục "Đặt giá theo tháng" (US4) bước 1 đến 4): 12 ô tháng, hai ô giá, nút áp dụng. Dùng chung cho CN6 (một căn)
// và CN6-06 (nhiều căn, US7). Ô tháng ghi sẵn chữ giá: một căn thì khoảng giá của căn, nhiều căn thì "Chưa đặt" như canvas.
export type OThangGia = { khoa: string; so: number; gia: string; chua: boolean };
export const FormGiaThang = (p: {
  nam: number;
  oThang: OThangGia[];
  thangChon: number[];
  giaThuong: string;
  giaCuoiTuan: string;
  dangLuu: boolean;
  loiChung: string | null;
  baoChuaChon: boolean;
  onChonThang: (so: number) => void;
  onDoiGia: (o: "thuong" | "cuoi_tuan", chu: string) => void;
  onApDung: () => void;
  onMoNam: () => void;
  // US11 (mục "Ngày tính giá cuối tuần" (US11)): các thứ tính giá cuối tuần của tài khoản, đổi tên hai ô giá. Không truyền thì T6, T7.
  demCuoiTuan?: number[];
}) => {
  const dem = p.demCuoiTuan ?? [5, 6];
  const thuongTien = docTien(p.giaThuong);
  const cuoiTien = docTien(p.giaCuoiTuan);
  const khongBam = p.dangLuu || thuongTien === null || cuoiTien === null;
  return (
    <div className="khoi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="nhan-muc">Giá theo tháng</span>
        <button
          type="button"
          onClick={p.onMoNam}
          style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 44, border: 0, background: "none", cursor: "pointer", font: "var(--text-body-strong)", color: "var(--ink)" }}
        >
          Năm {p.nam}
          <span style={{ display: "inline-flex", transform: "rotate(90deg)" }}>
            <Icon ten="mui-phai" co={16} />
          </span>
        </button>
      </div>
      <div className="gia-luoi-thang">
        {p.oThang.map((t) => {
          const chon = p.thangChon.includes(t.so);
          return (
            <button
              key={t.khoa}
              type="button"
              className={"gia-thang" + (chon ? " gia-thang--chon" : t.chua ? " gia-thang--chua" : "")}
              aria-pressed={chon}
              data-thang={t.khoa}
              onClick={() => p.onChonThang(t.so)}
            >
              <span className="gia-thang__ten">{`Tháng ${t.so}`}</span>
              <span className="gia-thang__gia">{t.gia}</span>
            </button>
          );
        })}
      </div>
      {p.thangChon.length > 0 && (
        <div style={{ font: "var(--text-body-strong)", color: "var(--ink)" }} role="status">
          {chuDangChon(p.thangChon)}
        </div>
      )}
      {p.baoChuaChon && (
        <span className="chu-loi" role="alert">
          {CHU_CHUA_CHON_THANG}
        </span>
      )}
      {p.loiChung && (
        <div className="hh-banner hh-banner--danger" role="alert">
          <span>⚠️ {p.loiChung}</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8 }}>
        <label className="hh-field">
          <span className="hh-field__label">{`Ngày thường (${chuCacThuNgayThuong(dem)})`}</span>
          <input
            className="hh-input"
            type="text"
            inputMode="numeric"
            name="gia_ngay_thuong"
            placeholder="VD: 800.000"
            value={thuongTien === null ? "" : chuTien(thuongTien)}
            onChange={(e) => p.onDoiGia("thuong", e.target.value)}
          />
        </label>
        <label className="hh-field">
          <span className="hh-field__label">{`Cuối tuần (${chuCacThuCuoiTuan(dem)})`}</span>
          <input
            className="hh-input"
            type="text"
            inputMode="numeric"
            name="gia_cuoi_tuan"
            placeholder="VD: 1.100.000"
            value={cuoiTien === null ? "" : chuTien(cuoiTien)}
            onChange={(e) => p.onDoiGia("cuoi_tuan", e.target.value)}
          />
        </label>
      </div>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={khongBam} onClick={p.onApDung}>
        {p.dangLuu ? "Đang lưu…" : chuNutApDung(p.thangChon)}
      </button>
    </div>
  );
};

type NoiDungProps = {
  bang: BangGia | null;
  nam: number;
  coGiaNamKhac: boolean;
  thangChon: number[];
  giaThuong: string;
  giaCuoiTuan: string;
  thangLich: string;
  dangLuu: boolean;
  loiChung: string | null;
  baoChuaChon: boolean;
  loiTai: "mang" | "khac" | null;
  matMang: boolean;
  onChonThang: (so: number) => void;
  onDoiGia: (o: "thuong" | "cuoi_tuan", chu: string) => void;
  onApDung: () => void;
  onMoNam: () => void;
  onDoiThangLich: (thang: string) => void;
  onThuLai: () => void;
  onChuaLam: (chu: string) => void;
  onMoGiaLe?: (ngay?: string) => void; // CN6-02 (US8); chưa truyền thì báo chưa làm
  onSaoChep?: () => void; // CN6-07 (US7); chưa truyền thì báo chưa làm
};

export const NoiDungGia = (p: NoiDungProps) => {
  const { bang } = p;
  if (!bang || bang.nam !== p.nam) {
    // Chưa có bảng giá: khung xám khi đang tải (HV1), báo và nút Thử lại khi lỗi (HV2 bước 2)
    return p.loiTai ? (
      <ChuaTaiDuoc matMang={p.matMang || p.loiTai === "mang"} onThuLai={p.onThuLai} />
    ) : (
      <div className="khoi" aria-busy="true">
        <div className="khung-xam" style={{ height: 20, width: "40%" }} />
        <div className="khung-xam" style={{ height: 220 }} />
        <div className="khung-xam" style={{ height: 44 }} />
      </div>
    );
  }
  const trong = bang.thang.every((t) => t.gia_ngay_thuong === null) && bang.dai_dip.length === 0 && !p.coGiaNamKhac;
  const demDung = bang.dem && bang.dem.length > 0 && bang.dem[0].ngay.slice(0, 7) === p.thangLich ? bang.dem : null;
  const tieuDeLich =
    p.thangLich.slice(0, 4) === String(p.nam)
      ? `Lịch giá tháng ${Number(p.thangLich.slice(5, 7))}`
      : `Lịch giá tháng ${Number(p.thangLich.slice(5, 7))}/${p.thangLich.slice(0, 4)}`;
  return (
    <>
      {p.matMang && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Giá có thể chưa mới nhất.
        </div>
      )}
      {trong && (
        <div className="khoi" role="note">
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_CAN_CHUA_CO_GIA}</span>
        </div>
      )}
      <FormGiaThang
        nam={p.nam}
        oThang={bang.thang.map((t, i) => ({ khoa: t.thang, so: i + 1, gia: chuKhoangThang(t.gia_thap_nhat, t.gia_cao_nhat), chua: t.gia_ngay_thuong === null }))}
        thangChon={p.thangChon}
        giaThuong={p.giaThuong}
        giaCuoiTuan={p.giaCuoiTuan}
        dangLuu={p.dangLuu}
        loiChung={p.loiChung}
        baoChuaChon={p.baoChuaChon}
        onChonThang={p.onChonThang}
        onDoiGia={p.onDoiGia}
        onApDung={p.onApDung}
        onMoNam={p.onMoNam}
        demCuoiTuan={bang.dem_cuoi_tuan}
      />
      <div style={{ display: "flex" }}>
        <button
          type="button"
          className="hh-btn hh-btn--text hh-btn--inline"
          onClick={() => (p.onMoGiaLe ? p.onMoGiaLe() : p.onChuaLam("Đặt giá ngày lễ, dịp đặc biệt làm ở US8"))}
        >
          <Icon ten="cong" co={16} />
          Đặt giá ngày lễ, dịp đặc biệt
        </button>
      </div>
      <DanhSachDip dai={bang.dai_dip} laNgayLe onCham={() => p.onChuaLam(CHU_CHUA_SUA_DAI)} />
      <DanhSachDip dai={bang.dai_dip} laNgayLe={false} onCham={() => p.onChuaLam(CHU_CHUA_SUA_DAI)} />
      <LichGia
        thang={p.thangLich}
        dem={demDung}
        dai={bang.dai_dip}
        tieuDe={tieuDeLich}
        onDoiThang={p.onDoiThangLich}
        onChamNgay={(ngay) => (p.onMoGiaLe ? p.onMoGiaLe(ngay) : p.onChuaLam("Đặt giá ngày lễ, dịp đặc biệt làm ở US8"))}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className="hh-btn hh-btn--text hh-btn--inline"
          onClick={() => (p.onSaoChep ? p.onSaoChep() : p.onChuaLam("Sao chép giá sang căn khác làm ở US7"))}
        >
          <Icon ten="cong" co={16} />
          Sao chép giá sang căn khác
        </button>
      </div>
    </>
  );
};

