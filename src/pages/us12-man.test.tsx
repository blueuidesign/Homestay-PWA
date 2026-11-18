import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import {
  bat,
  CHU_GHI_CHU_TU_NHAP,
  chuDoTuoi,
  chuGiaCanTim,
  dieuKienTuForm,
  dieuKienTuMuc,
  formTimTrong,
  formTuDieuKien,
  ngayTraCuaForm,
  type FormTim,
  chiaNhomKetQua,
} from "../components/tim-phong-hien-thi";
import { banThu, getSaleTim, getSaleTimGanDay, getSaleTimLichTuan, getToaNha, postPhien } from "../services/api";
import type { CanTim, DieuKienTim, KetQuaTim, LichTuanTim, ToaNha } from "../services/kieu";
import { NoiDungTim } from "./s1-tim-man";
import { NoiDungS200, NoiDungS2, NoiDungS4, ThanhDay } from "./s2-man";

// US12 · Test render S1-02, S1-03, S2, S2-00, S4 trên dữ liệu của server giả (DLM). Hôm nay 07/10/2026.
// Lần tìm 10/10 → 12/10 của DLM.7 là trạng thái ngày 06/10; ngày 07/10 thì 1509 đã kín (B1), nên các kịch bản dùng 24/10 → 26/10.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const dk = (nhan: string, tra: string, them: Partial<DieuKienTim> = {}): DieuKienTim => ({
  ngay_nhan: nhan,
  ngay_tra: tra,
  so_phong_ngu: [],
  loai_view: [],
  toa_nha_id: [],
  ...them,
});
const BAY_GIO = Date.parse("2026-10-07T10:00:00+07:00");

let toa: ToaNha[];
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuSale("moi");
  banThu.dungZaloId("zalo-sale-hung");
  await postPhien();
  toa = await getToaNha();
});

const formTim = (f: FormTim, ganDay: Parameters<typeof NoiDungTim>[0]["ganDay"] = []) =>
  html(<NoiDungTim form={f} onDoi={khong} ganDay={ganDay} dangTaiGanDay={false} toaNha={toa} onChonGanDay={khong} onTim={khong} />);
const nutTim = (s: string) => s.match(/<button[^>]*class="hh-btn[^"]*"[^>]*>[^<]*<\/button>/)![0];

test("test_YC5_2_NT1_US12_KB1_chua_chon_ngay_nhan_thi_nut_tim_mo_va_ghi_Chon_ngay_nhan_de_tim_phong", () => {
  const s = formTim(formTimTrong());
  const c = chu(s);
  expect(c).toContain("Ngày nhận");
  expect(c).toContain("Ngày trả");
  expect(c).toContain("Số đêm:");
  for (const chip of ["1", "2", "3", "4", "Tùy chọn"]) expect(c).toContain(`|${chip}|`);
  const nut = nutTim(s);
  expect(nut).toContain("disabled");
  expect(chu(nut)).toContain("Chọn ngày nhận để tìm phòng");
  expect(chu(nut)).not.toContain("Tìm phòng trống");
  // Nút dính đáy
  expect(s).toContain("thanh-duoi");
  // Chưa có ngày thì chưa có dòng tóm tắt ngày trả
  expect(s).not.toContain("Khách ở");
});

test("test_YC5_2_NT2_US12_KB2_chon_10_10_va_2_dem_thi_ngay_tra_12_10_chip_1_thi_11_10_nut_het_mo", () => {
  const f: FormTim = { ...formTimTrong(), ngayNhan: "2026-10-10", chipDem: 2 };
  expect(ngayTraCuaForm(f)).toBe("2026-10-12");
  expect(ngayTraCuaForm({ ...f, chipDem: 1 })).toBe("2026-10-11");
  expect(ngayTraCuaForm({ ...f, chipDem: 4 })).toBe("2026-10-14");
  const s = formTim(f);
  expect(s).toContain('value="2026-10-12"');
  expect(chu(s)).toContain("Khách ở 10/10 → 12/10 · 2 đêm");
  expect(nutTim(s)).not.toContain("disabled");
  expect(chu(nutTim(s))).toContain("Tìm phòng trống");
  expect(chu(formTim({ ...f, chipDem: 1 }))).toContain("10/10 → 11/10 · 1 đêm");
  // Qua tháng: 30/10 + 3 đêm = 02/11
  expect(ngayTraCuaForm({ ...f, ngayNhan: "2026-10-30", chipDem: 3 })).toBe("2026-11-02");
});

