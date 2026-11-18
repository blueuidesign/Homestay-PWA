import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { banThu, getCan, getGiaCan, getLichThang, getNgayLe, postGiaDip, postPhien, postTaiKhoan } from "../services/api";
import { LoiApi, LoiMang, type BangGia, type MucNgayLe } from "../services/kieu";
import { DanhSachDip } from "./cn6-gia-man";
import {
  chamONoiDai,
  chuDemNgay,
  chuQua10Ngay,
  demNgayDai,
  dienTuNgayLe,
  kiemDip,
  loiKhiLuuDip,
  luoiTuan,
  NoiDungGiaLe,
  tenTuDat,
  timNgayLe,
  type PropsGiaLe,
} from "./cn6-gia-le-man";

// US8 · Test YC3.5-NT1 đến NT6, NT8 phần giao diện, dùng dữ liệu của server giả (DLM.3): 1509 chưa có dịp,
// 3402 có dịp đặc biệt 24/10 – 25/10 giá 1.300.000đ. NT7 (gửi thẳng tới server) chỉ kiểm ở test server, không có kịch bản tay.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

let lan = 0;
const khoa = () => `khoa-us8-${++lan}`;
let c1509 = "";
let c3402 = "";
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
});

const dem = (b: BangGia, ngay: string) => b.dem!.find((d) => d.ngay === ngay)!;
const luuDip = (canId: string, tu: string, den: string, o: { ten?: string; gia?: number; le?: boolean; k?: string } = {}) =>
  postGiaDip(canId, { ten: o.ten ?? null, tu_ngay: tu, den_ngay: den, la_ngay_le: o.le ?? false, gia_moi_dem: o.gia ?? 1300000, ngay_le_id: null }, o.k ?? khoa());
const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? `${e.loi}:${e.o ?? ""}` : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );

const form = (them: Partial<PropsGiaLe> = {}) =>
  html(
    <NoiDungGiaLe
      maCan="3402"
      ngayLe={[]}
      tu=""
      den=""
      ten=""
      gia=""
      laLe={false}
      dangLuu={false}
      loiChung={null}
      chuNhanh={null}
      matMang={false}
      onChonNhanh={khong}
      onDoiNgay={khong}
      onChamO={khong}
      onDoiTen={khong}
      onDoiGia={khong}
      onDoiLe={khong}
      onLuu={khong}
      {...them}
    />,
  );
const nutLuu = (s: string) => s.match(/<button([^>]*)>(?:Lưu giá|Đang lưu…)<\/button>/)![1];

test("test_YC3_5_NT1_US8_chon_nhanh_le_30_4_dien_san_ngay_ten_va_luoi_tuan", async () => {
  const kq = await getNgayLe({ nam: 2026 });
  const m = timNgayLe(kq.muc, "Lễ 30/4 – 1/5")!;
  const f = dienTuNgayLe(m);
  expect(f).toMatchObject({ tu: "2026-04-30", den: "2026-05-03", ten: "Lễ 30/4 – 1/5" });
  expect(chuDemNgay(f.tu, f.den)).toBe("4 ngày · T5 30/4 → CN 3/5");
  expect(luoiTuan(f.tu, f.den)).toEqual(["2026-04-27", "2026-04-28", "2026-04-29", "2026-04-30", "2026-05-01", "2026-05-02", "2026-05-03"]);
  const s = form({ ngayLe: kq.muc, maCan: "1509", tu: f.tu, den: f.den, ten: f.ten });
  const c = chu(s);
  for (const t of ["Giá ngày lễ, dịp đặc biệt", "Phòng 1509", "Chọn nhanh ngày lễ", "Lễ 30/4 – 1/5", "Quốc khánh 2/9", "Tết Dương lịch", "Tết Âm lịch"]) {
    expect(c).toContain(t);
  }
  expect(c).toContain("Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày.");
  expect(s).toContain('value="2026-04-30"');
  expect(s).toContain('value="2026-05-03"');
  expect(s).toContain('value="Lễ 30/4 – 1/5"');
  expect(c).toContain("4 ngày · T5 30/4 → CN 3/5");
  expect((s.match(/data-chon="true"/g) ?? []).length).toBe(4);
  expect(s).not.toContain('data-ngay="2026-04-27" data-chon');
  // Căn của người khác không đọc được dải (PQ21.CHU): người gọi không giữ căn nào thì KHONG_TIM_THAY
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect(await maLoi(getNgayLe({ nam: 2026 }))).toBe("KHONG_TIM_THAY:");
});

