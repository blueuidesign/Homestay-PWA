#!/usr/bin/env python3
"""In đúng các mục được hỏi, không phải đọc cả file (EN55). Chỉ đọc, không sửa file.

Chạy:
  python3 scripts/trich.py YC4.2 YC4.1-NT3 QT1.1 QD21 HV4 DLM.3
  python3 scripts/trich.py server.md#1.4 "docs/architecture/api/lich-dat-phong.md#GET /booking/:id"
  python3 scripts/trich.py --khong-theo YC4.2     không kèm các mục mà đoạn trích trỏ tới

Mã nhận được:
  YC4.2, YC4.1.2       mục trong docs/product/requirements/YC4-*.md (tới tiêu đề cùng cấp hoặc cao hơn)
  YC4.1-NT3, QT1.1-VD1 dòng tiêu chí, dòng ví dụ trong mục cha
  QT1.1                docs/product/rules/QT1-*.md
  QD21                 đầu file (id, tieu_de, trang_thai) và mục "## Quyết định"
  HV4                  docs/product/system-behaviors.md
  DLM.3                docs/product/du-lieu-mau.md
  CL2.8, PQ3           mục có mã ở tiêu đề trong docs/
  YC4-H6               câu hỏi mở trong work/cau-hoi.md
  file#mục             tiêu đề trong file, so theo đầu chuỗi (server.md#1.4)
  file.md              cả file (api/gia.md), khi item cần mọi mục của file đó
  CN3-02               mô tả màn docs/design/screens/CN3-02.md
  EN11, SK2            cả file item trong work/backlog/ (gồm done/)
  YC4.1-NT3            cũng nhận khi NT nằm ở mục con (YC4.1.1-NT3)
Mặc định (--theo) in thêm một bậc các QT, QD, HV và đích [MỞ: ...] mà đoạn trích nhắc tới (EN64):
  - QT ghi trần (QT1) in cả quy tắc, và các mục con của nó (QT1.1) không in lại lần hai.
  - HV chỉ kèm khi đoạn trích có dòng "Màn hình:" (task không có màn không cần HV).
  - Mục đã nằm trong một khối đã in thì không in lại.
  --theo=het   kèm cả HV khi đoạn trích không có màn
  --gon        bỏ thẻ [rN · ...] và mục Lịch sử sửa đổi khỏi đoạn trích (dùng trong gói việc)
  --phan dau-vao,dau-ra,loi   với mục API theo khuôn: chỉ in các phần này (task giao diện không cần Dữ liệu,
               Giao dịch, Việc kéo theo). Tên phần: ai-goi dau-vao dau-ra loi du-lieu keo-theo bam-hai-lan test vi-du
Cuối cùng luôn in mục lục (các tiêu đề) của mỗi file nguồn đã dùng.
Mã không tìm thấy: vẫn in các mã tìm được, cuối cùng báo mã thiếu, thoát 2.
"""
import argparse, glob, os, re, signal, sys, unicodedata
signal.signal(signal.SIGPIPE, signal.SIG_DFL)   # cho phép | head

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MA = r'[A-Z]{1,4}\d+(?:\.\d+)*'
RE_TIEU_DE = re.compile(r'^(#{1,6})\s+(.*)$')
RE_THEO = re.compile(r'\b((?:QT\d+(?:\.\d+)*(?:-VD\d+)?)|QD\d+|HV\d+)\b')
RE_MO = re.compile(r'\[MỞ:\s*([^\]]*)\]')


class KhongThay(Exception):
    pass


_cache = {}


def doc(rel):
    if rel not in _cache:
        with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
            _cache[rel] = unicodedata.normalize('NFC', f.read()).split('\n')
    return _cache[rel]


def tieu_de(lines):
    """[(chỉ số dòng, cấp, chữ)] bỏ qua khối ```."""
    out, rao = [], False
    for i, l in enumerate(lines):
        if l.lstrip().startswith('```'):
            rao = not rao
            continue
        m = RE_TIEU_DE.match(l)
        if m and not rao:
            out.append((i, len(m.group(1)), m.group(2).strip()))
    return out


def lam_sach(chu):
    """Bỏ dấu `, thẻ [rN · sửa] để so tiêu đề."""
    chu = re.sub(r'`\[r\d+[^\]]*\]`', '', chu)
    return chu.replace('`', '').strip()


def cat_muc(rel, i0):
    lines = doc(rel)
    hs = tieu_de(lines)
    cap = next(c for i, c, _ in hs if i == i0)
    i1 = next((i for i, c, _ in hs if i > i0 and c <= cap), len(lines))
    while i1 > i0 + 1 and not lines[i1 - 1].strip():
        i1 -= 1
    return i0, i1


