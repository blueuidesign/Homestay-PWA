import React from "react";

// Dải xanh báo việc vừa xong, đầu nội dung: A7-01 ("✓ Đã gửi qua Zalo…"), A4-01 ("✓ Bạn đã cho Sale Hùng xem lịch…"). Chữ 14 px đậm.
export const DaiXanh = ({ chu }: { chu: string }) => (
  <div
    role="status"
    data-dai-xanh
    style={{
      borderRadius: "var(--radius-md)",
      background: "var(--action-tint)",
      color: "var(--action-ink)",
      border: "1px solid var(--action-ring)",
      padding: "10px 12px",
      font: "var(--text-body-strong)",
    }}
  >
    {chu}
  </div>
);
