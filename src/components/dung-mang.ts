import { useEffect, useState } from "react";
import { events, EventName } from "../nen-tang/thiet-bi";

// Máy có mạng không (HV2). Trong Zalo nghe NetworkChanged; trên trình duyệt nghe online/offline.
export const useMatMang = () => {
  const [mat, setMat] = useState(() => typeof navigator !== "undefined" && navigator.onLine === false);
  useEffect(() => {
    const coMang = () => setMat(false);
    const hetMang = () => setMat(true);
    const doiMang = (d: { isConnected?: boolean }) => setMat(d?.isConnected === false);
    window.addEventListener("online", coMang);
    window.addEventListener("offline", hetMang);
    try {
      events.on(EventName.NetworkChanged, doiMang);
    } catch {
      // Ngoài Zalo không có sự kiện này
    }
    return () => {
      window.removeEventListener("online", coMang);
      window.removeEventListener("offline", hetMang);
      try {
        events.off(EventName.NetworkChanged, doiMang);
      } catch {
        // như trên
      }
    };
  }, []);
  return mat;
};

// Gọi lại khi app từ nền quay lại (HV3 bước 2): Zalo báo AppResumed, trình duyệt báo visibilitychange
export const useKhiQuayLai = (lam: () => void) => {
  useEffect(() => {
    const hien = () => document.visibilityState === "visible" && lam();
    document.addEventListener("visibilitychange", hien);
    try {
      events.on(EventName.AppResumed, lam);
    } catch {
      // Ngoài Zalo không có sự kiện này
    }
    return () => {
      document.removeEventListener("visibilitychange", hien);
      try {
        events.off(EventName.AppResumed, lam);
      } catch {
        // như trên
      }
    };
  }, [lam]);
};
