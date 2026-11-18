import React, { useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { CHU_CHUA_LUU, chipDangChon, docSoTienMucCong } from "../components/muc-cong-hien-thi";
import { getToi, patchToi } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { chuTien } from "../services/ngay";
import { boNhoHoSo } from "../stores/ho-so";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungP10 } from "./p10-man";

// P10 · Mức cộng giá mặc định (mục "Mức cộng giá mặc định" (US13)): tải GET /toi, lưu PATCH /toi { muc_cong_mac_dinh, lam_tron_50k }.
// Chọn dở nằm trong trạng thái của màn: rời app rồi quay lại vẫn còn (HV3 bước 2); thoát không lưu thì bỏ. Không tự lưu lại khi có mạng (HV2 bước 4).
const khoaMoi = () => `muc-cong-mac-dinh-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const P10MucCong = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const cu = boNhoHoSo.lay();
  const coCu = cu?.muc_cong_mac_dinh !== undefined;
  const [muc, setMuc] = useState<number | null>(coCu ? cu!.muc_cong_mac_dinh! : null);
  const [lamTron, setLamTron] = useState(coCu ? !!cu!.lam_tron_50k : false);
  const [moTuyChon, setMoTuyChon] = useState(coCu ? chipDangChon(cu!.muc_cong_mac_dinh!) === "tuy_chon" : false);
  const [chuNhap, setChuNhap] = useState(coCu && chipDangChon(cu!.muc_cong_mac_dinh!) === "tuy_chon" ? chuTien(cu!.muc_cong_mac_dinh!) : "");
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [dangCapNhat, setDangCapNhat] = useState(false);
  const khoa = useRef(khoaMoi());
  const daSua = useRef(false);

  const tai = async () => {
    setDangCapNhat(true);
    try {
      const h = await getToi();
      boNhoHoSo.ghi(h);
      if (h.vai_chon !== "sale" || h.muc_cong_mac_dinh === undefined) return dieuHuong(DUONG.CA_NHAN, { replace: true, animate: false });
      if (!daSua.current) {
        setMuc(h.muc_cong_mac_dinh);
        setLamTron(!!h.lam_tron_50k);
        setMoTuyChon(chipDangChon(h.muc_cong_mac_dinh) === "tuy_chon");
        setChuNhap(chipDangChon(h.muc_cong_mac_dinh) === "tuy_chon" ? chuTien(h.muc_cong_mac_dinh) : "");
      }
      setLoiTai(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    } finally {
      setDangCapNhat(false);
    }
  };
  useEffect(() => {
    void tai();
  }, []);

  const sua = () => {
    daSua.current = true;
    khoa.current = khoaMoi();
    setLoiChung(null);
  };
  const chon = (n: number) => {
    sua();
    setMoTuyChon(false);
    setMuc(n);
  };
  const moTuy = () => {
    sua();
    setMoTuyChon(true);
    setChuNhap(muc !== null && chipDangChon(muc) === "tuy_chon" ? chuTien(muc) : "");
  };
  const nhap = (chu: string) => {
    sua();
    setChuNhap(chu);
    const n = docSoTienMucCong(chu);
    if (n !== null) setMuc(n);
  };

  const luu = async () => {
    if (muc === null || dangLuu) return;
    // Ô Tùy chọn còn sai chữ thì chưa lưu
    if (moTuyChon && docSoTienMucCong(chuNhap) === null) return setLoiChung("Nhập số tiền từ 0 đến 10.000.000đ");
    setDangLuu(true);
    setLoiChung(null);
    try {
      const h = await patchToi({ muc_cong_mac_dinh: muc, lam_tron_50k: lamTron }, khoa.current);
      boNhoHoSo.ghi(h);
      dieuHuong(DUONG.CA_NHAN, { replace: true });
    } catch (e) {
      setLoiChung(e instanceof LoiMang || !(e instanceof LoiApi) ? CHU_CHUA_LUU : "Có lỗi, chưa làm được. Bấm lại");
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Mức cộng giá mặc định" coLui />
      {matMang && muc !== null ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      ) : (
        dangCapNhat && muc !== null && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      {muc !== null ? (
        <NoiDungP10
          muc={muc}
          lamTron={lamTron}
          moTuyChon={moTuyChon}
          chuNhap={chuNhap}
          dangLuu={dangLuu}
          loiChung={loiChung}
          onChonMuc={chon}
          onMoTuyChon={moTuy}
          onNhap={nhap}
          onLamTron={(b) => {
            sua();
            setLamTron(b);
          }}
          onLuu={() => void luu()}
        />
      ) : (
        <div className="noi-dung">{loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />}</div>
      )}
    </Page>
  );
};