def file_cua_ma(code):
    goc = re.match(r'^([A-Z]+)(\d*)', code)
    loai, so = goc.group(1), goc.group(2)
    m = {
        'YC': f'docs/product/requirements/YC{so}-*.md',
        'QT': f'docs/product/rules/QT{so}-*.md',
        'QD': f'docs/decisions/QD{so}-*.md',
        'CL': f'docs/process/CL{so}-*.md',
        'HV': 'docs/product/system-behaviors.md',
        'DLM': 'docs/product/du-lieu-mau.md',
        'PQ': 'docs/security/PQ-*.md',
    }.get(loai)
    ds = sorted(glob.glob(os.path.join(ROOT, m))) if m else []
    if not ds:
        ds = sorted(glob.glob(os.path.join(ROOT, 'docs/**/*.md'), recursive=True))
    return [os.path.relpath(p, ROOT) for p in ds]


def tim_tieu_de_ma(code):
    for rel in file_cua_ma(code):
        for i, c, chu in tieu_de(doc(rel)):
            if re.match(r'^' + re.escape(code) + r'(?:\s+·|\s*$)', lam_sach(chu)):
                return rel, i
    raise KhongThay(code)


def dong_co_ma(rel, a, b, code):
    """Dòng bắt đầu bằng mã (gạch đầu dòng hoặc ô đầu bảng), kèm các dòng thụt vào ngay sau."""
    lines = doc(rel)
    re_d = re.compile(r'^\s*(?:[-*]\s+(?:\[[ xX]\]\s+)?|\|\s*)\**`?' + re.escape(code) + r'\b')
    for i in range(a, b):
        if re_d.match(lines[i]):
            j = i + 1
            while j < b and lines[j].startswith(('  ', '\t')) and lines[j].strip():
                j += 1
            return i, j
    return None


def trich_ma(code):
    """Trả (tiêu đề khối, file, a, b, các dòng)."""
    if re.match(r'^' + MA + r'-H\d+$', code):
        rel = 'work/cau-hoi.md'
        if not os.path.exists(os.path.join(ROOT, rel)):
            raise KhongThay(f'{code}: chưa có work/cau-hoi.md')
        lines = doc(rel)
        for i, c, chu in tieu_de(lines):
            if lam_sach(chu).startswith(code):
                a, b = cat_muc(rel, i)
                return code, rel, a, b, lines[a:b]
        r = dong_co_ma(rel, 0, len(lines), code)
        if not r:
            raise KhongThay(code)
        return code, rel, r[0], r[1], lines[r[0]:r[1]]
    if re.match(r'^QD\d+$', code):
        ds = file_cua_ma(code)
        ds = [p for p in ds if os.path.basename(p).startswith(code + '-')]
        if not ds:
            raise KhongThay(code)
        rel = ds[0]
        lines = doc(rel)
        dau = []
        if lines and lines[0] == '---':
            for l in lines[1:]:
                if l == '---':
                    break
                if re.match(r'^(id|tieu_de|trang_thai|rev):', l):
                    dau.append(l)
        hs = [(i, chu) for i, c, chu in tieu_de(lines) if c == 2 and lam_sach(chu).startswith('Quyết định')]
        if not hs:
            raise KhongThay(f'{code}: không có mục "## Quyết định"')
        a, b = cat_muc(rel, hs[0][0])
        return code, rel, a, b, dau + [''] + lines[a:b]
    if '-' in code:
        cha = code.rsplit('-', 1)[0]
        rel, i = tim_tieu_de_ma(cha) if re.match(r'^' + MA + r'$', cha) else (None, None)
        if rel is None:
            raise KhongThay(code)
        a, b = cat_muc(rel, i)
        r = dong_co_ma(rel, a, b, code) or dong_co_ma(rel, 0, len(doc(rel)), code)
        if not r:
            # YC4.1-NT3 khi NT nằm ở mục con: tìm YC4.1.x-NT3 trong phạm vi YC4.1
            con = re.compile(r'^\s*(?:[-*]\s+(?:\[[ xX]\]\s+)?|\|\s*)\**`?(' + re.escape(cha)
                             + r'(?:\.\d+)+-' + re.escape(code.rsplit('-', 1)[1]) + r')\b')
            lines = doc(rel)
            hit = [i for i in range(a, b) if con.match(lines[i])]
            if not hit:
                raise KhongThay(code)
            out = []
            for i in hit:
                j = i + 1
                while j < b and lines[j].startswith(('  ', '\t')) and lines[j].strip():
                    j += 1
                out += lines[i:j]
            return code, rel, hit[0], hit[-1] + 1, out
        return code, rel, r[0], r[1], doc(rel)[r[0]:r[1]]
    rel, i = tim_tieu_de_ma(code)
    a, b = cat_muc(rel, i)
    return code, rel, a, b, doc(rel)[a:b]


