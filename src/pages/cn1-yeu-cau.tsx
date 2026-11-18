import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "../nen-tang/giao-dien";
import { DUONG } from "../components/duong-dan";
import { useKhiQuayLai, useMatMang } from "../components/dung-mang";
import { getYeuCauDS } from "../services/api";
import type { YeuCauChu } from "../services/yeu-cau";
import { KhoiYeuCauCN1 } from "./cn1-yeu-cau-man";

// Tải GET /yeu-cau?phia=nhan&trang_thai=cho_chu. Tải lại khi đổi màn (khoa), có mạng lại, quay lại từ nền (HV2 bước 4, HV3 bước 2).
// Lỗi thì giữ danh sách cũ: khối này không chặn lịch.
export const KhoiYeuCauDangCho = ({ khoa }: { khoa: string }) => {
  const dieuHuong = useNavigate();
  const matMang = useMatMang();
  const [ds, setDs] = useState<YeuCauChu[]>([]);
  const lan = useRef(0);
  const tai = useCallback(async () => {
    const l = ++lan.current;
    try {
      const kq = await getYeuCauDS({ phia: "nhan", trang_thai: ["cho_chu"] });
      if (l === lan.current) setDs(kq.muc as YeuCauChu[]);
    } catch {
      // giữ danh sách cũ
    }
  }, []);
  useEffect(() => {
    void tai();
  }, [khoa]);
  const truoc = useRef(matMang);
  useEffect(() => {
    if (truoc.current && !matMang) void tai();
    truoc.current = matMang;
  }, [matMang]);
  useKhiQuayLai(tai);
  return <KhoiYeuCauCN1 ds={ds} onMo={(y) => dieuHuong(DUONG.YEU_CAU_CHU, { state: { id: y.id } })} />;
};
