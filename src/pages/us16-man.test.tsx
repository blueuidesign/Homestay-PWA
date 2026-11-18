import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, test } from "vitest";
import { CHIP_LOAI_VIEW } from "../components/can-hien-thi";
import {
  CAC_CACH_XEP,
  chuBanLoi,
  chuToastDaLuuDatPhong,
  chuSdtChe,
  dongConThieuTuNhap,
  dongPhuCanSale,
  manKhiChamCan,
  manKhiChamChuNha,
  tinMoiChuCan,
} from "../components/can-sale-hien-thi";
import { DUONG } from "../components/duong-dan";
import { KhoiMoRong, formMoRongTrong } from "../components/khoi-mo-rong";
import { DieuKhienXinSo } from "../components/xin-so";
import {
  banThu,
  deleteCan,
  deleteKetNoi,
  getCanChiTiet,
  getCanSale,
  getKiemTrung,
  getNguonPhong,
  getNguonPhongChiTiet,
  getSaleLich,
  patchCan,
  postBooking,
  postCan,
  postPhien,
  postTaiKhoan,
} from "../services/api";
import { LoiApi, LoiMang, type CanChiTiet, type ChiTietNguonPhong, type LichSale, type NguonPhong, type OLichSale, type ThanDatPhong } from "../services/kieu";
import { datCongZalo, zalo, type CongZalo } from "../services/zalo";
import { boNhoHoSo } from "../stores/ho-so";
import { NoiDungA5 } from "./a5-sale-moi";
import { HopSapXep, NoiDungS1 } from "./s1-man";
import { chuOLich, NoiDungS6CanCuaToi } from "./s6-can-cua-toi-man";
import { NoiDungS6GhiDatPhong, type FormGhi } from "./s6-ghi-dat-phong-man";
import { NoiDungS6CanTuNhap } from "./s6-can-tu-nhap-man";
import { NoiDungS6ChuNha } from "./s6-chu-nha-man";
import { NoiDungS6 } from "./s6-man";

// US16 · Test màn căn tự nhập và đặt phòng sale tự ghi (S6, S6-00, S6-02 đến S6-08, S1, S1-04, A5) trên server giả (DLM).
// Hôm nay 07/10/2026 (DLM.1). Hùng kết nối Chị Hoa (1509, 3402) và Anh Tuấn (Sapphire 1103, À La Carte 2208); Lan chỉ Chị Hoa.
// Mức cộng của Hùng: mặc định +400k, 1509 +200k, 1103 +100k, 2208 +300k (DLM.3). Server thật có test riêng (src/server/api/us16-nt.test.js).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const van = (s: string) => chu(s).replace(/\|+/g, " ").replace(/\s+/g, " ").trim();
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));

const HOA = "zalo-chi-hoa";
const HUNG = "zalo-sale-hung";
const LAN = "zalo-sale-lan";
let dem = 0;
const khoa = () => `khoa-thu-us16-${String(++dem).padStart(6, "0")}`;
const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  await postPhien();
};

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.datHomNay("2026-10-07");
  boNhoHoSo.xoa();
  datCongZalo(null);
  banThu.napDuLieuSale("moi");
  await dung(HUNG);
});
afterEach(() => {
  datCongZalo(null);
  banThu.datHomNay(null);
});

// Căn của sale: hai căn của tôi và Villa Tuần Châu của chú Bình (3PN, giá chủ 1.400.000đ ngày thường và cuối tuần)
const themCanCuaToi = (ma: string, toa: string | null = null) => postCan({ ma_can: ma, so_phong_ngu: 2, loai_view: "bien", so_giuong: 3 }, khoa());
const themVilla = (them: Partial<Parameters<typeof postCan>[0]> = {}) =>
  postCan(
    { loai: "tu_nhap", ma_can: "Villa Tuần Châu", so_phong_ngu: 3, ten_chu_can: "Chú Bình", sdt_chu_can: "0904123330", gia_chu_thuong: 1400000, gia_chu_cuoi_tuan: 1400000, ...them },
    khoa(),
  );
const ghi = (canId: string, nhan: string, tra: string, tien: number, thu: number) =>
  postBooking({ can_id: canId, ngay_nhan: nhan, ngay_tra: tra, ten_khach: null, tien_phong: tien, gia_ban: thu, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null } as ThanDatPhong, khoa());

const manS6 = async (them: Partial<React.ComponentProps<typeof NoiDungS6>> = {}) =>
  html(
    <NoiDungS6
      can={await getCanSale()}
      nguon={await getNguonPhong()}
      onThemCanCuaToi={khong}
      onCanCuaToi={khong}
      onChuNha={khong}
      onCanChuNha={khong}
      onCanTuNhap={khong}
      onThemTuNhap={khong}
      onMoi={khong}
      onBoDong={khong}
      onXinLich={khong}
      {...them}
    />,
  );

// ---------- S6 · mục "Danh sách căn và nguồn phòng" (US16) ----------

test("test_YC6_1_NT1_US16_sale_co_2_can_cua_toi_2_chu_nha_va_1_can_tu_nhap_thi_thay_ba_nhom_dem_2_2_1", async () => {
  await themCanCuaToi("0812");
  await postCan({ ma_can: "1605", so_phong_ngu: 1, loai_view: "bien" }, khoa());
  await themVilla();
  const s = await manS6();
  const c = van(s);
  expect(c).toContain("Căn của tôi · 2");
  expect(c).toContain("Chủ nhà đã kết nối · 2");
  expect(c).toContain("Căn tự nhập · 1");
  expect(nut(s)).toEqual(expect.arrayContaining(["Thêm căn", "Thêm căn tự nhập", "Gửi lời mời qua Zalo"]));
  expect(c).toContain("Mời Chú Bình dùng app để lịch tự cập nhật, không cần gọi hỏi.");
});

