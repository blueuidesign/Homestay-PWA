import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { BUOC_SAU_XOA, quayVeNoiMo } from "../components/quay-ve";
import { useToast } from "../components/toast";
import { deleteBooking, getBooking, postBookingHoanTacThuDu, postBookingThuDu } from "../services/api";
import { LoiApi, LoiMang, type DatPhong } from "../services/kieu";
import { zalo } from "../services/zalo";
import { boNhoLich } from "../stores/lich";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { KhongConXem, loiKhiGhi, NoiDungCN3, tieuDeCN3, type ViecDangLam } from "./cn3-man";

// CN3-02 · Chi tiết đặt phòng (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10), mục "Xóa booking" (US10)): phần tải dữ liệu và gọi server. Phần vẽ ở cn3-man.tsx.

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN3ChiTietDatPhong = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const id = (useLocation().state as { id?: string } | null)?.id;
  const [dp, setDp] = useState<DatPhong | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | "khong" | null>(null);
  const [dangLam, setDangLam] = useState<ViecDangLam>(null);
  const [hoiXoa, setHoiXoa] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const dangLamRef = useRef(false);
  // Một khóa cho một lần bấm (server.md 1.6): bấm lại sau lỗi mạng dùng lại khóa, xong thì đổi khóa
  const khoa = useRef({ thu_du: khoaMoi(), hoan_tac: khoaMoi(), xoa: khoaMoi() });

  const tai = useCallback(async () => {
    if (!id) return;
    try {
      setDp(await getBooking(id));
      setLoiTai(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else if (e instanceof LoiApi) setLoiTai("khong");
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [id]);

  useEffect(() => {
    if (!id) dieuHuong(DUONG.LICH, { replace: true, animate: false });
    else tai();
  }, []);
  useKhiQuayLai(tai);

  const lam = async (viec: Exclude<ViecDangLam, null>, chay: () => Promise<void>) => {
    if (dangLamRef.current) return;
    dangLamRef.current = true;
    setDangLam(viec);
    setLoi(null);
    try {
      await chay();
      khoa.current[viec] = khoaMoi();
    } catch (e) {
      setLoi(loiKhiGhi(e));
      if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") {
        khoa.current[viec] = khoaMoi();
        tai();
      }
    } finally {
      dangLamRef.current = false;
      setDangLam(null);
    }
  };

  const thuDu = () => id && lam("thu_du", async () => setDp(await postBookingThuDu(id, khoa.current.thu_du)));
  const hoanTac = () => id && lam("hoan_tac", async () => setDp(await postBookingHoanTacThuDu(id, khoa.current.hoan_tac)));
  const xacNhanXoa = () =>
    id &&
    dp &&
    lam("xoa", async () => {
      await deleteBooking(id, khoa.current.xoa);
      boNhoLich.lamMoi();
      toast("Đã xóa đặt phòng");
      // Về đúng màn đã mở CN3-02 (US10, Tùng quyết 04/11/2026)
      quayVeNoiMo(dieuHuong, BUOC_SAU_XOA);
    });

  let noiDung: React.ReactNode;
  if (dp) {
    noiDung = (
      <NoiDungCN3
        dp={dp}
        dangLam={dangLam}
        hoiXoa={hoiXoa}
        loi={loi}
        onThuDu={thuDu}
        onHoanTac={hoanTac}
        onSua={() => dieuHuong(DUONG.SUA_DAT_PHONG, { state: { id } })}
        onXoa={() => {
          setLoi(null);
          setHoiXoa(true);
        }}
        onXacNhanXoa={xacNhanXoa}
        onHuyXoa={() => {
          setHoiXoa(false);
          setLoi(null);
        }}
        onGoi={() => dp.nguoi_dat.so_dien_thoai && void zalo.goiDien(dp.nguoi_dat.so_dien_thoai)}
      />
    );
  } else if (loiTai === "khong") {
    noiDung = <KhongConXem onVe={() => dieuHuong(DUONG.LICH, { replace: true })} />;
  } else if (loiTai) {
    noiDung = <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={tai} />;
  } else {
    noiDung = (
      <div className="noi-dung" aria-busy="true">
        <KhungDangTai />
      </div>
    );
  }

  return (
    <Page className="man">
      <DauMan ten={dp ? tieuDeCN3(dp) : "Đặt phòng"} coLui />
      {matMang && dp && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Dữ liệu có thể chưa mới nhất.
        </div>
      )}
      {noiDung}
    </Page>
  );
};