test("test_YC5_2_NT2_US12_KB21_chip_Tuy_chon_cho_chon_ngay_tra_va_tinh_dung_so_dem", () => {
  const f: FormTim = { ...formTimTrong(), ngayNhan: "2026-10-24", chipDem: "tuy_chon", traTuyChon: "2026-10-27" };
  expect(ngayTraCuaForm(f)).toBe("2026-10-27");
  const s = formTim(f);
  expect(chu(s)).toContain("Khách ở 24/10 → 27/10 · 3 đêm");
  // Ô ngày trả sửa được khi Tùy chọn, bị khóa khi chip 1 đến 4
  expect(s.match(/<input[^>]*name="ngay_tra"[^>]*>/)![0]).not.toContain("disabled");
  expect(formTim({ ...f, chipDem: 2 }).match(/<input[^>]*name="ngay_tra"[^>]*>/)![0]).toContain("disabled");
  // Ngày trả không sau ngày nhận thì lấy ngày nhận cộng 1 đêm
  expect(ngayTraCuaForm({ ...f, traTuyChon: "2026-10-20" })).toBe("2026-10-25");
});

test("test_YC5_2_NT5_US12_KB11_loc_them_co_dung_lua_chon_Loai_view_khong_co_Vinh", () => {
  const c = chu(formTim(formTimTrong()));
  expect(c).toContain("Lọc thêm · Không bắt buộc");
  for (const chip of ["1PN", "2PN", "3PN", "4PN+"]) expect(c).toContain(`|${chip}|`);
  expect(c).not.toContain("Studio");
  const view = formTim(formTimTrong()).match(/aria-label="Loại view"[^>]*>(.*?)<\/div>/)![1];
  expect(chu(view).split("|").filter(Boolean)).toEqual(["Biển", "Thành phố", "Núi"]);
  expect(c).not.toContain("Vịnh");
  // Tòa nhà từ GET /toa-nha không có q (ICON40, À La Carte, Sapphire); chip "Khác" chưa làm [MỞ: câu hỏi 6]
  const toaChip = formTim(formTimTrong()).match(/aria-label="Tòa nhà"[^>]*>(.*?)<\/div>/)![1];
  expect(chu(toaChip).split("|").filter(Boolean).sort()).toEqual(["ICON40", "Sapphire", "À La Carte"].sort());
});

test("test_YC5_2_NT4_US12_KB9_chon_dong_Tim_gan_day_thi_dieu_kien_duoc_dien_san", async () => {
  await getSaleTim(dk("2026-10-24", "2026-10-26"));
  const sapphire = toa.find((t) => t.ten === "Sapphire")!;
  await getSaleTim(dk("2026-10-18", "2026-10-20", { so_phong_ngu: [3], toa_nha_id: [sapphire.id] }));
  const { muc } = await getSaleTimGanDay();
  // Mới nhất ở trên
  const s = formTim(formTimTrong(), muc);
  const c = chu(s);
  expect(c).toContain("Tìm gần đây");
  expect(c.indexOf("18/10 → 20/10 · 3PN · Sapphire")).toBeGreaterThan(-1);
  expect(c.indexOf("18/10 → 20/10 · 3PN · Sapphire")).toBeLessThan(c.indexOf("24/10 → 26/10"));
  // Chạm dòng 18/10 → 20/10: ngày, số đêm, 3PN và Sapphire đã chọn sẵn
  const dien = formTuDieuKien(dieuKienTuMuc(muc[0]).dk);
  expect(dien).toMatchObject({ ngayNhan: "2026-10-18", chipDem: 2, phong: [3], toa: [sapphire.id] });
  const sd = formTim(dien, muc);
  expect(chu(sd)).toContain("Khách ở 18/10 → 20/10 · 2 đêm");
  expect(sd).toMatch(/aria-pressed="true"[^>]*>3PN</);
  expect(sd).toMatch(/aria-pressed="true"[^>]*>Sapphire</);
  expect(dieuKienTuForm(dien)).toEqual(muc[0] && dieuKienTuMuc(muc[0]).dk);
});

