import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { dongThongTin } from "../components/can-hien-thi";
import { CHU_CAN_VAN_LUU, CHU_THE_QUYEN } from "../components/khoi-anh";
import { CHU_GHI_CHU_MO_TA, CHU_GHI_CHU_TIM_TOA, chuTrungToa, formMoRongTrong, KhoiMoRong, timToaTrungTen, type PropsMoRong } from "../components/khoi-mo-rong";
import { TheCan } from "../components/the-can";
import type { Can, ToaNha } from "../services/kieu";
import { LoiApi } from "../services/kieu";
import type { AnhForm } from "../stores/anh-form";
import { dongConThieu, NoiDungCN5A1 } from "./cn5-a1-them-can";
import { loiSuaCan, NoiDungCN5_02, type PropsCN5_02 } from "./cn5-02-man";
import { FormGiaThang } from "./cn6-gia-man";
import { chuGiaP6, CHU_P6_GHI_CHU, CHU_P6_DAU, NoiDungP6, tuanMau } from "./p6-man";

// US1 · Test render phần giao diện: thẻ căn, CN5-A1 phần mở rộng, CN5-A1b, CN5-02, P6, tên hai ô giá.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const can = (ma: string, them: Partial<Can> = {}): Can => ({
  id: `can-${ma}`,
  ma_can: ma,
  so_phong_ngu: 2,
  so_giuong: null,
  loai_view: null,
  toa_nha: null,
  so_anh: 0,
  moi_them: false,
  tao_luc: "2026-09-01T02:00:00.000Z",
  ...them,
});
const toa = (ten: string, khu_vuc: string | null = null): ToaNha => ({ id: ten, ten, khu_vuc, da_dung: false });
const DS_TOA = [toa("ICON40", "Bãi Cháy"), toa("À La Carte"), toa("Sapphire")];

const mr = (p: Partial<PropsMoRong> = {}): PropsMoRong => ({
  form: formMoRongTrong(),
  dsToa: DS_TOA,
  moTim: false,
  chuTim: "",
  ketQuaTim: [],
  coThuGon: true,
  onThuGon: khong,
  onChonToa: khong,
  onMoTim: khong,
  onChuTim: khong,
  onThemToaMoi: khong,
  onView: khong,
  onSoGiuong: khong,
  onMoTa: khong,
  ...p,
});
const khoi = (p: Partial<PropsMoRong> = {}) => html(<KhoiMoRong {...mr(p)} />);

const formA1 = (p: Partial<React.ComponentProps<typeof NoiDungCN5A1>> = {}) =>
  html(<NoiDungCN5A1 ma="2105" phongNgu={2} loi={{}} dangLuu={false} onMa={khong} onPhongNgu={khong} onThem={khong} onChuaLam={khong} {...p} />);
const nutThemCan = (h: string) => h.slice(h.lastIndexOf("<button"));

const anh = (n: number): AnhForm => ({
  khoa: `k${n}`,
  tep: { ten: `a${n}.jpg`, duong_dan: `x${n}`, dung_luong: 0 },
  trang_thai: "xong",
  tien_do: 100,
  anh_id: `a${n}`,
  idem: "",
});
const form02 = (p: Partial<PropsCN5_02> = {}) =>
  html(
    <NoiDungCN5_02
      ma="1509"
      phongNgu={2}
      loi={{}}
      dangLuu={false}
      anh={[1, 2, 3].map(anh)}
      coTheQuyen={false}
      cheDoDoi={false}
      moRong={mr({
        form: { toa: DS_TOA[0], view: "view biển", soGiuong: "3", moTa: "Gần bãi tắm" },
        coThuGon: false,
      })}
      onMa={khong}
      onPhongNgu={khong}
      onLuu={khong}
      onThemAnh={khong}
      onThuLai={khong}
      onXoaAnh={khong}
      onMoCaiDat={khong}
      onBatDoi={khong}
      onDoiViTri={khong}
      {...p}
    />,
  );

// ---- US1-NT9 ----

test("test_YC3_1_NT5_the_can_ghi_2PN_3_giuong_va_khong_ghi_so_khach", () => {
  const c = can("1509", { so_giuong: 3, loai_view: "view biển", toa_nha: "ICON40" });
  expect(dongThongTin(c)).toBe("2PN · 3 giường · view biển · ICON40");
  const h = html(<TheCan can={c} />);
  expect(h).toContain("2PN · 3 giường · view biển · ICON40");
  expect(h).not.toMatch(/khách|người lớn|trẻ em/);
  // Mã loại view của server thật cũng ra "view biển"
  expect(dongThongTin(can("2501", { loai_view: "thanh_pho" }))).toBe("2PN · view thành phố");
});

// ---- mục "Tòa nhà, loại view, số giường, mô tả" (US1) ----

