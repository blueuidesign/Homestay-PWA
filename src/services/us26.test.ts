import { beforeEach, expect, test } from "vitest";
import { DieuKhienXinSo } from "../components/xin-so";
import { boNhoHoSo } from "../stores/ho-so";
import { banThu, getCan, getKetNoi, getLink, getSaleLich, getToi, postCan, postKetNoiNgung, postLink, postPhien } from "./api";
import { guiLichQuaZalo } from "./gui-lich";
import { LoiApi, LoiMang } from "./kieu";
import { batDauTuLink, themLich } from "./mo-link";
import { datCongZalo, type CongZalo, type KetQuaChiaSe } from "./zalo";

// US26 · Test chức năng trên server giả: chủ nhà gửi lịch theo căn đã chọn (YC1.8), căn mới không vào lịch sale chỉ được vài căn (YC1.12).
// Dữ liệu DLM: hôm nay 07/10/2026, Chị Hoa có 1509, 3402 và 4 sale; Zalo thử B là sale mới.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-us26-${++n}-xxxxxxxxxxxxxxxx`;
const dung = async (zaloId: string, ten?: string) => {
  banThu.dungZaloId(zaloId, ten);
  return postPhien();
};

// Cổng Zalo giả ghi lại các tin mở ra
const cong = (kq: KetQuaChiaSe[] = []): CongZalo & { tin: string[]; xin: { n: number } } => {
  const tin: string[] = [];
  const xin = { n: 0 };
  return {
    tin,
    xin,
    async xinTenVaSo() {
      xin.n++;
      return { kq: "co", access_token: "at", token_sdt: "sdt:0911222333", ho_ten: "Thử A", anh_zalo: null };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
    async chiaSeChu(chu) {
      tin.push(chu);
      return kq[tin.length - 1] ?? "da_gui";
    },
    async saoChep() {
      return true;
    },
    async goiDien() {
      return true;
    },
  };
};

// Sale thử: tài khoản Zalo mới, vào app từ link của chủ nhà (A1-link, "Bắt đầu ngay") rồi sẵn sàng bấm "Thêm lịch"
const saleThuMoLink = async (ma: string) => {
  await dung("zalo-sale-thu", "Sale thử");
  await batDauTuLink(ma);
};

let hoa: { id: string; ma_can: string }[];
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  boNhoHoSo.xoa();
  datCongZalo(null);
  banThu.napDuLieuSale("moi");
  await dung("zalo-chi-hoa");
  hoa = await getCan();
});

const idCan = (ma: string) => hoa.find((c) => c.ma_can === ma)!.id;
const link = (m: string) => m.match(/\?ma=([A-Za-z0-9_-]{22})/)![1];

test("test_YC1_8_NT1_US26_KB3_chon_2_sale_thi_zalo_mo_tin_co_link_cho_tung_sale_da_chon_va_dem_moi_cua_so", async () => {
  const zalo = cong();
  datCongZalo(zalo);
  try {
    const ds = (await getKetNoi()).da_ket_noi;
    const chon = ds.filter((d) => ["Sale Hùng", "Sale Lan"].includes(d.ten_hien_thi!)).map((d) => ({ id: d.id, ten: d.ten_hien_thi! }));
    const kq = await guiLichQuaZalo([idCan("1509"), idCan("3402")], chon, khoa());
    expect(kq).toEqual({ loai: "da_gui", so_cua_so: 2 });
    expect(zalo.tin).toHaveLength(2);
    expect(zalo.tin[0]).toContain("Gửi Sale Hùng:");
    expect(zalo.tin[1]).toContain("Gửi Sale Lan:");
    expect(zalo.tin.some((t) => /Nga|Minh/.test(t))).toBe(false);
    // Cùng một link, link dạng zalo.me/s/... không chứa số điện thoại hay id (YC1.6-NT4)
    expect(link(zalo.tin[0])).toBe(link(zalo.tin[1]));
    expect(zalo.tin[0]).toMatch(/https:\/\/zalo\.me\/s\/\d+\/\?ma=/);
    expect(zalo.tin[0]).not.toMatch(/0904|1509|home247\.vn/);
  } finally {
    datCongZalo(null);
  }
});