test("test_YC6_1_NT2_US16_can_tu_nhap_ghi_chua_dung_app_va_khong_co_Trong_hom_nay", async () => {
  await themCanCuaToi("0812");
  await themVilla();
  const can = await getCanSale();
  const villa = can.find((x) => x.loai === "tu_nhap")!;
  expect(villa.tinh_trang_hom_nay).toBeNull(); // không bao giờ `trong`
  expect(can.find((x) => x.ma_can === "0812")!.tinh_trang_hom_nay).toEqual({ loai: "trong", ngay_tra: null });
  const s = van(await manS6());
  expect(s).toContain("Villa Tuần Châu");
  expect(s).toContain("Chú Bình · chưa dùng app · gọi hỏi lịch");
  expect(s.match(/Trống hôm nay ✓/g)).toHaveLength(1); // chỉ căn của tôi 0812
});

test("test_YC6_1_NT3_US16_gui_loi_moi_chi_mo_cua_so_chia_se_cua_Zalo_app_khong_tu_gui", async () => {
  const chiaSe: string[] = [];
  datCongZalo({
    chiaSeChu: async (c: string) => {
      chiaSe.push(c);
      return "huy" as const;
    },
  } as unknown as CongZalo);
  // Hồ sơ Hùng đã có số (DLM) nên không hiện popup xin số, mở cửa sổ chia sẻ ngay (mục "Danh sách căn và nguồn phòng" (US16) bước 4, QD2)
  const dk = new DieuKhienXinSo();
  await dk.chay(async () => void (await zalo.chiaSeChu(tinMoiChuCan("Chú Bình"))));
  expect(dk.mo).toBeNull();
  expect(chiaSe).toHaveLength(1);
  expect(chiaSe[0]).toContain("Chú Bình");
});

test("test_YC6_1_NT4_US16_can_cua_chu_nha_ghi_so_phong_ngu_va_so_giuong_khong_ghi_so_khach", async () => {
  const s = van(await manS6());
  expect(s).toContain("Sapphire 1103");
  expect(s).toContain("3PN · 2 giường · view thành phố");
  expect(s).toContain("À La Carte 2208");
  expect(s).toContain("1PN · 1 giường · view biển");
  expect(s).not.toMatch(/khách tối đa|người lớn|trẻ em|\dx khách/);
  expect(dongPhuCanSale({ so_phong_ngu: 2, so_giuong: null, loai_view: null })).toBe("2PN");
});

test("test_YC6_1_NT5_NT8_US16_chu_nha_da_xoa_tai_khoan_thi_dong_ghi_chu_do_khong_so_khong_can_khong_mo_va_nhom_dem_1", async () => {
  banThu.chuNhaXoaTaiKhoan(HOA);
  const ng = await getNguonPhong();
  const hoa = ng.nguon_phong.find((d) => d.da_xoa_tai_khoan)!;
  expect(hoa.ten_hien_thi).toBe("Chị Hoa");
  expect("can" in hoa).toBe(false);
  expect(JSON.stringify(hoa)).not.toMatch(/so_dien_thoai|lich_cap_nhat_luc/);
  const s = await manS6();
  const c = van(s);
  expect(c).toContain("Chị Hoa đã xóa tài khoản");
  expect(c).toContain("Căn và lịch không còn trên app");
  expect(c).toContain("Chủ nhà đã kết nối · 1"); // chỉ Anh Tuấn
  expect(c).not.toMatch(/ICON40|1509|3402/);
  expect(s).not.toMatch(/0903555123|0912000222/);
  // Dòng chỉ có chữ và nút "Bỏ khỏi danh sách"; không có nút mở (S6-08)
  const dong = s.slice(s.indexOf('data-da-xoa="true"'), s.indexOf("Bỏ khỏi danh sách") + 20);
  expect(dong).not.toContain("<button type=\"button\" class=\"dong-sale\"");
  expect(nut(s)).toContain("Bỏ khỏi danh sách");
});

test("test_YC6_1_NT6_NT7_US16_bo_khoi_danh_sach_thi_dong_bien_ngay_khong_hoi_lai_bam_hai_lan_cung_khoa_chi_xoa_mot_lan", async () => {
  banThu.chuNhaXoaTaiKhoan(HOA);
  const dong = (await getNguonPhong()).nguon_phong.find((d) => d.da_xoa_tai_khoan)!;
  const k = khoa();
  expect(await deleteKetNoi(dong.id, k)).toEqual({ id: dong.id, ket_qua: "da_xoa_dong" });
  expect(await deleteKetNoi(dong.id, k)).toEqual({ id: dong.id, ket_qua: "da_xoa_dong" }); // bấm hai lần cùng khóa: một lần
  const sau = await getNguonPhong();
  expect(sau.nguon_phong.some((d) => d.da_xoa_tai_khoan)).toBe(false);
  expect(sau.nguon_phong).toHaveLength(1);
  // Đặt phòng đã chốt vẫn ở danh sách đặt phòng của sale (mục "Trạng thái booking của sale" (US19), US19): API này không đụng booking, nên Anh Tuấn vẫn còn nguyên
});

