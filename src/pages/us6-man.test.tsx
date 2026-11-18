import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { NoiDungBanThu } from "../components/ban-thu";
import { DUONG } from "../components/duong-dan";
import { NoiDungThanhTab } from "../components/thanh-tab";
import { kichThuocKhungXoay, suKienXoay, type SuKienXoay } from "../components/xoay-ngang";
import { banThu, getLink, getSaleLich, homNay, postPhien } from "../services/api";
import type { LichSale, XemTruocLink } from "../services/kieu";
import { chuToastDaThemLich } from "../services/mo-link";
import { manSauChonVai, NoiDungA3 } from "./a3-chon-vai";
import { manSauPhien } from "./a1-chao-mung";
import { CHU_LINK_KHONG_MO_DUOC, CHU_LINK_KHONG_MO_DUOC_PHU, NoiDungA1Link, NoiDungA1LinkLoi } from "./a1-link";
import { chuDaCoLich, chuDaCoLichPhu, chuGiaiThich, chuNutThem, NoiDungA10, NoiDungA1001 } from "./a10-man";
import { NoiDungA5 } from "./a5-sale-moi";
import { chuO, NoiDungS1 } from "./s1-man";

// US6 · Test render A1-link, A1-link-01, A10, A10-01, A5, S1 và chọn vai sale ở A3, dùng dữ liệu của server giả. Số theo DLM.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

let xem: XemTruocLink;
let lich: LichSale;
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  const ma = banThu.napDuLieuSale("hung");
  xem = await getLink(ma.anh_tuan);
  lich = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
});

test("test_YC1_3_NT8_US6_KB1_A1_link_the_loi_moi_khong_co_chu_Dang_nhap_va_co_nut_Bat_dau_ngay", () => {
  const s = html(<NoiDungA1Link tenChuNha="Anh Tuấn" soCan={2} dangVao={false} loi={null} onBatDau={khong} onMo={khong} />);
  const c = chu(s);
  expect(c).toContain("Anh Tuấn mời bạn xem lịch 2 căn");
  expect(c).toContain("Bấm Bắt đầu ngay để xem lịch và giá mới nhất");
  expect(c).not.toMatch(/Đăng nhập|đăng nhập/);
  expect(nut(s)).toEqual(["Bắt đầu ngay"]);
  expect(c).toContain("Bằng việc tiếp tục, bạn đồng ý với");
  expect([...s.matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1])).toEqual(["Điều khoản", "Chính sách quyền riêng tư"]);
  expect(c).toContain("Ghi lịch các phòng nhanh hơn sổ tay");
  // Không xin tên, số điện thoại ở đây (QD2)
  expect(s).not.toContain("<input");
  expect(chu(html(<NoiDungA1Link tenChuNha="Anh Tuấn" soCan={2} dangVao loi={null} onBatDau={khong} onMo={khong} />))).toContain("Đang vào…");
});

test("test_YC1_3_NT6_US6_KB11_A1_link_01_link_hong_khong_co_ten_chu_nha_ten_can_anh_va_co_nut_Vao_app", () => {
  const s = html(<NoiDungA1LinkLoi dangVao={false} onVaoApp={khong} />);
  const c = chu(s);
  expect(c).toContain(CHU_LINK_KHONG_MO_DUOC);
  expect(CHU_LINK_KHONG_MO_DUOC).toBe("Link này không mở được");
  expect(CHU_LINK_KHONG_MO_DUOC_PHU).toBe("Chủ nhà đã xóa tài khoản hoặc link không đúng. Xin chủ nhà gửi lại link mới.");
  expect(c).toContain(CHU_LINK_KHONG_MO_DUOC_PHU);
  expect(nut(s)).toEqual(["Vào app"]);
  expect(c).not.toMatch(/Tuấn|Hoa|Sapphire|1103|<img/);
  expect(s).not.toContain("<img");
});

