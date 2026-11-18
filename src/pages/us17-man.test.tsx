import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { DaiXanh } from "../components/dai-xanh";
import {
  chuDaiA401,
  chuLanGuiCuoi,
  chuToastDaChoXem,
  CHU_A6_MOT_LINK,
  CHU_A7_DA_GUI,
  CHU_A7_GHI_CHU,
  CHU_A8_01_PHU,
  CHU_A8_01_TIEU_DE,
  CHU_A8_COC,
  CHU_A8_KHONG_THAY,
  CHU_DE_SAU_A6,
  CHU_DE_SAU_A8,
  CHU_LY_DO_A6,
} from "../components/xin-lich-hien-thi";
import { chuCacCan, chuGioDong, dichThongBao, dongThongBao, laHomNay } from "../components/thong-bao-hien-thi";
import { HopToast } from "../components/toast";
import { tieuDePopup } from "../components/xin-so";
import { banThu, getThongBao, postKetNoiNgung, getKetNoi, postLink, postLinkDongY, postPhien, postTaiKhoan } from "../services/api";
import type { MucThongBao, XemTruocLinkXin } from "../services/kieu";
import { NoiDungA5 } from "./a5-sale-moi";
import { NoiDungA6 } from "./a6-man";
import { NoiDungA7 } from "./a7-man";
import { NoiDungA8, NoiDungA801 } from "./a8-man";
import { NoiDungP13 } from "./p13-man";

// US17 · Test render A5 → A6, A6, A7, A7-00, A7-01, A8, A8-01, toast A9, A9-02, P13, P13-00 và A4-01, dùng chữ và dữ liệu của server giả.
// Hôm nay 07/10/2026 (DLM.1). Giờ trên dòng thông báo theo giờ Việt Nam.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));
const HOM_NAY = Date.parse("2026-10-07T10:00:00+07:00");
let n = 0;
const khoa = () => `khoa-us17m-${++n}-xxxxxxxxxxxxxxxx`;

const hung = { ten_hien_thi: "Sale Hùng", so_dien_thoai: "0912345678" };
const xin = (sale: XemTruocLinkXin["sale"] = hung): XemTruocLinkXin => ({ loai: "xin_lich", het_han_luc: null, sale });

const muc = (m: Partial<MucThongBao> & Pick<MucThongBao, "loai" | "du_lieu">): MucThongBao => ({
  id: "1",
  ids: ["1"],
  du_lieu_gom: null,
  booking_id: null,
  yeu_cau_id: null,
  tao_luc: "2026-10-07T09:05:00+07:00",
  da_doc_luc: null,
  ...m,
});
const ICON = (ma: string) => ({ can_id: "1", ma_can: ma, ten_toa_nha: "ICON40" });

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
});

// ---- A5 → A6 (US17-NT1) ----

test("test_YC1_4_NT2_NT3_US17_KB2_A5_co_hai_nut_va_nut_xin_lich_goi_dung_ham_mo_A6", () => {
  let moA6 = 0;
  const s = html(<NoiDungA5 onXinLich={() => moA6++} onThemThuCong={khong} />);
  expect(nut(s)).toEqual(expect.arrayContaining(["Gửi tin nhắn xin lịch đến chủ nhà", "Thêm căn thủ công"]));
  // Nút nối với onXinLich (kiểm cách nối ở trang tab Lịch: dieuHuong(DUONG.XIN_LICH))
  expect(moA6).toBe(0);
});

// ---- A6 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 1, NT4) ----

const TIN = "Chào anh/chị, em là Sale Bình, sale phòng ở Hạ Long. Anh/chị bấm link dưới đây để cho em xem lịch phòng trống. Em gửi khách nhanh hơn, không phải gọi hỏi từng lần. https://zalo.me/s/0000/?ma=Ks2Pq7Wn4Rx9Lm1Bv6Td8a";

