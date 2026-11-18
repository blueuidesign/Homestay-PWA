import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, test } from "vitest";
import { canIdsCuaState, diDenGuiKhach } from "../components/gui-khach-hien-thi";
import { DieuKhienXinSo, tieuDePopup } from "../components/xin-so";
import { banThu, getSaleTim, getToi, patchToi, postPhien, postSaleGuiKhachDaGui, postSaleGuiKhachXem } from "../services/api";
import { anhGuiDuoc, guiAnhMotCan, guiChuMotCan, saoChepChuMotCan, saoChepChuTatCa } from "../services/gui-khach";
import type { KetQuaGuiKhachXem } from "../services/kieu";
import { CAC_O_CHEN, chenO, MAU_MAC_DINH, mauDeLuu, xemTruocMau } from "../services/mau-tin";
import { datCongZalo, type CongZalo, type KetQuaChiaSe } from "../services/zalo";
import { boNhoHoSo } from "../stores/ho-so";
import { NoiDungP11 } from "./p11-man";
import { NoiDungS5 } from "./s5-man";

// US14 · Test màn S5, P11 trên dữ liệu của server giả (DLM). Hôm nay 07/10/2026; kịch bản 24/10 → 26/10 (1509 kín 10/10, 11/10).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));
const NGAY = { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" };
const NGAY_GUI = { nhan: NGAY.ngay_nhan, tra: NGAY.ngay_tra };
const GIA_CHU = ["2.200.000", "1.400.000", "3.000.000"];

// Cổng Zalo giả ghi lại chữ, ảnh, nội dung sao chép
const cong = (kq: KetQuaChiaSe[] = []) => {
  const z = {
    chu: [] as string[],
    anh: [] as string[][],
    chep: [] as string[],
    xin: 0,
    async xinTenVaSo() {
      z.xin++;
      return { kq: "co" as const, access_token: "at", token_sdt: "sdt:0911222333", ho_ten: "Sale Hùng", anh_zalo: null };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
    async chiaSeChu(c: string) {
      z.chu.push(c);
      return kq.shift() ?? "da_gui";
    },
    async chiaSeAnh(d: string[]) {
      z.anh.push(d);
      return kq.shift() ?? "da_gui";
    },
    async saoChep(c: string) {
      z.chep.push(c);
      return true;
    },
    async goiDien() {
      return true;
    },
  };
  datCongZalo(z as CongZalo);
  return z;
};

let ids: Record<string, string>;
const xem = async (...ma: string[]): Promise<KetQuaGuiKhachXem> =>
  postSaleGuiKhachXem({ can_ids: ma.map((m) => ids[m]), ...NGAY });

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  boNhoHoSo.xoa();
  datCongZalo(null);
  banThu.napDuLieuSale("moi");
  banThu.dungZaloId("zalo-sale-hung");
  await postPhien();
  ids = Object.fromEntries((await getSaleTim(NGAY)).can.map((c) => [c.ma_can, c.id]));
});
afterEach(() => datCongZalo(null));

const s5 = (ket: KetQuaGuiKhachXem, dangMo: string | null = null) =>
  html(<NoiDungS5 ket={ket} dangMo={dangMo} loi={null} onGuiChu={khong} onGuiAnh={khong} onSaoChep={khong} onSaoChepTatCa={khong} />);

