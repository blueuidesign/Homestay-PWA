import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DaiXanh } from "../components/dai-xanh";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { chuDaiA401 } from "../components/xin-lich-hien-thi";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { Icon } from "../components/icon";
import { ThanhTab } from "../components/thanh-tab";
import { getBookingSapToi, getLichNgay, getLichThang, getLichTomTat, homNay } from "../services/api";
import { LoiApi, LoiMang, type LichNgay, type LichThang, type SapToi, type TomTatThang, type DatPhongSapToi } from "../services/kieu";
import { thangCua } from "../services/ngay";
import { boNhoLich } from "../stores/lich";
import { NoiDungA4 } from "./a4-chu-nha-moi";
import { TheGuiLich } from "./cn10-man";
import { PhanDuoiLichThang } from "./cn1-tom-tat";
import { TheXemLichTuan } from "./cn2-lich-tuan";
import { KhoiYeuCauDangCho } from "./cn1-yeu-cau";
import { ChiTietNgay, ChuaTaiDuoc, KhungLichDangTai, LuoiLichThang } from "./cn1-lich-thang";

// Tab Lịch của chủ nhà. Chưa có căn: A4 (US1-NT7). Có căn: lịch tháng CN1, CN1-02, CN1-00 (mục "Lịch tháng và lọc theo căn" (US2))
// và chi tiết ngày CN3 ngay dưới lưới (mục "Chi tiết một ngày" (US2)). GET /lich/thang trả cả danh sách căn có lịch,
// nên một lời gọi đủ cho hàng chip và cho biết chủ nhà đã có căn chưa.
export const TabLich = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const matMang = useMatMang();
  const daXem = boNhoLich.dangXem();
  const [thang, setThang] = useState(daXem.thang ?? thangCua(homNay()));
  const [lich, setLich] = useState<LichThang | null>(() => boNhoLich.thang(thang) ?? null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [ngayChon, setNgayChon] = useState<string | null>(daXem.ngay);
  const [lichNgay, setLichNgay] = useState<LichNgay | null>(() => (daXem.ngay ? boNhoLich.ngay(daXem.ngay) ?? null : null));
  const [loiNgay, setLoiNgay] = useState(false);
  const [canChon, setCanChon] = useState<string | null>(null);
  const [tom, setTom] = useState<TomTatThang | null>(() => boNhoLich.tomTat(thang) ?? null);
  const [sapToi, setSapToi] = useState<SapToi | null>(() => boNhoLich.sapToi() ?? null);
  const [loiPhu, setLoiPhu] = useState<"mang" | "khac" | null>(null);
  const lanTom = useRef(0);
  const lanSapToi = useRef(0);
  const lanThang = useRef(0);
  const lanNgay = useRef(0);
  const dangXem = useRef({ thang, ngay: ngayChon });
  dangXem.current = { thang, ngay: ngayChon };

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") {
      dieuHuong(DUONG.A1, { replace: true, animate: false });
      return null;
    }
    return e instanceof LoiMang ? "mang" : "khac";
  };

  const taiThang = useCallback(async (t: string) => {
    const lan = ++lanThang.current;
    setDangTai(true);
    try {
      const kq = await getLichThang({ thang: t });
      if (lan !== lanThang.current) return;
      boNhoLich.ghiThang(kq);
      setLich(kq);
      setLoi(null);
    } catch (e) {
      if (lan === lanThang.current) setLoi(xuLyLoi(e));
    } finally {
      if (lan === lanThang.current) setDangTai(false);
    }
  }, []);

  // Doanh thu tháng (mục "Tóm tắt tháng" (US2)) và đặt phòng sắp tới (mục "Booking sắp tới" (US2)): hai lời gọi riêng, hỏng thì chỉ hai khối đó báo lỗi
  const taiTom = useCallback(async (t: string) => {
    const lan = ++lanTom.current;
    try {
      const kq = await getLichTomTat({ thang: t });
      if (lan !== lanTom.current) return;
      boNhoLich.ghiTomTat(kq);
      setTom(kq);
      setLoiPhu(null);
    } catch (e) {
      if (lan === lanTom.current) setLoiPhu(xuLyLoi(e));
    }
  }, []);

  const taiSapToi = useCallback(async () => {
    const lan = ++lanSapToi.current;
    try {
      const kq = await getBookingSapToi();
      if (lan !== lanSapToi.current) return;
      boNhoLich.ghiSapToi(kq);
      setSapToi(kq);
      setLoiPhu(null);
    } catch (e) {
      if (lan === lanSapToi.current) setLoiPhu(xuLyLoi(e));
    }
  }, []);

  const taiNgay = useCallback(async (n: string) => {
    const lan = ++lanNgay.current;
    try {
      const kq = await getLichNgay({ ngay: n });
      if (lan !== lanNgay.current) return;
      boNhoLich.ghiNgay(kq);
      setLichNgay(kq);
      setLoiNgay(false);
    } catch (e) {
      if (lan === lanNgay.current && xuLyLoi(e)) setLoiNgay(true);
    }
  }, []);

  useEffect(() => {
    boNhoLich.ghiDangXem({ thang, ngay: ngayChon });
  }, [thang, ngayChon]);

  useEffect(() => {
    setLich(boNhoLich.thang(thang) ?? null);
    setLoi(null);
    setTom(boNhoLich.tomTat(thang) ?? null);
    taiThang(thang);
    taiTom(thang);
  }, [thang]);

  useEffect(() => {
    taiSapToi();
  }, []);

  useEffect(() => {
    if (!ngayChon) return;
    setLichNgay(boNhoLich.ngay(ngayChon) ?? null);
    setLoiNgay(false);
    taiNgay(ngayChon);
  }, [ngayChon]);

  // Có mạng lại hoặc quay lại từ nền thì tải lại (HV2 bước 4, HV3 bước 2)
  const taiLai = useCallback(() => {
    taiThang(dangXem.current.thang);
    taiTom(dangXem.current.thang);
    taiSapToi();
    if (dangXem.current.ngay) taiNgay(dangXem.current.ngay);
  }, []);
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) taiLai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(taiLai);

  // Vừa ghi đặt phòng ở CN4: mở tháng và ngày nhận của đặt phòng đó, tải lại (mục "Chủ nhà ghi booking mới" (US3) bước 3)
  const vuaGhi = (viTri.state as { vuaGhi?: string } | null)?.vuaGhi;
  useEffect(() => {
    if (!vuaGhi) return;
    setThang(thangCua(vuaGhi));
    setNgayChon(vuaGhi);
    taiThang(thangCua(vuaGhi));
    taiTom(thangCua(vuaGhi));
    taiSapToi();
    taiNgay(vuaGhi);
  }, [viTri.key]);

  // Quay về từ CN3-02 hay CN4-02 sau khi sửa, xóa: giữ tháng và ngày đang xem, tải lại (US3, Tùng quyết 04/11/2026)
  const khoaDau = useRef(viTri.key);
  useEffect(() => {
    if (khoaDau.current === viTri.key) return;
    khoaDau.current = viTri.key;
    if (!vuaGhi) taiLai();
  }, [viTri.key]);

  // CN4: nút ở đầu lịch mở form trống; nút ở căn trống của chi tiết ngày điền sẵn căn và ngày (US3-NT10)
  const datPhong = () => dieuHuong(DUONG.DAT_PHONG);
  const datPhongTu = (can_id: string, ngay: string) => dieuHuong(DUONG.DAT_PHONG, { state: { can_id, ngay } });
  // Chạm một dòng sắp tới (mục "Booking sắp tới" (US2) bước 2) hay nút "Sửa" trên thẻ phòng (mục "Chi tiết booking và đánh dấu đã thu đủ" (US3)): chi tiết đặt phòng CN3-02 (US3)
  const moChiTiet = (id: string) => dieuHuong(DUONG.CHI_TIET_DAT_PHONG, { state: { id } });
  const chamDong = (dp: DatPhongSapToi) => moChiTiet(dp.id);
  const coCan = !!lich && lich.can.length > 0;
  const nutDatPhong = coCan ? (
    <button type="button" className="hh-btn hh-btn--primary hh-btn--pill" onClick={datPhong}>
      <Icon ten="cong" co={16} />
      Đặt phòng
    </button>
  ) : undefined;

  let noiDung: React.ReactNode;
  if (!lich) {
    noiDung = loi ? (
      <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => taiThang(thang)} />
    ) : (
      <KhungLichDangTai />
    );
  } else if (!coCan) {
    // A4-01: chủ nhà mới vừa đồng ý cho sale xem lịch ở A8, dải xanh trên A4 (state { vuaChoXem: tên sale }, US17)
    const vuaChoXem = (viTri.state as { vuaChoXem?: string } | null)?.vuaChoXem;
    noiDung = (
      <>
        {vuaChoXem && <DaiXanh chu={chuDaiA401(vuaChoXem)} />}
        <NoiDungA4 onThemCan={() => dieuHuong(DUONG.THEM_CAN)} />
      </>
    );
  } else {
    noiDung = (
      <>
        <KhoiYeuCauDangCho khoa={viTri.key} />
        <LuoiLichThang
          lich={lich}
          homNay={homNay()}
          ngayChon={ngayChon}
          canChon={canChon}
          onChonNgay={setNgayChon}
          onDoiThang={(t) => {
            setThang(t);
            setNgayChon(null);
          }}
          onChonCan={setCanChon}
        />
        <div className="lich-duoi">
          <TheGuiLich onBam={() => dieuHuong(DUONG.GUI_LICH)} />
          {ngayChon && (
            <ChiTietNgay
              ngay={ngayChon}
              lich={lichNgay?.ngay === ngayChon ? lichNgay : null}
              canTheoThuTu={lich.can}
              loi={loiNgay}
              onThuLai={() => taiNgay(ngayChon)}
              onDatPhong={datPhongTu}
              onSua={moChiTiet}
            />
          )}
          <TheXemLichTuan onBam={() => dieuHuong(DUONG.LICH_TUAN)} />
          <PhanDuoiLichThang
            coDatPhong={lich.co_dat_phong_nao}
            tom={tom}
            sapToi={sapToi}
            loi={loiPhu}
            matMang={matMang}
            onThuLai={() => {
              taiTom(thang);
              taiSapToi();
            }}
            onChamDong={chamDong}
            onDatPhong={datPhong}
          />
        </div>
      </>
    );
  }

  return (
    <Page className="man">
      <DauMan ten="Lịch" nut={nutDatPhong} />
      {matMang && lich ? (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Lịch có thể chưa mới nhất.
        </div>
      ) : (
        dangTai && lich && <div className="dang-cap-nhat">Đang cập nhật…</div>
      )}
      <div className={"noi-dung" + (lich && !coCan ? "" : " noi-dung--lich")}>{noiDung}</div>
      <ThanhTab dangO={DUONG.LICH} />
    </Page>
  );
};