test("test_YC6_1_NT9_NT10_NT11_US16_cham_can_chu_nha_mo_S3_cham_ten_chu_nha_mo_S6_04_cham_can_cua_toi_mo_S6_07_voi_ba_viec", async () => {
  const cuaToi = await themCanCuaToi("0812");
  const hoa = (await getNguonPhong()).nguon_phong.find((d) => d.ten_hien_thi === "Chị Hoa")!;
  const can1509 = hoa.can!.find((c) => c.ma_can === "1509")!;
  expect(manKhiChamCan("nguon_phong", can1509.id)).toEqual({ duong: DUONG.CAN_SALE_CHI_TIET, state: { can_id: can1509.id, ngay_nhan: null, ngay_tra: null } });
  expect(manKhiChamCan("nguon_phong", can1509.id).duong).not.toBe(DUONG.CAN_CUA_TOI); // không mở S6-07 (RV2-F3)
  expect(manKhiChamChuNha(hoa.id)).toEqual({ duong: DUONG.CHU_NHA_NGUON, state: { id: hoa.id } });
  expect(manKhiChamCan("cua_toi", cuaToi.id)).toEqual({ duong: DUONG.CAN_CUA_TOI, state: { can_id: cuaToi.id } });
  expect(manKhiChamCan("tu_nhap", "x").duong).toBe(DUONG.CAN_TU_NHAP);
  const ct = await getCanChiTiet(cuaToi.id);
  const l = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
  const s = html(<NoiDungS6CanCuaToi can={ct} o={l.can.find((x) => x.id === cuaToi.id)!.o} hom="2026-10-07" onViec={khong} />);
  expect(nut(s).map((t) => t.replace(/\s+/g, " "))).toEqual([
    "Đặt phòngKhách đã chốt cho căn này",
    "Sửa căn và giáẢnh, thông tin, giá theo tháng",
    "Gửi cho kháchẢnh, thông tin và giá bán",
  ]);
  const c = van(s);
  expect(c).toContain("Căn của tôi");
  expect(c).toContain("Bạn tự ghi lịch và giá cho căn này, như chủ nhà.");
  expect(c).toContain("7 ngày tới · giá đêm của bạn");
});

test("test_YC6_1_bao_cao_S6_00_chua_co_can_nao_hien_ba_nut", async () => {
  banThu.xoaSach();
  banThu.napDuLieuSale("moi");
  await postPhien();
  await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: "2026-10-07T02:00:00.000Z" });
  const s = await manS6();
  expect(van(s)).toContain("Chưa có căn nào");
  expect(van(s)).toContain("Thêm căn của bạn, xin lịch chủ nhà, hoặc tự nhập căn của chủ chưa dùng app.");
  expect(nut(s)).toEqual(["Thêm căn của tôi", "Gửi tin nhắn xin lịch cho chủ nhà", "Thêm căn tự nhập"]);
  expect(s).toContain('data-man="S6-00"');
});

// ---------- S6-04 · mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16) ----------

const chiTietHoa = async (): Promise<ChiTietNguonPhong> => {
  const hoa = (await getNguonPhong()).nguon_phong.find((d) => d.ten_hien_thi === "Chị Hoa")!;
  return getNguonPhongChiTiet(hoa.id);
};
const s604 = (ct: ChiTietNguonPhong, them: Partial<React.ComponentProps<typeof NoiDungS6ChuNha>> = {}) =>
  html(<NoiDungS6ChuNha ct={ct} xacNhan={false} dangBo={false} loi={null} onGoi={khong} onBo={khong} onXacNhan={khong} onKhongBo={khong} {...them} />);

test("test_YC6_2_NT1_US16_S6_04_khong_hien_gia_moi_dem_va_khong_lo_gia_chu_nha", async () => {
  const ct = await chiTietHoa();
  // QD20 r2: không còn công tắc tắt giá; chi tiết nguồn phòng vẫn không mang giá chủ nhà hay mức cộng (PQ4.SALE, PQ5.SALE).
  expect(JSON.stringify(ct)).not.toMatch(/gia_chu|muc_cong/);
  const c = van(s604(ct));
  expect(c).toContain("CHỊ HOA CHO BẠN XEM");
  expect(c).toContain("Căn · 2");
  expect(c).not.toMatch(/\d{1,3}(\.\d{3})+\s*đ|\/đêm/);
  expect(c).toContain("ICON40 1509");
  expect(c).toContain("2PN · 3 giường · view biển");
});

test("test_YC6_2_NT2_US16_bam_Bo_nguon_phong_mot_lan_chi_hien_nut_xac_nhan_chua_bo_gi", async () => {
  const ct = await chiTietHoa();
  const mot = s604(ct);
  expect(nut(mot)).toEqual(["Gọi", "Bỏ nguồn phòng này"]);
  expect(van(mot)).not.toContain("Xác nhận bỏ");
  expect((await getNguonPhong()).nguon_phong.some((d) => d.ten_hien_thi === "Chị Hoa")).toBe(true); // chưa gọi server
  const hai = s604(ct, { xacNhan: true });
  expect(van(hai)).toContain("Xác nhận bỏ Chị Hoa?");
  expect(van(hai)).toContain("Bạn không thấy lịch của Chị Hoa nữa. Muốn xem lại phải xin link mới.");
  expect(nut(hai)).toEqual(["Gọi", "Xác nhận bỏ Chị Hoa?", "Không bỏ"]);
});

test("test_YC6_2_NT3_US16_xac_nhan_thi_chu_nha_bien_khoi_nguon_phong_va_sale_khong_con_thay_lich", async () => {
  const hoa = (await getNguonPhong()).nguon_phong.find((d) => d.ten_hien_thi === "Chị Hoa")!;
  expect(await deleteKetNoi(hoa.id, khoa())).toEqual({ id: hoa.id, ket_qua: "sale_bo" });
  const ng = await getNguonPhong();
  expect(ng.nguon_phong.map((d) => d.ten_hien_thi)).toEqual(["Anh Tuấn"]);
  expect((await getSaleLich({ tu: "2026-10-07" })).can.map((c) => c.ma_can)).toEqual(["1103", "2208"]);
  await expect(getNguonPhongChiTiet(hoa.id)).rejects.toMatchObject({ loi: "KHONG_CON_QUYEN" });
});