test("test_YC1_6_buoc_1_US17_KB2_A6_co_tin_san_link_mot_link_cho_nhieu_chu_nha_ba_buoc_va_hai_nut", () => {
  const s = html(<NoiDungA6 tin={TIN} dangLam={false} loi={null} onGui={khong} onSaoChep={khong} />);
  const c = chu(s);
  expect(c).toContain("Gửi tin này cho chủ nhà qua Zalo. Chủ nhà bấm link và đồng ý là bạn thấy lịch phòng trống.");
  expect(c).toContain("Tin nhắn sẽ gửi"); // canvas "TIN NHẮN SẼ GỬI", chữ hoa do kiểu .nhan-muc
  expect(c).toContain(TIN);
  expect(c).toContain(CHU_A6_MOT_LINK);
  expect(CHU_A6_MOT_LINK).toBe("Một link dùng được cho nhiều chủ nhà.");
  expect(c).toContain("Sau khi gửi");
  for (const b of ["Chủ nhà mở link trong Zalo", 'Chủ nhà bấm "Đồng ý cho xem lịch"', "Lịch của chủ hiện trong Nguồn phòng"]) expect(c).toContain(b);
  expect(nut(s)).toEqual(["Gửi qua Zalo", "Sao chép tin nhắn"]);
});

test("test_YC1_6_NT4_US17_KB3_tin_tren_A6_co_zalo_me_s_va_khong_co_home247_vn", () => {
  const c = chu(html(<NoiDungA6 tin={TIN} dangLam={false} loi={null} onGui={khong} onSaoChep={khong} />));
  expect(c).toContain("zalo.me/s/");
  expect(c).not.toContain("home247.vn");
  expect(c).not.toMatch(/0\d{9}/);
});

test("test_HV1_HV2_US17_A6_dang_lam_thi_khoa_hai_nut_va_loi_mang_hien_o_banner", () => {
  const s = html(<NoiDungA6 tin={TIN} dangLam loi="Chưa lưu được, bấm lại khi có mạng" onGui={khong} onSaoChep={khong} />);
  expect(s.match(/<button[^>]*disabled=""/g)).toHaveLength(2);
  expect(chu(s)).toContain("Đang xử lý…");
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
});

test("test_YC1_5_1_NT3_US17_KB4_chu_popup_A6_P1_nguoi_kia_la_chu_nha_va_ghi_chu_De_sau", () => {
  expect(tieuDePopup("chu_nha")).toBe("Chia sẻ số điện thoại với chủ nhà"); // theo mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5); canvas A6-P1 ghi "tên và số điện thoại"
  expect(CHU_LY_DO_A6.startsWith("Chủ nhà nhận ra bạn qua tên và số điện thoại khi mở link xin lịch.")).toBe(true);
  expect(CHU_DE_SAU_A6).toBe("Để sau vẫn gửi được tin. Chủ nhà chưa thấy tên và số của bạn.");
  expect(CHU_DE_SAU_A8).toBe("Để sau vẫn cho sale xem lịch được. Sale chưa thấy tên và số của bạn.");
});

// ---- A7, A7-00, A7-01 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 3, NT2) ----

const guiLuc = (phutTruoc: number) => new Date(HOM_NAY - phutTruoc * 60_000).toISOString();

test("test_YC1_6_NT2_US17_KB5_A7_chi_co_hai_con_so_va_khong_co_ten_chu_nha_nao", () => {
  const s = html(<NoiDungA7 tk={{ so_lan_gui: 3, gui_cuoi_luc: "2026-10-07T14:20:00+07:00", so_chu_nha_dong_y: 0 }} vuaGui={false} bayGio={Date.parse("2026-10-07T15:00:00+07:00")} onGuiChoChuKhac={khong} onThemCanTuNhap={khong} />);
  const c = chu(s);
  expect(c).toContain("Đang chờ chủ nhà đồng ý");
  expect(c).toContain("Lần gửi gần nhất lúc 14:20 hôm nay.");
  expect(c).toContain("3 lần đã gửi qua Zalo");
  expect(c).toContain("0 chủ nhà đã đồng ý");
  expect(c).toContain(CHU_A7_GHI_CHU);
  expect(CHU_A7_GHI_CHU).toBe("Tin được gửi từ cửa sổ của Zalo nên app không biết bạn đã gửi cho ai. App chỉ đếm số lần bạn gửi và số chủ nhà đã đồng ý.");
  expect(c).toContain("Chủ nhà lâu chưa trả lời? Nhắn hoặc gọi để nhắc chủ mở link.");
  expect(c).not.toMatch(/Chị Hoa|Anh Tuấn|Hoa|Tuấn/);
  expect(c).not.toContain(CHU_A7_DA_GUI); // dải xanh chỉ khi vừa gửi xong
  expect(nut(s)).toEqual(["Gửi link cho chủ nhà khác", "Thêm căn tự nhập"]);
});

