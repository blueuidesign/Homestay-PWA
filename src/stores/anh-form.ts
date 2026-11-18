// Danh sách ảnh trong form thêm căn CN5-A1 (US25, mục "Ảnh khi thêm căn" (US25)). Giữ trạng thái từng ảnh: đang tải, xong, lỗi.
// Chạy được ngoài React để test; màn đọc qua useSyncExternalStore.
import { MAX_ANH_CAN, postAnh } from "../services/api";
import { LoiMang, type Anh, type KetQuaPostAnh, type TepAnh } from "../services/kieu";

export const NEN_TOI_THIEU_ANH = 6; // US25-NT1: căn dưới 6 ảnh thì gợi ý thêm ảnh

export type TrangThaiAnh = "dang_tai" | "xong" | "loi";
export type AnhForm = {
  khoa: string; // khóa trong form
  tep: TepAnh;
  trang_thai: TrangThaiAnh;
  tien_do: number; // 0 đến 100
  anh_id: string | null;
  idem: string; // Idempotency-Key của POST /anh, giữ nguyên khi "Thử lại"
};

export type TaiAnh = (tep: TepAnh, idem: string, onTienDo?: (p: number) => void) => Promise<KetQuaPostAnh>;

export const demTheo = (ds: AnhForm[], t: TrangThaiAnh) => ds.filter((a) => a.trang_thai === t).length;
// US25-NT2, NT2: còn ảnh đang tải thì không thêm căn; ảnh lỗi thì chặn khi bấm "Thêm căn"
export const chuDangTai = (n: number) => `Đang tải ${n} ảnh. Chờ tải xong mới thêm được căn.`;
export const chuLoiAnh = (n: number) => `${n} ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn.`;

let demKhoa = 0;
const khoaMoi = (tien: string) => `${tien}${Date.now().toString(36)}${(++demKhoa).toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export class BoAnhForm {
  private ds: AnhForm[] = [];
  private nghe = new Set<() => void>();

  constructor(private taiLen: TaiAnh = postAnh) {}

  // Cho useSyncExternalStore: tham chiếu chỉ đổi khi danh sách đổi
  lay = () => this.ds;
  dangKy = (f: () => void) => {
    this.nghe.add(f);
    return () => {
      this.nghe.delete(f);
    };
  };

  private dat(ds: AnhForm[]) {
    this.ds = ds;
    this.nghe.forEach((f) => f());
  }
  private sua(khoa: string, ghi: Partial<AnhForm>) {
    if (!this.ds.some((a) => a.khoa === khoa)) return; // đã xóa trong lúc tải
    this.dat(this.ds.map((a) => (a.khoa === khoa ? { ...a, ...ghi } : a)));
  }

  // Thêm ảnh vừa chọn, tối đa 12 ảnh (US25-NT4). Trả số ảnh nhận và số ảnh bị bỏ vì quá 12.
  // `xong` hoàn tất khi mọi ảnh vừa thêm đã tải xong hoặc lỗi.
  themTep(tep: TepAnh[]): { nhan: number; bo: number; xong: Promise<void> } {
    const con = Math.max(0, MAX_ANH_CAN - this.ds.length);
    const moi: AnhForm[] = tep.slice(0, con).map((t) => ({
      khoa: khoaMoi("a"),
      tep: t,
      trang_thai: "dang_tai",
      tien_do: 0,
      anh_id: null,
      idem: khoaMoi("anh-"),
    }));
    if (moi.length) this.dat([...this.ds, ...moi]);
    return { nhan: moi.length, bo: tep.length - moi.length, xong: Promise.all(moi.map((a) => this.tai(a.khoa))).then(() => undefined) };
  }

  private async tai(khoa: string) {
    const a = this.ds.find((x) => x.khoa === khoa);
    if (!a) return;
    this.sua(khoa, { trang_thai: "dang_tai", tien_do: 0 });
    try {
      const kq = await this.taiLen(a.tep, a.idem, (p) => this.sua(khoa, { tien_do: p }));
      this.sua(khoa, { trang_thai: "xong", tien_do: 100, anh_id: kq.anh_id });
    } catch (e) {
      // Server đã trả lỗi thì lần thử lại là yêu cầu mới, đổi khóa; mất mạng thì giữ khóa để không tạo hai ảnh (HV1, HV2)
      this.sua(khoa, { trang_thai: "loi", ...(e instanceof LoiMang ? {} : { idem: khoaMoi("anh-") }) });
    }
  }

  // Nút "Thử lại" trên ảnh lỗi (mục "Ảnh khi thêm căn" (US25) bước 4): cùng Idempotency-Key
  thuLai(khoa: string): Promise<void> {
    return this.ds.find((a) => a.khoa === khoa)?.trang_thai === "loi" ? this.tai(khoa) : Promise.resolve();
  }

  // Nút ✕ xóa ảnh khỏi form. Ảnh tạm đã lên server thì server tự xóa sau 24 giờ.
  xoa(khoa: string) {
    this.dat(this.ds.filter((a) => a.khoa !== khoa));
  }

  // US11 · CN5-02: nạp ảnh đang gắn căn (đã có trên server, trạng thái xong). Gọi một lần khi mở màn sửa.
  nap(anh: Anh[]) {
    this.dat(
      anh.map((a) => ({
        khoa: khoaMoi("c"),
        tep: { ten: a.id, duong_dan: a.duong_dan_xem, dung_luong: 0 },
        trang_thai: "xong" as const,
        tien_do: 100,
        anh_id: a.id,
        idem: "",
      })),
    );
  }

  // US11 · CN5-02 "Đổi thứ tự": đưa ảnh lên trước (-1) hoặc ra sau (1) một vị trí. Ảnh số 1 sau khi lưu là ảnh đại diện (US11-NT9).
  doiViTri(khoa: string, huong: -1 | 1) {
    const i = this.ds.findIndex((a) => a.khoa === khoa);
    const j = i + huong;
    if (i < 0 || j < 0 || j >= this.ds.length) return;
    const moi = [...this.ds];
    [moi[i], moi[j]] = [moi[j], moi[i]];
    this.dat(moi);
  }

  // Thứ tự ảnh là thu_tu, ảnh đầu là ảnh đại diện
  anhIds(): string[] {
    return this.ds.map((a) => a.anh_id).filter((id): id is string => !!id);
  }
}
