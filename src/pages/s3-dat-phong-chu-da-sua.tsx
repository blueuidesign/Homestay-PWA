import React, { useCallback, useEffect, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { getBookingSale, getThongBaoChuSua, homNay } from "../services/api";
import { LoiApi, LoiMang, type DatPhongSale, type ThongBaoChuSua } from "../services/kieu";
import { zalo } from "../services/zalo";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS310 } from "./s3-man";

// S3-10 · Đặt phòng chủ nhà đã sửa: phần tải dữ liệu. Phần vẽ ở s3-man.tsx.

export const S3DatPhongChuDaSua = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const id = (useLocation().state as { id?: string } | null)?.id;
  const [bk, setBk] = useState<DatPhongSale | null>(null);
  const [tb, setTb] = useState<ThongBaoChuSua | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | "khong" | null>(null);

  const tai = useCallback(async () => {
    if (!id) return;
    try {
      const [b, t] = await Promise.all([getBookingSale(id), getThongBaoChuSua(id)]);
      setBk(b);
      setTb(t);
      setLoi(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi) setLoi("khong");
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [id]);

  useEffect(() => {
    if (!id) dieuHuong(DUONG.LICH_SALE, { replace: true, animate: false });
    else tai();
  }, []);
  useKhiQuayLai(tai);

  let noiDung: React.ReactNode;
  if (bk) {
    noiDung = (
      <NoiDungS310
        bk={bk}
        tb={tb}
        hom={homNay()}
        onGoi={() => bk.chu_nha.so_dien_thoai && void zalo.goiDien(bk.chu_nha.so_dien_thoai)}
        onVe={() => dieuHuong(DUONG.LICH_SALE, { replace: true })}
      />
    );
  } else if (loi === "khong") {
    noiDung = <KhongConXem onVe={() => dieuHuong(DUONG.LICH_SALE, { replace: true })} />;
  } else if (loi) {
    noiDung = <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={tai} />;
  } else {
    noiDung = (
      <div className="noi-dung" aria-busy="true">
        <KhungDangTai />
      </div>
    );
  }
  return (
    <Page className="man">
      <DauMan ten="Đặt phòng chủ nhà đã sửa" coLui />
      {matMang && bk && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Dữ liệu có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
    </Page>
  );
};
