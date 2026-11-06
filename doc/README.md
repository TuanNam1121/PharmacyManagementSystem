# PharmaChain — Trung Tâm Tài Liệu Dự Án (Documentation Portal)

Hệ thống Quản lý Chuỗi Nhà thuốc Toàn diện (**PharmaChain - Pharmacy Management System**).  
Dự án được xây dựng và kiểm soát nghiêm ngặt theo **72 chức năng thuộc 17 nhóm** trong `PharmacistManagementSystem_Backlog.xlsx`.

---

## 🧭 Cây Thư Mục & Mục Lục Tài Liệu (Table of Contents)

```
doc/
│
├── 📂 00-project-overview/               # Tổng quan dự án & Kiểm soát phạm vi
│   ├── 📄 PROJECT_SCOPE.md               # Quy chuẩn phạm vi, RBAC, HomePage & luồng 10 bước
│   └── 📄 BACKLOG_IMPLEMENTATION_MAPPING.md # Bảng đối chiếu 72 dòng chi tiết giữa Backlog và Code
│
├── 📂 workflow/                          # Quy trình kỹ thuật chuẩn (Standard Engineering Workflow)
│   ├── 📄 README.md                      # Sơ đồ quy trình 4 giai đoạn & Cổng kiểm soát (Approval Gate)
│   ├── 📂 01_analysis_srs_sds/          # Giai đoạn 1: Khảo sát & Phân tích yêu cầu
│   ├── 📂 02_spec_and_clarification/     # Giai đoạn 2: Lập Technical Spec & Bảng hỏi Q&A
│   ├── 📂 03_implementation/             # Giai đoạn 3: Triển khai Code & Quy chuẩn Git Commit
│   └── 📂 04_testing/                    # Giai đoạn 4: Thiết kế Test Cases & Báo cáo nghiệm thu
│
├── 📂 authentication/                    # Đặc tả phân hệ Xác Thực & Bảo Mật (5 chức năng)
│   ├── 📄 README.md                      # Tổng quan kiến trúc JWT, Security & ERD
│   ├── 📄 login.md                       # FN01: Đăng nhập hệ thống
│   ├── 📄 logout.md                      # FN02: Đăng xuất an toàn
│   ├── 📄 change_password.md             # FN03: Đổi mật khẩu
│   ├── 📄 manage_personal_information.md # FN04: Cập nhật hồ sơ cá nhân
│   └── 📄 forgot_password.md             # FN05: Khôi phục mật khẩu qua Email OTP
│
├── 📂 customer_management/               # Đặc tả phân hệ Quản Lý Khách Hàng (5 chức năng)
│   ├── 📄 README.md                      # Tổng quan CRM nhà thuốc, tích điểm & Hồ sơ y tế
│   ├── 📄 register_new_customer.md       # FN29: Đăng ký khách hàng mới tại quầy
│   ├── 📄 edit_customer.md               # FN30: Chỉnh sửa thông tin khách hàng
│   ├── 📄 view_customer.md               # FN31: Xem chi tiết tiền sử bệnh & dị ứng thuốc
│   ├── 📄 view_customer_list.md          # FN32: Tra cứu danh bạ khách hàng toàn chuỗi
│   └── 📄 delete_customer.md             # FN33: Xóa an toàn khách hàng
│
├── 📂 sales_management/                  # Đặc tả phân hệ Bán Hàng POS & Ca Làm Việc (8 chức năng)
│   ├── 📄 README.md                      # Tổng quan luồng bán lẻ, kiểm đếm tiền & FEFO
│   ├── 📄 open_shift.md                  # FN21: Mở ca làm việc & Khai báo tiền đầu ca
│   ├── 📄 close_shift.md                 # FN22: Đóng ca làm việc & Kiểm đếm tiền cuối ca
│   ├── 📄 create_sales_invoice.md        # FN23: Lập hóa đơn bán lẻ POS
│   ├── 📄 process_payment.md             # FN24: Xử lý thanh toán (Tiền mặt, CK, VietQR)
│   ├── 📄 cancel_return_sales_invoice.md # FN25: Hủy hóa đơn & Đổi trả thuốc nhập lại kho
│   └── 📄 view_customer_purchase_history.md # FN26: Tra cứu lịch sử mua thuốc của khách hàng
│
└── 📄 SBA301_SRS_Group5 (3).docx         # Tài liệu đặc tả yêu cầu phần mềm gốc (SRS Document)
```

---

## 📌 Các Tài Liệu Trọng Tâm Bắt Buộc Đọc

1. **[Quy Chuẩn Phạm Vi Dự Án (PROJECT_SCOPE.md)](./00-project-overview/PROJECT_SCOPE.md)**:  
   Định nghĩa ranh giới 72 chức năng, kiến trúc Sidebar 5 phân hệ, ma trận phân quyền theo vai trò (RBAC), quy chuẩn Bàn làm việc (HomePage) và chuỗi 10 bước nghiệp vụ từ Mua hàng đến Bán lẻ POS.
2. **[Bảng Ánh Xạ Kiểm Toán 72 Chức Năng (BACKLOG_IMPLEMENTATION_MAPPING.md)](./00-project-overview/BACKLOG_IMPLEMENTATION_MAPPING.md)**:  
   Bảng đối chiếu chi tiết 72 dòng từ Product Backlog sang Controllers, Endpoints, Entities, Repositories (BE) và Pages, Components, Routes (FE).
3. **[Quy Trình Phát Triển Tính Năng Chuẩn (Standard Engineering Workflow)](./workflow/README.md)**:  
   Quy định bắt buộc về phân tích, viết đặc tả, phê duyệt, lập trình Clean Code và kiểm thử nghiệm thu.

---

## ⚖️ Quy Tắc Kiểm Soát Phạm Vi (Scope Control)

- **Chân lý phạm vi**: File Excel `PharmacistManagementSystem_Backlog.xlsx`.
- **Tuyệt đối không tự ý mở rộng**: Không thêm các module nằm ngoài Backlog (Marketing Campaign, Promotion, HR, Payroll, Accounting tài chính, Customer Loyalty đa tầng,...).
- **Mọi chức năng phải có căn cứ**: Phải truy vết được về 1 trong 72 Function ID trước khi viết mã nguồn.
