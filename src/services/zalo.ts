// Lớp bọc zmp-sdk cho phần xin tên và số điện thoại, chia sẻ link, sao chép, gọi điện, mở cài đặt quyền (US5).
// Màn không gọi zmp-sdk trực tiếp mà gọi qua đây, để test thay bằng bản giả (datCongZalo).
// Mini App chỉ lấy token và gửi cho server. Không đổi token ở app, không có App Secret (zalo-rang-buoc 2.4).
// zmp-sdk cần window khi nạp, nên chỉ nạp lúc gọi (test chạy ngoài trình duyệt không nạp nó)
const sdk = () => import("../nen-tang/thiet-bi");
import { DU_LIEU_GIA } from "./api";

// Kết quả xin tên và số trong một lần bấm "Đồng ý, tiếp tục" (QD2, mục "Hộp thoại cấp quyền của Zalo" (US5) bước 1).
// Người dùng cho tên mà không cho số, hay ngược lại, thì gửi phần có (api/phien-ho-so.md; cách Zalo trả: chờ SK10).
export type KetQuaXinSo =
  | { kq: "co"; access_token: string; token_sdt: string | null; ho_ten: string | null; anh_zalo: string | null }
  | { kq: "tu_choi" } // đóng hộp thoại hoặc từ chối cả hai: không phải lỗi (HV4 bước 2)
  | { kq: "loi" };

export const TOI_DA_ANH_MOI_LAN = 10;
export type KetQuaChiaSe = "da_gui" | "huy" | "loi";

export type CongZalo = {
  // Access token để gọi POST /phien (server.md 1.2 bước 1). Không hiện hộp thoại xin quyền. Lỗi thì ném.
  // Ba nhóm hàm này chỉ lớp HTTP (http.ts) dùng; cổng giả của test màn có thể bỏ qua.
  layAccessToken?(): Promise<string>;
  // Native Storage (tối đa 5 MB, chỉ lưu thứ mất cũng được). Không có localStorage, cookie. Lỗi đọc thì trả null, lỗi ghi bỏ qua.
  docLuu?(khoa: string): Promise<string | null>;
  ghiLuu?(khoa: string, giaTri: string): Promise<void>;
  xoaLuu?(khoa: string): Promise<void>;
  xinTenVaSo(): Promise<KetQuaXinSo>;
  // getSetting báo quyền số điện thoại đã bị từ chối (HV4)
  daTuChoiSo(): Promise<boolean>;
  moCaiDatQuyen(): Promise<void>;
  chiaSeChu(chu: string): Promise<KetQuaChiaSe>;
  // Gửi ảnh qua cửa sổ chia sẻ (US14, SK2): tối đa 10 ảnh mỗi lần, 11 ảnh lỗi -1400
  chiaSeAnh(duongDan: string[]): Promise<KetQuaChiaSe>;
  saoChep(chu: string): Promise<boolean>;
  goiDien(so: string): Promise<boolean>;
  // Mở khung chat Zalo với một người, điền sẵn tin; người dùng tự bấm gửi (zalo-hanh-vi 5.1). id là ID Zalo của người đó.
  moChat?(zaloId: string, tin: string): Promise<boolean>;
};

// Mã lỗi zmp-sdk khi người dùng từ chối: -201 (authorize, getPhoneNumber), -1401 (getUserInfo)
const MA_TU_CHOI = [-201, -1401];
const laTuChoi = (e: unknown) => MA_TU_CHOI.includes((e as { code?: number } | null)?.code ?? 0);