test("test_YC3_5_NT1_US8_nới_dải_bằng_cách_chạm_ô_T4_29_4", () => {
  expect(chamONoiDai("2026-04-30", "2026-05-03", "2026-04-29")).toEqual({ tu: "2026-04-29", den: "2026-05-03" });
  expect(chuDemNgay("2026-04-29", "2026-05-03")).toBe("5 ngày · T4 29/4 → CN 3/5");
  expect(chamONoiDai("2026-04-30", "2026-05-03", "2026-05-04")).toEqual({ tu: "2026-04-30", den: "2026-05-04" });
  expect(chamONoiDai("2026-04-30", "2026-05-03", "2026-05-01")).toEqual({ tu: "2026-04-30", den: "2026-05-03" });
});

test("test_YC3_5_NT2_US8_qua_10_ngay_hien_canh_bao_va_khong_luu_duoc", async () => {
  expect(demNgayDai("2026-12-24", "2027-01-05")).toBe(13);
  expect(chuDemNgay("2026-12-24", "2027-01-05")).toBe("13 ngày · T5 24/12 → T3 5/1");
  const s = form({ tu: "2026-12-24", den: "2027-01-05", gia: "1500000" });
  expect(chu(s)).toContain("Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc.");
  expect(chuQua10Ngay(13)).toBe("Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc.");
  expect(nutLuu(s)).toContain("disabled");
  expect(kiemDip({ tu: "2026-12-24", den: "2027-01-05", ten: "", gia: "1500000", laLe: false })).toBe("qua_10");
  // Lưới 21/12 → 10/1 như CN6-03
  expect(luoiTuan("2026-12-24", "2027-01-05").length).toBe(21);
  // 11 ngày bị chặn, 10 ngày không còn cảnh báo và lưu được (KB6)
  expect(chu(form({ tu: "2026-12-24", den: "2027-01-03", gia: "1500000" }))).toContain("Đang chọn 11 ngày");
  const muoi = form({ tu: "2026-12-24", den: "2027-01-02", gia: "1500000" });
  expect(chu(muoi)).toContain("10 ngày · T5 24/12 → T7 2/1");
  expect(chu(muoi)).not.toContain("Tối đa 10 ngày");
  expect(nutLuu(muoi)).not.toContain("disabled");
  // Server cũng chặn khi gửi thẳng, dữ liệu không đổi
  expect(await maLoi(luuDip(c3402, "2026-12-24", "2027-01-05"))).toBe("DU_LIEU_SAI:den_ngay");
  expect((await getGiaCan(c3402, { nam: 2026 })).dai_dip.map((d) => d.tu_ngay)).toEqual(["2026-10-24"]);
  await luuDip(c3402, "2026-12-24", "2027-01-02", { ten: "Noel và Tết" });
  expect((await getGiaCan(c3402, { nam: 2026 })).dai_dip.map((d) => d.tu_ngay)).toEqual(["2026-10-24", "2026-12-24"]);
});

