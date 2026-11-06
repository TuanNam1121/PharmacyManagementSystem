# PharmaChain — Quy Chuẩn Kiểm Soát Phạm Vi Dự Án (Project Scope Control)

> **Căn cứ tối cao**: `PharmacistManagementSystem_Backlog.xlsx` (72 chức năng, 17 nhóm)  
> **Nguyên tắc cốt lõi**: Khóa cứng phạm vi chức năng theo đúng Backlog. Không tự ý mở rộng sang các module ngoài phạm vi (Marketing, Loyalty đa tầng, HR/Payroll, Accounting tài chính, Prescriptions độc lập).

---

## 1. Hệ Thống 3 Căn Cứ & Thứ Tự Ưu Tiên Tuyệt Đối

1. **Product Backlog Excel (`PharmacistManagementSystem_Backlog.xlsx`)**:  
   - Quyết định chức năng nào **ĐƯỢC PHÉP** triển khai (chính xác 72 chức năng thuộc 17 nhóm).
   - Ranh giới cứng: Mọi API, UI và bảng DB phải gắn với 1 trong 72 chức năng này.
2. **Organizational Document (`doc/SBA301_SRS_Group5 (3).docx`)**:  
   - Xác định **AI sử dụng**, trách nhiệm và phạm vi truy cập dữ liệu (Data Access Scope).
   - Phân biệt rõ chức danh tổ chức vs Role trong hệ thống; **không tự động tạo thêm chức năng mới ngoài Backlog**.
3. **Kế Hoạch UI/UX**:  
   - Chuẩn hóa cách bố cục, trình bày và trải nghiệm cho 72 chức năng đã có.

---

## 2. Kiến Trúc Điều Hướng Sidebar 5 Phân Hệ (Khớp Mã Nguồn Thực Tế)

> [!NOTE]
> Các mục điều hướng sử dụng **đường dẫn route thực tế đã được định tuyến trong `App.jsx`**, không sử dụng query param giả định để bảo đảm tính tương thích với `location.pathname` và `BREADCRUMB_MAP`.

```
PharmaChain Navigation Structure
│
├── 1. Bàn Làm Việc
│   └── Trang chủ (/home)
│
├── 2. Bán Hàng & Khách Hàng
│   ├── Quầy bán lẻ POS (/pos)                  # Dược sĩ bán lẻ tại quầy, quét mã vạch, thanh toán
│   ├── Hóa đơn bán lẻ (/sales)                 # Tra cứu danh sách hóa đơn, lịch sử bán hàng
│   ├── Quản lý ca làm việc (/shifts)           # Mở/đóng ca trực, kiểm đếm tiền mặt đầu/cuối ca
│   └── Khách hàng (/customers)                 # Danh bạ khách hàng & lịch sử mua thuốc (không có bệnh án)
│
├── 3. Kho & Tồn Kho
│   ├── Tồn kho cửa hàng (/store/inventory)     # Tồn kho chi nhánh theo số lượng & hạn dùng
│   ├── Kiểm kê kho cửa hàng (/store/audit)     # Phiếu kiểm kê định kỳ tại chi nhánh
│   ├── Yêu cầu lĩnh thuốc (/store/requisitions)# Cửa hàng lập phiếu xin cấp phát thuốc từ Kho tổng
│   ├── Phiếu nhận hàng (/store/receipts)       # Cửa hàng xác nhận nhận hàng chuyển từ Kho tổng
│   ├── Tồn kho tổng FEFO (/warehouse/inventory)# Quản lý lô FEFO, hạn dùng & vị trí kệ kho tổng
│   ├── Lịch sử nhập hàng (/warehouse/receipts) # Lịch sử tiếp nhận lô hàng từ nhà cung cấp
│   ├── Điều chỉnh tồn kho (/warehouse/adjustments) # Phiếu điều chỉnh do hao hụt, hỏng vỡ, hết hạn
│   ├── Cảnh báo kho dược (/warehouse/alerts)   # Cảnh báo thuốc tồn thấp & thuốc cận hạn dùng
│   └── Điều chuyển chi nhánh (/warehouse/replenishment) # Kho tổng duyệt yêu cầu & xuất kho giao vận
│
├── 4. Thu Mua & Nhà Cung Cấp
│   ├── Yêu cầu mua hàng (/procurement/requests)# Danh sách yêu cầu mua bổ sung thuốc toàn chuỗi
│   ├── Nhà cung cấp (/supplier)                # Danh bạ nhà cung cấp dược phẩm, thông tin liên hệ
│   ├── RFQ & Báo giá (/procurement/rfq)        # Yêu cầu báo giá, tiếp nhận & so sánh báo giá
│   ├── Đề xuất mua hàng (/procurement/proposals)# Lập tờ trình đề xuất mua hàng tối ưu
│   └── Đơn đặt hàng PO (/procurement/orders)   # Đơn đặt mua hàng chính thức (Tổng Giám Đốc duyệt)
│
└── 5. Danh Mục, Quản Trị & Báo Cáo
    ├── Danh mục thuốc & Giá (/products)        # Danh mục dược phẩm, hoạt chất & lịch sử giá
    ├── Nhóm thuốc GSP (/categories)            # Nhóm phân loại thuốc theo tiêu chuẩn GSP
    ├── Quản lý người dùng (/users)             # Tài khoản nhân viên, phân quyền vai trò (RBAC)
    ├── Nhật ký kiểm toán (/audit-log)          # Truy vết thao tác nhạy cảm toàn hệ thống
    ├── Báo cáo lợi nhuận (/reports/profit)     # Doanh thu, giá vốn hàng bán & lợi nhuận gộp
    └── Báo cáo tồn kho (/reports/inventory)    # Báo cáo xuất nhập tồn & định giá kho dược
```

