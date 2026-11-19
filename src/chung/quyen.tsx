// HV4 · Xin quyền trình duyệt; HV5 · Không còn quyền xem. Bản 1 không cần quyền nào.

/** HV4 bước 1 và 3: thẻ giải thích của app trước khi gọi hộp thoại của trình duyệt. */
export function TheXinQuyen(props: { giaiThich: string; daTuChoi?: boolean; onDongY: () => void; onDong: () => void }) {
  return (
    <div className="the-quyen" role="dialog">
      {props.daTuChoi ? (
        <p>{props.giaiThich} Quyền này đã bị từ chối. Bật lại trong cài đặt của trình duyệt.</p>
      ) : (
        <>
          <p>{props.giaiThich}</p>
          <button type="button" onClick={props.onDongY}>Tiếp tục</button>
        </>
      )}
      <button type="button" onClick={props.onDong}>Để sau</button>
    </div>
  );
}

/** HV4 bước 1 và 2: gọi xin quyền, từ chối không lỗi. */
export async function xinQuyen(goi: () => Promise<boolean>): Promise<boolean> {
  try { return await goi(); } catch { return false; }
}

/** HV5 bước 1, QT5.5: màn thay cho mục không còn quyền; không hiện dữ liệu của mục. */
export function KhongConQuyen({ lyDo, onVe }: { lyDo?: string; onVe: () => void }) {
  return (
    <div className="man-loi" role="alert">
      <p>Bạn không còn xem được mục này</p>
      {lyDo && <p>{lyDo}</p>}
      <button type="button" onClick={onVe}>Về Lịch</button>
    </div>
  );
}
