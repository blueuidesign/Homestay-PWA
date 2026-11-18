import { afterEach, expect, test, vi } from "vitest";
import { congMoPhong } from "./zalo";

afterEach(() => vi.unstubAllEnvs());

test("test_EN54_mo_phong_khong_co_token_thu_giu_gia_tri_cu", async () => {
  vi.stubEnv("VITE_ZALO_TOKEN_THU", "");
  const kq = await congMoPhong.xinTenVaSo();
  expect(kq).toEqual({ kq: "co", access_token: "mo-phong", token_sdt: "sdt:0900000101", ho_ten: "Nguyễn Hoa", anh_zalo: null });
});

test("test_EN54_mo_phong_co_token_thu_dung_cung_access_token_va_so_moi_moi_lan", async () => {
  vi.stubEnv("VITE_ZALO_TOKEN_THU", "thu:hoa");
  const dau = await congMoPhong.xinTenVaSo();
  const sau = await congMoPhong.xinTenVaSo();
  if (dau.kq !== "co" || sau.kq !== "co") throw new Error("phải ra co");
  expect(dau.access_token).toBe("thu:hoa");
  expect(await congMoPhong.layAccessToken()).toBe("thu:hoa");
  expect(dau.token_sdt).toMatch(/^sdt:0999\d{6}$/);
  expect(sau.token_sdt).toMatch(/^sdt:0999\d{6}$/);
  expect(dau.token_sdt).not.toBe(sau.token_sdt);
});
