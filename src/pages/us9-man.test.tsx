import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { banThu, getBookingSapToi, getLichThang, getLichTomTat, getLichTuan } from "../services/api";
import { LoiApi, type LichTuan, type SapToi, type TomTatThang } from "../services/kieu";
import { MucSapToi, PhanDuoiLichThang, KhoiDoanhThu } from "./cn1-tom-tat";
import { cacChipLoc, locTuanRaThamSo, NoiDungCN2, type LocTuan } from "./cn2-lich-tuan";

// US2 · Test màn lịch (CN1 khối doanh thu và đặt phòng sắp tới, CN2 lịch tuần) trên server giả với dữ liệu DLM.
// Mỗi test lấy số từ server giả (getLichTomTat, getBookingSapToi, getLichTuan) rồi vẽ phần giao diện và đọc chữ ra.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"');

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true); // Chị Hoa, 1509 và 3402, B1 đến B9, hôm nay 07/10/2026
});

const dongSapToi = async () => {
  const kq = await getBookingSapToi();
  const s = html(<MucSapToi muc={kq.muc} onChamDong={khong} onThemDatPhong={khong} />);
  return { kq, s, dong: s.split("<button").filter((x) => x.includes("data-dat-phong")) };
};

test("test_YC2_2_NT1_khoi_doanh_thu_thang_10_theo_DLM_5", async () => {
  const tom = await getLichTomTat({ thang: "2026-10" });
  expect(tom).toMatchObject({ doanh_thu: 11800000, doanh_thu_thang_truoc: 9600000, so_dem_co_khach: 13, so_can: 2 });
  const van = chu(html(<KhoiDoanhThu tom={tom} />));
  expect(van).toContain("DOANH THU THÁNG 10");
  expect(van).toContain("11.800.000đ");
  expect(van).toContain("13 đêm có khách · tháng 9: 9.600.000đ");
  // DLM.5 theo căn: 1509 6.700.000đ 7 đêm
  const canDau = (await getLichThang({ thang: "2026-10" })).can[0];
  expect(await getLichTomTat({ thang: "2026-10", can_id: canDau.can_id })).toMatchObject({ doanh_thu: 6700000, so_dem_co_khach: 7, so_can: 1 });
});

test("test_YC2_2_NT1_ba_can_ghi_so_can_khong_co_thang_truoc", () => {
  // CN1-02: "20 đêm có khách · 3 căn", không có số tháng trước
  const tom: TomTatThang = { thang: "2026-10", doanh_thu: 15900000, doanh_thu_thang_truoc: 9600000, so_dem_co_khach: 20, so_can: 3 };
  const van = chu(html(<KhoiDoanhThu tom={tom} />));
  expect(van).toContain("15.900.000đ");
  expect(van).toContain("20 đêm có khách · 3 căn");
  expect(van).not.toContain("tháng 9");
});

test("test_QT2_2_VD1_dem_chia_cho_hai_thang_B9", async () => {
  // B9 30/11 → 02/12: tháng 11 có 1 đêm 800.000đ, tháng 12 có 1 đêm 800.000đ
  expect(await getLichTomTat({ thang: "2026-11" })).toMatchObject({ doanh_thu: 800000, so_dem_co_khach: 1 });
  expect(await getLichTomTat({ thang: "2026-12" })).toMatchObject({ doanh_thu: 800000, so_dem_co_khach: 1 });
});

test("test_QT2_2_VD2_muoi_ba_dem_thang_10_va_QT2_1_VD1_VD2", async () => {
  const tom = await getLichTomTat({ thang: "2026-10" });
  expect(tom.so_dem_co_khach).toBe(13);
  // QT2.1-VD1: B1 10/10 → 12/10 chiếm 10/10, 11/10 (không chiếm 12/10); VD2: B6 14/10 → 15/10 chiếm 14/10
  const lich = await getLichThang({ thang: "2026-10" });
  const [c1509, c3402] = lich.can.map((c) => c.can_id);
  const dem = (ngay: string, can: string) => lich.ngay.find((n) => n.ngay === ngay)?.can_ids.includes(can) ?? false;
  expect([dem("2026-10-10", c1509), dem("2026-10-11", c1509), dem("2026-10-12", c1509)]).toEqual([true, true, false]);
  expect([dem("2026-10-14", c3402), dem("2026-10-15", c3402)]).toEqual([true, false]);
});