test("test_YC1_3_NT2_US6_KB4_A10_the_chu_nha_hai_the_can_co_anh_khong_co_so_tien_nut_Them_lich_cua_Anh_Tuan", () => {
  const s = html(<NoiDungA10 xem={xem} dangLuu={false} loi={null} onThem={khong} />);
  const c = chu(s);
  expect(c).toContain("Anh Tuấn");
  expect(c).toContain("Chủ nhà · 2 căn");
  expect(c).toContain(chuGiaiThich("Anh Tuấn"));
  expect(c).toContain("2 căn");
  expect(c).toContain("Sapphire 1103");
  expect(c).toContain("3PN · 2 giường · view thành phố");
  expect(c).toContain("À La Carte 2208");
  expect(c).toContain("1PN · 1 giường · view biển");
  expect((s.match(/<img /g) ?? []).length).toBe(2);
  expect(nut(s)).toEqual(["Thêm lịch của Anh Tuấn"]);
  expect(chuNutThem("Anh Tuấn")).toBe("Thêm lịch của Anh Tuấn");
  expect(c).toContain("Chưa bấm thì chưa có gì vào lịch của bạn.");
  // Không có số tiền nào trên màn (QD9)
  expect(c).not.toMatch(/\d{1,3}(\.\d{3})+|\d+k\b|\dtr|đ\b/);
  expect(nut(html(<NoiDungA10 xem={xem} dangLuu loi={null} onThem={khong} />))).toEqual(["Đang lưu…"]);
});

test("test_HV2_US6_KB18_A10_mat_mang_khi_them_thi_bao_chua_luu_va_van_o_man_Them_lich", () => {
  const s = html(<NoiDungA10 xem={xem} dangLuu={false} loi="Chưa lưu được, bấm lại khi có mạng" onThem={khong} />);
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(nut(s)).toEqual(["Thêm lịch của Anh Tuấn"]);
});

test("test_YC1_3_buoc_6_US6_KB7_A10_01_the_da_co_lich_va_nut_Xem_lich_khong_co_nut_Them", () => {
  const s = html(<NoiDungA1001 xem={xem} onXemLich={khong} />);
  const c = chu(s);
  expect(c).toContain(chuDaCoLich("Anh Tuấn"));
  expect(chuDaCoLich("Anh Tuấn")).toBe("Bạn đã có lịch của Anh Tuấn");
  expect(c).toContain(chuDaCoLichPhu(2, "Anh Tuấn"));
  expect(chuDaCoLichPhu(2, "Anh Tuấn")).toBe("2 căn của Anh Tuấn đã có trong lịch của bạn. Mở lại link không thêm lần nữa.");
  expect(nut(s)).toEqual(["Xem lịch"]);
});

test("test_YC1_3_NT4_US6_KB5_toast_sau_khi_them_lich", () => {
  expect(chuToastDaThemLich(2, "Anh Tuấn")).toBe("Đã thêm lịch 2 căn của Anh Tuấn");
});

