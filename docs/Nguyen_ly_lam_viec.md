# Nguyên lý làm việc với AI viết code

Đúc kết ngày 18/11/2026 từ hai dự án: Kho BaBa (nhỏ, làm nhanh, ít tài liệu) và Home247 bản Zalo (lớn, nhiều tài liệu, làm chậm). Dùng cho Home247 bản PWA và các dự án sau.

## Một câu

Luôn giữ hai thứ độc lập để đối chiếu nhau, giữ thứ dùng để đối chiếu ở dạng rẻ nhất, và mỗi thông tin chỉ nằm ở một chỗ.

## Vấn đề gốc

Một thứ đứng một mình thì không tự biết mình sai. Code sai vẫn chạy. Tài liệu sai vẫn đọc trôi. AI viết code rất nhanh và rất tự tin, nên lỗi cũng được tạo ra nhanh và trông rất giống đúng.

Hai dự án hỏng theo hai kiểu ngược nhau:

- **Kiểu Kho BaBa: chỉ có code.** Code là sự thật, nên lỗi nào lọt vào cũng thành luật. Với app nhỏ, lỗi hiện ngay trên màn nên vẫn ổn. Với app có quyền và tiền như Home247 thì lỗi nặng nhất không hiện trên màn: sale đọc được khách của chủ nhà, khách thấy giá chủ nhà, hai đặt phòng chồng đêm. Màn vẫn đẹp, code vẫn chạy.
- **Kiểu Home247 bản Zalo: quá nhiều tài liệu.** Một quy tắc được viết ở năm, bảy chỗ. Mỗi lần đổi ý phải sửa hết, và luôn sót. Việc bỏ công tắc giá đã chốt từ 04/11 mà hai tuần sau vẫn còn hơn 20 chỗ ghi cách cũ. AI đọc phải chỗ cũ thì code theo chỗ cũ.

Cả hai kiểu đều thiếu cùng một thứ: một cặp đối chiếu đáng tin.

## Nguyên lý 1 (gốc): hai thứ độc lập để đối chiếu

Lỗi chỉ lộ ra khi hai thứ nói khác nhau. Giống sổ kế toán kép: mỗi khoản ghi ở hai sổ, lệch là biết có lỗi dù chưa biết lỗi ở sổ nào.

Trong dự án, cặp đối chiếu là **ý định** (phải làm gì) và **code** (đang làm gì). Ý định được viết thành test. Test đỏ nghĩa là hai bên lệch nhau.

Ba điều kiện, thiếu một là cặp đối chiếu mất tác dụng:

1. **Độc lập về nguồn.** Test viết từ tiêu chí nghiệm thu, trước khi có code. Nếu nhìn code mà viết test thì test chép lại đúng cái sai của code, hai bên luôn khớp.
2. **Kiểm cả thứ đối chiếu.** Test viết sai thì xanh mãi. Cố tình phá một luật trong code: test vẫn xanh nghĩa là test không kiểm luật đó.
3. **Có danh sách để biết còn thiếu gì.** Test không tự biết quy tắc nào chưa có test. Danh sách tiêu chí nghiệm thu làm việc này: mỗi tiêu chí một test mang mã của nó.

Giới hạn: test xanh chỉ chứng minh những gì đã viết ra. Quy tắc bị quên thì không ai bắt. Và có những thứ máy không kiểm được (dễ dùng không, chữ dễ hiểu không, bấm một tay được không), phần đó cần người thử trên điện thoại thật.

Các nguyên lý sau đều suy ra từ nguyên lý này.

## Nguyên lý 2: thứ đối chiếu phải rẻ nhất có thể

Chi phí của cặp đối chiếu là mỗi lần đổi ý phải sửa cả hai bên. Bên đối chiếu càng nặng thì càng ít người chịu sửa, và nó chết dần.

Tài liệu văn xuôi là dạng đắt nhất: phải có người đọc lại mới biết lệch. Test là dạng rẻ nhất: máy tự đối chiếu mỗi lần đổi code, không cần ai nhớ.

"Rẻ nhất" không có nghĩa là ít test. Nó có nghĩa là mỗi quy tắc được kiểm ở lớp rẻ nhất mà vẫn bắt được lỗi: quy tắc quyền và tiền kiểm ở database, luồng chính kiểm bằng test bấm tự động trên trình duyệt, cảm giác dùng thì người thử.

## Nguyên lý 3: mỗi điều viết một lần

Mâu thuẫn không sinh ra vì có nhiều file. Nó sinh ra vì cùng một điều được viết ở hai chỗ, và lúc đổi ý có một chỗ bị quên.

