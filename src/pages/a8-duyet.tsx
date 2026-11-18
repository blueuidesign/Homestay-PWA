import React, { useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { CHU_A8_TIEU_DE, CHU_DE_SAU_A8, chuToastDaChoXem } from "../components/xin-lich-hien-thi";
import { CHU_LOI_MANG, useXinSo } from "../components/xin-so";
import { LoiMang } from "../services/kieu";
import { dongYXinLich, type ManLink } from "../services/mo-link";
import { boNhoHoSo } from "../stores/ho-so";
import { NoiDungA8, NoiDungA801 } from "./a8-man";

// A8 · Chủ nhà mở link của sale (mục "Chủ nhà duyệt lời mời xem lịch" (US17)), A8-P1 và A8-P2 (popup xin tên và số của US5), A8-01 khi link không dùng được.
// Do ManMoLink (a10-them-lich.tsx) gọi khi link mở ra là link xin lịch. "Đồng ý": CN7-06 (toast, về tab Sale); chủ nhà mới chưa có căn:
// A4-01 (tab Lịch, dải xanh, "Thêm căn đầu tiên"). "Từ chối": về CN7, không gọi server ([MỞ: CH-010]).
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const A8DuyetXinLich = ({ ma, man }: { ma: string; man: Extract<ManLink, { man: "a8" | "a8_01" }> }) => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const [coc, setCoc] = useState(true); // QD20 điểm 6: cọc bật mặc định
  const [dangLam, setDangLam] = useState(false);
  const [mat, setMat] = useState(false); // link hết dùng giữa chừng: A8-01
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const dangLamRef = useRef(false);
  // Một khóa cho một lựa chọn: bấm lại sau lỗi mạng dùng lại khóa, đổi lựa chọn hay server đã trả lỗi thì khóa mới (HV1, server.md 1.6)
  const khoa = useRef(khoaMoi());
  const xin = useXinSo("sale", CHU_DE_SAU_A8);

  const veLich = () => {
    boNhoHoSo.xoaKetNoi();
    dieuHuong(DUONG.LICH, { replace: true, animate: false });
  };

  if (man.man === "a8_01" || mat) {
    return (
      <Page className="man">
        <DauMan ten={CHU_A8_TIEU_DE} />
        <NoiDungA801 onVeLich={veLich} />
      </Page>
    );
  }

  const viecDongY = async () => {
    if (dangLamRef.current) return;
    dangLamRef.current = true;
    setDangLam(true);
    setLoiViec(null);
    try {
      const kq = await dongYXinLich(ma, { coc, coTaiKhoan: man.coTaiKhoan }, khoa.current);
      if (kq.loai === "loi_link") return setMat(true);
      boNhoHoSo.xoaKetNoi(); // danh sách sale ở CN7 đã cũ
      if (kq.chuNhaMoi) {
        dieuHuong(DUONG.LICH, { replace: true, animate: false, state: { vuaChoXem: kq.ten ?? "sale" } }); // A4-01
      } else {
        toast(chuToastDaChoXem(kq.ten)); // CN7-06
        dieuHuong(DUONG.SALE, { replace: true, animate: false });
      }
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server đã xử lý xong: lần sau là lệnh mới
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa làm được. Bấm lại");
    } finally {
      dangLamRef.current = false;
      setDangLam(false);
    }
  };

  // "Từ chối": không gọi server, không ghi gì (mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 4). Chưa có tài khoản thì không có CN7 để về: về A1.
  const tuChoi = () => dieuHuong(man.coTaiKhoan ? DUONG.SALE : DUONG.A1, { replace: true, animate: false });

  return (
    <Page className="man">
      <DauMan ten={CHU_A8_TIEU_DE} />
      {matMang && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Bấm lại khi có mạng.
        </div>
      )}
      <NoiDungA8
        xin={man.xin}
        coTaiKhoan={man.coTaiKhoan}
        coc={coc}
        dangLam={dangLam}
        loi={loiViec}
        onDoiCoc={(v) => {
          khoa.current = khoaMoi();
          setCoc(v);
        }}
        onDongY={() => void xin.chay(viecDongY)}
        onTuChoi={tuChoi}
      />
      {xin.popup}
    </Page>
  );
};