test("test_YC3_2_2_NT1_khong_mo_phan_them_thong_tin_van_them_duoc_can", () => {
  const h = formA1();
  expect(chu(h)).toContain("Thêm tòa nhà, mô tả gửi khách, view...");
  expect(chu(h)).not.toContain("Loại view");
  expect(chu(h)).not.toContain("Số giường");
  expect(nutThemCan(h)).not.toContain("disabled");
  expect(chu(h)).toContain("Đủ thông tin.");
});

test("test_YC3_2_2_phan_mo_rong_co_chip_toa_chip_view_so_giuong_mo_ta_va_nut_thu_gon", () => {
  const h = formA1({ moRong: { dangMo: true, onMo: khong, khoi: mr() } });
  const c = chu(h);
  for (const t of ["Tòa nhà", "ICON40", "À La Carte", "Sapphire", "+ Tòa khác", "Loại view", "Số giường", "Mô tả gửi khách", CHU_GHI_CHU_MO_TA, "Thu gọn"]) {
    expect(c).toContain(t);
  }
  expect(c).not.toContain("Thêm tòa nhà, mô tả gửi khách, view...");
  expect(h).toContain("name=\"so_giuong\"");
});

test("test_YC3_2_2_NT2_go_Green_thay_cac_toa_co_chu_Green_ten_khu_vuc_va_dong_them_toa_moi", () => {
  const h = khoi({ moTim: true, chuTim: "Green", ketQuaTim: [toa("Green Bay", "Bãi Cháy"), toa("Green Hạ Long Test")] });
  const c = chu(h);
  expect(c).toContain("Tên tòa nhà");
  expect(c).toContain(CHU_GHI_CHU_TIM_TOA);
  expect(c).toContain("Green Bay");
  expect(c).toContain("Bãi Cháy");
  expect(c).toContain("Green Hạ Long Test");
  expect(c).toContain("+ Thêm tòa mới Green");
  // Chưa gõ chữ nào thì chưa có dòng thêm tòa mới
  expect(chu(khoi({ moTim: true, chuTim: "" }))).not.toContain("+ Thêm tòa mới");
});

// Tùng quyết 04/11/2026 (US1, điểm 4): gõ tòa đã có thì gợi ý tòa có sẵn để chọn, vẫn bấm "+ Thêm tòa mới" được
test("test_YC3_2_2_toa_trung_ten_goi_y_toa_co_san_va_van_con_nut_them_toa_moi", () => {
  const h = khoi({ moTim: true, chuTim: "  icon40 ", ketQuaTim: [toa("ICON40", "Bãi Cháy")] });
  const c = chu(h);
  expect(c).toContain(chuTrungToa("ICON40"));
  expect(h).toContain("data-goi-y-trung");
  expect(c).toContain("ICON40");
  expect(c).toContain("+ Thêm tòa mới icon40");
  // Không phân biệt dấu, hoa thường
  expect(timToaTrungTen([toa("À La Carte")], "a la carte")?.ten).toBe("À La Carte");
  // Gõ dở (chỉ chứa chữ) hay chưa có kết quả thì không báo trùng
  expect(chu(khoi({ moTim: true, chuTim: "Green", ketQuaTim: [toa("Green Bay")] }))).not.toContain("Đã có tòa");
  expect(timToaTrungTen(null, "ICON40")).toBeUndefined();
});

test("test_YC3_2_2_NT3_chip_loai_view_dung_Bien_Thanh_pho_Nui_khong_Vinh", () => {
  const h = khoi();
  const phan = h.slice(h.indexOf("Loại view"), h.indexOf("Số giường"));
  expect(phan.match(/<button/g)).toHaveLength(3);
  for (const t of ["Biển", "Thành phố", "Núi"]) expect(phan).toContain(`>${t}<`);
  expect(h).not.toMatch(/Vịnh|vịnh/);
});

test("test_YC3_2_2_NT4_o_so_giuong_nhap_duoc_va_the_can_ghi_so_giuong", () => {
  expect(khoi({ form: { ...formMoRongTrong(), soGiuong: "2" } })).toContain('value="2"');
  expect(dongThongTin(can("2107", { so_giuong: 2 }))).toBe("2PN · 2 giường");
});

test("test_YC3_2_2_NT5_bo_trong_so_giuong_dong_con_thieu_khong_nhac_va_the_chi_ghi_2PN", () => {
  expect(dongConThieu("2108", 2)).toBeNull();
  expect(dongConThieu("", null)).not.toContain("giường");
  const h = khoi();
  expect(h).not.toContain("<span style=\"color:var(--danger)");
  expect(chu(formA1({ ma: "2108", phongNgu: 2, moRong: { dangMo: true, onMo: khong, khoi: mr() } }))).not.toContain("Còn thiếu");
  const dem = html(<TheCan can={can("2108")} />);
  expect(dem).toContain(">2PN<");
  expect(dem).not.toContain("giường");
});

