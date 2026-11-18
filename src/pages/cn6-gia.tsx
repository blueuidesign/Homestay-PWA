import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { layVai } from "../stores/vai";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { chonThang } from "../components/gia-hien-thi";
import { useToast } from "../components/toast";
import { getGiaCan, homNay, putGiaThang } from "../services/api";
import { LoiApi, LoiMang, type BangGia } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { mauCuaCan } from "./cn1-lich-thang";
import { docTien } from "./cn4-dat-phong";
import { TabThongTinCan } from "./cn5-02-sua-can";
import { BangChonNam, chuToastApDung, loiKhiApDung, NoiDungGia } from "./cn6-gia-man";

// CN5-02 · Chi tiết căn với tab Giá (CN6, CN6-00, CN6-04, CN6-09): tải GET /can/:id/gia, lưu PUT /can/:id/gia-thang.
// Phần vẽ ở cn6-gia-man.tsx.

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

const thangMacDinh = (nam: number) => {
  const hn = homNay();
  return hn.slice(0, 4) === String(nam) ? hn.slice(0, 7) : `${nam}-01`;
};

export const CN6ChiTietCan = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const viTri = useLocation();
  const moTu = (viTri.state as { can_id?: string; ma_can?: string; tab?: "thong_tin" | "gia"; thu_tu?: number } | null) ?? {};
  const canId = moTu.can_id ?? "";
  const namNay = Number(homNay().slice(0, 4));
  const nhap = boNhoGia.nhap(canId);

  const [tab, setTab] = useState<"thong_tin" | "gia">(() => (boNhoGia.layQuayVeTabGia(canId) ? "gia" : moTu.tab ?? "thong_tin"));
  const [nam, setNam] = useState(nhap.nam ?? namNay);
  const [thangLich, setThangLich] = useState(nhap.thangLich ?? thangMacDinh(nhap.nam ?? namNay));
  const [thangChon, setThangChon] = useState(nhap.thangChon);
  const [giaThuong, setGiaThuong] = useState(nhap.giaThuong);
  const [giaCuoiTuan, setGiaCuoiTuan] = useState(nhap.giaCuoiTuan);
  const [bang, setBang] = useState<BangGia | null>(() => boNhoGia.bang(canId, nhap.nam ?? namNay, nhap.thangLich ?? thangMacDinh(nhap.nam ?? namNay)) ?? null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const [moNam, setMoNam] = useState(false);
  const [daMoThongTin, setDaMoThongTin] = useState(tab === "thong_tin");
  useEffect(() => {
    if (tab === "thong_tin") setDaMoThongTin(true);
  }, [tab]);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [baoChuaChon, setBaoChuaChon] = useState(false);
  const dangLuuRef = useRef(false);
  const lanTai = useRef(0);
  // Một khóa cho một nội dung (server.md 1.6): gửi lại cùng nội dung sau lỗi mạng dùng lại khóa (HV2)
  const khoa = useRef(khoaMoi());
  const dangXem = useRef({ nam, thangLich });
  dangXem.current = { nam, thangLich };

  // HV3: tháng đã chọn, giá đã nhập, năm và tháng đang xem còn nguyên khi rời tab hay rời app rồi quay lại
  useEffect(() => {
    if (canId) boNhoGia.ghiNhap(canId, { nam, thangChon, giaThuong, giaCuoiTuan, thangLich });
  }, [canId, nam, thangChon, giaThuong, giaCuoiTuan, thangLich]);

  const tai = useCallback(async () => {
    if (!canId) return;
    const { nam: n, thangLich: t } = dangXem.current;
    const lan = ++lanTai.current;
    try {
      const kq = await getGiaCan(canId, { nam: n, thang: t });
      if (lan !== lanTai.current) return;
      boNhoGia.ghiBang(kq, t);
      setBang(kq);
      setLoiTai(null);
    } catch (e) {
      if (lan !== lanTai.current) return;
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  }, [canId]);

  useEffect(() => {
    if (tab !== "gia") return;
    const dem = boNhoGia.bang(canId, nam, thangLich);
    if (dem) setBang(dem);
    setLoiTai(null);
    tai();
  }, [tab, nam, thangLich]);

  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang && tab === "gia") tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(() => tab === "gia" && tai());

  const doiForm = () => {
    khoa.current = khoaMoi();
    setLoiChung(null);
  };
  const chonThangNao = (so: number) => {
    setThangChon((c) => chonThang(c, so));
    setBaoChuaChon(false);
    doiForm();
  };
  const doiGia = (o: "thuong" | "cuoi_tuan", chu: string) => {
    const tien = docTien(chu);
    const gia = tien === null ? "" : String(tien);
    if (o === "thuong") setGiaThuong(gia);
    else setGiaCuoiTuan(gia);
    doiForm();
  };
  const doiNam = (n: number) => {
    setMoNam(false);
    if (n === nam) return;
    setNam(n);
    setThangLich(thangMacDinh(n));
    setThangChon([]);
    setBang(boNhoGia.bang(canId, n, thangMacDinh(n)) ?? null);
    doiForm();
  };

  const apDung = async () => {
    if (dangLuuRef.current) return;
    if (thangChon.length === 0) {
      setBaoChuaChon(true); // US4-NT4: không gửi, không lưu gì
      return;
    }
    const thuong = docTien(giaThuong);
    const cuoi = docTien(giaCuoiTuan);
    if (thuong === null || cuoi === null) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      await putGiaThang(
        canId,
        {
          thang: thangChon.map((so) => `${nam}-${String(so).padStart(2, "0")}`),
          gia_ngay_thuong: thuong,
          gia_cuoi_tuan: cuoi,
        },
        khoa.current,
      );
      toast(chuToastApDung(thangChon)); // CN6-04
      boNhoGia.boBangCuaCan(canId);
      setThangChon([]);
      setGiaThuong("");
      setGiaCuoiTuan("");
      khoa.current = khoaMoi();
      await tai();
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server: lần sau khóa khác (HV1); lỗi mạng giữ khóa (HV2)
      setLoiChung(loiKhiApDung(e));
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  const maCan = bang?.ma_can ?? moTu.ma_can ?? "";
  return (
    <Page className="man">
      <DauMan
        ten={`Sửa phòng ${maCan}`}
        coLui
        mau={moTu.thu_tu === undefined ? undefined : `var(--room-${mauCuaCan(moTu.thu_tu).slice(1)})`}
      />
      <div className="tab-hai" role="tablist">
        {(
          [
            ["thong_tin", "Thông tin"],
            ["gia", "Giá"],
          ] as const
        ).map(([ma, ten]) => (
          <button
            key={ma}
            type="button"
            role="tab"
            aria-selected={tab === ma}
            className={"tab-hai__nut" + (tab === ma ? " tab-hai__nut--on" : "")}
            onClick={() => setTab(ma)}
          >
            {ten}
          </button>
        ))}
      </div>
      {/* Tab Thông tin (US11, mục "Sửa thông tin căn" (US11)) vẫn gắn trong màn khi sang tab Giá, để chỗ đang sửa không mất (HV3) */}
      {daMoThongTin && canId && (
        <div hidden={tab !== "thong_tin"} style={tab !== "thong_tin" ? { display: "none" } : undefined}>
          <TabThongTinCan canId={canId} onXong={() => dieuHuong(layVai() === "sale" ? DUONG.CAN_SALE : DUONG.CAN, { replace: true })} />
        </div>
      )}
      <div className="noi-dung" style={tab === "thong_tin" ? { display: "none" } : undefined}>
        {tab === "thong_tin" ? null : (
          <NoiDungGia
            bang={bang}
            nam={nam}
            coGiaNamKhac={boNhoGia.coGiaNamNao(canId)}
            thangChon={thangChon}
            giaThuong={giaThuong}
            giaCuoiTuan={giaCuoiTuan}
            thangLich={thangLich}
            dangLuu={dangLuu}
            loiChung={loiChung}
            baoChuaChon={baoChuaChon}
            loiTai={loiTai}
            matMang={matMang}
            onChonThang={chonThangNao}
            onDoiGia={doiGia}
            onApDung={apDung}
            onMoNam={() => setMoNam(true)}
            onDoiThangLich={setThangLich}
            onThuLai={() => {
              setLoiTai(null);
              tai();
            }}
            onChuaLam={toast}
            onMoGiaLe={(ngay) => dieuHuong(DUONG.GIA_LE, { state: { can_id: canId, ma_can: maCan, ngay } })}
            onSaoChep={() => dieuHuong(DUONG.SAO_CHEP_GIA, { state: { can_id: canId, ma_can: maCan } })}
          />
        )}
      </div>
      {moNam && <BangChonNam namNay={namNay} nam={nam} onChon={doiNam} onDong={() => setMoNam(false)} />}
    </Page>
  );
};