test("test_YC1_2_NT2_US6_KB8_chon_sale_roi_Tiep_tuc_sang_man_lich_cua_sale_A5_khong_co_tab_Tim_phong", async () => {
  expect(manSauChonVai("sale")).toBe(DUONG.LICH_SALE);
  expect(manSauChonVai("chu_nha")).toBe(DUONG.LICH);
  expect(manSauPhien({ id: "x", vai_chon: "sale", dong_y_dieu_khoan_luc: "" })).toBe(DUONG.LICH_SALE);
  const a3 = html(<NoiDungA3 vai="sale" dangLuu={false} onChon={khong} onTiepTuc={khong} />);
  expect(a3).toMatch(/the-vai the-vai--chon"[^>]*data-vai="sale"/);
  // Sale chưa có nguồn phòng: lịch rỗng, A5
  banThu.xoaSach();
  await postPhien();
  const a5 = html(<NoiDungA5 onXinLich={khong} onThemThuCong={khong} />);
  expect(chu(a5)).toContain("Chưa có nguồn phòng");
  expect(nut(a5)).toEqual(["Gửi tin nhắn xin lịch đến chủ nhà", "Thêm căn thủ công"]);
  expect(chu(a5)).toContain("Chủ nhà đã gửi link?");
  const tab = html(<NoiDungThanhTab dangO={DUONG.LICH_SALE} vai="sale" onChon={khong} />);
  expect(nut(tab)).toEqual(["Lịch", "Căn", "Thống kê", "Cá nhân"]);
  expect(nut(tab)).not.toContain("Tìm phòng");
  expect(nut(html(<NoiDungThanhTab dangO={DUONG.LICH} vai="chu_nha" onChon={khong} />))).toEqual(["Lịch", "Căn", "Sale", "Thống kê", "Cá nhân"]);
});

const s1 = (l: LichSale = lich) => html(<NoiDungS1 lich={l} hom="2026-10-07" onDoiTuan={khong} onChuaLam={khong} />);

test("test_YC5_1_NT2_US6_KB12_S1_thanh_7_ngay_ky_hieu_Kin_o_B1_B5_va_gia_o_ngay_tra", () => {
  const s = s1();
  const c = chu(s);
  expect(c).toContain("7 ngày tới · 07/10 → 13/10");
  expect(c).toContain("Theo tên");
  expect(c).toContain("Tìm phòng trống theo ngày");
  expect(c).toContain("Nguồn phòng · 4");
  expect(c).not.toContain("Căn của tôi"); // US16
  expect(s).toContain('aria-label="7 ngày trước"');
  expect(s).toContain('aria-label="7 ngày sau"');
  // Đầu cột: Nay 07, T5 08 ... T3 13
  expect(chu(s.slice(s.indexOf("s1-hang--dau"), s.indexOf("s1-nhom")))).toContain("Nay||07");
  const hang = (ten: string) => {
    const i = s.indexOf(`data-can="${ten}"`);
    return [...s.slice(i).matchAll(/data-trang-thai="(\w+)">([^<]*)</g)].map((m) => m[2]).slice(0, 7);
  };
  const r = hang("ICON40 1509");
  expect(r).toHaveLength(7);
  expect(r.slice(3, 5)).toEqual(["Kín", "Kín"]); // 10/10, 11/10 (B1)
  expect(r[5]).not.toBe("Kín"); // 12/10 ngày trả của B1
  expect(r[6]).toBe("Kín"); // 13/10 (B5)
  expect(r[0]).toMatch(/\d/); // 07/10 có giá
  expect(r[1]).toMatch(/\d/);
  expect(r[2]).toMatch(/\d/);
  expect(r[5]).toMatch(/\d/);
});

test("test_YC5_1_buoc_4_US6_S1_chu_thich_hom_nay_kin_hoi_dat_phong_ban_da_ghi_va_cau_gia", () => {
  const c = chu(s1());
  for (const t of ["Hôm nay", "Kín", "Căn tự nhập: gọi chủ hỏi", "Đặt phòng bạn đã ghi", "Số là giá đêm của bạn · chạm căn để xem"]) {
    expect(c).toContain(t);
  }
});

test("test_YC5_1_buoc_1_US6_S1_hang_can_ghi_ten_toa_chu_nha_va_so_phong_ngu", () => {
  const c = chu(s1());
  expect(c).toContain("ICON40 1509");
  expect(c).toContain("Chị Hoa · 2PN");
  expect(c).toContain("Sapphire 1103");
  expect(c).toContain("Anh Tuấn · 3PN");
  expect(c).toContain("À La Carte 2208");
});

test("test_YC5_1_buoc_5_US6_S1_tuan_khac_khong_ghi_7_ngay_toi", async () => {
  const tuanSau = await getSaleLich({ tu: "2026-10-14" });
  const c = chu(s1(tuanSau));
  expect(c).toContain("7 ngày · 14/10 → 20/10");
  expect(c).not.toContain("7 ngày tới");
  expect(c).not.toContain("Nay|");
});

test("test_YC5_1_NT3_US6_o_ngay_ky_hieu_Kin_gia_ngan_hoi_va_Ban_khong_bao_gio_ghi_trong_cho_can_tu_nhap", () => {
  expect(chuO({ ngay: "2026-10-10", trang_thai: "kin" })).toBe("Kín");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "trong", gia_ban: 1100000 })).toBe("1,1tr");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "trong", gia_ban: 750000 })).toBe("750k");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "trong", gia_ban: null })).toBe("—");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "chua_biet" })).toBe("?");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "cua_ban" })).toBe("Bạn");
  expect(chuO({ ngay: "2026-10-08", trang_thai: "chua_biet" })).not.toMatch(/rống/);
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì ô trống không có số tiền".
test("test_PQ5_SALE_US6_S1_EN53_o_trong_luon_co_gia_ban_giao_dien_chi_hien_cai_server_gui", async () => {
  const l = await getSaleLich({ tu: "2026-10-07" });
  const s = s1(l);
  const i = s.indexOf('data-can="ICON40 1509"');
  const hang = s.slice(i, s.indexOf('data-can="', i + 10));
  expect(chu(hang)).toMatch(/\d+k|\dtr/);
  expect(chu(hang)).toContain("Kín");
});

