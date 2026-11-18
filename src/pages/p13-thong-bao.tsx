import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { CHU_P13_TIEU_DE, dichThongBao } from "../components/thong-bao-hien-thi";
import { CHU_LOI_MANG } from "../components/xin-so";
import { getThongBao, postThongBaoDaDoc } from "../services/api";
import { LoiApi, LoiMang, type MucThongBao } from "../services/kieu";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { NoiDungP13 } from "./p13-man";

// P13 · Thông báo (YC1.10 bước 3). Vào từ Cá nhân, dòng "Thông báo". GET /thong-bao (mới trước, kèm số chưa đọc),
// "Đánh dấu đã đọc" và chạm một dòng: POST /thong-bao/da-doc. Chạm dòng thì mở màn đích (P13 bảng Hành động).
export const P13ThongBao = () => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const [muc, setMuc] = useState<MucThongBao[] | null>(null);
  const [soChuaDoc, setSoChuaDoc] = useState(0);
  const [truocTiep, setTruocTiep] = useState<string | null>(null);
  const [loi, setLoi] = useState<"mang" | "khac" | null>(null);
  const [dangLam, setDangLam] = useState(false);
  const [loiViec, setLoiViec] = useState<string | null>(null);
  const lan = useRef(0);

  const xuLyLoi = (e: unknown) => {
    if (e instanceof LoiApi && e.loi === "CHUA_DANG_NHAP") {
      dieuHuong(DUONG.A1, { replace: true, animate: false });
      return null;
    }
    return e instanceof LoiMang ? "mang" : "khac";
  };

  const tai = useCallback(async () => {
    const l = ++lan.current;
    try {
      const kq = await getThongBao({ gioi_han: 50 });
      if (l !== lan.current) return;
      setMuc(kq.muc);
      setSoChuaDoc(kq.so_chua_doc);
      setTruocTiep(kq.truoc_tiep);
      setLoi(null);
    } catch (e) {
      if (l === lan.current) setLoi(xuLyLoi(e));
    }
  }, []);
  useEffect(() => {
    void tai();
  }, []);
  // Quay lại từ nền hay có mạng lại thì tải lại (HV2 bước 4, HV3 bước 2)
  const matMangTruoc = useRef(matMang);
  useEffect(() => {
    if (matMangTruoc.current && !matMang) void tai();
    matMangTruoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(tai);

  const xemThem = async () => {
    if (!truocTiep) return;
    try {
      const kq = await getThongBao({ truoc: truocTiep, gioi_han: 50 });
      setMuc((cu) => [...(cu ?? []), ...kq.muc]);
      setSoChuaDoc(kq.so_chua_doc);
      setTruocTiep(kq.truoc_tiep);
    } catch (e) {
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa tải được. Bấm lại");
    }
  };

  // "Đánh dấu đã đọc": mọi dòng thành đã đọc
  const danhDauHet = async () => {
    if (dangLam) return;
    setDangLam(true);
    setLoiViec(null);
    try {
      await postThongBaoDaDoc({ tat_ca: true });
      await tai();
    } catch (e) {
      setLoiViec(e instanceof LoiMang ? CHU_LOI_MANG : "Có lỗi, chưa làm được. Bấm lại");
    } finally {
      setDangLam(false);
    }
  };

  // Chạm một dòng: đánh dấu đã đọc cả nhóm gom, rồi mở màn đích. Không đánh dấu được thì vẫn mở (việc đọc không chặn việc xem).
  const cham = (m: MucThongBao) => {
    if (m.da_doc_luc === null) {
      setMuc((cu) => cu && cu.map((x) => (x.id === m.id ? { ...x, da_doc_luc: new Date().toISOString() } : x)));
      setSoChuaDoc((n) => Math.max(0, n - 1));
      void postThongBaoDaDoc({ ids: m.ids }).catch(() => {});
    }
    const dich = dichThongBao(m);
    if (dich) dieuHuong(DUONG[dich.duong], dich.state ? { state: dich.state } : undefined);
  };

  return (
    <Page className="man">
      <DauMan ten={CHU_P13_TIEU_DE} coLui />
      {matMang && muc && (
        <div className="hh-banner hh-banner--warning" role="status">
          Mất kết nối. Danh sách có thể chưa mới nhất.
        </div>
      )}
      {muc ? (
        <NoiDungP13
          muc={muc}
          soChuaDoc={soChuaDoc}
          dangLam={dangLam}
          loi={loiViec}
          conNua={truocTiep !== null}
          onDanhDauHet={() => void danhDauHet()}
          onCham={cham}
          onXemThem={() => void xemThem()}
        />
      ) : (
        <div className="noi-dung">{loi ? <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={() => void tai()} /> : <KhungDangTai />}</div>
      )}
    </Page>
  );
};
