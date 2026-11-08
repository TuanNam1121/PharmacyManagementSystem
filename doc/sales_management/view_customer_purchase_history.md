# Đặc Tả Kỹ Thuật: 3.7.4 View Customer Purchase History & Sales Invoices List (Quản Lý Hóa Đơn Bán Lẻ & Tra Cứu Lịch Sử Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC24` (SRS 3.7.4)
- **Tên Use Case**: View Customer Purchase History & Sales Invoices List (Quản lý hóa đơn bán lẻ & Tra cứu lịch sử mua hàng)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Store Manager` (Quản lý cửa hàng), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: 
  1. Cung cấp bảng quản lý toàn bộ các giao dịch hóa đơn bán lẻ phát sinh trong ngày làm việc hoặc theo khoảng thời gian tại nhà thuốc.
  2. Hỗ trợ thanh tìm kiếm thông minh đa tiêu chí: tra cứu tức thì theo **Mã hóa đơn** (VD: `INV-20261108-3910`), theo **Tên khách hàng** hoặc **Số điện thoại**.
  3. Cung cấp cột thao tác (`Actions`) trực tiếp trên từng dòng hóa đơn:
     - **Xem chi tiết hóa đơn**: Xem modal toàn bộ thông tin đơn hàng, danh sách thuốc, hàm lượng, số lô, hạn dùng, đơn vị bán (Viên/Vỉ/Hộp), giá bán, số lượng, tiền hàng, thông tin thanh toán và dược sĩ thực hiện.
     - **Trả hàng (Đổi trả hóa đơn)**: Kích hoạt nhanh Modal hoàn trả/đổi thuốc (chuyển sang flow UC25), hỗ trợ hoàn tiền trực tiếp cho khách hàng.
  4. Hỗ trợ Dược sĩ tra cứu nhanh toàn bộ lịch sử các lần mua thuốc cũ của một khách hàng cụ thể để nắm bắt phác đồ điều trị, kiểm tra nguy cơ dị ứng/tương tác thuốc và sao chép đơn cũ vào giỏ POS.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập vào hệ thống với vai trò Dược sĩ hoặc Quản lý chi nhánh.
- **Hậu điều kiện (Postconditions)**:
  - Danh sách hóa đơn được hiển thị phân trang rõ ràng, sắp xếp từ mới nhất đến cũ nhất.
  - Cho phép xem chi tiết và kích hoạt đổi trả thuốc chính xác theo quy trình GPP.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính 1: Quản lý & Tra Cứu Danh Sách Hóa Đơn Bán Lẻ
1. Dược sĩ / Quản lý truy cập màn hình **"Hóa Đơn Bán Lẻ Trong Ngày"** (hoặc tab Hóa đơn trong trang Quản lý Bán Lẻ).
2. Hệ thống tải danh sách các hóa đơn bán lẻ phát sinh trong ngày làm việc của ca/chi nhánh hiện tại.
3. **Tìm kiếm & Lọc dữ liệu**:
   - Dược sĩ nhập từ khóa vào ô tìm kiếm đa năng:
     * Gõ **Mã hóa đơn** (VD: `INV-20261108-3910` hoặc `3910`).
     * Gõ **Tên khách hàng** (VD: `Nguyễn Văn A`).
     * Gõ **Số điện thoại khách hàng** (VD: `0987123456`).
   - Hệ thống tự động lọc dữ liệu thời gian thực (sau debounce 300ms) hoặc khi bấm phím `Enter`.
4. Bảng dữ liệu hiển thị danh sách các cột chuẩn:
   - `MÃ HÓA ĐƠN`: Mã hóa đơn bán lẻ (Màu xanh thương hiệu, in đậm).
   - `MÃ ĐƠN THUỐC`: Mã đơn thuốc bác sĩ (nếu có bán theo đơn), hiển thị badge xám.
   - `KHÁCH HÀNG`: Tên khách hàng & Số điện thoại (Hiển thị rõ ràng).
   - `THỜI GIAN`: Ngày giờ hoàn tất giao dịch (`HH:mm dd/MM/yyyy`).
   - `HÌNH THỨC TT`: Badge hiển thị: `Tiền mặt` (Xanh lá) hoặc `Chuyển khoản PayOS` (Xanh dương).
   - `TIỀN HÀNG`: Tổng giá trị tiền thuốc trước giảm giá.
   - `GIẢM GIÁ`: Tiền chiết khấu/khuyến mãi (nếu có).
   - `KHÁCH PHẢI TRẢ`: Tổng tiền thực tế khách đã thanh toán (Màu đậm, cỡ chữ to).
   - `TRẠNG THÁI`: Badge trạng thái: `Đã thanh toán` (Xanh lá), `Đã trả hàng` (Đỏ/Cam).
   - **`THAO TÁC (ACTIONS)`**: Gồm 2 nút thao tác chính:
     * **Nút "Xem Chi Tiết" (Icon Chi tiết / Mắt)**.
     * **Nút "Trả Hàng" (Icon Hoàn trả / Đổi thuốc)**.

5. **Thao tác A: Bấm nút "Xem Chi Tiết"**:
   - Hệ thống hiển thị Modal **"Chi Tiết Hóa Đơn Bán Lẻ"**:
     * Thông tin tiêu đề: Mã hóa đơn, Chi nhánh xuất bán, Tên dược sĩ/thu ngân lập hóa đơn, Thời gian tạo đơn.
     * Thông tin khách hàng: Tên khách hàng, Số điện thoại, Điểm tích lũy nhận được.
     * Bảng danh sách các mặt hàng thuốc trong đơn: STT, Tên biệt dược/hoạt chất, Số lô, Hạn dùng, Đơn vị tính lúc bán (Viên/Vỉ/Hộp), Đơn giá, Số lượng bán, Thành tiền, Hướng dẫn liều dùng.
     * Tóm tắt thanh toán: Tiền hàng, Chiết khấu, Thuế VAT, Tổng tiền thanh toán, Tiền khách đưa, Tiền thừa trả lại, Mã tham chiếu ngân hàng PayOS (nếu có).
     * Nút "In lại hóa đơn" (Re-print khổ K80) và nút "Đóng".

6. **Thao tác B: Bấm nút "Trả Hàng"**:
   - Hệ thống kiểm tra điều kiện hóa đơn:
     * Chỉ hóa đơn có trạng thái `PAID` (Đã thanh toán) và chưa bị trả toàn bộ mới được phép trả hàng.
   - Hệ thống tự động mở Modal **"Đổi Trả Hóa Đơn" (Sales Return Modal - UC25)**:
     * Nạp sẵn toàn bộ danh sách thuốc và số lượng đã mua của hóa đơn này.
     * Dược sĩ chọn các mặt hàng cần trả, nhập số lượng trả (không vượt quá số lượng đã mua), chọn lý do trả hàng (Hỏng bao bì, thuốc không hợp, bác sĩ đổi đơn...).
     * Hệ thống tự động tính tiền cần hoàn trả lại cho khách hàng.
     * Dược sĩ bấm "Xác nhận trả hàng & Hoàn tiền". Hóa đơn cập nhật trạng thái `RETURNED`, thuốc được nhập hoàn lại tồn kho chi nhánh theo đơn vị cơ bản.

---

### 2.2. Luồng chính 2: Tra Cứu Lịch Sử Mua Hàng Của Khách Hàng (Customer History Drawer)
1. Tại màn hình bán lẻ POS hoặc màn hình chi tiết khách hàng, Dược sĩ bấm nút **"Lịch sử mua hàng" (Phím tắt F7)**.
2. Dược sĩ tìm kiếm theo Số điện thoại khách hàng.
3. Hệ thống mở thanh trượt Drawer hiển thị:
   - Thông tin tổng quan khách hàng: Họ tên, SĐT, Điểm tích lũy, Tổng chi tiêu trọn đời, Cảnh báo dị ứng thuốc/bệnh mãn tính.
   - Danh sách các lần mua hàng cũ từ mới nhất đến cũ nhất.
4. Dược sĩ có thể bấm nút **"Sao chép đơn cũ vào giỏ hàng" (Re-order)** để nạp nhanh danh mục thuốc khách quen hay uống vào đơn bán hiện tại.

---

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Tìm kiếm đa tiêu chí)**: Ô tìm kiếm hóa đơn phải hỗ trợ đồng thời 3 tiêu chí: Mã hóa đơn, Tên khách hàng, Số điện thoại. Tìm kiếm không phân biệt hoa thường và hỗ trợ tiếng Việt có dấu lẫn không dấu.
- **BR-02 (Ràng buộc quyền Đổi trả hàng)**:
  - Chỉ cho phép trả hàng với các hóa đơn phát sinh trong vòng **7 ngày** (theo chính sách nhà thuốc).
  - Hóa đơn đã hoàn trả toàn bộ (`RETURNED`) sẽ bị làm mờ nút "Trả hàng" (disabled) kèm chú thích *"Hóa đơn đã hoàn trả toàn bộ"*.
- **BR-03 (Bảo toàn dữ liệu lịch sử)**: Khi xem chi tiết hóa đơn, các thông số về đơn vị tính (`unit_name`), hệ số quy đổi (`conversion_factor`), số lượng cơ bản (`base_quantity`) và đơn giá tại thời điểm bán phải được giữ nguyên vẹn, không bị ảnh hưởng nếu sau này sản phẩm có đổi giá niêm yết.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Bảng Hóa Đơn Bán Lẻ (`DailySalesInvoicesTable.jsx`)

#### Thanh công cụ tìm kiếm trên đầu bảng:
| STT | Thành phần | Control Type | Mô tả & Chức năng |
| :---: | :--- | :--- | :--- |
| 1 | Ô tìm kiếm đa năng | `input[type=text]` | Placeholder: *"Tìm kiếm theo mã hóa đơn, tên khách hàng, số điện thoại..."*. Có icon kính lúp. |
| 2 | Bộ lọc trạng thái | Dropdown Select | Các tùy chọn: `Tất cả trạng thái`, `Đã thanh toán`, `Đã trả hàng`. |
| 3 | Bộ lọc phương thức | Dropdown Select | Các tùy chọn: `Tất cả hình thức`, `Tiền mặt`, `Chuyển khoản PayOS`. |
| 4 | Tổng số bản ghi | Badge Tag | Hiển thị: *"X hóa đơn"*. |

#### Các cột trong bảng:
| STT | Tên cột hiển thị | Kiểu dữ liệu | Mô tả chi tiết |
| :---: | :--- | :--- | :--- |
| 1 | **Mã Hóa Đơn** | String (Code) | VD: `INV-20261108-3910`. Font đậm, màu xanh lá thương hiệu. |
| 2 | **Mã Đơn Thuốc** | String (Badge) | VD: `12222`. Nếu không có hiển thị dấu `-`. |
| 3 | **Khách Hàng** | Complex Text | Hiển thị Họ tên khách hàng (in đậm) và Số điện thoại bên dưới (VD: `Trần Thị Lan` • `0987123456`). |
| 4 | **Thời Gian** | Date Time | Định dạng: `HH:mm dd/MM/yyyy` (VD: `18:40 08/11/2026`). |
| 5 | **Hình Thức TT** | Badge Tag | Xanh lá: `Tiền mặt`, Xanh dương: `Chuyển khoản PayOS`. |
| 6 | **Tiền Hàng** | Currency | Căn phải. Định dạng tiền tệ (VD: `17,000 VND`). |
| 7 | **Giảm Giá** | Currency | Căn phải. Định dạng tiền tệ (hoặc `-` nếu 0đ). |
| 8 | **Khách Phải Trả** | Currency | Căn phải. In đậm cỡ chữ 14 (VD: `17,000 VND`). |
| 9 | **Trạng Thái** | Badge Status | Xanh lá: `Đã thanh toán`, Đỏ/Cam: `Đã trả hàng`. |
| 10 | **Thao Tác** | Action Buttons | Gồm 2 nút bấm nhỏ tiện ích: <br>- Nút **Chi tiết** (Icon mắt / Button xám viền bo tròn) <br>- Nút **Trả hàng** (Icon hoàn trả / Button cam nhạt) |

---

### 3.2. Modal Chi Tiết Hóa Đơn Bán Lẻ (`InvoiceDetailModal.jsx`)
- **Header**: Mã hóa đơn + Badge trạng thái + Nút đóng.
- **Khối thông tin hành chính (2 cột)**:
  - Cột 1: Chi nhánh bán, Dược sĩ phụ trách ca, Thời gian giao dịch.
  - Cột 2: Khách hàng (Tên, SĐT, Điểm tích lũy), Phương thức thanh toán (Tiền mặt / PayOS VietQR kèm mã GD).
- **Bảng danh sách thuốc chi tiết**:
  - Cột: STT, Tên thuốc & hoạt chất, Số lô, Hạn dùng, ĐVT bán (Hộp/Vỉ/Viên), Đơn giá, Số lượng, Thành tiền, Liều dùng.
- **Footer**:
  - Nút `In hóa đơn K80` (Icon máy in).
  - Nút `Trả hàng hóa đơn này` (nếu chưa trả).
  - Nút `Đóng`.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contracts

#### API 1: Tìm kiếm & Phân trang danh sách hóa đơn bán lẻ
- **Endpoint**: `GET /api/v1/sales/invoices`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Query Parameters**:
  * `keyword` (String, optional): Tìm kiếm theo mã hóa đơn, tên khách hàng hoặc SĐT.
  * `storeId` (Long, optional): Lọc theo ID chi nhánh.
  * `shiftId` (Long, optional): Lọc theo ID ca làm việc.
  * `customerId` (Long, optional): Lọc theo ID khách hàng cụ thể.
  * `status` (Short, optional): `1` (Đã thanh toán / COMPLETED), `2` (Đã trả hàng / RETURNED).
  * `page` (Integer, default: 0)
  * `size` (Integer, default: 10)
- **Response Payload (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Lấy danh sách hóa đơn thành công",
    "data": {
      "content": [
        {
          "id": 1205,
          "code": "INV-20261108-3910",
          "prescriptionCode": "12222",
          "customerId": 105,
          "customerName": "Trần Thị Lan",
          "customerPhone": "0987123456",
          "storeId": 1,
          "storeName": "Nhà thuốc Chi nhánh 1",
          "cashierName": "Nguyễn Văn Dược",
          "totalAmount": 17000.00,
          "discountAmount": 0.00,
          "netAmount": 17000.00,
          "paymentMethod": "CASH",
          "paymentStatus": "PAID",
          "invoiceStatus": "COMPLETED",
          "canReturn": true,
          "createdAt": "2026-11-08T18:40:00"
        }
      ],
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 1,
      "totalPages": 1
    }
  }
  ```

