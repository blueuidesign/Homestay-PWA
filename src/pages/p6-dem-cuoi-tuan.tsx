import React, { useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { getCan, getGiaCan, getToi, homNay, patchToi } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { boNhoHoSo } from "../stores/ho-so";
import { boNhoLich } from "../stores/lich";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungP6, type MauTuan } from "./p6-man";

// P6 · Ngày tính giá cuối tuần (mục "Ngày tính giá cuối tuần" (US11)): tải GET /toi, tuần mẫu từ GET /can/:id/gia, lưu PATCH /toi.
// Chữ chọn dở nằm trong trạng thái của màn nên rời app rồi quay lại vẫn còn (HV3 bước 2); thoát không lưu thì bỏ (mục "Ngày tính giá cuối tuần" (US11) quay lại từ nền).
export const chuToastLuuDem = "Đã lưu ngày tính giá cuối tuần"; // chữ tạm: "Kết quả chưa vẽ" (mục "Ngày tính giá cuối tuần" (US11) bước 4)

const khoaMoi = () => `dem-cuoi-tuan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const P6DemCuoiTuan = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const [dem, setDem] = useState<number[] | null>(null);
  const [mau, setMau] = useState<MauTuan | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const khoa = useRef(khoaMoi());

  const tai = async () => {
    try {
      const h = await getToi();
      boNhoHoSo.ghi(h);
      setDem(h.dem_cuoi_tuan ?? [5, 6]);
      setLoiTai(null);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
      return;
    }
    // Tuần mẫu: ưu tiên phòng 1509 (canvas P6), không có thì căn đầu tiên đã có giá
    try {
      const ds = await getCan();
      const c = ds.find((x) => x.ma_can === "1509" && !x.chua_dat_gia) ?? ds.find((x) => !x.chua_dat_gia);
      if (!c) return setMau(null);
      const nam = Number(homNay().slice(0, 4));
      const bang = await getGiaCan(c.id, { nam });
      const thangNay = homNay().slice(0, 7);
      const t = bang.thang.find((x) => x.thang === thangNay && x.gia_ngay_thuong !== null) ?? bang.thang.find((x) => x.gia_ngay_thuong !== null);
      setMau(t ? { ma_can: c.ma_can, thuong: t.gia_ngay_thuong!, cuoi_tuan: t.gia_cuoi_tuan! } : null);
    } catch {
      setMau(null); // không có tuần mẫu thì vẫn chọn và lưu được
    }
  };
  useEffect(() => {
    tai();
  }, []);

  const chon = (thu: number) => {
    setDem((d) => (d ?? []).includes(thu) ? (d ?? []).filter((x) => x !== thu) : [...(d ?? []), thu].sort((a, b) => a - b));
    khoa.current = khoaMoi();
    setLoiChung(null);
  };

  const luu = async () => {
    if (!dem || dem.length === 0 || dangLuu) return;
    setDangLuu(true);
    setLoiChung(null);
    try {
      const h = await patchToi({ dem_cuoi_tuan: dem }, khoa.current);
      boNhoHoSo.ghi(h);
      // Giá từng đêm và tên ô giá đổi theo: bỏ bảng giá và lịch đã xem
      boNhoGia.boMoiBang();
      boNhoLich.xoa();
      toast(chuToastLuuDem);
      dieuHuong(DUONG.CA_NHAN, { replace: true });
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      setLoiChung(e instanceof LoiMang || !(e instanceof LoiApi) ? "Chưa lưu được, bấm lại khi có mạng" : "Có lỗi, chưa làm được. Bấm lại");
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Ngày tính giá cuối tuần" coLui />
      {matMang && dem && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Thông tin có thể chưa mới nhất.
        </div>
      )}
      {dem ? (
        <NoiDungP6 dem={dem} mau={mau} dangLuu={dangLuu} loiChung={loiChung} onChon={chon} onLuu={luu} />
      ) : (
        <div className="noi-dung">{loiTai ? <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={tai} /> : <KhungDangTai />}</div>
      )}
    </Page>
  );
};