test("test_YC1_6_A7_01_US17_KB4_vua_gui_xong_thi_co_dai_xanh_va_so_dem_da_cap_nhat_lan_gui_cuoi_vua_xong", () => {
  const luc = "2026-10-07T09:59:40+07:00";
  const s = html(<NoiDungA7 tk={{ so_lan_gui: 1, gui_cuoi_luc: luc, so_chu_nha_dong_y: 0 }} vuaGui bayGio={HOM_NAY} onGuiChoChuKhac={khong} onThemCanTuNhap={khong} />);
  const c = chu(s);
  expect(c).toContain("✓ Đã gửi qua Zalo. Đang chờ chủ nhà đồng ý.");
  expect(CHU_A7_DA_GUI).toBe("✓ Đã gửi qua Zalo. Đang chờ chủ nhà đồng ý.");
  expect(c).toContain("1 lần đã gửi qua Zalo");
  expect(c).toContain("Lần gửi gần nhất lúc vừa xong.");
});

test("test_YC1_6_A7_00_US17_chua_gui_lan_nao_thi_nut_gui_tin_nhu_A5", () => {
  const s = html(<NoiDungA7 tk={{ so_lan_gui: 0, gui_cuoi_luc: null, so_chu_nha_dong_y: 0 }} vuaGui={false} onGuiChoChuKhac={khong} onThemCanTuNhap={khong} />);
  const c = chu(s);
  expect(c).toContain("Chưa gửi link xin lịch");
  expect(c).toContain("Gửi tin xin lịch cho chủ nhà qua Zalo. Chủ nhà đồng ý là lịch hiện ở đây.");
  expect(nut(s)).toEqual(["Gửi tin nhắn xin lịch cho chủ nhà"]);
});

test("test_YC1_6_NT3_US17_KB9_A7_sau_khi_mot_chu_nha_dong_y_ghi_1_chu_nha_da_dong_y", () => {
  const c = chu(html(<NoiDungA7 tk={{ so_lan_gui: 2, gui_cuoi_luc: guiLuc(5), so_chu_nha_dong_y: 1 }} vuaGui={false} bayGio={HOM_NAY} onGuiChoChuKhac={khong} onThemCanTuNhap={khong} />));
  expect(c).toContain("2 lần đã gửi qua Zalo");
  expect(c).toContain("1 chủ nhà đã đồng ý");
});

test("test_YC1_6_US17_chu_lan_gui_cuoi_hom_qua_va_ngay_cu", () => {
  const bay = Date.parse("2026-10-07T10:00:00+07:00");
  expect(chuLanGuiCuoi("2026-10-06T21:15:00+07:00", bay)).toBe("Lần gửi gần nhất lúc 21:15 hôm qua.");
  expect(chuLanGuiCuoi("2026-10-01T08:00:00+07:00", bay)).toBe("Lần gửi gần nhất lúc 08:00 ngày 01/10.");
  expect(chuLanGuiCuoi(null, bay)).toBeNull();
});

// ---- A8, A8-01 (mục "Chủ nhà duyệt lời mời xem lịch" (US17)) ----

const a8 = (p: Partial<React.ComponentProps<typeof NoiDungA8>> = {}) =>
  html(<NoiDungA8 xin={xin()} coTaiKhoan coc dangLam={false} loi={null} onDoiCoc={khong} onDongY={khong} onTuChoi={khong} {...p} />);