Cách làm: mỗi điều có một chỗ ở duy nhất và một mã. Chỗ khác cần nhắc tới thì ghi mã, không chép nội dung. Ví dụ story ghi "theo QT1.4", không viết lại QT1.4.

Vì sao điều này quan trọng với AI hơn với người: AI đọc được rất nhiều và đọc ngày càng rẻ, nên đọc nhiều không phải là vấn đề. Vấn đề là khi hai chỗ nói ngược nhau thì thông minh đến đâu cũng không suy ra được chỗ nào đúng. Người sẽ đi hỏi. AI thường chọn một bên rồi code tiếp.

Vậy nên: đọc nhiều thứ nhất quán thì không sao; đọc một thứ có hai phiên bản thì hại, dù ngắn.

## Nguyên lý 4: sống hoặc đóng băng, không có loại ở giữa

Mỗi tài liệu thuộc một trong hai loại:

- **Sống:** được sửa ngay trong cùng lần đổi code. Chỉ nên có rất ít: test, quyết định, danh sách việc.
- **Đóng băng:** dùng một lần làm nguyên liệu, sau đó không ai sửa và cũng không còn được tin hơn test. Story thuộc loại này: trước khi tính năng được làm thì story đúng; làm xong thì test và code là sự thật.

Loại nguy hiểm là loại ở giữa: trông như còn sống nhưng không ai cập nhật. Người đọc và AI đều tin nó, và nó sai.

## Nguyên lý 5: lý do ghi riêng, và phải giữ

Test cho biết phải làm gì. Code cho biết làm thế nào. Không thứ nào cho biết **vì sao**. Lý do mất thì không khôi phục được.

Mất lý do thì sau vài tháng một người hợp lý sẽ nhìn một luật lạ, tưởng là thiếu sót, và "sửa lại cho đúng". Có lý do ghi sẵn thì người đó biết phương án kia đã được cân và vì sao bị bỏ.

Cách làm: một file quyết định, mỗi quyết định ghi bối cảnh, các phương án, chọn gì, vì sao, hệ quả. Quyết định bị thay thì không xóa, chỉ ghi "thay bởi…", để không ai quay lại đường đã thử.

Tiêu chí để biết điều gì đáng ghi thành quyết định: nếu sau này một người hợp lý có thể muốn sửa ngược lại, thì ghi. Tiêu chí này loại ra lựa chọn hiển nhiên và lựa chọn dễ đảo ngược như màu nút, tên biến.

## Nguyên lý 6: máy sinh ra được thì không viết tay

Danh sách cột lấy từ file tạo database. Danh sách màn lấy từ code. Viết tay một bản thứ hai là tự tạo thêm một chỗ để lệch, tức là vi phạm nguyên lý 3.

## Mỗi loại thông tin ở đâu

Bảng đầy đủ cho repo này: `docs/QUY_TRINH.md` mục 3. Tóm tắt:

| Thông tin | Chỗ ở duy nhất | Loại |
| --- | --- | --- |
| Quy tắc quyền, giá, tiền, chặn trùng | Test, và luật trong database | Sống |
| Cấu trúc database | File migration trong repo | Sống |
| Lý do | File quyết định | Sống |
| Một tính năng phải làm gì | Story của tính năng đó | Sống tới khi merge, rồi đóng băng |
| Luật dùng chung cho nhiều story | `docs/luat-chung/` | Sống |
| Màn trông thế nào | Canvas thiết kế | Sống |
| Hệ thống đang chạy thế nào | Code | Sống |

## Khi nào các nguyên lý này không còn đúng

- **App rất nhỏ, một người, không có quyền và tiền.** Lỗi hiện ngay trên màn, cặp đối chiếu là mắt người. Kiểu Kho BaBa là đủ; làm đủ sáu nguyên lý là thừa.
- **Giai đoạn thăm dò, chưa biết sản phẩm là gì.** Viết test cho thứ ngày mai bỏ là lãng phí. Lúc đó cặp đối chiếu là bản chạy thử và phản hồi của người dùng.
- **Quy tắc không viết được thành ví dụ cụ thể.** Không có ví dụ thì không có test. Khi đó phải dừng lại hỏi cho ra ví dụ, vì quy tắc chưa đủ rõ để code.

## Dấu hiệu đang trượt

- Sửa một quy tắc mà phải mở từ ba file trở lên.
- AI hỏi "theo file nào" hoặc tự chọn một file.
- Test xanh nhưng không ai dám chắc nó kiểm gì.
- Có tài liệu mà không ai nhớ lần cuối sửa là khi nào.
- Thời gian viết và soát tài liệu nhiều hơn thời gian làm ra thứ người dùng bấm được.

Gặp một trong các dấu hiệu này thì dừng thêm tính năng, dọn lại cho mỗi điều về một chỗ, rồi mới làm tiếp.
