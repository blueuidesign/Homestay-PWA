"""Test scripts/trich.py trên tài liệu giả dựng trong thư mục tạm (EN55).
Chạy: python3 -m unittest discover -s scripts/tests -v
"""
import os, shutil, subprocess, sys, tempfile, textwrap, unittest

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

YC = textwrap.dedent('''\
    ---
    id: YC4
    trang_thai: da-chot
    rev: 3
    ---
    # YC4 · Booking

    ## YC4.1 · Ghi booking
    Mở đầu YC4.1.
    ### YC4.1.1 · Kiểm trùng
    - YC4.1.1-NT1 Khi trùng thì báo (QT1.1).
      dòng tiếp của NT1
    - YC4.1.1-NT2 Khi không trùng thì lưu.

    ## YC4.2 · Chi tiết `[r3 · sửa]`
    Chi tiết theo QD21. [MỞ: QD2]
    ## Lịch sử sửa đổi
    | r1 | ... |
    ''')
QT = textwrap.dedent('''\
    ---
    id: QT1
    rev: 1
    ---
    # QT1 · Chặn trùng
    ## QT1.1 · Theo căn
    | Mã | Có | Ghi | Kết quả |
    |---|---|---|---|
    | QT1.1-VD1 | B1 | B2 | Từ chối |
    ## QT1.2 · Sửa
    Nội dung QT1.2.
    ''')
QD = textwrap.dedent('''\
    ---
    id: QD21
    tieu_de: Hủy đặt phòng
    trang_thai: da-chot
    nguoi_chu: tung
    rev: 3
    ---
    # QD21 · Hủy
    ## Phương án
    A hoặc B.
    ## Quyết định
    Chọn A.
    ## Lịch sử sửa đổi
    ''')
QD2 = '---\nid: QD2\ntieu_de: Mở\ntrang_thai: cho-chot\n---\n# QD2\n## Quyết định\nChưa chốt.\n'
SERVER = textwrap.dedent('''\
    # Thiết kế server
    ## 1. Nền chung
    ### 1.1 Công nghệ
    Node.
    ### 1.10 Giới hạn
    Mười.
    ### `GET /booking/:id`
    Chi tiết booking.
    ### `GET /booking/:id/lich`
    Khác.
    ''')