test("test_YC3_2_2_NT6_toa_nguoi_khac_them_hien_trong_danh_sach_tim", () => {
  const h = khoi({ moTim: true, chuTim: "Green Hạ", ketQuaTim: [toa("Green Hạ Long Test")] });
  expect(chu(h)).toContain("Green Hạ Long Test");
  expect(chu(h)).toContain("+ Thêm tòa mới Green Hạ");
});

// ---- mục "Sửa thông tin căn" (US1) CN5-02 ----

test("test_YC3_3_NT1_mo_sua_can_cac_o_hien_dung_gia_tri_hien_co", () => {
  const h = form02();
  expect(h).toContain('name="ma_can" value="1509"');
  expect(h).toMatch(/aria-pressed="true"[^>]*>2PN</);
  expect(h).toMatch(/aria-pressed="true"[^>]*>ICON40</);
  expect(h).toMatch(/aria-pressed="true"[^>]*>Biển</);
  expect(h).toMatch(/aria-pressed="false"[^>]*>Núi</);
  expect(h).toContain('name="so_giuong"');
  expect(h).toContain('value="3"');
  expect(h).toContain("Gần bãi tắm");
  expect(chu(h)).toContain("Ảnh (3)");
  expect(h.match(/class="o-anh /g)).toHaveLength(3);
  expect(chu(h)).toContain("Lưu thay đổi");
  expect(chu(h)).not.toContain("Thu gọn");
});

test("test_YC3_3_NT2_che_do_doi_thu_tu_co_nut_dua_len_truoc_ra_sau_va_anh_so_1_la_anh_dai_dien", () => {
  const thuong = form02();
  expect(chu(thuong)).toContain("Đổi thứ tự");
  expect(thuong).not.toContain("Đưa ảnh lên trước");
  const doi = form02({ cheDoDoi: true });
  expect(chu(doi)).toContain("Xong");
  expect(chu(doi)).toContain("Ảnh số 1");
  expect(chu(doi)).toContain("Ảnh số 3");
  expect(doi.match(/aria-label="Đưa ảnh lên trước"/g)).toHaveLength(3);
  expect(doi.match(/aria-label="Đưa ảnh ra sau"/g)).toHaveLength(3);
  expect(chu(doi)).toContain("Ảnh số 1 là ảnh đại diện");
  // Ảnh đầu không đưa lên trước được, ảnh cuối không đưa ra sau được
  expect(doi).toMatch(/aria-label="Đưa ảnh lên trước" disabled=""/);
  // Chỉ một ảnh thì không có nút đổi thứ tự
  expect(chu(form02({ anh: [anh(1)] }))).not.toContain("Đổi thứ tự");
});

test("test_YC3_3_xoa_anh_moi_anh_co_nut_xoa", () => {
  expect(form02().match(/aria-label="Xóa ảnh"/g)).toHaveLength(3);
});

test("test_YC3_3_NT3_ma_trung_hien_loi_Da_co_can_duoi_o_ma_can_va_khong_luu", () => {
  const loi = loiSuaCan(new LoiApi("MA_CAN_TRUNG", "Đã có căn 3402", "ma_can"), "3402");
  expect(loi).toEqual({ ma_can: "Đã có căn 3402" });
  const h = form02({ ma: "3402", loi });
  expect(chu(h)).toContain("⚠️ Đã có căn 3402");
  expect(h).toContain('value="3402"');
});

test("test_YC3_3_NT4_o_so_giuong_xoa_trong_la_chuoi_rong_va_luu_khong_co_loi", () => {
  const h = form02({ moRong: mr({ form: { ...formMoRongTrong(), soGiuong: "" }, coThuGon: false }) });
  expect(h).toMatch(/name="so_giuong"[^>]*value=""/);
  expect(chu(h)).not.toContain("Số giường từ 1 đến 50");
  expect(nutLuu(h)).not.toContain("disabled");
});

const nutLuu = (h: string) => h.slice(h.lastIndexOf("<button"));

test("test_YC3_3_HV2_mat_mang_khi_luu_bao_chua_luu_duoc_va_giu_nguyen_noi_dung", () => {
  const loi = loiSuaCan(new (class extends Error {})("mang"), "1509");
  expect(loi.chung).toBe("Chưa lưu được, bấm lại khi có mạng");
  const h = form02({ loi });
  expect(chu(h)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(h).toContain('value="3"');
});

test("test_YC3_3_HV4_da_tu_choi_quyen_anh_hien_the_va_cac_o_khac_van_luu_duoc", () => {
  const h = form02({ coTheQuyen: true });
  expect(chu(h)).toContain(CHU_THE_QUYEN);
  expect(chu(h)).toContain(CHU_CAN_VAN_LUU);
  expect(h).toContain(">Mở cài đặt quyền</button>");
  expect(nutLuu(h)).not.toContain("disabled");
});

test("test_YC3_3_HV1_dang_luu_nut_doi_chu_va_khong_bam_lai", () => {
  const h = form02({ dangLuu: true });
  expect(nutLuu(h)).toContain("disabled");
  expect(nutLuu(h)).toContain("Đang lưu…");
});

// ---- mục "Ngày tính giá cuối tuần" (US4) P6 ----

const MAU = { ma_can: "1509", thuong: 900000, cuoi_tuan: 1300000 };

test("test_YC3_8_P6_mo_man_co_cau_dan_chip_T2_den_CN_T6_T7_dang_chon_ghi_chu_va_tuan_mau", () => {
  const h = html(<NoiDungP6 dem={[5, 6]} mau={MAU} dangLuu={false} loiChung={null} onChon={khong} onLuu={khong} />);
  const c = chu(h);
  expect(c).toContain(CHU_P6_DAU);
  expect(c).toContain("Đêm cuối tuần");
  expect(c).toContain(CHU_P6_GHI_CHU);
  expect(c).toContain("Một tuần của phòng 1509");
  expect(c).toContain("Lưu thay đổi");
  expect(h).toMatch(/aria-pressed="true"[^>]*>T6</);
  expect(h).toMatch(/aria-pressed="true"[^>]*>T7</);
  expect(h).toMatch(/aria-pressed="false"[^>]*>CN</);
  expect(h.match(/aria-pressed="true"/g)).toHaveLength(2);
  expect(tuanMau(MAU, [5, 6]).map((o) => `${o.thu} ${chuGiaP6(o.gia)}`)).toEqual([
    "T2 900k", "T3 900k", "T4 900k", "T5 900k", "T6 1.300k", "T7 1.300k", "CN 900k",
  ]);
  expect(h.match(/data-cuoi-tuan="true"/g)).toHaveLength(2);
});

test("test_YC3_8_P6_chon_T7_CN_thi_tuan_mau_doi_theo_T6_900k_T7_va_CN_1300k", () => {
  expect(tuanMau(MAU, [6, 7]).map((o) => [o.thu, o.gia, o.cuoi])).toEqual([
    ["T2", 900000, false], ["T3", 900000, false], ["T4", 900000, false], ["T5", 900000, false],
    ["T6", 900000, false], ["T7", 1300000, true], ["CN", 1300000, true],
  ]);
});

test("test_YC3_8_P6_bo_chon_het_thi_nut_luu_khong_dung_duoc_va_dang_luu_khoa_nut", () => {
  const trong = html(<NoiDungP6 dem={[]} mau={MAU} dangLuu={false} loiChung={null} onChon={khong} onLuu={khong} />);
  expect(trong.slice(trong.lastIndexOf("<button"))).toContain("disabled");
  const luu = html(<NoiDungP6 dem={[5, 6]} mau={MAU} dangLuu loiChung={null} onChon={khong} onLuu={khong} />);
  expect(luu.slice(luu.lastIndexOf("<button"))).toContain("Đang lưu…");
});

test("test_YC3_8_P6_HV2_mat_mang_khi_luu_bao_va_giu_chip_dang_chon", () => {
  const h = html(<NoiDungP6 dem={[6, 7]} mau={null} dangLuu={false} loiChung="Chưa lưu được, bấm lại khi có mạng" onChon={khong} onLuu={khong} />);
  expect(chu(h)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(h.match(/aria-pressed="true"/g)).toHaveLength(2);
  expect(chu(h)).toContain("Đặt giá cho một căn để xem tuần mẫu.");
});

test("test_YC3_8_NT1_NT2_ten_hai_o_gia_theo_dem_cuoi_tuan_da_chon", () => {
  const ten = (dem?: number[]) =>
    chu(
      html(
        <FormGiaThang
          nam={2026}
          oThang={[]}
          thangChon={[]}
          giaThuong=""
          giaCuoiTuan=""
          dangLuu={false}
          loiChung={null}
          baoChuaChon={false}
          onChonThang={khong}
          onDoiGia={khong}
          onApDung={khong}
          onMoNam={khong}
          demCuoiTuan={dem}
        />,
      ),
    );
  expect(ten([5, 6])).toContain("Ngày thường (CN–T5)");
  expect(ten([5, 6])).toContain("Cuối tuần (T6, T7)");
  expect(ten()).toContain("Cuối tuần (T6, T7)");
  expect(ten([6, 7])).toContain("Cuối tuần (T7, CN)");
  expect(ten([6, 7])).toContain("Ngày thường (T2–T6)");
});
