# BỘ TÀI LIỆU YÊU CẦU & THIẾT KẾ KỸ THUẬT HỆ THỐNG
## HỆ THỐNG QUẢN LÝ CHUỖI NHÀ THUỐC (PHARMACY CHAIN MANAGEMENT SYSTEM - PMS)

---

### CẤU TRÚC THƯ MỤC
```
TaiLieu_SRS_SDS/
├── SRS/                                      # Tài liệu Yêu cầu phần mềm (Software Requirements Specification)
│   ├── README.md                             # Tổng quan và ma trận Use Case SRS
│   ├── 01_SRS_Authentication.md              # Yêu cầu màn hình & Use Case cụm Authentication (UC01 - UC05)
│   ├── 02_SRS_Customer_Management.md         # Yêu cầu màn hình & Use Case cụm Customer Management (UC29 - UC33)
│   ├── 03_SRS_Shift_Management.md            # Yêu cầu màn hình & Use Case cụm Shift Management (UC21 - UC22)
│   └── 04_SRS_Sales_Management.md            # Yêu cầu màn hình & Use Case cụm Sales Management (UC23 - UC26)
│
└── SDS/                                      # Tài liệu Thiết kế chi tiết hệ thống (System Design Specification)
    ├── README.md                             # Tổng quan kiến trúc kỹ thuật SDS
    ├── 01_SDS_Authentication.md              # Class Diagram & 5 Sequence Diagrams cụm Authentication
    ├── 02_SDS_Customer_Management.md         # Class Diagram & 5 Sequence Diagrams cụm Customer Management
    ├── 03_SDS_Shift_Management.md            # Class Diagram & 2 Sequence Diagrams cụm Shift Management
    └── 04_SDS_Sales_Management.md            # Class Diagram & 4 Sequence Diagrams cụm Sales Management
```

---

### PHẠM VI 4 CỤM TÍNH NĂNG ĐƯỢC ĐẶC TẢ
1. **Cụm Authentication**:
   - `Login`: Đăng nhập bằng Username/Email, bảo mật hai lớp JWT + Refresh Token Cookie.
   - `Logout`: Thu hồi token và hủy phiên làm việc.
   - `Change Password`: Đổi mật khẩu với xác minh mật khẩu cũ và băm BCrypt.
   - `Manage Personal Information`: Quản lý hồ sơ cá nhân và ảnh đại diện.
   - `Forgot Password`: Khôi phục mật khẩu qua mã OTP gửi qua Email SMTP.

2. **Cụm Customer Management**:
   - `Register New Customer`: Đăng ký khách hàng mới kèm hồ sơ sức khỏe và tiền sử dị ứng thuốc.
   - `Edit Customer`: Chỉnh sửa thông tin cá nhân và cập nhật dị ứng.
   - `View Customer`: Xem chi tiết hồ sơ bệnh lý, điểm tích lũy và khung cảnh báo dị ứng đỏ.
   - `View Customer List`: Danh bạ khách hàng toàn chuỗi, tìm kiếm nhanh theo SĐT.
   - `Delete Customer`: Ngừng theo dõi / Xóa khách hàng (Soft Delete an toàn).

3. **Cụm Shift Management**:
   - `Open Shift`: Khai báo tiền mặt quỹ đầu ca và mở quầy bán thuốc POS.
   - `Close Shift`: Chốt ca, kiểm đếm tiền mặt thực tế, tự động tính toán chênh lệch két và in phiếu bàn giao ca.

4. **Cụm Sales Management**:
   - `Create Sales Invoice`: Quét barcode, trừ tồn kho tự động theo hạn dùng FEFO, bắt buộc khách hàng định danh.
   - `Process Payment`: Thanh toán Tiền mặt (tính tiền thừa) và Chuyển khoản QR PayOS tự động nhận diện thanh toán qua Webhook.
   - `Cancel/Return Sales Invoice`: Tiếp nhận trả hàng trực tiếp từ danh sách hóa đơn trong ngày, tự động tính toán `return_type` và hoàn nhập tồn kho.
   - `View Customer Purchase History`: Tra cứu lịch sử mua thuốc, danh sách hóa đơn bán lẻ trong ngày kèm tìm kiếm đa tiêu chí và nút thao tác Chi tiết / Trả hàng trực tiếp.