// ---------- S6-02 · mục "Thêm căn tự nhập" (US16) ----------

test("test_YC6_3_NT1_US16_con_thieu_mot_trong_bon_o_thi_dong_Con_thieu_liet_ke_dung_o_thieu", () => {
  expect(dongConThieuTuNhap({ ten: "", sdt: "", ma: "", phongNgu: null })).toBe("Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ");
  expect(dongConThieuTuNhap({ ten: "Chú Bình", sdt: "", ma: "", phongNgu: null })).toBe("Còn thiếu: số điện thoại, mã căn, số phòng ngủ");
  expect(dongConThieuTuNhap({ ten: "Chú Bình", sdt: "0904 123 330", ma: "Villa Tuần Châu", phongNgu: null })).toBe("Còn thiếu: số phòng ngủ");
  expect(dongConThieuTuNhap({ ten: "Chú Bình", sdt: "09041", ma: "Villa", phongNgu: 3 })).toBe("Còn thiếu: số điện thoại"); // số sai định dạng
  expect(dongConThieuTuNhap({ ten: "Chú Bình", sdt: "0904 123 330", ma: "Villa", phongNgu: 0 })).toBeNull(); // Studio là 0, vẫn là đã chọn
});

test("test_YC6_3_NT2_NT3_US16_khong_nhap_gia_chu_van_them_duoc_can_nam_trong_nhom_tu_nhap_khong_co_lich_trong", async () => {
  const v = await postCan({ loai: "tu_nhap", ma_can: "Villa Tuần Châu", so_phong_ngu: 3, ten_chu_can: "Chú Bình", sdt_chu_can: "0904123330" }, khoa());
  expect(v).toMatchObject({ loai: "tu_nhap", ten_chu_can: "Chú Bình" });
  const l = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
  const c = l.can.find((x) => x.id === v.id)!;
  expect(c).toMatchObject({ nhom: "tu_nhap", loai: "tu_nhap", ten_chu_can: "Chú Bình" });
  expect(l.so_can.tu_nhap).toBe(1);
  expect(c.o.every((x) => x.trang_thai === "chua_biet")).toBe(true);
  // Còn dòng "Còn thiếu" nhắc đúng ô khi server nhận thiếu (DU_LIEU_SAI kèm tên ô)
  expect(await maLoi(postCan({ loai: "tu_nhap", ma_can: "V", so_phong_ngu: 3, ten_chu_can: "Chú Bình" } as never, khoa()))).toBe("DU_LIEU_SAI");
});

test("test_YC6_3_NT4_US16_12_anh_la_toi_da_server_tu_choi_13_anh_ids", async () => {
  const { postAnh } = await import("../services/api");
  const ids: string[] = [];
  for (let i = 0; i < 13; i++) ids.push((await postAnh({ ten: `a${i}.jpg`, duong_dan: `file://a${i}.jpg`, dung_luong: 1000 }, khoa())).anh_id);
  expect(await maLoi(postCan({ loai: "tu_nhap", ma_can: "V13", so_phong_ngu: 3, ten_chu_can: "B", sdt_chu_can: "0904123330", anh_ids: ids }, khoa()))).toBe("DU_LIEU_SAI");
  const ok = await postCan({ loai: "tu_nhap", ma_can: "V12", so_phong_ngu: 3, ten_chu_can: "B", sdt_chu_can: "0904123330", anh_ids: ids.slice(0, 12) }, khoa());
  expect((await getCanChiTiet(ok.id)).anh).toHaveLength(12);
});

test("test_YC6_3_NT5_US16_Sale_Lan_khong_thay_ten_va_so_chu_can_tu_nhap_cua_Hung", async () => {
  const v = await themVilla();
  await dung(LAN);
  expect((await getCanSale()).map((c) => c.ma_can)).toEqual([]);
  expect(await maLoi(getCanChiTiet(v.id))).toBe("KHONG_TIM_THAY");
  expect((await getSaleLich({ tu: "2026-10-07" })).can.some((c) => c.id === v.id)).toBe(false);
  // Mã căn trùng chỉ tính trong căn của cùng một sale (QT1.3-VD2): Lan có Villa Tuần Châu riêng
  const cuaLan = await themVilla({ ten_chu_can: "Cô Lan quen" });
  expect(cuaLan.id).not.toBe(v.id);
});

test("test_YC6_3_NT6_US16_hang_chip_Loai_view_co_dung_cac_lua_chon_cua_glossary_bo_Vinh", () => {
  const props = {
    form: formMoRongTrong(), dsToa: [], moTim: false, chuTim: "", ketQuaTim: [], coThuGon: false, anMoTa: true,
    onThuGon: khong, onChonToa: khong, onMoTim: khong, onChuTim: khong, onThemToaMoi: khong, onView: khong, onSoGiuong: khong, onMoTa: khong,
  };
  const s = html(<KhoiMoRong {...props} />);
  const phan = s.slice(s.indexOf("Loại view"), s.indexOf("Số giường"));
  expect(nut(phan)).toEqual(CHIP_LOAI_VIEW.map((v) => v.chu));
  expect(nut(phan)).toEqual(["Biển", "Thành phố", "Núi"]);
  expect(s).not.toContain("Mô tả gửi khách"); // S6-02 không có ô mô tả
});