const congThat: CongZalo = {
  async layAccessToken() {
    const { getAccessToken } = await sdk();
    return getAccessToken();
  },
  async docLuu(khoa) {
    try {
      const { nativeStorage } = await sdk();
      const v = nativeStorage.getItem(khoa);
      return typeof v === "string" ? v : null;
    } catch {
      return null;
    }
  },
  async ghiLuu(khoa, giaTri) {
    try {
      const { nativeStorage } = await sdk();
      nativeStorage.setItem(khoa, giaTri);
    } catch {
      // Không ghi được thì phiên chỉ nằm trong bộ nhớ, mở app lần sau lấy phiên mới (server.md 1.2 bước 4)
    }
  },
  async xoaLuu(khoa) {
    try {
      const { nativeStorage } = await sdk();
      nativeStorage.removeItem(khoa);
    } catch {
      // như trên
    }
  },
  async xinTenVaSo() {
    const { authorize, getAccessToken, getPhoneNumber, getUserInfo } = await sdk();
    let access_token: string;
    try {
      access_token = await getAccessToken();
    } catch {
      return { kq: "loi" };
    }
    // Tên và ảnh (scope.userInfo) rồi số (getPhoneNumber) liền nhau. Zalo hiện một hay hai hộp thoại: SK10.
    let ho_ten: string | null = null;
    let anh_zalo: string | null = null;
    let loiTen = false;
    try {
      await authorize({ scopes: ["scope.userInfo"] });
      const { userInfo } = await getUserInfo({});
      ho_ten = userInfo.name || null;
      anh_zalo = /^https:\/\//.test(userInfo.avatar ?? "") ? userInfo.avatar : null;
    } catch (e) {
      loiTen = !laTuChoi(e);
    }
    let token_sdt: string | null = null;
    let loiSo = false;
    try {
      const { token } = await getPhoneNumber();
      token_sdt = token ?? null;
    } catch (e) {
      loiSo = !laTuChoi(e);
    }
    if (ho_ten === null && token_sdt === null) return loiTen || loiSo ? { kq: "loi" } : { kq: "tu_choi" };
    return { kq: "co", access_token, token_sdt, ho_ten, anh_zalo };
  },
  async daTuChoiSo() {
    try {
      const { getSetting } = await sdk();
      const { authSetting } = await getSetting();
      return (authSetting as Record<string, boolean | undefined>)["scope.userPhonenumber"] === false;
    } catch {
      return false;
    }
  },
  async moCaiDatQuyen() {
    try {
      const { openPermissionSetting } = await sdk();
      await openPermissionSetting();
    } catch {
      // Không mở được thì ở lại màn, không báo lỗi (US5-KB7)
    }
  },
  async chiaSeChu(chu) {
    try {
      const { openShareSheet } = await sdk();
      // status 0 là người dùng hủy, 1 và 2 là đã gửi (zalo-rang-buoc 5.5)
      const { status } = (await openShareSheet({ type: "text", data: { text: chu, autoParseLink: true } })) as { status?: number };
      return status === 0 ? "huy" : "da_gui";
    } catch {
      return "loi";
    }
  },
  async chiaSeAnh(duongDan) {
    try {
      const { openShareSheet } = await sdk();
      const { status } = (await openShareSheet({ type: "image", data: { imageUrls: duongDan.slice(0, TOI_DA_ANH_MOI_LAN) } })) as { status?: number };
      return status === 0 ? "huy" : "da_gui";
    } catch {
      return "loi";
    }
  },
  // zmp-sdk không có API clipboard. Dùng clipboard của webview, chưa thử trên máy thật (US5-KB4).
  async saoChep(chu) {
    try {
      await navigator.clipboard.writeText(chu);
      return true;
    } catch {
      try {
        const o = document.createElement("textarea");
        o.value = chu;
        o.style.position = "fixed";
        o.style.opacity = "0";
        document.body.appendChild(o);
        o.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(o);
        return ok;
      } catch {
        return false;
      }
    }
  },
  async goiDien(so) {
    try {
      const { openPhone } = await sdk();
      await openPhone({ phoneNumber: so });
      return true;
    } catch {
      return false;
    }
  },
  async moChat(zaloId, tin) {
    try {
      const { openChat } = await sdk();
      await openChat({ type: "user", id: zaloId, message: tin });
      return true;
    } catch {
      return false;
    }
  },
};

