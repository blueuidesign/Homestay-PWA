// YC15.3-NT2 · Điều khoản và Chính sách quyền riêng tư, mở từ dòng "Bằng việc tiếp tục…" ở A1, A1-link, A2, A11.
// Xem được khi chưa đăng nhập (HV4). Nội dung do Claude soạn theo QD11, QD13, YC15, chờ Tùng duyệt (work/cho-tung.md).
// Chính sách trả lời YC1-H7: giữ gì sau khi xóa tài khoản, giữ bao lâu, để làm gì.
import { Icon } from './TabChu';
import './P2HoSo.css';
import './TrangPhapLy.css';

export const DUONG_DIEU_KHOAN = '/dieu-khoan';
export const DUONG_CHINH_SACH = '/chinh-sach-rieng-tu';
const NGAY_CAP_NHAT = '21/11/2026';
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

type Muc = { tieuDe: string; doan: string[] };

export const DIEU_KHOAN: Muc[] = [
  { tieuDe: 'Home247 là gì', doan: [
    'Home247 là ứng dụng giúp chủ nhà homestay ở Hạ Long ghi lịch, giá phòng và chia sẻ cho sale; sale tra căn trống và gửi ảnh, giá cho khách.',
    'Home247 không phải bên cho thuê phòng, không nhận tiền phòng và không đứng giữa thanh toán. Việc đặt, cọc, trả tiền là thỏa thuận giữa chủ nhà, sale và khách.'] },
  { tieuDe: 'Tài khoản', doan: [
    'Bạn đăng nhập bằng mã gửi về email, cần ghi đúng tên và số điện thoại để người đã kết nối nhận ra và gọi cho bạn.',
    'Mỗi người dùng một tài khoản của chính mình, không cho người khác dùng chung. Bạn chịu trách nhiệm về những gì ghi bằng tài khoản của mình.'] },
  { tieuDe: 'Dữ liệu bạn ghi', doan: [
    'Lịch, giá, đặt phòng do bạn ghi phải đúng sự thật. Home247 giúp chặn hai đặt phòng trùng đêm trong cùng một căn, nhưng không bảo đảm khách sẽ tới hay trả tiền.',
    'Khi ghi tên, số điện thoại của khách, bạn tự xin phép khách trước. Chỉ bạn thấy khách do bạn nhập.',
    'Giá chủ nhà chỉ chủ nhà và sale được chia sẻ thấy. Giá bán, mức cộng của sale chỉ sale đó thấy. Khách không bao giờ thấy giá chủ nhà.'] },
  { tieuDe: 'Điều không được làm', doan: [
    'Không ghi thông tin giả, không dùng app để quấy rối, lừa đảo, hay lấy dữ liệu của người khác. Home247 có thể khóa tài khoản vi phạm và báo cơ quan có thẩm quyền khi luật yêu cầu.'] },
  { tieuDe: 'Thay đổi và liên hệ', doan: [
    'Khi điều khoản đổi, app báo trong mục Thông báo trước khi áp dụng. Bạn tiếp tục dùng nghĩa là đồng ý bản mới.',
    'Cần hỏi gì, nhắn Zalo cho Home247 ở Cá nhân > "Nhắn Zalo cho Home247".'] },
];

export const CHINH_SACH: Muc[] = [
  { tieuDe: 'Home247 lưu gì', doan: [
    'Email đăng nhập, họ tên, tên hiển thị, số điện thoại, ảnh đại diện nếu bạn tải lên.',
    'Căn, ảnh căn, lịch, giá, đặt phòng, yêu cầu đặt phòng, kết nối giữa chủ nhà và sale.',
    'Tên, số điện thoại khách do bạn nhập vào đặt phòng (chỉ bạn thấy).',
    'Bản ghi lỗi của app để sửa lỗi: thông điệp lỗi, màn đang mở, loại trình duyệt. Bản ghi lỗi không có số điện thoại, email, tên khách.'] },
  { tieuDe: 'Ai thấy gì', doan: [
    'Người đã kết nối với bạn thấy tên và số điện thoại của bạn. Sale được chủ nhà chia sẻ thấy lịch, giá chủ nhà của các căn được chia sẻ.',
    'Không ai ngoài bạn thấy khách do bạn nhập, giá bán và mức cộng của bạn. Home247 không bán, không cho thuê dữ liệu của bạn.'] },
  { tieuDe: 'Lưu ở đâu, bao lâu', doan: [
    'Dữ liệu lưu trên máy chủ của Supabase, kết nối luôn mã hóa. Bản sao lưu mỗi đêm được mã hóa, giữ 60 ngày rồi tự xóa.',
    'Bản ghi lỗi giữ 30 ngày rồi tự xóa. Thông báo trong app giữ để bạn xem lại.'] },
  { tieuDe: 'Khi bạn xóa tài khoản', doan: [
    'Số điện thoại của bạn bị xóa ngay; người đã kết nối không còn gọi, nhắn bạn từ app.',
    'Tên, căn, ảnh, lịch, giá, đặt phòng và khách bạn đã nhập vẫn giữ, vì đặt phòng đã có còn chiếm đêm và còn trong sổ của bên kia, và để bạn đăng nhập lại là dùng tiếp như cũ. Người khác thấy tên bạn kèm dòng "Đã xoá tài khoản".',
    'Bản sao lưu cũ còn số của bạn tối đa 60 ngày rồi tự xóa. Muốn xóa hẳn mọi dữ liệu, nhắn Zalo cho Home247; Home247 làm trong 30 ngày, trừ phần bên kia cần giữ để đối soát đặt phòng đã có.'] },
  { tieuDe: 'Quyền của bạn', doan: [
    'Bạn xem và sửa hồ sơ ở Cá nhân > "Thông tin cá nhân", xuất đặt phòng ra file ở "Xuất file Excel (CSV)" nếu là chủ nhà, và xóa tài khoản bất cứ lúc nào.',
    'App không xin quyền vị trí, danh bạ hay thông báo đẩy. Ảnh chỉ đọc khi bạn tự chọn ảnh để tải lên.'] },
];

export function TrangPhapLy(props: { loai: 'dieu-khoan' | 'chinh-sach'; onQuayLai: () => void }) {
  const dk = props.loai === 'dieu-khoan';
  const tieuDe = dk ? 'Điều khoản sử dụng' : 'Chính sách quyền riêng tư';
  return (
    <div className="man p2 phap-ly" data-man={dk ? 'dieu-khoan' : 'chinh-sach'}>
      <header className="p2-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p2-tieu-de">{tieuDe}</h1>
      </header>
      <div className="p2-than">
        <p className="phap-ly-ngay">Cập nhật {NGAY_CAP_NHAT}</p>
        {(dk ? DIEU_KHOAN : CHINH_SACH).map((m) => (
          <section key={m.tieuDe} className="phap-ly-muc">
            <h2>{m.tieuDe}</h2>
            {m.doan.map((d) => <p key={d}>{d}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
