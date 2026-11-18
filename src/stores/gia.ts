// Giữ trong bộ nhớ cho tab Giá (CN6): bảng giá đã xem để mở lại là hiện ngay (HV1 bước 2) và mất mạng vẫn xem được (HV2 bước 1),
// và phần người dùng đang nhập để rời app rồi quay lại vẫn còn nguyên (HV3 bước 1, 2).
// Không lưu xuống máy: tắt hẳn app là mất.
import type { BangGia } from "../services/kieu";

export type NhapGia = {
  nam: number | null; // null là năm nay
  thangChon: number[]; // số tháng 1 đến 12 đang chọn
  giaThuong: string;
  giaCuoiTuan: string;
  thangLich: string | null; // tháng đang xem ở lịch giá
};

// US7 · Màn đặt giá nhiều căn (CN6-05, CN6-06): các căn đã chọn và phần đang nhập, giữ khi bấm "Đổi căn" và khi rời app (HV3)
export type NhapNhieuCan = { canChon: string[]; nam: number | null; thangChon: number[]; giaThuong: string; giaCuoiTuan: string };
export const NHAP_NHIEU_TRONG: NhapNhieuCan = { canChon: [], nam: null, thangChon: [], giaThuong: "", giaCuoiTuan: "" };

// US7 · Màn sao chép giá (CN6-07): ba phần được chọn và các căn đích
export type NhapSaoChep = { thang: boolean; le: boolean; dip: boolean; denCan: string[] };
export const NHAP_SAO_CHEP_TRONG: NhapSaoChep = { thang: true, le: true, dip: true, denCan: [] };

// US8 · Màn giá ngày lễ, dịp đặc biệt (CN6-02): phần đang nhập, giữ khi rời app (HV3)
export type NhapDip = { tu: string; den: string; ten: string; gia: string; laLe: boolean; ngayLeId: string | null };
export const NHAP_DIP_TRONG: NhapDip = { tu: "", den: "", ten: "", gia: "", laLe: false, ngayLeId: null };

export const NHAP_TRONG: NhapGia = { nam: null, thangChon: [], giaThuong: "", giaCuoiTuan: "", thangLich: null };

const bangDaXem = new Map<string, BangGia>();
const nhapTheoCan = new Map<string, NhapGia>();
// Căn đã thấy có giá ở năm nào đó trong lần mở này: để CN6-00 chỉ hiện khi căn chưa có giá năm nào (US4-NT5)
const canCoGia = new Set<string>();
// Sao chép giá xong (mục "Sao chép giá sang căn khác" (US7) bước 5) thì CN6 của căn nguồn mở lại ở tab Giá, một lần
const quayVeTabGia = new Set<string>();
let nhapNhieuCan: NhapNhieuCan = NHAP_NHIEU_TRONG;
const nhapSaoChep = new Map<string, NhapSaoChep>();
const nhapDip = new Map<string, NhapDip>();

const khoa = (canId: string, nam: number, thang: string | undefined) => `${canId}|${nam}|${thang ?? ""}`;

export const boNhoGia = {
  bang: (canId: string, nam: number, thang?: string) => bangDaXem.get(khoa(canId, nam, thang)),
  ghiBang: (b: BangGia, thang?: string) => {
    bangDaXem.set(khoa(b.can_id, b.nam, thang), b);
    if (b.thang.some((t) => t.gia_ngay_thuong !== null) || b.dai_dip.length > 0) canCoGia.add(b.can_id);
  },
  // Giá vừa đổi: bỏ bảng cũ của căn đó
  boBangCuaCan: (canId: string) => {
    for (const k of [...bangDaXem.keys()]) if (k.startsWith(canId + "|")) bangDaXem.delete(k);
  },
  // Đổi ngày tính giá cuối tuần (US1, mục "Ngày tính giá cuối tuần" (US4)): mọi bảng giá đã xem đổi tên ô giá và loại đêm, bỏ hết bảng cũ
  boMoiBang: () => bangDaXem.clear(),
  coGiaNamNao: (canId: string) => canCoGia.has(canId),
  nhap: (canId: string) => nhapTheoCan.get(canId) ?? NHAP_TRONG,
  ghiNhap: (canId: string, n: NhapGia) => void nhapTheoCan.set(canId, n),
  datQuayVeTabGia: (canId: string) => void quayVeTabGia.add(canId),
  layQuayVeTabGia: (canId: string) => quayVeTabGia.delete(canId),
  nhapNhieuCan: () => nhapNhieuCan,
  ghiNhapNhieuCan: (n: NhapNhieuCan) => void (nhapNhieuCan = n),
  nhapSaoChep: (canId: string) => nhapSaoChep.get(canId) ?? NHAP_SAO_CHEP_TRONG,
  ghiNhapSaoChep: (canId: string, n: NhapSaoChep) => void nhapSaoChep.set(canId, n),
  nhapDip: (canId: string) => nhapDip.get(canId) ?? NHAP_DIP_TRONG,
  ghiNhapDip: (canId: string, n: NhapDip) => void nhapDip.set(canId, n),
  // Đổi người dùng hoặc nạp lại dữ liệu thử (menu Bản thử)
  xoa: () => {
    nhapNhieuCan = NHAP_NHIEU_TRONG;
    nhapSaoChep.clear();
    nhapDip.clear();
    quayVeTabGia.clear();
    bangDaXem.clear();
    nhapTheoCan.clear();
    canCoGia.clear();
  },
};
