import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Toast chung theo HV8: một kiểu, một chỗ (ngay dưới đầu màn), tự tắt sau 3 giây.
// Không dùng showToast của Zalo (HV8 bước 3).
export const TOAST_TU_TAT_MS = 3000;

// Toast thường chỉ có chữ. Toast A9, A9-02 (US17) thêm dòng phụ và nút "Xem".
export type ToastMoi = { chu: string; phu?: string; nut?: { chu: string; onBam: () => void } };
type Toast = ToastMoi & { lan: number };
const NgucCanhToast = createContext<(t: string | ToastMoi) => void>(() => {});

export const useToast = () => useContext(NgucCanhToast);

export const HopToast = ({ chu, phu, nut, onDong }: ToastMoi & { onDong: () => void }) => (
  <div className="toast" role="status">
    <span className="toast__dau">✓</span>
    <div className="toast__chu">
      {chu}
      {phu && <div className="toast__phu">{phu}</div>}
    </div>
    {nut && (
      <button
        type="button"
        className="toast__nut"
        onClick={() => {
          nut.onBam();
          onDong();
        }}
      >
        {nut.chu}
      </button>
    )}
    <button type="button" className="toast__dong" aria-label="Đóng" onClick={onDong}>
      ✕
    </button>
  </div>
);

export const NoiToast = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const hen = useRef<ReturnType<typeof setTimeout>>();
  const hien = useCallback(
    (t: string | ToastMoi) => setToast((cu) => ({ ...(typeof t === "string" ? { chu: t } : t), lan: (cu?.lan ?? 0) + 1 })),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    clearTimeout(hen.current);
    hen.current = setTimeout(() => setToast(null), TOAST_TU_TAT_MS);
    return () => clearTimeout(hen.current);
  }, [toast]);

  return (
    <NgucCanhToast.Provider value={hien}>
      {children}
      {toast && <HopToast key={toast.lan} chu={toast.chu} phu={toast.phu} nut={toast.nut} onDong={() => setToast(null)} />}
    </NgucCanhToast.Provider>
  );
};