test("test_YC5_2_US12_bat_tat_chip_loc_them", () => {
  expect(bat([2], 3)).toEqual([2, 3]);
  expect(bat([2, 3], 2)).toEqual([3]);
});

// Kết quả 24/10 → 26/10 của Hùng, thêm một căn của tôi và một căn tự nhập để xem nhóm (US16 chưa có trên server giả)
const canCuaToi = (them: Partial<CanTim> = {}): CanTim => ({
  id: "cua-toi-1",
  ma_can: "Villa Tuần Châu",
  toa_nha: null,
  nhom: "tu_nhap",
  so_phong_ngu: 3,
  so_giuong: null,
  loai_view: null,
  ten_chu_can: "Chú Bình",
  khong_co_lich: true,
  tong_gia_chu: 2800000,
  tong_gia_ban: 3200000,
  ...them,
});
const manS2 = (ket: KetQuaTim, d: DieuKienTim, chon: string[] = []) =>
  html(
    <NoiDungS2 ket={ket} dk={d} tenToa={{}} chon={chon} bayGio={Date.now()} onTich={khong} onMoCan={khong} onChe={khong} onSua={khong} onGui={khong} />,
  );

test("test_YC5_3_NT1_US12_KB3_nhom_CUA_TOI_nam_tren_NGUON_PHONG_the_co_hai_gia_chu_nha_va_ban", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const kq = await getSaleTim(d);
  const ket: KetQuaTim = { ...kq, can: [...kq.can, canCuaToi()] };
  const s = manS2(ket, d);
  const c = chu(s);
  expect(c).toContain("24/10 → 26/10");
  expect(c).toContain("2 đêm");
  expect(c).toContain("4 căn trống"); // căn tự nhập không đếm
  expect(c).toContain("Danh sách");
  expect(c).toContain("Lịch tuần");
  expect(c).toContain("Theo tên");
  expect(c).toContain("Sửa");
  // Đổi theo quyết định Tùng 04/11/2026 (Phương án tách): căn tự nhập không nằm dưới "Của tôi"
  expect(c).not.toContain("Của tôi");
  expect(c.indexOf("Nguồn phòng · 4")).toBeGreaterThan(-1);
  expect(c.indexOf("Nguồn phòng · 4")).toBeLessThan(c.indexOf("Tự nhập · chưa biết lịch · 1"));
  expect(c.indexOf("Tự nhập · chưa biết lịch · 1")).toBeLessThan(c.indexOf("Villa Tuần Châu"));
  // Nhóm nguồn phòng có đủ 4 căn
  const nguon = c.slice(c.indexOf("Nguồn phòng · 4"), c.indexOf("Tự nhập · chưa biết lịch"));
  for (const ten of ["ICON40 1509", "3402", "Sapphire 1103", "À La Carte 2208"]) expect(nguon).toContain(ten);
  // DLM.7: giá chủ nhà 2.200.000đ, giá bán của Hùng 2.600.000đ; 2PN, Chị Hoa
  const the1509 = s.match(/<div class="kq-the[^"]*" data-can="ICON40 1509".*?<\/button><\/div>/)![0];
  expect(chu(the1509)).toContain("2.200.000đ · bạn bán 2.600.000đ");
  expect(chu(the1509)).toContain("2PN");
  expect(chu(the1509)).toContain("Chị Hoa");
  expect(chu(the1509)).toContain("Lịch cập nhật 2 giờ trước");
});

