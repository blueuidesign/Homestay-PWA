import { useState } from "react";
import { MAX_ANH_CAN } from "../services/api";
import { chonAnh } from "../services/chon-anh";
import type { BoAnhForm } from "../stores/anh-form";

// Chọn ảnh cho form có mục ảnh (CN5-A1 của US1, CN5-02 của US1).
// Quyền ảnh: bị từ chối thì hiện thẻ, bấm "Thêm ảnh" lại không gọi Zalo cho tới khi người dùng đã mở cài đặt (HV4 bước 3b, 4, 5).
// Chỉ gọi hộp thoại Zalo khi người dùng bấm "Thêm ảnh", không xin quyền khi mở màn.
export const useChonAnh = (bo: BoAnhForm, toast: (chu: string) => void, onDoi: () => void) => {
  const [tuChoi, setTuChoi] = useState(false);
  const [daMoCaiDat, setDaMoCaiDat] = useState(false);

  const themAnh = async () => {
    if (tuChoi && !daMoCaiDat) return;
    const con = MAX_ANH_CAN - bo.lay().length;
    if (con <= 0) return;
    const kq = await chonAnh.chonAnh(con);
    if (kq.kq === "tu_choi") {
      setTuChoi(true);
      setDaMoCaiDat(false);
    } else if (kq.kq === "loi") {
      toast("Chưa chọn được ảnh, bấm lại");
    } else if (kq.kq === "co") {
      setTuChoi(false);
      const { bo: nBo } = bo.themTep(kq.tep);
      if (nBo > 0) toast(`Tối đa ${MAX_ANH_CAN} ảnh, đã bỏ ${nBo} ảnh`);
      onDoi();
    }
  };
  const moCaiDat = async () => {
    await chonAnh.moCaiDatQuyen();
    setDaMoCaiDat(true);
  };
  const thuLai = (khoa: string) => {
    void bo.thuLai(khoa);
    onDoi();
  };
  const xoaAnh = (khoa: string) => {
    bo.xoa(khoa);
    onDoi();
  };
  return { tuChoi, themAnh, moCaiDat, thuLai, xoaAnh };
};
