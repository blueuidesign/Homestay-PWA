import React from "react";
import { tenThe } from "../components/can-hien-thi";
import { chuKhoangThang } from "../components/gia-hien-thi";
import { LoiApi, LoiMang, type Can, type DipGiuGiaCu, type ThangGiuGiaCu } from "../services/kieu";
import { chuNgayNgan, chuThang } from "../services/ngay";
import { OChon } from "./cn10-man";
import { FormGiaThang, loiKhiApDung, type OThangGia } from "./cn6-gia-man";

// Phần vẽ của US7: CN6-05, CN6-05-00 (chọn căn), CN6-06 (đặt giá nhiều căn), CN6-07 (sao chép giá), mục "Đặt giá nhiều căn" (US7), mục "Sao chép giá sang căn khác" (US7).
// Không gọi server, không dùng zmp-sdk, để test render được. Phần tải và lưu ở cn6-nhieu-can.tsx, cn6-sao-chep.tsx.
// Chữ chưa vẽ trên canvas, ghi ở PR: nút "Bỏ chọn" khi đã chọn hết, chữ nút khi đã chọn căn đích, toast sau khi áp dụng nhiều căn,
// dòng báo ca sao chép còn [MỞ], popup báo tháng và dịp giữ giá cũ sau khi sao chép (tiêu đề, câu dẫn, nút "Tôi đã hiểu"), cách báo khi không chọn phần nào để sao chép.

export const CHU_CHON_IT_NHAT = "Chọn ít nhất một căn";
export const CHU_CHON_CAN_DE_SAO_CHEP = "Chọn căn để sao chép";
export const CHU_DAT_GIA_NGAY_LE_NHIEU_CAN = "Đặt giá ngày lễ, dịp đặc biệt cho nhiều căn chưa có cách làm";

// Dòng đếm CN6-05 (US7-NT2): "CHỌN CĂN · ĐÃ CHỌN 2/4". Chưa chọn căn nào là CN6-05-00: cùng dòng, "ĐÃ CHỌN 0/4".
export const chuDemChonCan = (chon: number, tong: number) => `CHỌN CĂN · ĐÃ CHỌN ${chon}/${tong}`;
// Nút dưới đáy CN6-05 (mục "Đặt giá nhiều căn" (US7) bước 2): "Đặt giá cho 2 căn"; chưa chọn thì mờ, ghi "Chọn ít nhất một căn" (CN6-05-00)
export const chuNutDatGia = (chon: number) => (chon === 0 ? CHU_CHON_IT_NHAT : `Đặt giá cho ${chon} căn`);
// Tiêu đề CN6-06 (mục "Đặt giá nhiều căn" (US7) bước 3)
export const chuTieuDeDatGia = (soCan: number) => `Đặt giá · ${soCan} căn`;
// Toast CN6-08 (US7-NT7, HV8)
export const chuToastSaoChep = (soCan: number) => `Đã sao chép giá sang ${soCan} căn`;
// Dòng đếm căn đích CN6-07 (mục "Sao chép giá sang căn khác" (US7) bước 3): "SANG CĂN · ĐÃ CHỌN 0"
export const chuDemCanDich = (chon: number) => `SANG CĂN · ĐÃ CHỌN ${chon}`;
export const chuCanhBaoThay = (maCanNguon: string) => `Giá đang có của căn được chọn sẽ được thay bằng giá của ${tenThe(maCanNguon)}.`;
export const chuNutSaoChep = (soCanDich: number) => (soCanDich === 0 ? CHU_CHON_CAN_DE_SAO_CHEP : `Sao chép giá sang ${soCanDich} căn`);
// "Giá 7 tháng · 2 ngày lễ · 2 dịp đặc biệt" (mục "Sao chép giá sang căn khác" (US7) bước 1); phần nào không có thì bỏ
export const chuTomTatGia = (soThang: number, soNgayLe: number, soDip: number) =>
  [`Giá ${soThang} tháng`, soNgayLe > 0 ? `${soNgayLe} ngày lễ` : null, soDip > 0 ? `${soDip} dịp đặc biệt` : null].filter(Boolean).join(" · ");

// "Chọn tất cả" (US7-NT3, mục "Sao chép giá sang căn khác" (US7) bước 3): chưa chọn hết thì chọn hết, đã chọn hết thì bỏ chọn
export const chonTatCa = (dangChon: string[], tatCa: string[]) => (tatCa.length > 0 && tatCa.every((id) => dangChon.includes(id)) ? [] : [...tatCa]);
export const doiChon = (ds: string[], id: string) => (ds.includes(id) ? ds.filter((x) => x !== id) : [...ds, id]);