test("test_YC1_7_NT1_US17_KB7_A8_co_ten_va_so_dien_thoai_sale_mot_cong_tac_coc_va_hai_nut", () => {
  const s = a8();
  const c = chu(s);
  expect(c).toContain("Sale Hùng");
  expect(c).toContain("0912 345 678");
  expect(c).toContain("xin xem lịch phòng trống của bạn để gửi khách.");
  expect(c).toContain("Nếu đồng ý, Sale Hùng sẽ thấy");
  expect(c).toContain("Phòng trống hay đã có người đặt, không thấy tên người đặt");
  expect(c).toContain("Giá từng đêm");
  expect(c).toContain(CHU_A8_COC);
  expect(CHU_A8_COC).toBe("Đã cọc hay chưa (không thấy số tiền)");
  expect(c).toContain(CHU_A8_KHONG_THAY);
  expect(nut(s)).toEqual(expect.arrayContaining(["Đồng ý cho xem lịch", "Từ chối"]));
  // QD20 r2: chỉ một công tắc (cọc), không có công tắc giá
  expect(s.match(/role="switch"/g)).toHaveLength(1);
  expect(s).toMatch(/role="switch" aria-checked="true" data-coc/);
  // Đã có tài khoản thì không có dòng "Chưa có tài khoản?"
  expect(c).not.toContain("Chưa có tài khoản?");
  expect(c).not.toContain("Đổi được trong mục Sale"); // chưa có màn đổi quyền ([MỞ: CH-053])
});

test("test_YC1_7_NT2_US17_KB12_cong_tac_coc_tat_thi_aria_checked_false_va_chu_Tat", () => {
  const s = a8({ coc: false });
  expect(s).toMatch(/aria-checked="false" data-coc/);
  expect(nut(s).some((t) => t.includes("Tắt"))).toBe(true);
});

test("test_YC1_5_1_US17_KB14_A8_sale_chua_cho_so_thi_khong_co_dong_so_dien_thoai", () => {
  const s = a8({ xin: xin({ ten_hien_thi: "Sale Bình", so_dien_thoai: null }) });
  expect(chu(s)).toContain("Sale Bình");
  expect(s).not.toContain("data-so-dien-thoai");
  expect(chu(s)).not.toMatch(/0\d{3} \d{3} \d{3}/);
});

test("test_YC1_7_buoc_2_US17_chu_nha_chua_co_tai_khoan_thi_A8_co_ghi_chu_dang_nhap_bang_Zalo", () => {
  const c = chu(a8({ coTaiKhoan: false }));
  expect(c).toContain("Chưa có tài khoản? Bấm Đồng ý để đăng nhập bằng Zalo, sau đó thêm căn.");
});

test("test_HV2_US17_A8_dang_lam_thi_khoa_nut_va_loi_mang_hien_o_banner_giu_cong_tac", () => {
  const s = a8({ dangLam: true, coc: false, loi: "Chưa lưu được, bấm lại khi có mạng" });
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(s.match(/<button[^>]*disabled=""/g)).toHaveLength(2);
  expect(s).toMatch(/aria-checked="false" data-coc/);
});

test("test_YC1_7_NT4_US17_KB15_A8_01_khong_ten_khong_so_khong_nut_dong_y_chi_co_Ve_Lich", () => {
  const s = html(<NoiDungA801 onVeLich={khong} />);
  const c = chu(s);
  expect(c).toContain("Bạn không còn xem được mục này");
  expect(CHU_A8_01_TIEU_DE).toBe("Bạn không còn xem được mục này");
  expect(CHU_A8_01_PHU).toBe("Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch.");
  expect(c).toContain(CHU_A8_01_PHU);
  expect(nut(s)).toEqual(["Về Lịch"]);
  expect(c).not.toMatch(/Hùng|09\d\d|Đồng ý cho xem lịch/);
});

test("test_YC1_7_buoc_3_US17_CN7_06_toast_sau_khi_dong_y_va_A4_01_dai_xanh_cho_chu_nha_moi", () => {
  expect(chuToastDaChoXem("Sale Hùng")).toBe("Đã cho Sale Hùng xem lịch. Sale Hùng nằm trong nhóm Đã kết nối");
  expect(chuDaiA401("Sale Hùng")).toBe("✓ Bạn đã cho Sale Hùng xem lịch. Thêm căn để Sale Hùng thấy phòng trống.");
  expect(chu(html(<DaiXanh chu={chuDaiA401("Sale Hùng")} />))).toContain("Thêm căn để Sale Hùng thấy phòng trống.");
});

// ---- Toast A9, A9-02 (mục "Thông báo kết quả kết nối cho sale" (US17) bước 1, 2) ----