test("test_YC2_2_NT2_chua_co_dat_phong_khong_co_khoi_doanh_thu", async () => {
  banThu.napDuLieuMau(); // không có đặt phòng
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.co_dat_phong_nao).toBe(false);
  expect(await getLichTomTat({ thang: "2026-10" })).toMatchObject({ doanh_thu: 0, so_dem_co_khach: 0 });
  const s = html(
    <PhanDuoiLichThang coDatPhong={lich.co_dat_phong_nao} tom={null} sapToi={null} loi={null} matMang={false} onThuLai={khong} onChamDong={khong} onDatPhong={khong} />,
  );
  const van = chu(s);
  expect(van).toContain("Chưa có đặt phòng nào");
  expect(van).toContain("Đặt phòng");
  expect(van).not.toContain("DOANH THU THÁNG");
  expect(van).not.toContain("ĐẶT PHÒNG SẮP TỚI");
});

test("test_YC2_3_NT1_sau_dong_dau_dung_thu_tu_ngay_nhan", async () => {
  const { kq, dong } = await dongSapToi();
  expect(kq.muc).toHaveLength(7); // B1, B5, B6, B2, B7, B8 và B9 (ngày trả sau hôm nay, không giới hạn tháng)
  const mong = [
    ["Sale Hùng", "Phòng 1509 · 10/10 → 12/10 (2 đêm)", "2.200.000đ · Cọc 1.000.000đ"],
    ["Khách lẻ", "Phòng 1509 · 13/10 → 15/10 (2 đêm)", "1.800.000đ · Chưa cọc"],
    ["Khách lẻ", "Phòng 3402 · 14/10 → 15/10 (1 đêm)", "800.000đ · Đã thanh toán"],
    ["Sale Lan", "Phòng 3402 · 17/10 → 19/10 (2 đêm)", "1.900.000đ · Chưa cọc"],
    ["Sale Minh", "Phòng 1509 · 19/10 → 20/10 (1 đêm)", "900.000đ · Đã thanh toán"],
    ["Sale Minh", "Phòng 3402 · 21/10 → 22/10 (1 đêm)", "800.000đ · Đã thanh toán"],
  ];
  mong.forEach(([ten, phong, tien], i) => {
    const van = chu(dong[i].replace(/<\/span>/g, "|")).replace(/\|+/g, "|");
    expect(van).toContain(ten);
    expect(van).toContain(phong);
    expect(van.replace(/\|/g, "")).toContain(tien);
  });
  // Không giá bán của sale (PQ11.CHU): B1 giá bán 2.600.000đ
  expect(JSON.stringify(kq)).not.toMatch(/gia_ban|tien_chenh|2600000/);
});

test("test_YC2_3_NT2_chua_coc_ghi_chua_coc", async () => {
  const { dong } = await dongSapToi();
  const chuaCoc = (d: string) => chu(d).includes("Chưa cọc");
  expect(chuaCoc(dong[1])).toBe(true); // Khách lẻ 1509 13/10 → 15/10
  expect(chuaCoc(dong[3])).toBe(true); // Sale Lan 3402 17/10 → 19/10
  expect(chuaCoc(dong[0])).toBe(false); // Sale Hùng 1509 10/10 → 12/10
});

test("test_YC2_3_NT1_trang_tra_hom_nay_khong_con_la_sap_toi_KB5", async () => {
  const { s } = await dongSapToi();
  expect(chu(s)).not.toContain("05/10 → 07/10"); // Sale Lan 3402 trả hôm nay
  expect(chu(s)).not.toContain("04/10 → 06/10"); // Sale Hùng 1509 đã trả
});

