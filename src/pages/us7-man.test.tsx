import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { HopToast, TOAST_TU_TAT_MS } from "../components/toast";
import { banThu, getCan, getGiaCan, getLichThang, postCan, postGiaNhieuCan, postGiaSaoChep, putGiaThang } from "../services/api";
import { LoiApi, LoiMang, type Can } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { chuToastApDung, NoiDungGia } from "./cn6-gia-man";
import {
  chonTatCa,
  chuNutDatGia,
  chuTieuDeDatGia,
  chuToastSaoChep,
  chuDongGiuDipCu, chuDongGiuGiaCu,
  HopGiuGiaCu,
  chuTomTatGia,
  doiChon,
  loiKhiSaoChep,
  NoiDungChonCan,
  NoiDungDatGiaNhieuCan,
  NoiDungSaoChep,
} from "./cn6-nhieu-can-man";

// US7 · Test render CN6-05, CN6-05-00, CN6-06, CN6-07 và toast CN6-08, dùng dữ liệu của server giả.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"');
const nutDay = (s: string) => [...s.matchAll(/<button([^>]*)>([^<]*)<\/button>/g)].map((m) => ({ thuoc: m[1], chu: m[2] }));

let dsCan: Can[] = [];
let c1509 = "";
let c3402 = "";
let cGreenbay = "";
let c2208 = "";
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  boNhoGia.xoa();
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
  cGreenbay = (await postCan({ ma_can: "Greenbay", so_phong_ngu: 2 })).id;
  c2208 = (await postCan({ ma_can: "2208", so_phong_ngu: 1 })).id;
  dsCan = [...(await getCan())].reverse(); // 1509, 3402, Greenbay, 2208 như canvas CN6-05
});

const chonCan = (canChon: string[], them: Partial<React.ComponentProps<typeof NoiDungChonCan>> = {}) =>
  html(<NoiDungChonCan can={dsCan} canChon={canChon} matMang={false} onDoi={khong} onTatCa={khong} onTiep={khong} {...them} />);

test("test_YC3_6_NT1_US7_KB1_chon_2_trong_4_can_dong_dem_va_nut_day", () => {
  expect(dsCan.map((c) => c.ma_can)).toEqual(["1509", "3402", "Greenbay", "2208"]);
  let chon = doiChon(doiChon([], c1509), c3402);
  const s = chonCan(chon);
  const c = chu(s);
  expect(c).toContain("CHỌN CĂN · ĐÃ CHỌN 2/4");
  for (const ten of ["Phòng 1509", "Phòng 3402", "Greenbay", "Phòng 2208"]) expect(c).toContain(`|${ten}|`);
  expect(c).toContain("|Chọn tất cả|");
  expect(nutDay(s).at(-1)).toEqual({ thuoc: ' type="button" class="hh-btn hh-btn--primary hh-btn--block"', chu: "Đặt giá cho 2 căn" });
  expect((s.match(/aria-checked="true"/g) ?? []).length).toBe(2);
  // Chạm lại thì bỏ chọn
  chon = doiChon(chon, c3402);
  expect(chu(chonCan(chon))).toContain("ĐÃ CHỌN 1/4");
  expect(chuNutDatGia(1)).toBe("Đặt giá cho 1 căn");
});

test("test_YC3_6_NT2_US7_KB2_chon_tat_ca_chon_ca_4_can", () => {
  const ids = dsCan.map((c) => c.id);
  const chon = chonTatCa([], ids);
  expect(chon).toEqual(ids);
  const s = chonCan(chon);
  expect(chu(s)).toContain("ĐÃ CHỌN 4/4");
  expect(chu(s)).toContain("Đặt giá cho 4 căn");
  expect((s.match(/aria-checked="true"/g) ?? []).length).toBe(4);
  // Đã chọn hết thì nút đổi thành "Bỏ chọn" và bấm lại bỏ chọn hết
  expect(chu(s)).toContain("|Bỏ chọn|");
  expect(chonTatCa(chon, ids)).toEqual([]);
  // Chọn dở thì "Chọn tất cả" chọn nốt
  expect(chonTatCa([c1509], ids)).toEqual(ids);
});

