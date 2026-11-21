// YC13 · Trang quản trị /quan-tri: Q1 đăng nhập bằng mã email, Q1-01 nhập mã, Q1-02 không có quyền, rồi các mục
// quản trị (Q3 Ngày lễ, Q2 Quản trị viên). Quyền kiểm ở database mỗi lệnh (PQ21, YC13-H6). Trạng thái màn theo HV1, HV2 (YC13-H1).
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { LoiKhongQuyenQuanTri, type DichVuQuanTri } from '../lib/dichVuQuanTri';
import { KhungMan, O } from './khung';
import { NhapMa } from './NhapMa';
import { Q2QuanTriVien } from './Q2QuanTriVien';
import { Q3NgayLe } from './Q3NgayLe';
import './QuanTri.css';

export const DUONG_QUAN_TRI = '/quan-tri';
export const CAU_KHONG_QUYEN = 'Email này không có quyền quản trị';

type Buoc = 'tai' | 'email' | 'ma' | 'khong-quyen' | 'vao';
export type MucQuanTri = { ma: string; ten: string; noiDung: (p: { laGoc: boolean }) => ReactNode };

export function QuanTri(props: { dichVu: DichVuQuanTri; mucThem?: MucQuanTri[] }) {
  const dv = props.dichVu;
  const [buoc, datBuoc] = useState<Buoc>('tai');
  const [email, datEmail] = useState('');
  const [guiLuc, datGuiLuc] = useState(0);
  const [loi, datLoi] = useState<string | undefined>();
  const [toi, datToi] = useState<{ email: string; laGoc: boolean } | null>(null);
  const toast = useToast();

  const vao = useCallback(async () => {
    try {
      datToi(await dv.vao());
      datBuoc('vao');
    } catch (e) {
      if (e instanceof LoiKhongQuyenQuanTri) datBuoc('khong-quyen');
      else { datBuoc('email'); toast(cauBaoLoi(e)); }
    }
  }, [dv, toast]);

  useEffect(() => {
    void dv.layPhien().then((p) => (p ? vao() : datBuoc('email')), () => datBuoc('email'));
  }, [dv, vao]);

  const dangXuat = async () => { await dv.dangXuat().catch(() => undefined); datToi(null); datBuoc('email'); };
  // Lệnh nào báo mất quyền (vừa bị gỡ, YC13-H6) thì chuyển sang Q1-02.
  const khiLoi = (e: unknown) => { if (e instanceof LoiKhongQuyenQuanTri) datBuoc('khong-quyen'); };

  if (buoc === 'tai') return <KhungXam />;

  if (buoc === 'email') {
    const guiMa = async () => {
      datLoi(undefined);
      try {
        if (!(await dv.guiMa(email))) { datLoi(CAU_KHONG_QUYEN); return; }
        datGuiLuc(Date.now());
        datBuoc('ma');
      } catch (e) { datLoi(cauBaoLoi(e)); }
    };
    return (
      <div data-man="Q1" className="qt-man">
        <KhungMan tieuDe="Quản trị Home247">
          <p className="dong-phu">Chỉ email trong danh sách quản trị viên nhận được mã.</p>
          <O nhan="Email" kieu="email" tuDien="email" giaTri={email} onDoi={datEmail} loi={loi} viDu="ten@vidu.vn" />
          <div className="man-chan">
            <NutGhi chu="Gửi mã" chuDangGhi="Đang gửi…" disabled={!email.trim()} onGhi={guiMa} />
          </div>
        </KhungMan>
      </div>
    );
  }

  if (buoc === 'ma') {
    return (
      <div data-man="Q1-01" className="qt-man">
        <NhapMa luong="dang-nhap" email={email} guiLuc={guiLuc}
                onXacNhan={async (m) => { const kq = await dv.xacNhanMa(email, m); if (kq === 'dung') await vao(); return kq; }}
                onGuiLai={async () => { await dv.guiMa(email); datGuiLuc(Date.now()); }}
                onDoiEmail={() => datBuoc('email')} />
      </div>
    );
  }

  if (buoc === 'khong-quyen') {
    return (
      <div data-man="Q1-02" className="qt-man">
        <KhungMan tieuDe="Quản trị Home247">
          <p className="qt-bao" role="alert">{CAU_KHONG_QUYEN}</p>
          <p className="dong-mo">Nhờ quản trị viên đầu tiên thêm email của bạn, rồi đăng nhập lại.</p>
          <div className="man-chan">
            <NutGhi chu="Đăng xuất" chuDangGhi="Đang đăng xuất…" onGhi={dangXuat} />
          </div>
        </KhungMan>
      </div>
    );
  }

  return <TrangQuanTri toi={toi!} mucThem={props.mucThem ?? []} dichVu={dv} onDangXuat={dangXuat} onLoi={khiLoi} />;
}

function TrangQuanTri(props: {
  toi: { email: string; laGoc: boolean };
  mucThem: MucQuanTri[];
  dichVu: DichVuQuanTri;
  onDangXuat: () => Promise<void>;
  onLoi: (e: unknown) => void;
}) {
  const muc: MucQuanTri[] = [
    { ma: 'ngay-le', ten: 'Ngày lễ', noiDung: () => <Q3NgayLe dichVu={props.dichVu} onLoi={props.onLoi} /> },
    ...props.mucThem,
    { ma: 'quan-tri-vien', ten: 'Quản trị viên',
      noiDung: ({ laGoc }) => <Q2QuanTriVien dichVu={props.dichVu} laGoc={laGoc} onLoi={props.onLoi} /> },
  ];
  const [dang, datDang] = useState(muc[0]!.ma);
  const hien = muc.find((m) => m.ma === dang) ?? muc[0]!;
  return (
    <div className="man qt-trang">
      <header className="man-dau qt-dau">
        <h1 className="man-tieu-de">Quản trị Home247</h1>
        <button type="button" className="hh-btn hh-btn--text qt-dang-xuat" onClick={() => void props.onDangXuat()}>Đăng xuất</button>
      </header>
      <p className="qt-ai">{props.toi.email}{props.toi.laGoc ? ' · quản trị viên đầu tiên' : ''}</p>
      <nav className="qt-tab" role="tablist" aria-label="Mục quản trị">
        {muc.map((m) => (
          <button key={m.ma} type="button" role="tab" aria-selected={m.ma === hien.ma}
                  className={'qt-tab__nut' + (m.ma === hien.ma ? ' qt-tab__nut--on' : '')} onClick={() => datDang(m.ma)}>
            {m.ten}
          </button>
        ))}
      </nav>
      <div className="qt-than" role="tabpanel">{hien.noiDung({ laGoc: props.toi.laGoc })}</div>
    </div>
  );
}
