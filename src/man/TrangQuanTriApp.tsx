// YC13 · Nối trang quản trị với Supabase. Thiếu biến Supabase thì báo, không đứng im (HV6).
import { dichVuQuanTriMacDinh } from '../lib/supabase';
import { KhungMan } from './khung';
import { QuanTri } from './QuanTri';

export function TrangQuanTriApp() {
  const dv = dichVuQuanTriMacDinh();
  if (!dv) return <KhungMan tieuDe="Quản trị Home247"><p className="dong-mo">Bản này chưa nối máy chủ.</p></KhungMan>;
  return <QuanTri dichVu={dv} />;
}
