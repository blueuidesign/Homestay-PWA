import { describe, expect, it } from "vitest";
import { cauLoi, coSupabase } from "./supabase";

describe("kết nối Supabase", () => {
  it("không có biến môi trường thì app chạy bằng dữ liệu mẫu", () => {
    expect(coSupabase()).toBe(false);
  });
  it("lỗi P0001 của hàm fn_* hiện nguyên câu tiếng Việt", () => {
    expect(cauLoi({ code: "P0001", message: "Căn này đã được đặt rồi" })).toBe("Căn này đã được đặt rồi");
  });
  it("lỗi khác hiện câu chung, không hiện chữ kỹ thuật", () => {
    expect(cauLoi({ code: "42501", message: "permission denied for table booking" })).toBe("Có lỗi xảy ra. Bạn thử lại sau ít phút.");
    expect(cauLoi(null)).toBe("Có lỗi xảy ra. Bạn thử lại sau ít phút.");
  });
});
