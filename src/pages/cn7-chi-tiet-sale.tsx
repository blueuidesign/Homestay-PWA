import React, { useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { chuToastDaNgung } from "../components/sale-hien-thi";
import { useToast } from "../components/toast";
import { getKetNoiChiTiet, homNay, postKetNoiNgung } from "../services/api";
import { LoiApi, LoiMang, type ChiTietKetNoi } from "../services/kieu";
import { zalo } from "../services/zalo";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { HopXacNhanNgung, NoiDungCN704 } from "./cn7-man-chi-tiet";

// CN7-04 · Chi tiết một sale (mục "Chủ nhà quản lý danh sách sale" (US5) bước 5, 6; US5-NT13): tên, số, ngày kết nối, nút Gọi, đặt phòng của sale, ngừng cho xem lịch.
// Canvas có khối quyền? Không (CH-053), nên không có công tắc quyền. Số liệu trên canvas ("8", "14.2tr") chưa theo DLM, chờ Tùng:
// ở đây tính từ danh sách đặt phòng của sale có ngày nhận trong tháng này.

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN7ChiTietSale = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const id = (useLocation().state as { id?: string } | null)?.id;
  const [ct, setCt] = useState<ChiTietKetNoi | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [hoi, setHoi] = useState(false);
  const [dangLam, setDangLam] = useState(false);
  const [loiNgung, setLoiNgung] = useState<string | null>(null);
  const khoa = useRef(khoaMoi());

  const tai = async () => {
    if (!id) return;
    try {
      setCt(await getKetNoiChiTiet(id));
      setLoi(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi) dieuHuong(DUONG.SALE, { replace: true, animate: false }); // không còn mở được: về danh sách
      else setLoi(e instanceof LoiMang ? "mang" : "khac");
    }
  };
  useEffect(() => {
    if (!id) dieuHuong(DUONG.SALE, { replace: true, animate: false });
    else tai();
  }, []);
  useKhiQuayLai(tai);

  const ngung = async () => {
    if (!id || !ct || dangLam) return;
    setDangLam(true);
    setLoiNgung(null);
    try {
      await postKetNoiNgung(id, khoa.current);
      boNhoHoSo.xoaKetNoi();
      toast(chuToastDaNgung(ct.ten_hien_thi ?? "sale"));
      dieuHuong(DUONG.SALE, { replace: true, animate: false });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới (HV1)
      if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") {
        boNhoHoSo.xoaKetNoi();
        dieuHuong(DUONG.SALE, { replace: true, animate: false });
      } else {
        setLoiNgung(e instanceof LoiMang ? "Chưa lưu được, bấm lại khi có mạng" : "Có lỗi, chưa lưu được. Bấm lại");
      }
    } finally {
      setDangLam(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten={ct?.ten_hien_thi ?? "Chi tiết sale"} coLui />
      {matMang && ct && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      )}
      <div className="noi-dung">
        {ct ? (
          <NoiDungCN704
            ct={ct}
            hom={homNay()}
            onGoi={() => ct.so_dien_thoai && void zalo.goiDien(ct.so_dien_thoai)}
            onNgung={() => setHoi(true)}
          />
        ) : loi ? (
          <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={tai} />
        ) : (
          <KhungDangTai />
        )}
      </div>
      {hoi && ct && (
        <HopXacNhanNgung
          ten={ct.ten_hien_thi ?? "sale"}
          dangLam={dangLam}
          loi={loiNgung}
          onXacNhan={ngung}
          onHuy={() => {
            setHoi(false);
            setLoiNgung(null);
          }}
        />
      )}
    </Page>
  );
};
