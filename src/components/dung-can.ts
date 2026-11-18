import { useEffect, useState } from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import { getCan } from "../services/api";
import { LoiApi, type Can } from "../services/kieu";
import { DUONG } from "./duong-dan";

// Tải GET /can cho tab Lịch và tab Căn. Chưa đăng nhập thì về A1 (server.md 1.5).
export const useDanhSachCan = () => {
  const dieuHuong = useNavigate();
  const [dsCan, setDsCan] = useState<Can[] | null>(null);
  const [loiMang, setLoiMang] = useState(false);

  useEffect(() => {
    let conDung = true;
    getCan()
      .then((ds) => conDung && setDsCan(ds))
      .catch((e) => {
        if (!conDung) return;
        if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
        else setLoiMang(true);
      });
    return () => {
      conDung = false;
    };
  }, []);

  return { dsCan, loiMang };
};
