import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, test } from "vitest";
import { tinNhanChuNha, chuGio, chuLoiKhongGui } from "../components/yeu-cau-hien-thi";
import { DieuKhienXinSo, tieuDePopup } from "../components/xin-so";
import {
  banThu,
  getBooking,
  getBookingSale,
  getLichThang,
  getSaleCan,
  getSaleLich,
  getSaleTim,
  getYeuCau,
  getYeuCauDS,
  patchBooking,
  postBooking,
  postPhien,
  postYeuCau,
  postYeuCauChapNhan,
  postYeuCauHuy,
  postYeuCauTuChoi,
} from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { datCongZalo, zalo, type CongZalo } from "../services/zalo";
import type { YeuCauChu, YeuCauSale } from "../services/yeu-cau";
import { boNhoHoSo } from "../stores/ho-so";
import { boNhoLoiNhan } from "../stores/yeu-cau";
import { KhoiYeuCauCN1 } from "./cn1-yeu-cau-man";
import { NoiDungCN9 } from "./cn9-man";
import { NoiDungKetQuaSale, NoiDungS302 } from "./s3-yeu-cau-man";

// US15 · Test màn yêu cầu đặt phòng trên server giả (DLM): S3-02, S3-03, S3-04, S3-05, S3-07, S3-08, S3-09, CN1-03, CN9, CN9-02, CN9-03.
// Hôm nay 07/10/2026 (DLM.1). Giá 1509: T7 1.300.000đ, CN 900.000đ; Hùng cộng +200k mỗi đêm (DLM.3, DLM.7). Server thật có test riêng (src/server/api/us15.test.js).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const van = (s: string) => chu(s).replace(/\|+/g, " ").replace(/\s+/g, " ").trim();
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