test("test_YC3_5_NT3_US8_luu_dip_24_10_25_10_vao_dip_dac_biet_va_lich_gia_1_3tr", async () => {
  const truoc = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(dem(truoc, "2026-10-25").gia).toBe(900000); // CN trước đó 900k
  await luuDip(c1509, "2026-10-24", "2026-10-25", { ten: "Lễ hội Carnaval" });
  const sau = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(dem(sau, "2026-10-24")).toMatchObject({ gia: 1300000, loai_dem: "dip" });
  expect(dem(sau, "2026-10-25")).toMatchObject({ gia: 1300000, loai_dem: "dip" });
  expect(dem(sau, "2026-10-26").gia).toBe(900000);
  expect(dem(sau, "2026-10-22").gia).toBe(900000);
  const dip = chu(html(<DanhSachDip dai={sau.dai_dip} laNgayLe={false} onCham={khong} />));
  expect(dip).toContain("Dịp đặc biệt");
  expect(dip).toContain("24/10 – 25/10");
  expect(dip).toContain("Lễ hội Carnaval");
  expect(dip).toContain("1.300.000đ");
  expect(chu(html(<DanhSachDip dai={sau.dai_dip} laNgayLe onCham={khong} />))).toContain("Chưa có giá ngày lễ.");
});

test("test_YC3_5_NT4_US8_bat_la_ngay_le_dai_vao_muc_gia_ngay_le", async () => {
  await luuDip(c1509, "2026-09-02", "2026-09-03", { ten: "Quốc khánh 2/9", gia: 2500000, le: true });
  const b = await getGiaCan(c1509, { nam: 2026, thang: "2026-09" });
  const le = chu(html(<DanhSachDip dai={b.dai_dip} laNgayLe onCham={khong} />));
  expect(le).toContain("Giá ngày lễ");
  expect(le).toContain("02/09 – 03/09");
  expect(le).toContain("2.500.000đ");
  expect(chu(html(<DanhSachDip dai={b.dai_dip} laNgayLe={false} onCham={khong} />))).toContain("Chưa có dịp đặc biệt.");
  // Bật "Là ngày lễ" mà bỏ trống tên thì chưa lưu ([MỞ: YC3-H15])
  expect(kiemDip({ tu: "2026-09-02", den: "2026-09-03", ten: " ", gia: "2500000", laLe: true })).toBe("ten");
});

test("test_YC3_5_NT5_US8_bo_trong_ten_app_dat_ten_theo_ngay", async () => {
  expect(tenTuDat("2026-10-24", "2026-10-25")).toBe("Dịp đặc biệt 24/10 – 25/10");
  const s = form({ tu: "2026-10-24", den: "2026-10-25", gia: "1300000" });
  expect(s).toContain('placeholder="Dịp đặc biệt 24/10 – 25/10"');
  const c = chu(s);
  expect(c).toContain("Tên (không bắt buộc)");
  expect(c).toContain('Bỏ trống thì app đặt tên theo ngày: "Dịp đặc biệt 24/10 – 25/10".');
  expect(c).toContain("Lưu giá");
  const kq = await luuDip(c1509, "2026-10-24", "2026-10-25", { ten: "" });
  expect(kq.ten).toBe("Dịp đặc biệt 24/10 – 25/10");
  expect((await getGiaCan(c1509, { nam: 2026 })).dai_dip[0]).toMatchObject({ ten: "Dịp đặc biệt 24/10 – 25/10", gia_moi_dem: 1300000 });
});

