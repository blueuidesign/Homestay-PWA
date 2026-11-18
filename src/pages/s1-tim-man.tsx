import React from "react";
import {
  bat,
  CHIP_DEM,
  CHIP_PHONG_NGU_TIM,
  CHIP_VIEW_TIM,
  chuChipDem,
  chuKhoangNgay,
  chuNutTim,
  chuTimGanDay,
  ngayTraCuaForm,
  nutTimBamDuoc,
  soDemCuaForm,
  type FormTim,
} from "../components/tim-phong-hien-thi";
import type { MucTimGanDay, ToaNha } from "../services/kieu";

// S1-02, S1-03 · Tìm phòng trống theo ngày (mục "Tìm phòng trống theo ngày" (US12) bước 1 đến 4). Phần vẽ, không gọi server.
// Chưa có lọc "Giá mỗi đêm" [MỞ: api/sale.md câu hỏi 5], chip tòa "Khác" [MỞ: câu hỏi 6], lọc số khách (CH-073).

export const CHU_TIM_GAN_DAY = "Tìm gần đây";
export const CHU_LOC_THEM = "Lọc thêm · Không bắt buộc";

const Chip = ({ chu, bat: dangBat, onCham }: { chu: string; bat: boolean; onCham: () => void }) => (
  <button type="button" className={"hh-chip hh-chip--neutral" + (dangBat ? " hh-chip--on" : "")} aria-pressed={dangBat} onClick={onCham}>
    {chu}
  </button>
);

export const NoiDungTim = ({
  form,
  onDoi,
  ganDay,
  dangTaiGanDay,
  toaNha,
  onChonGanDay,
  onTim,
}: {
  form: FormTim;
  onDoi: (moi: Partial<FormTim>) => void;
  ganDay: MucTimGanDay[];
  dangTaiGanDay: boolean;
  toaNha: ToaNha[];
  onChonGanDay: (m: MucTimGanDay) => void;
  onTim: () => void;
}) => {
  const tra = ngayTraCuaForm(form);
  const bamDuoc = nutTimBamDuoc(form);
  return (
    <>
      <div className="khoi tim-ngay">
        <div className="tim-ngay__luoi">
          <label className="hh-field">
            <span className="hh-field__label">Ngày nhận</span>
            <input
              className="hh-input"
              type="date"
              name="ngay_nhan"
              value={form.ngayNhan}
              onChange={(e) => onDoi({ ngayNhan: e.target.value })}
            />
          </label>
          <label className="hh-field">
            <span className="hh-field__label">Ngày trả</span>
            <input
              className="hh-input"
              type="date"
              name="ngay_tra"
              value={tra}
              min={form.ngayNhan}
              disabled={form.chipDem !== "tuy_chon" || !form.ngayNhan}
              onChange={(e) => onDoi({ traTuyChon: e.target.value })}
            />
          </label>
        </div>
        <div className="hh-field">
          <span className="hh-field__label">Số đêm:</span>
          <div className="tim-chip" role="group" aria-label="Số đêm">
            {CHIP_DEM.map((c) => (
              <Chip key={String(c)} chu={chuChipDem(c)} bat={form.chipDem === c} onCham={() => onDoi({ chipDem: c })} />
            ))}
          </div>
        </div>
        {bamDuoc && (
          <span className="tim-tom-tat" data-ngay-tra={tra}>
            Khách ở {chuKhoangNgay({ ngay_nhan: form.ngayNhan, ngay_tra: tra })} · {soDemCuaForm(form)} đêm
          </span>
        )}
      </div>

      <div className="tim-muc">
        <div className="nhan-muc">{CHU_TIM_GAN_DAY}</div>
        {dangTaiGanDay && ganDay.length === 0 ? (
          <div aria-busy="true" className="khung-xam" style={{ height: 44 }} />
        ) : ganDay.length === 0 ? (
          <span className="chu-phu">Chưa có lần tìm nào</span>
        ) : (
          <div className="tim-gan-day">
            {ganDay.map((m) => (
              <button key={m.id} type="button" className="tim-gan-day__dong" onClick={() => onChonGanDay(m)}>
                {chuTimGanDay(m)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tim-muc">
        <div className="nhan-muc">{CHU_LOC_THEM}</div>
        <div className="khoi">
          <div className="hh-field">
            <span className="hh-field__label">Số phòng ngủ</span>
            <div className="tim-chip" role="group" aria-label="Số phòng ngủ">
              {CHIP_PHONG_NGU_TIM.map((c) => (
                <Chip key={c.gia_tri} chu={c.chu} bat={form.phong.includes(c.gia_tri)} onCham={() => onDoi({ phong: bat(form.phong, c.gia_tri) })} />
              ))}
            </div>
          </div>
          <div className="hh-field">
            <span className="hh-field__label">Loại view</span>
            <div className="tim-chip" role="group" aria-label="Loại view">
              {CHIP_VIEW_TIM.map((c) => (
                <Chip key={c.ma} chu={c.chu} bat={form.view.includes(c.ma)} onCham={() => onDoi({ view: bat(form.view, c.ma) })} />
              ))}
            </div>
          </div>
          <div className="hh-field">
            <span className="hh-field__label">Tòa nhà</span>
            <div className="tim-chip" role="group" aria-label="Tòa nhà">
              {toaNha.map((t) => (
                <Chip key={t.id} chu={t.ten} bat={form.toa.includes(t.id)} onCham={() => onDoi({ toa: bat(form.toa, t.id) })} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!bamDuoc} onClick={() => bamDuoc && onTim()}>
          {chuNutTim(form)}
        </button>
      </div>
    </>
  );
};
