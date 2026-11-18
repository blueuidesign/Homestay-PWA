import React from "react";
import { createRoot } from "react-dom/client";
import { AnimationRoutes, App, Route, ZMPRouter } from "./nen-tang/giao-dien";
import "./styles/pwa.css";
import "./styles/nen.css";
import "./styles/khung.css";
import { DUONG } from "./components/duong-dan";
import { ManTam } from "./components/man-tam";
import { NguoiNgheThongBao } from "./components/nguoi-nghe-thong-bao";
import { NoiToast } from "./components/toast";
import { ManMoLink } from "./pages/a10-them-lich";
import { A6XinLich } from "./pages/a6-xin-lich";
import { A7DaGui } from "./pages/a7-da-gui";
import { P13ThongBao } from "./pages/p13-thong-bao";
import { ManKetQuaTim } from "./pages/s2-ket-qua";
import { ManTimPhong } from "./pages/s1-tim";
import { TabLichSale } from "./pages/s1-lich-sale";
import { A1ChaoMung } from "./pages/a1-chao-mung";
import { A3ChonVai } from "./pages/a3-chon-vai";
import { CN4DatPhong } from "./pages/cn4-dat-phong";
import { CN3ChiTietDatPhong } from "./pages/cn3-chi-tiet-dat-phong";
import { CN4SuaDatPhong } from "./pages/cn4-sua-dat-phong";
import { S3DatPhongChuDaSua } from "./pages/s3-dat-phong-chu-da-sua";
import { CN6ChiTietCan } from "./pages/cn6-gia";
import { CN6GiaNgayLe } from "./pages/cn6-gia-le";
import { CN6ChonCan, CN6DatGiaNhieuCan } from "./pages/cn6-nhieu-can";
import { CN6SaoChepGia } from "./pages/cn6-sao-chep";
import { CN5A1ThemCan } from "./pages/cn5-a1-them-can";
import { TabCan } from "./pages/cn5-danh-sach-can";
import { CN7ChiTietSale } from "./pages/cn7-chi-tiet-sale";
import { TabSale } from "./pages/cn7-sale";
import { CN7ThemSale } from "./pages/cn7-them-sale";
import { P2ThongTinCaNhan } from "./pages/p2-thong-tin-ca-nhan";
import { P6DemCuoiTuan } from "./pages/p6-dem-cuoi-tuan";
import { CN10GuiLich } from "./pages/cn10-gui-lich";
import { CN2LichTuan } from "./pages/cn2-man";
import { TabLich } from "./pages/tab-lich";
import { TabThongKe } from "./pages/cn8-thong-ke";
import { ManChiTietCanSale } from "./pages/s3-can";
import { P10MucCong } from "./pages/p10-muc-cong";
import { P11MauTin } from "./pages/p11-mau-tin";
import { ManGuiKhach } from "./pages/s5-gui-khach";
import { ManYeuCauDatPhong } from "./pages/s3-yeu-cau";
import { ManKetQuaYeuCau } from "./pages/s3-ket-qua-yeu-cau";
import { CN9YeuCau } from "./pages/cn9-yeu-cau";
import { TabCanSale } from "./pages/s6-can-sale";
import { ManChuNhaNguon } from "./pages/s6-chu-nha";
import { ManCanCuaToi } from "./pages/s6-can-cua-toi";
import { ManThemCanTuNhap } from "./pages/s6-them-can-tu-nhap";
import { ManCanTuNhap } from "./pages/s6-can-tu-nhap";
import { ManGhiDatPhongTuNhap } from "./pages/s6-ghi-dat-phong";