// Popup sau khi sao chép khi có tháng giữ giá cũ (mục "Sao chép giá sang căn khác" (US7), US7 Tùng quyết 04/11/2026). Chữ tạm: canvas chưa vẽ, chỉ nút "Tôi đã hiểu" do Tùng nêu.
export const CHU_TIEU_DE_GIU_GIA_CU = "Một số giá được giữ nguyên";
export const CHU_DAN_GIU_GIA_CU = "Căn gốc chưa có giá các tháng này, nên căn đích giữ nguyên giá đang có:";
export const CHU_DAN_GIU_DIP_CU = "Căn gốc không có các ngày lễ, dịp đặc biệt này, nên căn đích giữ nguyên:";
export const CHU_DAN_BO_QUA_DIP = "Căn gốc có các ngày lễ, dịp đặc biệt này nhưng trùng ngày với dịp đang có của căn đích, nên chưa chép:";
export const CHU_NUT_DA_HIEU = "Tôi đã hiểu";
export const chuDongGiuGiaCu = (g: ThangGiuGiaCu) => `${tenThe(g.ma_can)}: ${g.thang.map(chuThang).join(", ")}`;

// "Phòng 1509: Pháo hoa 30/4 (30/04 – 02/05)" (Tùng quyết 04/11/2026 điểm 12)
export const chuDongGiuDipCu = (g: DipGiuGiaCu) =>
  `${tenThe(g.ma_can)}: ${g.dip.map((d) => `${d.ten} (${chuNgayNgan(d.tu)} – ${chuNgayNgan(d.den)})`).join(", ")}`;

export const HopGiuGiaCu = ({ giu, dipGiu = [], dipBoQua = [], onDong }: { giu: ThangGiuGiaCu[]; dipGiu?: DipGiuGiaCu[]; dipBoQua?: DipGiuGiaCu[]; onDong: () => void }) => (
  <div className="hh-scrim" role="alertdialog" aria-modal="true" aria-label={CHU_TIEU_DE_GIU_GIA_CU}>
    <div className="hh-sheet">
      <div className="hh-sheet__body" style={{ paddingTop: 24 }}>
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{CHU_TIEU_DE_GIU_GIA_CU}</span>
        {giu.length > 0 && <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{CHU_DAN_GIU_GIA_CU}</span>}
        {giu.map((g) => (
          <span key={g.can_id} data-giu-gia-cu style={{ font: "var(--text-body)", color: "var(--ink)" }}>
            {chuDongGiuGiaCu(g)}
          </span>
        ))}
        {dipGiu.length > 0 && <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{CHU_DAN_GIU_DIP_CU}</span>}
        {dipGiu.map((g) => (
          <span key={g.can_id} data-giu-dip-cu style={{ font: "var(--text-body)", color: "var(--ink)" }}>
            {chuDongGiuDipCu(g)}
          </span>
        ))}
        {dipBoQua.length > 0 && <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{CHU_DAN_BO_QUA_DIP}</span>}
        {dipBoQua.map((g) => (
          <span key={g.can_id} data-bo-qua-dip style={{ font: "var(--text-body)", color: "var(--ink)" }}>
            {chuDongGiuDipCu(g)}
          </span>
        ))}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onDong}>
          {CHU_NUT_DA_HIEU}
        </button>
      </div>
    </div>
  </div>
);

// Lỗi khi sao chép không được: HV2 bước 3, câu của server khi gặp ca còn mở (DU_LIEU_SAI ở den_can_ids kèm lý do)
export const loiKhiSaoChep = (e: unknown) => {
  if (e instanceof LoiMang) return "Chưa lưu được, bấm lại khi có mạng";
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "den_can_ids" && e.ly_do) return e.ly_do;
  if (e instanceof LoiApi && e.loi === "KHONG_TIM_THAY") return "Không tìm thấy căn này. Quay lại danh sách căn rồi thử lại.";
  return "Có lỗi, chưa lưu được. Bấm lại";
};
export { loiKhiApDung as loiKhiApDungNhieuCan };

const DauMuc = ({ nhan, nut, onNut }: { nhan: string; nut?: string; onNut?: () => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span className="nhan-muc">{nhan}</span>
    {nut && (
      <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onNut}>
        {nut}
      </button>
    )}
  </div>
);

const BannerMatMang = () => (
  <div className="hh-banner hh-banner--warning" role="status">
    Mất kết nối. Giá có thể chưa mới nhất.
  </div>
);

// CN6-05, CN6-05-00 · chọn căn
export const NoiDungChonCan = (p: {
  can: Can[];
  canChon: string[];
  matMang: boolean;
  onDoi: (id: string) => void;
  onTatCa: () => void;
  onTiep: () => void;
}) => {
  const tatCa = p.can.length > 0 && p.can.every((c) => p.canChon.includes(c.id));
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 100 }}>
        {p.matMang && <BannerMatMang />}
        <div className="khoi">
          <DauMuc nhan={chuDemChonCan(p.canChon.length, p.can.length)} nut={tatCa ? "Bỏ chọn" : "Chọn tất cả"} onNut={p.onTatCa} />
          {p.can.map((c) => (
            <OChon key={c.id} chon={p.canChon.includes(c.id)} chu={tenThe(c.ma_can)} onDoi={() => p.onDoi(c.id)} />
          ))}
        </div>
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={p.canChon.length === 0} onClick={p.onTiep}>
          {chuNutDatGia(p.canChon.length)}
        </button>
      </div>
    </>
  );
};