test("test_YC1_8_NT2_US26_KB5_khong_chon_sale_thi_zalo_mo_mot_cua_so_chia_se_de_chon_nguoi_nhan", async () => {
  const zalo = cong();
  datCongZalo(zalo);
  try {
    const kq = await guiLichQuaZalo([idCan("1509")], [], khoa());
    expect(kq).toEqual({ loai: "da_gui", so_cua_so: 1 });
    expect(zalo.tin).toHaveLength(1);
    expect(zalo.tin[0]).not.toContain("Gửi Sale");
    expect(zalo.tin[0]).toContain("?ma=");
  } finally {
    datCongZalo(null);
  }
});

test("test_YC1_8_NT3_US26_KB4_KB6_ket_qua_gui_da_gui_thi_ve_lich_dong_cua_so_thi_chua_gui_zalo_loi_thi_bao_loi", async () => {
  datCongZalo(cong(["huy"]));
  expect(await guiLichQuaZalo([idCan("1509")], [], khoa())).toEqual({ loai: "huy" }); // CN10-01
  datCongZalo(cong(["loi"]));
  expect(await guiLichQuaZalo([idCan("1509")], [], khoa())).toEqual({ loai: "loi" });
  // Gửi cửa sổ đầu rồi đóng cửa sổ hai: vẫn là đã gửi, không mở cửa sổ ba
  const z = cong(["da_gui", "huy", "da_gui"]);
  datCongZalo(z);
  const ds = (await getKetNoi()).da_ket_noi.slice(0, 3).map((d) => ({ id: d.id, ten: d.ten_hien_thi! }));
  expect(await guiLichQuaZalo([idCan("1509")], ds, khoa())).toEqual({ loai: "da_gui", so_cua_so: 1 });
  expect(z.tin).toHaveLength(2);
  datCongZalo(null);
});

test("test_API_POST_link_gui_lich_tao_link_moi_moi_lan_dem_so_lan_gui_cung_khoa_thi_cung_link", async () => {
  const k = khoa();
  const a = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, k);
  expect(a).toMatchObject({ loai: "gui_lich", so_lan_gui: 0, can_ids: [idCan("1509")] });
  expect(await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, k)).toEqual(a);
  const b = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa());
  expect(b.ma).not.toBe(a.ma);
  const moi = await postLink({ loai: "moi_sale" }, khoa());
  expect(moi.loai).toBe("moi_sale"); // link mời không bị ảnh hưởng
  expect(Date.parse(a.het_han_luc!) - Date.parse(a.tao_luc)).toBe(21 * 24 * 3600_000);
  // Dữ liệu sai
  expect(await maLoi(postLink({ loai: "gui_lich" }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [] }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [idCan("1509"), idCan("1509")] }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postLink({ loai: "moi_sale", can_ids: [idCan("1509")] }, khoa()))).toBe("DU_LIEU_SAI");
});

test("test_PQ18_CHU_US26_KB2_chu_nha_A_gui_lich_can_cua_chu_nha_B_thi_KHONG_TIM_THAY_va_khong_co_link", async () => {
  await dung("zalo-anh-tuan");
  const canTuan = await getCan();
  expect(canTuan.map((c) => c.ma_can).sort()).toEqual(["1103", "2208"]);
  await dung("zalo-chi-hoa");
  // Danh sách căn ở Bước 1 chỉ có căn của mình (PQ3.CHU)
  expect((await getCan()).map((c) => c.ma_can).sort()).toEqual(["1509", "3402"]);
  const truoc = await getKetNoi();
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [canTuan[0].id] }, khoa()))).toBe("KHONG_TIM_THAY");
  // Một căn của mình cộng một căn của người khác cũng bị từ chối cả link
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [idCan("1509"), canTuan[0].id] }, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: ["can-khong-co"] }, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await getKetNoi()).toEqual(truoc);
  const zalo = cong();
  datCongZalo(zalo);
  try {
    await expect(guiLichQuaZalo([canTuan[0].id], [], khoa())).rejects.toBeInstanceOf(LoiApi);
    expect(zalo.tin).toHaveLength(0); // lỗi thì Zalo không mở
  } finally {
    datCongZalo(null);
  }
});

