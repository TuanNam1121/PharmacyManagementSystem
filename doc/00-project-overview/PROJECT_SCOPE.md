# PharmaChain — Quy Chuẩn Kiểm Soát Phạm Vi Dự Án (Project Scope Control)

> **Căn cứ tối cao**: `PharmacistManagementSystem_Backlog.xlsx`  
> **Nguyên tắc**: Khóa cứng phạm vi 72 chức năng thuộc 17 nhóm. Tuyệt đối không mở rộng ngoài phạm vi.

---

## 1. Hệ Thống 3 Căn Cứ Tài Liệu & Thứ Tự Ưu Tiên

1. **Product Backlog Excel (`PharmacistManagementSystem_Backlog.xlsx`)**:  
   - Quyết định chức năng nào **ĐƯỢC PHÉP** triển khai (chính xác 72 chức năng thuộc 17 nhóm).
   - Tuyệt đối không tự tạo thêm: Marketing Campaign, Promotion, HR Management, Payroll, Accounting tài chính đầy đủ, Customer Loyalty đa tầng hay Quản lý toa thuốc độc lập.
2. **Organizational Document (`doc/SBA301_SRS_Group5 (3).docx`)**:  
   - Xác định **AI sử dụng**, trách nhiệm và phạm vi truy cập dữ liệu (Data Access Scope).
   - Giúp giải thích nghiệp vụ và phân quyền RBAC, **không tự động tạo thêm chức năng mới**.
3. **Kế hoạch UI/UX**:  
   - Quyết định cách thức tổ chức, trình bày và thiết kế giao diện cho các chức năng đã có trong phạm vi.

---

## 2. Kiến Trúc Điều Hướng Sidebar 5 Phân Hệ (Chuẩn Hóa Theo Backlog)

```
PharmaChain Navigation Structure
│
├── 1. Bàn Làm Việc
│   └── Trang chủ (/home)
│
├── 2. Bán Hàng & Khách Hàng
│   ├── Bán hàng / POS (/pos)
│   ├── Hóa đơn bán lẻ (/sales)
│   ├── Doanh thu hàng ngày (/sales?tab=overview)
│   ├── Quản lý ca làm việc (/shifts)
│   └── Khách hàng (/customers)
│
├── 3. Kho & Tồn Kho
│   ├── Tồn kho cửa hàng (/store/inventory)
│   ├── Kiểm kê kho cửa hàng (/store/audit)
│   ├── Yêu cầu lĩnh thuốc (/store/requisitions)
│   ├── Phiếu nhận hàng cửa hàng (/store/receipts)
│   ├── Tồn kho tổng FEFO (/warehouse/inventory)
│   ├── Lịch sử nhập hàng (/warehouse/inventory?tab=history)
│   ├── Vị trí kệ / Bin (/warehouse/inventory?tab=locations)
│   ├── Điều chỉnh tồn kho (/warehouse/inventory?tab=adjustments)
│   ├── Cảnh báo tồn thấp (/warehouse/alerts?type=low-stock)
│   ├── Cảnh báo hết hạn (/warehouse/alerts?type=expiring)
│   ├── Yêu cầu điều chuyển (/warehouse/replenishment)
│   ├── Xuất hàng cho cửa hàng (/warehouse/replenishment?tab=dispatch)
│   └── Nhận hàng mua vào kho tổng (/warehouse/purchase-receipts)
│
├── 4. Thu Mua & Nhà Cung Cấp
│   ├── Yêu cầu mua hàng (/procurement/requests)
│   ├── Nhà cung cấp (/supplier)
│   ├── RFQ & Báo giá (/procurement/rfq)
│   ├── So sánh báo giá (/procurement/rfq?tab=compare)
│   ├── Đề xuất mua hàng (/procurement/proposals)
│   └── Đơn đặt hàng PO (/procurement/orders)
│
└── 5. Danh Mục, Quản Trị & Báo Cáo
    ├── Danh mục thuốc & Giá (/products)
    ├── Nhóm thuốc GSP (/categories)
    ├── Quản lý người dùng (/users)
    ├── Phân quyền vai trò (/users?tab=roles)
    ├── Nhật ký kiểm toán (/audit-log)
    ├── Báo cáo lợi nhuận (/reports/profit)
    ├── Báo cáo tồn kho (/reports/inventory)
    └── Xuất báo cáo (/reports/export)
```

> **Quy tắc Authentication**: Không đưa các chức năng Xác thực vào Sidebar.  
> - Đăng nhập / Quên mật khẩu: Nằm ở trang xác thực ngoài.  
> - Đổi mật khẩu / Hồ sơ cá nhân / Đăng xuất: Nằm ở Avatar Dropdown góc trên bên phải và thẻ người dùng chân Sidebar.

---

## 3. Quy Chuẩn Bàn Làm Việc (HomePage)

