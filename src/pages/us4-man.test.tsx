import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { chonThang, chuCacThang, chuGiaNgan, chuKhoangThang, chuKhoangTuan } from "../components/gia-hien-thi";
import { TheCan } from "../components/the-can";
import { banThu, getCan, getGiaCan, getLichThang, putGiaThang } from "../services/api";
import { LoiApi, LoiMang, type BangGia, type Can } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import {
  BangChonNam,
  chuDangChon,
  chuNutApDung,
  chuToastApDung,
  CHU_CAN_CHUA_CO_GIA,
  CHU_CHUA_CHON_THANG,
  CHU_CHUA_CO_DIP,
  CHU_CHUA_CO_GIA_LE,
  loiKhiApDung,
  NoiDungGia,
} from "./cn6-gia-man";

// US4 · Test render CN6, CN6-00, CN6-04, CN6-09 và thẻ căn CN5, dùng dữ liệu của server giả. Số theo DLM.3.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"');

let c1509 = "";
let c3402 = "";
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  boNhoGia.xoa();
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
});

const noiDung = (bang: BangGia | null, them: Partial<React.ComponentProps<typeof NoiDungGia>> = {}) =>
  html(
    <NoiDungGia
      bang={bang}
      nam={2026}
      coGiaNamKhac={false}
      thangChon={[]}
      giaThuong=""
      giaCuoiTuan=""
      thangLich="2026-10"
      dangLuu={false}
      loiChung={null}
      baoChuaChon={false}
      loiTai={null}
      matMang={false}
      onChonThang={khong}
      onDoiGia={khong}
      onApDung={khong}
      onMoNam={khong}
      onDoiThangLich={khong}
      onThuLai={khong}
      onChuaLam={khong}
      {...them}
    />,
  );