test("test_PQ18_CHU_US26_sale_va_phien_tam_khong_tao_duoc_link_gui_lich", async () => {
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa());
  await dung("zalo-sale-hung");
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa()))).toBe("KHONG_TIM_THAY");
  await dung("zalo-moi-chua-co-tai-khoan");
  expect(await maLoi(postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa()))).toBe("CHUA_DANG_NHAP");
  expect(l.loai).toBe("gui_lich");
});

test("test_PQ3_LINK_US26_xem_truoc_link_gui_lich_chi_co_can_da_chon_khong_gia_khong_id", async () => {
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa());
  const x = await getLink(l.ma); // không cần phiên
  expect(x.loai).toBe("gui_lich");
  expect(x.so_can).toBe(1);
  expect(x.can.map((c) => c.ma_can)).toEqual(["1509"]);
  expect(JSON.stringify(x)).not.toMatch(/gia|tien|so_dien_thoai|"id"|0904118772/);
});

test("test_YC1_8_buoc_4_US26_KB11_sale_chua_ket_noi_bam_Them_lich_o_link_2_can_chi_thay_2_can", async () => {
  // Chủ nhà thử có 6 căn (DLM.9 chưa có bộ 6 căn): thêm 4 căn nữa cho Chị Hoa
  for (const ma of ["Căn 3", "Căn 4", "Căn 5", "Căn 6"]) await postCan({ ma_can: ma, so_phong_ngu: 1 });
  expect(await getCan()).toHaveLength(6);
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509"), idCan("3402")] }, khoa());
  await saleThuMoLink(l.ma);
  const kq = await themLich(l.ma, khoa());
  expect(kq).toMatchObject({ loai: "da_them", ket_qua: { so_can: 2 } });
  const lich = await getSaleLich();
  expect(lich.can.map((c) => c.ma_can)).toEqual(["1509", "3402"]);
  expect(lich.so_can.nguon_phong).toBe(2);
  expect(JSON.stringify(lich)).not.toMatch(/ten_khach|so_dien_thoai|tien_coc|Căn 3/);
  // Chủ nhà thấy sale mới ở nhóm Đã kết nối, nguồn chu_gui_lich, phạm vi chon_can
  await dung("zalo-chi-hoa");
  const dong = (await getKetNoi()).da_ket_noi.find((d) => d.nguon === "chu_gui_lich");
  expect(dong).toBeDefined();
});

test("test_PQ3_SALE_US26_sale_duoc_chia_se_2_can_goi_API_lich_thi_khong_co_can_thu_3", async () => {
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa());
  await saleThuMoLink(l.ma);
  await themLich(l.ma, khoa());
  const lich = await getSaleLich({ tu: "2026-10-07", so_ngay: 14 });
  expect(lich.can.map((c) => c.ma_can)).toEqual(["1509"]);
  expect(lich.can.some((c) => c.ma_can === "3402")).toBe(false);
});

test("test_YC1_12_NT2_US26_KB12_can_moi_khong_vao_lich_sale_chi_duoc_chia_se_vai_can_con_sale_tat_ca_can_thi_thay", async () => {
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509"), idCan("3402")] }, khoa());
  await saleThuMoLink(l.ma);
  await themLich(l.ma, khoa());
  await dung("zalo-chi-hoa");
  await postCan({ ma_can: "Căn 7", so_phong_ngu: 2 });
  await dung("zalo-sale-thu");
  expect((await getSaleLich()).can.map((c) => c.ma_can)).toEqual(["1509", "3402"]);
  // Đối chứng YC1.12-NT1: Sale Hùng được chia sẻ tất cả căn thấy căn mới
  await dung("zalo-sale-hung");
  expect((await getSaleLich()).can.map((c) => c.ma_can)).toContain("Căn 7");
});

