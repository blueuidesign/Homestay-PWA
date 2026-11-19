"""Test scripts/kiem.py trên một repo giả dựng trong thư mục tạm (EN55).
Chạy: python3 -m unittest discover -s scripts/tests -v
"""
import os, shutil, subprocess, sys, tempfile, textwrap, unittest

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def item(id_, tt='moi', **them):
    dong = [f'id: {id_}', f'tieu_de: Việc {id_}', 'loai: ' + id_[:2], f'trang_thai: {tt}', 'cha: EP1']
    dong += [f'{k}: {v}' for k, v in them.items()]
    return '---\n' + '\n'.join(dong) + '\n---\n## Mục tiêu\nThử.\n'


class RepoGia(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.d, 'scripts'))
        shutil.copy(os.path.join(GOC, 'scripts/kiem.py'), os.path.join(self.d, 'scripts'))
        self.ghi('work/backlog/EP1-nen.md', item('EP1'))
        self.ghi('docs/decisions/QD1-a.md', '---\nid: QD1\ntrang_thai: da-chot\nrev: 1\n---\n# QD1 · A\n')
        self.ghi('docs/decisions/QD2-b.md', '---\nid: QD2\ntrang_thai: cho-chot\nrev: 1\n---\n# QD2 · B\n')
        self.ghi('docs/product/requirements/YC4-booking.md', textwrap.dedent('''\
            ---
            id: YC4
            trang_thai: da-chot
            rev: 1
            ---
            # YC4 · Booking
            ## YC4.1 · Ghi booking
            - YC4.1-NT1 Khi lưu thì thấy.
            '''))

    def tearDown(self):
        shutil.rmtree(self.d)

    def ghi(self, rel, nd):
        p = os.path.join(self.d, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            f.write(nd)

    def chay(self, *a):
        r = subprocess.run([sys.executable, os.path.join(self.d, 'scripts/kiem.py'), *a],
                           capture_output=True, text=True, cwd=self.d)
        return r.returncode, r.stdout

    def git(self, *a):
        subprocess.run(['git', '-C', self.d, *a], check=True, capture_output=True,
                       env=dict(os.environ, GIT_AUTHOR_NAME='t', GIT_AUTHOR_EMAIL='t@t', GIT_COMMITTER_NAME='t', GIT_COMMITTER_EMAIL='t@t'))

    # ---- luật toàn repo ----
    def test_repo_sach_khong_loi(self):
        self.ghi('work/backlog/US1-a.md', item('US1', 'dang-lam', truoc='[EP1]', thuc_hien='[YC4.1@1]'))
        ma, out = self.chay('--chan')
        self.assertEqual(ma, 0, out)
        self.assertIn('không có lỗi', out)

    def test_trang_thai_item_sai(self):
        self.ghi('work/backlog/US1-a.md', item('US1', 'trong-sprint'))
        ma, out = self.chay('--chan')
        self.assertEqual(ma, 1)
        self.assertIn('[trang-thai]', out)

    def test_mac_dinh_chi_canh_bao(self):
        self.ghi('work/backlog/US1-a.md', item('US1', 'la'))
        ma, out = self.chay()
        self.assertEqual(ma, 0)
        self.assertIn('[trang-thai]', out)

    def test_trang_thai_tai_lieu_sai(self):
        self.ghi('docs/product/rules/QT1-a.md', '---\nid: QT1\ntrang_thai: chot-roi\nrev: 1\n---\n# QT1 · A\n')
        self.assertIn('[trang-thai]', self.chay()[1])

    def test_xong_ngoai_done(self):
        self.ghi('work/backlog/US1-a.md', item('US1', 'xong'))
        self.ghi('work/backlog/done/2026-11/US2-b.md', item('US2', 'xong'))
        out = self.chay()[1]
        self.assertIn('US1-a.md:1: [xong-ngoai-done]', out)
        self.assertNotIn('US2-b.md:1: [xong-ngoai-done]', out)

    def test_lien_ket_khong_co(self):
        self.ghi('work/backlog/US1-a.md', item('US1', truoc='[US99]', thuc_hien='[YC4.9@1]'))
        out = self.chay()[1]
        self.assertIn('truoc: US99 không có', out)
        self.assertIn('thuc_hien: YC4.9 không có', out)

    def test_dau_file_yaml_loi(self):
        self.ghi('work/backlog/US1-a.md', '---\nid: US1\ntieu_de: A: b: c\ntrang_thai: moi\n---\n')
        self.assertIn('[front-matter]', self.chay()[1])

    def test_item_thieu_dau_file(self):
        self.ghi('work/backlog/US1-a.md', '\n- nhật ký\n')
        self.assertIn('[front-matter] thiếu đầu file', self.chay()[1])

    def test_trung_ma(self):
        self.ghi('work/backlog/US1-a.md', item('US1'))
        self.ghi('work/backlog/US1-b.md', item('US1'))
        self.assertIn('[trung-ma] US1', self.chay()[1])

    # ---- [MỞ] ----
    def mo(self, dong):
        self.ghi('docs/product/requirements/YC5-x.md', f'---\nid: YC5\ntrang_thai: de-xuat\nrev: 1\n---\n# YC5 · X\n{dong}\n')
        return [l for l in self.chay()[1].split('\n') if '[mo]' in l]

    def test_mo_qd_cho_chot_hop_le(self):
        self.assertEqual(self.mo('Câu này [MỞ: QD2].'), [])

    def test_mo_qd_da_chot_loi(self):
        self.assertIn('QD đã đóng', self.mo('Câu [MỞ: QD1].')[0])

    def test_mo_chu_tu_do_loi(self):
        self.assertIn('chữ tự do', self.mo('Câu [MỞ: server.md chưa có].')[0])

    def test_mo_thieu_ma_loi(self):
        self.assertIn('thiếu mã', self.mo('Câu [MỞ].')[0])

    def test_mo_item_chua_xong_hop_le_va_da_xong_loi(self):
        self.ghi('work/backlog/DC1-a.md', item('DC1', 'dang-lam'))
        self.ghi('work/backlog/done/SK1-a.md', item('SK1', 'xong'))
        self.assertEqual(self.mo('A [MỞ: DC1].'), [])
        self.assertIn('item đã đóng', self.mo('A [MỞ: SK1].')[0])

    def test_mo_ma_khong_mo_duoc(self):
        self.assertIn('không phải mã mở được', self.mo('A [MỞ: YC4.1].')[0])

    def test_mo_trong_code_bo_qua(self):
        self.assertEqual(self.mo('Ví dụ `[MỞ: chữ]` trong code.'), [])

    def test_mo_cau_hoi_khi_chua_co_file_thi_bo_qua(self):
        self.assertEqual(self.mo('A [MỞ: YC4-H6].'), [])

    def test_mo_cau_hoi_theo_work_cau_hoi(self):
        self.ghi('work/cau-hoi.md', '| Mã | Câu | Trạng thái |\n|---|---|---|\n| YC4-H6 | A? | mo |\n| YC4-H7 | B? | da-tra-loi |\n')
        self.assertEqual(self.mo('A [MỞ: YC4-H6].'), [])
        self.assertIn('câu hỏi đã đóng', self.mo('A [MỞ: YC4-H7].')[0])
        self.assertIn('không có trong work/cau-hoi.md', self.mo('A [MỞ: YC4-H8].')[0])

    def test_mo_cau_hoi_dang_tieu_de(self):
        self.ghi('work/cau-hoi.md', '## YC4\n\n### YC4-H6 · mo\nA?\n\n### YC4-H7 · da-tra-loi\nB?\n\n### YC4-H8 · mot-phan\nC?\n')
        self.assertEqual(self.mo('A [MỞ: YC4-H6].'), [])
        self.assertIn('câu hỏi đã đóng', self.mo('A [MỞ: YC4-H7].')[0])
        self.assertEqual(self.mo('A [MỞ: YC4-H8].'), [])

    # ---- --diff ----
    def test_diff_rev_mo_va_tu_sinh(self):
        self.ghi('docs/product/requirements/YC5-x.md',
                 '---\nid: YC5\ntrang_thai: de-xuat\nrev: 2\n---\n# YC5 · X\nCũ [MỞ: chữ cũ].\nDòng [tự sinh] a\n')
        self.git('init', '-q', '-b', 'main')
        self.git('add', '-A')
        self.git('commit', '-q', '-m', 'goc')
        self.ghi('docs/product/requirements/YC5-x.md',
                 '---\nid: YC5\ntrang_thai: de-xuat\nrev: 2\n---\n# YC5 · X\nCũ [MỞ: chữ cũ].\nMới [MỞ: chữ mới].\nDòng [tự sinh] b\n')
        self.git('commit', '-q', '-am', 'sua')
        ma, out = self.chay('--chan', '--diff', 'HEAD~1')
        self.assertEqual(ma, 1)
        self.assertIn('[rev]', out)
        self.assertIn('chữ mới', out)
        self.assertNotIn('chữ cũ', out)          # dòng cũ không bị chặn
        self.assertIn('[tu-sinh]', out)
        # chỉ kiểm file đã đổi: EP1 không có trong danh sách
        self.assertNotIn('EP1', out)

    def test_diff_rev_tang_thi_qua(self):
        self.git('init', '-q', '-b', 'main')
        self.git('add', '-A')
        self.git('commit', '-q', '-m', 'goc')
        p = os.path.join(self.d, 'docs/product/requirements/YC4-booking.md')
        s = open(p, encoding='utf-8').read().replace('rev: 1', 'rev: 2') + '- YC4.1-NT2 Mới.\n'
        self.ghi('docs/product/requirements/YC4-booking.md', s)
        self.git('commit', '-q', '-am', 'sua')
        ma, out = self.chay('--chan', '--diff', 'HEAD~1')
        self.assertEqual(ma, 0, out)

    def test_diff_lich_su_khong_can_rev(self):
        self.git('init', '-q', '-b', 'main')
        self.git('add', '-A')
        self.git('commit', '-q', '-m', 'goc')
        self.ghi('docs/_lich-su/product/requirements/YC4-booking.md', '# Lịch sử cũ\n\n| Rev | Ngày |\n|---|---|\n| r1 | 2026-10-01 |\n')
        self.git('add', '-A')
        self.git('commit', '-q', '-m', 'lich su')
        ma, out = self.chay('--chan', '--diff', 'HEAD~1')
        self.assertEqual(ma, 0, out)


if __name__ == '__main__':
    unittest.main()
