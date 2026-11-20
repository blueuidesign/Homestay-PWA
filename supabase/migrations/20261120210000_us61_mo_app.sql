-- US61 · Popup thông báo mới (YC12.1). Lệnh fn_mo_app: trả thông báo mới của người gọi và ghi mốc lần mở mới trong một lần.

-- YC12.1 bước 1, 2, YC12 "Quy tắc của nhóm" (Thông báo mới), PQ19.CHU, PQ19.SALE: không nhận mã người, chỉ đọc của chính người gọi.
-- "Mới" là chưa đọc và tạo sau mốc lần mở trước (profiles.mo_app_luc). Chưa có mốc (lần mở đầu): mọi dòng chưa đọc (giả định GD33).
-- Khóa dòng hồ sơ khi đọc mốc để hai máy mở cùng lúc không cùng nhận một dòng. Không đánh dấu đã đọc (YC12.1-NT5): P13 vẫn còn dòng.
create or replace function public.fn_mo_app()
returns table (id uuid, loai text, noi_dung jsonb, doi_tuong_loai text, doi_tuong_id uuid, tao_luc timestamptz, doc_luc timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_moc timestamptz;
begin
  select p.mo_app_luc into v_moc from public.profiles p where p.id = v_nguoi for update;
  update public.profiles set mo_app_luc = clock_timestamp() where profiles.id = v_nguoi;
  return query
  select tb.id, tb.loai, tb.noi_dung, tb.doi_tuong_loai, tb.doi_tuong_id, tb.tao_luc, tb.doc_luc
  from public.thong_bao tb
  where tb.nguoi_nhan = v_nguoi and tb.doc_luc is null and (v_moc is null or tb.tao_luc > v_moc)
  order by tb.tao_luc desc, tb.id
  limit 100;
end $$;

revoke execute on function public.fn_mo_app() from public, anon, authenticated;
grant execute on function public.fn_mo_app() to authenticated;
