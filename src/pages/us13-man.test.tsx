import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { CHIP_MUC_CONG, chipDangChon, chuMucCong, diDenTuS3, docSoTienMucCong, viDuP10 } from "../components/muc-cong-hien-thi";
import { DUONG } from "../components/duong-dan";
import { banThu, getSaleCan, getSaleLich, getSaleTim, patchToi, postPhien, putSaleCanMucCong } from "../services/api";
import type { ChiTietCanSale } from "../services/kieu";
import { NoiDungP10 } from "./p10-man";
import { LichHaiTuan, NoiDungS3 } from "./s3-can-man";

// US13 · Test render S3, P10 trên dữ liệu của server giả (DLM). Hôm nay 07/10/2026; kịch bản 24/10 → 26/10.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const NGAY = { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" };
const BAY_GIO = Date.now();
let n = 0;
const khoa = () => `khoa-us13-man-${++n}-xxxxxxxxxxxxxxxx`;

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuSale("moi");
  banThu.dungZaloId("zalo-sale-hung");
  await postPhien();
});

const mo = async (ma: string) => {
  const id = (await getSaleTim(NGAY)).can.find((c) => c.ma_can === ma)!.id;
  const can = await getSaleCan(id, NGAY);
  const lich = (await getSaleLich({ tu: "2026-10-07", so_ngay: 14 })).can.find((c) => c.id === id)!.o;
  return { id, can, lich };
};

const s3 = (can: ChiTietCanSale, lich: Awaited<ReturnType<typeof mo>>["lich"], tong = can.tong_gia_ban, moTuy = false, chuNhap = "") =>
  html(
    <NoiDungS3
      can={can}
      ngay={{ nhan: NGAY.ngay_nhan, tra: NGAY.ngay_tra }}
      muc={can.muc_cong.so_tien}
      gia={{ tong_gia_ban: tong }}
      moTuyChon={moTuy}
      chuNhap={chuNhap}
      viTriAnh={0}
      lich={lich}
      ngayKhachHoi={["2026-10-24", "2026-10-25"]}
      bayGio={BAY_GIO}
      loiLuu={null}
      onDoiAnh={khong}
      onGoi={khong}
      onChonMuc={khong}
      onMoTuyChon={khong}
      onNhap={khong}
      onYeuCau={khong}
      onGuiKhach={khong}
    />,
  );

const chipTrongSach = (s: string) => {
  const nhom = s.match(/data-chip-muc-cong[^>]*>(.*?)<\/div>/)![1];
  return [...nhom.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>([^<]*)<\/button>/g)].map((m) => ({ chu: m[2], chon: m[1] === "true" }));
};

test("test_YC5_4_NT5_YC5_4_NT6_US13_KB1_S3_cua_1509_co_anh_ten_phong_ngu_giuong_chu_nha_gia_gio_nhan_tra", async () => {
  const { can, lich } = await mo("1509");
  const s = s3(can, lich);
  const c = chu(s);
  expect(c).toContain(`|1/${can.anh.length}|`);
  expect(c).toContain("ICON40 1509 · 2PN");
  expect(c).toContain("2PN · 3 giường · view biển · Bãi Cháy");
  expect(c).toMatch(/Lịch cập nhật \d+ giờ trước/);
  expect(c).toContain("Chị Hoa · Chủ nhà · 2 căn");
  expect(s).toMatch(/<button[^>]*>Gọi<\/button>/);
  expect(c).toContain("24/10 → 26/10 (2 đêm)");
  expect(c).toContain("Giá chủ nhà 2.200.000đ");
  expect(c).toContain("Nhận phòng 14:00 · Trả phòng 12:00");
  // YC5.4-NT5: không có số khách; YC5.4-NT6: không có tiện ích căn
  expect(c).not.toMatch(/khách ·|người lớn|trẻ em|[0-9] khách/);
  expect(c).not.toMatch(/Tiện ích|Bếp|Máy giặt/);
});

test("test_YC5_4_NT5_US13_KB7_3402_chua_co_so_giuong_chi_ghi_so_phong_ngu_va_chon_san_400k", async () => {
  const { can, lich } = await mo("3402");
  const s = s3(can, lich);
  const c = chu(s);
  expect(c).toContain("1PN · view biển");
  expect(c).not.toContain("giường");
  expect(c).not.toMatch(/người lớn|trẻ em/);
  expect(chipTrongSach(s).find((x) => x.chon)?.chu).toBe("+400k");
});