test("test_YC2_3_trang_thai_rong_CN1_01", () => {
  const rong: SapToi = { muc: [], truoc_tiep: null };
  const van = chu(html(<MucSapToi muc={rong.muc} onChamDong={khong} onThemDatPhong={khong} />));
  expect(van).toContain("Chưa có đặt phòng sắp tới");
  expect(van).toContain('Bấm "Thêm đặt phòng" để ghi khách đầu tiên.');
});

// ---- Lịch tuần ----

const tuan = async (tu: string, loc: LocTuan = "") => getLichTuan({ tu, ...locTuanRaThamSo(loc) });
const veTuan = (l: LichTuan, loc: LocTuan = "", tatCa = l.can) =>
  html(<NoiDungCN2 lich={l} hom="2026-10-07" chip={cacChipLoc(tatCa)} loc={loc} onDoiTuan={khong} onLoc={khong} onThemDatPhong={khong} />);
// Đọc một hàng căn ra: ô trống {ngay: chữ giá}, thanh {ngay đầu: "tên|nhãn|số ngày"}
const docHang = (s: string, ma: string) => {
  const hang = s.split('<div class="tuan-hang" data-can="').find((x) => x.startsWith(ma + '"')) ?? "";
  const o: Record<string, string> = {};
  for (const m of hang.matchAll(/<div class="tuan-o[^"]*"[^>]*data-ngay="([\d-]+)">(.*?)<\/div>/g)) o[m[1]] = m[2];
  const thanh: Record<string, string> = {};
  for (const m of hang.matchAll(/<div class="tuan-thanh[^"]*"[^>]*data-ngay="([\d-]+)" data-so-ngay="(\d+)"><span class="tuan-thanh__ten">(.*?)<\/span><span class="tuan-thanh__nhan">(.*?)<\/span>/g)) {
    thanh[m[1]] = `${m[3]}|${m[4]}|${m[2]}`;
  }
  return { o, thanh };
};

test("test_YC2_5_NT1_moi_can_mot_hang_bay_cot_tu_T2", async () => {
  const l = await tuan("2026-10-05");
  expect(l.den).toBe("2026-10-11");
  const s = veTuan(l);
  const van = chu(s);
  expect(van).toContain("Trước");
  expect(van).toContain("05 – 11/10/2026");
  expect(van).toContain("Sau");
  expect([...s.matchAll(/data-can="(\w+)"/g)].map((m) => m[1])).toEqual(["1509", "3402"]);
  expect(van).toContain("1509");
  expect(van).toContain("2PN · ICON40");
  // Bảy cột từ trái sang: T2 05 ... CN 11
  const dau = s.split('class="tuan-hang tuan-hang--dau"')[1].split('data-can="')[0];
  expect([...dau.matchAll(/<div class="s1-ngay[^"]*"><span>(\S+?)<\/span><span>(\d+)<\/span>/g)].map((m) => `${m[1]} ${m[2]}`)).toEqual([
    "T2 05", "T3 06", "T4 07", "T5 08", "T6 09", "T7 10", "CN 11",
  ]);
  // Chú thích
  expect(van).toContain("Đã cọc / đã thanh toán");
  expect(van).toContain("Chưa cọc");
  expect(van).toContain("800k: trống, giá đêm");
});

test("test_YC2_5_NT2_o_trong_hien_gia_dem_va_QT2_1_VD1_o_co_khach_la_thanh", async () => {
  const s = veTuan(await tuan("2026-10-05"));
  const h1509 = docHang(s, "1509");
  expect(h1509.thanh["2026-10-05"]).toBe("Sale Hùng|Đã thanh toán|1");
  expect(h1509.thanh["2026-10-10"]).toBe("Sale Hùng|Đã cọc|2"); // 10/10 và 11/10 một thanh nối
  expect([h1509.o["2026-10-06"], h1509.o["2026-10-07"], h1509.o["2026-10-08"], h1509.o["2026-10-09"]]).toEqual(["900k", "900k", "900k", "1,3tr"]);
  expect(h1509.o["2026-10-11"]).toBeUndefined(); // ô CN 11 nằm trong thanh
  const h3402 = docHang(s, "3402");
  expect(h3402.thanh["2026-10-05"]).toBe("Sale Lan|Đã thanh toán|2");
  // 07/10 là ngày trả của Sale Lan, không phải đêm có khách
  expect(["2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"].map((n) => h3402.o[n])).toEqual(["800k", "800k", "1,1tr", "1,1tr", "800k"]);
});

test("test_YC2_5_NT2_gia_dip_dac_biet_va_thanh_mot_dem_KB19", async () => {
  const l = await tuan("2026-10-19");
  const s = veTuan(l);
  const h1509 = docHang(s, "1509");
  expect(h1509.thanh["2026-10-19"]).toBe("Sale Minh|Đã thanh toán|1");
  expect(["2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"].map((n) => h1509.o[n])).toEqual(["900k", "900k", "900k", "1,3tr", "1,3tr", "900k"]);
  const h3402 = docHang(s, "3402");
  expect(h3402.thanh["2026-10-21"]).toBe("Sale Minh|Đã thanh toán|1");
  expect(["2026-10-19", "2026-10-20", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"].map((n) => h3402.o[n])).toEqual(["800k", "800k", "800k", "1,1tr", "1,3tr", "1,3tr"]);
  expect(chu(s)).toContain("0 đặt phòng");
});

test("test_YC2_5_NT3_chip_toa_chi_con_can_cua_toa_do", async () => {
  const tatCa = (await tuan("2026-10-05")).can;
  const chip = cacChipLoc(tatCa);
  expect(chip.map((c) => c.chu)).toContain("Tất cả");
  expect(chip.map((c) => c.chu)).toContain("ICON40");
  const loc = chip.find((c) => c.chu === "ICON40")!.loc;
  const rieng = await tuan("2026-10-05", loc);
  const s = veTuan(rieng, loc, tatCa);
  expect([...s.matchAll(/data-can="(\w+)"/g)].map((m) => m[1])).toEqual(["1509"]);
  expect(s).toMatch(/hh-chip--on"[^>]*aria-pressed="true"[^>]*>ICON40</);
  // Chạm "Tất cả": có lại cả hai căn
  const lai = veTuan(await tuan("2026-10-05", ""), "", tatCa);
  expect([...lai.matchAll(/data-can="(\w+)"/g)].map((m) => m[1])).toEqual(["1509", "3402"]);
  // Lọc theo số phòng ngủ
  const pn2 = await tuan("2026-10-05", "pn:2");
  expect(pn2.can.map((c) => c.ma_can)).toEqual(["1509"]);
});

test("test_YC2_5_NT4_o_tom_tat_chua_coc_dem_dung_so_dat_phong", async () => {
  expect(chu(veTuan(await tuan("2026-10-05")))).toContain("Chưa cọc0 đặt phòng");
  const l2 = await tuan("2026-10-12");
  const s = veTuan(l2);
  expect(chu(s)).toContain("Chưa cọc2 đặt phòng");
  expect(docHang(s, "1509").thanh["2026-10-13"]).toBe("Khách lẻ|Chưa cọc|2");
  expect(docHang(s, "3402").thanh["2026-10-17"]).toBe("Sale Lan|Chưa cọc|2");
});

test("test_YC2_5_trang_thai_rong_CN2_00_tuan_chua_co_dat_phong", async () => {
  const l = await tuan("2026-10-26");
  expect(l.dat_phong).toHaveLength(0);
  const van = chu(veTuan(l));
  expect(van).toContain("26/10 – 01/11");
  expect(van).toContain("Tuần này chưa có đặt phòng nào. Mọi căn đều trống.");
  expect(van).toContain("Thêm đặt phòng");
});

test("test_YC2_tuan_bat_dau_thu_hai_tu_thu_ba_la_DU_LIEU_SAI_va_khong_co_gia_ban", async () => {
  await expect(getLichTuan({ tu: "2026-10-06" })).rejects.toBeInstanceOf(LoiApi);
  const json = JSON.stringify(await tuan("2026-10-05"));
  expect(json).not.toMatch(/gia_ban|tien_chenh|so_dien_thoai/);
});