> **Quy tắc Authentication**: Không đưa các chức năng Xác thực vào Sidebar.  
> - Đăng nhập (`/login`), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`): Nằm ở giao diện xác thực ngoài.  
> - Đổi mật khẩu, Hồ sơ cá nhân (`/profile`), Đăng xuất: Tích hợp tập trung tại Top-right Avatar Dropdown và thẻ người dùng chân Sidebar.

---

## 3. Quy Chuẩn Bàn Làm Việc (HomePage)

> **HomePage không phải là module thứ 73**. HomePage chỉ là Hub điều phối vận hành và hiển thị dữ liệu tổng hợp từ 72 chức năng sẵn có:

### 3.1. Hiển thị KPI theo Role & Data Access Scope
- **Doanh thu hôm nay**: Chỉ tính tổng tiền của các hóa đơn **đã thanh toán thành công** (`status = PAID`), **loại trừ tuyệt đối** các hóa đơn đã hủy (`CANCELLED`) hoặc hoàn trả (`RETURNED`).
- **Số hóa đơn đã bán**: Đếm số hóa đơn hợp lệ đã phát sinh trong ngày làm việc.
- **Cảnh báo tồn kho thấp & Cận hạn**:
  - Đối với Quản lý kho tổng: Hiển thị phạm vi Kho tổng trung tâm (`WH01`).
  - Đối với Cửa hàng trưởng / Dược sĩ: Hiển thị phạm vi cửa hàng được phân công (`assigned store_id`).
  - Mốc cận hạn được áp dụng theo cấu hình hệ thống (`system_settings`, mặc định cảnh báo lô có hạn dùng $\le 90$ ngày theo tiêu chuẩn FEFO ngành dược).
- **Yêu cầu chờ xử lý (Pending Actions)**:
  - Yêu cầu mua hàng: Các phiếu ở trạng thái `PENDING`.
  - Yêu cầu điều chuyển: Các phiếu xin cấp phát ở trạng thái `PENDING`.
  - Đơn đặt hàng PO: Các đơn mua hàng ở trạng thái `SUBMITTED` đang chờ Ban Giám Đốc duyệt.
- **Ca làm việc chưa chốt**:
  - Dược sĩ: Chỉ hiển thị cảnh báo nếu ca làm việc cá nhân chưa đóng (`status = OPEN`).
  - Cửa hàng trưởng: Hiển thị tổng số ca chưa đóng tại chi nhánh phụ trách.
- **Quyền xem báo cáo**: Dược sĩ/Nhân viên kho **không nhìn thấy** chỉ số doanh thu toàn chuỗi; Tổng Giám Đốc/Admin nhìn thấy số liệu tổng hợp toàn chuỗi.

### 3.2. Không được phép triển khai tại HomePage
- Không có biểu đồ hiệu quả chiến dịch Marketing / Khuyến mãi.
- Không có báo cáo nhân sự, chấm công, tính lương.
- Không có hệ thống thông báo realtime phức tạp hay CRM ngoài phạm vi.

---

## 4. Chuỗi Luồng Nghiệp Vụ Thu Mua — Kho Vận — Bán Hàng (10 Bước Khép Kín)

```
[1] Yêu cầu mua hàng (Purchase Request - Chi nhánh/Kho lập khi thiếu hàng)
       ↓
[2] Lập đề xuất mua hàng (Purchase Proposal - Nhân viên thu mua gom yêu cầu)
       ↓
[3] Gửi yêu cầu báo giá tới NCC (Send RFQ via Email to Suppliers)
       ↓
[4] Tiếp nhận & So sánh báo giá (Manage & Compare Supplier Quotations)
       ↓
[5] Tạo & Phê duyệt đơn mua hàng (Purchase Order - CHỈ Tổng Giám Đốc có quyền duyệt)
       ↓
[6] Nhận hàng mua vào Kho tổng (Warehouse Purchase Receipt - Lập lô FEFO, số lượng thực nhận)
       ↓
[7] Quản lý tồn kho tổng, vị trí ô kệ & Điều chỉnh tồn (Inventory, Shelf Location & Adjustments)
       ↓
[8] Cửa hàng lập yêu cầu lĩnh thuốc (Store Replenishment Request)
       ↓
