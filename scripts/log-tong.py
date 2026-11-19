#!/usr/bin/env python3
"""Tổng hợp log phiên Claude Code để đánh giá quy trình (CL10.7).

Log do hook scripts/hook/ghi-log-phien.py ghi lên nhánh `nhat-ky-phien`, mỗi phiên một file phien/<ngày>-<phiên>.json.

Chạy:
  python3 scripts/log-tong.py                    tổng hợp mọi phiên
  python3 scripts/log-tong.py --tu 2026-11-09    từ ngày này
  python3 scripts/log-tong.py --item US12        chỉ các phiên của một item
  python3 scripts/log-tong.py --chi-tiet da665173   từng bước của một phiên (8 ký tự đầu session)
  python3 scripts/log-tong.py --json             dữ liệu thô cho phân tích tiếp

In ra Markdown: tổng, theo người, theo item, theo skill, và các dấu hiệu lệch quy trình để xem lại
(mở cả file tài liệu thay vì trích, mở PR mà chưa chạy test, nhiều agent phụ cho một item, bị hook chặn).
Chỉ đọc, không sửa gì.
"""
import argparse, collections, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NHANH = 'nhat-ky-phien'


def git(*a):
    return subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True)


def doc_log():
    git('fetch', '-q', '--depth=1', 'origin', f'+refs/heads/{NHANH}:refs/remotes/origin/{NHANH}')
    ref = f'refs/remotes/origin/{NHANH}'
    ds = git('ls-tree', '-r', '--name-only', ref).stdout.split()
    out = []
    for p in ds:
        if p.startswith('phien/') and p.endswith('.json'):
            try:
                out.append(json.loads(git('show', f'{ref}:{p}').stdout))
            except ValueError:
                pass
    # thêm bản nháp chưa đẩy của máy này
    nhap = os.path.join(git('rev-parse', '--absolute-git-dir').stdout.strip(), 'home247-log')
    co = {l['tom_tat']['session'] for l in out}
    for f in sorted(os.listdir(nhap)) if os.path.isdir(nhap) else []:
        if f.endswith('.json'):
            try:
                l = json.load(open(os.path.join(nhap, f), encoding='utf-8'))
            except ValueError:
                continue
            if l['tom_tat']['session'] not in co:
                l['tom_tat']['_nhap'] = True
                out.append(l)
    return out


def tong_token(t):
    return sum(v.get('vao', 0) + v.get('doc_cache', 0) + v.get('ghi_cache', 0) + v.get('ra', 0) for v in t.values())


def so(n):
    return f'{n:,}'.replace(',', '.')


def dau_hieu(l):
    """Các điểm lệch quy trình của một phiên."""
    tt, b = l['tom_tat'], l['buoc']
    out = []
    ca = [s['file'] for s in b if s['loai'] == 'doc' and s.get('ca_file') and str(s.get('file', '')).startswith('docs/')
          and (s.get('byte') or 0) > 20000]
    sh = [f for s in b if s['loai'] == 'doc-shell' for f in s.get('file', []) if f.startswith('docs/')]
    if ca or sh:
        out.append(f'mở cả file tài liệu lớn thay vì trích: {", ".join(sorted(set(ca + sh))[:5])}')
    da_test = False
    for s in b:
        if s['loai'] == 'test':
            da_test = True
        ct = s.get('chi_tiet', '')
        mo_pr = s['loai'] == 'gh' and ('pr create' in ct or ('/pulls' in ct and 'head=' in ct))
        if mo_pr and not da_test:
            out.append('mở PR mà chưa thấy chạy test trong phiên')
            break
    if tt.get('agent_phu', 0) > 1 and tt.get('item'):
        out.append(f'{tt["agent_phu"]} agent phụ trong một phiên của {tt["item"]} (CL10.6: mặc định một item một agent)')
    if tt.get('bi_chan'):
        out.append(f'{tt["bi_chan"]} lần bị hook hoặc quyền chặn')
    if not tt.get('nguoi'):
        out.append('không rõ ai làm (câu đầu phiên không nói)')
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description='Tổng hợp log phiên.')
    ap.add_argument('--tu')
    ap.add_argument('--item')
    ap.add_argument('--chi-tiet')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args(argv)
    logs = doc_log()
    if a.tu:
        logs = [l for l in logs if (l['tom_tat'].get('ket_thuc') or '') >= a.tu]
    if a.item:
        logs = [l for l in logs if l['tom_tat'].get('item') == a.item]
    if a.json:
        json.dump(logs, sys.stdout, ensure_ascii=False)
        return 0
    if a.chi_tiet:
        l = next((l for l in logs if l['tom_tat']['session'].startswith(a.chi_tiet)), None)
        if not l:
            print(f'log-tong.py: không có phiên {a.chi_tiet}', file=sys.stderr)
            return 2
        print(json.dumps({k: v for k, v in l['tom_tat'].items() if k != '_doan'}, ensure_ascii=False, indent=1))
        for s in l['buoc']:
            x = {k: v for k, v in s.items() if k not in ('t', 'loai')}
            print(f"{(s.get('t') or '')[11:19]} {'  phụ ' if s.get('phu') else ''}{s['loai']:10} {json.dumps(x, ensure_ascii=False)[:160]}")
        return 0
    if not logs:
        print('Chưa có log phiên nào.')
        return 0
    tien = sum(l['tom_tat'].get('chi_phi_usd') or 0 for l in logs)
    tok = sum(tong_token(l['tom_tat'].get('token', {})) for l in logs)
    cache = sum(v.get('doc_cache', 0) + v.get('ghi_cache', 0) for l in logs for v in l['tom_tat'].get('token', {}).values())
    print(f'# Log phiên · {len(logs)} phiên\n')
    print(f'Tổng token {so(tok)}, trong đó đọc và ghi cache {round(100 * cache / tok) if tok else 0}%. '
          f'Chi phí ước tính {tien:.2f} USD (theo số Claude Code ghi trong phiên).\n')
    for ten, khoa in (('Theo người', 'nguoi'), ('Theo item', 'item')):
        g = collections.defaultdict(lambda: [0, 0, 0.0])
        for l in logs:
            t = l['tom_tat']
            k = t.get(khoa) or '(không rõ)'
            g[k][0] += 1
            g[k][1] += tong_token(t.get('token', {}))
            g[k][2] += t.get('chi_phi_usd') or 0
        print(f'## {ten}\n| | Phiên | Token | USD |\n|---|---|---|---|')
        for k, (n, t_, u) in sorted(g.items(), key=lambda x: -x[1][2])[:30]:
            print(f'| {k} | {n} | {so(t_)} | {u:.2f} |')
        print()
    sk = collections.Counter(s for l in logs for s in l['tom_tat'].get('skill', []))
    print('## Skill được gọi\n' + (', '.join(f'{k} {v}' for k, v in sk.most_common()) or 'Chưa skill nào.') + '\n')
    dem = collections.Counter()
    for l in logs:
        dem.update(l['tom_tat'].get('dem', {}))
    print('## Loại việc\n' + ', '.join(f'{k} {v}' for k, v in dem.most_common()) + '\n')
    print('## Dấu hiệu cần xem lại')
    co = False
    for l in sorted(logs, key=lambda l: l['tom_tat'].get('bat_dau') or ''):
        dh = dau_hieu(l)
        if dh:
            co = True
            t = l['tom_tat']
            print(f"- {t['session'][:8]} ({(t.get('bat_dau') or '')[:10]}, {t.get('nguoi') or '?'}, {t.get('nhanh')}): " + '; '.join(dh))
    if not co:
        print('Không có.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
