#!/usr/bin/env python3
"""Soạn gói việc cho agent phụ từ file item (CL10.6, skill soan-viec-cho-subagent).

Chạy:
  python3 scripts/goi.py US12              in gói ra màn hình
  python3 scripts/goi.py US12 --ghi        ghi work/goi/US12.md
  python3 scripts/goi.py US3 --task TA1,TA2 --ghi    chỉ các task này (khi phải tách agent, CL10.6)
  python3 scripts/goi.py US3 --task TA4 --giao-dien  task chỉ làm màn: API chỉ chép Đầu vào, Đầu ra, Lỗi, Ví dụ

Máy điền mọi ô chép được: NT, ví dụ số, quyết định, hành vi chung, API, màn, tài liệu khác (bằng
scripts/trich.py --gon), bất biến (CLAUDE.md), quy ước code (.claude/rules/code.md), câu còn mở,
được sửa (mục Phạm vi). Hai ô cần phán đoán để trống có dấu <!-- điền tay -->: Làm theo mẫu, Test ở lớp nào.
Cuối cùng in danh sách ô còn trống. Còn ô trống thì không giao sonnet.
"""
import argparse, glob, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAY = '<!-- điền tay -->'


def doc(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()


def dau_file(t):
    fm = {}
    if t.startswith('---'):
        for l in t.split('\n')[1:]:
            if l.strip() == '---':
                break
            k, _, v = l.partition(':')
            fm[k.strip()] = re.sub(r'\s+#.*$', '', v).strip()
    return fm


def muc(t, ten):
    m = re.search(r'^##\s+' + re.escape(ten) + r'\s*\n(.*?)(?=^##\s|\Z)', t, re.M | re.S)
    if not m:
        return ''
    return '\n'.join(l for l in m.group(1).split('\n') if not l.strip().startswith('<!--')).strip()


def muc_claude(ten):
    t = doc('CLAUDE.md')
    m = re.search(r'^##\s+' + re.escape(ten) + r'[^\n]*\n(.*?)(?=^##\s|\Z)', t, re.M | re.S)
    return m.group(1).strip() if m else ''


def trich(codes, theo=True, phan=None):
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'scripts/trich.py'), '--gon',
                        *([] if theo else ['--khong-theo']), *(['--phan', phan] if phan else []), *codes],
                       capture_output=True, text=True, cwd=ROOT)
    return r.stdout, r.stderr.strip()


def khoi(out):
    """[(mã, file, nội dung)] từ đầu ra trich.py, bỏ mục lục."""
    kq = []
    for b in re.split(r'(?m)^(?====== )', out):
        m = re.match(r'===== (.+?) · (\S+?)(?::\d+-\d+)? =====\n', b)
        if not m or b.startswith('===== Mục lục') or 'không tìm thấy' in m.group(2):
            continue
        nd = b[m.end():].strip()
        # hạ cấp tiêu đề của đoạn trích để không lẫn với các ô ## của gói
        nd = re.sub(r'(?m)^(#{1,4})(\s)', lambda x: '#' * min(len(x.group(1)) + 3, 6) + x.group(2), nd)
        kq.append((m.group(1), m.group(2), nd))
    return kq


def nhom(ma, rel):
    if rel.startswith('docs/architecture/') or rel.startswith('docs/security/'):
        return 'api'
    if ma.startswith('YC'):
        return 'nt'
    if ma.startswith('QT'):
        return 'vd'
    if ma.startswith('QD'):
        return 'qd'
    if ma.startswith('HV'):
        return 'hv'
    if rel.startswith('docs/design/canvas/'):
        return 'man'
    return 'khac'


