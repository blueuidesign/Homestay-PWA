#!/usr/bin/env python3
"""Kiểm repo Home247 theo CL2, CL3, CL12. Chỉ đọc, không sửa file nào.

Chạy:
  python3 scripts/kiem.py                  kiểm cả repo, chỉ cảnh báo (luôn thoát 0)
  python3 scripts/kiem.py --chan           có lỗi thì thoát 1
  python3 scripts/kiem.py --diff origin/main
                                           chỉ kiểm file đã đổi so với origin/main;
                                           luật [MỞ] chỉ áp cho dòng mới thêm;
                                           thêm luật rev và [tự sinh]
  python3 scripts/kiem.py work/backlog/US10-*.md   chỉ kiểm các file này
  python3 scripts/kiem.py --tom-tat        chỉ in số lỗi theo luật

Luật (mã in trong ngoặc vuông ở mỗi dòng báo):
  front-matter   đầu file thiếu hoặc không đọc được (YAML)
  trang-thai     trạng thái item hoặc tài liệu không nằm trong danh sách
  trung-ma       một mã được định nghĩa ở hai chỗ
  lien-ket       cha, truoc, thuc_hien trỏ tới mã không có
  mo             [MỞ: X] không trỏ tới mã đang mở
  xong-ngoai-done  item xong mà chưa nằm trong work/backlog/done/
  rev            file docs/ đổi nội dung mà rev không tăng (chỉ với --diff)
  tu-sinh        dòng có [tự sinh] bị sửa tay (chỉ với --diff)
  nt-test        item đã mở PR có NT chưa có test mang đúng mã, hoặc thiếu lớp ghi sau dấu · (EN8)
"""
import argparse, collections, os, re, subprocess, sys, unicodedata
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Trạng thái item: CL2.2 cộng on-hold. Bản PWA chỉ có US, EN, BG (QD21).
#
TT_ITEM = {'moi', 'san-sang', 'dang-lam', 'cho-test', 'cho-nghiem-thu', 'xong', 'huy', 'on-hold'}
# Trạng thái tài liệu docs/: đang dùng de-xuat, da-chot, bo, nhap; khuôn qd.md thêm cho-chot, da-thay;
# khuôn man.md thêm da-duyet.
TT_DOCS = {'de-xuat', 'da-chot', 'da-thay', 'bo', 'cho-chot', 'nhap', 'da-duyet'}
TT_DONG = {'xong', 'huy'}

BO_QUA_DIR = ('node_modules/', '.git/',
              'docs/_lich-su/')  # bảng lịch sử cũ, không có đầu file (CL12.3)
# Không thuộc CL12 (CL12.1) và không có đầu file bắt buộc
DOCS_MIEN = ('docs/process/templates/', 'docs/chuc-nang/')
# Tài liệu tả luật: được nhắc [MỞ: ...] và [tự sinh] làm ví dụ
META = ('CLAUDE.md', '.claude/', 'docs/process/')

MA = r'[A-Z]{1,4}\d+(?:\.\d+)*'                     # YC4.1.2, QT1, US10, QD21
MA_CON = MA + r'(?:-[A-Z]{1,3}\d+[a-z]?)*'           # YC4.1-NT3, US3-TA1, YC4-H6
RE_MA_DU = re.compile(r'^' + MA_CON + r'(?:\.[A-Z]{2,6})?$')   # PQ2.SALE là mã, không phải chữ tự do
RE_HEADING = re.compile(r'^(#{1,6})\s+`?([A-Z]{1,4}(?:\d+|\.\d+)(?:\.[0-9A-Za-z]+)*)`?\s+·')
RE_DONG_MA = re.compile(r'^\s*(?:[-*]\s+(?:\[[ x]\]\s+)?|\|\s*)\**`?(' + MA + r'(?:-[A-Z]{1,3}\d+[a-z]?)+)\b')
RE_TASK = re.compile(r'^\s*[-*]\s+\[[ xX]\]\s+\**(' + MA + r'-[A-Z]{1,3}\d+[a-z]?)\b')
RE_MO = re.compile(r'\[MỞ(?::\s*([^\]]*))?\]')
RE_CAU_HOI = re.compile(r'^' + MA + r'-H\d+$')


