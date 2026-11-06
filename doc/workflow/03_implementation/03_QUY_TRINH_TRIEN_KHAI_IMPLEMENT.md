# GIAI ĐOẠN 3: QUY TRÌNH TRIỂN KHAI CODE (IMPLEMENTATION & EXECUTION)
### Thư mục: `doc/workflow/03_implementation/`

## 1. Nguyên Tắc Cốt Lõi: "Chờ Xác Nhận Mới Implement"
> [!IMPORTANT]
> **Tuyệt đối không được code trước khi có xác nhận.**
> Việc viết code chỉ được bắt đầu khi và chỉ khi:
> 1. Tài liệu Technical Spec trong Giai đoạn 2 đã được hoàn thiện.
> 2. Bảng câu hỏi làm rõ (Q&A Matrix) đã được PO / Khách hàng phản hồi và chốt phương án.
> 3. Trạng thái của tính năng được đánh dấu là **APPROVED TO IMPLEMENT**.

---

## 2. Quy Trình Các Bước Triển Khai

### Bước 3.1: Quản Lý Phân Nhánh Git (Git Branching)
1. Cập nhật nhánh chính (`main`) lên phiên bản mới nhất:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Tạo nhánh tính năng mới theo quy chuẩn:
   ```bash
   git checkout -b feature/<feature-name>
   # Ví dụ: git checkout -b feature/product-catalog-management
   ```
   Chi tiết quy tắc phân nhánh xem tại: [`QUY_CHUAN_GIT_BRANCH_VA_COMMIT.md`](./QUY_CHUAN_GIT_BRANCH_VA_COMMIT.md).

### Bước 3.2: Lập Kế Hoạch Triển Khai Chi Tiết (Implementation Checklist)
- Sao chép biểu mẫu [`BIEU_MAU_KE_HOACH_TRIEN_KHAI.md`](./BIEU_MAU_KE_HOACH_TRIEN_KHAI.md).
- Chia nhỏ tính năng thành các nhiệm vụ cụ thể (Sub-tasks) theo thứ tự:
  1. **Database Migration / Schema changes**: Tạo bảng, cột, khóa ngoại, index.
  2. **Backend JPA Entities & Mappings**: Entity classes, Validation annotations, Enum mappings.
  3. **Backend Repository & Data Access**: Spring Data JPA repositories, JPQL custom queries.
  4. **Backend DTOs & Mappers**: RequestDTO, ResponseDTO, MapStruct hoặc chuyển đổi DTO.
  5. **Backend Service Layer**: Interface và Implementation, `@Transactional`, Business validations, Custom exceptions.
  6. **Backend Controller Layer**: RESTful endpoints, `@PreAuthorize` kiểm tra quyền, GlobalExceptionHandler.
  7. **Frontend API Integration**: Các hàm Axios / Fetch trong `src/api/`.
  8. **Frontend State & Custom Hooks**: Xử lý logic tải dữ liệu, phân trang, lọc, xử lý lỗi.
  9. **Frontend UI Components**: Form thêm/sửa, bảng hiển thị, modal xác nhận, badge trạng thái.
  10. **RBAC UI Permissions**: Ẩn/hiện nút bấm dựa theo quyền hạn của tài khoản đăng nhập.

### Bước 3.3: Thực Thi Code Theo Tiêu Chuẩn Kỹ Thuật (Coding Standards)
- **Backend (Spring Boot 3)**:
  - Tuân thủ nguyên lý SOLID, Clean Architecture.
  - Xử lý ngoại lệ tập trung qua `@RestControllerAdvice` (không trả về stacktrace cho client).
  - Không viết hardcode mật khẩu, secret key (đọc từ `application.properties` hoặc biến môi trường).
  - Sử dụng `@Transactional` đúng phạm vi cho các thao tác ghi / cập nhật.
- **Frontend (React 18 + Vite)**:
  - Tuân thủ thiết kế UI chuẩn hệ thống (`.pms-card`, `.pms-table`, `.btn-pms`, `.pms-modal-overlay`).
  - Hỗ trợ thao tác chuột và bàn phím tự nhiên, thân thiện với người dùng (không ép phím tắt phức tạp).
  - Định dạng hiển thị tiền tệ VNĐ chuẩn (`150.000 ₫`) qua tiện ích `money()`.
  - Hiển thị thông báo Toast / Banner rõ ràng khi thao tác thành công hoặc thất bại.

### Bước 3.4: Quy Ước Commit Code
Mỗi nhóm thay đổi logic phải được commit riêng biệt kèm thông điệp theo chuẩn Conventional Commits:
```bash
git commit -m "feat(catalog): implement product CRUD service and REST controller"
git commit -m "feat(ui): create product list and modal form components"
```

---

## 3. Tiêu Chí Hoàn Thành (Definition of Done - Phase 3)
- [ ] Toàn bộ checklist triển khai đã được đánh dấu hoàn thành [x].
- [ ] Backend build thành công (`mvn compile` 0 lỗi).
- [ ] Frontend build thành công (`npm run build` 0 lỗi).
- [ ] Sẵn sàng chuyển giao mã nguồn sang Giai đoạn 4 để viết Unit Test & kiểm thử nghiệm thu.
