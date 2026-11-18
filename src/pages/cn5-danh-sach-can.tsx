import React from "react";
import { Page, useLocation, useNavigate } from "../nen-tang/giao-dien";
import { DauMan } from "../components/dau-man";
import { DUONG } from "../components/duong-dan";
import { Icon } from "../components/icon";
import { TheCan } from "../components/the-can";
import { ThanhTab } from "../components/thanh-tab";
import { useDanhSachCan } from "../components/dung-can";
import { boNhoGia } from "../stores/gia";
import type { Can } from "../services/kieu";
import { KhungDangTai, LoiMang, NoiDungA4 } from "./a4-chu-nha-moi";

// CN5 · Danh sách căn (mục "Danh sách căn" (US1)), bản gọn của US1.
// Vừa thêm căn (có vuaThemId): CN5-A4 khi có một căn, CN5-A4b khi nhiều căn (mục "Thêm căn" (US1) bước 4).
export const NoiDungCN5 = ({
  dsCan,
  vuaThemId,
  onThemCan,
  onMoCan,
}: {
  dsCan: Can[];
  vuaThemId?: string;
  onThemCan: () => void;
  onMoCan?: (can: Can, tab: "thong_tin" | "gia") => void;
}) => (
  <>
    {dsCan.map((c) => (
      <TheCan
        key={c.id}
        can={c}
        vuaThem={c.id === vuaThemId}
        onCham={() => onMoCan?.(c, "thong_tin")}
        onDatGia={() => onMoCan?.(c, "gia")}
      />
    ))}
    {vuaThemId ? (
      <div className="thanh-duoi thanh-duoi--tren-tab">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onThemCan}>
          <Icon ten="cong" co={16} />
          Thêm căn khác
        </button>
      </div>
    ) : (
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemCan}>
        <Icon ten="cong" co={16} />
        Thêm căn
      </button>
    )}
  </>
);

export const TabCan = () => {
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const vuaThemId = (viTri.state as { vuaThemId?: string } | null)?.vuaThemId;
  const { dsCan, loiMang } = useDanhSachCan();
  const themCan = () => dieuHuong(DUONG.THEM_CAN);
  // Chạm thẻ mở CN5-02 tab Thông tin; "Đặt giá cho căn này" mở thẳng tab Giá (mục "Đặt giá theo tháng" (US4) Khi nào xảy ra). Màu căn theo thứ tự tạo.
  const moCan = (c: Can, tab: "thong_tin" | "gia") => {
    const thuTu = [...(dsCan ?? [])].sort((a, b) => a.tao_luc.localeCompare(b.tao_luc) || a.id.localeCompare(b.id, "en", { numeric: true }));
    dieuHuong(DUONG.CHI_TIET_CAN, { state: { can_id: c.id, ma_can: c.ma_can, tab, thu_tu: thuTu.findIndex((x) => x.id === c.id) } });
  };
  const coCan = !!dsCan && dsCan.length > 0;
  // "Đặt giá nhiều căn" ở đầu màn (CN5, mục "Danh sách căn" (US1) bước 6, US7): vào chọn căn từ đầu, chưa chọn căn nào
  const datGiaNhieuCan = () => {
    boNhoGia.ghiNhapNhieuCan({ canChon: [], nam: null, thangChon: [], giaThuong: "", giaCuoiTuan: "" });
    dieuHuong(DUONG.GIA_CHON_CAN);
  };

  return (
    <Page className="man">
      <DauMan
        ten="Căn của tôi"
        phu={coCan ? `${dsCan!.length} căn` : undefined}
        nut={
          dsCan && dsCan.length >= 2 ? (
            <button type="button" className="hh-btn hh-btn--text hh-btn--inline" style={{ flex: "0 0 auto" }} onClick={datGiaNhieuCan}>
              Đặt giá nhiều căn
            </button>
          ) : undefined
        }
      />
      <div className="noi-dung" style={vuaThemId ? { paddingBottom: 150 } : undefined}>
        {loiMang ? (
          <LoiMang />
        ) : !dsCan ? (
          <KhungDangTai />
        ) : coCan ? (
          <NoiDungCN5 dsCan={dsCan} vuaThemId={vuaThemId} onThemCan={themCan} onMoCan={moCan} />
        ) : (
          <NoiDungA4 onThemCan={themCan} />
        )}
      </div>
      <ThanhTab dangO={DUONG.CAN} />
    </Page>
  );
};