// Bản thử ngoài Zalo (trình duyệt máy tính, dữ liệu giả): hộp thoại Zalo không có nên giả lập "Cho phép".
// Token dạng "sdt:<số>" để server giả ra đúng số đó.
/** Số giả cho server thử: đầu 0999 rồi 6 chữ số (gốc ngẫu nhiên, mỗi lần cộng 1 nên hai lần gọi không trùng), chỉ nằm trong database tạm của server thử. */
let demSoGia = Math.floor(Math.random() * 1e6);
export const soGiaThu = () => `0999${String(++demSoGia % 1e6).padStart(6, "0")}`;
const luuMoPhong = new Map<string, string>(); // chỉ trong bộ nhớ: ngoài Zalo không có Native Storage
export const congMoPhong: CongZalo = {
  // Chạy với server thử (src/server/thu-ghep.js) thì đặt VITE_ZALO_TOKEN_THU=thu:<ten>. Server thật cần token thật nên không dùng được ở đây.
  async layAccessToken() {
    return (import.meta.env?.VITE_ZALO_TOKEN_THU as string | undefined) || "mo-phong";
  },
  async docLuu(khoa) {
    return luuMoPhong.get(khoa) ?? null;
  },
  async ghiLuu(khoa, giaTri) {
    luuMoPhong.set(khoa, giaTri);
  },
  async xoaLuu(khoa) {
    luuMoPhong.delete(khoa);
  },
  async xinTenVaSo() {
    // Có VITE_ZALO_TOKEN_THU (server thử): access token cùng người dùng thử, token số mới mỗi lần vì server thử chỉ đổi mỗi token một lần.
    const tokenThu = import.meta.env?.VITE_ZALO_TOKEN_THU as string | undefined;
    if (tokenThu) return { kq: "co", access_token: tokenThu, token_sdt: `sdt:${soGiaThu()}`, ho_ten: "Nguyễn Hoa", anh_zalo: null };
    return { kq: "co", access_token: "mo-phong", token_sdt: `sdt:0900000101`, ho_ten: "Nguyễn Hoa", anh_zalo: null };
  },
  async daTuChoiSo() {
    return false;
  },
  async moCaiDatQuyen() {},
  async chiaSeChu() {
    return "da_gui";
  },
  async chiaSeAnh() {
    return "da_gui";
  },
  saoChep: (chu) => congThat.saoChep(chu),
  async goiDien() {
    return true;
  },
  async moChat() {
    return true;
  },
};

// Mã link mời trên đường dẫn mở app (zalo-hanh-vi mục 1.3: link zalo.me/s/<id>/?ma=...). Trong Zalo đọc getRouteParams,
// ngoài Zalo (bản thử trên trình duyệt) đọc ?ma= của địa chỉ trang. Chưa thử trên máy thật; chưa nghe OpenApp (app đang chạy nền).
export async function docMaLinkKhiMo(): Promise<string | null> {
  try {
    const { getRouteParams } = await sdk();
    const p = getRouteParams();
    if (p?.ma) return p.ma;
  } catch {
    // Ngoài Zalo
  }
  try {
    return new URLSearchParams(window.location.search).get("ma");
  } catch {
    return null;
  }
}

const trongZalo = () => typeof navigator !== "undefined" && /Zalo/i.test(navigator.userAgent);

let congTest: CongZalo | null = null;
// Cho test: thay cổng Zalo bằng bản giả. Truyền null để trả về mặc định.
export const datCongZalo = (c: CongZalo | null) => {
  congTest = c;
};

const cong = (): CongZalo => congTest ?? (DU_LIEU_GIA && !trongZalo() ? congMoPhong : congThat);

export const zalo: Required<CongZalo> = {
  layAccessToken: () => {
    const c = cong();
    return c.layAccessToken ? c.layAccessToken() : Promise.reject(new Error("Cổng Zalo không có layAccessToken"));
  },
  docLuu: async (k) => (await cong().docLuu?.(k)) ?? null,
  ghiLuu: async (k, v) => void (await cong().ghiLuu?.(k, v)),
  xoaLuu: async (k) => void (await cong().xoaLuu?.(k)),
  xinTenVaSo: () => cong().xinTenVaSo(),
  daTuChoiSo: () => cong().daTuChoiSo(),
  moCaiDatQuyen: () => cong().moCaiDatQuyen(),
  chiaSeChu: (c) => cong().chiaSeChu(c),
  chiaSeAnh: (d) => cong().chiaSeAnh(d),
  saoChep: (c) => cong().saoChep(c),
  goiDien: (s) => cong().goiDien(s),
  moChat: async (i, t) => (await cong().moChat?.(i, t)) ?? false,
};
