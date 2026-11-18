import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import {
  CHU_BO_NGUON,
  CHU_GOI,
  CHU_LOI_BO_DONG,
  chuCaiDau,
  chuChoXem,
  chuKetNoiTu,
  chuLoiNhacBoNguon,
  chuToastBoNguon,
  chuXacNhanBoNguon,
  dongPhuCanSale,
  tenCanSale,
} from "../components/can-sale-hien-thi";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { deleteKetNoi, getNguonPhongChiTiet } from "../services/api";
import { LoiApi, LoiMang, type ChiTietNguonPhong } from "../services/kieu";
import { zalo } from "../services/zalo";
import { boNhoLichSale } from "../stores/lich";
import { boNhoTabCan } from "../stores/can-sale";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem } from "./cn3-man";
import { NoiDungS6ChuNha } from "./s6-chu-nha-man";

// S6-04 · Chi tiết chủ nhà (YC6.2). Mở từ tên chủ nhà ở S6, state { id } (id dòng ket_noi).
// Quy tắc QD20: "Phòng trống hay đã đặt" và "Giá từng đêm" luôn có; "Đã cọc hay chưa" chỉ khi chủ nhà bật. Giá căn ("1.800.000đ/đêm"),
// "BẠN ĐÃ BÁN", "TIỀN CHÊNH" còn [MỞ: YC6-H4, YC6-H5] và server chưa gửi: màn không hiện, không điền thay (YC6.2-NT1).
// "Bỏ nguồn phòng này" phải bấm hai lần (YC6.2-NT2): lần một chỉ hiện nút xác nhận, chưa gọi server.
const khoaMoi = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

export const ManChuNhaNguon = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const toast = useToast();
  const matMang = useMatMang();
  const id = (viTri.state as { id?: string } | null)?.id ?? "";
  const [ct, setCt] = useState<ChiTietNguonPhong | null>(() => (id ? boNhoTabCan.chuNha(id) ?? null : null));
  const [dangTai, setDangTai] = useState(false);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [khongQuyen, setKhongQuyen] = useState<string | null | false>(false);
  const [xacNhan, setXacNhan] = useState(false);
  const [dangBo, setDangBo] = useState(false);
  const [loiBo, setLoiBo] = useState<string | null>(null);
  const lan = useRef(0);
  const khoa = useRef(khoaMoi());
  const dangBoRef = useRef(false);

  const tai = useCallback(async () => {
    if (!id) return;
    const l = ++lan.current;
    setDangTai(true);
    try {
      const c = await getNguonPhongChiTiet(id);
      if (l !== lan.current) return;
      boNhoTabCan.ghiChuNha(c);
      setCt(c);
      setLoiTai(null);
      setKhongQuyen(false);
    } catch (e) {
      if (l !== lan.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi && (e.loi === "KHONG_CON_QUYEN" || e.loi === "KHONG_TIM_THAY")) {
        setCt(null);
        setKhongQuyen(e.ly_do || null); // HV5
      } else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      if (l === lan.current) setDangTai(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
      return;
    }
    void tai();
  }, [id]);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(useCallback(() => void tai(), [tai]));

  const xacNhanBo = async () => {
    if (dangBoRef.current || !ct) return;
    dangBoRef.current = true;
    setDangBo(true);
    setLoiBo(null);
    try {
      await deleteKetNoi(ct.id, khoa.current);
      boNhoTabCan.lamMoi();
      boNhoLichSale.lamMoi();
      toast(chuToastBoNguon(ct.ten_hien_thi ?? "chủ nhà"));
      dieuHuong(DUONG.CAN_SALE, { replace: true, animate: false });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      setLoiBo(e instanceof LoiMang ? CHU_LOI_BO_DONG : "Có lỗi, chưa bỏ được. Bấm lại");
    } finally {
      dangBoRef.current = false;
      setDangBo(false);
    }
  };

  if (!id) return null;
  let noiDung: React.ReactNode;
  if (khongQuyen !== false) {
    noiDung = <KhongConXem lyDo={khongQuyen || undefined} onVe={() => dieuHuong(DUONG.CAN_SALE, { replace: true })} />;
  } else if (!ct) {
    noiDung = loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />;
  } else {
    noiDung = (
      <NoiDungS6ChuNha
        ct={ct}
        xacNhan={xacNhan}
        dangBo={dangBo}
        loi={loiBo}
        onGoi={() => ct.so_dien_thoai && void zalo.goiDien(ct.so_dien_thoai)}
        onBo={() => setXacNhan(true)}
        onXacNhan={() => void xacNhanBo()}
        onKhongBo={() => {
          setXacNhan(false);
          setLoiBo(null);
        }}
      />
    );
  }
  return (
    <Page className="man">
      <DauMan ten={ct?.ten_hien_thi ?? "Chủ nhà"} coLui />
      {matMang && ct ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && ct && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className="noi-dung">{noiDung}</div>
    </Page>
  );
};
