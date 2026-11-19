// HV1 · Đang tải: khung xám, dòng "Đang cập nhật…", nút ghi không bấm lại được.
import { useRef, useState, type ReactNode } from 'react';

/** HV1-H1 (giả định): chờ quá bao lâu thì coi là lỗi, sang HV2 bước 5. Chờ Tùng chốt. */
export const THOI_GIAN_CHO_LOI_MS = 15000;

export function KhungXam({ soDong = 3 }: { soDong?: number }) {
  return (
    <div className="khung-xam" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: soDong }, (_, i) => <div key={i} className="khung-xam-dong" />)}
    </div>
  );
}

export function DongDangCapNhat() {
  return <p className="dong-cap-nhat" role="status">Đang cập nhật…</p>;
}

/** HV1 bước 3: đổi chữ khi đang ghi, khóa bấm lại (HV1-NT1: chỉ một lần gọi). */
export function NutGhi(props: {
  chu: string;
  chuDangGhi?: string;
  onGhi: () => Promise<unknown> | unknown;
  disabled?: boolean;
}) {
  const [dangGhi, datDangGhi] = useState(false);
  const khoa = useRef(false); // chặn ngay cả khi bấm hai lần trước lần vẽ lại
  const bam = async () => {
    if (khoa.current) return;
    khoa.current = true;
    datDangGhi(true);
    try {
      await props.onGhi();
    } finally {
      khoa.current = false;
      datDangGhi(false);
    }
  };
  return (
    <button type="button" className="nut-ghi" disabled={dangGhi || props.disabled} onClick={bam}>
      {dangGhi ? (props.chuDangGhi ?? 'Đang lưu…') : props.chu}
    </button>
  );
}

/** HV1 bước 1 và 2: chưa có dữ liệu thì khung xám; có dữ liệu cũ thì hiện ngay kèm dòng cập nhật. */
export function ManTai<T>(props: { duLieu: T | undefined; dangTai: boolean; hien: (d: T) => ReactNode }) {
  if (props.duLieu === undefined) return props.dangTai ? <KhungXam /> : null;
  return (
    <>
      {props.dangTai && <DongDangCapNhat />}
      {props.hien(props.duLieu)}
    </>
  );
}
