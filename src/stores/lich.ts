// Lịch đã xem, giữ trong bộ nhớ để mở lại tab Lịch là hiện ngay (HV1 bước 2) và mất mạng vẫn xem được (HV2 bước 1).
// Không lưu xuống máy: tắt hẳn app là mất, mở lại thì tải lại.
import { boNhoTabCan } from "./can-sale";
import { boNhoThongKe } from "./thong-ke";
import type { CanLichSale, ChiTietCanSale, DieuKienTim, KetQuaTim, LichNgay, LichSale, LichThang, LichTuan, LichTuanTim, MucTimGanDay, SapToi, TomTatThang } from "../services/kieu";

const thangDaXem = new Map<string, LichThang>();
const ngayDaXem = new Map<string, LichNgay>();
// US9: doanh thu tháng, đặt phòng sắp tới (dưới lưới tháng), lịch tuần (khóa "tu|loc")
const tomTatDaXem = new Map<string, TomTatThang>();
let sapToiDaXem: SapToi | undefined;
const tuanChuDaXem = new Map<string, LichTuan>();
let tuanDangXem: { tu: string | null; loc: string } = { tu: null, loc: "" };

// Tháng và ngày đang xem, để rời tab hay rời app rồi quay lại vẫn đúng chỗ (HV3 bước 2)
let dangXem: { thang: string | null; ngay: string | null } = { thang: null, ngay: null };

export const boNhoLich = {
  thang: (thang: string) => thangDaXem.get(thang),
  ghiThang: (lich: LichThang) => void thangDaXem.set(lich.thang, lich),
  ngay: (ngay: string) => ngayDaXem.get(ngay),
  ghiNgay: (lich: LichNgay) => void ngayDaXem.set(lich.ngay, lich),
  tomTat: (thang: string) => tomTatDaXem.get(thang),
  ghiTomTat: (t: TomTatThang) => void tomTatDaXem.set(t.thang, t),
  sapToi: () => sapToiDaXem,
  ghiSapToi: (s: SapToi) => {
    sapToiDaXem = s;
  },
  tuanChu: (tu: string, loc: string) => tuanChuDaXem.get(tu + "|" + loc),
  ghiTuanChu: (l: LichTuan, loc: string) => void tuanChuDaXem.set(l.tu + "|" + loc, l),
  tuanDangXem: () => tuanDangXem,
  ghiTuanDangXem: (moi: { tu: string | null; loc: string }) => {
    tuanDangXem = moi;
  },
  dangXem: () => dangXem,
  ghiDangXem: (moi: { thang: string | null; ngay: string | null }) => {
    dangXem = moi;
  },
  // Vừa ghi hay xóa đặt phòng: bỏ lịch đã xem để lần mở lại tải mới, nhưng giữ tháng và ngày đang xem
  // để quay về đúng màn đã mở chức năng (US10 quyết định 2, 04/11/2026)
  lamMoi: () => {
    thangDaXem.clear();
    ngayDaXem.clear();
    tuanDaXem.clear();
    tomTatDaXem.clear();
    sapToiDaXem = undefined;
    tuanChuDaXem.clear();
    boNhoThongKe.lamMoi();
  },
  // Đổi người dùng (menu Bản thử) thì bỏ lịch của người cũ
  xoa: () => {
    thangDaXem.clear();
    ngayDaXem.clear();
    dangXem = { thang: null, ngay: null };
    tuanDaXem.clear();
    tomTatDaXem.clear();
    sapToiDaXem = undefined;
    tuanChuDaXem.clear();
    tuanDangXem = { tu: null, loc: "" };
    boNhoTim.xoa();
    boNhoCanSale.xoa();
    tuanDaXem.clear();
    boNhoTabCan.xoa();
    boNhoThongKe.xoa();
  },
};

// Chi tiết căn S3 đã xem (US13), khóa là căn và ngày: mở lại hiện ngay (HV1 bước 2), mất mạng vẫn xem được (HV2 bước 1).
// Kèm lịch 2 tuần của căn. Không lưu xuống máy.
export type CanSaleDaXem = { can: ChiTietCanSale; lich: CanLichSale["o"] | null; ngay_khach_hoi: string[] };
const canSaleDaXem = new Map<string, CanSaleDaXem>();
const khoaCanSale = (id: string, nhan: string | null, tra: string | null) => `${id}|${nhan ?? ""}|${tra ?? ""}`;
export const boNhoCanSale = {
  lay: (id: string, nhan: string | null, tra: string | null) => canSaleDaXem.get(khoaCanSale(id, nhan, tra)),
  ghi: (id: string, nhan: string | null, tra: string | null, v: CanSaleDaXem) => void canSaleDaXem.set(khoaCanSale(id, nhan, tra), v),
  xoa: () => canSaleDaXem.clear(),
};

// Lịch 7 ngày của sale đã xem (S1), khóa theo ngày đầu (HV1 bước 2, HV2 bước 1)
// US16: khóa gồm cả cách sắp xếp (S1-04), mặc định "ten"
const tuanDaXem = new Map<string, LichSale>();
const khoaTuan = (tu: string, sapXep: string = "ten") => `${tu}|${sapXep}`;
export const boNhoLichSale = {
  tuan: (tu: string, sapXep: string = "ten") => tuanDaXem.get(khoaTuan(tu, sapXep)),
  ghi: (l: LichSale, sapXep: string = "ten") => void tuanDaXem.set(khoaTuan(l.tu, sapXep), l),
  // Vừa thêm, xóa căn tự nhập hay ghi đặt phòng: bỏ lịch đã xem để lần mở lại tải mới
  lamMoi: () => tuanDaXem.clear(),
};

// Tìm phòng trống đã xem (US12), giữ trong bộ nhớ: mở lại hiện ngay (HV1 bước 2), mất mạng vẫn xem được (HV2 bước 1).
// Khóa là điều kiện tìm. Không lưu xuống máy.
const khoaTim = (dk: DieuKienTim) => JSON.stringify([dk.ngay_nhan, dk.ngay_tra, dk.so_phong_ngu, dk.loai_view, dk.toa_nha_id]);
const ketQuaTimDaXem = new Map<string, KetQuaTim>();
const lichTuanTimDaXem = new Map<string, LichTuanTim>();
let ganDayDaXem: MucTimGanDay[] | undefined;
export const boNhoTim = {
  ketQua: (dk: DieuKienTim) => ketQuaTimDaXem.get(khoaTim(dk)),
  ghiKetQua: (dk: DieuKienTim, kq: KetQuaTim) => void ketQuaTimDaXem.set(khoaTim(dk), kq),
  lichTuan: (dk: DieuKienTim) => lichTuanTimDaXem.get(khoaTim(dk)),
  ghiLichTuan: (dk: DieuKienTim, l: LichTuanTim) => void lichTuanTimDaXem.set(khoaTim(dk), l),
  ganDay: () => ganDayDaXem,
  ghiGanDay: (m: MucTimGanDay[]) => {
    ganDayDaXem = m;
  },
  xoa: () => {
    ketQuaTimDaXem.clear();
    lichTuanTimDaXem.clear();
    ganDayDaXem = undefined;
  },
};
