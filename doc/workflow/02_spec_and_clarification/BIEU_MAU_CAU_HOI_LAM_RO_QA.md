# [BIỂU MẪU] BẢNG CÂU HỎI LÀM RÕ NGHIỆP VỤ (CLARIFICATION Q&A MATRIX)
*(Dùng để tổng hợp những điểm mơ hồ, mâu thuẫn cần xác nhận từ Product Owner / Khách hàng)*

---

## 1. Thông Tin Bảng Hỏi Đáp
- **Tên tính năng**: `[Ví dụ: Quản Lý Sản Phẩm & Nhóm Danh Mục]`
- **Mã Use Case**: `[Ví dụ: UC12 - Product Catalog]`
- **Người gửi câu hỏi (Dev / BA)**: `[Tên Dev / AI Assistant]`
- **Người phản hồi (PO / Stakeholder)**: `[Tên PO / Khách hàng]`
- **Ngày gửi**: `YYYY-MM-DD`
- **Trạng thái tổng thể**: `[Pending PO Review / Approved to Implement]`

---

## 2. Bảng Ma Trận Hỏi Đáp Làm Rõ (Q&A Matrix)

| ID | Nghiệp Vụ / Màn Hình | Vấn Đề Chưa Rõ Ràng (Issue / Ambiguity) | Câu Hỏi Cụ Thể Gửi PO (Question) | Đề Xuất Của Dev (Recommendation) | Phản Hồi Chính Thức Của PO (Decision) | Trạng Thái (Status) |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **Q01** | Xóa sản phẩm | SRS chưa nói rõ khi xóa sản phẩm đã từng phát sinh hóa đơn bán lẻ trong quá khứ thì xử lý thế nào? | Khi người dùng ấn nút Xóa một sản phẩm đã có lịch sử bán hàng hoặc còn tồn kho, hệ thống có cho phép xóa cứng khỏi DB không? | **Đề xuất: Dùng Soft Delete.** Chỉ đổi trạng thái `status = 0 (Inactive)`. Ẩn khỏi màn hình bán hàng POS nhưng vẫn giữ nguyên dữ liệu lịch sử hóa đơn để phục vụ báo cáo tài chính và đối soát. | `[Chờ PO trả lời...]` | 🟡 Open |
| **Q02** | Mã vạch Barcode | Sản phẩm có bắt buộc phải có mã vạch ngay khi tạo hay không? | Trường hợp một số mặt hàng đóng gói thủ công (bông gạc y tế phân liều) chưa có mã vạch thì hệ thống có cho phép để trống trường Barcode không? | **Đề xuất:** Cho phép trường `barcode` nhận giá trị `NULL`. Nếu người dùng không nhập, hệ thống sẽ tự động sinh mã nội bộ ngẫu nhiên dạng `PMS-xxxx` hoặc để trống. | `[Chờ PO trả lời...]` | 🟡 Open |
| **Q03** | Quy cách đóng gói | Hệ số quy đổi đơn vị (Hộp -> Vỉ -> Viên). | Trong phạm vi MVP hiện tại, một mặt hàng có hỗ trợ đa đơn vị tính (bán cả hộp và xé lẻ từng vỉ/viên) với hệ số quy đổi không? | **Đề xuất:** Trong phase hiện tại, quản lý mỗi quy cách đóng gói là một sản phẩm độc lập (ví dụ: "Panadol Hộp 15 vỉ" và "Panadol Vỉ 12 viên" là 2 mã hàng riêng biệt). Phase sau mới nâng cấp bảng quy đổi đơn vị. | `[Chờ PO trả lời...]` | 🟡 Open |
| **Q04** | Thay đổi giá bán | Lưu vết lịch sử thay đổi giá niêm yết (Price History). | Khi người dùng sửa giá bán `selling_price` của thuốc, có cần bắt buộc nhập lý do thay đổi giá không? | **Đề xuất:** Khi cập nhật giá bán, hệ thống tự động chèn một bản ghi mới vào bảng `dbo.price_histories` kèm thời điểm và user thực hiện. Trường lý do (reason) là tùy chọn (optional). | `[Chờ PO trả lời...]` | 🟡 Open |

---

## 3. Biên Bản Xác Nhận (Sign-off Confirmation)
- **Ý kiến kết luận của PO / Khách hàng**: `[Đồng ý theo các đề xuất khuyến nghị của Dev / Có điều chỉnh mục Q02...]`
- **Quyết định chuyển tiếp**:
  - [x] **CHẤP THUẬN (APPROVED)**: Được phép bắt đầu chuyển sang **Giai đoạn 3 (Implement)**.
  - [ ] **CHƯA ĐỒNG Ý (REJECTED)**: Cần chỉnh sửa lại Spec và họp làm rõ thêm.
- **Ký duyệt (Sign-off by)**: `[Tên PO]` - `YYYY-MM-DD`