test("test_YC6_3_NT7_NT8_US16_so_giuong_ghi_2PN_3_giuong_bo_trong_van_them_duoc_va_Con_thieu_khong_nhac_so_giuong", async () => {
  const co = await postCan({ loai: "tu_nhap", ma_can: "Villa", so_phong_ngu: 2, so_giuong: 3, loai_view: "bien", ten_chu_can: "Chú Bình", sdt_chu_can: "0904123330" }, khoa());
  expect(dongPhuCanSale(co)).toBe("2PN · 3 giường · view biển");
  const khongGiuong = await postCan({ loai: "tu_nhap", ma_can: "Villa 2", so_phong_ngu: 2, ten_chu_can: "Chú Bình", sdt_chu_can: "0904123330" }, khoa());
  expect(dongPhuCanSale(khongGiuong)).toBe("2PN");
  expect(dongConThieuTuNhap({ ten: "", sdt: "", ma: "", phongNgu: null })).not.toContain("giường");
});

// ---------- S6-03 · mục "Chi tiết căn tự nhập" (US16) ----------

const s603 = (can: CanChiTiet, them: Partial<React.ComponentProps<typeof NoiDungS6CanTuNhap>> = {}) =>
  html(
    <NoiDungS6CanTuNhap
      can={can}
      xacNhanXoa={false}
      dangXoa={false}
      loiXoa={null}
      loiMoi={null}
      onGoi={khong}
      onGuiKhach={khong}
      onSua={khong}
      onMoi={khong}
      onXoa={khong}
      onXacNhanXoa={khong}
      onKhongXoa={khong}
      onDatPhong={khong}
      {...them}
    />,
  );

test("test_YC6_4_NT1_NT4_US16_mot_dat_phong_da_ghi_hien_dung_ngay_tra_chu_thu_khach_va_phan_chenh_QT3_1_VD2", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-11-01", "2026-11-03", 2800000, 3400000);
  const ct = await getCanChiTiet(v.id);
  expect(ct.dat_phong_da_ghi).toHaveLength(1);
  expect(ct.dat_phong_da_ghi![0]).toMatchObject({ ngay_nhan: "2026-11-01", ngay_tra: "2026-11-03", tien_phong: 2800000, gia_ban: 3400000, tien_chenh: 600000 });
  const s = van(s603(ct));
  expect(s).toContain("Đặt phòng bạn đã ghi · 1");
  expect(s).toContain("Chỉ bạn thấy");
  expect(s).toContain("01/11 → 03/11 (2 đêm)");
  expect(s).toContain("Trả chủ 2.800.000đ · Thu khách 3.400.000đ");
  expect(s).toContain("+600.000đ");
  expect(s).toContain("Đây là đặt phòng của bạn, không phải lịch của căn. Ngày không có đặt phòng chưa chắc còn trống.");
  expect(s).toContain("0904 *** 330");
  expect(s).toContain("Chú Bình · chưa dùng app");
  expect(s).toContain("Căn này không có lịch trống. Khách hỏi ngày nào, bạn gọi Chú Bình hỏi ngày đó.");
});

test("test_YC6_4_NT2_US16_ngay_khong_co_dat_phong_khong_ghi_trong_va_S6_03_00_khi_chua_ghi_nao", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-11-01", "2026-11-03", 2800000, 3400000);
  const l = await getSaleLich({ tu: "2026-10-30", so_ngay: 7 });
  const o = l.can.find((x) => x.id === v.id)!.o;
  expect(o.map((x) => x.trang_thai)).toEqual(["chua_biet", "chua_biet", "cua_ban", "cua_ban", "chua_biet", "chua_biet", "chua_biet"]);
  expect(o.some((x) => x.trang_thai === "trong" || x.trang_thai === "kin")).toBe(false);
  const rong = s603(await getCanChiTiet((await themVilla({ ma_can: "Villa trống" })).id));
  expect(rong).toContain('data-man="S6-03-00"');
  expect(van(rong)).toContain("Đặt phòng bạn đã ghi · 0");
  expect(van(rong)).toContain("Chưa có đặt phòng nào cho căn này");
  // Phần "Đặt phòng bạn đã ghi" không có chữ "trống" (US16-NT25); câu "không có lịch trống" ở khối chủ căn là lời nhắc, không phải ô ngày
  const phan = rong.slice(rong.indexOf('data-khoi="dat-phong-da-ghi"'), rong.indexOf('data-khoi="can-nay"'));
  expect(van(phan)).not.toMatch(/trống/i);
  expect(nut(rong)).toContain("Đặt phòng");
});

test("test_YC6_4_NT3_US16_bam_Xoa_can_tu_nhap_mot_lan_chua_xoa_chi_hien_nut_xac_nhan_xac_nhan_thi_xoa_het_dat_phong", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-11-01", "2026-11-03", 2800000, 3400000);
  const ct = await getCanChiTiet(v.id);
  const mot = s603(ct);
  expect(nut(mot)).toContain("Xóa căn tự nhập");
  expect(van(mot)).not.toContain("Xác nhận xóa");
  expect((await getCanSale()).some((c) => c.id === v.id)).toBe(true); // chưa xóa
  const hai = s603(ct, { xacNhanXoa: true });
  expect(van(hai)).toContain("Xác nhận xóa Villa Tuần Châu?");
  expect(van(hai)).toContain("Chỉ xóa khỏi Nguồn phòng của bạn.");
  expect(await deleteCan(v.id, khoa())).toMatchObject({ id: v.id, ket_qua: "xoa" });
  expect((await getCanSale()).some((c) => c.id === v.id)).toBe(false);
  expect(await maLoi(getCanChiTiet(v.id))).toBe("KHONG_TIM_THAY");
});

test("test_YC6_4_NT5_US16_xoa_so_dien_thoai_chu_can_thi_khong_con_giu_so_va_nut_Goi_hoi_lich_khong_dung_duoc", async () => {
  const v = await themVilla();
  const sau = await patchCan(v.id, { sdt_chu_can: null }, khoa());
  expect(sau.sdt_chu_can).toBeNull();
  expect((await getCanChiTiet(v.id)).sdt_chu_can).toBeNull();
  const s = s603(sau);
  expect(s).toMatch(/<button[^>]*disabled[^>]*>Gọi hỏi lịch<\/button>/);
  expect(chuSdtChe("0904123330")).toBe("0904 *** 330");
});