CANH_BAO = {'item-dai'}  # luật chỉ nhắc, --chan không chặn
ITEM_DAI = 7500  # ký tự; mỗi phiên làm item đọc lại cả file item nhiều lần


def nfc(s):
    return unicodedata.normalize('NFC', s)


def doc(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return nfc(f.read())


def git(*args, check=True):
    r = subprocess.run(['git', '-C', ROOT, *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        raise SystemExit(f'kiem.py: lệnh git {" ".join(args)} lỗi: {r.stderr.strip()}')
    return r.stdout


def tach_dau_file(text):
    """Trả (dict đầu file | None, lỗi | None, số dòng của đầu file)."""
    if not text.startswith('---\n'):
        return None, 'thiếu đầu file (---)', 0
    m = re.match(r'---\n(.*?)\n---\s*\n', text, re.S)
    if not m:
        return None, 'đầu file không có dòng --- đóng', 0
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        return None, 'YAML lỗi: ' + str(e).replace('\n', ' ')[:160], 0
    if not isinstance(fm, dict):
        return None, 'đầu file không phải dạng khóa: giá trị', 0
    return fm, None, m.group(0).count('\n')


def dau_file_tho(text):
    """Đọc đầu file kiểu dòng khóa: giá trị (như plan.py) khi YAML lỗi. None nếu không có đầu file."""
    m = re.match(r'---\n(.*?)\n---\s*\n', text, re.S)
    if not m:
        return None
    fm = {}
    for line in m.group(1).split('\n'):
        k, sep, v = line.partition(':')
        if sep and not line.startswith(' '):
            fm[k.strip()] = re.sub(r'\s+#.*$', '', v).strip()
    return fm


def as_list(v):
    if v is None or v == '':
        return []
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    return [x.strip() for x in str(v).strip('[]').split(',') if x.strip()]


def bo_code(text):
    """Bỏ khối ``` và đoạn `...` để không bắt ví dụ trong code."""
    out, rao = [], False
    for line in text.split('\n'):
        if line.lstrip().startswith('```'):
            rao = not rao
            out.append('')
            continue
        out.append('' if rao else re.sub(r'`[^`]*`', '', line))
    return out


def ds_file_md():
    out = []
    for d, dirs, files in os.walk(ROOT):
        rel = os.path.relpath(d, ROOT)
        rel = '' if rel == '.' else rel + '/'
        dirs[:] = [x for x in dirs if not (rel + x + '/').startswith(BO_QUA_DIR) and x not in ('.git', 'node_modules')]
        for f in files:
            if f.endswith('.md'):
                out.append(rel + f)
    return sorted(out)


class Repo:
    """Đọc mọi file .md một lần, lập chỉ mục mã."""

    def __init__(self):
        self.files = {}          # path -> text
        self.fm = {}             # path -> dict | None
        self.fm_loi = {}         # path -> lỗi
        self.ma = collections.defaultdict(list)   # mã -> [(path, dòng, kiểu)]
        self.item = {}           # mã item -> (path, fm)
        self.qd = {}             # QDn -> fm
        self.cau_hoi = None      # None: chưa có work/cau-hoi.md; dict mã -> mở?
        for p in ds_file_md():
            try:
                t = doc(p)
            except (UnicodeDecodeError, OSError):
                continue
            self.files[p] = t
            fm, loi, _ = tach_dau_file(t)
            if loi:
                self.fm_loi[p] = loi
                fm = dau_file_tho(t)   # vẫn lập chỉ mục để các file khác không báo sai theo
            self.fm[p] = fm
        for p, t in self.files.items():
            if not (p.startswith('docs/') or p.startswith('work/') or p.startswith('tests/')):
                continue
            if p.startswith(DOCS_MIEN):
                continue
            fm = self.fm.get(p) or {}
            fid = str(fm.get('id', '')).split('#')[0].strip() if fm.get('id') else ''
            if fid:
                self.ma[fid].append((p, 1, 'id'))
                if p.startswith('work/backlog/'):
                    self.item[fid] = (p, fm)
                if p.startswith('docs/decisions/') and fid.startswith('QD'):
                    self.qd[fid] = fm
            dinh_nghia_dong = p.startswith(('docs/product/', 'docs/security/', 'work/backlog/', 'tests/kb/'))
            for i, line in enumerate(bo_code(t), 1):
                m = RE_HEADING.match(line)
                if m and p.startswith('docs/'):
                    code = m.group(2)
                    if code != fid:          # H1 trùng id của chính file thì không tính hai lần
                        self.ma[code].append((p, i, 'muc'))
                    continue
                # Item: chỉ dòng ô đánh dấu (- [ ] US3-TA1) là định nghĩa task; dòng khác chỉ nhắc tới
                m = (RE_TASK if p.startswith('work/backlog/') else RE_DONG_MA).match(line)
                if m and dinh_nghia_dong:
                    code = m.group(1)
                    goc = code.split('-')[0]
                    # Chỉ tính là định nghĩa khi mã con thuộc chính file (NT của YC này, TA của item này)
                    if fid and (goc == fid or goc.startswith(fid + '.')):
                        self.ma[code].append((p, i, 'dong'))
        for p in self.files:
            if p.startswith('docs/design/screens/') and not p.endswith('INDEX.md'):
                self.ma[os.path.basename(p)[:-3]].append((p, 1, 'man'))
        if 'work/cau-hoi.md' in self.files:
            self.cau_hoi = doc_cau_hoi(self.files['work/cau-hoi.md'])
            for code in self.cau_hoi:
                self.ma[code].append(('work/cau-hoi.md', 1, 'cau-hoi'))

    def co_ma(self, code):
        return code in self.ma


def doc_cau_hoi(text):
    """Đọc work/cau-hoi.md: mã YCn-Hm -> True nếu đang mở (trạng thái mo).

    Nhận bốn dạng: dòng bảng `| YC4-H6 | ... | mo |`, dòng gạch đầu `- YC4-H6 ... · mo`,
    tiêu đề `### YC4-H6 · mo` , hoặc tiêu đề `### YC4-H6 · ...` với dòng
    `trang_thai: mo` (hoặc `Trạng thái: mo`) trong mục. `mot-phan` tính là còn mở.
    """
    out, cur = {}, None
    re_mo = re.compile(r'(?:^|[|·(\s])(?:mo|mot-phan)(?:[|·)\s]|$)')
    for line in text.split('\n'):
        h = re.match(r'^#{1,6}\s+`?(' + MA + r'-H\d+)\b', line)
        if h:
            cur = h.group(1)
            out[cur] = bool(re_mo.search(line[h.end():]))
            continue
        if line.startswith('#'):
            cur = None
        m = re.match(r'^\s*(?:[-*]\s+|\|\s*)\**`?(' + MA + r'-H\d+)\b(.*)$', line)
        if m:
            out[m.group(1)] = bool(re_mo.search(m.group(2)))
            continue
        if cur and re.match(r'^\s*(?:[-*]\s*)?(?:trang_thai|trạng thái)\s*:\s*(?:mo|mot-phan)\b', line, re.I):
            out[cur] = True
    return out


class Bao:
    def __init__(self):
        self.loi = []    # (path, dòng, luật, nội dung)

    def them(self, path, dong, luat, nd):
        self.loi.append((path, dong, luat, nd))


def kiem_mo(repo, path, so_dong, noi_dung, bao):
    for m in RE_MO.finditer(noi_dung):
        dich = (m.group(1) or '').strip()
        if not dich:
            bao.them(path, so_dong, 'mo', '[MỞ] thiếu mã: ghi [MỞ: QDn], [MỞ: YCn-Hm] hoặc mã item đang mở')
            continue
        phan = [x.strip() for x in re.split(r'[,;]|\svà\s', dich) if x.strip()]
        for x in phan:
            if not RE_MA_DU.match(x):
                bao.them(path, so_dong, 'mo', f'[MỞ: {dich}] có chữ tự do "{x}": chỉ ghi mã đang mở')
                continue
            if x.startswith('QD') and re.match(r'^QD\d+$', x):
                fm = repo.qd.get(x)
                if fm is None:
                    bao.them(path, so_dong, 'mo', f'[MỞ: {x}] không có QD này')
                elif fm.get('trang_thai') != 'cho-chot':
                    bao.them(path, so_dong, 'mo', f'[MỞ: {x}] QD đã đóng ({fm.get("trang_thai")})')
            elif RE_CAU_HOI.match(x):
                if repo.cau_hoi is None:
                    continue    # chưa có work/cau-hoi.md: bỏ qua
                if x not in repo.cau_hoi:
                    bao.them(path, so_dong, 'mo', f'[MỞ: {x}] không có trong work/cau-hoi.md')
                elif not repo.cau_hoi[x]:
                    bao.them(path, so_dong, 'mo', f'[MỞ: {x}] câu hỏi đã đóng')
            elif x in repo.item:
                tt = repo.item[x][1].get('trang_thai')
                if tt in TT_DONG:
                    bao.them(path, so_dong, 'mo', f'[MỞ: {x}] item đã đóng ({tt})')
            elif repo.co_ma(x):
                bao.them(path, so_dong, 'mo', f'[MỞ: {x}] không phải mã mở được (chỉ QD cho-chot, câu hỏi YCn-Hm, item chưa xong)')
            else:
                bao.them(path, so_dong, 'mo', f'[MỞ: {x}] mã không có trong repo')


def la_doc_cl12(p):
    return p.startswith('docs/') and p.endswith('.md') and not p.startswith(DOCS_MIEN) \
        and not p.startswith(BO_QUA_DIR) and os.path.basename(p) != 'INDEX.md'


def can_dau_file(p):
    if p.startswith('work/backlog/'):
        return os.path.basename(p) != 'THU-TU.md'
    return la_doc_cl12(p)


_trich = None


def ma_trich_duoc(x):
    """Mã hay file#mục mà scripts/trich.py tìm được."""
    global _trich
    if _trich is None:
        import importlib.util
        spec = importlib.util.spec_from_file_location('trich', os.path.join(ROOT, 'scripts/trich.py'))
        _trich = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_trich)
    try:
        _trich.trich(x)
        return True
    except Exception:
        return False


def kiem_muc_doc(p, t, bao):
    """Luật doc-ma: mục ## Đọc của US, BG chỉ ghi mã mà trich.py tìm được (CL14.4)."""
    lines = t.split('\n')
    try:
        i0 = next(i for i, l in enumerate(lines) if re.match(r'^##\s+Đọc\s*$', l))
    except StopIteration:
        return
    for i in range(i0 + 1, len(lines)):
        l = lines[i].strip()
        if l.startswith('## '):
            break
        if not l or l.startswith('<!--'):
            continue
        l = re.sub(r'^[-*]\s+', '', l)
        cac = [l] if '#' in l else [x for x in re.split(r'[\s,·]+', l) if x]
        for x in cac:
            if not ma_trich_duoc(x):
                bao.them(p, i + 1, 'doc-ma', f'mục Đọc: "{x[:60]}" không phải mã trich.py tìm được. Ghi mã (YC5.2, PQ5, S2, thiet-ke-db.md), mỗi file#mục một dòng')


def kiem_file(repo, p, bao, dong_moi=None, doc_ma=False):
    """dong_moi: None = mọi dòng; set = chỉ các dòng mới thêm (luật [MỞ])."""
    t = repo.files.get(p)
    if t is None:
        return
    fm = repo.fm.get(p)
    if p in repo.fm_loi and (can_dau_file(p) or t.startswith('---')):
        bao.them(p, 1, 'front-matter', repo.fm_loi[p])
    la_item = p.startswith('work/backlog/') and os.path.basename(p) != 'THU-TU.md'
    if fm is not None:
        tt = fm.get('trang_thai')
        tt = str(tt).strip() if tt is not None else None
        if la_item:
            if not fm.get('id'):
                bao.them(p, 1, 'front-matter', 'item thiếu id')
            if tt not in TT_ITEM:
                bao.them(p, 1, 'trang-thai', f'trạng thái item "{tt}" không hợp lệ ({", ".join(sorted(TT_ITEM))})')
            elif tt == 'xong' and not p.startswith('work/backlog/done/'):
                bao.them(p, 1, 'xong-ngoai-done', f'{fm.get("id")} đã xong, chuyển vào work/backlog/done/')
            for truong in ('cha', 'truoc', 'thuc_hien'):
                for x in as_list(fm.get(truong)):
                    code = x.split('@')[0].strip()
                    if not repo.co_ma(code):
                        bao.them(p, 1, 'lien-ket', f'{truong}: {code} không có trong repo')
        elif la_doc_cl12(p) and tt is not None and tt not in TT_DOCS:
            bao.them(p, 1, 'trang-thai', f'trạng thái tài liệu "{tt}" không hợp lệ ({", ".join(sorted(TT_DOCS))})')
    if doc_ma and la_item and re.match(r'^(US|BG)\d+-', os.path.basename(p)) and not p.startswith('work/backlog/done/'):
        kiem_muc_doc(p, t, bao)
    if doc_ma and la_item and not p.startswith('work/backlog/done/') and len(t) > ITEM_DAI:
        bao.them(p, 1, 'item-dai', f'file item {len(t):,} ký tự, quá {ITEM_DAI:,} (khoảng 3.000 token). Task xong rút còn một dòng mã và PR, '
                 'xóa Kế hoạch của task đã xong, Bằng chứng chỉ giữ lệnh và kết quả ngắn')
    if p.endswith('.md') and not p.startswith(META) and not p.startswith('docs/process/templates/'):
        for i, line in enumerate(bo_code(t), 1):
            if dong_moi is not None and i not in dong_moi:
                continue
            if '[MỞ' in line:
                kiem_mo(repo, p, i, line, bao)


def kiem_trung(repo, chon, bao):
    for code, defs in repo.ma.items():
        kieu = {k for _, _, k in defs}
        if kieu == {'man'} or len(defs) < 2:
            continue
        defs = [d for d in defs if d[2] != 'man']
        if len(defs) < 2:
            continue
        noi = ', '.join(f'{p}:{i}' for p, i, _ in defs)
        for p, i, _ in defs:
            if chon is None or p in chon:
                bao.them(p, i, 'trung-ma', f'{code} định nghĩa ở nhiều chỗ: {noi}')
                break


# ---------- so với BASE ----------

def file_doi(base, dau):
    gb = git('merge-base', base, dau).strip()
    out = git('diff', '--name-only', '--diff-filter=ACMR', gb, dau)
    return gb, [x for x in out.split('\n') if x]


def dong_doi(gb, dau, p):
    """Trả (tập số dòng mới thêm, danh sách (số dòng, dấu, nội dung) của dòng +/-)."""
    out = git('diff', '-U0', '--no-color', gb, dau, '--', p)
    them, cac = set(), []
    moi = 0
    for line in out.split('\n'):
        m = re.match(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@', line)
        if m:
            moi = int(m.group(1))
            continue
        if line.startswith('+++') or line.startswith('---'):
            continue
        if line.startswith('+'):
            them.add(moi)
            cac.append((moi, '+', nfc(line[1:])))
            moi += 1
        elif line.startswith('-'):
            cac.append((moi, '-', nfc(line[1:])))
    return them, cac


def rev_cua(text):
    fm, _, _ = tach_dau_file(text)
    if not fm or fm.get('rev') is None:
        return None
    try:
        return int(str(fm.get('rev')).strip())
    except ValueError:
        return None


def kiem_rev(gb, dau, p, bao):
    r = subprocess.run(['git', '-C', ROOT, 'show', f'{gb}:{p}'], capture_output=True, text=True)
    cu = nfc(r.stdout) if r.returncode == 0 else None
    r2 = subprocess.run(['git', '-C', ROOT, 'show', f'{dau}:{p}'], capture_output=True, text=True)
    moi = nfc(r2.stdout) if r2.returncode == 0 else None
    if moi is None:
        return
    rm = rev_cua(moi)
    if cu is None:
        if rm is None:
            bao.them(p, 1, 'rev', 'file mới trong docs/ thiếu rev (CL12.2)')
        return
    if cu == moi:
        return
    rc = rev_cua(cu)
    if rm is None:
        bao.them(p, 1, 'rev', 'file đổi nội dung nhưng thiếu rev (CL12.2)')
    elif rc is not None and rm <= rc:
        bao.them(p, 1, 'rev', f'file đổi nội dung mà rev vẫn {rm} (trước là {rc}): tăng rev, thêm dòng Lịch sử sửa đổi (CL12)')



# ---------- NT phải có test (EN8, QD25) ----------

TT_DA_LAM = {'cho-test', 'cho-nghiem-thu', 'xong'}
RE_NT_DINH_NGHIA = re.compile(r'^\s*[-*]\s+\*\*((?:YC|HV|QT|PQ)\d+(?:\.\d+)*-NT\d+)\*\*(.*)$')
RE_NT_TRONG_CAU = re.compile(r'((?:YC|HV|QT|PQ)\d+(?:\.\d+)*)-NT(\d+)((?:\s*(?:,|đến)\s*(?:NT\d+))*)')
LOP_THU_MUC = {
    'unit': ('src/', ('.test.ts', '.test.tsx')),
    'e2e': ('tests/e2e/', ('.spec.ts',)),
    'database': ('tests/db/', ('.sql',)),
}


def ds_nt(repo):
    """Mã NT -> (mục cha, tập lớp, đã bỏ?) đọc từ docs/."""
    out = {}
    for p, t in repo.files.items():
        if not p.startswith('docs/') or p.startswith(DOCS_MIEN):
            continue
        for line in t.splitlines():
            m = RE_NT_DINH_NGHIA.match(line)
            if not m:
                continue
            code, du = m.group(1), m.group(2)
            bo = '· bỏ]' in du
            lop = set()
            if '·' in du and not bo:
                for x in du.rsplit('·', 1)[1].split(','):
                    x = x.strip().lower().rstrip('.')
                    if x in LOP_THU_MUC:
                        lop.add(x)
            out[code] = (code.rsplit('-', 1)[0], lop, bo)
    return out


def nt_cua_item(text, fm, nt):
    can = set()
    for x in as_list(fm.get('thuc_hien')):
        muc = str(x).split('@')[0].strip()
        can |= {c for c, (cha, _, bo) in nt.items() if cha == muc and not bo}
    m = re.search(r'^## Làm tiêu chí nào\n(.*?)(?=^## |\Z)', text, re.S | re.M)
    if m:
        for g in RE_NT_TRONG_CAU.finditer(m.group(1)):
            goc, dau, duoi = g.group(1), int(g.group(2)), g.group(3)
            so = [dau]
            for k in re.finditer(r'(,|đến)\s*NT(\d+)', duoi):
                n = int(k.group(2))
                if k.group(1) == 'đến':
                    so += list(range(so[-1] + 1, n + 1))
                else:
                    so.append(n)
            for n in so:
                c = f'{goc}-NT{n}'
                if c in nt and not nt[c][2]:
                    can.add(c)
    return can


def doc_test():
    """Lớp -> [(đường dẫn, nội dung)] của các file test."""
    out = {k: [] for k in LOP_THU_MUC}
    for lop, (goc, duoi) in LOP_THU_MUC.items():
        d0 = os.path.join(ROOT, goc)
        for d, dirs, files in os.walk(d0):
            dirs[:] = [x for x in dirs if x != 'node_modules']
            for f in files:
                if f.endswith(duoi):
                    fp = os.path.join(d, f)
                    try:
                        out[lop].append((os.path.relpath(fp, ROOT), doc(os.path.relpath(fp, ROOT))))
                    except (UnicodeDecodeError, OSError):
                        pass
    return out


def kiem_nt_test(repo, bao):
    nt = ds_nt(repo)
    test = None
    for code, (p, fm) in sorted(repo.item.items()):
        fm = fm or {}
        tt = str(fm.get('trang_thai', ''))
        if not (tt in TT_DA_LAM or (tt == 'dang-lam' and as_list(fm.get('pr')))):
            continue
        can = nt_cua_item(repo.files.get(p, ''), fm, nt)
        if not can:
            continue
        if test is None:
            test = doc_test()
        for c in sorted(can):
            re_c = re.compile(re.escape(c) + r'(?!\d)')
            co = {lop for lop, ds in test.items() if any(re_c.search(t) for _, t in ds)}
            if not co:
                bao.them(p, 1, 'nt-test', f'{c} chưa có test nào mang mã này')
                continue
            thieu = sorted(nt[c][1] - co)
            if thieu:
                bao.them(p, 1, 'nt-test', f'{c} thiếu test lớp {", ".join(thieu)}')


def main(argv=None):
    ap = argparse.ArgumentParser(description='Kiểm repo Home247 (CL2, CL3, CL12).')
    ap.add_argument('paths', nargs='*', help='chỉ kiểm các file này')
    ap.add_argument('--chan', action='store_true', help='có lỗi thì thoát 1')
    ap.add_argument('--diff', metavar='BASE', help='chỉ kiểm file đổi so với BASE')
    ap.add_argument('--dau', default='HEAD', help='bản đem so với BASE (mặc định HEAD). Chỉ chọn file và dòng; nội dung vẫn đọc từ thư mục làm việc')
    ap.add_argument('--tom-tat', action='store_true', help='chỉ in số lỗi theo luật')
    a = ap.parse_args(argv)

    repo = Repo()
    bao = Bao()
    chon = None
    if a.paths:
        chon = set()
        for x in a.paths:
            x = os.path.relpath(os.path.abspath(x), ROOT) if os.path.exists(x) else x
            chon.add(x.replace(os.sep, '/'))
    dong_moi = {}
    gb = None
    if a.diff:
        gb, doi = file_doi(a.diff, a.dau)
        doi = set(doi)
        chon = doi if chon is None else (chon & doi)
    if chon is None:
        for p in repo.files:
            kiem_file(repo, p, bao)
    else:
        for p in sorted(chon):
            if not p.endswith('.md'):
                continue
            dm = None
            if a.diff:
                dm, cac = dong_doi(gb, a.dau, p)
                if la_doc_cl12(p):
                    kiem_rev(gb, a.dau, p, bao)
                if not p.startswith(META) and not p.startswith('scripts/'):
                    for so, dau, nd in cac:
                        if '[tự sinh]' in nd:
                            bao.them(p, so, 'tu-sinh', f'dòng [tự sinh] bị {"thêm/sửa" if dau == "+" else "xóa"} tay: chạy lại script sinh ra nó')
            kiem_file(repo, p, bao, dm, doc_ma=True)
    kiem_trung(repo, chon, bao)
    kiem_nt_test(repo, bao)

    dem = collections.Counter(l for _, _, l, _ in bao.loi)
    if not a.tom_tat:
        for p, i, luat, nd in sorted(bao.loi):
            print(f'{p}:{i}: [{luat}] {nd}')
    tong = sum(v for k, v in dem.items() if k not in CANH_BAO)
    cb = sum(v for k, v in dem.items() if k in CANH_BAO)
    if tong or cb:
        print(f'kiem.py: {tong} lỗi' + (f', {cb} cảnh báo (không chặn)' if cb else '') + ' · '
              + ', '.join(f'{k} {v}' for k, v in sorted(dem.items())))
    else:
        print('kiem.py: không có lỗi')
    return 1 if (a.chan and tong) else 0


if __name__ == '__main__':
    sys.exit(main())