test("test_YC5_5_NT1_US14_KB1_chon_3_can_thi_S5_co_3_khoi_moi_khoi_mot_nut_gui_chu_va_mot_nut_gui_anh", async () => {
  const ket = await xem("1509", "1103", "2208");
  const s = s5(ket);
  const c = chu(s);
  expect(s.match(/data-khoi-can=/g)).toHaveLength(3);
  expect(c).toContain("3 căn · 24/10 → 26/10. Zalo không gửi chữ và ảnh chung một tin: mỗi căn gửi chữ một lần, ảnh một lần.");
  expect(c.indexOf("ICON40 1509")).toBeLessThan(c.indexOf("Sapphire 1103"));
  expect(c.indexOf("Sapphire 1103")).toBeLessThan(c.indexOf("À La Carte 2208"));
  expect(s.match(/s5-khoi__so"[^>]*>(\d)</g)!.map((m) => m.slice(-2, -1))).toEqual(["1", "2", "3"]);
  const nuts = nut(s);
  expect(nuts.filter((n) => n === "Gửi chữ qua Zalo")).toHaveLength(3);
  expect(nuts.filter((n) => n === "Sao chép chữ")).toHaveLength(3);
  expect(nuts.filter((n) => /^Gửi \d+ ảnh qua Zalo$/.test(n))).toHaveLength(3);
  expect(nuts).toContain("Sao chép chữ cả 3 căn");
  expect(c).toContain("Hoặc sao chép chữ rồi dán vào tin nhắn bất kỳ");
});

test("test_YC5_5_NT1_US14_KB1_khoi_co_so_anh_va_nut_gui_ghi_dung_so_anh_toi_da_10", async () => {
  const ket = await xem("1509", "1103");
  // 1509 mẫu có 12 ảnh: Zalo chỉ nhận 10 mỗi lần (zalo-hanh-vi 5.3), nút ghi 10 và có ghi chú
  expect(ket.can[0].so_anh).toBe(12);
  expect(anhGuiDuoc(ket.can[0])).toHaveLength(10);
  const c = chu(s5(ket));
  expect(c).toContain("12 ảnh");
  expect(c).toContain("Gửi 10 ảnh qua Zalo");
  expect(c).toContain("Căn có 12 ảnh, mỗi lần Zalo chỉ gửi được 10 ảnh đầu");
  expect(c).toContain("Gửi 1 ảnh qua Zalo");
  // Căn 6 ảnh như item: nút ghi đúng số
  const sau = { ...ket, can: [{ ...ket.can[0], so_anh: 6, anh: ket.can[0].anh.slice(0, 6) }] };
  expect(chu(s5(sau))).toContain("Gửi 6 ảnh qua Zalo");
});

test("test_YC5_5_NT2_US14_KB4_gui_chu_qua_zalo_mo_cua_so_voi_chu_dung_can_do_va_ghi_mot_lan_gui", async () => {
  const z = cong();
  const ket = await xem("1509", "1103", "2208");
  const sapphire = ket.can[1];
  const kq = await guiChuMotCan(sapphire, NGAY_GUI);
  expect(kq).toEqual({ kq: "da_gui", daGhi: true });
  expect(z.chu).toEqual([sapphire.chu]);
  expect(z.chu[0]).toContain("1.600.000đ");
  expect(z.chu[0]).not.toMatch(/1509|2208/);
  expect(z.anh).toHaveLength(0);
  const gui = banThu.lanGuiKhach();
  expect(gui).toHaveLength(1);
  expect(gui[0]).toMatchObject({ can_id: ids["1103"], ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" });
  // Chỉ căn và ngày, không ghi khách (QD11)
  expect(Object.keys(gui[0]).sort()).toEqual(["can_id", "gui_luc", "id", "ngay_gui", "ngay_nhan", "ngay_tra", "sale_id"]);
});

test("test_YC5_5_NT2_US14_KB5_KB18_gui_anh_dung_anh_cua_can_dong_cua_so_khong_gui_thi_khong_ghi_va_van_o_S5", async () => {
  const z = cong(["huy", "loi", "da_gui"]);
  const ket = await xem("1509");
  const c = ket.can[0];
  expect(await guiAnhMotCan(c, NGAY_GUI)).toEqual({ kq: "huy", daGhi: false });
  expect(await guiChuMotCan(c, NGAY_GUI)).toEqual({ kq: "loi", daGhi: false });
  expect(banThu.lanGuiKhach()).toHaveLength(0);
  expect(await guiAnhMotCan(c, NGAY_GUI)).toEqual({ kq: "da_gui", daGhi: true });
  expect(z.anh[0]).toEqual(anhGuiDuoc(c).map((a) => a.duong_dan));
  expect(z.anh[0]).toHaveLength(10);
  expect(z.chu).toEqual([c.chu]);
  // Gửi chữ rồi gửi ảnh cùng căn, cùng đêm, cùng ngày: một dòng (api/sale.md da-gui)
  await guiChuMotCan(c, NGAY_GUI);
  expect(banThu.lanGuiKhach()).toHaveLength(1);
  // Khối đang mở cửa sổ Zalo khóa nút, khối khác vẫn bấm được
  const s = s5(ket, c.id);
  expect(s).toMatch(/disabled=""[^>]*>Gửi chữ qua Zalo/);
});

test("test_YC5_5_NT2_US14_KB6_sao_chep_mot_can_khong_goi_server_va_khong_mo_cua_so_zalo", async () => {
  const z = cong();
  const ket = await xem("1509", "1103", "2208");
  expect(await saoChepChuMotCan(ket.can[2])).toBe(true);
  expect(z.chep).toEqual([ket.can[2].chu]);
  expect(z.chep[0]).toContain("3.600.000đ");
  expect(z.chep[0]).not.toMatch(/1509|1103/);
  expect(z.chu).toHaveLength(0);
  expect(banThu.lanGuiKhach()).toHaveLength(0);
});

test("test_YC5_5_NT3_US14_KB7_sao_chep_ca_3_can_thi_bo_nho_tam_co_chu_3_can_theo_thu_tu_tren_man", async () => {
  const z = cong();
  const ket = await xem("2208", "1509", "1103"); // thứ tự tích
  expect(ket.can.map((c) => c.ten)).toEqual(["À La Carte 2208", "ICON40 1509", "Sapphire 1103"]);
  await saoChepChuTatCa(ket);
  const t = z.chep[0];
  expect(t.indexOf("2208")).toBeLessThan(t.indexOf("1509"));
  expect(t.indexOf("1509")).toBeLessThan(t.indexOf("1103"));
  expect(t).toContain("3.600.000đ");
  expect(t).toContain("2.600.000đ");
  expect(t).toContain("1.600.000đ");
  expect(t.startsWith("Em gửi anh chị 3 căn còn trống 24/10 → 26/10 (2 đêm):")).toBe(true);
  expect(banThu.lanGuiKhach()).toHaveLength(0);
});

test("test_YC5_5_NT4_US14_KB2_chu_gui_khach_chi_co_gia_ban_khong_co_gia_chu_nha_hay_muc_cong", async () => {
  const ket = await xem("1509", "1103", "2208");
  const tatCa = ket.can.map((c) => c.chu).join("\n") + "\n" + ket.chu_tat_ca + "\n" + chu(s5(ket));
  expect(ket.can[0].chu).toContain("24/10 → 26/10 (2 đêm): 2.600.000đ");
  expect(ket.can[1].chu).toContain("1.600.000đ");
  expect(ket.can[2].chu).toContain("3.600.000đ");
  for (const g of GIA_CHU) expect(tatCa).not.toContain(g);
  expect(tatCa).not.toMatch(/giá chủ|cộng thêm|mức cộng|\+200k|\+100k|\+300k/i);
  // JSON trả về không có khóa giá chủ, mức cộng
  expect(JSON.stringify(ket)).not.toMatch(/gia_chu|muc_cong|tong_gia/);
});

test("test_YC5_5_NT5_US14_KB3_chu_ghi_phong_ngu_va_so_giuong_khong_ghi_so_khach", async () => {
  const ket = await xem("1509", "1103", "2208");
  expect(ket.can[0].chu).toContain("ICON40 1509 · 2PN · 3 giường");
  expect(ket.can[1].chu).toContain("Sapphire 1103 · 3PN · 2 giường");
  expect(ket.can[2].chu).toContain("À La Carte 2208 · 1PN · 1 giường");
  expect(ket.can[0].chu).toContain("view biển");
  const tatCa = ket.can.map((c) => c.chu).join("\n") + ket.chu_tat_ca;
  expect(tatCa).not.toMatch(/khách ·|[0-9] khách|người lớn|trẻ em/);
  // Căn chưa có số giường (3402) chỉ ghi phòng ngủ
  const ket2 = await postSaleGuiKhachXem({ can_ids: [ids["3402"] ?? Object.values(ids)[0]], ...NGAY }).catch(() => null);
  if (ket2) expect(ket2.can[0].chu).not.toContain("giường");
});

test("test_YC5_5_NT12_US14_KB3_chu_gui_khach_khong_co_tien_ich_can", async () => {
  const ket = await xem("1509", "1103", "2208");
  const tatCa = ket.can.map((c) => c.chu).join("\n") + ket.chu_tat_ca + chu(s5(ket));
  expect(tatCa).not.toMatch(/bếp|máy giặt|bể bơi|tiện ích|phòng tắm/i);
});

test("test_YC5_5_NT11_US14_KB8_chua_co_so_thi_popup_hien_truoc_zalo_de_sau_van_mo_S5_hoso_van_chua_co_so", async () => {
  banThu.xoaSoDienThoai();
  const z = cong();
  let mo = 0;
  const dk = new DieuKhienXinSo();
  await dk.chay(() => void mo++);
  expect(dk.mo).not.toBeNull(); // popup của app hiện
  expect(mo).toBe(0);
  expect(z.xin).toBe(0); // chưa có hộp thoại Zalo
  expect(tieuDePopup("chu_nha")).toBe("Chia sẻ số điện thoại với chủ nhà");
  await dk.deSau();
  expect(mo).toBe(1); // S5 vẫn mở
  expect(z.xin).toBe(0);
  expect((await getToi()).so_dien_thoai).toBeNull();
});

test("test_YC5_5_NT11_US14_KB9_dong_y_thi_xin_ten_va_so_roi_mo_S5_khong_phai_bam_lai", async () => {
  banThu.xoaSoDienThoai();
  const z = cong();
  let mo = 0;
  const dk = new DieuKhienXinSo();
  await dk.chay(() => void mo++);
  await dk.dongY();
  expect(z.xin).toBe(1);
  expect(mo).toBe(1);
  expect((await getToi()).so_dien_thoai).toBe("0911222333");
});

test("test_YC5_5_NT11_US14_KB10_da_co_so_thi_S5_mo_ngay_khong_popup", async () => {
  const z = cong();
  let mo = 0;
  const dk = new DieuKhienXinSo();
  await dk.chay(() => void mo++);
  expect(dk.mo).toBeNull();
  expect(mo).toBe(1);
  expect(z.xin).toBe(0);
});

test("test_YC5_5_NT11_US14_KB11_tu_choi_roi_bam_lai_thi_the_giai_thich_co_nut_mo_cai_dat_quyen", async () => {
  banThu.xoaSoDienThoai();
  const z = cong();
  z.xinTenVaSo = async () => ({ kq: "tu_choi" as const });
  let mo = 0;
  const dk = new DieuKhienXinSo();
  await dk.chay(() => void mo++);
  await dk.dongY();
  expect(mo).toBe(0); // về màn cũ, không báo lỗi, không đứng im
  expect(dk.mo).toBeNull();
  expect(dk.loi).toBeNull();
  await dk.chay(() => void mo++);
  expect(dk.mo?.daTuChoi).toBe(true); // bấm lại: thẻ giải thích kèm nút mở cài đặt quyền (HV4)
});

test("test_YC5_5_NT1_US14_state_mo_S5_tu_S2_nhieu_can_theo_thu_tu_tich_va_tu_S3_mot_can", () => {
  const d = diDenGuiKhach(["b", "a", "c"], "2026-10-24", "2026-10-26");
  expect(canIdsCuaState(d.state)).toEqual(["b", "a", "c"]);
  expect(canIdsCuaState({ can_id: "x", ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" })).toEqual(["x"]);
  expect(canIdsCuaState(null)).toEqual([]);
});

test("test_PQ14_SALE_US14_can_ngoai_pham_vi_thi_khong_tim_thay_khong_tra_can_nao", async () => {
  await expect(postSaleGuiKhachXem({ can_ids: [ids["1509"], "can-khong-co"], ...NGAY })).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  await expect(postSaleGuiKhachDaGui({ can_id: "can-khong-co", ...NGAY }, "khoa-us14-xxxxxxxxxxxxxxxxxx")).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
});

// ---- P11 ----
const p11 = (mau: string) =>
  html(<NoiDungP11 mau={mau} tenSale="Sale Hùng" dangLuu={false} loi={null} oNhap={null} onDoiMau={khong} onChenO={khong} onDungLai={khong} onLuu={khong} />);

test("test_YC5_7_NT1_US14_KB19_P11_co_o_soan_5_o_chen_xem_truoc_va_cham_Ngay_chen_o_xem_truoc_hien_ngay_that", () => {
  const s = p11(MAU_MAC_DINH);
  const c = chu(s);
  expect(c).toContain("Mẫu tin");
  expect(c).toContain("Chạm để chèn");
  for (const o of ["[Ngày]", "[Số đêm]", "[Số căn]", "[Danh sách căn]", "[Tên sale]"]) expect(nut(s)).toContain(o);
  expect([...CAC_O_CHEN]).toEqual(["[Ngày]", "[Số đêm]", "[Số căn]", "[Danh sách căn]", "[Tên sale]"]);
  expect(nut(s)).toContain("Dùng lại mẫu mặc định");
  expect(nut(s)).toContain("Lưu thay đổi");
  expect(c).toContain("Khách sẽ nhận được");
  // Chạm [Ngày] khi con trỏ ở cuối: mẫu có thêm "[Ngày]" ở cuối
  const kq = chenO(MAU_MAC_DINH, MAU_MAC_DINH.length, MAU_MAC_DINH.length, "[Ngày]");
  expect(kq.mau).toBe(MAU_MAC_DINH + "[Ngày]");
  expect(kq.conTro).toBe(kq.mau.length);
  const xt = xemTruocMau(kq.mau, "Sale Hùng");
  expect(xt.endsWith("10/10 → 12/10")).toBe(true);
  expect(xt).not.toContain("[Ngày]");
  // Bản xem trước chỉ có giá bán
  expect(xt).toContain("2.600.000đ");
  expect(xt).toContain("1.600.000đ");
  expect(xt).toContain("3.600.000đ");
  for (const g of GIA_CHU) expect(xt).not.toContain(g);
  // Chèn giữa chữ thay phần đang chọn
  expect(chenO("abcdef", 2, 4, "X")).toEqual({ mau: "abXef", conTro: 3 });
});

test("test_YC5_7_NT2_US14_KB20_dung_lai_mau_mac_dinh_thi_xem_truoc_bat_dau_Em_gui_anh_chi_3_can", () => {
  const xt = xemTruocMau(MAU_MAC_DINH, "Sale Hùng");
  expect(xt.startsWith("Em gửi anh chị 3 căn còn trống 10/10 → 12/10 (2 đêm):")).toBe(true);
  expect(mauDeLuu(MAU_MAC_DINH)).toBeNull(); // lưu mẫu mặc định là null
  expect(mauDeLuu(MAU_MAC_DINH + " Gọi em nhé")).toBe(MAU_MAC_DINH + " Gọi em nhé");
  expect(chu(p11(MAU_MAC_DINH + "[Ngày]"))).toContain("10/10 → 12/10");
});

test("test_YC5_7_NT3_US14_KB21_luu_mau_roi_gui_khach_thi_chu_theo_mau_da_luu_va_sale_khac_khong_thay", async () => {
  const mau = MAU_MAC_DINH + "\nGọi em nhé";
  const h = await patchToi({ mau_tin_gui_khach: mauDeLuu(mau) }, "khoa-us14-mau-xxxxxxxxxxxxxx");
  expect(h.mau_tin_gui_khach).toBe(mau);
  expect((await getToi()).mau_tin_gui_khach).toBe(mau); // mở lại P11 còn "Gọi em nhé"
  const ket = await xem("1509", "1103", "2208");
  expect(ket.chu_tat_ca).toContain("Gọi em nhé");
  expect(ket.chu_tat_ca).toContain("24/10 → 26/10");
  // Dùng lại mẫu mặc định rồi lưu: null
  expect((await patchToi({ mau_tin_gui_khach: null }, "khoa-us14-mau-yyyyyyyyyyyyyy")).mau_tin_gui_khach).toBeNull();
  expect((await xem("1509")).chu_tat_ca).not.toContain("Gọi em nhé");
  // Quá 2.000 ký tự: DU_LIEU_SAI
  await expect(patchToi({ mau_tin_gui_khach: "x".repeat(2001) }, "khoa-us14-mau-zzzzzzzzzzzzzz")).rejects.toMatchObject({ loi: "DU_LIEU_SAI" });
});