// Các ô tháng: [tên, chữ giá]
const oThang = (s: string) =>
  [...s.matchAll(/<button[^>]*class="gia-thang[^"]*"[^>]*><span class="gia-thang__ten">(.*?)<\/span><span class="gia-thang__gia">(.*?)<\/span>/g)].map((m) => [m[1], m[2]]);
// Ô ngày của lịch giá: ngày -> chữ giá
const oNgay = (s: string) =>
  Object.fromEntries(
    [...s.matchAll(/<button[^>]*data-ngay="([\d-]+)"[^>]*><span class="gia-ngay__so">\d+<\/span><span class="gia-ngay__gia">(.*?)<\/span>/g)].map((m) => [m[1], m[2]]),
  );

test("test_YC3_4_NT1_US4_KB1_man_gia_3402_muc_nam_12_o_thang_va_o_nhap", async () => {
  const s = noiDung(await getGiaCan(c3402, { nam: 2026, thang: "2026-10" }));
  const c = chu(s);
  expect(c).toContain("Giá theo tháng");
  expect(c).toContain("Năm 2026");
  const o = oThang(s);
  expect(o).toHaveLength(12);
  expect(o[9]).toEqual(["Tháng 10", "800k–1,3tr"]);
  expect(o[10]).toEqual(["Tháng 11", "Chưa đặt"]);
  expect(o[11]).toEqual(["Tháng 12", "Chưa đặt"]);
  expect(o[5]).toEqual(["Tháng 6", "800k–1,1tr"]);
  expect(o[0]).toEqual(["Tháng 1", "Chưa đặt"]);
  expect(c).toContain("Ngày thường (CN–T5)");
  expect(c).toContain("Cuối tuần (T6, T7)");
  // Chưa chọn tháng: nút ghi chung, chưa có dòng "Đang chọn"
  expect(c).toContain("Áp dụng cho tháng đã chọn");
  expect(c).not.toContain("Đang chọn");
  // 3402 có giá: không hiện CN6-00
  expect(c).not.toContain(CHU_CAN_CHUA_CO_GIA);
});

test("test_YC3_4_NT1_US4_KB1_chon_nhieu_thang_dong_dang_chon_va_nut_ap_dung", async () => {
  expect(chonThang([], 11)).toEqual([11]);
  expect(chonThang([11], 12)).toEqual([11, 12]);
  expect(chuDangChon([11, 12])).toBe("Đang chọn: Tháng 11 – 12 (2 tháng)");
  expect(chuNutApDung([11, 12])).toBe("Áp dụng cho Tháng 11 – 12");
  expect(chuToastApDung([11, 12])).toBe("Đã áp dụng giá cho Tháng 11 – 12");
  // Chọn khoảng theo cả hai chiều, chạm lại ô duy nhất thì bỏ chọn, đã chọn khoảng thì chọn lại từ đầu
  expect(chonThang([12], 11)).toEqual([11, 12]);
  expect(chonThang([11], 11)).toEqual([]);
  expect(chonThang([11, 12], 3)).toEqual([3]);
  expect(chuCacThang([10])).toBe("Tháng 10");
  // KB10: chạm Tháng 1 rồi Tháng 12
  const mười2 = chonThang([1], 12);
  expect(mười2).toHaveLength(12);
  expect(chuDangChon(mười2)).toBe("Đang chọn: Tháng 1 – 12 (12 tháng)");

  const s = noiDung(await getGiaCan(c3402, { nam: 2026 }), { thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000" });
  expect(chu(s)).toContain("Đang chọn: Tháng 11 – 12 (2 tháng)");
  expect(chu(s)).toContain("|Áp dụng cho Tháng 11 – 12|");
  expect(s).toContain('value="800.000"');
  expect(s).toContain('value="1.100.000"');
  // Hai ô đang chọn được tô, còn lại không
  expect((s.match(/gia-thang--chon/g) ?? []).length).toBe(2);
});

test("test_YC3_4_NT2_US4_KB6_chua_chon_thang_hien_dong_bao_va_khong_co_toast", async () => {
  const s = noiDung(await getGiaCan(c3402, { nam: 2026 }), { baoChuaChon: true, giaThuong: "800000", giaCuoiTuan: "1100000" });
  expect(chu(s)).toContain("Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.");
  expect(CHU_CHUA_CHON_THANG).toBe("Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.");
  // Nút vẫn bấm được để hiện dòng báo (KB6 bấm "Áp dụng cho tháng đã chọn"), không có toast trong màn
  expect(s).not.toMatch(/<button[^>]*disabled=""[^>]*>Áp dụng cho tháng đã chọn/);
  expect(chu(s)).toContain("Áp dụng cho tháng đã chọn");
  expect(s).not.toContain("Đã áp dụng giá");
  // Máy chủ trả DU_LIEU_SAI ở `thang` cũng ra đúng câu đó
  expect(loiKhiApDung(new LoiApi("DU_LIEU_SAI", "", "thang"))).toBe(CHU_CHUA_CHON_THANG);
});

test("test_YC3_4_NT3_YC3_1_NT3_US4_KB5_CN6_00_can_chua_co_gia", async () => {
  const bang: BangGia = {
    can_id: "can-9", ma_can: "2105", nam: 2026, dem_cuoi_tuan: [5, 6], dai_dip: [], dem: null,
    thang: Array.from({ length: 12 }, (_, i) => ({
      thang: `2026-${String(i + 1).padStart(2, "0")}`, gia_ngay_thuong: null, gia_cuoi_tuan: null, gia_thap_nhat: null, gia_cao_nhat: null,
    })),
  };
  const s = noiDung(bang);
  const c = chu(s);
  expect(c).toContain("Căn này chưa có giá. Chọn tháng, nhập giá ngày thường và cuối tuần rồi bấm Áp dụng. Sale chỉ thấy giá sau khi bạn đặt.");
  expect(oThang(s).map((o) => o[1])).toEqual(Array(12).fill("Chưa đặt"));
  expect(c).toContain('Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5.');
  expect(CHU_CHUA_CO_GIA_LE).toContain("Lễ 30/4 – 1/5");
  expect(c).toContain("Chưa có dịp đặc biệt.");
  expect(CHU_CHUA_CO_DIP).toBe("Chưa có dịp đặc biệt.");
  // Căn đã có giá năm khác (KB9: 2027 trống nhưng 3402 có giá 2026) thì không hiện CN6-00
  expect(chu(noiDung(bang, { coGiaNamKhac: true }))).not.toContain("Căn này chưa có giá");
});

test("test_YC3_4_NT4_US4_KB2_lich_gia_3402_gia_tung_dem_chu_thich_va_dip", async () => {
  const s = noiDung(await getGiaCan(c3402, { nam: 2026, thang: "2026-10" }));
  const n = oNgay(s);
  expect(Object.keys(n)).toHaveLength(31);
  expect([n["2026-10-08"], n["2026-10-09"], n["2026-10-10"], n["2026-10-11"]]).toEqual(["800k", "1,1tr", "1,1tr", "800k"]);
  expect([n["2026-10-30"], n["2026-10-31"], n["2026-10-01"]]).toEqual(["1,1tr", "1,1tr", "800k"]);
  expect([n["2026-10-24"], n["2026-10-25"]]).toEqual(["1,3tr", "1,3tr"]);
  expect(chu(s)).toContain("Lịch giá tháng 10");
  for (const ct of ["Dịp đặc biệt", "Ngày lễ", "Có khách"]) expect(chu(s)).toContain(`|${ct}|`);
  expect(chu(s)).toContain("|T09|");
  expect(chu(s)).toContain("|T11|");
  // Đánh dấu "Có khách" ở 05, 06, 14, 17, 18, 21/10; dịp 24, 25 tô dịp đặc biệt
  const khach = [...s.matchAll(/class="gia-ngay[^"]*gia-ngay--khach[^"]*"[^>]*data-ngay="2026-10-(\d\d)"/g)].map((m) => Number(m[1]));
  expect(khach).toEqual([5, 6, 14, 17, 18, 21]);
  expect(s).toMatch(/class="gia-ngay gia-ngay--dip"[^>]*data-ngay="2026-10-24"/);
  // Mục Dịp đặc biệt của 3402
  expect(chu(s)).toContain("24/10 – 25/10");
  expect(chu(s)).toContain("1.300.000đ");
});

test("test_YC3_4_NT4_US4_KB3_lich_gia_1509_dung_gia_cua_can", async () => {
  const bang = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  const s = noiDung(bang);
  expect(oThang(s)[9]).toEqual(["Tháng 10", "900k–1,3tr"]);
  const n = oNgay(s);
  expect([n["2026-10-09"], n["2026-10-10"], n["2026-10-08"], n["2026-10-11"]]).toEqual(["1,3tr", "1,3tr", "900k", "900k"]);
  const khach = [...s.matchAll(/gia-ngay--khach[^"]*"[^>]*data-ngay="2026-10-(\d\d)"/g)].map((m) => Number(m[1]));
  expect(khach).toEqual([4, 5, 10, 11, 13, 14, 19]);
  // 1509 không có dịp
  expect(chu(s)).toContain("Chưa có dịp đặc biệt.");
});

test("test_YC3_4_NT1_NT4_US4_KB4_sau_ap_dung_o_thang_va_lich_thang_11", async () => {
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "k-ui-1");
  const s = noiDung(await getGiaCan(c3402, { nam: 2026, thang: "2026-11" }), { thangLich: "2026-11" });
  expect(oThang(s)[10]).toEqual(["Tháng 11", "800k–1,1tr"]);
  expect(oThang(s)[11]).toEqual(["Tháng 12", "800k–1,1tr"]);
  expect(oThang(s)[9]).toEqual(["Tháng 10", "800k–1,3tr"]);
  const n = oNgay(s);
  expect([n["2026-11-01"], n["2026-11-05"], n["2026-11-06"], n["2026-11-07"], n["2026-11-08"], n["2026-11-30"]]).toEqual(
    ["800k", "800k", "1,1tr", "1,1tr", "800k", "800k"],
  );
  expect(chu(s)).toContain("Lịch giá tháng 11");
});

test("test_YC3_4_NT5_US4_KB9_KB10_nam_2027_o_thang_va_lich_qua_nam", async () => {
  const b27 = await getGiaCan(c3402, { nam: 2027, thang: "2027-01" });
  const s = noiDung(b27, { nam: 2027, thangLich: "2027-01", coGiaNamKhac: true });
  expect(chu(s)).toContain("Năm 2027");
  expect(oThang(s).map((o) => o[1])).toEqual(Array(12).fill("Chưa đặt"));
  expect(chu(s)).toContain("Lịch giá tháng 1");
  // Bảng của năm khác với năm đang chọn thì chưa hiện (đang tải), không lẫn giá năm nay (KB9 bước 3)
  const lan = noiDung(await getGiaCan(c3402, { nam: 2026 }), { nam: 2027 });
  expect(lan).toContain('aria-busy="true"');
  expect(oThang(lan)).toHaveLength(0);
  // Lịch giá chuyển sang T01/2027 khi đang xem năm 2026 (KB10 bước 6)
  await putGiaThang(c3402, { thang: Array.from({ length: 12 }, (_, i) => `2027-${String(i + 1).padStart(2, "0")}`), gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "k-ui-2");
  const qua = noiDung(await getGiaCan(c3402, { nam: 2026, thang: "2027-01" }), { thangLich: "2027-01" });
  const n = oNgay(qua);
  expect([n["2027-01-01"], n["2027-01-02"], n["2027-01-03"]]).toEqual(["1,1tr", "1,1tr", "800k"]);
  expect(chu(qua)).toContain("Lịch giá tháng 1/2027");
  expect(chu(qua)).toContain("|T12|");
  expect(chu(qua)).toContain("|T02|");
});

test("test_YC3_4_NT5_US4_KB9_CN6_09_bang_chon_nam", () => {
  const s = html(<BangChonNam namNay={2026} nam={2026} onChon={khong} onDong={khong} />);
  const c = chu(s);
  expect(c).toContain("Đặt giá cho năm");
  expect(c).toContain("|Năm 2026|");
  expect(c).toContain("|Năm nay|");
  expect(c).toContain("|Năm 2027|");
  expect(c).toContain("|Năm sau|");
  // Năm đang chọn có dấu ✓, năm kia thì không
  expect(s).toMatch(/aria-pressed="true"[^>]*>.*?Năm 2026.*?✓/);
  expect((s.match(/✓/g) ?? []).length).toBe(1);
  expect(html(<BangChonNam namNay={2026} nam={2027} onChon={khong} onDong={khong} />)).toMatch(/aria-pressed="true"[^>]*>.*?Năm 2027.*?✓/);
});

test("test_HV1_US4_KB12_dang_luu_nut_doi_chu_va_khoa", async () => {
  const s = noiDung(await getGiaCan(c3402, { nam: 2026 }), { thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000", dangLuu: true });
  expect(s).toMatch(/<button[^>]*disabled=""[^>]*>Đang lưu…<\/button>/);
  expect(s).not.toContain("Áp dụng cho Tháng 11 – 12");
});

test("test_HV1_US4_dang_tai_khung_xam_khong_o_thang_gia", () => {
  const s = noiDung(null);
  expect(s).toContain('aria-busy="true"');
  expect(oThang(s)).toHaveLength(0);
  expect(chu(s)).not.toContain("Chưa đặt");
});

test("test_HV2_US4_KB13_mat_mang_chu_bao_va_giu_nhap", async () => {
  expect(loiKhiApDung(new LoiMang())).toBe("Chưa lưu được, bấm lại khi có mạng");
  const s = noiDung(await getGiaCan(c3402, { nam: 2026 }), {
    thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000", loiChung: loiKhiApDung(new LoiMang()),
  });
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(chu(s)).toContain("Đang chọn: Tháng 11 – 12 (2 tháng)");
  expect(s).toContain('value="800.000"');
  expect(s).toContain('value="1.100.000"');
  expect(s).not.toContain("Đã áp dụng giá");
});

test("test_HV2_US4_KB14_chua_tai_duoc_co_nut_thu_lai_va_khong_o_thang_gia", () => {
  const s = noiDung(null, { loiTai: "mang", matMang: true });
  expect(chu(s)).toContain("Chưa tải được. Kiểm tra mạng rồi bấm Thử lại");
  expect(chu(s)).toContain("|Thử lại|");
  expect(oThang(s)).toHaveLength(0);
  expect(html(<ChuaTaiDuoc matMang onThuLai={khong} />)).toContain("Thử lại");
});

test("test_YC3_4_US4_KB11_loi_gia_qua_gioi_han_khong_hien_ma_ky_thuat", () => {
  const chuLoi = loiKhiApDung(new LoiApi("DU_LIEU_SAI", "", "gia_ngay_thuong"));
  expect(chuLoi).toBe("Giá mỗi đêm phải từ 1đ đến 1.000.000.000đ. Nhập lại giá.");
  expect(chuLoi).not.toContain("DU_LIEU_SAI");
  expect(loiKhiApDung(new LoiApi("LOI_SERVER"))).toBe("Có lỗi, chưa lưu được. Bấm lại");
});

test("test_HV3_US4_KB15_nhap_giu_trong_bo_nho_khi_roi_app", () => {
  boNhoGia.ghiNhap(c3402, { nam: null, thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000", thangLich: "2026-10" });
  expect(boNhoGia.nhap(c3402)).toMatchObject({ thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000" });
  // Căn khác không lẫn nhập của căn này
  expect(boNhoGia.nhap(c1509).thangChon).toEqual([]);
  boNhoGia.xoa();
  expect(boNhoGia.nhap(c3402).thangChon).toEqual([]);
});

test("test_YC3_1_NT4_US4_KB7_the_can_ghi_khoang_gia_tuan_nay_khong_co_chua_dat_gia", async () => {
  const ds = await getCan();
  const the = (ma: string) => html(<TheCan can={ds.find((c) => c.ma_can === ma)!} />);
  expect(chu(the("1509"))).toContain("Giá tuần này |900.000đ – 1.300.000đ");
  expect(chu(the("3402"))).toContain("Giá tuần này |800.000đ – 1.100.000đ");
  expect(the("1509")).not.toContain("Chưa đặt giá");
  expect(the("3402")).not.toContain("Chưa đặt giá");
  expect(chuKhoangTuan({ thap_nhat: 700000, cao_nhat: 700000 })).toBe("700.000đ");
});

test("test_YC3_1_NT3_US4_KB5_KB8_the_can_chua_dat_gia_co_nut_va_khong_co_gia_tuan_nay", () => {
  const can: Can = {
    id: "can-9", ma_can: "2105", so_phong_ngu: 1, so_giuong: null, loai_view: null, toa_nha: null, so_anh: 0,
    moi_them: true, tao_luc: "2026-10-07T01:00:00.000Z", gia_tuan_nay: null, chua_dat_gia: true,
  };
  const s = html(<TheCan can={can} onDatGia={khong} />);
  expect(chu(s)).toContain("Chưa đặt giá");
  expect(chu(s)).toContain("|Đặt giá cho căn này|");
  expect(s).not.toContain("Giá tuần này");
  // KB8: đặt giá xong, thẻ hết "Chưa đặt giá" và có khoảng giá
  const xong = html(<TheCan can={{ ...can, chua_dat_gia: false, gia_tuan_nay: { thap_nhat: 800000, cao_nhat: 1100000 } }} />);
  expect(chu(xong)).toContain("Giá tuần này |800.000đ – 1.100.000đ");
  expect(xong).not.toContain("Chưa đặt giá");
  expect(xong).not.toContain("Đặt giá cho căn này");
});

test("test_YC3_4_US4_dinh_dang_gia_ngan", () => {
  expect([800000, 1100000, 1300000, 1000000, 2500000, 850000].map(chuGiaNgan)).toEqual(["800k", "1,1tr", "1,3tr", "1tr", "2,5tr", "850k"]);
  expect(chuKhoangThang(800000, 1300000)).toBe("800k–1,3tr");
  expect(chuKhoangThang(null, null)).toBe("Chưa đặt");
  expect(chuKhoangThang(700000, 700000)).toBe("700k");
});