test("test_YC3_6_NT1_US7_KB3_CN6_05_00_chua_chon_can_nut_mo_khong_di_tiep", () => {
  const s = chonCan([]);
  expect(chu(s)).toContain("ĐÃ CHỌN 0/4");
  expect((s.match(/aria-checked="false"/g) ?? []).length).toBe(4);
  const nut = nutDay(s).at(-1)!;
  expect(nut.chu).toBe("Chọn ít nhất một căn");
  expect(nut.thuoc).toContain('disabled=""');
  expect(chuNutDatGia(0)).toBe("Chọn ít nhất một căn");
});

const datGia = (can: Can[], them: Partial<React.ComponentProps<typeof NoiDungDatGiaNhieuCan>> = {}) =>
  html(
    <NoiDungDatGiaNhieuCan
      can={can}
      nam={2026}
      thangChon={[]}
      giaThuong=""
      giaCuoiTuan=""
      dangLuu={false}
      loiChung={null}
      baoChuaChon={false}
      matMang={false}
      onDoiCan={khong}
      onChonThang={khong}
      onDoiGia={khong}
      onApDung={khong}
      onMoNam={khong}
      onChuaLam={khong}
      {...them}
    />,
  );
const haiCan = () => dsCan.filter((c) => [cGreenbay, c2208].includes(c.id));