#### API 2: Lấy chi tiết toàn bộ hóa đơn bán lẻ
- **Endpoint**: `GET /api/v1/sales/invoices/{codeOrId}`
- **Query Params**: Cho phép truyền ID số nguyên hoặc chuỗi mã hóa đơn (`INV-...`).
- **Response Payload (200 OK)**:
  Trả về đầy đủ thông tin hóa đơn, danh sách chi tiết từng loại thuốc (`items`) kèm `unitName`, `conversionFactor`, `batchNumber`, `expiryDate` và thông tin thanh toán `payments`.

---

## 5. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Mô tả & Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-INV-01** | Tìm kiếm theo mã hóa đơn | Gõ `INV-20261108-3910` vào thanh search | Lọc chính xác 1 dòng hóa đơn khớp mã |
| **TC-INV-02** | Tìm kiếm theo tên khách hàng | Gõ `Trần Thị Lan` | Hiển thị tất cả các hóa đơn của khách hàng Trần Thị Lan |
| **TC-INV-03** | Tìm kiếm theo số điện thoại | Gõ `0987123456` | Hiển thị các hóa đơn gắn với số điện thoại này |
| **TC-INV-04** | Bấm nút Xem chi tiết hóa đơn | Click nút "Xem chi tiết" tại dòng hóa đơn | Hiển thị Modal chi tiết với đầy đủ danh sách thuốc, số lô, hạn dùng, giá và phương thức thanh toán |
| **TC-INV-05** | Bấm nút Trả hàng | Click nút "Trả hàng" tại dòng hóa đơn | Bật Modal Đổi trả hóa đơn (UC25), nạp sẵn danh sách thuốc để chọn số lượng hoàn trả |
| **TC-INV-06** | Hóa đơn đã hoàn trả toàn bộ | Hóa đơn có status = `RETURNED` | Nút "Trả hàng" bị disabled, không cho trả lại lần 2 |
