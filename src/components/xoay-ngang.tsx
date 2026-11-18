import React, { useEffect, useReducer, useRef } from "react";
import { createPortal } from "react-dom";

// Nút "Xoay ngang" của S1 (YC5.1 bước 7, S1-05): xoay giả theo SK9. Zalo không xoay thật được,
// nên app quay cả khung 90 độ và người dùng tự nghiêng máy theo. App không tự xoay khi nghiêng máy (YC5.1-NT5).

export type SuKienXoay = "bam-xoay-ngang" | "bam-xoay-doc" | "doi-huong-may" | "doi-kich-thuoc";

// Chỉ hai nút bấm đổi được hướng. Mọi sự kiện đổi hướng máy hay đổi cỡ màn giữ nguyên trạng thái.
export const suKienXoay = (dangNgang: boolean, sk: SuKienXoay): boolean =>
  sk === "bam-xoay-ngang" ? true : sk === "bam-xoay-doc" ? false : dangNgang;

export const useXoayNgang = () => {
  const [dangNgang, gui] = useReducer(suKienXoay, false);
  return { dangNgang, gui };
};

// R, C: chiều rộng, cao của khung đang dọc (SK9). Máy đã tự nằm ngang thì không quay thêm, tránh quay hai lần.
export const kichThuocKhungXoay = (rong: number, cao: number): { canQuay: boolean; style: React.CSSProperties } => {
  const canQuay = cao >= rong;
  const chung: React.CSSProperties = { position: "fixed", left: 0, top: 0, zIndex: 9999 };
  return canQuay
    ? { canQuay, style: { ...chung, width: cao, height: rong, transformOrigin: "top left", transform: `translateX(${rong}px) rotate(90deg)` } }
    : { canQuay, style: { ...chung, width: rong, height: cao } };
};

const anThanhZalo = async (an: boolean) => {
  try {
    const { configAppView } = await import("../nen-tang/thiet-bi");
    await configAppView(
      an
        ? { actionBar: { hide: true }, statusBarType: "hidden", hideAndroidBottomNavigationBar: true, hideIOSSafeAreaBottom: true }
        : { actionBar: { hide: false }, statusBarType: "normal", hideAndroidBottomNavigationBar: false, hideIOSSafeAreaBottom: false },
    );
  } catch {
    // Ngoài Zalo không có thanh để ẩn
  }
};

// Khung quay. Gắn vào body bằng portal vì hiệu ứng chuyển trang có transform làm lệch khung fixed (SK9 điểm 1).
export const KhungXoayNgang = ({ children }: { children: React.ReactNode }) => {
  const [, veLai] = useReducer((n: number) => n + 1, 0);
  const vung = useRef<HTMLDivElement>(null);
  const { canQuay, style } = kichThuocKhungXoay(window.innerWidth, window.innerHeight);

  useEffect(() => {
    // Chỉ đo lại cho khung vừa màn, không đổi hướng
    window.addEventListener("resize", veLai);
    void anThanhZalo(true);
    return () => {
      window.removeEventListener("resize", veLai);
      void anThanhZalo(false);
    };
  }, []);

  // Cuộn bằng JS trên vùng overflow hidden, đổi trục ngón tay sang trục của bảng đã quay (SK9 điểm 2)
  useEffect(() => {
    const v = vung.current;
    if (!v) return;
    let x = 0;
    let y = 0;
    const bat = (e: TouchEvent) => {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    };
    const keo = (e: TouchEvent) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - x;
      const dy = e.touches[0].clientY - y;
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
      if (canQuay) {
        v.scrollLeft -= dy;
        v.scrollTop += dx;
      } else {
        v.scrollLeft -= dx;
        v.scrollTop -= dy;
      }
    };
    v.addEventListener("touchstart", bat, { passive: true });
    v.addEventListener("touchmove", keo, { passive: false });
    return () => {
      v.removeEventListener("touchstart", bat);
      v.removeEventListener("touchmove", keo);
    };
  }, [canQuay]);

  return createPortal(
    <div className="xoay-khung" style={style} data-xoay="ngang">
      <div ref={vung} className="xoay-vung">
        {children}
      </div>
    </div>,
    document.body,
  );
};