def trich_file_muc(arg):
    ten, _, muc = arg.partition('#')
    try:
        rel = tim_file(ten)
    except KhongThay as e:
        raise KhongThay(f'{arg}: {str(e).split(": ", 1)[1]}')
    muc = unicodedata.normalize('NFC', muc.strip())
    hs = tieu_de(doc(rel))
    hit = [i for i, c, chu in hs if lam_sach(chu) == muc]
    if not hit:
        # so theo đầu chuỗi, ký tự ngay sau phải là khoảng trắng, ·, ( hoặc hết dòng: 1.1 không khớp 1.10
        hit = [i for i, c, chu in hs if re.match(re.escape(muc) + r'(?:[\s·(]|$)', lam_sach(chu))]
    if not hit:
        raise KhongThay(arg)
    a, b = cat_muc(rel, hit[0])
    return arg, rel, a, b, doc(rel)[a:b]


def tim_file(ten):
    """Đường dẫn tương đối của file: đúng đường dẫn, hoặc đuôi đường dẫn duy nhất trong docs/ (bỏ _lich-su)."""
    if os.path.exists(os.path.join(ROOT, ten)):
        return os.path.relpath(os.path.join(ROOT, ten), ROOT)
    ds = [os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, 'docs/**/' + os.path.basename(ten)), recursive=True)]
    ds = [p for p in ds if p.endswith(ten) and '/_lich-su/' not in '/' + p]
    if len(ds) != 1:
        raise KhongThay(f'{ten}: {"không có file" if not ds else "nhiều file trùng tên: " + ", ".join(ds)}')
    return ds[0]


def trich_ca_file(arg):
    """api/gia.md, external/zalo-rang-buoc.md: cả file, khi item cần mọi mục của nó."""
    rel = tim_file(arg)
    lines = doc(rel)
    return arg, rel, 0, len(lines), lines


def trich(arg):
    if '#' in arg:
        return trich_file_muc(arg)
    if arg.endswith('.md'):
        return trich_ca_file(arg)
    if re.match(r'^(EP|US|EN|SK|DC|TK|BG|IM)\d+$', arg):
        ds = sorted(glob.glob(os.path.join(ROOT, f'work/backlog/**/{arg}-*.md'), recursive=True))
        if not ds:
            raise KhongThay(arg)
        return (arg,) + trich_ca_file(os.path.relpath(ds[0], ROOT))[1:]
    man = f'docs/design/screens/{arg}.md'
    if re.match(r'^[A-Z]{1,3}\d+(?:-[A-Za-z0-9]+)*$', arg) and os.path.exists(os.path.join(ROOT, man)):
        return (arg,) + trich_ca_file(man)[1:]
    return trich_ma(arg)


GON = False
RE_THE_REV = re.compile(r'\s*`?\[r\d+ · [^\]]*\]`?')


def gon(lines):
    """Bỏ thẻ [rN · ...] và mục Lịch sử sửa đổi."""
    out = []
    for l in lines:
        if re.match(r'^#{1,6}\s+Lịch sử sửa đổi', l):
            break
        out.append(RE_THE_REV.sub('', l))
    return out


PHAN = None
# Nhãn mục trong khuôn một API (docs/architecture/api/README.md, mục Mẫu cho một API)
NHAN_API = {'ai-goi': 'Ai gọi', 'dau-vao': 'Đầu vào', 'dau-ra': 'Đầu ra', 'loi': 'Lỗi riêng', 'du-lieu': 'Dữ liệu',
            'keo-theo': 'Việc kéo theo', 'bam-hai-lan': 'Chống bấm hai lần', 'test': 'Test bắt buộc', 'vi-du': 'Ví dụ'}
RE_NHAN = re.compile(r'^\*\*([^*]+?):?\*\*:?')


def chi_phan(lines):
    """Khối một API: giữ tiêu đề, đoạn mục đích và các phần được chọn bằng --phan (EN66).
    Khối không theo khuôn API (không có nhãn Đầu vào) thì giữ nguyên."""
    if not any(RE_NHAN.match(l) and RE_NHAN.match(l).group(1).strip() == 'Đầu vào' for l in lines):
        return lines
    muon = {NHAN_API[x] for x in PHAN}
    out, giu, da_gap = [], True, False
    for l in lines:
        m = RE_NHAN.match(l)
        if m and m.group(1).strip() in NHAN_API.values():
            da_gap = True
            giu = m.group(1).strip() in muon
        elif RE_TIEU_DE.match(l) and out:
            giu = False if da_gap else giu
        if giu or not da_gap:
            out.append(l)
    bo = [v for v in NHAN_API.values() if v not in muon]
    return out + [f'(chỉ in {", ".join(sorted(muon))}; bỏ {", ".join(bo)})']