test("test_CLAUDE_md_US6_chu_toi_thieu_14px_va_vung_bam_44px_trong_cac_man_moi", () => {
  const tat = [
    html(<NoiDungA1Link tenChuNha="Anh Tuấn" soCan={2} dangVao={false} loi={null} onBatDau={khong} onMo={khong} />),
    html(<NoiDungA1LinkLoi dangVao={false} onVaoApp={khong} />),
    html(<NoiDungA10 xem={xem} dangLuu={false} loi={null} onThem={khong} />),
    html(<NoiDungA1001 xem={xem} onXemLich={khong} />),
    html(<NoiDungA5 onXinLich={khong} onThemThuCong={khong} />),
    s1(),
  ].join("");
  for (const m of tat.matchAll(/font-size:\s*(\d+)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(14);
  for (const m of tat.matchAll(/font:\s*var\(--text-([a-z-]+)\)/g)) expect(m[1]).not.toBe("");
  expect(homNay()).toBe("2026-10-07");
});

test("test_QD22_US6_ban_thu_co_nut_nap_sale_mau_o_man_sale_va_van_khong_nap_du_lieu_chu_nha", () => {
  const s = html(<NoiDungBanThu vaiSale onNapMau={khong} onXoaSach={khong} onNapSale={khong} />);
  expect(chu(s)).toContain("Nạp sale mẫu: Sale Hùng");
  expect(chu(s)).toContain("Nạp sale mẫu: người mới, mở link của Anh Tuấn");
  expect(chu(s)).not.toContain("Nạp dữ liệu mẫu");
});

const dangNgangSau = (dau: boolean, ds: SuKienXoay[]) => ds.reduce(suKienXoay, dau);

// US6-NT13 · nút "Xoay ngang" S1-05 (xoay giả theo SK9)
const s1Xoay = (xoay: boolean) =>
  html(<NoiDungS1 lich={lich} hom="2026-10-07" onDoiTuan={khong} onChuaLam={khong} xoay={xoay} onXoay={khong} />);

test("test_YC5_1_NT5_US6_KB16_S1_co_nut_Xoay_ngang_cung_hang_Theo_ten_va_khong_noi_khong_che_bang", () => {
  const s = s1Xoay(false);
  expect(nut(s)).toContain("Xoay ngang");
  expect(nut(s)).not.toContain("Xoay dọc");
  const hang = s.slice(s.indexOf("s1-thanh__nut"), s.indexOf("s1-bang"));
  expect(nut(hang)).toEqual(["Theo tên", "Xoay ngang"]);
  expect(s.indexOf("7 ngày tới")).toBeLessThan(s.indexOf("s1-thanh__nut"));
  expect(s).not.toMatch(/position:\s*fixed/);
  expect(s).not.toContain("s1-bang--ngang");
  expect(nut(s1())).not.toContain("Xoay ngang");
});

test("test_YC5_1_NT5_US6_KB16_S1_05_bam_Xoay_ngang_ra_bang_rong_hon_co_nut_Xoay_doc_va_khong_co_thanh_tab", () => {
  expect(dangNgangSau(false, ["bam-xoay-ngang"])).toBe(true);
  const s = s1Xoay(true);
  expect(nut(s)).toContain("Xoay dọc");
  expect(nut(s)).not.toContain("Xoay ngang");
  expect(s).toContain("s1-bang--ngang");
  expect(chu(s)).toContain("Lịch phòng");
  expect(s).not.toContain("hh-tabbar");
  const k = kichThuocKhungXoay(390, 844);
  expect(k.canQuay).toBe(true);
  expect(k.style.width).toBe(844);
  expect(k.style.height).toBe(390);
  expect(k.style.transform).toBe("translateX(390px) rotate(90deg)");
  expect(kichThuocKhungXoay(844, 390).canQuay).toBe(false);
  expect(kichThuocKhungXoay(844, 390).style.transform).toBeUndefined();
});

test("test_YC5_1_NT5_US6_KB16_S1_bam_Xoay_doc_tro_lai_chieu_doc", () => {
  expect(dangNgangSau(false, ["bam-xoay-ngang", "bam-xoay-doc"])).toBe(false);
  expect(nut(s1Xoay(false))).toContain("Xoay ngang");
});

test("test_YC5_1_NT5_US6_KB16_nghieng_may_hay_doi_cua_so_khong_lam_xoay", () => {
  expect(dangNgangSau(false, ["doi-huong-may", "doi-kich-thuoc", "doi-huong-may"])).toBe(false);
  expect(dangNgangSau(true, ["doi-huong-may", "doi-kich-thuoc"])).toBe(true);
});