// ---------- S6-05, S6-06 · mục "Ghi booking đã chốt cho căn tự nhập" (US16) ----------

const form = (them: Partial<FormGhi> = {}): FormGhi => ({ chip: "hom", ngayNhan: "2026-10-08", soDem: 1, tra: "1.400.000", thu: "1.600.000", ...them });
const s605 = (ct: CanChiTiet, f: FormGhi, them: Partial<React.ComponentProps<typeof NoiDungS6GhiDatPhong>> = {}) =>
  html(<NoiDungS6GhiDatPhong can={ct} hom="2026-10-07" form={f} trung={null} loi={null} dangLuu={false} onChip={khong} onNgayKhac={khong} onSoDem={khong} onTra={khong} onThu={khong} onLuu={khong} {...them} />);

test("test_YC6_5_NT1_NT2_US16_ngay_nhan_08_10_va_1_dem_ghi_khoang_ngay_tra_1_4tr_thu_1_6tr_thi_Ban_loi_200_000d", async () => {
  const ct = await getCanChiTiet((await themVilla()).id);
  const c = van(s605(ct, form({ chip: "khac" })));
  expect(c).toContain("Đặt phòng Villa Tuần Châu · đã chốt với Chú Bình");
  expect(c).toContain("Hôm nay 07/10");
  expect(c).toContain("Mai 08/10");
  expect(c).toContain("Ngày khác");
  expect(c).toContain("08/10 → 09/10 (1 đêm)");
  expect(c).toContain("Bạn lời 200.000đ");
  expect(chuBanLoi(1400000, 1600000)).toBe("Bạn lời 200.000đ");
  expect(c).toContain("Giá điền sẵn từ giá chủ đã lưu và giá bán của bạn.");
  expect(c).toContain("Cọc, số khách, ghi chú: thêm sau trong đặt phòng nếu cần.");
  expect(nut(s605(ct, form()))).toContain("Đặt phòng");
  expect(nut(s605(ct, form(), { dangLuu: true }))).toContain("Đang lưu…");
  expect(s605(ct, form({ tra: "" }))).toMatch(/<button[^>]*disabled[^>]*>Đặt phòng<\/button>/);
});