test("test_YC3_6_NT3_US7_KB4_man_dat_gia_2_can_thang_11_12_800k_1_1tr", async () => {
  expect(chuTieuDeDatGia(2)).toBe("Đặt giá · 2 căn");
  const s = datGia(haiCan(), { thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000" });
  const c = chu(s);
  expect(c).toContain("Căn áp dụng");
  expect(c).toContain("|Đổi căn|");
  expect(c).toContain("|Greenbay|");
  expect(c).toContain("|Phòng 2208|");
  expect(c).not.toContain("Phòng 1509");
  expect(c).toContain("Giá theo tháng");
  expect(c).toContain("Năm 2026");
  expect((s.match(/<button[^>]*class="gia-thang[ "]/g) ?? []).length).toBe(12);
  expect(c).toContain("Đang chọn: Tháng 11 – 12 (2 tháng)");
  expect(c).toContain("|Áp dụng cho Tháng 11 – 12|");
  expect(s).toContain('value="800.000"');
  expect(s).toContain('value="1.100.000"');
  expect(c).toContain("Ngày thường (CN–T5)");
  expect(c).toContain("Cuối tuần (T6, T7)");
  expect(c).toContain("Đặt giá ngày lễ, dịp đặc biệt");
  // Áp dụng thật: hai căn nhận giá, tab Giá của Greenbay ghi Tháng 11, 12 "800k–1,1tr", Tháng 10 "Chưa đặt"
  await postGiaNhieuCan({ can_ids: [cGreenbay, c2208], thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "khoa-ui-1");
  boNhoGia.xoa();
  for (const id of [cGreenbay, c2208]) {
    const tab = html(
      <NoiDungGia
        bang={await getGiaCan(id, { nam: 2026, thang: "2026-11" })}
        nam={2026} coGiaNamKhac={false} thangChon={[]} giaThuong="" giaCuoiTuan="" thangLich="2026-11" dangLuu={false}
        loiChung={null} baoChuaChon={false} loiTai={null} matMang={false} onChonThang={khong} onDoiGia={khong} onApDung={khong}
        onMoNam={khong} onDoiThangLich={khong} onThuLai={khong} onChuaLam={khong}
      />,
    );
    const o = [...tab.matchAll(/class="gia-thang__ten">(.*?)<\/span><span class="gia-thang__gia">(.*?)<\/span>/g)].map((m) => [m[1], m[2]]);
    expect(o[9]).toEqual(["Tháng 10", "Chưa đặt"]);
    expect(o[10]).toEqual(["Tháng 11", "800k–1,1tr"]);
    expect(o[11]).toEqual(["Tháng 12", "800k–1,1tr"]);
  }
  expect(chuToastApDung([11, 12])).toBe("Đã áp dụng giá cho Tháng 11 – 12");
});

test("test_YC3_6_NT3_US7_KB7_doi_can_giu_cac_can_da_chon_va_tieu_de_theo_so_can", () => {
  boNhoGia.ghiNhapNhieuCan({ canChon: [c1509, c3402], nam: null, thangChon: [], giaThuong: "", giaCuoiTuan: "" });
  // Quay về CN6-05: 1509, 3402 vẫn có dấu chọn, "2/4"
  const s = chonCan(boNhoGia.nhapNhieuCan().canChon);
  expect(chu(s)).toContain("ĐÃ CHỌN 2/4");
  // Chạm thêm Greenbay: "Đặt giá cho 3 căn", CN6-06 ghi "Đặt giá · 3 căn" và 3 căn áp dụng
  const chon = doiChon(boNhoGia.nhapNhieuCan().canChon, cGreenbay);
  expect(chu(chonCan(chon))).toContain("Đặt giá cho 3 căn");
  expect(chuTieuDeDatGia(chon.length)).toBe("Đặt giá · 3 căn");
  const c = chu(datGia(dsCan.filter((x) => chon.includes(x.id))));
  for (const ten of ["Phòng 1509", "Phòng 3402", "Greenbay"]) expect(c).toContain(`|${ten}|`);
});

test("test_YC3_6_US7_KB6_chua_chon_thang_hien_dong_bao_va_nut_khong_luu", () => {
  const s = datGia(haiCan(), { baoChuaChon: true, giaThuong: "800000", giaCuoiTuan: "1100000" });
  expect(chu(s)).toContain("Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.");
  expect(s).not.toContain("Đã áp dụng giá");
});

test("test_HV1_US7_KB10_dang_luu_nut_doi_chu_va_khoa", () => {
  const s = datGia(haiCan(), { thangChon: [11], giaThuong: "800000", giaCuoiTuan: "1100000", dangLuu: true });
  expect(s).toMatch(/<button[^>]*disabled=""[^>]*>Đang lưu…<\/button>/);
});

test("test_HV2_US7_KB9_mat_mang_chu_bao_va_giu_nhap_khong_toast", () => {
  const s = datGia(haiCan(), {
    thangChon: [11], giaThuong: "800000", giaCuoiTuan: "1100000", loiChung: "Chưa lưu được, bấm lại khi có mạng", matMang: true,
  });
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(chu(s)).toContain("Mất kết nối");
  expect(chu(s)).toContain("Đang chọn: Tháng 11 (1 tháng)");
  expect(s).toContain('value="800.000"');
  expect(s).toContain('value="1.100.000"');
  expect(chu(chonCan([], { matMang: true }))).toContain("Mất kết nối");
});

test("test_HV3_US7_KB11_nhap_nhieu_can_giu_trong_bo_nho_khi_roi_app", () => {
  boNhoGia.ghiNhapNhieuCan({ canChon: [cGreenbay, c2208], nam: null, thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000" });
  expect(boNhoGia.nhapNhieuCan()).toMatchObject({ canChon: [cGreenbay, c2208], thangChon: [11, 12], giaThuong: "800000", giaCuoiTuan: "1100000" });
  boNhoGia.xoa();
  expect(boNhoGia.nhapNhieuCan().canChon).toEqual([]);
});

const saoChep = (them: Partial<React.ComponentProps<typeof NoiDungSaoChep>> = {}) =>
  html(
    <NoiDungSaoChep
      maCanNguon="3402"
      tomTat="Giá 7 tháng"
      canDich={dsCan.filter((c) => c.id !== c3402)}
      thang
      le
      dip
      denChon={[]}
      dangLuu={false}
      loiChung={null}
      matMang={false}
      onDoiPhan={khong}
      onDoiDich={khong}
      onTatCa={khong}
      onSaoChep={khong}
      {...them}
    />,
  );

test("test_YC3_7_NT1_US7_KB13_chua_chon_can_dich_nut_mo_ghi_chon_can_de_sao_chep", async () => {
  // Tóm tắt "Giá 7 tháng" có sau khi 3402 được áp Tháng 11 – 12 (US4-KB1)
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "khoa-ui-2");
  const b = await getGiaCan(c3402, { nam: 2026 });
  const tomTat = chuTomTatGia(b.thang.filter((t) => t.gia_ngay_thuong !== null).length, 0, b.dai_dip.filter((d) => !d.la_ngay_le).length);
  expect(tomTat).toBe("Giá 7 tháng · 1 dịp đặc biệt");
  expect(chuTomTatGia(7, 2, 2)).toBe("Giá 7 tháng · 2 ngày lễ · 2 dịp đặc biệt");

  const s = saoChep({ tomTat });
  const c = chu(s);
  expect(c).toContain("Từ căn");
  expect(c).toContain("|Phòng 3402|");
  expect(c).toContain("Giá 7 tháng");
  expect(c).toContain("Sao chép gì");
  for (const ten of ["Giá theo tháng", "Giá ngày lễ", "Dịp đặc biệt"]) expect(c).toContain(`|${ten}|`);
  expect(c).toContain("SANG CĂN · ĐÃ CHỌN 0");
  for (const ten of ["Phòng 1509", "Greenbay", "Phòng 2208"]) expect(c).toContain(`|${ten}|`);
  expect(c).not.toContain("|Phòng 3402|" + "||" + "Phòng 3402"); // căn nguồn chỉ ở mục TỪ CĂN
  expect((c.match(/Phòng 3402/g) ?? []).length).toBe(2); // mục TỪ CĂN và dòng cảnh báo
  expect(c).toContain("Giá đang có của căn được chọn sẽ được thay bằng giá của Phòng 3402.");
  const nut = nutDay(s).at(-1)!;
  expect(nut.chu).toBe("Chọn căn để sao chép");
  expect(nut.thuoc).toContain('disabled=""');
  // Cả ba phần chọn sẵn
  expect((s.match(/aria-checked="true"/g) ?? []).length).toBe(3);
});

test("test_YC3_7_NT2_US7_KB14_chi_chon_gia_theo_thang_chi_gui_phan_thang", async () => {
  const dich = dsCan.filter((c) => c.id === c1509);
  const s = saoChep({ canDich: dich, thang: true, le: false, dip: false, denChon: [c1509] });
  // Chỉ "Giá theo tháng" có dấu chọn, căn đích 1509 có dấu chọn
  expect((s.match(/aria-checked="true"/g) ?? []).length).toBe(2);
  const nut = nutDay(s).at(-1)!;
  expect(nut.chu).toBe("Sao chép giá sang 1 căn");
  expect(nut.thuoc).not.toContain("disabled");
  // Không chọn phần nào thì nút mờ
  expect(nutDay(saoChep({ canDich: dich, thang: false, le: false, dip: false, denChon: [c1509] })).at(-1)!.thuoc).toContain('disabled=""');
  // Server giả: chỉ giá tháng, dịp của 1509 không đổi
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "khoa-ui-3");
  banThu.themDipGia("1509", { ten: "Dịp thử", tu_ngay: "2026-10-28", den_ngay: "2026-10-29", la_ngay_le: false, gia_moi_dem: 1500000 });
  await postGiaSaoChep(c3402, { den_can_ids: [c1509], gia_thang: true, gia_le: false, gia_dip_dac_biet: false }, "khoa-ui-4");
  expect((await getGiaCan(c1509, { nam: 2026 })).dai_dip.map((d) => d.ten)).toEqual(["Dịp thử"]);
});

test("test_YC3_7_US7_KB16_chon_tat_ca_can_dich_chon_3_can_nut_sang", () => {
  const dich = dsCan.filter((c) => c.id !== c3402);
  const chon = chonTatCa([], dich.map((c) => c.id));
  expect(chon).toHaveLength(3);
  const s = saoChep({ denChon: chon });
  expect(chu(s)).toContain("SANG CĂN · ĐÃ CHỌN 3");
  const nut = nutDay(s).at(-1)!;
  expect(nut.chu).toBe("Sao chép giá sang 3 căn");
  expect(nut.thuoc).not.toContain("disabled");
});

test("test_YC3_7_NT3_US7_KB15_toast_da_sao_chep_gia_sang_2_can_tu_tat_sau_3_giay", async () => {
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, "khoa-ui-5");
  const kq = await postGiaSaoChep(c3402, { den_can_ids: [cGreenbay, c2208], gia_thang: true, gia_le: true, gia_dip_dac_biet: true }, "khoa-ui-6");
  expect(chuToastSaoChep(kq.so_can)).toBe("Đã sao chép giá sang 2 căn");
  const s = chu(html(<HopToast chu={chuToastSaoChep(kq.so_can)} onDong={khong} />));
  expect(s).toContain("✓");
  expect(s).toContain("Đã sao chép giá sang 2 căn");
  expect(TOAST_TU_TAT_MS).toBe(3000); // HV8-NT2
});

test("test_HV1_US7_KB19_dang_luu_nut_sao_chep_doi_chu_va_khoa", () => {
  const s = saoChep({ denChon: [cGreenbay], dangLuu: true });
  expect(s).toMatch(/<button[^>]*disabled=""[^>]*>Đang lưu…<\/button>/);
});

test("test_HV2_US7_KB19_mat_mang_khi_sao_chep_o_lai_man_giu_lua_chon_khong_toast", () => {
  expect(loiKhiSaoChep(new LoiMang())).toBe("Chưa lưu được, bấm lại khi có mạng");
  const s = saoChep({ denChon: [cGreenbay, c2208], loiChung: loiKhiSaoChep(new LoiMang()), matMang: true });
  expect(chu(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(chu(s)).toContain("SANG CĂN · ĐÃ CHỌN 2");
  expect(s).not.toContain("Đã sao chép giá");
});

test("test_YC3_7_US7_ca_con_mo_hien_cau_cua_server_khong_hien_ma_ky_thuat", () => {
  const e = new LoiApi("DU_LIEU_SAI", "Chưa sao chép được giá sang căn 1509: trường hợp này chưa có cách làm", "den_can_ids");
  expect(loiKhiSaoChep(e)).toBe("Chưa sao chép được giá sang căn 1509: trường hợp này chưa có cách làm");
  expect(loiKhiSaoChep(new LoiApi("KHONG_TIM_THAY"))).toContain("Không tìm thấy căn này");
  expect(loiKhiSaoChep(new LoiApi("LOI_SERVER"))).toBe("Có lỗi, chưa lưu được. Bấm lại");
});

test("test_HV3_US7_KB20_nhap_sao_chep_giu_trong_bo_nho_khi_roi_app", () => {
  expect(boNhoGia.nhapSaoChep(c3402)).toMatchObject({ thang: true, le: true, dip: true, denCan: [] });
  boNhoGia.ghiNhapSaoChep(c3402, { thang: true, le: false, dip: false, denCan: [cGreenbay] });
  expect(boNhoGia.nhapSaoChep(c3402)).toEqual({ thang: true, le: false, dip: false, denCan: [cGreenbay] });
  expect(boNhoGia.nhapSaoChep(c1509).denCan).toEqual([]);
  // Sao chép xong thì CN6 mở lại ở tab Giá, một lần
  boNhoGia.datQuayVeTabGia(c3402);
  expect(boNhoGia.layQuayVeTabGia(c3402)).toBe(true);
  expect(boNhoGia.layQuayVeTabGia(c3402)).toBe(false);
  boNhoGia.xoa();
  expect(boNhoGia.nhapSaoChep(c3402).denCan).toEqual([]);
});

// Tùng quyết 04/11/2026 (US7, điểm 6): tháng nguồn chưa có giá mà đích có thì giữ giá đích, báo bằng popup "Tôi đã hiểu"
test("test_YC3_7_US7_KB14_popup_bao_thang_giu_gia_cu_co_nut_Toi_da_hieu", async () => {
  const kq = await postGiaSaoChep(c3402, { den_can_ids: [cGreenbay, c1509], gia_thang: true, gia_le: false, gia_dip_dac_biet: false }, "khoa-ui-giu-1");
  expect(kq.thang_giu_gia_cu).toHaveLength(1);
  expect(chuDongGiuGiaCu(kq.thang_giu_gia_cu[0])).toBe("Phòng 1509: Tháng 11/2026, Tháng 12/2026");
  const h = html(<HopGiuGiaCu giu={kq.thang_giu_gia_cu} onDong={khong} />);
  expect(h).toContain('role="alertdialog"');
  expect(chu(h)).toContain("Phòng 1509: Tháng 11/2026, Tháng 12/2026");
  expect(chu(h)).not.toContain("Greenbay");
  expect(chu(h)).toContain("|Tôi đã hiểu|");
  // Không còn báo lỗi DU_LIEU_SAI như trước
  expect(loiKhiSaoChep(new LoiApi("LOI_SERVER"))).toBe("Có lỗi, chưa lưu được. Bấm lại");
});

// Tùng quyết 04/11/2026 (US7, điểm 12): dịp của đích mà nguồn không có thì giữ, liệt kê trong cùng popup với tháng giữ giá cũ
test("test_YC3_7_US7_KB14_popup_liet_ke_thang_va_dip_giu_cu_trong_cung_mot_hop", async () => {
  banThu.themDipGia("1509", { ten: "Pháo hoa 30/4", tu_ngay: "2026-04-30", den_ngay: "2026-05-02", la_ngay_le: false, gia_moi_dem: 3000000 });
  const kq = await postGiaSaoChep(c3402, { den_can_ids: [cGreenbay, c1509], gia_thang: true, gia_le: true, gia_dip_dac_biet: true }, "khoa-ui-giu-2");
  expect(kq.dip_giu_cu).toHaveLength(1);
  expect(chuDongGiuDipCu(kq.dip_giu_cu[0])).toBe("Phòng 1509: Pháo hoa 30/4 (30/04 – 02/05)");
  const h = html(<HopGiuGiaCu giu={kq.thang_giu_gia_cu} dipGiu={kq.dip_giu_cu} onDong={khong} />);
  expect(chu(h)).toContain("Phòng 1509: Tháng 11/2026, Tháng 12/2026");
  expect(chu(h)).toContain("Phòng 1509: Pháo hoa 30/4 (30/04 – 02/05)");
  expect(chu(h)).not.toContain("Greenbay");
  expect(chu(h)).toContain("|Tôi đã hiểu|");
  // Chỉ có dịp giữ lại, không có tháng: hộp không hiện câu dẫn về tháng
  const chiDip = chu(html(<HopGiuGiaCu giu={[]} dipGiu={kq.dip_giu_cu} onDong={khong} />));
  expect(chiDip).toContain("Pháo hoa 30/4");
  expect(chiDip).not.toContain("chưa có giá các tháng");
});

// Tùng quyết 04/11/2026 (US7, điểm 13): popup liệt kê dịp nguồn không chép được vì chồng ngày dịp của đích
test("test_YC3_7_US7_KB14_popup_liet_ke_dip_nguon_bi_bo_qua_vi_chong_ngay", async () => {
  banThu.themDipGia("1509", { ten: "Dịp chồng", tu_ngay: "2026-10-25", den_ngay: "2026-10-26", la_ngay_le: false, gia_moi_dem: 2000000 });
  const kq = await postGiaSaoChep(c3402, { den_can_ids: [cGreenbay, c1509], gia_thang: true, gia_le: true, gia_dip_dac_biet: true }, "khoa-ui-chong-1");
  expect(kq.dip_bo_qua).toHaveLength(1);
  const h = chu(html(<HopGiuGiaCu giu={kq.thang_giu_gia_cu} dipGiu={kq.dip_giu_cu} dipBoQua={kq.dip_bo_qua} onDong={khong} />));
  expect(h).toContain("trùng ngày với dịp đang có của căn đích");
  expect(h).toContain(chuDongGiuDipCu(kq.dip_bo_qua[0]));
  expect(h).toContain("(24/10 – 25/10)");
  expect(h).not.toContain("Greenbay");
  expect(h).toContain("|Tôi đã hiểu|");
});