test("test_YC1_8_US26_ngung_cho_xem_van_dung_voi_sale_chon_can", async () => {
  const l = await postLink({ loai: "gui_lich", can_ids: [idCan("1509")] }, khoa());
  await saleThuMoLink(l.ma);
  await themLich(l.ma, khoa());
  await dung("zalo-chi-hoa");
  const dong = (await getKetNoi()).da_ket_noi.find((d) => d.nguon === "chu_gui_lich")!;
  await postKetNoiNgung(dong.id, khoa());
  await dung("zalo-sale-thu");
  expect((await getSaleLich()).can).toHaveLength(0);
});

test("test_YC1_5_1_NT1_NT3_US26_KB8_chua_co_so_thi_hien_popup_truoc_va_De_sau_van_mo_zalo_gui_lich", async () => {
  banThu.xoaSoDienThoai();
  boNhoHoSo.xoa();
  const zalo = cong();
  datCongZalo(zalo);
  try {
    let xong = 0;
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => {
      await guiLichQuaZalo([idCan("1509")], [], khoa());
      xong++;
    });
    expect(dk.mo).not.toBeNull(); // popup hiện trước, chưa hộp thoại Zalo, chưa mở cửa sổ gửi
    expect(zalo.xin.n).toBe(0);
    expect(zalo.tin).toHaveLength(0);
    await dk.deSau();
    expect(xong).toBe(1);
    expect(zalo.tin).toHaveLength(1);
    expect(zalo.xin.n).toBe(0);
    expect((await getToi()).so_dien_thoai).toBeNull();
  } finally {
    datCongZalo(null);
  }
});

test("test_YC1_5_2_NT1_YC1_5_1_NT2_US26_KB10_dong_y_thi_lay_so_roi_gui_lich_lan_sau_khong_hoi", async () => {
  banThu.xoaSoDienThoai();
  boNhoHoSo.xoa();
  const zalo = cong();
  datCongZalo(zalo);
  try {
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => void (await guiLichQuaZalo([idCan("1509")], [], khoa())));
    await dk.dongY();
    expect(zalo.xin.n).toBe(1);
    expect(zalo.tin).toHaveLength(1);
    expect((await getToi()).so_dien_thoai).toBe("0911222333");
    const dk2 = new DieuKhienXinSo();
    await dk2.chay(async () => void (await guiLichQuaZalo([idCan("1509")], [], khoa())));
    expect(dk2.mo).toBeNull(); // đã có số: bỏ qua popup
    expect(zalo.tin).toHaveLength(2);
  } finally {
    datCongZalo(null);
  }
});

test("test_HV4_US26_KB9_tu_choi_hop_thoai_zalo_thi_khong_loi_khong_mo_cua_so_gui", async () => {
  banThu.xoaSoDienThoai();
  boNhoHoSo.xoa();
  const zalo = { ...cong(), async xinTenVaSo() { return { kq: "tu_choi" } as const; } };
  datCongZalo(zalo);
  try {
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => void (await guiLichQuaZalo([idCan("1509")], [], khoa())));
    await dk.dongY();
    expect(dk.mo).toBeNull();
    expect(dk.loi).toBeNull();
    expect(zalo.tin).toHaveLength(0);
    await dk.chay(async () => {});
    expect(dk.mo?.daTuChoi).toBe(true); // lần sau popup có nút Mở cài đặt quyền
  } finally {
    datCongZalo(null);
  }
});

test("test_HV2_US26_KB13_mat_mang_thi_chua_tao_link_zalo_khong_mo_co_mang_lai_khong_tu_gui", async () => {
  const zalo = cong();
  datCongZalo(zalo);
  try {
    banThu.datMatMang(true);
    await expect(guiLichQuaZalo([idCan("1509")], [], khoa())).rejects.toBeInstanceOf(LoiMang);
    banThu.datMatMang(false);
    expect(zalo.tin).toHaveLength(0);
    // Bấm lại khi có mạng với cùng khóa thì chạy bình thường
    expect(await guiLichQuaZalo([idCan("1509")], [], khoa())).toEqual({ loai: "da_gui", so_cua_so: 1 });
  } finally {
    datCongZalo(null);
  }
});
