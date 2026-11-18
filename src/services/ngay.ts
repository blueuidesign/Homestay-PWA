// Ngày theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè). Ngày viết "YYYY-MM-DD", tháng "YYYY-MM" (README api).
// Tính bằng UTC trên chuỗi ngày nên không phụ thuộc múi giờ của máy.

const GIO_VN_MS = 7 * 60 * 60 * 1000;
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;

const hai = (n: number) => String(n).padStart(2, "0");
const raUtc = (ngay: string) => Date.parse(ngay + "T00:00:00Z");
const tuUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const laNgay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && tuUtc(raUtc(s)) === s;
export const laThang = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

export const ngayVN = (luc: number = Date.now()) => tuUtc(luc + GIO_VN_MS);
export const thangCua = (ngay: string) => ngay.slice(0, 7);
export const congNgay = (ngay: string, n: number) => tuUtc(raUtc(ngay) + n * MOT_NGAY_MS);

export const congThang = (thang: string, n: number) => {
  const [nam, t] = thang.split("-").map(Number);
  const tong = nam * 12 + (t - 1) + n;
  return `${Math.floor(tong / 12)}-${hai((tong % 12) + 1)}`;
};

const soNgayCua = (thang: string) => {
  const [nam, t] = thang.split("-").map(Number);
  return new Date(Date.UTC(nam, t, 0)).getUTCDate();
};

// Đêm có khách theo QT2.1: từ ngày nhận tới trước ngày trả
export const cacDem = (ngayNhan: string, ngayTra: string) => {
  const dem: string[] = [];
  for (let d = ngayNhan; d < ngayTra; d = congNgay(d, 1)) dem.push(d);
  return dem;
};

// Đêm cuối tuần mặc định T6, T7 (mục "Ngày tính giá cuối tuần" (US11)); chủ nhà đổi ở P6 (US11). Thứ đánh số 1 là T2 đến 7 là CN như tai_khoan.dem_cuoi_tuan.
export const DEM_CUOI_TUAN_MAC_DINH = [5, 6];
export const soThu = (ngay: string) => ((new Date(raUtc(ngay)).getUTCDay() + 6) % 7) + 1;
export const laCuoiTuan = (ngay: string, demCuoiTuan: number[] = DEM_CUOI_TUAN_MAC_DINH) => demCuoiTuan.includes(soThu(ngay));

// Tiền là số nguyên đồng, viết "2.200.000"
export const chuTien = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Lưới tháng, tuần bắt đầu thứ hai (nhóm Lịch chủ nhà quy tắc Tuần bắt đầu thứ hai). null là ô trống trước ngày 1.
export const THU_TRONG_TUAN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const luoiThang = (thang: string): (string | null)[] => {
  const ngay1 = `${thang}-01`;
  const thuNgay1 = (new Date(raUtc(ngay1)).getUTCDay() + 6) % 7; // T2 = 0 ... CN = 6
  const o: (string | null)[] = Array(thuNgay1).fill(null);
  for (let i = 0; i < soNgayCua(thang); i++) o.push(congNgay(ngay1, i));
  return o;
};

// Chữ trên màn: "T09", "Tháng 10/2026", "Ngày 10/10/2026", "10/10"
export const chuThangNgan = (thang: string) => "T" + thang.slice(5, 7);
export const chuThang = (thang: string) => `Tháng ${thang.slice(5, 7)}/${thang.slice(0, 4)}`;
export const chuNgay = (ngay: string) => `Ngày ${ngay.slice(8, 10)}/${ngay.slice(5, 7)}/${ngay.slice(0, 4)}`;
export const chuNgayNgan = (ngay: string) => `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
export const soCuaNgay = (ngay: string) => Number(ngay.slice(8, 10));
// Thứ viết ngắn trên đầu cột lịch 7 ngày của sale: "T2" đến "T7", "CN"
export const chuThu = (ngay: string) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][new Date(raUtc(ngay)).getUTCDay()];

// Lịch tuần bắt đầu thứ hai (nhóm Lịch chủ nhà quy tắc Tuần bắt đầu thứ hai): thứ hai của tuần chứa ngày này, và kiểm một ngày có phải thứ hai
export const laThuHai = (ngay: string) => new Date(raUtc(ngay)).getUTCDay() === 1;
export const thuHaiCuaTuan = (ngay: string) => congNgay(ngay, -((new Date(raUtc(ngay)).getUTCDay() + 6) % 7));

// Khoảng tuần trên thanh tuần: "05 – 11/10/2026"; qua tháng hoặc năm thì "26/10 – 01/11/2026"
export const chuThanhTuan = (tu: string, den: string) =>
  tu.slice(0, 7) === den.slice(0, 7)
    ? `${tu.slice(8, 10)} – ${den.slice(8, 10)}/${den.slice(5, 7)}/${den.slice(0, 4)}`
    : `${chuNgayNgan(tu)} – ${chuNgayNgan(den)}/${den.slice(0, 4)}`;