def ma_doc(t):
    out = []
    for l in muc(t, 'Đọc').split('\n'):
        l = re.sub(r'^[-*]\s+', '', l.strip())
        if not l:
            continue
        out += [l] if ('#' in l or l.endswith('.md')) else [x for x in re.split(r'[\s,·]+', l) if x]
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description='Soạn gói việc cho agent phụ.')
    ap.add_argument('item')
    ap.add_argument('--task', help='chỉ các task này, ví dụ TA1,TA2')
    ap.add_argument('--ghi', action='store_true', help='ghi work/goi/<mã>.md')
    ap.add_argument('--giao-dien', action='store_true',
                    help='gói cho task chỉ làm màn: API chỉ chép Đầu vào, Đầu ra, Lỗi riêng, Ví dụ')
    a = ap.parse_args(argv)

    ds = [p for p in glob.glob(os.path.join(ROOT, f'work/backlog/{a.item}-*.md'))]
    if not ds:
        print(f'goi.py: không thấy item {a.item} trong work/backlog/ (item đã xong thì không cần gói)', file=sys.stderr)
        return 2
    rel_item = os.path.relpath(ds[0], ROOT)
    t = doc(rel_item)
    fm = dau_file(t)

    task_all = [l for l in muc(t, 'Task').split('\n') if re.match(r'^\s*-\s*\[[ xX]\]\s+' + a.item + r'-TA\d+', l)]
    if a.task:
        chon = {f'{a.item}-{x.strip()}' for x in a.task.split(',')}
        task = [l for l in task_all if re.search(r'\b(' + '|'.join(map(re.escape, chon)) + r')\b', l)]
    else:
        task = [l for l in task_all if re.search(r'\bCode\b', l) and not re.match(r'^\s*-\s*\[[xX]\]', l)]
    model = 'opus' if any('opus' in l for l in task) or not task else 'sonnet'

    codes = [c.strip().split('@')[0] for c in fm.get('thuc_hien', '').strip('[]').split(',') if c.strip()]
    codes += re.findall(r'\bYC\d+(?:\.\d+)*-NT\d+\b', muc(t, 'Làm tiêu chí nào'))
    codes += ma_doc(t)
    codes = list(dict.fromkeys(codes))
    # Kèm theo một bậc (QT, QD, HV) chỉ từ yêu cầu và quy tắc. thiết kế database, PQ, tài liệu khác trích đúng mục:
    # chúng nhắc QD để truy vết, kèm cả các QD đó làm gói phình mà ít giúp viết code.
    dac_ta = [c for c in codes if re.match(r'^(YC|QT)\d', c)]
    con_lai = [c for c in codes if c not in dac_ta]
    out1, loi1 = trich(dac_ta) if dac_ta else ('', '')
    out2, loi2 = trich(con_lai, theo=False, phan='dau-vao,dau-ra,loi,vi-du' if a.giao_dien else None) if con_lai else ('', '')
    out, loi = out1 + out2, '; '.join(x for x in (loi1, loi2) if x)
    g, da_chep = {}, set()
    for ma, rel, nd in khoi(out):
        if (ma, rel) in da_chep:
            continue
        da_chep.add((ma, rel))
        g.setdefault(nhom(ma, rel), []).append(f'### {ma} · {rel}\n{nd}')
    # Mã được nhắc trong gói mà gói không chép: báo để agent tự trích khi cần (Đ1, doc-thieu)
    co = {ma for ma, _ in da_chep}
    nhac = set(re.findall(r'\b(?:QD\d+|HV\d+|QT\d+(?:\.\d+)*|PQ\d+)\b', out))
    thieu = sorted((x for x in nhac if x not in co and not any(x.startswith(c + '.') for c in co)
                    and not any(c.startswith(x + '.') for c in co)), key=lambda x: (re.sub(r'\d.*', '', x), x))
    lon = sorted({(rel, round(len(nd) / 2.5)) for ma, rel, nd in khoi(out) if ma.endswith('.md') and len(nd) > 20000})

    mo = sorted(set(re.findall(r'\[MỞ:[^\]]*\]', out)))
    pham_vi = muc(t, 'Phạm vi')
    try:
        soan = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, cwd=ROOT).stdout.strip()
    except OSError:
        soan = ''
    quy_uoc = doc('.claude/rules/code.md')
    quy_uoc = re.sub(r'^---\n.*?\n---\n', '', quy_uoc, flags=re.S).strip()

    def o(k, rong='Không có.'):
        return '\n\n'.join(g.get(k, [])) or rong

    ma_goi = a.item if not a.task else f'{a.item}-{a.task.replace(",", "-")}'
    phan = [
        '---',
        f'item: {a.item}',
        f'task: [{", ".join(re.search(a.item + r"-TA\d+", l).group(0) for l in task)}]',
        f'model: {model}               # theo CL14.6a, mức cao nhất mà các task cần',
        f'soan_luc: {soan}',
        f'soan_bang: scripts/goi.py',
        '---',
        f'# Gói việc {ma_goi}',
        '',
        'Soạn bằng scripts/goi.py (CL10.6, skill soan-viec-cho-subagent). Agent phụ chỉ đọc gói này và code, '
        'không đọc CLAUDE.md. Gặp chỗ gói không nói thì dừng, ghi câu hỏi vào work/cau-hoi.md, không tự đoán. '
        'Xóa khi item sang xong.',
        '',
        '## Việc',
        f'{fm.get("tieu_de", "")} ({rel_item}).',
        '',
        *[l.strip() for l in task],
        '',
        '## Bất biến của Home247',
        muc_claude('Home247 khác app đặt phòng thông thường'),
        '',
        muc_claude('Ràng buộc PWA'),
        '',
        '## NT phải đạt',
        o('nt'),
        '',
        '## Ví dụ số',
        o('vd'),
        '',
        '## Quyết định liên quan',
        o('qd'),
        '',
        '## Hành vi chung',
        o('hv', 'Không kèm (item không có màn, hoặc YC không nhắc HV).'),
        '',
        '## Database và quyền',
        o('api'),
        '',
        '## Màn',
        o('man') + ('\n\nChữ và nhãn chính xác: `python3 scripts/trich-man.py <mã màn> --chu`.' if g.get('man') else ''),
        '',
        '## Tài liệu khác',
        o('khac'),
        '',
        '## Mã được nhắc nhưng không chép',
        ('Đọc thêm bằng `python3 scripts/trich.py <mã>` nếu task cần: ' + ', '.join(thieu) + '.') if thieu else 'Không có.',
        '',
        '## Quy ước code',
        quy_uoc,
        '',
        '## Làm theo mẫu',
        TAY + ' 1 đến 2 file có sẵn làm việc giống nhất',
        '',
        '## Câu còn mở',
        ('\n'.join(f'- {x}: không làm phần này.' for x in mo)) if mo else 'Không có.',
        '',
        '## Được sửa',
        pham_vi or TAY + ' item chưa có mục Phạm vi',
        '',
        '## Test ở lớp nào',
        'Theo lớp ghi sau dấu · ở cuối mỗi NT (database, unit, e2e; CL14.5). ' + TAY + ' task test trước thì ghi file test agent sau không được sửa',
        '',
        '## Lệnh kiểm',
        'Theo docs/dev/chay-va-test.md: test của gói bị đổi, `python3 scripts/kiem.py --diff origin/main`. '
        'Ghi vào mục Bằng chứng của item: lệnh đã chạy, lần đầu đỏ mấy test, sửa mấy vòng, kết quả cuối.',
        '',
        '## Xong khi',
        '- Test mang mã NT xanh ở đúng lớp.',
        '- `npm run typecheck` và `npm run build` qua.',
        '- `python3 scripts/kiem.py --diff origin/main` không có lỗi mới.',
        '- Không sửa file ngoài "Được sửa".',
        '- Báo lại tối đa 10 dòng: PR, lệnh đã chạy, kết quả, việc còn lại.',
        '',
    ]
    goi = '\n'.join(phan)
    con_trong = [m.group(1) for m in re.finditer(r'^## (.+)\n' + re.escape(TAY), goi, re.M)]
    if a.ghi:
        os.makedirs(os.path.join(ROOT, 'work/goi'), exist_ok=True)
        p = os.path.join(ROOT, f'work/goi/{ma_goi}.md')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(goi)
        print(f'goi.py: đã ghi {os.path.relpath(p, ROOT)} · khoảng {len(goi) // 3} token')
    else:
        print(goi)
    if loi:
        print(f'goi.py: trich.py báo: {loi}', file=sys.stderr)
    if lon:
        print('goi.py: đang chép cả file lớn: ' + ', '.join(f'{r} (khoảng {n} token)' for r, n in lon)
              + '. Nên đổi mục Đọc của item sang từng mục (file#mục).', file=sys.stderr)
    if con_trong:
        print('goi.py: ô cần điền tay: ' + ', '.join(con_trong) + '. Chưa điền thì giao opus.', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
