// Nội dung "Hướng dẫn sử dụng" (YC1.7, P9). Chữ thường, mỗi mục là các bước ngắn. YC1.7 bước 2 cho mẫu "Đặt giá theo tháng".
// Các mục còn lại và phần cho sale: YC1-H10 (Claude tự chốt 20/11/2026, chờ Tùng duyệt lại).
import type { Vai } from './dieuHuong';

export type MucHuongDan = { khoa: string; tieuDe: string; buoc: string[] };
export type NhomHuongDan = { tieuDe: string; muc: MucHuongDan[] };

export const HUONG_DAN_CHU: NhomHuongDan = {
  tieuDe: 'Chủ nhà',
  muc: [
    { khoa: 'them-can', tieuDe: 'Thêm căn và ảnh', buoc: ['Mở tab Căn, bấm Thêm căn.', 'Nhập mã căn, số phòng ngủ rồi chọn ảnh (tối đa 12 ảnh).', 'Bấm Lưu. Ảnh đầu tiên là ảnh đại diện của căn.'] },
    { khoa: 'gia-thang', tieuDe: 'Đặt giá theo tháng', buoc: ['Mở căn, chọn tab Giá.', 'Chạm tháng bắt đầu rồi tháng kết thúc.', 'Nhập giá ngày thường, cuối tuần, bấm Áp dụng.'] },
    { khoa: 'gia-le', tieuDe: 'Đặt giá ngày lễ', buoc: ['Mở căn, chọn tab Giá, kéo xuống mục Ngày lễ và dịp đặc biệt.', 'Chạm ngày lễ cần đặt, hay bấm Thêm dịp để chọn khoảng ngày.', 'Nhập giá rồi bấm Lưu. Giá này thay giá tháng trong những ngày đó.'] },
    { khoa: 'dat-phong', tieuDe: 'Đặt phòng', buoc: ['Ở tab Lịch, chạm ô trống của căn và ngày nhận phòng.', 'Nhập người đặt, ngày nhận, ngày trả, tiền phòng và tiền cọc.', 'Bấm Lưu. Các đêm từ ngày nhận tới trước ngày trả được giữ cho khách.'] },
    { khoa: 'moi-sale', tieuDe: 'Mời sale xem lịch', buoc: ['Mở tab Sale, bấm Mời sale.', 'Chọn căn cho sale xem, bấm Gửi và chia sẻ link qua Zalo hay tin nhắn.', 'Sale mở link, đăng nhập là thấy lịch trống và giá của bạn.'] },
    { khoa: 'sale-xem', tieuDe: 'Sale được xem gì', buoc: ['Sale thấy lịch trống, giá của bạn và ảnh của các căn bạn đã chia sẻ.', 'Sale không thấy tên khách bạn ghi.', 'Bạn không thấy mức cộng và giá bán của sale. Bạn dừng chia sẻ bất cứ lúc nào ở tab Sale.'] },
  ],
};

/** YC1-H10 (Claude tự chốt 20/11/2026): sale có hướng dẫn riêng, dựa trên các màn của sale. */
export const HUONG_DAN_SALE: NhomHuongDan = {
  tieuDe: 'Sale',
  muc: [
    { khoa: 'xin-lich', tieuDe: 'Xin chủ nhà cho xem lịch', buoc: ['Ở tab Lịch, bấm Gửi tin nhắn xin lịch cho chủ nhà.', 'Chia sẻ link cho chủ nhà qua Zalo hay tin nhắn.', 'Chủ nhà mở link và đồng ý thì căn vào tab Căn của bạn.'] },
    { khoa: 'tim-phong', tieuDe: 'Tìm phòng trống theo ngày', buoc: ['Ở tab Lịch, bấm ô Tìm phòng trống theo ngày.', 'Chọn ngày nhận, ngày trả và số phòng ngủ.', 'Chạm căn trong kết quả để xem giá và ảnh.'] },
    { khoa: 'gui-khach', tieuDe: 'Gửi ảnh và giá cho khách', buoc: ['Mở căn cần gửi, bấm Gửi cho khách.', 'Xem tin nhắn mẫu, sửa nếu cần.', 'Bấm Chia sẻ rồi chọn Zalo của khách. Khách chỉ thấy giá bán của bạn.'] },
    { khoa: 'muc-cong', tieuDe: 'Cộng giá bán', buoc: ['Vào tab Cá nhân, chạm Mức cộng giá mặc định.', 'Chọn mức cộng mỗi đêm, bật làm tròn nếu muốn.', 'Bấm Lưu. Khi soạn tin vẫn sửa được mức cộng cho từng căn.'] },
    { khoa: 'yeu-cau', tieuDe: 'Gửi yêu cầu đặt phòng cho chủ nhà', buoc: ['Mở căn, chọn ngày ở, bấm Gửi yêu cầu cho chủ nhà.', 'Chờ chủ nhà trả lời. Bạn nhận thông báo trong app.', 'Chủ nhà chấp nhận thì đặt phòng hiện trong tab Thống kê.'] },
    { khoa: 'can-tu-nhap', tieuDe: 'Thêm căn của riêng bạn', buoc: ['Mở tab Căn, bấm Thêm căn tự nhập.', 'Nhập thông tin và ảnh căn.', 'Căn tự nhập không có lịch trống, ô ngày hiện dấu ?.'] },
  ],
};

export function huongDanCuaVai(vai: Vai): NhomHuongDan {
  return vai === 'chu_nha' ? HUONG_DAN_CHU : HUONG_DAN_SALE;
}

/** YC1.7 bước 3. */
export const CAU_CON_THAC_MAC = 'Vẫn chưa rõ? Home247 trả lời qua Zalo trong giờ hành chính.';
