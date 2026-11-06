# GIAI ĐOẠN 1: QUY TRÌNH ĐỌC CODE, SRS, SDS VÀ TÀI LIỆU ĐẶC TẢ
### Thư mục: `doc/workflow/01_analysis_srs_sds/`

## 1. Mục Đích
Giai đoạn này nhằm đảm bảo lập trình viên / AI agent hiểu sâu sắc và toàn diện về bối cảnh nghiệp vụ, các ràng buộc hệ thống (System Constraints), cấu trúc mã nguồn hiện hữu trước khi đưa ra bất kỳ quyết định kỹ thuật nào.

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1.1: Đọc và Trích Xuất Yêu Cầu Từ SRS / SDS
1. Mở tài liệu đặc tả nghiệp vụ: `doc/SBA301_SRS_Group5 (3).docx` hoặc các tài liệu con trong `doc/`.
2. Xác định:
   - **Tên Use Case & Mã số Use Case** (Ví dụ: UC12 - Manage Products, UC21 - POS Retail Sales).
   - **Actors (Tác nhân)**: Ai là người thực hiện hành động? (ADMIN, PHARMACIST, STORE_MANAGER, WAREHOUSE_STAFF...).
   - **Mục tiêu Use Case (Goal in context)**: Nghiệp vụ này giải quyết bài toán gì cho nhà thuốc?
   - **Tiền điều kiện (Pre-conditions)**: Hệ thống cần có sẵn điều kiện gì (ví dụ: đã đăng nhập, tài khoản có quyền `PRODUCT_CREATE`, ca làm việc đang mở...)?
   - **Luồng chính (Main flow / Happy path)**: Từng bước người dùng thao tác và phản hồi của hệ thống.
   - **Luồng phụ / Ngoại lệ (Alternative / Exception flows)**: Khi nhập sai, khi hết hàng, khi quá hạn, khi lỗi mạng.
   - **Quy tắc nghiệp vụ (Business Rules - BR)**: Ví dụ: BR-01 (Thuốc kê đơn phải nhập mã đơn thuốc), BR-02 (Xuất kho theo nguyên tắc FEFO - Hạn gần xuất trước), BR-10 (Một giá bán niêm yết duy nhất toàn hệ thống).

### Bước 1.2: Rà Soát Hiện Trạng Mã Nguồn (Codebase Exploration)
1. **Kiểm tra Cơ sở dữ liệu (Database Schema)**:
   - Tra cứu bảng liên quan trong `DB/pms_sqlserver.sql`.
   - Kiểm tra các khóa chính (PK), khóa ngoại (FK), chỉ mục (Indexes), ràng buộc tính toàn vẹn (Check Constraints, Unique Indexes).
2. **Kiểm tra Backend (Spring Boot 3 / Java 17)**:
   - Entity: Các bảng đã được ánh xạ thành JPA Entity trong `BE/sba/src/main/java/com/pharmacy/entity/` chưa? Kiểu dữ liệu, `@Column`, `@ManyToOne` đã chuẩn chưa?
   - Repository: Đã có Spring Data JPA Repository chưa? Cần viết custom `@Query` hay dùng `JpaSpecificationExecutor`?
   - Service: Logic nghiệp vụ, Transaction (`@Transactional`), Security / RBAC check (`@PreAuthorize`) tổ chức ở đâu?
   - DTO & Validation: Đã có Request/Response DTO với `@NotNull`, `@Size`, `@Min`, `@Pattern` chưa?
   - Controller: Các endpoint RESTful, mapping URL, HTTP status code trả về.
3. **Kiểm tra Frontend (React 18 + Vite)**:
   - Trang và Component: Tìm kiếm trong `FE/pharmaychain/src/page/` và `src/component/`.
   - API Client: Kiểm tra hàm gọi API trong `src/api/`.
   - State & Hooks: Đang quản lý state bằng Custom Hook (`hooks/`) hay Context (`context/`)?
   - UI/UX & Style: Đang dùng các lớp CSS nào trong `src/index.css` (ví dụ: `.pms-card`, `.btn-pms`, `.pms-modal-overlay`, `.pms-table`)?

### Bước 1.3: Đánh Giá Rủi Ro & Mức Độ Tương Thích (Impact Analysis)
1. Tính năng mới có ảnh hưởng đến các bảng dữ liệu đang vận hành không?
2. Có nguy cơ làm vỡ các tính năng khác (Regression) không?
3. Có cần bổ sung thêm Permission mới vào ma trận phân quyền không?

---

## 3. Tiêu Chí Hoàn Thành (Definition of Done - Phase 1)
- [ ] Đã hoàn thành điền tài liệu theo mẫu: [`BIEU_MAU_PHAN_TICH_YEU_CAU.md`](./BIEU_MAU_PHAN_TICH_YEU_CAU.md).
- [ ] Không còn sự hiểu sai về Use Case và Business Rules cốt lõi.
- [ ] Đã chỉ rõ tất cả các file code BE, FE, DB liên quan trực tiếp.
