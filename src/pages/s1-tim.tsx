import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { dieuKienTuForm, dieuKienTuMuc, formTimTrong, formTuDieuKien, type FormTim, type TrangThaiTim } from "../components/tim-phong-hien-thi";
import { getSaleTimGanDay, getToaNha } from "../services/api";
import { LoiApi, type MucTimGanDay, type ToaNha } from "../services/kieu";
import { boNhoTim } from "../stores/lich";
import { NoiDungTim } from "./s1-tim-man";

// S1-02, S1-03 · Tìm phòng trống theo ngày (mục "Tìm phòng trống theo ngày" (US12)). Mở từ ô "Tìm phòng trống theo ngày" ở tab Lịch của sale,
// hoặc từ "Sửa" ở kết quả (state { dk, ten_toa } điền sẵn điều kiện).
// Tìm gần đây và danh sách tòa lấy từ server; có bản đã xem thì hiện ngay, không để màn trống (HV1 bước 2).
export const ManTimPhong = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const matMang = useMatMang();
  const truoc = (viTri.state as TrangThaiTim | null | undefined) ?? null;
  const [form, setForm] = useState<FormTim>(() => (truoc ? formTuDieuKien(truoc.dk) : formTimTrong()));
  const [ganDay, setGanDay] = useState<MucTimGanDay[]>(() => boNhoTim.ganDay() ?? []);
  const [dangTai, setDangTai] = useState(true);
  const [toaNha, setToaNha] = useState<ToaNha[]>([]);
  const lan = useRef(0);

  const tai = useCallback(async () => {
    const l = ++lan.current;
    setDangTai(true);
    try {
      const [gd, toa] = await Promise.all([getSaleTimGanDay(), getToaNha()]);
      if (l !== lan.current) return;
      boNhoTim.ghiGanDay(gd.muc);
      setGanDay(gd.muc);
      setToaNha(toa);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      // Lỗi khác: màn vẫn dùng được, chỉ thiếu Tìm gần đây và chip tòa (HV2)
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, []);
  useEffect(() => {
    void tai();
  }, []);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), []));

  const tenToa = () => Object.fromEntries(toaNha.map((t) => [t.id, t.ten]));
  const sangKetQua = (st: TrangThaiTim) => dieuHuong(DUONG.KET_QUA_TIM, { state: st });

  return (
    <Page className="man">
      <DauMan ten="Tìm phòng trống" coLui />
      {matMang && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Danh sách có thể chưa mới nhất.
        </div>
      )}
      <div className="noi-dung">
        <NoiDungTim
          form={form}
          onDoi={(m) => setForm((f) => ({ ...f, ...m }))}
          ganDay={ganDay}
          dangTaiGanDay={dangTai}
          toaNha={toaNha}
          onChonGanDay={(m) => setForm(formTuDieuKien(dieuKienTuMuc(m).dk))}
          onTim={() => sangKetQua({ dk: dieuKienTuForm(form), ten_toa: tenToa() })}
        />
      </div>
    </Page>
  );
};
