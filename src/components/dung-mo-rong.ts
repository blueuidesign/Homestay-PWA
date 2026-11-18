import { useEffect, useRef, useState } from "react";
import { getToaNha, postToaNha } from "../services/api";
import type { ToaNha } from "../services/kieu";
import { LoiApi } from "../services/kieu";
import { docSoGiuong, formMoRongTrong, type FormMoRong, type PropsMoRong } from "./khoi-mo-rong";

const khoaMoi = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Trạng thái phần mở rộng của form căn: hàng chip tòa (GET /toa-nha không q), tìm tòa theo chữ gõ (GET /toa-nha?q=),
// thêm tòa mới (POST /toa-nha). Chỉ gọi server khi người dùng mở phần này, không gọi lúc mở màn.
export const useMoRong = (khoiTao: FormMoRong = formMoRongTrong(), batDauMo = false, onDoi: () => void = () => {}) => {
  const [form, setForm] = useState<FormMoRong>(khoiTao);
  const [dangMo, setDangMo] = useState(batDauMo);
  const [dsToa, setDsToa] = useState<ToaNha[]>([]);
  const [moTim, setMoTim] = useState(false);
  const [chuTim, setChuTim] = useState("");
  const [ketQuaTim, setKetQuaTim] = useState<ToaNha[] | null>([]);
  const [loiToa, setLoiToa] = useState<string | undefined>();
  const lanTim = useRef(0);
  const khoaToa = useRef(khoaMoi());

  const doi = (moi: Partial<FormMoRong>) => {
    setForm((f) => ({ ...f, ...moi }));
    onDoi();
  };

  useEffect(() => {
    if (!dangMo) return;
    let con = true;
    getToaNha()
      .then((ds) => con && setDsToa(ds))
      .catch(() => {});
    return () => {
      con = false;
    };
  }, [dangMo]);

  useEffect(() => {
    if (!moTim) return;
    const lan = ++lanTim.current;
    setKetQuaTim(null);
    const q = chuTim.trim();
    getToaNha(q ? { q } : {})
      .then((ds) => lan === lanTim.current && setKetQuaTim(ds))
      .catch(() => lan === lanTim.current && setKetQuaTim([]));
  }, [moTim, chuTim]);

  const themToaMoi = async () => {
    const ten = chuTim.trim();
    if (!ten) return;
    try {
      const t = await postToaNha({ ten }, khoaToa.current);
      khoaToa.current = khoaMoi();
      setDsToa((ds) => (ds.some((x) => x.id === t.id) ? ds : [...ds, t]));
      doi({ toa: t });
      setLoiToa(undefined);
      setMoTim(false);
      setChuTim("");
    } catch (e) {
      setLoiToa(e instanceof LoiApi ? "Chưa thêm được tòa. Kiểm tra tên tòa rồi thử lại" : "Chưa lưu được, bấm lại khi có mạng");
    }
  };

  const giuong = docSoGiuong(form.soGiuong);
  const props: PropsMoRong = {
    form,
    dsToa,
    moTim,
    chuTim,
    ketQuaTim,
    loiSoGiuong: giuong.loi,
    loiToa,
    coThuGon: true,
    onThuGon: () => setDangMo(false),
    onChonToa: (t) => {
      doi({ toa: t });
      if (t) {
        setMoTim(false);
        setChuTim("");
      }
    },
    onMoTim: setMoTim,
    onChuTim: (c) => {
      setChuTim(c);
      setLoiToa(undefined);
    },
    onThemToaMoi: themToaMoi,
    onView: (ma) => doi({ view: ma }),
    onSoGiuong: (c) => doi({ soGiuong: c }),
    onMoTa: (c) => doi({ moTa: c }),
  };
  return { form, props, dangMo, moPhan: () => setDangMo(true), giuong };
};
