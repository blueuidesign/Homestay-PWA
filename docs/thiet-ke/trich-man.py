#!/usr/bin/env python3
"""In phần HTML của một màn trong canvas, không phải đọc cả file 2,6 MB.

Chạy:
  python3 docs/thiet-ke/trich-man.py CN3-02              in HTML của màn (khối có id="CN3-02": nhãn và khung điện thoại)
  python3 docs/thiet-ke/trich-man.py CN3-02 --chu        chỉ in chữ hiện trên màn, mỗi đoạn một dòng
  python3 docs/thiet-ke/trich-man.py CN3-02 --anh /tmp/CN3-02.png   chụp riêng màn đó bằng Playwright
Mã không có trong canvas: thoát 2. Điều hình không nói được (vào từ đâu, bấm gì sang đâu) nằm trong story của màn đó.

Cách tìm màn: khối có id đúng bằng mã; không có thì khối mang data-screen-label bắt đầu bằng mã.
Ảnh chụp: mở cả canvas trong Chromium rồi chụp đúng phần tử đó (element screenshot), nên ảnh chỉ
có màn đó. Giới hạn: canvas là ảnh dựng sẵn, không chạy tương tác; hộp thoại hay trạng thái chỉ có
khi canvas vẽ thành màn riêng. Mở trang mất vài giây vì file lớn.
"""
import argparse, html, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CANVAS = os.path.join(ROOT, 'canvas/home247-canvas.html')
RONG = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
RE_THE = re.compile(r'<(/?)([a-zA-Z][\w:-]*)\b[^>]*?(/?)>', re.S)


def vi_tri_mo(s, ma):
    m = re.search(r'<[a-zA-Z][^>]*\sid="' + re.escape(ma) + r'"[^>]*>', s)
    if m:
        return m.start(), f'id="{ma}"'
    m = re.search(r'<[a-zA-Z][^>]*\sdata-screen-label="' + re.escape(ma) + r'(?:\s[^"]*)?"[^>]*>', s)
    if m:
        return m.start(), 'data-screen-label'
    return None, None


def cat_phan_tu(s, start):
    """Từ thẻ mở ở start, tìm thẻ đóng tương ứng bằng cách đếm độ sâu."""
    sau = 0
    for m in RE_THE.finditer(s, start):
        dong, ten, tu_dong = m.group(1), m.group(2).lower(), m.group(3)
        if ten in RONG or tu_dong:
            if sau == 0:
                return s[start:m.end()]
            continue
        sau += -1 if dong else 1
        if sau == 0:
            return s[start:m.end()]
    raise SystemExit('trich-man.py: không tìm thấy thẻ đóng của màn')


def chu_hien(frag):
    frag = re.sub(r'<svg\b.*?</svg>', ' ', frag, flags=re.S)
    frag = re.sub(r'<(?:div|p|li|h\d|button|section|nav|header|footer|label|tr)\b', '\n<', frag)
    t = html.unescape(re.sub(r'<[^>]+>', ' ', frag))
    return [re.sub(r'\s+', ' ', x).strip() for x in t.split('\n') if x.strip()]


def chup(ma, out):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit('trich-man.py: chưa cài playwright cho Python (pip install playwright)')
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
        pg.goto('file://' + CANVAS, wait_until='load', timeout=60000)
        el = pg.locator(f'[id="{ma}"]')
        if el.count() == 0:
            el = pg.locator(f'[data-screen-label^="{ma} "]')
        el.first.screenshot(path=out)
        b.close()


def main(argv=None):
    ap = argparse.ArgumentParser(description='In HTML hoặc chụp một màn của canvas.')
    ap.add_argument('ma')
    ap.add_argument('--chu', action='store_true', help='chỉ in chữ hiện trên màn')
    ap.add_argument('--anh', metavar='OUT.png', help='chụp màn ra file PNG bằng Playwright')
    a = ap.parse_args(argv)

    s = open(CANVAS, encoding='utf-8').read()
    start, cach = vi_tri_mo(s, a.ma)
    if start is None:
        print(f'trich-man.py: không có màn {a.ma} trong canvas', file=sys.stderr)
        return 2
    frag = cat_phan_tu(s, start)
    print(f'<!-- màn {a.ma} · tìm theo {cach} · {len(frag):,} ký tự · story của màn: grep -rln "{a.ma}" docs/stories/ -->')
    print('\n'.join(chu_hien(frag)) if a.chu else frag)
    if a.anh:
        chup(a.ma, a.anh)
        print(f'<!-- đã chụp {a.anh} -->')
    return 0


if __name__ == '__main__':
    sys.exit(main())
