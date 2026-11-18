"""Test scripts/goi.py trên repo giả trong thư mục tạm (EN64).
Chạy: python3 -m unittest discover -s scripts/tests -v
"""
import os, shutil, subprocess, sys, tempfile, textwrap, unittest

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

FILES = {
    'CLAUDE.md': '# H\n## Home247 khác app đặt phòng thông thường\n- Hai lớp giá.\n## Ràng buộc Zalo (chi tiết)\n- Không link ra ngoài.\n## Khác\nx\n',
    '.claude/rules/code.md': '---\npaths: ["src/**"]\n---\n# Quy ước code\n- Tiền là số nguyên.\n',
    'docs/product/requirements/YC5-tim.md': textwrap.dedent('''\
        ---
        id: YC5
        rev: 2
        ---
        # YC5 · Tìm
        ## YC5.2 · Tìm phòng `[r2 · sửa]`
        Màn hình: S2
        Dùng quy tắc QT2.1. Theo QD21. [MỞ: QD2]
        - YC5.2-NT1 Khi chọn ngày thì thấy căn trống.
        ## Lịch sử sửa đổi
        | r1 | x |
        '''),
    'docs/product/rules/QT2-dem.md': '---\nid: QT2\n---\n# QT2 · Đêm\n## QT2.1 · Đêm\n| QT2.1-VD1 | 10 → 12 | 2 đêm |\n',
    'docs/decisions/QD21-a.md': '---\nid: QD21\ntrang_thai: da-chot\n---\n# QD21\n## Phương án\nA hay B\n## Quyết định\nChọn A.\n',
    'docs/decisions/QD2-b.md': '---\nid: QD2\ntrang_thai: cho-chot\n---\n# QD2\n## Quyết định\nChưa chốt.\n',
    'docs/design/screens/S2.md': '# S2 · Kết quả\n## Thành phần\nThẻ căn.\n',
    'docs/architecture/api/sale.md': '# API sale\n## `GET /sale/tim`\nĐầu vào: ngày.\n## `GET /sale/khac`\nKhác.\n',
    'work/backlog/US12-tim.md': textwrap.dedent('''\
        ---
        id: US12
        tieu_de: Sale tìm phòng
        loai: US
        trang_thai: dang-lam
        thuc_hien: [YC5.2@2]
        ---
        ## Làm tiêu chí nào
        YC5.2-NT1
        ## Phạm vi
        src/miniapp/pages/tim/
        ## Đọc
        YC5.2 S2
        api/sale.md#GET /sale/tim
        ## Task
        - [x] US12-TA1 Code · Claude Code (opus): API
        - [ ] US12-TA2 Code · Claude Code (sonnet): màn S2
        - [ ] US12-TA3 Test tay · Đức: kịch bản
        '''),
}


class GoiGia(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp()
        for rel, nd in FILES.items():
            p = os.path.join(self.d, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'w', encoding='utf-8') as f:
                f.write(nd)
        os.makedirs(os.path.join(self.d, 'scripts'), exist_ok=True)
        for s in ('trich.py', 'goi.py'):
            shutil.copy(os.path.join(GOC, 'scripts', s), os.path.join(self.d, 'scripts'))

    def tearDown(self):
        shutil.rmtree(self.d)

    def chay(self, *a):
        r = subprocess.run([sys.executable, os.path.join(self.d, 'scripts/goi.py'), *a], capture_output=True, text=True)
        return r.returncode, r.stdout, r.stderr

    def test_goi_du_cac_o_may_dien_duoc(self):
        ma, out, err = self.chay('US12')
        self.assertEqual(ma, 0, err)
        self.assertIn('YC5.2-NT1 Khi chọn ngày', out)           # NT chép nguyên văn
        self.assertIn('QT2.1-VD1', out)                         # ví dụ số kèm theo
        self.assertIn('Chọn A.', out)                           # mục Quyết định
        self.assertNotIn('A hay B', out)                        # không chép bảng phương án
        self.assertIn('Đầu vào: ngày.', out)                    # đúng API
        self.assertNotIn('Khác.', out)
        self.assertIn('Thẻ căn.', out)                          # màn
        self.assertIn('Hai lớp giá', out)                       # bất biến từ CLAUDE.md
        self.assertIn('Tiền là số nguyên', out)                 # quy ước code
        self.assertIn('[MỞ: QD2]: không làm phần này', out)
        self.assertIn('src/miniapp/pages/tim/', out)            # Được sửa lấy từ Phạm vi
        self.assertNotIn('[r2 · sửa]', out)                     # --gon
        self.assertNotIn('\n## Thành phần', out)                # tiêu đề nguồn đã hạ cấp

    def test_chi_task_code_chua_xong_va_model(self):
        out = self.chay('US12')[1]
        self.assertIn('task: [US12-TA2]', out)
        self.assertIn('model: sonnet', out)

    def test_bao_o_dien_tay(self):
        err = self.chay('US12')[2]
        self.assertIn('Làm theo mẫu', err)
        self.assertNotIn('Được sửa', err)

    def test_ghi_file(self):
        ma, out, _ = self.chay('US12', '--ghi')
        self.assertEqual(ma, 0)
        self.assertTrue(os.path.exists(os.path.join(self.d, 'work/goi/US12.md')))


if __name__ == '__main__':
    unittest.main()
