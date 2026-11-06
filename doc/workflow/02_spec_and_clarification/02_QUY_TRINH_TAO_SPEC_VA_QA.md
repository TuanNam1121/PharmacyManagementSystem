# GIAI ĐOẠN 2: QUY TRÌNH TẠO TECHNICAL SPEC & LẬP BẢNG CÂU HỎI LÀM RÕ (Q&A)
### Thư mục: `doc/workflow/02_spec_and_clarification/`

## 1. Mục Đích
Biến các yêu cầu từ SRS/SDS thành tài liệu kiến trúc kỹ thuật chi tiết (Technical Specification) và chủ động phát hiện các điểm mâu thuẫn, thiếu sót để gửi câu hỏi làm rõ đến Product Owner / Khách hàng trước khi viết bất kỳ dòng mã nào.

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 2.1: Soạn Thảo Bản Đặc Tả Kỹ Thuật (Technical Spec)
Dựa trên kết quả khảo sát từ Giai đoạn 1, lập tài liệu đặc tả kỹ thuật theo mẫu [`BIEU_MAU_TECHNICAL_SPEC.md`](./BIEU_MAU_TECHNICAL_SPEC.md) bao gồm:
1. **Thiết kế CSDL (Database Schema Design)**:
   - Tên bảng, kiểu dữ liệu từng cột, NULL/NOT NULL, giá trị mặc định (`DEFAULT`).
   - Khóa chính (PK), Khóa ngoại (FK) với chiến lược `ON DELETE / ON UPDATE`.
   - Chỉ mục tối ưu truy vấn (B-Tree index, Unique index, Filtered index).
   - SQL Script DDL / Flyway / Liquibase / Migration script tương ứng.
2. **Thiết kế RESTful API Contract**:
   - URL endpoint chuẩn (ví dụ: `GET /api/v1/products`, `POST /api/v1/products`).
   - HTTP Method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
   - Headers: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`.
   - Request Body Schema kèm ràng buộc kiểm thực dữ liệu (Bean Validation `@NotNull`, `@Size`, `@Min`...).
   - Response Payload Schema (Success & Error Response format).
   - Danh sách mã lỗi nghiệp vụ cụ thể (Business Error Codes).
3. **Phân Quyền Vai Trò (Security & RBAC Matrix)**:
   - Endpoint này cần Permission gì? (Ví dụ: `@PreAuthorize("hasAuthority('PRODUCT_CREATE')")`).
   - Những role nào mặc định được cấp quyền này?
4. **Thiết Kế Giao Diện UI/UX & Flow Người Dùng**:
   - Layout màn hình, vị trí các nút bấm, ô tìm kiếm, bảng dữ liệu, phân trang.
   - Trạng thái Loading, Empty state, Error state, Modal xác nhận.
   - Thông báo phản hồi người dùng (Toast notifications, Alert banners).

### Bước 2.2: Lập Danh Sách Câu Hỏi Làm Rõ Nghiệp Vụ (Clarification Questions)
Khi đọc SRS và thiết kế spec, nếu xuất hiện các tình huống sau:
- Yêu cầu trong SRS mơ hồ, có thể hiểu theo nhiều cách khác nhau.
- Thiếu các ca biên (Edge cases): ví dụ người dùng xóa danh mục đang có 100 sản phẩm thì xử lý ra sao (Cascade delete hay Block)?
- Xung đột giữa SRS với luồng thực tế của hệ thống hiện tại.
$\rightarrow$ Lập bảng câu hỏi làm rõ theo mẫu [`BIEU_MAU_CAU_HOI_LAM_RO_QA.md`](./BIEU_MAU_CAU_HOI_LAM_RO_QA.md).

> [!TIP]
> **Quy tắc đặt câu hỏi chất lượng cao**:
> - Không hỏi câu hỏi cụt ngủn hoặc mơ hồ.
> - Luôn cung cấp **Bối cảnh (Context)** + **Vấn đề cụ thể (Issue)** + **Đề xuất của Dev (Recommended Option)** kèm ưu/nhược điểm để PO/Khách hàng chỉ cần chọn hoặc phê duyệt.

### Bước 2.3: Chờ Xác Nhận Của PO / Khách Hàng (Approval Gate)
- Gửi tài liệu Spec và Bảng câu hỏi làm rõ cho PO / Khách hàng.
- Tổ chức cuộc họp ngắn (Refinement / Clarification Session) hoặc trao đổi qua ticket/chat.
- Cập nhật câu trả lời vào cột **Phản Hồi & Quyết Định** trong bảng Q&A.
- Đóng dấu **ĐÃ PHÊ DUYỆT (APPROVED)** để chuyển tiếp sang Giai đoạn 3.

---

## 3. Tiêu Chí Hoàn Thành (Definition of Done - Phase 2)
- [ ] Tài liệu Technical Spec hoàn chỉnh đã được hoàn thiện.
- [ ] Toàn bộ các câu hỏi làm rõ quan trọng (Blocker / High) đã có phản hồi chính thức từ PO.
- [ ] Đã có xác nhận (Sign-off) chấp thuận triển khai từ người có thẩm quyền.

