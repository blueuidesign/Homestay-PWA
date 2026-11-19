// HV8 · Toast: một chỗ, một kiểu cho mọi màn; tự tắt sau 3 giây.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/** HV8 bước 2: tự tắt sau 3 giây. */
export const THOI_GIAN_TOAST_MS = 3000;

type HienToast = (noiDung: string) => void;
const NguCanhToast = createContext<HienToast>(() => {});

export function useToast(): HienToast {
  return useContext(NguCanhToast);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [noiDung, datNoiDung] = useState<string | null>(null);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hien = useCallback((chu: string) => {
    if (hen.current) clearTimeout(hen.current);
    datNoiDung(chu);
    hen.current = setTimeout(() => datNoiDung(null), THOI_GIAN_TOAST_MS);
  }, []);

  useEffect(() => () => { if (hen.current) clearTimeout(hen.current); }, []);

  return (
    <NguCanhToast.Provider value={hien}>
      {children}
      {noiDung !== null && (
        <div className="toast" role="status" aria-live="polite" data-kieu="toast">
          <span aria-hidden="true">✓ </span>{noiDung}
        </div>
      )}
    </NguCanhToast.Provider>
  );
}
