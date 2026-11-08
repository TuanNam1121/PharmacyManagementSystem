# TÀI LIỆU THIẾT KẾ HỆ THỐNG CHI TIẾT (SDS - SYSTEM DESIGN SPECIFICATION)
## HỆ THỐNG QUẢN LÝ CHUỖI NHÀ THUỐC (PHARMACY CHAIN MANAGEMENT SYSTEM)

---

### MỤC LỤC TÀI LIỆU SDS
| STT | Mã Cụm | Tên Cụm Chức Năng | File Thiết Kế Chi Tiết | Nội Dung Class Diagram & Sequence Diagrams |
| :---: | :---: | :--- | :--- | :--- |
| 1 | **AUTH** | Authentication | [01_SDS_Authentication.md](./01_SDS_Authentication.md) | **Class Diagram**: `AuthController`, `AccountProfileController`, `AuthService`, `JwtTokenProvider`, `Account`, `RefreshToken`, `PasswordResetToken`...<br>**Sequence Diagrams**:<br>1. Login (JWT & Refresh Token Rotation)<br>2. Logout (Token Revocation)<br>3. Change Password<br>4. Manage Personal Information<br>5. Forgot Password (SMTP OTP Email) |
| 2 | **CUST** | Customer Management | [02_SDS_Customer_Management.md](./02_SDS_Customer_Management.md) | **Class Diagram**: `CustomerController`, `CustomerService`, `CustomerRepository`, `Customer`, `CustomerHealthProfile`...<br>**Sequence Diagrams**:<br>1. Register New Customer<br>2. Edit Customer<br>3. View Customer Detail & Allergy Alert<br>4. View Customer List (Server-side Pagination & Debounce Search)<br>5. Delete Customer (Soft Delete) |
| 3 | **SHFT** | Shift Management | [03_SDS_Shift_Management.md](./03_SDS_Shift_Management.md) | **Class Diagram**: `ShiftController`, `ShiftService`, `ShiftRepository`, `Shift`, `SalesInvoice`, `Store`...<br>**Sequence Diagrams**:<br>1. Open Shift (Opening Cash Declaration)<br>2. Close Shift (Actual vs Calculated Reconciliation & Handover) |
| 4 | **SALE** | Sales Management | [04_SDS_Sales_Management.md](./04_SDS_Sales_Management.md) | **Class Diagram**: `SalesInvoiceController`, `PaymentController`, `SalesInvoiceService`, `PayOSPaymentService`, `SalesInvoice`, `Payment`, `SalesReturn`, `Inventory`...<br>**Sequence Diagrams**:<br>1. Create Sales Invoice (FEFO Inventory Deduction & Allergy Check)<br>2. Process Payment (Cash & PayOS VietQR Webhook)<br>3. Cancel/Return Sales Invoice (Pre-calculated Return Type & Stock Restoration)<br>4. View Customer Purchase History & Daily Invoices |

---

### CÁC NGUYÊN TẮC THIẾT KẾ HỆ THỐNG
1. **Kiến trúc phân tầng chặt chẽ**:
   - `Presentation Layer`: React Vite SPA + Context API + Axios Interceptors.
   - `Controller Layer`: RESTful Web APIs, chuẩn hóa phản hồi `ApiResponse<T>`, kiểm tra validation đầu vào bằng Jakarta Bean Validation.
   - `Service Layer`: Xử lý transaction `@Transactional`, áp dụng các business logic phức tạp (FEFO, JWT Refresh Token Rotation, Checksum verification).
   - `Repository Layer`: Spring Data JPA tương tác cơ sở dữ liệu Microsoft SQL Server.
2. **Bảo mật & Kiểm toán**:
   - Mọi mật khẩu băm bằng thuật toán `BCrypt`.
   - Cơ chế xác thực hai lớp Token: Access Token 15 phút và Refresh Token 8 tiếng lưu trong `HttpOnly Cookie`.
   - Ghi nhật ký kiểm toán (`audit_logs`) đối với mọi tác vụ nhạy cảm và quan trọng.