test("test_YC5_3_NT1_US12_KB3_nhom_TU_NHAP_tach_rieng_thu_tu_CUA_TOI_NGUON_PHONG_TU_NHAP_hien_dau_hoi_va_tich_chon_van_duoc", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const kq = await getSaleTim(d);
  const ket: KetQuaTim = { ...kq, can: [...kq.can, canCuaToi(), canCuaToi({ id: "cua-toi-2", ma_can: "Căn riêng", nhom: "cua_toi", khong_co_lich: false })] };
  const nhom = chiaNhomKetQua(ket.can);
  expect(nhom.cuaToi.map((x) => x.id)).toEqual(["cua-toi-2"]);
  expect(nhom.tuNhap.map((x) => x.id)).toEqual(["cua-toi-1"]);
  expect(nhom.nguon).toHaveLength(4);
  const s = manS2(ket, d, ["cua-toi-1"]);
  const c = chu(s);
  expect(c.indexOf("Của tôi · 1")).toBeLessThan(c.indexOf("Nguồn phòng · 4"));
  expect(c.indexOf("Nguồn phòng · 4")).toBeLessThan(c.indexOf("Tự nhập · chưa biết lịch · 1"));
  expect(c.indexOf("Của tôi · 1")).toBeLessThan(c.indexOf("Căn riêng"));
  expect(c.indexOf("Căn riêng")).toBeLessThan(c.indexOf("Nguồn phòng · 4"));
  expect(c.indexOf("Tự nhập · chưa biết lịch · 1")).toBeLessThan(c.indexOf("Villa Tuần Châu"));
  expect(c).toContain("4 căn trống"); // căn tự nhập không đếm
  expect(c).toContain("Đã chọn 1 căn"); // tích chọn căn tự nhập vẫn hoạt động
  const the = s.match(/<div class="kq-the[^"]*" data-can="Villa Tuần Châu".*?<\/button><\/div>/)![0];
  expect(chu(the)).not.toMatch(/trống|Trống/);
  // Không có căn tự nhập thì không có nhóm
  expect(chu(manS2(kq, d))).not.toContain("Tự nhập · chưa biết lịch");
});

test("test_YC5_3_NT1_US12_KB21_tim_3_dem_the_1509_ghi_3_100_000_va_ban_3_700_000", async () => {
  const d = dk("2026-10-24", "2026-10-27");
  const kq = await getSaleTim(d);
  expect(chuGiaCanTim(kq.can.find((x) => x.ma_can === "1509")!)).toBe("3.100.000đ · bạn bán 3.700.000đ");
  expect(chu(manS2(kq, d))).toContain("3 đêm");
});