test("test_YC1_10_NT1_US17_KB8_toast_A9_ten_chu_nha_so_can_va_nut_Xem", () => {
  const s = html(<HopToast chu="Chị Hoa đã đồng ý cho bạn xem lịch" phu="ICON40 1509 và 3402 đã vào Nguồn phòng" nut={{ chu: "Xem", onBam: khong }} onDong={khong} />);
  const c = chu(s);
  expect(c).toContain("✓");
  expect(c).toContain("Chị Hoa đã đồng ý cho bạn xem lịch");
  expect(c).toContain("ICON40 1509 và 3402 đã vào Nguồn phòng");
  expect(nut(s)).toContain("Xem");
  expect(s).toContain("toast__nut"); // nút "Xem" 44 px (khung.css)
});

test("test_HV8_US17_toast_thuong_chi_co_chu_khong_co_dong_phu_va_nut_Xem", () => {
  const s = html(<HopToast chu="Đã gửi lịch thành công" onDong={khong} />);
  expect(s).not.toContain("toast__phu");
  expect(s).not.toContain("toast__nut");
});

test("test_YC1_10_NT2_US17_KB10_chu_cac_can_cung_toa_ghi_toa_mot_lan_khac_toa_ghi_tung_toa", () => {
  expect(chuCacCan([ICON("1509"), ICON("3402")])).toBe("ICON40 1509 và 3402");
  expect(chuCacCan([{ can_id: "1", ma_can: "1103", ten_toa_nha: "Sapphire" }, { can_id: "2", ma_can: "2208", ten_toa_nha: "À La Carte" }])).toBe("Sapphire 1103 và À La Carte 2208");
  expect(chuCacCan([ICON("1509"), ICON("3402"), ICON("2501")])).toBe("ICON40 1509, 3402 và 2501");
});

// ---- P13, P13-00 (mục "Thông báo kết quả kết nối cho sale" (US17) bước 3, NT3) ----

const p13 = (ds: MucThongBao[], p: Partial<React.ComponentProps<typeof NoiDungP13>> = {}) =>
  html(
    <NoiDungP13
      muc={ds}
      soChuaDoc={ds.filter((m) => m.da_doc_luc === null).length}
      bayGio={HOM_NAY}
      dangLam={false}
      loi={null}
      conNua={false}
      onDanhDauHet={khong}
      onCham={khong}
      onXemThem={khong}
      {...p}
    />,
  );