const Home247 = () => (
  <App>
    <NoiToast>
      <ZMPRouter>
        <NguoiNgheThongBao />
        <AnimationRoutes>
          <Route path={DUONG.A1} element={<A1ChaoMung />} />
          <Route path={DUONG.A3} element={<A3ChonVai />} />
          <Route path={DUONG.LICH} element={<TabLich />} />
          <Route path={DUONG.LICH_TUAN} element={<CN2LichTuan />} />
          <Route path={DUONG.GUI_LICH} element={<CN10GuiLich />} />
          <Route path={DUONG.CAN} element={<TabCan />} />
          <Route path={DUONG.THEM_CAN} element={<CN5A1ThemCan />} />
          <Route path={DUONG.DAT_PHONG} element={<CN4DatPhong />} />
          <Route path={DUONG.CHI_TIET_DAT_PHONG} element={<CN3ChiTietDatPhong />} />
          <Route path={DUONG.SUA_DAT_PHONG} element={<CN4SuaDatPhong />} />
          <Route path={DUONG.DAT_PHONG_SALE} element={<S3DatPhongChuDaSua />} />
          <Route path={DUONG.CHI_TIET_CAN} element={<CN6ChiTietCan />} />
          <Route path={DUONG.GIA_CHON_CAN} element={<CN6ChonCan />} />
          <Route path={DUONG.GIA_NHIEU_CAN} element={<CN6DatGiaNhieuCan />} />
          <Route path={DUONG.GIA_LE} element={<CN6GiaNgayLe />} />
          <Route path={DUONG.SAO_CHEP_GIA} element={<CN6SaoChepGia />} />
          <Route
            path={DUONG.DIEU_KHOAN}
            element={<ManTam ten="Điều khoản" chu="Nội dung Điều khoản sẽ hiện ở đây." coLui />}
          />
          <Route
            path={DUONG.CHINH_SACH}
            element={<ManTam ten="Chính sách quyền riêng tư" chu="Nội dung Chính sách quyền riêng tư sẽ hiện ở đây." coLui />}
          />
          <Route path={DUONG.LICH_SALE} element={<TabLichSale />} />
          <Route path={DUONG.XIN_LICH} element={<A6XinLich />} />
          <Route path={DUONG.XIN_LICH_DA_GUI} element={<A7DaGui />} />
          <Route path={DUONG.THONG_BAO} element={<P13ThongBao />} />
          <Route path={DUONG.TIM_PHONG} element={<ManTimPhong />} />
          <Route path={DUONG.KET_QUA_TIM} element={<ManKetQuaTim />} />
          <Route path={DUONG.CAN_SALE_CHI_TIET} element={<ManChiTietCanSale />} />
          <Route path={DUONG.YEU_CAU_DAT_PHONG} element={<ManYeuCauDatPhong />} />
          <Route path={DUONG.YEU_CAU_SALE} element={<ManKetQuaYeuCau />} />
          <Route path={DUONG.YEU_CAU_CHU} element={<CN9YeuCau />} />
          <Route path={DUONG.GUI_KHACH} element={<ManGuiKhach />} />
          <Route path={DUONG.LINK} element={<ManMoLink />} />
          <Route path={DUONG.CAN_SALE} element={<TabCanSale />} />
          <Route path={DUONG.CHU_NHA_NGUON} element={<ManChuNhaNguon />} />
          <Route path={DUONG.CAN_CUA_TOI} element={<ManCanCuaToi />} />
          <Route path={DUONG.THEM_CAN_TU_NHAP} element={<ManThemCanTuNhap />} />
          <Route path={DUONG.CAN_TU_NHAP} element={<ManCanTuNhap />} />
          <Route path={DUONG.GHI_DAT_PHONG} element={<ManGhiDatPhongTuNhap />} />
          <Route path={DUONG.SALE} element={<TabSale />} />
          <Route path={DUONG.SALE_CHI_TIET} element={<CN7ChiTietSale />} />
          <Route path={DUONG.SALE_THEM} element={<CN7ThemSale />} />
          <Route path={DUONG.THONG_TIN_CA_NHAN} element={<P2ThongTinCaNhan />} />
          <Route path={DUONG.DEM_CUOI_TUAN} element={<P6DemCuoiTuan />} />
          <Route path={DUONG.MUC_CONG_MAC_DINH} element={<P10MucCong />} />
          <Route path={DUONG.MAU_TIN} element={<P11MauTin />} />
          <Route path={DUONG.THONG_KE} element={<TabThongKe />} />
          <Route
            path={DUONG.CA_NHAN}
            element={<ManTam ten="Cá nhân" chu="Cá nhân làm ở US21." tab={DUONG.CA_NHAN} coBanThu linkP2 linkP6 linkP10 linkP11 linkP13 linkA6 />}
          />
          <Route path={DUONG.BAN_THU} element={<ManTam ten="Bản thử" chu="Chọn dữ liệu để thử." coLui coBanThu />} />
        </AnimationRoutes>
      </ZMPRouter>
    </NoiToast>
  </App>
);

createRoot(document.getElementById("app")!).render(<Home247 />);
