# [BIỂU MẪU] KẾ HOẠCH TRIỂN KHAI CODE CHI TIẾT (IMPLEMENTATION PLAN)
*(Sử dụng biểu mẫu này sau khi đã có xác nhận từ PO để theo dõi tiến độ code)*

---

## 1. Thông Tin Nhánh & Tính Năng
- **Tên tính năng**: `[Tên tính năng]`
- **Nhánh Git (Branch)**: `feature/[tên-tính-năng]` (Tạo từ `main`)
- **Người triển khai**: `[Tên Dev / AI Assistant]`
- **Trạng thái phê duyệt (Approval Status)**: `[x] Đã phê duyệt ngày YYYY-MM-DD`

---

## 2. Checklist Triển Khai Chi Tiết (Step-by-Step Execution Checklist)

### 2.1. Cơ Sở Dữ Liệu & Migration
- [ ] Soạn script migration DDL / cập nhật bảng trong `DB/`.
- [ ] Bổ sung Unique Index / Foreign Key / Check Constraints cần thiết.
- [ ] Bổ sung Seed Data mẫu nếu có nhóm danh mục mới.
- [ ] Chạy kiểm thử script SQL trên môi trường local (đảm bảo không lỗi cú pháp, hỗ trợ tiếng Việt có dấu).

### 2.2. Backend (Spring Boot 3)
- [ ] **Entity**: Tạo / Cập nhật JPA Entity trong `com.pharmacy.entity` kèm annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`, `@ManyToOne`...).
- [ ] **Repository**: Tạo interface Repository trong `com.pharmacy.repository` kế thừa `JpaRepository`.
- [ ] **DTO**: Tạo Request DTO và Response DTO trong `com.pharmacy.dto` với đầy đủ Bean Validation (`@NotNull`, `@NotBlank`, `@Min`...).
- [ ] **Exception**: Định nghĩa Custom Exception nếu cần (ví dụ: `ResourceNotFoundException`, `DuplicateBarcodeException`).
- [ ] **Service Layer**:
  - [ ] Khai báo Interface Service trong `com.pharmacy.service`.
  - [ ] Cài đặt Implementation Service trong `com.pharmacy.service.impl`.
  - [ ] Xử lý logic nghiệp vụ, giao dịch `@Transactional`, ghi `audit_logs`.
- [ ] **Controller Layer**:
  - [ ] Tạo REST Controller trong `com.pharmacy.controller`.
  - [ ] Áp dụng `@PreAuthorize("hasAuthority('...')")` để kiểm soát quyền RBAC.
  - [ ] Trả về chuẩn HTTP Status Code (200 OK, 201 Created, 204 No Content).

### 2.3. Frontend (React 18 + Vite)
- [ ] **API Client**: Tạo hàm gọi API trong `src/api/` sử dụng `axios` / `fetchApi`.
- [ ] **Custom Hook / State**: Xử lý logic tải danh sách, lọc, tìm kiếm, phân trang và xử lý lỗi trong `src/hooks/`.
- [ ] **UI Components**:
  - [ ] Trang danh sách dữ liệu (List Table Page) với bộ lọc và tìm kiếm.
  - [ ] Modal / Drawer xem chi tiết (Detail View).
  - [ ] Modal thêm mới và chỉnh sửa (Form Modal) có validation trực quan.
  - [ ] Modal xác nhận hành động nguy hiểm (Xóa / Vô hiệu hóa).
- [ ] **Phân Quyền UI**: Sử dụng context `useAuth()` để ẩn hoặc vô hiệu hóa các nút chức năng nếu tài khoản không đủ quyền.
- [ ] **Feedback & Notification**: Hiển thị Toast thông báo thành công hoặc báo lỗi rõ ràng.

---

## 3. Nhật Ký Tiến Độ Triển Khai (Progress Log)
| Thời Gian | Công Việc Đã Thực Hiện | Trạng Thái | Commit SHA | Ghi Chú |
| :--- | :--- | :---: | :---: | :--- |
| `YYYY-MM-DD HH:mm` | Tạo DDL và JPA Entity `Product` | Done | `abc1234` | Đã link foreign key category |
| `YYYY-MM-DD HH:mm` | Triển khai ProductService & API Controller | Done | `def5678` | Bổ sung check quyền RBAC |
| `YYYY-MM-DD HH:mm` | Xây dựng UI Danh sách và Modal thêm mới | Done | `9876543` | Test UI hiển thị mượt mà |