// CN6-06 · đặt giá nhiều căn: khối "CĂN ÁP DỤNG" rồi đặt giá như CN6 (mục "Đặt giá nhiều căn" (US7) bước 3)
export const NoiDungDatGiaNhieuCan = (p: {
  can: Can[];
  nam: number;
  thangChon: number[];
  giaThuong: string;
  giaCuoiTuan: string;
  dangLuu: boolean;
  loiChung: string | null;
  baoChuaChon: boolean;
  matMang: boolean;
  onDoiCan: () => void;
  onChonThang: (so: number) => void;
  onDoiGia: (o: "thuong" | "cuoi_tuan", chu: string) => void;
  onApDung: () => void;
  onMoNam: () => void;
  onChuaLam: (chu: string) => void;
}) => {
  // Canvas CN6-06 ghi cả 12 ô "Chưa đặt": nhiều căn không có một khoảng giá chung để ghi
  const oThang: OThangGia[] = Array.from({ length: 12 }, (_, i) => ({
    khoa: `${p.nam}-${String(i + 1).padStart(2, "0")}`,
    so: i + 1,
    gia: chuKhoangThang(null, null),
    chua: true,
  }));
  return (
    <>
      {p.matMang && <BannerMatMang />}
      <div className="khoi">
        <DauMuc nhan="Căn áp dụng" nut="Đổi căn" onNut={p.onDoiCan} />
        {p.can.map((c) => (
          <span key={c.id} style={{ font: "var(--text-body)", color: "var(--ink)" }}>
            {tenThe(c.ma_can)}
          </span>
        ))}
      </div>
      <FormGiaThang
        nam={p.nam}
        oThang={oThang}
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
      />
      <div style={{ display: "flex" }}>
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={() => p.onChuaLam(CHU_DAT_GIA_NGAY_LE_NHIEU_CAN)}>
          Đặt giá ngày lễ, dịp đặc biệt
        </button>
      </div>
    </>
  );
};

// CN6-07 · sao chép giá (mục "Sao chép giá sang căn khác" (US7))
export const NoiDungSaoChep = (p: {
  maCanNguon: string;
  tomTat: string | null; // null: đang tải
  canDich: Can[]; // mọi căn trừ căn nguồn
  thang: boolean;
  le: boolean;
  dip: boolean;
  denChon: string[];
  dangLuu: boolean;
  loiChung: string | null;
  matMang: boolean;
  onDoiPhan: (k: "thang" | "le" | "dip") => void;
  onDoiDich: (id: string) => void;
  onTatCa: () => void;
  onSaoChep: () => void;
}) => {
  const tatCa = p.canDich.length > 0 && p.canDich.every((c) => p.denChon.includes(c.id));
  const khongBam = p.dangLuu || p.denChon.length === 0 || (!p.thang && !p.le && !p.dip);
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 100 }}>
        {p.matMang && <BannerMatMang />}
        <div className="khoi">
          <span className="nhan-muc">Từ căn</span>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{tenThe(p.maCanNguon)}</span>
          {p.tomTat === null ? (
            <div className="khung-xam" aria-busy="true" style={{ height: 20, width: "60%" }} />
          ) : (
            <span className="chu-phu">{p.tomTat}</span>
          )}
        </div>
        <div className="khoi">
          <span className="nhan-muc">Sao chép gì</span>
          <OChon chon={p.thang} chu="Giá theo tháng" onDoi={() => p.onDoiPhan("thang")} />
          <OChon chon={p.le} chu="Giá ngày lễ" onDoi={() => p.onDoiPhan("le")} />
          <OChon chon={p.dip} chu="Dịp đặc biệt" onDoi={() => p.onDoiPhan("dip")} />
        </div>
        <div className="khoi">
          <DauMuc nhan={chuDemCanDich(p.denChon.length)} nut={tatCa ? "Bỏ chọn" : "Chọn tất cả"} onNut={p.onTatCa} />
          {p.canDich.map((c) => (
            <OChon key={c.id} chon={p.denChon.includes(c.id)} chu={tenThe(c.ma_can)} onDoi={() => p.onDoiDich(c.id)} />
          ))}
          <span className="chu-phu">{chuCanhBaoThay(p.maCanNguon)}</span>
        </div>
        {p.loiChung && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {p.loiChung}</span>
          </div>
        )}
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={khongBam} onClick={p.onSaoChep}>
          {p.dangLuu ? "Đang lưu…" : chuNutSaoChep(p.denChon.length)}
        </button>
      </div>
    </>
  );
};