test("test_YC6_5_buoc_4_US16_tien_dien_san_tu_gia_chu_da_luu_va_gia_ban_cong_muc_cong_cua_Hung", async () => {
  const v = await themVilla();
  const k = await getKiemTrung({ can_id: v.id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09" });
  expect(k).toMatchObject({ khong_trung: true, so_dem: 1, tong_gia_chu: 1400000, tong_gia_ban: 1800000 }); // +400k mức cộng mặc định
  const hai = await getKiemTrung({ can_id: v.id, ngay_nhan: "2026-10-09", ngay_tra: "2026-10-11" });
  expect(hai).toMatchObject({ so_dem: 2, tong_gia_chu: 2800000, tong_gia_ban: 3600000 });
  // Chưa nhập giá chủ: không điền sẵn
  const khongGia = await postCan({ loai: "tu_nhap", ma_can: "V0", so_phong_ngu: 1, ten_chu_can: "B", sdt_chu_can: "0904123330" }, khoa());
  expect((await getKiemTrung({ can_id: khongGia.id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09" })).tong_gia_chu).toBeNull();
});

test("test_YC6_5_NT3_NT4_US16_ghi_xong_toast_ghi_thang_10_dat_phong_len_danh_sach_o_Ban_khong_Kin_khong_Trong", async () => {
  const v = await themVilla();
  expect(chuToastDaLuuDatPhong("2026-10-08", "2026-10-09")).toBe("Đã lưu đặt phòng 08/10 → 09/10. Tính vào thống kê tháng 10.");
  const dp = await ghi(v.id, "2026-10-08", "2026-10-09", 1400000, 1600000);
  expect(dp).toMatchObject({ ma_can: "Villa Tuần Châu", tien_phong: 1400000, gia_ban: 1600000 });
  expect((await getCanChiTiet(v.id)).dat_phong_da_ghi!.map((d) => d.ngay_nhan)).toEqual(["2026-10-08"]);
  const o = (await getSaleLich({ tu: "2026-10-07", so_ngay: 7 })).can.find((x) => x.id === v.id)!.o;
  expect(o.map((x) => x.trang_thai)).toEqual(["chua_biet", "cua_ban", "chua_biet", "chua_biet", "chua_biet", "chua_biet", "chua_biet"]);
  expect(JSON.stringify(o)).not.toMatch(/"kin"|"trong"/);
});

test("test_YC6_5_NT5_US16_QT1_3_VD1_ghi_08_10_den_10_10_khi_da_co_08_10_den_09_10_cung_can_thi_bao_trung_va_khong_luu", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-10-08", "2026-10-09", 1400000, 1600000);
  const e = await ghi(v.id, "2026-10-08", "2026-10-10", 2800000, 3200000).then(() => null, (x) => x as LoiApi);
  expect(e).toMatchObject({ loi: "TRUNG_LICH", dem_trung: ["2026-10-08"] });
  expect((await getCanChiTiet(v.id)).dat_phong_da_ghi).toHaveLength(1);
  const k = await getKiemTrung({ can_id: v.id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-10" });
  expect(k).toMatchObject({ khong_trung: false, dem_trung: ["2026-10-08"] });
});

test("test_YC6_5_NT6_US16_QT1_3_VD2_Lan_ghi_can_tu_nhap_cua_Lan_cung_ngay_voi_Hung_thi_luu_duoc", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-10-08", "2026-10-09", 1400000, 1600000);
  await dung(LAN);
  const cuaLan = await themVilla();
  await expect(ghi(cuaLan.id, "2026-10-08", "2026-10-09", 1400000, 1500000)).resolves.toBeTruthy();
  expect((await getCanChiTiet(cuaLan.id)).dat_phong_da_ghi).toHaveLength(1);
});

test("test_HV1_US16_bam_hai_lan_cung_khoa_chi_ghi_mot_dat_phong_mat_mang_khong_ghi_gi_va_giu_khoa", async () => {
  const v = await themVilla();
  const k = khoa();
  const than = { can_id: v.id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09", ten_khach: null, tien_phong: 1400000, gia_ban: 1600000, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null } as ThanDatPhong;
  banThu.datMatMang(true);
  await expect(postBooking(than, k)).rejects.toBeInstanceOf(LoiMang);
  banThu.datMatMang(false);
  expect((await getCanChiTiet(v.id)).dat_phong_da_ghi).toHaveLength(0);
  const [a, b] = await Promise.all([postBooking(than, k), postBooking(than, k)]);
  expect(b.id).toBe(a.id);
  expect((await getCanChiTiet(v.id)).dat_phong_da_ghi).toHaveLength(1);
});

// ---------- S1, S1-04, A5 · mục "Lịch phòng 7 ngày" (US16), mục "Màn đầu tiên khi chưa có dữ liệu" (US1) ----------

test("test_YC5_1_NT1_US16_nhom_Can_cua_toi_dung_tren_nhom_Nguon_phong", async () => {
  await themCanCuaToi("0812");
  await postCan({ ma_can: "1605", so_phong_ngu: 1 }, khoa());
  const l = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
  expect(l.so_can).toMatchObject({ cua_toi: 2, nguon_phong: 4, tu_nhap: 0 });
  expect(l.can.slice(0, 2).every((c) => c.nhom === "cua_toi")).toBe(true);
  expect(l.can.slice(2).every((c) => c.nhom === "nguon_phong")).toBe(true);
  const s = html(<NoiDungS1 lich={l} hom="2026-10-07" onDoiTuan={khong} onChuaLam={khong} />);
  expect(s.indexOf("Căn của tôi · 2")).toBeGreaterThan(-1);
  expect(s.indexOf("Căn của tôi · 2")).toBeLessThan(s.indexOf("Nguồn phòng · 4"));
});

test("test_YC5_1_NT3_US16_can_tu_nhap_o_ngay_ghi_dau_hoi_va_Ban_khong_co_o_trong_chu_thich_dung", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-10-08", "2026-10-09", 1400000, 1600000);
  const l = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
  const s = html(<NoiDungS1 lich={l} hom="2026-10-07" onDoiTuan={khong} onChuaLam={khong} />);
  const hang = s.slice(s.indexOf('data-can="Villa Tuần Châu"'));
  const o = [...hang.slice(0, hang.indexOf("s1-chu-thich")).matchAll(/data-trang-thai="([a-z_]+)">([^<]*)</g)].slice(0, 7);
  expect(o.map((m) => m[2])).toEqual(["?", "Bạn", "?", "?", "?", "?", "?"]);
  expect(van(s)).toContain("Chú Bình · tự nhập · 3PN");
  expect(van(s)).toContain("Căn tự nhập · 1");
  expect(van(s)).toContain("Căn tự nhập: gọi chủ hỏi");
  expect(van(s)).toContain("Đặt phòng bạn đã ghi");
  const trongTuNhap = l.can.find((c) => c.id === v.id)!.o.filter((x: OLichSale) => x.trang_thai === "trong");
  expect(trongTuNhap).toHaveLength(0);
});

test("test_YC5_1_NT4_US16_Gia_tang_dan_xep_theo_gia_hom_nay_can_cua_toi_van_o_tren_cung_ban_nhieu_xep_theo_so_dat_phong_cua_sale", async () => {
  const cuaToi = await themCanCuaToi("0812");
  const ten = (await getSaleLich({ tu: "2026-10-07", sap_xep: "ten" })).can.map((c) => c.ma_can);
  expect(ten).toEqual(["0812", "1103", "1509", "2208", "3402"]);
  // Giá hôm nay (T4 07/10, giá bán): 1103 800k, 1509 1,1tr, 3402 1,2tr, 2208 1,8tr; căn của tôi chưa đặt giá vẫn ở trên cùng
  const gia = await getSaleLich({ tu: "2026-10-07", sap_xep: "gia_tang" });
  expect(gia.can.map((c) => c.ma_can)).toEqual(["0812", "1103", "1509", "3402", "2208"]);
  expect(gia.can[0].id).toBe(cuaToi.id);
  // Hùng bán 3402 ba lần thì 3402 lên đầu nguồn phòng (1103 và 1509 có hai lần, 2208 một lần, DLM.6)
  const ng = (await getNguonPhong()).nguon_phong;
  const id3402 = ng.find((d) => d.ten_hien_thi === "Chị Hoa")!.can!.find((c) => c.ma_can === "3402")!.id;
  const knHoa = ng.find((d) => d.ten_hien_thi === "Chị Hoa")!.id;
  for (const [nhan, tra] of [["2026-10-25", "2026-10-26"], ["2026-10-27", "2026-10-28"], ["2026-10-29", "2026-10-30"]]) {
    banThu.themBooking({ can_id: id3402, ngay_nhan: nhan, ngay_tra: tra, trang_thai: "hieu_luc", ten_sale: "Sale Hùng", sale_id: knHoa, tien_phong: 800000, trang_thai_tien: "chua_coc", tien_coc: null, tao_luc: "2026-10-01T02:00:00.000Z" });
  }
  const ban = await getSaleLich({ tu: "2026-10-07", sap_xep: "ban_nhieu" });
  expect(ban.can.map((c) => c.ma_can)).toEqual(["0812", "3402", "1103", "1509", "2208"]);
  expect(await maLoi(getSaleLich({ tu: "2026-10-07", sap_xep: "linh_tinh" as never }))).toBe("DU_LIEU_SAI");
});

test("test_YC5_1_NT6_US16_chu_nha_rut_quyen_thi_nhom_Nguon_phong_giam_theo_so_can_cua_chu_do", async () => {
  const truoc = (await getSaleLich({ tu: "2026-10-07" })).so_can.nguon_phong;
  banThu.chuNhaXoaTaiKhoan(HOA);
  const sau = await getSaleLich({ tu: "2026-10-07" });
  expect(truoc - sau.so_can.nguon_phong).toBe(2);
  expect(sau.can.map((c) => c.ma_can)).toEqual(["1103", "2208"]);
});

test("test_YC5_1_S1_04_chon_Theo_ten_Gia_tang_dan_hoac_Ban_nhieu_nhat_kem_ghi_chu_Can_cua_toi_luon_hien_dau", () => {
  const s = html(<HopSapXep sapXep="ten" onChon={khong} onDong={khong} />);
  expect(CAC_CACH_XEP.map((c) => c.chu)).toEqual(["Theo tên", "Giá tăng dần", "Bán nhiều nhất"]);
  expect(nut(s)).toEqual(["Theo tên", "Giá tăng dần", "Bán nhiều nhất"]);
  expect(van(s)).toContain("Căn của tôi luôn hiện đầu danh sách.");
  expect(s).toContain('data-man="S1-04"');
  expect(s).toMatch(/aria-pressed="true"[^>]*>Theo tên/);
  expect(chuOLich({ ngay: "2026-10-07", trang_thai: "kin" })).toBe("Kín");
  expect(chuOLich({ ngay: "2026-10-07", trang_thai: "trong", gia_chu: 750000 })).toBe("750k");
});

test("test_YC1_4_NT2_US16_sale_chua_co_nguon_phong_thay_A5_nut_Them_can_thu_cong_noi_sang_S6_02", async () => {
  banThu.xoaSach();
  banThu.napDuLieuSale("moi");
  await postPhien();
  await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: "2026-10-07T02:00:00.000Z" });
  const l = await getSaleLich({ tu: "2026-10-07" });
  expect(l.can).toHaveLength(0);
  expect(nut(html(<NoiDungA5 onXinLich={khong} onThemThuCong={khong} />))).toEqual(["Gửi tin nhắn xin lịch đến chủ nhà", "Thêm căn thủ công"]);
  expect(DUONG.THEM_CAN_TU_NHAP).toBe("/can-sale/them-tu-nhap");
});

// ---------- Quyền (PQ13, PQ14, PQ17, PQ3.SALE) ----------

test("test_PQ14_SALE_US16_sale_khac_va_chu_nha_khong_doc_sua_xoa_hay_ghi_dat_phong_vao_can_tu_nhap_cua_Hung", async () => {
  const v = await themVilla();
  await ghi(v.id, "2026-10-08", "2026-10-09", 1400000, 1600000);
  await dung(LAN);
  expect(await maLoi(getCanChiTiet(v.id))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(patchCan(v.id, { ten_chu_can: "Sửa trộm" }, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(deleteCan(v.id, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(ghi(v.id, "2026-10-20", "2026-10-21", 1, 1))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(getKiemTrung({ can_id: v.id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09" }))).toBe("KHONG_TIM_THAY");
  await dung(HOA);
  expect(await maLoi(getCanChiTiet(v.id))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(postCan({ loai: "tu_nhap", ma_can: "X", so_phong_ngu: 1, ten_chu_can: "B", sdt_chu_can: "0904123330" }, khoa()))).toBe("DU_LIEU_SAI"); // PQ14.CHU
  await dung(HUNG);
  expect((await getCanChiTiet(v.id)).ten_chu_can).toBe("Chú Bình"); // dữ liệu không đổi
  expect((await getCanChiTiet(v.id)).dat_phong_da_ghi).toHaveLength(1);
});

test("test_PQ17_SALE_PQ3_SALE_US16_sale_khong_bo_nguon_cua_sale_khac_va_khong_sua_hay_xoa_can_cua_chu_nha", async () => {
  const hoaDoiVoiHung = (await getNguonPhong()).nguon_phong.find((d) => d.ten_hien_thi === "Chị Hoa")!;
  const can1509 = hoaDoiVoiHung.can!.find((c) => c.ma_can === "1509")!;
  expect(await maLoi(patchCan(can1509.id, { so_phong_ngu: 3 }, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(deleteCan(can1509.id, khoa()))).toBe("KHONG_TIM_THAY");
  await dung(LAN);
  expect(await maLoi(deleteKetNoi(hoaDoiVoiHung.id, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(getNguonPhongChiTiet(hoaDoiVoiHung.id))).toBe("KHONG_TIM_THAY");
  await dung(HOA);
  expect(await maLoi(getNguonPhong())).toBe("KHONG_TIM_THAY"); // chủ nhà không có bản sale
});

test("test_HV2_US16_mat_mang_thi_tai_tab_Can_bao_loi_mang_khong_thanh_loi_server", async () => {
  banThu.datMatMang(true);
  await expect(getCanSale()).rejects.toBeInstanceOf(LoiMang);
  await expect(getNguonPhong()).rejects.toBeInstanceOf(LoiMang);
  await expect(getSaleLich({ tu: "2026-10-07" })).rejects.toBeInstanceOf(LoiMang);
});

// Kiểu dùng ở test, giữ để đọc dễ
export type _Dung = LichSale | NguonPhong;
