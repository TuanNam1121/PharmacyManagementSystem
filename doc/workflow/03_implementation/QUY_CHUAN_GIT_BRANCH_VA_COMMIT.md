# QUY CHUẨN PHÂN NHÁNH GIT VÀ THÔNG ĐIỆP COMMIT (GIT CONVENTIONS)
### Áp dụng: Toàn bộ dự án Pharmacy Management System (PMS)

## 1. Chiến Lược Phân Nhánh (Branching Strategy)

Hệ thống tuân thủ mô hình **Feature Branching**:
- Nhánh `main`: Nhánh ổn định (Production-ready). Chỉ nhận code thông qua Pull Request (PR) hoặc Merge sau khi đã test thành công.
- Nhánh `feature/<feature-name>`: Nhánh phát triển một tính năng cụ thể.
  - Ví dụ: `feature/product-catalog-management`, `feature/customer-management`, `feature/pos-sales`.
- Nhánh `bugfix/<issue-name>`: Nhánh sửa lỗi phát sinh.

### Quy Trình Làm Việc Với Nhánh Tính Năng:
```bash
# 1. Kéo code mới nhất từ main
git checkout main
git pull origin main

# 2. Tạo nhánh tính năng mới
git checkout -b feature/<feature-name>

# 3. Thực hiện code và commit từng phần
git add .
git commit -m "feat(catalog): implement product CRUD service"

# 4. Đẩy nhánh lên Remote Repository
git push -u origin feature/<feature-name>
```

---

## 2. Quy Chuẩn Đặt Tên Thông Điệp Commit (Conventional Commits)

Cấu trúc chuẩn:
```
<loại_thay_đổi>(<phạm_vi>): <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>
```

### Các Loại Thay Đổi (Type):
| Loại | Ý Nghĩa & Khi Nào Sử Dụng | Ví Dụ |
| :--- | :--- | :--- |
| `feat` | Thêm tính năng mới (New feature) | `feat(catalog): add product creation and barcode search API` |
| `fix` | Sửa lỗi (Bug fix) | `fix(pos): resolve modal overlay z-index alignment bug` |
| `refactor` | Tối ưu, cấu trúc lại mã nguồn mà không đổi logic | `refactor(pos): remove F-key hotkeys and streamline mouse UI` |
| `test` | Viết thêm hoặc chỉnh sửa Unit Test / Integration Test | `test(product): add unit tests for product service duplicate barcode check` |
| `docs` | Thêm mới hoặc cập nhật tài liệu kỹ thuật, workflow | `docs(workflow): create engineering specification guidelines` |
| `chore` | Cập nhật cấu hình build, dependency pom.xml / package.json | `chore(deps): update lombok and spring boot starter dependencies` |

---

## 3. Quy Tắc Kiểm Tra Trước Khi Đẩy Code (Pre-Push Checklist)
Trước khi tạo commit và đẩy code lên remote:
1. **Kiểm tra Backend**:
   ```bash
   mvn test -f BE/sba/pom.xml
   ```
   $\rightarrow$ Đảm bảo toàn bộ Unit Tests & Integration Tests chạy thành công (0 Failure, 0 Error).
2. **Kiểm tra Frontend**:
   ```bash
   npm run build --prefix FE/pharmaychain
   ```
   $\rightarrow$ Đảm bảo bản build Vite hoàn tất không có lỗi cú pháp hoặc cảnh báo nghiêm trọng.
3. **Kiểm tra Git Status**:
   ```bash
   git status
   ```
   $\rightarrow$ Đảm bảo không commit nhầm các file tạm (`.DS_Store`, `node_modules`, `target/`, file logs).

