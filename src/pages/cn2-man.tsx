import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { Icon } from "../components/icon";
import { ThanhTab } from "../components/thanh-tab";
import { getLichTuan, homNay } from "../services/api";
import { LoiApi, LoiMang, type CanLichTuan, type LichTuan } from "../services/kieu";
import { congNgay, thuHaiCuaTuan } from "../services/ngay";
import { boNhoLich } from "../stores/lich";
import { TheGuiLich } from "./cn10-man";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { cacChipLoc, KhungLichTuanDangTai, locTuanRaThamSo, NoiDungCN2, type LocTuan } from "./cn2-lich-tuan";

// CN2 · Lịch tuần (YC2.5). Tải GET /lich/tuan, giữ tuần đã xem để mở lại là hiện ngay (HV1) và mất mạng vẫn xem được (HV2).
export const CN2LichTuan = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const hom = homNay();
  const [tu, setTu] = useState(() => boNhoLich.tuanDangXem().tu ?? thuHaiCuaTuan(hom));
  const [loc, setLoc] = useState<LocTuan>("");
  const [lich, setLich] = useState<LichTuan | null>(() => boNhoLich.tuanChu(tu, "") ?? null);
  const [tatCa, setTatCa] = useState<CanLichTuan[]>(() => boNhoLich.tuanChu(tu, "")?.can ?? []);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const lan = useRef(0);
  const dangXem = useRef({ tu, loc });
  dangXem.current = { tu, loc };

  const tai = useCallback(async (t: string, l: LocTuan) => {
    const so = ++lan.current;
    setDangTai(true);
    try {
      const kq = await getLichTuan({ tu: t, ...locTuanRaThamSo(l) });
      if (so !== lan.current) return;
      boNhoLich.ghiTuanChu(kq, l);
      setLich(kq);
      if (l === "") setTatCa(kq.can);
      setLoi(null);
    } catch (e) {
      if (so !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (so === lan.current) setDangTai(false);
    }
  }, []);

  useEffect(() => {
    boNhoLich.ghiTuanDangXem({ tu, loc: "" });
    setLich(boNhoLich.tuanChu(tu, loc) ?? null);
    setLoi(null);
    void tai(tu, loc);
  }, [tu, loc]);

  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai(dangXem.current.tu, dangXem.current.loc);
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(dangXem.current.tu, dangXem.current.loc), []));

  const themDatPhong = () => dieuHuong(DUONG.DAT_PHONG);
  let noiDung: React.ReactNode;
  if (!lich) {
    noiDung = loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai(tu, loc)} /> : <KhungLichTuanDangTai />;
  } else {
    noiDung = (
      <>
        <NoiDungCN2
          lich={lich}
          hom={hom}
          chip={cacChipLoc(tatCa.length > 0 ? tatCa : lich.can)}
          loc={loc}
          onDoiTuan={(h) => setTu(congNgay(tu, 7 * h))}
          onLoc={setLoc}
          onThemDatPhong={themDatPhong}
        />
        <TheGuiLich onBam={() => dieuHuong(DUONG.GUI_LICH)} />
      </>
    );
  }

  return (
    <Page className="man">
      <DauMan
        ten="Lịch tuần"
        coLui
        nut={
          <button type="button" className="hh-btn hh-btn--primary hh-btn--pill" onClick={themDatPhong}>
            <Icon ten="cong" co={16} />
            Đặt phòng
          </button>
        }
      />
      {matMang && lich ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && lich && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
      <ThanhTab dangO={DUONG.LICH} />
    </Page>
  );
};
