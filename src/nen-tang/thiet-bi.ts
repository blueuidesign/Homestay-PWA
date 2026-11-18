// Lớp thiết bị của bản PWA. Thay cho zmp-sdk của bản Zalo: cùng tên hàm, cùng dạng kết quả, làm bằng API của trình duyệt.
// Nhờ vậy services/zalo.ts, services/chon-anh.ts và các màn chuyển từ bản Zalo chạy được mà không phải viết lại.
// Bảng đổi từng việc từ Zalo sang PWA: docs/luat-chung/PWA.md. Làm bản Zalo sau này: thay file này bằng zmp-sdk thật.
// Mọi hàm đều chịu được khi trình duyệt thiếu tính năng: trả kết quả "không làm được", không ném lỗi lạ.

const loi = (code: number, message: string) => Object.assign(new Error(message), { code });

// ---- Đăng nhập, tên, số điện thoại: chờ CH-001 (docs/Cau_hoi_mo.md). Bản PWA không có hộp thoại xin quyền của Zalo. ----
export const getAccessToken = async (): Promise<string> => "pwa";
export const authorize = async (_o?: unknown): Promise<void> => {
  throw loi(-201, "Bản PWA không xin quyền kiểu Zalo");
};
export const getUserInfo = async (_o?: unknown): Promise<{ userInfo: { name: string; avatar: string } }> => {
  throw loi(-1401, "Bản PWA không lấy tên từ Zalo");
};
export const getPhoneNumber = async (): Promise<{ token?: string }> => {
  throw loi(-201, "Bản PWA không lấy số điện thoại từ Zalo");
};
export const getSetting = async (): Promise<{ authSetting: Record<string, boolean | undefined> }> => ({ authSetting: {} });
export const openPermissionSetting = async (): Promise<void> => {};

// ---- Lưu nhỏ trên máy: chỉ lưu thứ mất cũng được. Chế độ ẩn danh có thể ném lỗi, nên bọc hết. ----
export const nativeStorage = {
  getItem(khoa: string): string | null {
    try {
      return window.localStorage.getItem(khoa);
    } catch {
      return null;
    }
  },
  setItem(khoa: string, giaTri: string): void {
    try {
      window.localStorage.setItem(khoa, giaTri);
    } catch {
      // không lưu được thì thôi
    }
  },
  removeItem(khoa: string): void {
    try {
      window.localStorage.removeItem(khoa);
    } catch {
      // như trên
    }
  },
};

// ---- Chia sẻ: bảng chia sẻ của điện thoại (Web Share). Thiếu thì sao chép chữ (PWA.md, CH-003). ----
// status: 0 người dùng hủy, 1 đã mở bảng chia sẻ và chọn xong, 2 đã sao chép vì máy không có bảng chia sẻ.
type ChiaSe =
  | { type: "text"; data: { text: string; autoParseLink?: boolean } }
  | { type: "image"; data: { imageUrls: string[] } };

const saoChepChu = async (chu: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(chu);
    return true;
  } catch {
    return false;
  }
};

export const openShareSheet = async (o: ChiaSe): Promise<{ status: number }> => {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (o.type === "text") {
      if (typeof nav.share === "function") {
        await nav.share({ text: o.data.text });
        return { status: 1 };
      }
      if (await saoChepChu(o.data.text)) return { status: 2 };
      throw loi(-1, "Máy không chia sẻ và không sao chép được");
    }
    const tep = await Promise.all(
      o.data.imageUrls.map(async (u, i) => {
        const b = await (await fetch(u)).blob();
        const duoi = b.type === "image/png" ? "png" : b.type === "image/webp" ? "webp" : "jpg";
        return new File([b], `anh-${i + 1}.${duoi}`, { type: b.type || "image/jpeg" });
      }),
    );
    if (typeof nav.share === "function" && nav.canShare?.({ files: tep })) {
      await nav.share({ files: tep });
      return { status: 1 };
    }
    throw loi(-1, "Trình duyệt này không gửi ảnh qua bảng chia sẻ được");
  } catch (e) {
    if ((e as { name?: string } | null)?.name === "AbortError") return { status: 0 };
    throw e;
  }
};

// ---- Gọi điện, mở Zalo ----
export const openPhone = async (o: { phoneNumber: string }): Promise<void> => {
  window.location.href = `tel:${o.phoneNumber.replace(/[^\d+]/g, "")}`;
};
// Bản PWA: id là số điện thoại của người kia. Zalo mở khung chat qua link zalo.me/<số>; tin soạn sẵn được chép vào bộ nhớ tạm để dán.
export const openChat = async (o: { type: "user" | "oa"; id: string; message?: string }): Promise<void> => {
  if (o.message) await saoChepChu(o.message);
  window.open(`https://zalo.me/${encodeURIComponent(o.id.replace(/[^\d]/g, ""))}`, "_blank", "noopener");
};

// ---- Tham số trên địa chỉ khi mở app từ link ----
export const getRouteParams = (): Record<string, string> => {
  try {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  } catch {
    return {};
  }
};

// ---- Chọn ảnh từ máy: ô chọn tệp của trình duyệt. Trả đường dẫn blob: dùng được cho <img> và fetch. ----
export const chooseImage = (o: { sourceType?: string[]; count?: number }): Promise<{ filePaths: string[]; tempFiles: { path: string; size: number }[] }> =>
  new Promise((xong) => {
    const o_chon = document.createElement("input");
    o_chon.type = "file";
    o_chon.accept = "image/*";
    o_chon.multiple = (o.count ?? 1) > 1;
    o_chon.style.display = "none";
    let daXong = false;
    const tra = (tep: File[]) => {
      if (daXong) return;
      daXong = true;
      o_chon.remove();
      const chon = tep.slice(0, o.count ?? tep.length);
      xong({ filePaths: chon.map((t) => URL.createObjectURL(t)), tempFiles: chon.map((t) => ({ path: t.name, size: t.size })) });
    };
    o_chon.addEventListener("change", () => tra(Array.from(o_chon.files ?? [])));
    o_chon.addEventListener("cancel", () => tra([]));
    document.body.appendChild(o_chon);
    o_chon.click();
  });

// ---- Việc chỉ Zalo có: bản PWA không làm gì ----
export const configAppView = async (_o?: unknown): Promise<void> => {};
export const EventName = { NetworkChanged: "NetworkChanged", AppResumed: "AppResumed" } as const;
export const events = {
  on(_ten: string, _ham: (...a: never[]) => void): void {},
  off(_ten: string, _ham: (...a: never[]) => void): void {},
};
