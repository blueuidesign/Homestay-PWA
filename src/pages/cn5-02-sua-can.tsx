import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { maLoaiView } from "../components/can-hien-thi";
import { useChonAnh } from "../components/dung-anh";
import { useMatMang } from "../components/dung-mang";
import { useMoRong } from "../components/dung-mo-rong";
import { useToast } from "../components/toast";
import { getCanChiTiet, patchCan } from "../services/api";
import { LoiMang, type CanChiTiet, type SoPhongNgu } from "../services/kieu";
import { BoAnhForm, chuLoiAnh, demTheo } from "../stores/anh-form";
import { KhungDangTai } from "./a4-chu-nha-moi";
import { ChuaTaiDuoc } from "./cn1-lich-thang";
import { dongConThieu, type LoiForm } from "./cn5-a1-them-can";
import { chuToastLuuCan, loiSuaCan, NoiDungCN5_02 } from "./cn5-02-man";

// CN5-02 · Sửa thông tin căn, tab "Thông tin" (mục "Sửa thông tin căn" (US1)): tải GET /can/:id, lưu PATCH /can/:id. Phần vẽ ở cn5-02-man.tsx.

// Form đã có dữ liệu của căn: điền sẵn (US1-NT30)
const FormSua = ({ chiTiet, onXong }: { chiTiet: CanChiTiet; onXong: () => void }) => {
  const toast = useToast();
  const khoaMoi = () => `sua-can-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const khoa = useRef(khoaMoi());
  const [ma, setMa] = useState(chiTiet.ma_can);
  const [phongNgu, setPhongNgu] = useState<SoPhongNgu>(chiTiet.so_phong_ngu);
  const [loi, setLoi] = useState<LoiForm>({});
  const [dangLuu, setDangLuu] = useState(false);
  const [cheDoDoi, setCheDoDoi] = useState(false);
  const [bo] = useState(() => {
    const b = new BoAnhForm();
    b.nap(chiTiet.anh);
    return b;
  });
  const anh = useSyncExternalStore(bo.dangKy, bo.lay);
  // Một khóa cho một nội dung (server.md 1.6): sửa gì thì khóa mới, gửi lại sau lỗi mạng dùng lại khóa (HV2)
  const doiForm = () => {
    khoa.current = khoaMoi();
    setLoi({});
  };
  const { tuChoi, themAnh, moCaiDat, thuLai, xoaAnh } = useChonAnh(bo, toast, doiForm);
  const mr = useMoRong(
    {
      toa: chiTiet.toa_nha ? { ...chiTiet.toa_nha, da_dung: true } : null,
      view: maLoaiView(chiTiet.loai_view),
      soGiuong: chiTiet.so_giuong === null ? "" : String(chiTiet.so_giuong),
      moTa: chiTiet.mo_ta_gui_khach ?? "",
    },
    true,
    doiForm,
  );

  const luu = async () => {
    if (dangLuu || dongConThieu(ma, phongNgu) || demTheo(anh, "dang_tai") > 0) return;
    const soLoi = demTheo(anh, "loi");
    if (soLoi > 0) {
      setLoi({ anh: chuLoiAnh(soLoi) });
      return;
    }
    if (mr.giuong.loi) {
      setLoi({ so_giuong: mr.giuong.loi });
      return;
    }
    setDangLuu(true);
    setLoi({});
    try {
      const can = await patchCan(
        chiTiet.id,
        {
          ma_can: ma,
          so_phong_ngu: phongNgu,
          so_giuong: mr.giuong.gia_tri, // null là xóa trống (US1-NT33)
          loai_view: mr.form.view,
          toa_nha_id: mr.form.toa?.id ?? null,
          mo_ta_gui_khach: mr.form.moTa.trim() || null,
          anh_ids: bo.anhIds(), // theo thứ tự, ảnh số 1 là ảnh đại diện (US1-NT31)
        },
        khoa.current,
      );
      toast(chuToastLuuCan(can.ma_can));
      onXong();
    } catch (e) {
      if (!(e instanceof LoiMang)) khoa.current = khoaMoi();
      setLoi(loiSuaCan(e, ma));
      setDangLuu(false);
    }
  };

  return (
    <NoiDungCN5_02
      ma={ma}
      phongNgu={phongNgu}
      loi={loi}
      dangLuu={dangLuu}
      anh={anh}
      coTheQuyen={tuChoi}
      cheDoDoi={cheDoDoi}
      moRong={{ ...mr.props, loiSoGiuong: loi.so_giuong ?? mr.props.loiSoGiuong }}
      onMa={(v) => {
        setMa(v);
        doiForm();
      }}
      onPhongNgu={(v) => {
        setPhongNgu(v);
        doiForm();
      }}
      onLuu={luu}
      onThemAnh={themAnh}
      onThuLai={thuLai}
      onXoaAnh={xoaAnh}
      onMoCaiDat={moCaiDat}
      onBatDoi={() => setCheDoDoi((v) => !v)}
      onDoiViTri={(k, h) => {
        bo.doiViTri(k, h);
        doiForm();
      }}
    />
  );
};

// Tab "Thông tin": tải GET /can/:id rồi hiện form. Vẫn gắn trong màn khi chuyển sang tab Giá nên chỗ đang sửa không mất.
export const TabThongTinCan = ({ canId, onXong }: { canId: string; onXong: () => void }) => {
  const matMang = useMatMang();
  const [chiTiet, setChiTiet] = useState<CanChiTiet | null>(null);
  const [loiTai, setLoiTai] = useState<"mang" | "khac" | null>(null);
  const tai = async () => {
    try {
      setChiTiet(await getCanChiTiet(canId));
      setLoiTai(null);
    } catch (e) {
      setLoiTai(e instanceof LoiMang ? "mang" : "khac");
    }
  };
  useEffect(() => {
    if (canId) tai();
  }, [canId]);
  if (chiTiet) return <FormSua chiTiet={chiTiet} onXong={onXong} />;
  if (loiTai) return <ChuaTaiDuoc matMang={matMang || loiTai === "mang"} onThuLai={tai} />;
  return <KhungDangTai />;
};