[9] Kho tổng duyệt, xuất điều chuyển & Cửa hàng xác nhận nhận hàng (Approve, Dispatch & Goods Receipt)
       ↓
[10] Bán lẻ tại quầy POS & Đối soát doanh thu ca / ngày (POS Sales, Payment & Daily Sales Reconciliation)
```

---

## 5. Ma Trận Vai Trò & Phân Quyền Chi Tiết (RBAC & Data Scope)

| Vai trò hệ thống | Mã | Phạm vi dữ liệu (Data Scope) | Quyền hạn nghiệp vụ cho phép | Giới hạn bắt buộc (KHÔNG ĐƯỢC PHÉP) |
| :--- | :---: | :--- | :--- | :--- |
| **Tổng giám đốc điều hành** (General Manager) | 5 | Toàn chuỗi | Xem toàn bộ báo cáo doanh thu, lợi nhuận, xuất nhập tồn chuỗi; **phê duyệt đơn mua hàng PO lớn**; giám sát toàn diện. | Không trực tiếp thao tác bán lẻ POS hay xuất nhập kho chi tiết. |
| **Nhân viên thu mua** (Purchasing Staff) | 4 | Toàn chuỗi (nghiệp vụ mua) | Quản lý NCC, tạo yêu cầu mua hàng, gửi RFQ, so sánh báo giá, tạo đề xuất mua hàng (PO). | **TUYỆT ĐỐI KHÔNG ĐƯỢC DUYỆT PO**. Quyền duyệt PO thuộc Tổng Giám Đốc. |
| **Quản lý kho tổng** (Warehouse Manager) | 6 | Kho tổng trung tâm (`WH01`) | Quản lý lô FEFO, vị trí ô kệ, duyệt phiếu điều chỉnh kho, duyệt yêu cầu cấp phát chi nhánh, xuất hàng điều chuyển. | Không thao tác bán lẻ POS; không duyệt PO mua hàng. |
| **Thủ kho / Nhân viên kho** (Warehouse Staff) | 7 | Kho tổng trung tâm (`WH01`) | Tiếp nhận kiểm đếm hàng nhập mua, gắn vị trí ô kệ, thực hiện xuất kho điều chuyển theo lệnh đã duyệt, kiểm kê kho. | Không duyệt điều chỉnh tồn kho; không duyệt yêu cầu cấp phát. |
| **Cửa hàng trưởng chi nhánh** (Store Manager) | 2 | **Chỉ tại chi nhánh được phân công** (`assigned store_id`) | Bán lẻ, mở/đóng ca, đối soát chốt sổ doanh thu ngày của chi nhánh, kiểm kê kho cửa hàng, tạo yêu cầu lĩnh thuốc, xác nhận nhận hàng. | Không xem dữ liệu của chi nhánh khác; không duyệt điều chỉnh kho tổng; không duyệt PO. |
| **Dược sĩ tư vấn & Thu ngân** (Pharmacist) | 3 | **Chỉ tại ca và quầy chi nhánh được phân công** | Mở/đóng ca cá nhân, lập hóa đơn bán lẻ POS, tiếp nhận thanh toán, tra cứu thông tin khách hàng, xem tồn kho cửa hàng. | Không duyệt đối soát chốt sổ ngày; không xuất hàng chuyển kho; không xem doanh thu toàn chuỗi. |
| **Quản trị viên hệ thống** (Admin) | 1 | Toàn hệ thống | Quản trị tài khoản nhân viên, gán vai trò, cấu hình hệ thống, xem nhật ký kiểm toán (Audit Log). | Không trực tiếp tham gia giao dịch bán lẻ hàng ngày. |

---

## 6. Tiêu Chí Nghiệm Thu 5 Chiều Cho Từng Chức Năng (Acceptance Criteria)

Mỗi chức năng trong 72 chức năng chỉ được đánh giá hoàn thành khi thỏa mãn đầy đủ 5 tiêu chí:
1. **Giao diện (UI/UX)**: Hiển thị 100% tiếng Việt (tên thuốc giữ nguyên danh pháp gốc y tế), chiều cao form controls chuẩn 38px, bo góc 8px, không ngắt dòng lệch chuẩn.
2. **Nghiệp vụ API**: Thực thi đúng logic tính toán, chuyển trạng thái đúng quy tắc (ví dụ: hóa đơn thanh toán chuyển sang `PAID`, tồn kho trừ đúng lô FEFO).
3. **Toàn vẹn Database**: Lưu trữ đầy đủ ràng buộc khóa chính/khóa ngoại, cập nhật đúng bảng và cột persisted.
4. **Bảo mật & Phân quyền (RBAC)**: Chỉ cho phép đúng Role và đúng phạm vi chi nhánh (`Data Access Scope`) truy cập.
5. **Xử lý biên & Ngoại lệ (Edge Cases)**: Xử lý mượt mà trạng thái dữ liệu trống (Empty state), đang tải (Loading spinner), và thông báo lỗi rõ ràng khi vi phạm ràng buộc (Error toast).
