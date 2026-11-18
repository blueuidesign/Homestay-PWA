import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { chuToastDaGuiLich, tinGuiLich } from "../components/sale-hien-thi";
import { banThu, getCan, getKetNoi } from "../services/api";
import type { Can, DongKetNoi } from "../services/kieu";
import { CHU_CHUA_CO_SALE, CHU_CHUA_GUI, CHU_CHUA_GUI_PHU, CHU_DE_SAU_CN10, CHU_MO_TA_CN10, NoiDungCN10, saleGuiDuoc, TheGuiLich, type PropsCN10 } from "./cn10-man";

// US26 · Test render CN10, CN10-00, CN10-01 và thẻ "Gửi lịch cho sale" ở tab Lịch, dùng dữ liệu của server giả. Số theo DLM.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

let can: Can[];
let sale: DongKetNoi[];
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.napDuLieuMau(false, true);
  can = (await getCan()).reverse();
  sale = saleGuiDuoc(await getKetNoi());
});

const cn10 = (p: Partial<PropsCN10> = {}) =>
  html(
    <NoiDungCN10
      can={can}
      sale={sale}
      canChon={can.map((c) => c.id)}
      saleChon={[]}
      chuaGui={false}
      dangGui={false}
      loi={null}
      onDoiCan={khong}
      onTatCaCan={khong}
      onDoiSale={khong}
      onTatCaSale={khong}
      onGui={khong}
      onThemSale={khong}
      {...p}
    />,
  );

test("test_YC1_8_buoc_1_2_3_US26_KB1_CN10_hai_buoc_chon_can_chon_sale_va_nut_gui_lich_qua_zalo", () => {
  const s = cn10();
  const c = chu(s);
  expect(c).toContain(CHU_MO_TA_CN10);
  expect(CHU_MO_TA_CN10).toBe("Sale nhận link xem lịch trống/kín và giá của các căn đã chọn. Không thấy tên khách và tiền cọc.");
  expect(c).toContain("Bước 1: Chọn căn");
  expect(c).toContain("Căn · đã chọn 2/2");
  expect(c).toContain("Phòng 1509 · 2PN");
  expect(c).toContain("Phòng 3402 · 1PN"); // DLM ghi 3402 là 1PN, canvas ghi 2PN: theo dữ liệu
  expect(c.indexOf("1509")).toBeLessThan(c.indexOf("3402"));
  expect(c).toContain("Bước 2: Chọn sale để chia sẻ lịch");
  expect(c).toContain("Sale đã lưu · không bắt buộc");
  for (const t of ["Sale Hùng", "Sale Lan", "Sale Minh", "Sale Nga"]) expect(c).toContain(t);
  expect(nut(s)).toContain("Gửi lịch qua Zalo");
  expect(c).toContain("Zalo sẽ mở để bạn chọn người nhận");
  // Không có số điện thoại của sale trong danh sách (GET /ket-noi không trả số, PQ2.CHU)
  expect(c).not.toMatch(/09\d\d|\*\*\*/);
  expect(c).not.toContain("Nhắc lại");
});

test("test_PQ3_CHU_US26_KB2_buoc_1_chi_co_can_cua_chinh_chu_nha", async () => {
  const c = chu(cn10());
  expect(can.map((x) => x.ma_can).sort()).toEqual(["1509", "3402"]);
  expect(c).not.toMatch(/1103|2208|0812|Sapphire|La Carte|Green/);
});

test("test_YC1_8_NT1_US26_KB3_chon_sale_thi_o_chon_sang_va_chu_duoi_nut_noi_so_tin", () => {
  const hung = sale.find((d) => d.ten_hien_thi === "Sale Hùng")!;
  const lan = sale.find((d) => d.ten_hien_thi === "Sale Lan")!;
  const s = cn10({ saleChon: [hung.id, lan.id] });
  expect(s.match(/aria-checked="true"/g)).toHaveLength(2 + 2); // 2 căn đang chọn + 2 sale
  expect(s).toMatch(/aria-checked="true"[^>]*>(?:(?!<\/button>).)*Sale Hùng/);
  expect(chu(s)).toContain("Zalo sẽ mở 2 tin, mỗi tin một sale");
  expect(tinGuiLich("https://zalo.me/s/1/?ma=x", "Sale Hùng")).toContain("Gửi Sale Hùng:");
});

