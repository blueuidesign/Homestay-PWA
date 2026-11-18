import React, { useEffect, useRef, useState } from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useDanhSachCan } from "../components/dung-can";
import { useMatMang } from "../components/dung-mang";
import { useToast } from "../components/toast";
import { getGiaCan, homNay, postGiaSaoChep } from "../services/api";
import { LoiApi, LoiMang, type DipGiuGiaCu, type ThangGiuGiaCu } from "../services/kieu";
import { boNhoGia } from "../stores/gia";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { chonTatCa, chuTomTatGia, chuToastSaoChep, doiChon, HopGiuGiaCu, loiKhiSaoChep, NoiDungSaoChep } from "./cn6-nhieu-can-man";

// US7 · CN6-07 Sao chép giá sang căn khác (mục "Sao chép giá sang căn khác" (US7)), vào từ nút cuối tab Giá. Sao chép xong về tab Giá, toast CN6-08.
// Tóm tắt "TỪ CĂN" lấy GET /can/:id/gia?nam= của năm nay. Lưu bằng POST /can/:id/gia/sao-chep.
const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`;

export const CN6SaoChepGia = () => {
  const dieuHuong = useNavigate();
  const toast = useToast();
  const matMang = useMatMang();
  const viTri = useLocation();
  const moTu = (viTri.state as { can_id?: string; ma_can?: string } | null) ?? {};
  const canId = moTu.can_id ?? "";
  const { dsCan, loiMang } = useDanhSachCan();
  const nhap = boNhoGia.nhapSaoChep(canId);
  const [thang, setThang] = useState(nhap.thang);
  const [le, setLe] = useState(nhap.le);
  const [dip, setDip] = useState(nhap.dip);
  const [denChon, setDenChon] = useState(nhap.denCan);
  const [tomTat, setTomTat] = useState<string | null>(null);
  const [maNguon, setMaNguon] = useState(moTu.ma_can ?? "");
  const [dangLuu, setDangLuu] = useState(false);
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [giuGiaCu, setGiuGiaCu] = useState<{ giu: ThangGiuGiaCu[]; dipGiu: DipGiuGiaCu[]; dipBoQua: DipGiuGiaCu[]; soCan: number } | null>(null);
  const dangLuuRef = useRef(false);
  const khoa = useRef(khoaMoi());

  useEffect(() => {
    if (canId) boNhoGia.ghiNhapSaoChep(canId, { thang, le, dip, denCan: denChon });
  }, [canId, thang, le, dip, denChon]);

  useEffect(() => {
    let conDung = true;
    getGiaCan(canId, { nam: Number(homNay().slice(0, 4)) })
      .then((b) => {
        if (!conDung) return;
        setMaNguon(b.ma_can);
        setTomTat(
          chuTomTatGia(
            b.thang.filter((t) => t.gia_ngay_thuong !== null).length,
            b.dai_dip.filter((d) => d.la_ngay_le).length,
            b.dai_dip.filter((d) => !d.la_ngay_le).length,
          ),
        );
      })
      .catch((e) => {
        if (conDung && e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      });
    return () => {
      conDung = false;
    };
  }, [canId]);

  const canDich = dsCan ? [...dsCan].reverse().filter((c) => c.id !== canId) : null;
  useEffect(() => {
    if (canDich) setDenChon((cu) => cu.filter((id) => canDich.some((c) => c.id === id)));
  }, [dsCan]);

  const doiForm = () => {
    khoa.current = khoaMoi();
    setLoiChung(null);
  };
  const xong = (soCan: number) => {
    toast(chuToastSaoChep(soCan));
    dieuHuong(-1); // về tab Giá của căn nguồn (CN6 nhớ tab đang mở)
  };
  const saoChep = async () => {
    if (dangLuuRef.current || denChon.length === 0) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(null);
    try {
      const kq = await postGiaSaoChep(canId, { den_can_ids: denChon, gia_thang: thang, gia_le: le, gia_dip_dac_biet: dip }, khoa.current);
      for (const id of [canId, ...denChon]) boNhoGia.boBangCuaCan(id);
      boNhoGia.ghiNhapSaoChep(canId, { thang: true, le: true, dip: true, denCan: [] });
      boNhoGia.datQuayVeTabGia(canId);
      // Có tháng hoặc dịp giữ giá cũ thì báo bằng một popup, bấm "Tôi đã hiểu" mới về tab Giá (US7, Tùng quyết 04/11/2026, điểm 6 và 12)
      if (kq.thang_giu_gia_cu.length > 0 || kq.dip_giu_cu.length > 0 || kq.dip_bo_qua.length > 0) setGiuGiaCu({ giu: kq.thang_giu_gia_cu, dipGiu: kq.dip_giu_cu, dipBoQua: kq.dip_bo_qua, soCan: kq.so_can });
      else xong(kq.so_can);
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi(); // lỗi server: lần sau khóa khác (HV1); lỗi mạng giữ khóa (HV2)
      if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") dieuHuong(DUONG.A1, { replace: true, animate: false });
      else setLoiChung(loiKhiSaoChep(e)); // lỗi mạng: ở lại màn, giữ lựa chọn, không toast (HV2)
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  };

  return (
    <Page className="man">
      <DauMan ten="Sao chép giá" coLui />
      {giuGiaCu && (
        <HopGiuGiaCu
          giu={giuGiaCu.giu}
          dipGiu={giuGiaCu.dipGiu}
          dipBoQua={giuGiaCu.dipBoQua}
          onDong={() => {
            const { soCan } = giuGiaCu;
            setGiuGiaCu(null);
            xong(soCan);
          }}
        />
      )}
      {loiMang && !canDich ? (
        <div className="noi-dung">
          <ChuaTaiDuoc matMang={matMang || loiMang} onThuLai={() => window.location.reload()} />
        </div>
      ) : !canDich ? (
        <div className="noi-dung">
          <KhungDangTai />
        </div>
      ) : (
        <NoiDungSaoChep
          maCanNguon={maNguon}
          tomTat={tomTat}
          canDich={canDich}
          thang={thang}
          le={le}
          dip={dip}
          denChon={denChon}
          dangLuu={dangLuu}
          loiChung={loiChung}
          matMang={matMang}
          onDoiPhan={(k) => {
            if (k === "thang") setThang((v) => !v);
            else if (k === "le") setLe((v) => !v);
            else setDip((v) => !v);
            doiForm();
          }}
          onDoiDich={(id) => {
            setDenChon((c) => doiChon(c, id));
            doiForm();
          }}
          onTatCa={() => {
            setDenChon((c) =>
              chonTatCa(
                c,
                canDich.map((x) => x.id),
              ),
            );
            doiForm();
          }}
          onSaoChep={saoChep}
        />
      )}
    </Page>
  );
};
