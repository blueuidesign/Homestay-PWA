// Lớp giao diện nền của bản PWA. Thay cho zmp-ui của bản Zalo: cùng tên thành phần, làm bằng thẻ HTML thường và react-router.
// Các màn chuyển từ bản Zalo chỉ dùng mấy thành phần dưới đây (khung trang và điều hướng). Nút, chữ, ô nhập là thẻ HTML thường với lớp CSS
// của app ở styles/nen.css, styles/khung.css; phần nền trình duyệt ở styles/pwa.css.
import React from "react";
import { BrowserRouter, Route as RRoute, Routes, useLocation as useRRLocation, useNavigate as useRRNavigate } from "react-router-dom";

type CoCon = { children?: React.ReactNode };
type ThuocTinhDiv = React.HTMLAttributes<HTMLDivElement>;

export const App = ({ children }: CoCon) => <div className="pwa-app">{children}</div>;
export const ZMPRouter = ({ children }: CoCon) => <BrowserRouter>{children}</BrowserRouter>;
export const AnimationRoutes = ({ children }: CoCon) => <Routes>{children}</Routes>;
export const Route = RRoute;

export const Page = React.forwardRef<HTMLDivElement, ThuocTinhDiv>(({ className, ...con }, ref) => (
  <div ref={ref} className={`zaui-page ${className ?? ""}`.trim()} {...con} />
));
Page.displayName = "Page";

// zmp-ui cho điều hướng có thêm tùy chọn hiệu ứng (animate, direction). Bản PWA bỏ qua các tùy chọn đó.
type TuyChon = { replace?: boolean; state?: unknown; animate?: boolean; direction?: string } & Record<string, unknown>;
export const useNavigate = () => {
  const di = useRRNavigate();
  return React.useCallback(
    (dich: string | number, tuy?: TuyChon) => {
      if (typeof dich === "number") di(dich);
      else di(dich, { replace: tuy?.replace, state: tuy?.state });
    },
    [di],
  );
};
export const useLocation = useRRLocation;
