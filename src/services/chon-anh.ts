// Lớp bọc chọn ảnh của zmp-sdk (chooseImage) cho thêm ảnh khi tạo căn (US25, mục "Ảnh khi thêm căn" (US25) bước 1).
// Màn không gọi zmp-sdk trực tiếp mà gọi qua đây, để test thay bằng bản giả (datCongAnh).
// Ảnh chỉ đi từ máy lên server của Home247, không gửi ra ngoài Zalo.
import { DU_LIEU_GIA } from "./api";
import type { TepAnh } from "./kieu";

// zmp-sdk cần window khi nạp, nên chỉ nạp lúc gọi
const sdk = () => import("../nen-tang/thiet-bi");

export type KetQuaChonAnh =
  | { kq: "co"; tep: TepAnh[] }
  | { kq: "huy" } // đóng cửa sổ chọn mà không chọn ảnh nào: không phải lỗi
  | { kq: "tu_choi" } // quyền ảnh bị từ chối (HV4)
  | { kq: "loi" };

export type CongAnh = {
  // toiDa: số ảnh còn thêm được (12 trừ số ảnh đã có)
  chonAnh(toiDa: number): Promise<KetQuaChonAnh>;
  moCaiDatQuyen(): Promise<void>;
};

// Mã lỗi zmp-sdk khi người dùng từ chối quyền: -201. Mã riêng của chooseImage chưa thử trên máy thật (US25-KB1, KB12).
const MA_TU_CHOI = [-201, -1401];

const tenTuDuongDan = (d: string) => d.split(/[\\/]/).pop() || d;

const congThat: CongAnh = {
  async chonAnh(toiDa) {
    try {
      const { chooseImage } = await sdk();
      const { filePaths, tempFiles } = await chooseImage({ sourceType: ["album"], count: toiDa });
      const tep = filePaths.map((duong_dan, i) => ({
        ten: tenTuDuongDan(tempFiles?.[i]?.path ?? duong_dan),
        duong_dan,
        dung_luong: tempFiles?.[i]?.size ?? 0,
      }));
      return tep.length ? { kq: "co", tep } : { kq: "huy" };
    } catch (e) {
      const ma = (e as { code?: number } | null)?.code ?? 0;
      return MA_TU_CHOI.includes(ma) ? { kq: "tu_choi" } : { kq: "loi" };
    }
  },
  async moCaiDatQuyen() {
    try {
      const { openPermissionSetting } = await sdk();
      await openPermissionSetting();
    } catch {
      // Không mở được thì ở lại màn, không báo lỗi
    }
  },
};

// Ảnh giả cho bản thử ngoài Zalo: hình vuông màu, đường dẫn dạng data trong máy, không tải gì từ ngoài
const MAU = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];
let demAnhGia = 0;
const anhGia = (): TepAnh => {
  const n = ++demAnhGia;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${MAU[n % MAU.length]}"/><text x="80" y="95" font-size="48" text-anchor="middle" fill="#fff">${n}</text></svg>`;
  return { ten: `anh-${n}.jpg`, duong_dan: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, dung_luong: 200_000 };
};

// Bản thử ngoài Zalo: mỗi lần chọn được 3 ảnh giả (hoặc ít hơn nếu còn ít chỗ)
export const congMoPhongAnh: CongAnh = {
  async chonAnh(toiDa) {
    return { kq: "co", tep: Array.from({ length: Math.min(3, toiDa) }, anhGia) };
  },
  async moCaiDatQuyen() {},
};

const trongZalo = () => typeof navigator !== "undefined" && /Zalo/i.test(navigator.userAgent);

let congTest: CongAnh | null = null;
// Cho test: thay cổng chọn ảnh bằng bản giả. Truyền null để trả về mặc định.
export const datCongAnh = (c: CongAnh | null) => {
  congTest = c;
};

const cong = (): CongAnh => congTest ?? (DU_LIEU_GIA && !trongZalo() ? congMoPhongAnh : congThat);

export const chonAnh: CongAnh = {
  chonAnh: (n) => cong().chonAnh(n),
  moCaiDatQuyen: () => cong().moCaiDatQuyen(),
};
