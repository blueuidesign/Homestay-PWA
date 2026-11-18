import React from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import { Icon } from "./icon";

// Đầu màn tự vẽ như canvas. Bên phải chừa chỗ cho cụm ··· ✕ của Zalo.
export const DauMan = ({ ten, phu, coLui, nut, mau }: { ten: string; phu?: string; coLui?: boolean; nut?: React.ReactNode; mau?: string }) => {
  const dieuHuong = useNavigate();
  return (
    <header className={"dau-man" + (coLui ? " dau-man--co-lui" : "")}>
      {coLui && (
        <button type="button" className="hh-iconbtn" aria-label="Quay lại" onClick={() => dieuHuong(-1)}>
          <Icon ten="mui-trai" co={16} />
        </button>
      )}
      {mau && <span style={{ width: 10, height: 10, borderRadius: "var(--radius-full)", background: mau, flex: "0 0 auto" }} />}
      <span className="dau-man__ten">{ten}</span>
      {phu && <span className="dau-man__phu">{phu}</span>}
      {nut}
    </header>
  );
};