test("test_YC3_5_NT6_US8_dai_25_10_26_10_chong_dip_24_10_25_10_bao_loi_khong_luu", async () => {
  const loi = await luuDip(c3402, "2026-10-25", "2026-10-26", { gia: 1500000 }).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiApi);
  expect(loi.loi).toBe("DIP_CHONG_NGAY");
  expect(loi.dai_chong).toMatchObject({ ten: "Dịp đặc biệt 24/10 – 25/10", tu_ngay: "2026-10-24", den_ngay: "2026-10-25" });
  const chuLoi = loiKhiLuuDip(loi);
  expect(chuLoi).toContain("Dịp đặc biệt 24/10 – 25/10");
  expect(chuLoi).toContain("24/10 – 25/10");
  // Màn giữ nguyên nội dung đang nhập và hiện lỗi
  const s = form({ tu: "2026-10-25", den: "2026-10-26", gia: "1500000", loiChung: chuLoi });
  expect(s).toContain('value="2026-10-25"');
  expect(s).toContain('value="2026-10-26"');
  expect(s).toContain('value="1.500.000"');
  expect(chu(s)).toContain(chuLoi);
  // Dịp cũ giữ nguyên, lịch giá không đổi
  const b = await getGiaCan(c3402, { nam: 2026, thang: "2026-10" });
  expect(b.dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([["2026-10-24", "2026-10-25", 1300000]]);
  expect(dem(b, "2026-10-25").gia).toBe(1300000);
  expect(dem(b, "2026-10-26").gia).toBe(800000);
  // Chồng với dải đang bật "Là ngày lễ" cũng bị chặn (KB17)
  expect(await maLoi(luuDip(c3402, "2026-10-25", "2026-10-26", { gia: 2000000, le: true, ten: "Lễ" }))).toBe("DIP_CHONG_NGAY:tu_ngay");
});

test("test_YC3_5_NT8_US8_dai_26_10_27_10_lien_nhau_voi_dip_24_10_25_10_luu_duoc", async () => {
  await luuDip(c3402, "2026-10-26", "2026-10-27", { gia: 1200000 });
  const b = await getGiaCan(c3402, { nam: 2026, thang: "2026-10" });
  expect(b.dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([
    ["2026-10-24", "2026-10-25", 1300000],
    ["2026-10-26", "2026-10-27", 1200000],
  ]);
  expect(dem(b, "2026-10-25").gia).toBe(1300000);
  expect(dem(b, "2026-10-26").gia).toBe(1200000);
  expect(dem(b, "2026-10-27").gia).toBe(1200000);
  expect(dem(b, "2026-10-28").gia).toBe(800000);
});

test("test_HV1_HV2_US8_bam_hai_lan_cung_khoa_chi_ghi_mot_dai_mat_mang_khong_luu", async () => {
  const k = khoa();
  const a = await luuDip(c1509, "2026-10-24", "2026-10-25", { ten: "Lễ hội Carnaval", k });
  const b = await luuDip(c1509, "2026-10-24", "2026-10-25", { ten: "Lễ hội Carnaval", k });
  expect(b).toEqual(a);
  expect((await getGiaCan(c1509, { nam: 2026 })).dai_dip.length).toBe(1);
  // Đang lưu: nút đổi chữ và khóa
  const s = form({ tu: "2026-10-24", den: "2026-10-25", gia: "1300000", dangLuu: true });
  expect(nutLuu(s)).toContain("disabled");
  expect(s).toContain("Đang lưu…");
  banThu.datMatMang(true);
  expect(await maLoi(luuDip(c3402, "2026-12-01", "2026-12-02"))).toBe("MAT_MANG");
  expect(loiKhiLuuDip(new LoiMang())).toBe("Chưa lưu được, bấm lại khi có mạng");
  banThu.datMatMang(false);
  expect((await getGiaCan(c3402, { nam: 2026 })).dai_dip.length).toBe(1);
});

test("test_PQ5_PQ21_US8_chu_nha_khac_khong_them_dai_cho_3402_dai_chung_khong_doi", async () => {
  const muc: MucNgayLe[] = (await getNgayLe({ nam: 2026 })).muc;
  // Lưu dải từ "Lễ 30/4 – 1/5" với ngày khác: dải chung không đổi
  await postGiaDip(c1509, { ten: "Lễ 30/4 – 1/5", tu_ngay: "2026-04-29", den_ngay: "2026-05-03", la_ngay_le: true, gia_moi_dem: 2500000, ngay_le_id: muc[0].id }, khoa());
  expect(await getNgayLe({ nam: 2026 })).toEqual({ nam: 2026, muc });
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect(await getCan()).toEqual([]);
  expect(await maLoi(luuDip(c3402, "2026-12-01", "2026-12-02"))).toBe("KHONG_TIM_THAY:");
});