const MAU: MucThongBao[] = [
  muc({
    id: "905",
    ids: ["905"],
    loai: "chu_sua_booking",
    booking_id: "101",
    tao_luc: "2026-10-07T10:15:00+07:00",
    du_lieu: { ten_chu_nha: "Chị Hoa", can: ICON("1509"), can_cu: null, ngay_nhan_cu: "2026-10-10", ngay_tra_cu: "2026-10-12", ngay_nhan: "2026-10-11", ngay_tra: "2026-10-13", tien_phong_cu: 2200000, tien_phong: 1800000 },
  }),
  muc({
    id: "902",
    ids: ["902"],
    loai: "chu_chap_nhan_yeu_cau",
    yeu_cau_id: "201",
    tao_luc: "2026-10-07T09:05:00+07:00",
    du_lieu: { ten_chu_nha: "Chị Hoa", can: ICON("1509"), ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12", tien_phong: 2200000 },
  }),
  muc({
    id: "850",
    ids: ["850"],
    loai: "chu_dong_y_ket_noi",
    tao_luc: "2026-10-07T08:30:00+07:00",
    da_doc_luc: "2026-10-07T08:31:00+07:00",
    du_lieu: { ten_chu_nha: "Anh Tuấn", so_can: 2, can: [{ can_id: "3", ma_can: "1103", ten_toa_nha: "Sapphire" }, { can_id: "4", ma_can: "2208", ten_toa_nha: "À La Carte" }] },
  }),
  muc({
    id: "898",
    ids: ["898"],
    loai: "yeu_cau_het_han",
    yeu_cau_id: "202",
    tao_luc: "2026-10-06T00:10:00+07:00",
    da_doc_luc: "2026-10-06T08:00:00+07:00",
    du_lieu: { ten_chu_nha: "Chị Hoa", can: ICON("1509"), ngay_nhan: "2026-09-27", ngay_tra: "2026-09-28" },
  }),
];

test("test_YC1_10_NT3_US17_KB16_P13_nhan_2_chua_doc_khop_2_dong_chu_dam_nhom_Hom_nay_va_Truoc_do", () => {
  const s = p13(MAU);
  const c = chu(s);
  expect(c).toContain("2 chưa đọc");
  expect(s.match(/data-chua-doc="1"/g)).toHaveLength(2);
  expect(c).toContain("Hôm nay");
  expect(c).toContain("Trước đó");
  expect(c.indexOf("Hôm nay")).toBeLessThan(c.indexOf("Trước đó"));
  expect(c).toContain("Chị Hoa đã sửa đặt phòng của bạn");
  expect(c).toContain("ICON40 1509 · 10/10 → 12/10 đổi thành 11/10 → 13/10, giá chủ nhà 2.200.000đ → 1.800.000đ");
  expect(c).toContain("10:15");
  expect(c).toContain("Chị Hoa đã chấp nhận đặt phòng");
  expect(c).toContain("09:05");
  expect(c).toContain("Anh Tuấn đồng ý cho bạn xem lịch"); // dòng đã đọc: nền thường
  expect(c).toContain("Sapphire 1103 và À La Carte 2208 đã vào Nguồn phòng");
  expect(c).toContain("Yêu cầu đặt phòng đã hết hạn");
  expect(c).toContain("Hôm qua");
  expect(nut(s)).toContain("Đánh dấu đã đọc");
  // Dòng chưa đọc nền xanh nhạt, dòng đã đọc nền trắng
  expect(s).toMatch(/data-chua-doc="1"[^>]*background:var\(--action-tint\)/);
  expect(s).toMatch(/data-chua-doc="0"[^>]*background:var\(--surface\)/);
});

test("test_YC1_10_NT3_US17_KB16_P13_da_doc_het_thi_0_chua_doc_va_nut_Danh_dau_bi_khoa", () => {
  const s = p13(MAU.map((m) => ({ ...m, da_doc_luc: "2026-10-07T10:00:00+07:00" })));
  expect(chu(s)).toContain("0 chưa đọc");
  expect(s).not.toContain('data-chua-doc="1"');
  expect(s).toMatch(/<button[^>]*disabled=""[^>]*>Đánh dấu đã đọc/);
});

test("test_YC1_10_NT2_US17_KB11_P13_mot_dong_gom_cho_hai_lan_dong_y", () => {
  const gom = muc({
    id: "7",
    ids: ["7", "6"],
    loai: "chu_dong_y_ket_noi",
    du_lieu: { ten_chu_nha: "Anh Tuấn", so_can: 2, can: [{ can_id: "3", ma_can: "1103", ten_toa_nha: "Sapphire" }, { can_id: "4", ma_can: "2208", ten_toa_nha: "À La Carte" }] },
    du_lieu_gom: [
      { ten_chu_nha: "Anh Tuấn", so_can: 2, can: [{ can_id: "3", ma_can: "1103", ten_toa_nha: "Sapphire" }, { can_id: "4", ma_can: "2208", ten_toa_nha: "À La Carte" }] },
      { ten_chu_nha: "Chị Hoa", so_can: 2, can: [ICON("1509"), ICON("3402")] },
    ],
  });
  const s = p13([gom]);
  expect(s.match(/data-dong-tb/g)).toHaveLength(1);
  expect(chu(s)).toContain("2 chủ nhà đồng ý cho bạn xem lịch");
  expect(chu(s)).toContain("Chị Hoa và Anh Tuấn · 4 căn mới trong Nguồn phòng");
  expect(chu(s)).toContain("1 chưa đọc");
});

test("test_YC1_10_P13_00_US17_KB1_chua_co_thong_bao_thi_hien_trang_thai_rong", () => {
  const s = p13([]);
  expect(chu(s)).toContain("Chưa có thông báo nào");
  expect(chu(s)).toContain("Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây.");
  expect(s).not.toContain("Đánh dấu đã đọc");
});

test("test_YC1_9_NT6_P13_02_US17_KB18_dong_chu_ngung_cho_xem_lich_khong_gia_khong_ten_khach", () => {
  const d = dongThongBao(muc({ loai: "chu_ngung_ket_noi", du_lieu: { ket_noi_id: "3", ten_chu_nha: "Chị Hoa" } }));
  expect(d.tieuDe).toBe("Chị Hoa đã ngừng cho bạn xem lịch");
  expect(d.chiTiet).toBe("Các căn của Chị Hoa không còn trong Nguồn phòng. Đặt phòng cũ của bạn với Chị Hoa vẫn xem được trong Thống kê.");
  expect(JSON.stringify(d)).not.toMatch(/\d{3}\.\d{3}/);
});

test("test_YC1_13_NT4_P13_01_US17_dong_chu_xoa_tai_khoan_mo_Nguon_phong_khong_mo_can_cua_chu_nha", () => {
  const m = muc({ loai: "chu_xoa_tai_khoan", du_lieu: { ket_noi_id: "3", ten_chu_nha: "Chị Hoa" } });
  expect(dongThongBao(m)).toEqual({ tieuDe: "Chị Hoa đã xóa tài khoản", chiTiet: "Các căn của Chị Hoa không còn trong lịch. Đặt phòng đã chốt vẫn giữ." });
  expect(dichThongBao(m)).toEqual({ duong: "CAN_SALE" });
});

test("test_YC1_10_P13_bang_Hanh_dong_chom_dong_mo_dung_man_dich", () => {
  expect(dichThongBao(MAU[0])).toEqual({ duong: "DAT_PHONG_SALE", state: { id: "101" } }); // S3-10
  expect(dichThongBao(MAU[1])).toEqual({ duong: "YEU_CAU_SALE", state: { id: "201" } }); // S3-04
  expect(dichThongBao(MAU[2])).toEqual({ duong: "LICH_SALE" }); // A10-02
  expect(dichThongBao(muc({ loai: "chu_ngung_ket_noi", du_lieu: {} }))).toEqual({ duong: "THONG_KE" });
  expect(dichThongBao(muc({ loai: "chu_ghi_booking_cho_sale", du_lieu: {} }))).toBeNull(); // loại chưa vẽ: chỉ đánh dấu đã đọc
  expect(dongThongBao(muc({ loai: "chu_ghi_booking_cho_sale", du_lieu: {} })).tieuDe).toBe("Thông báo mới");
});

test("test_HV1_US17_gio_tren_dong_hom_nay_la_HH_mm_hom_qua_la_chu_va_cu_hon_la_dd_mm", () => {
  expect(laHomNay("2026-10-07T00:05:00+07:00", HOM_NAY)).toBe(true);
  expect(laHomNay("2026-10-06T23:59:00+07:00", HOM_NAY)).toBe(false);
  expect(chuGioDong("2026-10-07T09:05:00+07:00", HOM_NAY)).toBe("09:05");
  expect(chuGioDong("2026-10-06T15:05:00+07:00", HOM_NAY)).toBe("Hôm qua");
  expect(chuGioDong("2026-10-04T10:00:00+07:00", HOM_NAY)).toBe("04/10");
});

// ---- P13 lấy từ server giả, sau khi chủ nhà đồng ý rồi ngừng ----

test("test_YC1_10_US17_P13_tu_server_gia_dong_y_roi_ngung_thi_hai_dong_moi_nhat_la_ngung", async () => {
  banThu.napDuLieuSale("moi");
  banThu.dungZaloId("zalo-thu-b", "Sale Bình");
  await postPhien();
  await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: "2026-10-07T01:00:00.000Z" });
  const ma = (await postLink({ loai: "xin_lich" }, khoa())).ma;
  banThu.dungZaloId("zalo-chi-hoa");
  await postPhien();
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  const id = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Bình")!.id;
  await postKetNoiNgung(id, khoa());
  banThu.dungZaloId("zalo-thu-b");
  await postPhien();
  const ds = await getThongBao();
  const s = p13(ds.muc, { soChuaDoc: ds.so_chua_doc, bayGio: Date.now() });
  const c = chu(s);
  expect(c).toContain("Chị Hoa đã ngừng cho bạn xem lịch");
  expect(c).toContain("Chị Hoa đồng ý cho bạn xem lịch");
  expect(c).toContain("2 chưa đọc");
  expect(c.indexOf("ngừng cho bạn")).toBeLessThan(c.indexOf("đồng ý cho bạn")); // mới trước
});