test("test_YC5_4_NT4_US13_KB4_S3_va_P10_deu_co_dung_7_chip_theo_thu_tu_glossary", async () => {
  const dung = ["Không cộng", "+100k", "+200k", "+300k", "+400k", "+500k", "Tùy chọn"];
  const { can, lich } = await mo("1509");
  const a = chipTrongSach(s3(can, lich));
  expect(a.map((x) => x.chu)).toEqual(dung);
  expect(a.find((x) => x.chon)?.chu).toBe("+200k"); // KB4: S3 của 1509 đang chọn +200k
  const p = chipTrongSach(html(<NoiDungP10 muc={400000} lamTron={false} moTuyChon={false} chuNhap="" dangLuu={false} loiChung={null} onChonMuc={khong} onMoTuyChon={khong} onNhap={khong} onLamTron={khong} onLuu={khong} />));
  expect(p.map((x) => x.chu)).toEqual(dung); // YC5.6-NT4: cùng bộ với S3
  expect(p.find((x) => x.chon)?.chu).toBe("+400k"); // KB4: P10 đang chọn +400k
  expect(CHIP_MUC_CONG.length + 1).toBe(7);
});

test("test_YC5_4_NT1_US13_KB2_gia_ban_ve_theo_so_server_gui_2_600_000_roi_3_000_000_roi_2_600_000_gia_chu_khong_doi", async () => {
  const { id, can, lich } = await mo("1509");
  const ghi = "Chỉ bạn thấy giá này. Khách và chủ nhà không thấy phần cộng thêm.";
  let s = chu(s3(can, lich));
  expect(s).toContain("Giá bán cho khách|");
  expect(s).toContain("|2.600.000đ|");
  expect(s).toContain(ghi);
  for (const [so, ban] of [[400000, 3000000], [200000, 2600000]] as const) {
    const kq = await putSaleCanMucCong(id, { so_tien: so, ...NGAY }, khoa());
    expect(kq.tong_gia_ban).toBe(ban);
    s = chu(s3({ ...can, muc_cong: { so_tien: so, rieng: true } }, lich, kq.tong_gia_ban));
    expect(s).toContain(`|${new Intl.NumberFormat("vi-VN").format(ban)}đ|`);
    expect(s).toContain("Giá chủ nhà 2.200.000đ");
  }
});