test("test_YC1_8_NT3_US26_KB4_chu_toast_sau_khi_gui", () => {
  expect(chuToastDaGuiLich).toBe("Đã gửi lịch thành công");
});

test("test_YC1_8_US26_KB5_khong_chon_sale_nao_thi_chu_duoi_nut_la_cua_so_chia_se", () => {
  const s = cn10({ saleChon: [] });
  expect(chu(s)).toContain("Zalo sẽ mở để bạn chọn người nhận");
  expect(chu(s)).toContain("Chọn tất cả"); // Bước 2 chưa chọn sale nào
});

test("test_YC1_8_CN10_01_US26_KB6_dai_vang_Ban_chua_gui_va_nut_gui_lai", () => {
  const s = cn10({ chuaGui: true });
  expect(chu(s)).toContain(CHU_CHUA_GUI);
  expect(chu(s)).toContain(CHU_CHUA_GUI_PHU);
  expect(CHU_CHUA_GUI).toBe("Bạn chưa gửi");
  expect(CHU_CHUA_GUI_PHU).toBe("Cửa sổ Zalo đã đóng mà chưa gửi cho ai. Bấm lại để gửi.");
  expect(nut(s)).toContain("Gửi link qua Zalo");
  expect(chu(cn10())).not.toContain(CHU_CHUA_GUI);
});

test("test_YC1_8_CN10_00_US26_KB7_chua_co_sale_da_luu_thi_co_dong_giai_thich_va_nut_Them_sale", () => {
  const s = cn10({ sale: [] });
  const c = chu(s);
  expect(c).toContain(CHU_CHUA_CO_SALE);
  expect(CHU_CHUA_CO_SALE).toBe('Chưa có sale nào đã lưu. Bấm "Gửi lịch qua Zalo" rồi tự chọn sale trong danh bạ Zalo.');
  expect(nut(s)).toEqual(expect.arrayContaining(["Thêm sale", "Gửi lịch qua Zalo"]));
  expect(c).not.toContain("Sale Hùng");
});

test("test_YC1_5_1_NT3_US26_KB8_ghi_chu_De_sau_cho_popup_cua_CN10", () => {
  expect(CHU_DE_SAU_CN10).toBe("Để sau vẫn gửi lịch được. Sale chưa thấy tên và số của bạn.");
});

test("test_HV2_US26_KB13_mat_mang_thi_banner_loi_giu_nguyen_lua_chon", () => {
  const hung = sale.find((d) => d.ten_hien_thi === "Sale Hùng")!;
  const s = cn10({ saleChon: [hung.id], loi: "Chưa lưu được, bấm lại khi có mạng" });
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(s.match(/aria-checked="true"/g)).toHaveLength(3); // 2 căn và Sale Hùng vẫn chọn
  expect(nut(cn10({ dangGui: true }))).toContain("Đang xử lý…");
});

test("test_YC1_8_US26_bo_chon_het_can_thi_nut_gui_bi_khoa_va_co_chu_nhac", () => {
  const s = cn10({ canChon: [] });
  expect(chu(s)).toContain("Chọn ít nhất một căn");
  expect(s).toMatch(/<button[^>]*disabled=""[^>]*>Gửi lịch qua Zalo/);
  expect(chu(s)).toContain("Căn · đã chọn 0/2");
  expect(nut(s)).toContain("Chọn tất cả");
  expect(nut(cn10())).toContain("Bỏ chọn"); // 2/2: nút đổi thành Bỏ chọn như canvas
});

test("test_YC2_buoc_6_US26_the_Gui_lich_cho_sale_o_tab_Lich_co_dong_Lich_chung_cac_can", () => {
  const s = html(<TheGuiLich onBam={khong} />);
  expect(chu(s)).toContain("Gửi lịch cho sale");
  expect(chu(s)).toContain("Lịch chung các căn");
});
