import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { getThongBao, getToi } from "../services/api";
import type { HoSo } from "../services/kieu";
import { BanThu } from "./ban-thu";
import { chuCacThuCuoiTuan } from "./can-hien-thi";
import { DauMan } from "./dau-man";
import { DUONG } from "./duong-dan";
import { chuMucCong } from "./muc-cong-hien-thi";
import { ThanhTab } from "./thanh-tab";

// Dòng "Ngày tính giá cuối tuần" (P1 của mục "Ngày tính giá cuối tuần" (US11)), tạm ở tab Cá nhân tới khi US21 làm P1. Ghi các thứ đang chọn, vd "T6, T7".
const DongDemCuoiTuan = ({ onCham }: { onCham: () => void }) => {
  const [dem, setDem] = useState<number[] | null>(null);
  useEffect(() => {
    let con = true;
    getToi()
      .then((h) => con && setDem(h.dem_cuoi_tuan ?? [5, 6]))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, []);
  return (
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ justifyContent: "space-between" }} onClick={onCham}>
      <span>Ngày tính giá cuối tuần</span>
      <span className="chu-phu" data-dem-cuoi-tuan>
        {dem ? chuCacThuCuoiTuan(dem) : ""}
      </span>
    </button>
  );
};

// Dòng "Mức cộng giá mặc định" (P1 của mục "Mức cộng giá mặc định" (US13)), tạm ở tab Cá nhân tới khi US21 làm P1. Chỉ sale có dòng này; ghi mức đang dùng, vd "+400k".
const DongMucCong = ({ onCham }: { onCham: () => void }) => {
  const [h, setH] = useState<HoSo | null>(null);
  useEffect(() => {
    let con = true;
    getToi()
      .then((x) => con && setH(x))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, []);
  if (!h || h.muc_cong_mac_dinh === undefined) return null;
  return (
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ justifyContent: "space-between" }} onClick={onCham}>
      <span>Mức cộng giá mặc định</span>
      <span className="chu-phu" data-muc-cong-mac-dinh>
        {chuMucCong(h.muc_cong_mac_dinh)}
      </span>
    </button>
  );
};

// Dòng "Mẫu tin gửi khách" (P1 của mục "Mẫu tin gửi khách" (US14)), tạm ở tab Cá nhân tới khi US21 làm P1. Chỉ sale có dòng này.
const DongMauTin = ({ onCham }: { onCham: () => void }) => {
  const [h, setH] = useState<HoSo | null>(null);
  useEffect(() => {
    let con = true;
    getToi()
      .then((x) => con && setH(x))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, []);
  if (!h || h.mau_tin_gui_khach === undefined) return null;
  return (
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ justifyContent: "space-between" }} onClick={onCham}>
      <span>Mẫu tin gửi khách</span>
    </button>
  );
};

// Dòng "Thông báo" (P1 của mục "Thông báo kết quả kết nối cho sale" (US17)), tạm ở tab Cá nhân tới khi US21 làm P1. Có số chưa đọc thì ghi bên phải; hết thì không còn số (US17-KB16).
const DongThongBao = ({ onCham }: { onCham: () => void }) => {
  const [chua, setChua] = useState(0);
  useEffect(() => {
    let con = true;
    getThongBao({ gioi_han: 1 })
      .then((kq) => con && setChua(kq.so_chua_doc))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, []);
  return (
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ justifyContent: "space-between" }} onClick={onCham}>
      <span>Thông báo</span>
      {chua > 0 && (
        <span className="chu-phu" data-so-chua-doc>
          {chua}
        </span>
      )}
    </button>
  );
};

// Dòng "Link xin xem lịch" (mục "Sale xin chủ nhà cho xem lịch" (US17)), tạm ở tab Cá nhân tới khi US21 làm P1. Chỉ sale có dòng này (tài khoản vai sale có muc_cong_mac_dinh).
const DongLinkXinLich = ({ onCham }: { onCham: () => void }) => {
  const [h, setH] = useState<HoSo | null>(null);
  useEffect(() => {
    let con = true;
    getToi()
      .then((x) => con && setH(x))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, []);
  if (!h || h.muc_cong_mac_dinh === undefined) return null;
  return (
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ justifyContent: "space-between" }} onClick={onCham}>
      <span>Link xin xem lịch</span>
    </button>
  );
};

// Màn tạm cho phần chưa làm. Ghi rõ US nào sẽ làm để người thử biết.
export const ManTam = ({
  ten,
  chu,
  tab,
  coLui,
  coBanThu,
  vaiSale,
  linkP2,
  linkP6,
  linkP10,
  linkP11,
  linkP13,
  linkA6,
}: {
  ten: string;
  chu: string;
  tab?: string;
  coLui?: boolean;
  coBanThu?: boolean;
  vaiSale?: boolean;
  linkP2?: boolean; // tạm tới khi US21 làm tab Cá nhân: lối vào P2 để xem số điện thoại (mục "Số điện thoại hiện trong hồ sơ" (US5))
  linkP6?: boolean; // tạm tới khi US21 làm P1: lối vào P6 Ngày tính giá cuối tuần (mục "Ngày tính giá cuối tuần" (US11))
  linkP11?: boolean; // tạm tới khi US21 làm P1: lối vào P11 Mẫu tin gửi khách (mục "Mẫu tin gửi khách" (US14)), chỉ hiện với sale
  linkP10?: boolean; // tạm tới khi US21 làm P1: lối vào P10 Mức cộng giá mặc định (mục "Mức cộng giá mặc định" (US13)), chỉ hiện với sale
  linkP13?: boolean; // tạm tới khi US21 làm P1: lối vào P13 Thông báo (mục "Thông báo kết quả kết nối cho sale" (US17))
  linkA6?: boolean; // tạm tới khi US21 làm P1: lối vào A6 "Link xin xem lịch" (mục "Sale xin chủ nhà cho xem lịch" (US17)), chỉ hiện với sale
}) => {
  const dieuHuong = useNavigate();
  return (
  <Page className="man">
    <DauMan ten={ten} coLui={coLui} />
    <div className="noi-dung">
      <div className="khoi">
        <span style={{ font: "var(--text-input)", color: "var(--ink-secondary)" }}>{chu}</span>
      </div>
      {linkP2 && (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => dieuHuong(DUONG.THONG_TIN_CA_NHAN)}>
          Thông tin cá nhân
        </button>
      )}
      {linkP6 && <DongDemCuoiTuan onCham={() => dieuHuong(DUONG.DEM_CUOI_TUAN)} />}
      {linkP10 && <DongMucCong onCham={() => dieuHuong(DUONG.MUC_CONG_MAC_DINH)} />}
      {linkP11 && <DongMauTin onCham={() => dieuHuong(DUONG.MAU_TIN)} />}
      {linkA6 && <DongLinkXinLich onCham={() => dieuHuong(DUONG.XIN_LICH)} />}
      {linkP13 && <DongThongBao onCham={() => dieuHuong(DUONG.THONG_BAO)} />}
      {coBanThu && <BanThu vaiSale={vaiSale} />}
    </div>
    {tab && <ThanhTab dangO={tab} />}
  </Page>
  );
};