test("test_YC5_4_NT1_US13_KB3_KB23_khong_cong_ve_2_200_000_tuy_chon_250k_ve_o_nhap_va_2_700_000", async () => {
  const { id, can, lich } = await mo("1509");
  const khongCong = await putSaleCanMucCong(id, { so_tien: 0, ...NGAY }, khoa());
  const s0 = s3({ ...can, muc_cong: { so_tien: 0, rieng: true } }, lich, khongCong.tong_gia_ban);
  expect(chu(s0)).toContain("|2.200.000đ|");
  expect(chipTrongSach(s0).find((x) => x.chon)?.chu).toBe("Không cộng");
  const tuy = await putSaleCanMucCong(id, { so_tien: 250000, ...NGAY }, khoa());
  const s1 = s3({ ...can, muc_cong: { so_tien: 250000, rieng: true } }, lich, tuy.tong_gia_ban, true, "250.000");
  expect(chu(s1)).toContain("|2.700.000đ|");
  expect(chipTrongSach(s1).find((x) => x.chon)?.chu).toBe("Tùy chọn");
  expect(s1).toContain('value="250.000"');
  expect(docSoTienMucCong("250.000")).toBe(250000);
  expect(docSoTienMucCong("250000")).toBe(250000);
  expect(docSoTienMucCong("abc")).toBeNull();
  expect(docSoTienMucCong("10000001")).toBeNull();
  expect(chipDangChon(250000)).toBe("tuy_chon");
  expect(chuMucCong(250000)).toBe("+250.000đ");
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì S3 không có số tiền nào".
test("test_YC5_4_NT2_PQ5_SALE_US13_KB14_EN53_S3_luon_co_gia_chu_va_gia_ban_ke_ca_sau_khi_chon_chip", async () => {
  const { id, can, lich } = await mo("1103");
  const kq = await putSaleCanMucCong(id, { so_tien: 200000, ...NGAY }, khoa());
  const s = chu(s3({ ...can, muc_cong: { so_tien: 200000, rieng: true } }, lich, kq.tong_gia_ban));
  expect(s).toMatch(/\d\.\d{3}\.\d{3}đ/);
  expect(s).toContain("Giá chủ nhà");
  expect(s).toContain("Giá bán cho khách");
  expect(s).toContain("Trống");
  expect(s).toContain("Kín");
});

test("test_YC5_4_US13_KB8_lich_2_tuan_kin_10_11_13_14_19_khong_co_ten_nguoi_dat", async () => {
  const { can, lich } = await mo("1509");
  const s = s3(can, lich);
  const kin = [...s.matchAll(/data-ngay="2026-10-(\d\d)" data-trang-thai="kin"/g)].map((m) => m[1]);
  expect(kin).toEqual(["10", "11", "13", "14", "19"]);
  expect([...s.matchAll(/data-trang-thai="trong"/g)]).toHaveLength(14 - 5);
  expect(chu(s)).not.toMatch(/Khách lẻ|Sale Minh|Sale Hùng/);
  // Ngày khách hỏi nằm trong 2 tuần thì được tô
  expect(html(<LichHaiTuan o={lich} ngayKhachHoi={["2026-10-08"]} />)).toContain('data-ngay="2026-10-08" data-trang-thai="trong" data-dem-khach-hoi="true"');
});

test("test_YC5_4_NT3_US13_KB9_KB10_hai_nut_mo_dung_can_va_ngay_dang_xem", async () => {
  const { id, can, lich } = await mo("1509");
  const s = s3(can, lich);
  expect(s).toMatch(/<button[^>]*>Gửi yêu cầu đặt phòng<\/button>/);
  expect(s).toMatch(/<button[^>]*>Gửi cho khách<\/button>/);
  expect(diDenTuS3("yeu_cau", id, NGAY.ngay_nhan, NGAY.ngay_tra)).toEqual({
    duong: DUONG.YEU_CAU_DAT_PHONG,
    state: { can_id: id, ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" },
  });
  expect(diDenTuS3("gui_khach", id, NGAY.ngay_nhan, NGAY.ngay_tra)).toEqual({
    duong: DUONG.GUI_KHACH,
    state: { can_id: id, ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" },
  });
});

test("test_YC5_4_NT2_PQ2_SALE_US13_chu_nha_chua_cho_so_thi_khong_co_nut_Goi", async () => {
  const { can, lich } = await mo("1509");
  const s = s3({ ...can, chu_nha: { ...can.chu_nha, so_dien_thoai: null } }, lich);
  expect(s).not.toMatch(/<button[^>]*>Gọi<\/button>/);
  expect(chu(s)).toContain("Chị Hoa · Chủ nhà · 2 căn");
});

const p10 = (muc: number, lamTron = false, extra: Partial<React.ComponentProps<typeof NoiDungP10>> = {}) =>
  html(<NoiDungP10 muc={muc} lamTron={lamTron} moTuyChon={chipDangChon(muc) === "tuy_chon"} chuNhap="" dangLuu={false} loiChung={null} onChonMuc={khong} onMoTuyChon={khong} onNhap={khong} onLamTron={khong} onLuu={khong} {...extra} />);

test("test_YC5_6_NT1_US13_KB17_P10_chon_400k_thi_vi_du_2_dem_ban_duoc_800_000", () => {
  const c = chu(p10(400000));
  expect(c).toContain("Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng.");
  expect(c).toContain("VÍ DỤ: PHÒNG 1509, 2 ĐÊM");
  expect(c).toContain("Giá chủ nhà||2.200.000đ");
  expect(c).toContain("Giá gửi khách||3.000.000đ");
  expect(c).toContain("Bạn được||800.000đ");
  expect(viDuP10(400000, false)).toEqual({ gia_chu: 2200000, gia_khach: 3000000, ban_duoc: 800000 });
});

test("test_YC5_6_NT2_US13_KB18_P10_khong_cong_thi_gia_gui_khach_bang_gia_chu_ban_duoc_0", () => {
  const c = chu(p10(0));
  expect(c).toContain("Giá gửi khách||2.200.000đ");
  expect(c).toContain("Bạn được||0đ");
});

test("test_YC5_6_NT3_US13_KB19_P10_tuy_chon_230k_2_660_000_bat_lam_tron_thi_2_700_000_tat_lai_2_660_000", () => {
  expect(chu(p10(230000, false))).toContain("Giá gửi khách||2.660.000đ");
  const bat = p10(230000, true);
  expect(chu(bat)).toContain("Giá gửi khách||2.700.000đ");
  expect(bat).toMatch(/aria-checked="true"/);
  expect(chu(p10(230000, false))).toContain("Giá gửi khách||2.660.000đ");
  expect(chu(bat)).toContain("Làm tròn lên 50.000đ");
  // Làm tròn từng đêm rồi cộng: 1.530.000 → 1.550.000 và 1.130.000 → 1.150.000
  expect(viDuP10(230000, true).gia_khach).toBe(1550000 + 1150000);
});

test("test_YC5_6_US13_KB22_P10_dang_luu_thi_nut_doi_chu_va_khong_bam_lai_duoc_loi_mang_giu_chip", () => {
  const dang = p10(500000, false, { dangLuu: true });
  expect(dang).toMatch(/<button[^>]*disabled[^>]*>Đang lưu…<\/button>/);
  const loi = p10(500000, false, { loiChung: "Chưa lưu được, bấm lại khi có mạng" });
  expect(chu(loi)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(chipTrongSach(loi).find((x) => x.chon)?.chu).toBe("+500k");
  expect(chu(p10(400000))).toContain("Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn.");
});

test("test_YC5_6_NT1_US13_KB20_patch_toi_luu_300k_roi_P10_mo_lai_chon_300k", async () => {
  const h = await patchToi({ muc_cong_mac_dinh: 300000, lam_tron_50k: false }, khoa());
  expect(chipTrongSach(p10(h.muc_cong_mac_dinh!)).find((x) => x.chon)?.chu).toBe("+300k");
  expect(chuMucCong(h.muc_cong_mac_dinh!)).toBe("+300k");
});