def in_khoi(k):
    ten, rel, a, b, lines = k
    print(f'===== {ten} · {rel}:{a + 1}-{b} =====')
    if PHAN:
        lines = chi_phan(lines)
    print('\n'.join(gon(lines) if GON else lines).rstrip())
    print()


def co_man(lines):
    return any(re.match(r'^\s*\**Màn hình:?\**:?\s*(?!không)', l, re.I) for l in lines)


def tham_chieu(lines):
    """Mã QT, QD, HV và đích [MỞ: ...] nhắc tới trong đoạn trích."""
    out = []
    for l in lines:
        for m in RE_THEO.finditer(l):
            out.append(m.group(1))
        for m in RE_MO.finditer(l):
            for x in re.split(r'[,;]', m.group(1)):
                x = x.strip()
                if re.match(r'^' + MA + r'(?:-[A-Z]{1,3}\d+)?$', x):
                    out.append(x)
    seen, kq = set(), []
    for x in out:
        if x not in seen:
            seen.add(x)
            kq.append(x)
    return kq


def main(argv=None):
    global GON
    ap = argparse.ArgumentParser(description='In đúng các mục được hỏi.')
    ap.add_argument('ma', nargs='+')
    ap.add_argument('--theo', dest='theo', nargs='?', const='1', default='1', choices=['0', '1', 'het'])
    ap.add_argument('--khong-theo', dest='theo', action='store_const', const='0')
    ap.add_argument('--gon', action='store_true')
    ap.add_argument('--phan', help='với mục API: chỉ in các phần này, ví dụ dau-vao,dau-ra,loi (task giao diện). '
                    'Phần: ' + ', '.join(NHAN_API))
    a = ap.parse_args(argv)
    GON = a.gon
    global PHAN
    if a.phan:
        PHAN = [x.strip() for x in a.phan.split(',') if x.strip()]
        sai = [x for x in PHAN if x not in NHAN_API]
        if sai:
            print(f'trich.py: --phan không biết {", ".join(sai)}. Dùng: {", ".join(NHAN_API)}', file=sys.stderr)
            return 2

    khoi, loi = [], []
    for x in dict.fromkeys(a.ma):
        try:
            khoi.append(trich(x))
        except KhongThay as e:
            loi.append(str(e))
    # mục nằm trong một mục khác đã hỏi (YC4.1.1 trong YC4.1) thì không in lại
    khoi = [k for k in khoi if not any(o is not k and o[1] == k[1] and o[2] <= k[2] and k[3] <= o[3]
                                       and (o[2], o[3]) != (k[2], k[3]) for o in khoi)]
    for k in khoi:
        in_khoi(k)
    nguon = [k[1] for k in khoi]
    if a.theo != '0':
        da_in = set(a.ma)
        vung = [(k[1], k[2], k[3]) for k in khoi]
        them, bo_qua = [], []
        for k in khoi:
            man = co_man(k[4])
            # mã trần (QT1) trước mã con (QT1.1), để mục con nằm trong khối đã in thì bỏ qua
            for code in sorted(tham_chieu(k[4]), key=lambda c: c.count('.') + c.count('-')):
                if code in da_in:
                    continue
                da_in.add(code)
                if code.startswith('HV') and not man and a.theo != 'het':
                    bo_qua.append(code)
                    continue
                try:
                    t = trich_ma(code)
                except KhongThay:
                    them.append((code, '(không tìm thấy)', 0, 0, []))
                    continue
                if any(t[1] == r and t[2] >= x and t[3] <= y for r, x, y in vung):
                    continue
                vung.append((t[1], t[2], t[3]))
                them.append(t)
        if them:
            print('----- Kèm theo: các mục đoạn trên trỏ tới (một bậc) -----\n')
            for k in them:
                if k[4]:
                    in_khoi(k)
                    nguon.append(k[1])
                else:
                    print(f'===== {k[0]} · không tìm thấy =====\n')
        if bo_qua:
            print(f'(Không kèm {", ".join(bo_qua)} vì đoạn trích không có màn. Cần thì gọi riêng.)\n')
    for rel in dict.fromkeys(nguon):
        if rel == 'work/cau-hoi.md' or rel.startswith('work/backlog/'):
            continue    # file việc: mục lục dài, không giúp chọn thêm mục
        print(f'===== Mục lục {rel} =====')
        for i, c, chu in tieu_de(doc(rel)):
            print(f'{"  " * (c - 1)}{chu}  (dòng {i + 1})')
        print()
    if loi:
        for e in loi:
            print(f'trich.py: không tìm thấy {e}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