test("test_YC5_3_NT4_US12_KB5_can_tu_nhap_ghi_khong_co_lich_goi_chu_Binh_hoi_khong_co_chu_trong", () => {
  const c = canCuaToi();
  expect(chuDoTuoi(c, BAY_GIO)).toBe("Tự nhập · không có lịch, gọi chú Bình hỏi");
  const ket: KetQuaTim = { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26", so_dem: 2, so_can_trong: 0, can: [c], goi_y: [] };
  const the = manS2(ket, dk("2026-10-24", "2026-10-26")).match(/<div class="kq-the[^"]*" data-can="Villa Tuần Châu".*?<\/button><\/div>/)![0];
  const t = chu(the);
  expect(t).toContain("Tự nhập · không có lịch, gọi chú Bình hỏi");
  expect(t).not.toMatch(/trống|Trống|Lịch cập nhật|luôn đúng/);
  // Không có tên chủ căn thì gọi chủ nhà
  expect(chuDoTuoi(canCuaToi({ ten_chu_can: undefined }), BAY_GIO)).toBe("Tự nhập · không có lịch, gọi chủ nhà hỏi");
  // Căn của tôi có lịch của mình
  expect(chuDoTuoi(canCuaToi({ nhom: "cua_toi", khong_co_lich: false }), BAY_GIO)).toBe("Lịch của bạn, luôn đúng");
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì thẻ không có số tiền nào".
test("test_PQ5_SALE_PQ11_SALE_US12_KB15_EN53_the_va_o_ngay_can_moi_chu_nha_deu_co_gia", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const kq = await getSaleTim(d);
  const s = manS2(kq, d);
  const the = (ten: string) => s.match(new RegExp(`<div class="kq-the[^"]*" data-can="${ten}".*?</button></div>`))![0];
  for (const ten of ["Sapphire 1103", "À La Carte 2208", "ICON40 1509"]) expect(chu(the(ten))).toMatch(/\d\.\d{3}\.\d{3}đ · bạn bán \d\.\d{3}\.\d{3}đ/);
  expect(chu(the("ICON40 1509"))).toContain("2.200.000đ");
  const lt = await getSaleTimLichTuan(d);
  const hang = html(
    <NoiDungS4 lich={lt} dk={d} tenToa={{}} chon={[]} onTich={khong} onChe={khong} onSua={khong} onGui={khong} />,
  ).match(/<div class="s1-hang" data-can="Sapphire 1103".*?<\/div><\/div>(?=<div class="s1-hang"|<\/div><div class="s1-chu-thich")/s);
  expect(hang).toBeTruthy();
  const o = [...hang![0].matchAll(/<div class="s1-o[^"]*"[^>]*>([^<]*)<\/div>/g)].map((m) => m[1]);
  expect(o).toHaveLength(7);
  expect(o.some((x) => /\d/.test(x))).toBe(true); // ô trống có số tiền
});

test("test_YC5_3_NT2_US12_KB6_tich_3_can_thi_thanh_day_ghi_Da_chon_3_can_va_nut_Gui_cho_khach_dung_duoc", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const kq = await getSaleTim(d);
  const ids = kq.can.map((x) => x.id);
  const s = manS2(kq, d, ids.slice(0, 3));
  expect(chu(s)).toContain("Đã chọn 3 căn");
  const nut = s.match(/<div class="thanh-duoi kq-day">.*?<\/div>/)![0];
  expect(chu(nut)).toContain("Gửi cho khách");
  expect(nut).not.toContain("disabled");
  // Bỏ một căn thì còn 2; chưa tích thì không có thanh đáy
  expect(chu(manS2(kq, d, ids.slice(0, 2)))).toContain("Đã chọn 2 căn");
  expect(manS2(kq, d, [])).not.toContain("Đã chọn");
  expect(html(<ThanhDay soChon={0} onGui={khong} />)).toBe("");
  // Dấu tích: đúng 3 thẻ aria-checked true
  expect(s.match(/aria-checked="true"/g)).toHaveLength(3);
  // Vùng bấm dấu tích 44 px
  expect(bat(ids.slice(0, 3), ids[0])).toHaveLength(2);
});

test("test_YC5_3_NT3_US12_KB7_lich_tuan_cung_tap_can_cung_dieu_kien_to_dem_khach_hoi_hang_tu_nhap_chi_co_dau_hoi", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const kq = await getSaleTim(d);
  const lt = await getSaleTimLichTuan(d);
  const s4 = html(<NoiDungS4 lich={lt} dk={d} tenToa={{}} chon={[]} onTich={khong} onChe={khong} onSua={khong} onGui={khong} />);
  const c = chu(s4);
  expect(c).toContain("24/10 → 26/10");
  expect(c).not.toContain("2 đêm"); // S4 chỉ ghi khoảng ngày, không số khách
  expect(c).not.toMatch(/khách ·|\d khách/);
  expect(c).toContain(`${kq.so_can_trong} căn trống`);
  // Cùng các căn với Danh sách, cùng thứ tự
  const hangS4 = [...s4.matchAll(/<div class="s1-hang" data-can="([^"]+)"/g)].map((m) => m[1]);
  const theS2 = [...manS2(kq, d).matchAll(/data-can="([^"]+)" data-nhom/g)].map((m) => m[1]);
  expect(hangS4).toEqual(theS2);
  // Cột 24/10, 25/10 được tô "Đêm khách hỏi"
  expect([...s4.matchAll(/data-dem-khach-hoi="true"/g)]).toHaveLength(2);
  expect(c).toContain("Đêm khách hỏi");
  expect(c).toContain("Kín");
  // Căn tự nhập chỉ có "?"
  const tuNhap: LichTuanTim = {
    ...lt,
    can: [
      {
        id: "tn",
        ma_can: "Villa Tuần Châu",
        toa_nha: null,
        nhom: "tu_nhap",
        loai: "tu_nhap",
        so_phong_ngu: 3,
        o: lt.ngay.map((n) => ({ ngay: n, trang_thai: "chua_biet" as const })),
      },
    ],
  };
  const hang = html(<NoiDungS4 lich={tuNhap} dk={d} tenToa={{}} chon={[]} onTich={khong} onChe={khong} onSua={khong} onGui={khong} />);
  expect(hang.match(/data-trang-thai="chua_biet"/g)).toHaveLength(7);
  expect(chu(hang.match(/<div class="s1-hang" data-can="Villa.*?<\/div><\/div><\/div>/s)![0])).not.toContain("Trống");
});

test("test_YC5_3_NT2_US12_S4_chon_hang_ghi_dau_tich_va_thanh_day", async () => {
  const d = dk("2026-10-24", "2026-10-26");
  const lt = await getSaleTimLichTuan(d);
  const s4 = html(<NoiDungS4 lich={lt} dk={d} tenToa={{}} chon={[lt.can[0].id, lt.can[1].id]} onTich={khong} onChe={khong} onSua={khong} onGui={khong} />);
  expect(chu(s4)).toContain("Đã chọn 2 căn");
  expect(s4.match(/aria-pressed="true"[^>]*data-can|data-can="[^"]*"[^>]*aria-pressed="true"/g)).toHaveLength(2);
});

test("test_YC5_2_NT3_US12_KB8_khong_co_can_trong_thi_S2_00_co_goi_y_kem_so_can_trong_va_nut_Sua_tim_kiem", async () => {
  const d = dk("2026-10-18", "2026-10-20", { so_phong_ngu: [3] });
  const kq = await getSaleTim(d);
  expect(kq.can).toEqual([]);
  const s = html(<NoiDungS200 dk={d} tenToa={{}} goiY={kq.goi_y} onSua={khong} onGoiY={khong} />);
  const c = chu(s);
  expect(c).toContain("Không có căn trống");
  expect(c).toContain("Các căn 3PN đã kín 18/10 → 20/10. Thử một trong các cách sau:");
  expect(c).toContain("Gợi ý");
  expect(c).toContain("Bỏ lọc số phòng ngủ");
  expect(c).toMatch(/Bỏ lọc số phòng ngủ\|\|\d+ căn trống/);
  expect(c).toContain("Sửa tìm kiếm");
  expect(c).toContain(CHU_GHI_CHU_TU_NHAP);
  expect(CHU_GHI_CHU_TU_NHAP).toBe("Căn tự nhập không có lịch tự động. Gọi chủ nhà để hỏi.");
  // Gợi ý đổi ngày đi kèm số căn trống
  const doiNgay = html(
    <NoiDungS200
      dk={dk("2026-10-10", "2026-10-12", { so_phong_ngu: [3] })}
      tenToa={{}}
      goiY={[{ loai: "doi_ngay", dieu_kien: dk("2026-10-11", "2026-10-13", { so_phong_ngu: [3] }), so_can_trong: 3 }]}
      onSua={khong}
      onGoiY={khong}
    />,
  );
  expect(chu(doiNgay)).toContain("Đổi sang 11/10 → 13/10");
  expect(chu(doiNgay)).toContain("3 căn trống");
});

test("test_YC5_3_US12_KB12_KB22_dong_dieu_kien_ghi_ca_loc_so_phong_ngu_va_toa_nha", async () => {
  const ala = toa.find((t) => t.ten === "À La Carte")!;
  const d = dk("2026-10-24", "2026-10-26", { so_phong_ngu: [1], toa_nha_id: [ala.id] });
  const kq = await getSaleTim(d);
  expect(kq.can.map((x) => x.ma_can)).toEqual(["2208"]);
  const c = chu(
    html(<NoiDungS2 ket={kq} dk={d} tenToa={{ [ala.id]: "À La Carte" }} chon={[]} onTich={khong} onMoCan={khong} onChe={khong} onSua={khong} onGui={khong} />),
  );
  expect(c).toContain("24/10 → 26/10 · 1PN · À La Carte · 2 đêm");
});