class TrichGia(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp()
        for rel, nd in [('docs/product/requirements/YC4-booking.md', YC), ('docs/product/rules/QT1-chan-trung.md', QT),
                        ('docs/decisions/QD21-huy.md', QD), ('docs/decisions/QD2-mo.md', QD2),
                        ('docs/architecture/server.md', SERVER)]:
            p = os.path.join(self.d, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'w', encoding='utf-8') as f:
                f.write(nd)
        os.makedirs(os.path.join(self.d, 'scripts'))
        shutil.copy(os.path.join(GOC, 'scripts/trich.py'), os.path.join(self.d, 'scripts'))

    def tearDown(self):
        shutil.rmtree(self.d)

    def chay(self, *a):
        r = subprocess.run([sys.executable, os.path.join(self.d, 'scripts/trich.py'), *a], capture_output=True, text=True)
        return r.returncode, r.stdout, r.stderr

    def khoi(self, out, ten):
        """Nội dung khối ===== ten · ... ===== (tới khối kế)."""
        dau = out.index(f'===== {ten} · ')
        sau = out.find('=====', out.index('\n', dau))
        return out[dau:sau]

    def test_muc_dung_o_tieu_de_cung_cap(self):
        ma, out, _ = self.chay('--khong-theo', 'YC4.1')
        self.assertEqual(ma, 0)
        k = self.khoi(out, 'YC4.1')
        self.assertIn('YC4.1.1-NT2', k)          # mục con cấp thấp hơn vẫn thuộc YC4.1
        self.assertNotIn('YC4.2', k)

    def test_muc_cap_ba(self):
        k = self.khoi(self.chay('--khong-theo', 'YC4.1.1')[1], 'YC4.1.1')
        self.assertIn('NT1', k)
        self.assertNotIn('Mở đầu YC4.1', k)

    def test_dong_nt_kem_dong_thut(self):
        k = self.khoi(self.chay('--khong-theo', 'YC4.1.1-NT1')[1], 'YC4.1.1-NT1')
        self.assertIn('dòng tiếp của NT1', k)
        self.assertNotIn('NT2', k)

    def test_vd_trong_bang(self):
        k = self.khoi(self.chay('--khong-theo', 'QT1.1-VD1')[1], 'QT1.1-VD1')
        self.assertIn('Từ chối', k)

    def test_qd_chi_phan_quyet_dinh(self):
        k = self.khoi(self.chay('--khong-theo', 'QD21')[1], 'QD21')
        self.assertIn('trang_thai: da-chot', k)
        self.assertIn('Chọn A', k)
        self.assertNotIn('A hoặc B', k)
        self.assertNotIn('nguoi_chu', k)

    def test_file_muc_theo_dau_chuoi_khong_nham_1_10(self):
        k = self.khoi(self.chay('--khong-theo', 'server.md#1.1')[1], 'server.md#1.1')
        self.assertIn('Node.', k)
        self.assertNotIn('Mười', k)

    def test_file_muc_api(self):
        k = self.khoi(self.chay('--khong-theo', 'docs/architecture/server.md#GET /booking/:id')[1],
                      'docs/architecture/server.md#GET /booking/:id')
        self.assertIn('Chi tiết booking', k)
        self.assertNotIn('Khác', k)

    def test_theo_mot_bac(self):
        ma, out, _ = self.chay('YC4.2')
        self.assertIn('===== QD21 · ', out)       # QD nhắc trong đoạn
        self.assertIn('===== QD2 · ', out)        # đích [MỞ: QD2]
        self.assertNotIn('===== QT1.1 · ', out)   # QT1.1 nằm ở YC4.1, không phải YC4.2

    def test_khong_theo(self):
        out = self.chay('--khong-theo', 'YC4.2')[1]
        self.assertNotIn('===== QD21 · ', out)

    def test_luon_in_muc_luc(self):
        out = self.chay('--khong-theo', 'QT1.2')[1]
        self.assertIn('===== Mục lục docs/product/rules/QT1-chan-trung.md =====', out)
        self.assertIn('QT1.1 · Theo căn', out)

    def test_ma_khong_co_thoat_2(self):
        ma, _, err = self.chay('YC9.9')
        self.assertEqual(ma, 2)
        self.assertIn('không tìm thấy YC9.9', err)

    def test_nt_viet_ngan_tim_o_muc_con(self):
        ma, out, _ = self.chay('--khong-theo', 'YC4.1-NT2')
        self.assertEqual(ma, 0)
        self.assertIn('YC4.1.1-NT2 Khi không trùng', out)

    def test_file_muc_bo_qua_lich_su(self):
        p = os.path.join(self.d, 'docs/_lich-su/architecture/server.md')
        os.makedirs(os.path.dirname(p))
        with open(p, 'w', encoding='utf-8') as f:
            f.write('# cũ\n## 1. Nền chung\n### 1.1 Cũ\n')
        ma, out, err = self.chay('--khong-theo', 'server.md#1.1')
        self.assertEqual(ma, 0, err)
        self.assertIn('Node.', out)

    def test_ma_la_van_in_phan_tim_duoc(self):
        ma, out, err = self.chay('--khong-theo', 'YC4.2', 'YC9.9')
        self.assertEqual(ma, 2)
        self.assertIn('Chi tiết theo QD21', out)
        self.assertIn('không tìm thấy YC9.9', err)

    def test_gon_bo_the_rev_va_lich_su(self):
        out = self.chay('--khong-theo', '--gon', 'YC4')[1]
        self.assertNotIn('[r3', out.split('===== Mục lục')[0])
        self.assertNotIn('| r1 |', out)

    def test_qt_tran_in_ca_quy_tac_khong_lap(self):
        p = os.path.join(self.d, 'docs/product/requirements/YC4-booking.md')
        with open(p, 'a', encoding='utf-8') as f:
            f.write('')
        s = open(p, encoding='utf-8').read().replace('Mở đầu YC4.1.', 'Mở đầu YC4.1 theo QT1.')
        open(p, 'w', encoding='utf-8').write(s)
        out = self.chay('YC4.1')[1]
        k = self.khoi(out, 'QT1')
        self.assertIn('QT1.2 · Sửa', k)            # mã trần: cả quy tắc
        self.assertNotIn('===== QT1.1 · ', out)    # QT1.1 đã nằm trong QT1, không in lại

    def test_hv_chi_kem_khi_co_man(self):
        hv = '# HV\n## HV4 · Quyền\nXin quyền.\n'
        p = os.path.join(self.d, 'docs/product/system-behaviors.md')
        open(p, 'w', encoding='utf-8').write(hv)
        p = os.path.join(self.d, 'docs/product/requirements/YC4-booking.md')
        s = open(p, encoding='utf-8').read().replace('Chi tiết theo QD21.', 'Chi tiết theo QD21, HV4.')
        open(p, 'w', encoding='utf-8').write(s)
        out = self.chay('YC4.2')[1]
        self.assertNotIn('===== HV4 · ', out)
        open(p, 'w', encoding='utf-8').write(s.replace('Chi tiết theo QD21, HV4.', 'Màn hình: S2\nChi tiết theo QD21, HV4.'))
        self.assertIn('===== HV4 · ', self.chay('YC4.2')[1])

    def test_phan_chi_in_phan_chon_cua_api(self):
        p = os.path.join(self.d, 'docs/architecture/api/sale.md')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'w', encoding='utf-8').write(textwrap.dedent('''\
            # API sale
            ### `GET /sale/tim`
            Tìm căn trống.
            **Ai gọi:** SALE.
            **Đầu vào**
            | ngay | query |
            **Đầu ra**
            | can | danh sách |
            **Lỗi riêng**
            | KHONG_TIM_THAY | x |
            **Dữ liệu**
            - Đọc: can.id
            **Ví dụ**
            {}
            ### `GET /sale/khac`
            Khác.
            '''))
        ma, out, err = self.chay('--khong-theo', '--phan', 'dau-vao,loi', 'api/sale.md#GET /sale/tim')
        self.assertEqual(ma, 0, err)
        self.assertIn('Tìm căn trống.', out)
        self.assertIn('| ngay | query |', out)
        self.assertIn('KHONG_TIM_THAY', out)
        self.assertNotIn('can.id', out)
        self.assertNotIn('| can | danh sách |', out)
        self.assertNotIn('Ai gọi', out.split('(chỉ in')[0])
        self.assertEqual(self.chay('--phan', 'sai', 'YC4.2')[0], 2)

    def test_cau_hoi_khi_chua_co_file(self):
        ma, _, err = self.chay('YC4-H6')
        self.assertEqual(ma, 2)
        self.assertIn('chưa có work/cau-hoi.md', err)


if __name__ == '__main__':
    unittest.main()
