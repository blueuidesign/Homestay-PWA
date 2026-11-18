import React, { useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useDanhSachCan } from "../components/dung-can";
import { useMatMang } from "../components/dung-mang";
import { chonThang } from "../components/gia-hien-thi";
import { useToast } from "../components/toast";
import { homNay, postGiaNhieuCan } from "../services/api";
import { LoiApi, LoiMang } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { docTien } from "./cn4-dat-phong";
import { BangChonNam, chuToastApDung } from "./cn6-gia-man";
import { chonTatCa, chuTieuDeDatGia, doiChon, loiKhiApDungNhieuCan, NoiDungChonCan, NoiDungDatGiaNhieuCan } from "./cn6-nhieu-can-man";

// US7 · Đặt giá nhiều căn (YC3.6): CN6-05 và CN6-05-00 chọn căn, CN6-06 đặt giá. Lưu bằng POST /gia/nhieu-can.
// Các căn đã chọn và phần đang nhập giữ trong bộ nhớ (stores/gia.ts) để "Đổi căn" và rời app rồi quay lại (HV3) không mất.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

// Căn mới tạo xếp cuối như canvas (1509, 3402, Greenbay, 2208): GET /can xếp căn mới lên đầu
const useCanTheoThuTuTao = () => {
  const { dsCan, loiMang } = useDanhSachCan();
  return { can: dsCan ? [...dsCan].reverse() : null, loiMang };
};

export const CN6ChonCan = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const { can, loiMang } = useCanTheoThuTuTao();
  const [canChon, setCanChon] = useState(boNhoGia.nhapNhieuCan().canChon);

  // Chỉ giữ căn còn trong danh sách
  useEffect(() => {
    if (can) setCanChon((cu) => cu.filter((id) => can.some((c) => c.id === id)));
  }, [can?.length]);
  useEffect(() => {
    boNhoGia.ghiNhapNhieuCan({ ...boNhoGia.nhapNhieuCan(), canChon });
  }, [canChon]);

  return (
    <Page className="man">
      <DauMan ten="Đặt giá nhiều căn" coLui />
      {loiMang ? (
        <div className="noi-dung">
          <ChuaTaiDuoc matMang={matMang} onThuLai={() => window.location.reload()} />
        </div>
      ) : !can ? (
        <div className="noi-dung">
          <KhungDangTai />
        </div>
      ) : (
        <NoiDungChonCan
          can={can}
          canChon={canChon}
          matMang={matMang}
          onDoi={(id) => setCanChon((c) => doiChon(c, id))}
          onTatCa={() =>
            setCanChon((c) =>
              chonTatCa(
                c,
                can.map((x) => x.id),
              ),
            )
          }
          onTiep={() => dieuHuong(DUONG.GIA_NHIEU_CAN)}
        />
      )}
    </Page>
  );
};

export const CN6DatGiaNhieuCan = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const { can, loiMang } = useCanTheoThuTuTao();
  const namNay = Number(homNay().slice(0, 4));
  const nhap = boNhoGia.nhapNhieuCan();
  const [nam, setNam] = useState(nhap.nam ?? namNay);
  const [thangChon, setThangChon] = useState(nhap.thangChon);
  const [giaThuong, setGiaThuong] = useState(nhap.giaThuong);
  const [giaCuoiTuan, setGiaCuoiTuan] = useState(nhap.giaCuoiTuan);
  const [moNam, setMoNam] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [baoChuaChon, setBaoChuaChon] = useState(false);
  const dangLuuRef = useRef(false);
  const khoa = useRef(khoaMoi()); // một khóa cho một nội dung (server.md 1.6); lỗi mạng thì bấm lại dùng lại khóa (HV2)

  useEffect(() => {
    boNhoGia.ghiNhapNhieuCan({ canChon: boNhoGia.nhapNhieuCan().canChon, nam, thangChon, giaThuong, giaCuoiTuan });
  }, [nam, thangChon, giaThuong, giaCuoiTuan]);

  const canApDung = can ? can.filter((c) => nhap.canChon.includes(c.id)) : null;
  // Vào thẳng màn này mà chưa chọn căn nào (mở lại app): về CN6-05
  useEffect(() => {
    if (canApDung && canApDung.length === 0) dieuHuong(DUONG.GIA_CHON_CAN, { replace: true, animate: false });
  }, [canApDung?.length]);

  const doiForm = () => {
    khoa.current = khoaMoi();
    setLoiChung(null);
  };
  const doiGia = (o: "thuong" | "cuoi_tuan", chu: string) => {
    const tien = docTien(chu);
    const gia = tien === null ? "" : String(tien);
    if (o === "thuong") setGiaThuong(gia);
    else setGiaCuoiTuan(gia);
    doiForm();
  };
  const apDung = async () => {
    if (dangLuuRef.current || !canApDung) return;
    if (thangChon.length === 0) {
      setBaoChuaChon(true); // như YC3.4-NT2: không gửi, không lưu gì
      return;
    }
    const thuong = docTien(giaThuong);
    const cuoi = docTien(giaCuoiTuan);
    if (thuong === null || cuoi === null) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      await postGiaNhieuCan(
        {
          can_ids: canApDung.map((c) => c.id),
          thang: thangChon.map((so) => `${nam}-${String(so).padStart(2, "0")}`),
          gia_ngay_thuong: thuong,
          gia_cuoi_tuan: cuoi,
        },
        khoa.current,
      );
      toast(chuToastApDung(thangChon));
      for (const c of canApDung) boNhoGia.boBangCuaCan(c.id);
      setThangChon([]);
      setGiaThuong("");
      setGiaCuoiTuan("");
      khoa.current = khoaMoi();
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server: lần sau khóa khác (HV1); lỗi mạng giữ khóa (HV2)
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiChung(loiKhiApDungNhieuCan(e));
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten={chuTieuDeDatGia(canApDung?.length ?? nhap.canChon.length)} coLui />
      <div className="noi-dung">
        {loiMang ? (
          <ChuaTaiDuoc matMang={matMang} onThuLai={() => window.location.reload()} />
        ) : !canApDung ? (
          <KhungDangTai />
        ) : (
          <NoiDungDatGiaNhieuCan
            can={canApDung}
            nam={nam}
            thangChon={thangChon}
            giaThuong={giaThuong}
            giaCuoiTuan={giaCuoiTuan}
            dangLuu={dangLuu}
            loiChung={loiChung}
            baoChuaChon={baoChuaChon}
            matMang={matMang}
            onDoiCan={() => dieuHuong(DUONG.GIA_CHON_CAN)}
            onChonThang={(so) => {
              setThangChon((c) => chonThang(c, so));
              setBaoChuaChon(false);
              doiForm();
            }}
            onDoiGia={doiGia}
            onApDung={apDung}
            onMoNam={() => setMoNam(true)}
            onChuaLam={toast}
          />
        )}
      </div>
      {moNam && (
        <BangChonNam
          namNay={namNay}
          nam={nam}
          onChon={(n) => {
            setMoNam(false);
            if (n !== nam) {
              setNam(n);
              setThangChon([]);
              doiForm();
            }
          }}
          onDong={() => setMoNam(false)}
        />
      )}
    </Page>
  );
};