> **HomePage không phải là module thứ 73**. HomePage chỉ đóng vai trò là Hub điều phối vận hành và tổng hợp dữ liệu sẵn có từ 72 chức năng:

1. **Hiển thị định danh**: Tên nhân viên, vai trò hệ thống, chi nhánh trực thuộc (từ `useAuth()`).
2. **Hiển thị KPI theo Role & Data Access Scope**:
   - *Doanh thu hôm nay*: Chỉ tính các hóa đơn **đã thanh toán thành công** (`status = PAID`), loại trừ hóa đơn hủy/trả hàng.
   - *Số hóa đơn*: Tổng số hóa đơn bán lẻ phát sinh trong ngày làm việc.
   - *Cảnh báo tồn thấp & Cận hạn*: Hiển thị theo kho/chi nhánh được phân quyền của người dùng.
   - *Yêu cầu chờ xử lý*: Lọc theo trạng thái chờ duyệt thực tế (`status = PENDING`).
   - *Ca chưa chốt*: Dược sĩ chỉ thấy ca cá nhân; Cửa hàng trưởng thấy toàn bộ ca trong chi nhánh.
3. **Phím tắt nhanh (Quick Actions)**: Dẫn thẳng tới các chức năng được phân quyền của từng vai trò.
4. **Tuyệt đối không có**: Biểu đồ Marketing, Quản lý chấm công/lương, Báo cáo tài chính chuyên sâu ngoài phạm vi.

---

## 4. Chuỗi Luồng Nghiệp Vụ Chuẩn (10 Bước Khép Kín)

```
[1] Yêu cầu mua hàng (Purchase Request)
       ↓
[2] Lập đề xuất mua hàng (Purchase Proposal)
       ↓
[3] Gửi yêu cầu báo giá tới NCC (RFQ via Email)
       ↓
[4] Tiếp nhận & So sánh báo giá (Quotation Comparison)
       ↓
[5] Tạo & Phê duyệt đơn mua hàng (PO Approval - General Manager duyệt)
       ↓
[6] Nhận hàng mua vào Kho tổng (Warehouse Purchase Receipt - FEFO Batch)
       ↓
[7] Quản lý tồn kho tổng, vị trí ô kệ & Điều chỉnh tồn (Warehouse Inventory & Adjustments)
       ↓
[8] Cửa hàng lập yêu cầu lĩnh thuốc (Store Replenishment Request)
       ↓
[9] Kho tổng duyệt, xuất điều chuyển & Cửa hàng xác nhận nhận hàng (Goods Issue & Store Receipt)
       ↓
[10] Bán lẻ tại quầy POS & Đối soát doanh thu ca / ngày (POS Sales, Payment & Daily Sales Reconcile)
```

---

## 5. Ma Trận Vai Trò & Phân Quyền (RBAC Matrix)

| Vai trò | Phạm vi dữ liệu | Quyền hạn chính | Giới hạn bắt buộc |
| :--- | :--- | :--- | :--- |
| **General Manager** | Toàn chuỗi | Xem toàn bộ báo cáo doanh thu, lợi nhuận, tồn kho; **phê duyệt đơn mua hàng PO**. | Không thao tác bán lẻ POS hay xuất nhập kho chi tiết. |
| **Purchasing Staff** | Nghiệp vụ thu mua | Quản lý NCC, tạo yêu cầu mua, gửi RFQ, so sánh báo giá, lập đề xuất mua hàng. | **Không tự duyệt PO**. Quyền duyệt PO thuộc Tổng Giám Đốc. |
| **Warehouse Manager** | Kho tổng trung tâm | Quản lý lô FEFO, vị trí ô kệ, duyệt phiếu điều chỉnh kho, duyệt cấp phát chi nhánh, xuất hàng điều chuyển. | Không bán lẻ POS; không duyệt PO. |
| **Warehouse Staff** | Kho tổng trung tâm | Nhận hàng mua, phân bổ vị trí ô kệ, thực hiện xuất điều chuyển, kiểm kê kho. | Không duyệt điều chỉnh tồn kho; không duyệt cấp phát. |
| **Store Manager** | Chi nhánh phụ trách | Bán lẻ, mở/đóng ca, đối soát doanh thu, kiểm kê kho cửa hàng, tạo yêu cầu lĩnh thuốc, nhận hàng. | Không xem dữ liệu chi nhánh khác; không duyệt điều chỉnh kho tổng. |
| **Pharmacist** | Chi nhánh phụ trách | Mở/đóng ca cá nhân, bán lẻ POS, tiếp nhận thanh toán, tra cứu thông tin khách hàng, xem tồn kho cửa hàng. | Không duyệt đối soát chốt sổ ngày; không xuất hàng chuyển kho. |
| **Admin** | Toàn hệ thống | Quản trị tài khoản người dùng, gán vai trò, cấu hình hệ thống, xem nhật ký kiểm toán (Audit Log). | Không trực tiếp tham gia giao dịch bán lẻ hàng ngày. |
