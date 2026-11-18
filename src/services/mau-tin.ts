// Chữ gửi khách theo mẫu tin (US14, mục "Gửi thông tin cho khách qua Zalo" (US14) bước 2, mục "Mẫu tin gửi khách" (US14)). Hàm thuần, không gọi API, không gọi Zalo.
// Server giả (api.ts) dùng để dựng chữ; màn P11 dùng để dựng bản xem trước ở app (mục "Mẫu tin gửi khách" (US14) bước 3: app dựng, không gọi server).
// Cách dựng chép từ src/server/domain/gui-khach/index.js để chữ ở P11 và chữ ở S5 giống nhau.
// Chữ gửi khách chỉ có giá bán. Không có giá chủ nhà, mức cộng, số khách, tiện ích (US14-NT4, US14-NT5, US14-NT12).

// Các ô chèn của mẫu (nhóm Tìm phòng và gửi khách quy tắc Mẫu tin gửi khách), theo thứ tự hàng "Chạm để chèn" ở P11
export const CAC_O_CHEN = ["[Ngày]", "[Số đêm]", "[Số căn]", "[Danh sách căn]", "[Tên sale]"] as const;

// Mẫu mặc định. Nội dung chưa chốt [MỞ: api/sale.md câu hỏi 14]; chép đúng chuỗi MAU_MAC_DINH của server (src/server/domain/gui-khach).
export const MAU_MAC_DINH = "Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):\n[Danh sách căn]\nAnh chị ưng căn nào báo em giữ phòng nhé.";
export const TOI_DA_KY_TU_MAU = 2000; // api/phien-ho-so.md: mau_tin_gui_khach tới 2.000 ký tự

const CHU_VIEW: Record<string, string> = { bien: "biển", thanh_pho: "thành phố", nui: "núi" };

// Hàng chip Số phòng ngủ (mục "Tòa nhà, loại view, số giường, mô tả" (US1)): 0 là Studio, 4 là 4PN+
const chuPhongNgu = (n: number) => (n === 0 ? "Studio" : n >= 4 ? "4PN+" : `${n}PN`);

// 2600000 -> "2.600.000đ". Tiền là số nguyên đồng.
export const chuDong = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;

// "2026-10-24" -> "24/10"
const chuNgay = (ngay: string) => `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
export const chuKhoangNgay = (nhan: string, tra: string) => `${chuNgay(nhan)} → ${chuNgay(tra)}`;

export type CanDeDungChu = {
  ten: string; // "ICON40 1509"
  so_phong_ngu: number;
  so_giuong: number | null;
  loai_view: string | null; // mã: bien, thanh_pho, nui
  khu_vuc: string | null;
};

// "ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy". Phòng ngủ và số giường theo glossary, không số khách (US14-NT5).
export function dongMoTa(c: CanDeDungChu): string {
  let s = `${c.ten} · ${chuPhongNgu(c.so_phong_ngu)}`;
  if (c.so_giuong != null) s += ` · ${c.so_giuong} giường`;
  const view = [c.loai_view && CHU_VIEW[c.loai_view] ? `view ${CHU_VIEW[c.loai_view]}` : null, c.khu_vuc || null].filter(Boolean).join(" ");
  return view ? `${s}, ${view}` : s;
}

// Chữ một căn: "<mô tả>\n<nhận> → <trả> (<n> đêm): <giá bán>". Không có giá bán thì không có số tiền nào.
export function chuMotCan(c: CanDeDungChu, nhan: string, tra: string, soDem: number, giaBan: number | null): string {
  const dong2 = `${chuKhoangNgay(nhan, tra)} (${soDem} đêm)`;
  return `${dongMoTa(c)}\n${giaBan == null ? dong2 : `${dong2}: ${chuDong(giaBan)}`}`;
}

export type CanTrongMau = { moTa: string; giaBan: number | null };

// Chữ cả lô theo mẫu. null là mẫu mặc định. Ô lạ trong ngoặc vuông giữ nguyên.
export function dungChuTheoMau(mau: string | null, nhan: string, tra: string, soDem: number, dsCan: CanTrongMau[], tenSale: string | null): string {
  const ds = dsCan.map((c, i) => `${i + 1}. ${c.moTa}${c.giaBan == null ? "" : `: ${chuDong(c.giaBan)}`}`).join("\n");
  const thay: Record<string, string> = {
    "[Ngày]": chuKhoangNgay(nhan, tra),
    "[Số đêm]": `${soDem} đêm`,
    "[Số căn]": String(dsCan.length),
    "[Danh sách căn]": ds,
    "[Tên sale]": tenSale ?? "",
  };
  return (mau ?? MAU_MAC_DINH).replace(/\[(Ngày|Số đêm|Số căn|Danh sách căn|Tên sale)\]/g, (o) => thay[o]);
}

// Căn mẫu của bản xem trước ở P11 (DLM.7: 3 căn trống 10/10 → 12/10). Giá là giá bán, không có giá chủ.
export const NGAY_XEM_TRUOC = { nhan: "2026-10-10", tra: "2026-10-12", soDem: 2 };
export const CAN_XEM_TRUOC: CanTrongMau[] = [
  { moTa: "ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy", giaBan: 2_600_000 },
  { moTa: "Sapphire 1103 · 3PN · 2 giường, view thành phố", giaBan: 1_600_000 },
  { moTa: "À La Carte 2208 · 1PN · 1 giường, view biển", giaBan: 3_600_000 },
];

// Bản xem trước "KHÁCH SẼ NHẬN ĐƯỢC" (mục "Mẫu tin gửi khách" (US14) bước 3): dựng ở app từ mẫu đang gõ và ba căn mẫu
export const xemTruocMau = (mau: string, tenSale: string | null) =>
  dungChuTheoMau(mau, NGAY_XEM_TRUOC.nhan, NGAY_XEM_TRUOC.tra, NGAY_XEM_TRUOC.soDem, CAN_XEM_TRUOC, tenSale);

// Chèn một ô vào mẫu tại vị trí con trỏ (mục "Mẫu tin gửi khách" (US14) bước 2). Trả mẫu mới và vị trí con trỏ sau ô vừa chèn.
export function chenO(mau: string, tu: number, den: number, o: string): { mau: string; conTro: number } {
  const a = Math.max(0, Math.min(tu, mau.length));
  const b = Math.max(a, Math.min(den, mau.length));
  return { mau: mau.slice(0, a) + o + mau.slice(b), conTro: a + o.length };
}

// Lưu: mẫu bằng mẫu mặc định thì gửi null (dùng mẫu mặc định, mục "Mẫu tin gửi khách" (US14) bước 4)
export const mauDeLuu = (mau: string): string | null => (mau === MAU_MAC_DINH ? null : mau);