const HOA = "zalo-chi-hoa";
const HUNG = "zalo-sale-hung";
const LAN = "zalo-sale-lan";
const TUAN = "zalo-anh-tuan";
let dem = 0;
const khoa = () => `khoa-thu-us15-${String(++dem).padStart(6, "0")}`;
const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  await postPhien();
};
let ids: Record<string, string>;

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  boNhoHoSo.xoa();
  boNhoLoiNhan.xoaHet();
  datCongZalo(null);
  banThu.napDuLieuSale("moi");
  await dung(HUNG);
  ids = Object.fromEntries((await getSaleTim({ ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26", ghi_lich_su: false })).can.map((c) => [c.ma_can, c.id]));
});
afterEach(() => datCongZalo(null));

// Gửi yêu cầu với tư cách một sale, rồi trả lại người đang dùng máy
const gui = async (zaloId: string, ma: string, nhan: string, tra: string, loiNhan?: string) => {
  await dung(zaloId);
  return postYeuCau({ can_id: ids[ma], ngay_nhan: nhan, ngay_tra: tra, loi_nhan: loiNhan ?? null }, khoa());
};
const tienPhong = { trang_thai_tien: "chua_coc" as const, tien_coc: null, so_khach: 2, gio_nhan: null, gio_tra: null, ghi_chu: null, ten_khach: "Khách lẻ" };

const s302 = (can: Awaited<ReturnType<typeof getSaleCan>>, them: Partial<React.ComponentProps<typeof NoiDungS302>> = {}) =>
  html(
    <NoiDungS302
      can={can}
      ngay={{ nhan: "2026-10-24", tra: "2026-10-26" }}
      loiNhan=""
      dangGui={false}
      loi={null}
      datRoi={null}
      onDoiLoiNhan={khong}
      onGui={khong}
      onTimCanKhac={khong}
      onChonNgay={khong}
      {...them}
    />,
  );
const ketQuaSale = (yc: YeuCauSale, them: Partial<React.ComponentProps<typeof NoiDungKetQuaSale>> = {}) =>
  html(
    <NoiDungKetQuaSale
      yc={yc}
      canTuongTu={null}
      loiCanTuongTu={false}
      hoiHuy={false}
      dangLam={null}
      loi={null}
      onNhanZalo={khong}
      onGoi={khong}
      onHuy={khong}
      onVeLich={khong}
      onMoCan={khong}
      onXemTatCa={khong}
      {...them}
    />,
  );
const cn9 = (yc: YeuCauChu, them: Partial<React.ComponentProps<typeof NoiDungCN9>> = {}) =>
  html(
    <NoiDungCN9
      yc={yc}
      ketQua={null}
      hienChip={false}
      lyDo={null}
      dangLam={null}
      loi={null}
      onGoi={khong}
      onChapNhan={khong}
      onMoTuChoi={khong}
      onQuayLai={khong}
      onChonLyDo={khong}
      onGuiTuChoi={khong}
      onXemDatPhong={khong}
      onVeLich={khong}
      {...them}
    />,
  );
const canTuongTu = async (yc: YeuCauSale) =>
  (await getSaleTim({ ngay_nhan: yc.ngay_nhan, ngay_tra: yc.ngay_tra, ghi_lich_su: false, bo_can_ids: [yc.can.id] })).can;
const choDS = async () => (await getYeuCauDS({ phia: "nhan", trang_thai: ["cho_chu"] })).muc as YeuCauChu[];

test("test_YC4_5_NT3_US15_KB1_S3_02_ghi_hai_gia_chu_nha_va_ban_cho_khach", async () => {
  const can = await getSaleCan(ids["1509"], { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" });
  const v = van(s302(can));
  expect(v).toContain("ICON40 1509 · 2PN");
  expect(v).toContain("Chị Hoa · 24/10 → 26/10 (2 đêm)");
  expect(v).toContain("Giá bán cho khách 2.600.000đ");
  expect(v).toContain("Giá chủ nhà 2.200.000đ");
  expect(v).toContain("Chủ nhà: Chị Hoa · 2.200.000đ");
  expect(v).toContain("ĐẶT PHÒNG");
  expect(v).toContain("Nhắn chủ nhà (không bắt buộc)");
  expect(v).toContain("Chủ nhà nhận yêu cầu trong app. Thành đặt phòng khi chủ nhà chấp nhận.");
  expect(nut(s302(can))).toEqual(["Gửi yêu cầu đặt phòng"]);
});

test("test_YC4_5_NT1_US15_KB2_gui_thanh_cong_co_gio_gui_va_man_cho_ba_nut", async () => {
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26", "Khách đến tối");
  expect(yc.trang_thai).toBe("cho_chu");
  expect(yc.gui_luc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(yc.gia_chu).toBe(2_200_000);
  expect(yc.gia_ban).toBe(2_600_000);
  expect(yc.loi_nhan).toBe("Khách đến tối");
  // Giờ theo giờ Việt Nam: 07:20 UTC là 14:20 (mục "Sale gửi yêu cầu đặt phòng" (US15) bước 4)
  expect(chuGio("2026-10-07T07:20:00.000Z")).toBe("14:20");
  const m = ketQuaSale(yc);
  const v = van(m);
  expect(v).toContain("Đang chờ Chị Hoa chấp nhận");
  expect(v).toContain(`Đã gửi lúc ${chuGio(yc.gui_luc)} trong app. Nhắn thêm qua Zalo để chủ nhà thấy nhanh hơn. Bạn được báo khi chủ nhà chấp nhận hoặc từ chối.`);
  expect(nut(m)).toEqual(["Nhắn chủ nhà qua Zalo", "Gọi chủ nhà", "Hủy yêu cầu"]);
  // Nút gửi đổi chữ khi đang gửi (HV1 bước 3)
  const can = await getSaleCan(ids["1509"], { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" });
  expect(nut(s302(can, { dangGui: true }))).toEqual(["Đang gửi…"]);
  expect(s302(can, { dangGui: true })).toMatch(/<button[^>]*disabled[^>]*>Đang gửi…/);
});

test("test_YC4_5_NT2_US15_KB3_yeu_cau_cho_chua_chiem_dem_sale_khac_van_thay_trong", async () => {
  await gui(HUNG, "1509", "2026-10-24", "2026-10-26");
  await dung(LAN);
  const lich = await getSaleLich({ tu: "2026-10-24", so_ngay: 7 });
  const o = lich.can.find((c) => c.id === ids["1509"])!.o;
  expect(o.find((x) => x.ngay === "2026-10-24")!.trang_thai).toBe("trong");
  expect(o.find((x) => x.ngay === "2026-10-25")!.trang_thai).toBe("trong");
  const tim = await getSaleTim({ ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26", ghi_lich_su: false });
  expect(tim.can.map((c) => c.ma_can)).toContain("1509");
  await dung(HOA);
  const thang = await getLichThang({ thang: "2026-10" });
  expect(thang.ngay.filter((n) => n.ngay === "2026-10-24" || n.ngay === "2026-10-25")).toEqual([]);
});

test("test_YC4_5_NT4_US15_KB11_dem_da_co_booking_thi_bao_da_dat_roi_khong_tao_yeu_cau", async () => {
  await dung(HOA);
  const hoaCan = (await getLichThang({ thang: "2026-10" })).can.find((c) => c.ma_can === "1509")!;
  await postBooking({ can_id: hoaCan.can_id, ngay_nhan: "2026-10-17", ngay_tra: "2026-10-19", tien_phong: 2_200_000, ...tienPhong }, khoa());
  await dung(HUNG);
  const truoc = banThu.yeuCauDaLuu().length;
  const loi = await postYeuCau({ can_id: ids["1509"], ngay_nhan: "2026-10-18", ngay_tra: "2026-10-19" }, khoa()).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiApi);
  expect(loi.loi).toBe("TRUNG_LICH");
  expect(loi.ly_do).toBe("Căn này đã được đặt rồi");
  expect(banThu.yeuCauDaLuu()).toHaveLength(truoc);
  const lich = await getSaleLich({ tu: "2026-10-17", so_ngay: 7 });
  const o = lich.can.find((c) => c.id === ids["1509"])!.o.filter((x) => x.ngay <= "2026-10-19");
  expect(o.find((x) => x.ngay === "2026-10-18")!.trang_thai).toBe("kin");
  const can = await getSaleCan(ids["1509"], { ngay_nhan: "2026-10-18", ngay_tra: "2026-10-19" });
  const m = s302(can, { datRoi: { o } });
  const v = van(m);
  expect(v).toContain("Căn này đã được đặt rồi");
  expect(v).toContain("Yêu cầu chưa được gửi");
  expect(v).toMatch(/T[2-7]|CN/);
  expect(m).toContain('data-ngay="2026-10-18" data-trang-thai="kin"');
  expect(nut(m)).toEqual(["Tìm căn khác cùng ngày"]);
  // Hùng không có yêu cầu 18/10 → 19/10 (chủ nhà cũng không thấy)
  await dung(HOA);
  expect((await choDS()).filter((y) => y.ngay_nhan === "2026-10-18")).toEqual([]);
});

test("test_QT1_4_VD1_US15_gui_trung_dem_B1_TRUNG_LICH_va_khong_co_dong_moi", async () => {
  const truoc = banThu.yeuCauDaLuu().length;
  const loi = await postYeuCau({ can_id: ids["1509"], ngay_nhan: "2026-10-10", ngay_tra: "2026-10-11" }, khoa()).catch((e) => e);
  expect(loi.loi).toBe("TRUNG_LICH");
  expect(banThu.yeuCauDaLuu()).toHaveLength(truoc);
});

test("test_YC4_5_NT5_US15_KB10_sale_huy_thi_nhan_da_huy_va_bien_khoi_khoi_yeu_cau_cua_chu", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-14", "2026-11-16");
  // Bấm lần đầu chỉ hỏi lại, yêu cầu chưa hủy
  expect(nut(ketQuaSale(yc, { hoiHuy: true }))).toContain("Xác nhận hủy yêu cầu?");
  expect((await getYeuCau(yc.id)).trang_thai).toBe("cho_chu");
  await dung(HOA);
  expect((await choDS()).map((y) => y.id)).toContain(yc.id);
  await dung(HUNG);
  const huy = await postYeuCauHuy(yc.id, khoa());
  expect(huy.trang_thai).toBe("da_huy");
  const v = van(ketQuaSale(huy));
  expect(v).toContain("Đã hủy yêu cầu");
  expect(v).toContain("Bạn đã hủy yêu cầu đặt phòng 14/11 → 16/11. Chị Hoa không còn thấy yêu cầu này.");
  expect(nut(ketQuaSale(huy))).toEqual(["Về lịch phòng"]);
  await dung(HOA);
  expect((await choDS()).map((y) => y.id)).not.toContain(yc.id);
  // Hủy rồi chủ nhà chấp nhận: TRANG_THAI_DA_DOI, không có đặt phòng
  const loi = await postYeuCauChapNhan(yc.id, khoa()).catch((e) => e);
  expect(loi.loi).toBe("TRANG_THAI_DA_DOI");
});

test("test_YC4_5_NT6_US15_KB15_14_ngay_khong_tra_loi_thi_het_han_va_S3_09_co_can_tuong_tu_gia_ban", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-20", "2026-11-21");
  expect(Date.parse(yc.het_han_luc) - Date.parse(yc.gui_luc)).toBe(14 * 24 * 3600_000);
  // 14 ngày trừ một phút: còn chờ; đủ 14 ngày: hết hạn (gửi 14:20 ngày 01/10, hết 14:20 ngày 15/10)
  banThu.tienGioYeuCau(14 * 24 * 3600_000 - 60_000);
  expect((await getYeuCau(yc.id)).trang_thai).toBe("cho_chu");
  banThu.tienGioYeuCau(60_000);
  const het = (await getYeuCau(yc.id)) as YeuCauSale;
  expect(het.trang_thai).toBe("het_han");
  await dung(HOA);
  expect((await choDS()).map((y) => y.id)).not.toContain(yc.id);
  expect((await postYeuCauChapNhan(yc.id, khoa()).catch((e) => e)).loi).toBe("TRANG_THAI_DA_DOI");
  await dung(HUNG);
  const can = await canTuongTu(het);
  const m = ketQuaSale(het, { canTuongTu: can });
  const v = van(m);
  expect(v).toContain("Yêu cầu đã hết hạn");
  expect(v).toContain("Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần. Gửi lúc");
  expect(v).toContain("CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY");
  expect(nut(m)).toContain("Xem tất cả căn trống");
  // Mục căn tương tự bỏ căn đã gửi (bo_can_ids)
  expect(v.slice(v.indexOf("CĂN TƯƠNG TỰ"))).not.toContain("1509");
});

test("test_YC4_5_NT6_US15_KB15_Y2_co_san_trong_du_lieu_mau_la_het_han_va_S3_09_ghi_gia_ban_cua_Hung", async () => {
  const ds = (await getYeuCauDS({ phia: "gui", trang_thai: ["het_han"] })).muc as YeuCauSale[];
  expect(ds).toHaveLength(1);
  const y2 = ds[0];
  expect(y2.can.ma_can).toBe("1509");
  expect([y2.ngay_nhan, y2.ngay_tra]).toEqual(["2026-09-27", "2026-09-28"]);
  const can = await canTuongTu(y2);
  const m = ketQuaSale(y2, { canTuongTu: can });
  const v = van(m);
  expect(v).toContain("Sapphire 1103");
  expect(v).toContain("Bạn bán 800.000đ · Anh Tuấn"); // 700.000đ + 100k
  expect(v).toContain("À La Carte 2208");
  expect(v).toContain("Bạn bán 1.800.000đ · Anh Tuấn"); // 1.500.000đ + 300k
  expect(v).not.toContain("700.000đ");
  expect(v).not.toContain("1.500.000đ");
  // Chủ nhà không thấy Y2 trong khối chờ (KB15 bước 3)
  await dung(HOA);
  expect((await choDS()).filter((y) => y.ngay_nhan === "2026-09-27")).toEqual([]);
});

test("test_YC4_5_NT7_US15_KB16_chua_co_so_thi_popup_truoc_va_De_sau_van_gui_yeu_cau", async () => {
  banThu.xoaSoDienThoai();
  boNhoHoSo.xoa();
  let xin = 0;
  datCongZalo({
    async xinTenVaSo() {
      xin++;
      return { kq: "tu_choi" as const };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
  } as unknown as CongZalo);
  const dk = new DieuKhienXinSo();
  let yc: YeuCauSale | null = null;
  await dk.chay(async () => {
    yc = await postYeuCau({ can_id: ids["1509"], ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" }, khoa());
  });
  // Popup của app hiện trước, chưa có hộp thoại Zalo, chưa gửi
  expect(dk.mo).not.toBeNull();
  expect(xin).toBe(0);
  expect(yc).toBeNull();
  expect(tieuDePopup("chu_nha")).toBe("Chia sẻ số điện thoại với chủ nhà");
  await dk.deSau();
  expect(xin).toBe(0);
  expect(yc).not.toBeNull();
  expect(yc!.trang_thai).toBe("cho_chu");
  // CN9: có tên Sale Hùng, không có số điện thoại (PQ2.CHU)
  await dung(HOA);
  const y = (await getYeuCau(yc!.id)) as YeuCauChu;
  expect(y.sale.ten_hien_thi).toBe("Sale Hùng");
  expect(y.sale.so_dien_thoai).toBeNull();
  const m = cn9(y);
  expect(van(m)).toContain("Sale Hùng");
  expect(nut(m)).not.toContain("Gọi");
});

test("test_YC4_5_NT8_US15_chu_nha_da_rut_quyen_thi_bao_ngay_khong_gui_duoc_yeu_cau", () => {
  expect(chuLoiKhongGui("Chủ nhà đã xóa tài khoản trên Home247")).toBe("Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.");
});

test("test_YC4_6_NT1_US15_KB4_CN1_03_co_khoi_yeu_cau_va_CN9_mo_dung_yeu_cau", async () => {
  // Chưa có yêu cầu chờ: không có khối (KB23)
  await dung(HOA);
  expect(html(<KhoiYeuCauCN1 ds={await choDS()} onMo={khong} />)).toBe("");
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26", "Khách đến tối");
  await dung(HOA);
  const ds = await choDS();
  expect(ds.map((y) => y.id)).toEqual([yc.id]);
  const cn1 = html(<KhoiYeuCauCN1 ds={ds} onMo={khong} />);
  const v = van(cn1);
  expect(v).toContain("YÊU CẦU ĐẶT PHÒNG · 1");
  expect(v).toContain("Sale Hùng đặt phòng 1509");
  expect(v).toContain("24/10 → 26/10");
  expect(v).toMatch(/gửi (vừa xong|\d+ phút trước)/);
  expect(v).toContain("Chờ bạn");
  expect(nut(cn1)).toEqual(["Xem và trả lời"]);
  const y = (await getYeuCau(yc.id)) as YeuCauChu;
  const m = cn9(y);
  const w = van(m);
  expect(w).toContain("Sale Hùng");
  expect(nut(m)).toContain("Gọi");
  expect(w).toContain("Phòng 1509");
  expect(w).toContain("Ngày ở 24/10 → 26/10 (2 đêm)");
  expect(w).toContain("Giá của bạn 2.200.000đ");
  expect(w).toContain("SALE NHẮN Khách đến tối");
  expect(nut(m)).toEqual(["Gọi", "Chấp nhận đặt phòng", "Từ chối"]);
});

test("test_YC4_6_NT2_US15_KB4_PQ11_CHU_chu_nha_chi_thay_gia_cua_minh_khong_co_gia_ban", async () => {
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26", "Khách đến tối");
  await dung(HOA);
  const ds = await choDS();
  const y = (await getYeuCau(yc.id)) as YeuCauChu;
  for (const json of [JSON.stringify(ds), JSON.stringify(y)]) {
    expect(json).not.toMatch(/gia_ban|tien_chenh|muc_cong|2600000/);
  }
  expect(y.gia_chu).toBe(2_200_000);
  for (const s of [html(<KhoiYeuCauCN1 ds={ds} onMo={khong} />), cn9(y), cn9(y, { hienChip: true })]) {
    const v = van(s);
    expect(v).not.toContain("2.600.000");
    expect(v).not.toContain("Giá bán");
    expect(v).not.toContain("200k");
  }
  // Sau khi chấp nhận: kết quả và đặt phòng của chủ nhà cũng không có giá bán
  const kq = await postYeuCauChapNhan(yc.id, khoa());
  expect(JSON.stringify(kq)).not.toMatch(/gia_ban|tien_chenh|2600000/);
  expect(JSON.stringify(await getBooking(kq.booking.id))).not.toMatch(/gia_ban|tien_chenh|2600000/);
  expect(van(cn9(kq.yeu_cau, { ketQua: kq }))).not.toContain("2.600.000");
});

test("test_YC4_6_NT3_US15_KB6_chap_nhan_thi_booking_vao_lich_sale_khac_thay_kin_va_sale_duoc_bao", async () => {
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26");
  await dung(HOA);
  const kq = await postYeuCauChapNhan(yc.id, khoa());
  expect(kq.yeu_cau.trang_thai).toBe("da_chot");
  expect(kq.yeu_cau.booking_id).toBe(kq.booking.id);
  expect(kq.booking).toMatchObject({ ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26", so_dem: 2, tien_phong: 2_200_000 });
  const m = cn9(kq.yeu_cau, { ketQua: kq });
  const v = van(m);
  expect(v).toContain("✓ Đã nhận đặt phòng 1509");
  expect(v).toContain("Đặt phòng đã vào lịch. Sale Hùng được báo.");
  expect(nut(m)).toEqual(["Xem đặt phòng", "Về lịch"]);
  // 24/10, 25/10 tô đã đặt; 26/10 không tô (QT2.1)
  const thang = await getLichThang({ thang: "2026-10" });
  const co = (n: string) => thang.ngay.some((x) => x.ngay === n);
  expect([co("2026-10-24"), co("2026-10-25"), co("2026-10-26")]).toEqual([true, true, false]);
  expect((await choDS()).map((y) => y.id)).not.toContain(yc.id);
  // Sale Lan: Kín, không có tên Sale Hùng (US15-NT12, PQ4.SALE)
  await dung(LAN);
  const lich = await getSaleLich({ tu: "2026-10-24", so_ngay: 7 });
  const json = JSON.stringify(lich.can.find((c) => c.id === ids["1509"])!.o);
  expect(json).toContain('"trang_thai":"kin"');
  expect(json).not.toMatch(/Hùng|sale_id|ten/);
  // Sale Hùng: S3-04 và đặt phòng với giá bán đã báo
  await dung(HUNG);
  const s = (await getYeuCau(yc.id)) as YeuCauSale;
  expect(s.trang_thai).toBe("da_chot");
  expect(s.tien_chenh).toBe(400_000);
  const m4 = ketQuaSale(s);
  const w = van(m4);
  expect(w).toContain("✓ Chị Hoa đã chấp nhận đặt phòng");
  expect(w).toContain("Đặt phòng đã vào lịch của chủ nhà. Ngày 24/10 → 26/10 hiện Kín với các sale khác.");
  expect(nut(m4)).toEqual(["Về lịch phòng"]);
  const bk = await getBookingSale(kq.booking.id);
  expect(bk.gia_ban).toBe(2_600_000);
  expect(bk.tien_phong).toBe(2_200_000);
});

test("test_YC4_6_NT3_US15_KB24_chap_nhan_hai_lan_cung_khoa_chi_tao_mot_dat_phong_va_nut_dang_gui", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-02", "2026-11-03");
  await dung(HOA);
  const k = khoa();
  const [a, b] = await Promise.all([postYeuCauChapNhan(yc.id, k), postYeuCauChapNhan(yc.id, k)]);
  expect(a.booking.id).toBe(b.booking.id);
  const ngay = (await getLichThang({ thang: "2026-11" })).ngay.filter((n) => n.ngay === "2026-11-02");
  expect(ngay).toHaveLength(1);
  // Khóa khác sau khi đã chấp nhận: TRANG_THAI_DA_DOI
  expect((await postYeuCauChapNhan(yc.id, khoa()).catch((e) => e)).loi).toBe("TRANG_THAI_DA_DOI");
  const y = (await getYeuCau(yc.id)) as YeuCauChu;
  const m = cn9({ ...y, trang_thai: "cho_chu" }, { dangLam: "chap_nhan" });
  expect(m).toMatch(/<button[^>]*disabled[^>]*>Đang gửi…/);
});

test("test_YC4_6_NT4_US15_KB8_tu_choi_ba_chip_gui_ly_do_da_co_khach_va_sale_thay_o_S3_05", async () => {
  const yc = await gui(HUNG, "1509", "2026-10-31", "2026-11-02");
  await dung(HOA);
  const y = (await getYeuCau(yc.id)) as YeuCauChu;
  // Bấm "Từ chối": ba chip, "Gửi từ chối cho sale", "Quay lại"; chưa bấm thì không có chip
  const co = cn9(y, { hienChip: true });
  expect(nut(co).filter((n) => n !== "Gọi")).toEqual(["Đã có khách đặt", "Đang sửa phòng", "Lý do khác", "Gửi từ chối cho sale", "Quay lại"]);
  expect(nut(cn9(y))).not.toContain("Đã có khách đặt");
  // Lý do chỉ server đặt thì không nhận từ app; không có lý do thì DU_LIEU_SAI
  expect((await postYeuCauTuChoi(yc.id, { ly_do: "chu_nhan_dat_khac" as never }, khoa()).catch((e) => e)).loi).toBe("DU_LIEU_SAI");
  expect((await getYeuCau(yc.id)).trang_thai).toBe("cho_chu");
  const tc = await postYeuCauTuChoi(yc.id, { ly_do: "da_co_khach" }, khoa());
  expect(tc.trang_thai).toBe("bi_tu_choi");
  expect(tc.ly_do).toBe("da_co_khach");
  const m3 = cn9(tc);
  const v = van(m3);
  expect(v).toContain("Đã từ chối yêu cầu của Sale Hùng");
  expect(v).toContain('Sale Hùng được báo kèm lý do "Đã có khách đặt"');
  expect(nut(m3)).toEqual(["Về lịch"]);
  // 31/10, 01/11 vẫn trống trong lịch
  const thang = await getLichThang({ thang: "2026-10" });
  expect(thang.ngay.filter((n) => n.ngay === "2026-10-31")).toEqual([]);
  expect(JSON.stringify(tc)).not.toMatch(/gia_ban|tien_chenh/);
  // Sale: S3-05 với lý do và căn tương tự giá bán (US15-NT13, US15-NT6)
  await dung(HUNG);
  const s = (await getYeuCau(yc.id)) as YeuCauSale;
  expect(s.ly_do).toBe("da_co_khach");
  const can = await canTuongTu(s);
  expect(can.map((c) => c.ma_can)).not.toContain("1509");
  const m5 = ketQuaSale(s, { canTuongTu: can });
  const w = van(m5);
  expect(w).toContain("Yêu cầu bị từ chối");
  expect(w).toContain("Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt.");
  expect(w).toContain("CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY");
  expect(w).toContain("Sapphire 1103");
  expect(w).toContain("Bạn bán 1.600.000đ · Anh Tuấn");
  expect(w).toContain("À La Carte 2208");
  expect(w).toContain("Bạn bán 3.600.000đ · Anh Tuấn");
  expect(w).not.toContain("1.400.000");
  expect(w).not.toContain("3.000.000");
  expect(nut(m5)).toContain("Xem tất cả căn trống");
});

test("test_YC4_7_NT6_US15_can_tuong_tu_chi_ghi_gia_ban_khong_ghi_tim_gan_day", async () => {
  const yc = (await gui(HUNG, "1509", "2026-10-31", "2026-11-02")) as YeuCauSale;
  const truoc = (await import("../services/api")).getSaleTimGanDay;
  const nTruoc = (await truoc()).muc.length;
  const can = await canTuongTu(yc);
  expect((await truoc()).muc.length).toBe(nTruoc); // ghi_lich_su=false (mục "Sale nhận kết quả yêu cầu" (US15) bước 2)
  expect(can.find((c) => c.ma_can === "1103")!.tong_gia_ban).toBe(1_600_000);
  expect(can.find((c) => c.ma_can === "2208")!.tong_gia_ban).toBe(3_600_000);
  const v = van(ketQuaSale({ ...yc, trang_thai: "bi_tu_choi", ly_do: "da_co_khach" }, { canTuongTu: can }));
  const tuongTu = v.slice(v.indexOf("CĂN TƯƠNG TỰ"));
  expect(tuongTu).not.toMatch(/Giá chủ nhà|1\.400\.000|3\.000\.000/);
});

test("test_YC4_8_NT1_US15_KB12_hai_yeu_cau_trung_dem_co_nhan_trung_ngay_o_CN1_03_va_canh_bao_o_CN9", async () => {
  const hung = await gui(HUNG, "1509", "2026-10-17", "2026-10-19");
  const lan = await gui(LAN, "1509", "2026-10-18", "2026-10-19");
  // Yêu cầu của Hùng chưa chiếm đêm: Lan gửi được (mục "Yêu cầu trùng ngày" (US15) bước 1)
  expect(lan.trang_thai).toBe("cho_chu");
  await dung(HOA);
  const ds = await choDS();
  expect(ds).toHaveLength(2);
  const cn1 = html(<KhoiYeuCauCN1 ds={ds} onMo={khong} />);
  const v = van(cn1);
  expect(v).toContain("YÊU CẦU ĐẶT PHÒNG · 2");
  expect(v).toMatch(/18\/10 → 19\/10 · gửi [^·]+ · trùng ngày với Sale Hùng/);
  expect(v).toMatch(/17\/10 → 19\/10 · gửi [^·]+ · trùng ngày với Sale Lan/);
  const yHung = (await getYeuCau(hung.id)) as YeuCauChu;
  const yLan = (await getYeuCau(lan.id)) as YeuCauChu;
  expect(van(cn9(yHung))).toContain("⚠️ Trùng 18/10 với yêu cầu của Sale Lan. Chấp nhận yêu cầu này thì yêu cầu của Sale Lan bị từ chối và Sale Lan được báo.");
  expect(van(cn9(yLan))).toContain("Trùng 18/10 với yêu cầu của Sale Hùng.");
});

test("test_YC4_8_NT2_US15_KB13_chap_nhan_mot_yeu_cau_thi_yeu_cau_trung_bi_tu_choi_va_sale_kia_duoc_bao", async () => {
  const hung = await gui(HUNG, "1509", "2026-10-17", "2026-10-19");
  const lan = await gui(LAN, "1509", "2026-10-18", "2026-10-19");
  await dung(HOA);
  const kq = await postYeuCauChapNhan(hung.id, khoa());
  expect(kq.yeu_cau_bi_tu_choi.map((t) => t.id)).toEqual([lan.id]);
  expect(van(cn9(kq.yeu_cau, { ketQua: kq }))).toContain("Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo.");
  expect(await choDS()).toEqual([]);
  const thang = await getLichThang({ thang: "2026-10" });
  expect(thang.ngay.filter((n) => n.ngay === "2026-10-17" || n.ngay === "2026-10-18")).toHaveLength(2);
  // Lan: Bị từ chối, lý do chủ nhận đặt khác (US15-NT14), không có tên Sale Hùng, không có giá bán của Hùng
  await dung(LAN);
  const y = (await getYeuCau(lan.id)) as YeuCauSale;
  expect(y.trang_thai).toBe("bi_tu_choi");
  expect(y.ly_do).toBe("chu_nhan_dat_khac");
  const m = ketQuaSale(y, { canTuongTu: await canTuongTu(y) });
  const v = van(m);
  expect(v).toContain("Yêu cầu bị từ chối");
  expect(v).toContain("Chị Hoa đã nhận đặt phòng khác cho 18/10 → 19/10.");
  expect(v).toContain("CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY");
  expect(v).not.toContain("Hùng");
  expect(v).not.toContain("2.600.000");
  expect(JSON.stringify(y)).not.toContain("Hùng");
  // Giá chủ nhà không nằm ở mục căn tương tự: 1103 (700.000đ) và 2208 (1.500.000đ) chỉ có giá bán của Lan (mức cộng +0)
  expect(v).not.toMatch(/Bạn bán 1\.400\.000/);
});

test("test_QT1_4_VD2_US15_hai_lenh_chap_nhan_hai_yeu_cau_trung_dem_cung_luc_chi_mot_lenh_thanh_cong", async () => {
  const hung = await gui(HUNG, "1509", "2026-10-17", "2026-10-19");
  const lan = await gui(LAN, "1509", "2026-10-18", "2026-10-19");
  await dung(HOA);
  const kq = await Promise.allSettled([postYeuCauChapNhan(hung.id, khoa()), postYeuCauChapNhan(lan.id, khoa())]);
  expect(kq.filter((k) => k.status === "fulfilled")).toHaveLength(1);
  const loi = kq.find((k) => k.status === "rejected") as PromiseRejectedResult;
  expect(["TRANG_THAI_DA_DOI", "TRUNG_LICH"]).toContain(loi.reason.loi);
  const luu = banThu.yeuCauDaLuu().filter((y) => y.id === hung.id || y.id === lan.id);
  expect(luu.filter((y) => y.trang_thai === "da_chot")).toHaveLength(1);
  expect(luu.filter((y) => y.trang_thai === "cho_chu")).toHaveLength(0);
  // Một đặt phòng cho đêm 18/10
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.ngay.filter((n) => n.ngay === "2026-10-18")).toHaveLength(1);
});

test("test_QT1_4_VD2_US15_chap_nhan_cung_luc_voi_ghi_dat_phong_trung_dem_chi_mot_ben_qua", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-05", "2026-11-07");
  await dung(HOA);
  const hoaCan = (await getLichThang({ thang: "2026-11" })).can.find((c) => c.ma_can === "1509")!;
  const kq = await Promise.allSettled([
    postYeuCauChapNhan(yc.id, khoa()),
    postBooking({ can_id: hoaCan.can_id, ngay_nhan: "2026-11-06", ngay_tra: "2026-11-08", tien_phong: 1_000_000, ...tienPhong }, khoa()),
  ]);
  expect(kq.filter((k) => k.status === "fulfilled")).toHaveLength(1);
  const lich = await getLichThang({ thang: "2026-11" });
  expect(lich.ngay.filter((n) => n.ngay === "2026-11-06")).toHaveLength(1);
});

test("test_YC4_8_NT3_US15_KB14_chu_nha_tu_ghi_booking_trung_dem_thi_yeu_cau_cho_bi_tu_choi", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-28", "2026-11-29");
  await dung(HOA);
  const hoaCan = (await getLichThang({ thang: "2026-11" })).can.find((c) => c.ma_can === "1509")!;
  await postBooking({ can_id: hoaCan.can_id, ngay_nhan: "2026-11-28", ngay_tra: "2026-11-30", tien_phong: 2_200_000, ...tienPhong }, khoa());
  expect(await choDS()).toEqual([]);
  await dung(HUNG);
  const y = (await getYeuCau(yc.id)) as YeuCauSale;
  expect(y.trang_thai).toBe("bi_tu_choi");
  expect(y.ly_do).toBe("chu_nhan_dat_khac");
  const v = van(ketQuaSale(y, { canTuongTu: await canTuongTu(y) }));
  expect(v).toContain("Yêu cầu bị từ chối");
  expect(v).toContain("Chị Hoa đã nhận đặt phòng khác cho 28/11 → 29/11.");
  expect(v).not.toContain("Khách lẻ");
});

test("test_YC4_8_NT3_US15_chu_nha_sua_dat_phong_sang_dem_co_yeu_cau_cho_thi_yeu_cau_bi_tu_choi", async () => {
  const yc = await gui(HUNG, "1509", "2026-12-10", "2026-12-11");
  await dung(HOA);
  const hoaCan = (await getLichThang({ thang: "2026-12" })).can.find((c) => c.ma_can === "1509")!;
  const dp = await postBooking({ can_id: hoaCan.can_id, ngay_nhan: "2026-12-01", ngay_tra: "2026-12-02", tien_phong: 900_000, ...tienPhong }, khoa());
  expect((await getYeuCau(yc.id)).trang_thai).toBe("cho_chu");
  await patchBooking(dp.id, { cap_nhat_luc: dp.cap_nhat_luc, ngay_nhan: "2026-12-10", ngay_tra: "2026-12-11" }, khoa());
  expect((await getYeuCau(yc.id)).trang_thai).toBe("bi_tu_choi");
});

test("test_YC4_6_NT3_US15_gia_ban_giu_nguyen_khi_chu_nha_sua_gia_chu_nha_sau_khi_chap_nhan", async () => {
  // Quyết định 04/11 (Nhật ký US10): đặt phòng đã có xác nhận của chủ nhà thì giá bán giữ nguyên
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26");
  await dung(HOA);
  const kq = await postYeuCauChapNhan(yc.id, khoa());
  const dp = await getBooking(kq.booking.id);
  await patchBooking(dp.id, { cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1_800_000 }, khoa());
  await dung(HUNG);
  const bk = await getBookingSale(kq.booking.id);
  expect(bk.tien_phong).toBe(1_800_000);
  expect(bk.gia_ban).toBe(2_600_000);
});

test("test_PQ11_SALE_US15_than_co_gia_chu_gia_ban_thi_dong_ghi_van_la_gia_server_tinh", async () => {
  const yc = await postYeuCau({ can_id: ids["1509"], ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26", gia_chu: 1, gia_ban: 1 } as never, khoa());
  expect([yc.gia_chu, yc.gia_ban]).toEqual([2_200_000, 2_600_000]);
  const luu = banThu.yeuCauDaLuu().find((y) => y.id === yc.id)!;
  expect([luu.gia_chu, luu.gia_ban]).toEqual([2_200_000, 2_600_000]);
});

test("test_PQ10_US15_yeu_cau_chi_hien_voi_chu_nha_cua_can_va_sale_gui_nguoi_khac_khong_biet_co_ton_tai", async () => {
  const yc = await gui(HUNG, "1509", "2026-10-24", "2026-10-26");
  const loiCua = async (viec: () => Promise<unknown>) => ((await viec().catch((e) => e)) as LoiApi).loi;
  await dung(LAN);
  expect(await loiCua(() => getYeuCau(yc.id))).toBe("KHONG_TIM_THAY");
  expect(await loiCua(() => postYeuCauHuy(yc.id, khoa()))).toBe("KHONG_TIM_THAY");
  expect((await getYeuCauDS({ phia: "gui" })).muc).toEqual([]);
  await dung(HUNG);
  expect(await loiCua(() => postYeuCauChapNhan(yc.id, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await loiCua(() => postYeuCauTuChoi(yc.id, { ly_do: "da_co_khach" }, khoa()))).toBe("KHONG_TIM_THAY");
  await dung(TUAN);
  expect(await loiCua(() => getYeuCau(yc.id))).toBe("KHONG_TIM_THAY");
  expect(await loiCua(() => postYeuCauChapNhan(yc.id, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await loiCua(() => postYeuCauTuChoi(yc.id, { ly_do: "da_co_khach" }, khoa()))).toBe("KHONG_TIM_THAY");
  await dung(HOA);
  expect(await loiCua(() => postYeuCauHuy(yc.id, khoa()))).toBe("KHONG_TIM_THAY");
  // Chủ nhà không gửi yêu cầu cho căn của chính mình
  expect(await loiCua(() => postYeuCau({ can_id: ids["1509"], ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" }, khoa()))).toBe("KHONG_TIM_THAY");
});

test("test_PQ10_CHU_US15_KB22_chu_nha_khac_chi_thay_yeu_cau_toi_can_cua_minh_Y1_trong_du_lieu_mau", async () => {
  await gui(HUNG, "1509", "2026-10-24", "2026-10-26");
  await dung(TUAN);
  const ds = await choDS();
  expect(ds).toHaveLength(1);
  expect(ds[0].can.ma_can).toBe("2208");
  expect([ds[0].ngay_nhan, ds[0].ngay_tra, ds[0].gia_chu]).toEqual(["2026-10-10", "2026-10-12", 3_000_000]);
  const v = van(html(<KhoiYeuCauCN1 ds={ds} onMo={khong} />));
  expect(v).toContain("Sale Hùng đặt phòng 2208");
  expect(v).not.toContain("1509");
  // Y1 phía Hùng: giá bán 3.600.000đ (DLM.6)
  await dung(HUNG);
  const y1 = ((await getYeuCauDS({ phia: "gui", trang_thai: ["cho_chu"] })).muc as YeuCauSale[]).find((y) => y.can.ma_can === "2208")!;
  expect([y1.gia_chu, y1.gia_ban]).toEqual([3_000_000, 3_600_000]);
});

test("test_HV1_HV2_US15_KB19_KB20_bam_hai_lan_cung_khoa_chi_mot_yeu_cau_mat_mang_khong_tao_va_khong_tu_gui_lai", async () => {
  const k = khoa();
  const dau = banThu.yeuCauDaLuu().length;
  const than = { can_id: ids["1509"], ngay_nhan: "2026-12-19", ngay_tra: "2026-12-20" };
  const [a, b] = await Promise.all([postYeuCau(than, k), postYeuCau(than, k)]);
  expect(a.id).toBe(b.id);
  expect(banThu.yeuCauDaLuu()).toHaveLength(dau + 1);
  // Mất mạng: báo lỗi mạng, không tạo; có mạng lại cũng không tự có yêu cầu
  banThu.datMatMang(true);
  const loi = await postYeuCau({ ...than, ngay_nhan: "2026-12-12", ngay_tra: "2026-12-13", loi_nhan: "Khách đến trưa" }, khoa()).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiMang);
  banThu.datMatMang(false);
  expect(banThu.yeuCauDaLuu()).toHaveLength(dau + 1);
});

test("test_HV3_US15_KB21_loi_nhan_dang_go_con_khi_roi_app_va_xoa_khi_gui_xong", () => {
  boNhoLoiNhan.ghi("can-1", "2026-12-26", "2026-12-27", "Khách có trẻ nhỏ");
  expect(boNhoLoiNhan.lay("can-1", "2026-12-26", "2026-12-27")).toBe("Khách có trẻ nhỏ");
  expect(boNhoLoiNhan.lay("can-1", "2026-12-27", "2026-12-28")).toBe("");
  boNhoLoiNhan.xoa("can-1", "2026-12-26", "2026-12-27");
  expect(boNhoLoiNhan.lay("can-1", "2026-12-26", "2026-12-27")).toBe("");
});

test("test_YC4_5_US15_KB18_nhan_chu_nha_mo_khung_chat_dien_san_tin_va_goi_chu_nha_mo_ung_dung_goi", async () => {
  const ghi = { chat: [] as [string, string][], goi: [] as string[] };
  datCongZalo({
    async moChat(id: string, tin: string) {
      ghi.chat.push([id, tin]);
      return true;
    },
    async goiDien(so: string) {
      ghi.goi.push(so);
      return true;
    },
  } as unknown as CongZalo);
  const yc = await gui(HUNG, "1509", "2026-12-05", "2026-12-06");
  expect(yc.chu_nha.zalo_id).toBe(HOA);
  expect(yc.chu_nha.so_dien_thoai).toBe("0904118772");
  expect(await zalo.moChat(yc.chu_nha.zalo_id!, tinNhanChuNha(yc))).toBe(true);
  expect(await zalo.goiDien(yc.chu_nha.so_dien_thoai!)).toBe(true);
  expect(ghi.chat).toEqual([[HOA, "Em vừa gửi yêu cầu đặt phòng 1509 ngày 05/12 trong Home247, anh chị xem giúp em."]]);
  expect(ghi.goi).toEqual(["0904118772"]);
});

test("test_YC4_6_US15_KB17_chu_nha_chua_co_so_thi_popup_truoc_va_De_sau_van_chap_nhan", async () => {
  const yc = await gui(HUNG, "1509", "2026-11-21", "2026-11-22");
  banThu.xoaSoDienThoai();
  boNhoHoSo.xoa();
  await dung(HOA);
  let xin = 0;
  datCongZalo({
    async xinTenVaSo() {
      xin++;
      return { kq: "tu_choi" as const };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
  } as unknown as CongZalo);
  const dk = new DieuKhienXinSo();
  let kq: Awaited<ReturnType<typeof postYeuCauChapNhan>> | null = null;
  await dk.chay(async () => {
    kq = await postYeuCauChapNhan(yc.id, khoa());
  });
  expect(dk.mo).not.toBeNull();
  expect(tieuDePopup("sale")).toBe("Chia sẻ số điện thoại với sale");
  expect(kq).toBeNull();
  await dk.deSau();
  expect(xin).toBe(0);
  expect(kq).not.toBeNull();
  expect(van(cn9(kq!.yeu_cau, { ketQua: kq }))).toContain("✓ Đã nhận đặt phòng 1509");
});
