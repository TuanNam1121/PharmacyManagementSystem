# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - CỤM CHỨC NĂNG 4: SALES MANAGEMENT

---

## 1. TỔNG QUAN CỤM CHỨC NĂNG
Cụm chức năng **Sales Management** (Quản lý Bán lẻ & Thanh toán POS) là trái tim vận hành của nhà thuốc, phụ trách toàn bộ quy trình:
1. Tiếp nhận và quét mã vạch thuốc, tự động trừ tồn kho theo nguyên tắc Hết hạn trước - Xuất trước (FEFO).
2. Kiểm tra bắt buộc khách hàng định danh (bảo đảm an toàn dị ứng thuốc GPP và tích điểm thành viên).
3. Thanh toán đa kênh tích hợp: Tiền mặt (`CASH`) và Thanh toán Chuyển khoản VietQR tự động qua cổng PayOS (`PAYOS_TRANSFER`).
4. Tiếp nhận trả thuốc / đổi trả hoàn tiền trực tiếp từ danh sách hóa đơn bán lẻ trong ngày.
5. Tra cứu lịch sử mua thuốc của khách hàng để sao chép đơn cũ và tư vấn dùng thuốc an toàn.

---

## 2. DANH SÁCH USE CASE TRONG CỤM
- **UC23**: Create Sales Invoice (Lập hóa đơn bán lẻ thuốc tại quầy POS)
- **UC24**: Process Payment (Xử lý thanh toán Tiền mặt & Chuyển khoản QR PayOS)
- **UC25**: Cancel/Return Sales Invoice (Tiếp nhận trả hàng & Hoàn tiền hóa đơn)
- **UC26**: View Customer Purchase History (Tra cứu lịch sử mua thuốc & Danh sách hóa đơn bán lẻ)

---

## 3. CHI TIẾT YÊU CẦU & ĐẶC TẢ TỪNG CHỨC NĂNG

### 3.1. Chức năng: Create Sales Invoice (Lập hóa đơn bán lẻ thuốc tại quầy POS)

#### Table 3-13: Screen Definition - POS Counter Page (`/pos`)
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Drug Search / Barcode Scanner | Text Input | Yes | 100 | Ô quét mã vạch barcode thuốc hoặc gõ tìm kiếm theo Tên biệt dược, hoạt chất. |
| 2 | Prescription Code | Text Input | No | 50 | Mã đơn thuốc của bác sĩ (nếu bán thuốc kê đơn theo quy định Bộ Y tế). |
| 3 | Order Note | Textarea | No | 255 | Ghi chú dặn dò chung cho đơn hàng. |
| 4 | Cart Items Table | Data Table | Yes | - | Danh sách thuốc trong giỏ hàng: Tên thuốc, Đơn vị tính (Hộp/Vỉ/Viên), Số lượng bán, Đơn giá, Thành tiền, Hướng dẫn liều dùng, Nút xóa. |
| 5 | Customer Identification Box | Info Box | Yes | - | Khung thông tin khách hàng bắt buộc: Tên khách hàng, SĐT, Điểm thưởng. Cung cấp nút "+ Chọn khách hàng" và "+ Tạo mới". |
| 6 | Severe Allergy Warning Banner | Alert Banner (Red) | Conditional | - | Cảnh báo đỏ nổi bật khi thuốc đưa vào giỏ có hoạt chất trùng với tiền sử dị ứng của khách hàng! |
| 7 | Hold Order Button | Button | - | - | Tạm giữ đơn hàng hiện tại khi khách muốn chọn thêm hoặc có khách khác cần tính tiền gấp. |
| 8 | Clear Cart Button | Button | - | - | Xóa sạch toàn bộ giỏ hàng hiện tại. |
| 9 | Subtotal Amount | Text (Currency) | - | - | Tổng tiền hàng trước chiết khấu. |
| 10 | Discount Amount | Number Input | No | 12 | Số tiền giảm giá / chiết khấu cho khách hàng (VND). |
| 11 | Net Amount to Pay | Text (Currency, Bold) | - | - | Tổng tiền khách phải thanh toán = `Subtotal - Discount Amount`. |
| 12 | Proceed to Payment | Button | - | - | Bấm để mở Modal thanh toán (UC24). Bị vô hiệu hóa nếu chưa có thuốc hoặc chưa chọn khách hàng. |

#### 3.2.13.2 Use Case Description - UC23: Create Sales Invoice
- **Use Case ID**: `UC23`
- **Use Case Name**: Create Sales Invoice
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist (Dược sĩ bán thuốc), Cashier (Thu ngân)
- **Description**: Cho phép Dược sĩ tạo lập đơn bán lẻ thuốc tại quầy POS, quét mã vạch, tự động áp dụng quy tắc trừ kho FEFO, cảnh báo chống chỉ định dị ứng thuốc theo hồ sơ khách hàng và chuẩn bị dữ liệu sang cổng thanh toán.
- **Precondition**:
  - `PRE-01`: Nhân viên đã mở ca làm việc hợp lệ (`Shift status = 1` - OPEN).
  - `PRE-02`: Thuốc tồn tại trong kho chi nhánh và còn hạn sử dụng.
- **Trigger**:
  - `TRG-01`: Dược sĩ quét mã vạch sản phẩm hoặc thêm thuốc vào giỏ hàng tại màn hình `/pos`.
- **Post-Condition**:
  - `POS-01`: Hóa đơn bán lẻ được ghi nhận vào cơ sở dữ liệu (`sales_invoices`, `sales_invoice_details`).
  - `POS-02`: Tồn kho thuốc tại chi nhánh được tự động trừ theo đúng số lô FEFO xuất bán.
  - `POS-03`: Điểm tích lũy thành viên của khách hàng được cộng dồn theo quy chế tích điểm.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Tại quầy POS, quét mã vạch hoặc gõ tên thuốc vào ô tìm kiếm. |
| 2 | System | Hệ thống tìm kiếm thuốc trong kho chi nhánh, tự động ưu tiên lấy lô thuốc có hạn dùng gần nhất (FEFO) và thêm vào giỏ hàng. |
| 3 | User | Điều chỉnh số lượng bán, chọn đơn vị tính (Viên / Vỉ / Hộp) và nhập hướng dẫn liều dùng (VD: "Sáng 1 viên, Tối 1 viên sau ăn"). |
| 4 | User | Xác định khách hàng mua thuốc: Bấm nút **+ Chọn khách hàng**, đọc/nhập số điện thoại. Nếu chưa có tài khoản, bấm **+ Tạo mới** để mở Modal đăng ký khách hàng mới. |
| 5 | System | Gán khách hàng vào đơn hàng. Kiểm tra đối soát hoạt chất thuốc trong giỏ hàng với danh sách dị ứng (`allergies`) trong hồ sơ bệnh án của khách. |
| 6 | System | Nếu phát hiện nguy cơ dị ứng, lập tức kích hoạt thanh cảnh báo đỏ nghiêm trọng kèm âm thanh cảnh báo để dược sĩ tư vấn đổi thuốc. |
| 7 | User | Nhập mã đơn thuốc bác sĩ (nếu có đơn) và nhập chiết khấu giảm giá (nếu có chương trình). |
| 8 | User | Bấm nút **Thanh toán (F9)** để chuyển sang quy trình xử lý thanh toán (UC24). |

##### Alternative flows
- **AT01: Chưa chọn khách hàng khi thanh toán (Tại Bước 8)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 8.1 | System | Phát hiện trường `customerId` đang bị trống. |
  | 8.2 | System | Chặn submit và tự động kích hoạt Modal chọn khách hàng để Dược sĩ đọc SĐT khách hàng trước khi xuất hóa đơn. |

- **AT02: Thuốc trong kho không đủ số lượng bán (Tại Bước 3)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 3.1 | System | Phát hiện số lượng bán vượt quá tổng số lượng khả dụng của các lô còn hạn trong kho chi nhánh. |
  | 3.2 | System | Hiển thị thông báo: "Không đủ số lượng tồn kho khả dụng! Hiện tại chỉ còn [X] [Đơn vị]". Tự động đặt số lượng bán bằng tồn kho tối đa. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Hóa đơn bán lẻ bắt buộc phải gắn với một Khách hàng định danh (`customerId != null`) để tích điểm thành viên và kiểm soát nguy cơ dị ứng thuốc theo tiêu chuẩn GPP. |
| **BR-02** | Hệ thống áp dụng quy tắc xuất kho FEFO (First Expired, First Out): tự động trừ tồn kho của lô thuốc có hạn sử dụng gần nhất trước. Tuyệt đối không xuất bán các lô thuốc đã hết hạn sử dụng. |
| **BR-03** | Khách hàng được tích lũy điểm thưởng: mỗi 100.000 VNĐ thanh toán thực tế được cộng 1 điểm tích lũy vào tài khoản thành viên. |

---

### 3.2. Chức năng: Process Payment (Xử lý thanh toán Tiền mặt & Chuyển khoản QR PayOS)

#### Table 3-14: Screen Definition - Payment Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Net Amount to Pay | Highlight Text | - | - | Tổng số tiền khách cần thanh toán (VND). |
| 2 | Payment Method Tabs | Tab Selector | Yes | - | Chọn phương thức thanh toán: `Tiền mặt` (Cash) hoặc `Chuyển khoản VietQR PayOS` (Bank Transfer). |
| 3 | Cash Given by Customer | Number Input | Conditional | 12 | Số tiền khách đưa khi chọn Tiền mặt (cung cấp các nút bấm nhanh: 50k, 100k, 200k, 500k, Tiền chẵn). |
| 4 | Change to Return | Highlight Text | - | - | Tiền thừa thối lại cho khách = `Tiền khách đưa - Cần thanh toán`. |
| 5 | PayOS QR Code Display | Image / Canvas | Conditional | - | Mã VietQR động tạo tự động từ cổng PayOS kèm logo ngân hàng, số tài khoản, số tiền chính xác và nội dung chuyển khoản. |
| 6 | PayOS Countdown Timer | Timer | Conditional | - | Đồng hồ đếm ngược hiệu lực mã QR (15 phút). |
| 7 | Payment Status Live Indicator | Dynamic Badge | - | - | Hiển thị: "Đang chờ khách quét mã..." (Xanh dương) -> "Thanh toán thành công!" (Xanh lá khi nhận Webhook). |
| 8 | Confirm Payment Button | Button | - | - | Xác nhận thanh toán hóa đơn. |
| 9 | Cancel / Close | Button | - | - | Hủy bỏ thanh toán và quay lại giỏ hàng POS. |

#### 3.2.14.2 Use Case Description - UC24: Process Payment
- **Use Case ID**: `UC24`
- **Use Case Name**: Process Payment
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Cashier
- **Description**: Xử lý giao dịch thu tiền khách hàng qua 2 hình thức: Tiền mặt (tự động tính tiền thừa) và Chuyển khoản ngân hàng tự động nhận tiền qua mã VietQR của cổng thanh toán PayOS (tự động xác nhận thành công qua Webhook thời gian thực).
- **Precondition**:
  - `PRE-01`: Đơn hàng tại quầy POS đã có ít nhất một mặt hàng và đã chọn khách hàng định danh.
- **Trigger**:
  - `TRG-01`: Dược sĩ bấm nút "Thanh toán" (F9) từ màn hình giỏ hàng POS.
- **Post-Condition**:
  - `POS-01`: Bản ghi thanh toán được lưu vào bảng `payments` với mã giao dịch tương ứng.
  - `POS-02`: Hóa đơn bán lẻ chuyển trạng thái sang `status = 1` (PAID - Đã thanh toán).
  - `POS-03`: Tự động in hóa đơn bán lẻ khổ K80 và mở ngăn kéo két tiền (nếu thanh toán tiền mặt).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Bấm nút **Thanh toán** tại quầy POS. |
| 2 | System | Mở Modal Thanh Toán (Payment Modal) theo Table 3-14 với số tiền cần thanh toán hiển thị to bản. |
| 3 | User | Chọn phương thức thanh toán: **Tiền mặt** hoặc **Chuyển khoản QR PayOS**. |
| 4A | User/System | **Nhánh A: Thanh toán Tiền mặt (Cash Flow)**:<br>1. Dược sĩ nhập số tiền khách đưa (hoặc bấm chọn nút tiền nhanh).<br>2. Hệ thống tính toán và hiển thị số tiền thừa cần trả lại khách.<br>3. Dược sĩ bấm **Xác nhận thanh toán (F10)**. |
| 4B | User/System | **Nhánh B: Thanh toán Chuyển khoản QR PayOS (PayOS Flow)**:<br>1. Hệ thống tự động gọi API `POST /api/v1/payments/payos/create-payment-link` kèm mã hóa đơn và số tiền.<br>2. Máy chủ kết nối PayOS SDK, tạo liên kết thanh toán và trả về mã VietQR động.<br>3. Khách hàng dùng app ngân hàng quét mã QR trên màn hình phụ và xác nhận chuyển khoản.<br>4. Máy chủ PayOS gửi thông báo Webhook (`PAID`) tới Backend hệ thống.<br>5. Backend xác thực chữ ký bảo mật Checksum (`HMAC_SHA256`), cập nhật giao dịch thành công và đẩy thông báo thời gian thực về màn hình POS.<br>6. Màn hình thanh toán tự động chuyển sang tích xanh: "Thanh toán thành công!". |
| 5 | System | Ghi nhận bản ghi thanh toán vào bảng `payments`, cập nhật `sales_invoices.status = 1` (PAID). |
| 6 | System | Hiển thị Modal Xem & In Hóa Đơn Bán Lẻ khổ K80. Tự động xóa giỏ hàng và sẵn sàng cho khách tiếp theo. |

##### Alternative flows
- **AT01: Tiền khách đưa nhỏ hơn tiền phải trả (Nhánh Tiền mặt Tại Bước 4A)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4A.1 | System | Phát hiện số tiền khách đưa nhỏ hơn tổng tiền hóa đơn. |
  | 4A.2 | System | Vô hiệu hóa nút xác nhận thanh toán và báo đỏ: "Số tiền khách đưa chưa đủ!". |

- **AT02: Khách hàng hủy chuyển khoản hoặc hết hạn mã QR (Nhánh PayOS Tại Bước 4B)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4B.1 | System | Hết thời gian 15 phút đếm ngược mà chưa nhận được tiền từ PayOS hoặc Dược sĩ bấm "Đổi phương thức". |
  | 4B.2 | System | Hủy link thanh toán PayOS và cho phép Dược sĩ chuyển sang thu bằng Tiền mặt. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Hệ thống chỉ hỗ trợ đúng 2 hình thức thanh toán chính thức: Tiền mặt (`CASH` - mã 1) và Chuyển khoản tự động PayOS (`PAYOS_TRANSFER` - mã 2). |
| **BR-02** | Đối với PayOS, webhook bắt buộc phải được thẩm định chữ ký Checksum bằng `CHECKSUM_KEY` của hệ thống để phòng chống giả mạo gói tin thanh toán. |
| **BR-03** | Hóa đơn chỉ được in và chuyển trạng thái `PAID` khi giao dịch thanh toán đã được xác thực thành công 100%. |

---

### 3.3. Chức năng: Cancel/Return Sales Invoice (Tiếp nhận trả hàng & Hoàn tiền hóa đơn)

#### Table 3-15: Screen Definition - Sales Return Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Original Invoice Card | Info Card | - | - | Hiển thị: Mã hóa đơn gốc (VD: `INV-20261108-3910`), Ngày giờ mua, Tên khách hàng, SĐT, Tổng tiền đơn gốc. |
| 2 | Select All Checkbox | Checkbox | No | - | Chọn nhanh hoặc bỏ chọn toàn bộ tất cả các loại thuốc có trong hóa đơn. |
| 3 | Return Items Table | Data Table | Yes | - | Danh sách thuốc: Checkbox chọn trả, Tên thuốc, Lô, Đã mua, Đơn vị, Ô nhập **Số lượng trả** (từ 1 đến SL đã mua), Đơn vị tính, Đơn giá, Thành tiền hoàn lại. |
| 4 | Total Refund Highlight Banner | Dynamic Box (Amber) | - | - | Khung màu vàng nổi bật hiển thị: **Tổng tiền hoàn trả khách (VND)** (tính tự động theo thời gian thực). |
| 5 | Refund Method | Select | Yes | - | Hình thức hoàn tiền lại cho khách: `Tiền mặt` hoặc `Chuyển khoản ngân hàng`. |
| 6 | Return Reason | Text Input | Yes | 500 | Lý do trả hàng (bắt buộc nhập, VD: "Khách mua nhầm loại thuốc, đổi sang đơn bác sĩ khác"). |
| 7 | Confirm Return Button | Button | - | - | Xác nhận trả hàng, hoàn tiền cho khách và tự động nhập thuốc trả lại vào tồn kho chi nhánh. |
| 8 | Cancel | Button | - | - | Đóng Modal và hủy thao tác trả hàng. |

#### 3.2.15.2 Use Case Description - UC25: Cancel/Return Sales Invoice
- **Use Case ID**: `UC25`
- **Use Case Name**: Cancel/Return Sales Invoice
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Store Manager
- **Description**: Cho phép Dược sĩ tiếp nhận các mặt hàng thuốc khách trả lại trực tiếp từ danh sách hóa đơn bán lẻ trong ngày (không cần gõ lại mã hóa đơn), kiểm tra số lượng hợp lệ, hoàn trả tiền cho khách và tự động cộng hoàn số thuốc trả lại vào tồn kho của chi nhánh.
- **Precondition**:
  - `PRE-01`: Hóa đơn bán lẻ đang ở trạng thái đã thanh toán (`status = 1` - PAID) hoặc trả một phần (`status = 3` - PARTIALLY_RETURNED).
  - `PRE-02`: Hóa đơn chưa bị hủy bỏ hoặc hoàn trả toàn bộ trước đó (`status != 2` và `status != 4`).
- **Trigger**:
  - `TRG-01`: Tại bảng "Hóa Đơn Bán Lẻ Trong Ngày" hoặc Modal "Chi Tiết Hóa Đơn", Dược sĩ bấm nút "Trả hàng" tại hóa đơn cần trả.
- **Post-Condition**:
  - `POS-01`: Bản ghi phiếu trả hàng được tạo trong bảng `sales_returns` với mã phiếu trả tự sinh (VD: `RET-20261108-0001`) và `return_type` được tính toán chính xác (1 = Trả toàn bộ, 2 = Trả một phần).
  - `POS-02`: Chi tiết các mặt hàng trả lại được lưu vào bảng `sales_return_details`.
  - `POS-03`: Số lượng thuốc được tự động cộng trả lại vào bảng `inventories` của chi nhánh theo đúng số lô và đơn vị cơ bản.
  - `POS-04`: Hóa đơn bán lẻ gốc được cập nhật trạng thái: `status = 4` (FULLY_RETURNED) nếu trả hết hoặc `status = 3` (PARTIALLY_RETURNED) nếu trả một phần.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Tại bảng Hóa Đơn Bán Lẻ Trong Ngày, bấm nút **Trả hàng** tại dòng hóa đơn của khách. |
| 2 | System | Mở ngay Modal "Nhập Trả Hàng & Hoàn Tiền" (Sales Return Modal), tự động nạp toàn bộ dữ liệu hóa đơn gốc theo Table 3-15 mà **không yêu cầu nhập lại mã hóa đơn**. |
| 3 | System | Mặc định tích chọn tất cả các mặt hàng đã mua với số lượng trả bằng số lượng mua để hỗ trợ trả nhanh. |
| 4 | User | Dược sĩ có thể bỏ chọn các món khách giữ lại, điều chỉnh **Số lượng trả** của món muốn hoàn trả. |
| 5 | System | Tự động tính toán lại tổng số tiền hoàn trả: $\text{Total Refund} = \sum (\text{Return Quantity} \times \text{Unit Price})$. |
| 6 | User | Chọn hình thức hoàn tiền (Tiền mặt / Chuyển khoản) và nhập bắt buộc lý do trả hàng vào ô `Return Reason`. Bấm nút **Xác nhận Trả Hàng**. |
| 7 | System | Kiểm tra: Phải chọn ít nhất 1 mặt hàng, số tiền hoàn trả $> 0$, số lượng trả $\le$ số lượng đã mua và lý do trả không được để trống. |
| 8 | System | Gửi yêu cầu trả hàng tới máy chủ: `POST /api/v1/sales-invoices/return`. |
| 9 | System | Máy chủ xác định trước `totalRefund` và loại trả hàng: `returnType = (totalRefund >= invoice.finalAmount) ? 1 : 2`. |
| 10 | System | Lưu phiếu trả vào `sales_returns` (đầy đủ `return_type` không bị null) và lưu `sales_return_details`. |
| 11 | System | Tự động cộng hoàn tồn kho chi nhánh trong bảng `inventories` quy đổi theo hệ số đóng gói (`conversionFactor`). |
| 12 | System | Cập nhật trạng thái hóa đơn bán lẻ gốc (`status = 3` hoặc `status = 4`). |
| 13 | System | Trả về kết quả thành công (`200 OK`). Hiển thị màn hình xác nhận hoàn tiền thành công với mã phiếu trả hàng, tự động làm mới danh sách hóa đơn trong ngày. |

##### Alternative flows
- **AT01: Hóa đơn đã được hoàn trả toàn bộ trước đó (Tại Bước 2)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 2.1 | System | Phát hiện hóa đơn có `status = 4` (FULLY_RETURNED). |
  | 2.2 | System | Hiển thị cảnh báo lỗi: "Hóa đơn này đã được hoàn trả toàn bộ trước đó. Không thể tiếp tục trả hàng!". Vô hiệu hóa nút xác nhận trả hàng. |

- **AT02: Chưa nhập lý do trả hàng (Tại Bước 7)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 7.1 | System | Phát hiện trường `Return Reason` bị bỏ trống. |
  | 7.2 | System | Báo đỏ trường lý do: "Bắt buộc phải nhập lý do trả hàng / hoàn tiền!". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Tuyệt đối không cho phép Dược sĩ phải gõ thủ công lại mã hóa đơn để trả hàng; việc trả hàng được kích hoạt trực tiếp theo ngữ cảnh từ dòng hóa đơn trong danh sách hoặc từ modal xem chi tiết. |
| **BR-02** | Số lượng hoàn trả của từng mặt hàng không được vượt quá số lượng khách đã mua trong đơn gốc (và không vượt quá số lượng còn lại chưa trả nếu đơn đã từng trả một phần). |
| **BR-03** | Toàn bộ số lượng thuốc trả lại phải được hoàn nhập chính xác vào số lượng tồn kho của chi nhánh (`inventories`) theo đúng ID sản phẩm, ID số lô (`batch_id`) và quy đổi về đơn vị cơ bản. |
| **BR-04** | Bảng `sales_returns` bắt buộc phải có `return_type`: `1` nếu hoàn trả $100\%$ giá trị đơn hàng, `2` nếu chỉ trả một phần đơn hàng. |

---

### 3.4. Chức năng: View Customer Purchase History (Tra cứu lịch sử mua thuốc & Hóa đơn bán lẻ)

#### Table 3-16: Screen Definition - Daily Sales Invoices Table & History Drawer
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Smart Search Bar | Text Input | No | 100 | Ô tìm kiếm đa năng tức thì: tìm theo Mã hóa đơn (VD: `INV-20261108-3910`), Tên khách hàng hoặc Số điện thoại. |
| 2 | Invoice Code Column | Table Column (Bold Green) | - | - | Mã định danh hóa đơn bán lẻ. Bấm vào để xem nhanh chi tiết. |
| 3 | Prescription Code Column | Table Column (Badge) | - | - | Mã đơn thuốc kê đơn (hiển thị badge xám hoặc `-` nếu không có đơn). |
| 4 | Customer Column | Table Column | - | - | Tên khách hàng và Số điện thoại gắn liền với hóa đơn. |
| 5 | Time Column | Table Column | - | - | Thời gian tạo đơn (`HH:mm dd/MM/yyyy`). |
| 6 | Payment Method Badge | Table Column | - | - | Huy hiệu hình thức thanh toán: `Tiền mặt` (Xanh lá) hoặc `Chuyển khoản PayOS` (Xanh dương). |
| 7 | Total Subtotal | Table Column | - | - | Tiền hàng trước giảm giá. |
| 8 | Net Amount to Pay | Table Column (Bold) | - | - | Tổng tiền khách đã thanh toán thực tế (VND). |
| 9 | Invoice Status Badge | Table Column | - | - | Trạng thái: `Đã thanh toán` (Xanh lá), `Trả một phần` (Cam), `Đã trả hàng` (Đỏ). |
| 10 | Action Buttons | Button Group | - | - | Cột thao tác trên từng dòng: gồm 2 nút: **Chi tiết** (Icon con mắt) và **Trả hàng** (Icon đổi thuốc). |
| 11 | Re-order Button (Drawer) | Button | - | - | Nút "Sao chép đơn cũ vào giỏ POS" khi xem lịch sử mua hàng của khách hàng (F7). |

#### 3.2.16.2 Use Case Description - UC26: View Customer Purchase History
- **Use Case ID**: `UC26`
- **Use Case Name**: View Customer Purchase History
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Store Manager, Cashier
- **Description**: Cung cấp công cụ tra cứu toàn bộ các hóa đơn bán lẻ phát sinh trong ngày làm việc của nhà thuốc (hỗ trợ tìm kiếm realtime theo mã HĐ, tên khách, SĐT) và xem chi tiết lịch sử mua thuốc của một khách hàng cụ thể để tư vấn dùng thuốc hoặc sao chép đơn cũ vào giỏ POS.
- **Precondition**:
  - `PRE-01`: Nhân viên đã đăng nhập vào hệ thống.
- **Trigger**:
  - `TRG-01`: Dược sĩ truy cập vào tab "Hóa Đơn Bán Lẻ Trong Ngày" hoặc bấm nút "Lịch sử mua hàng" (F7) tại quầy POS.
- **Post-Condition**:
  - `POS-01`: Danh sách hóa đơn được hiển thị phân trang từ mới nhất đến cũ nhất.
  - `POS-02`: Dược sĩ có thể bấm xem chi tiết đơn thuốc, in lại hóa đơn hoặc kích hoạt quy trình trả hàng (UC25).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Truy cập trang "Hóa Đơn Bán Lẻ Trong Ngày" (hoặc mở thanh trượt Lịch sử mua hàng F7 khi đang chọn khách hàng tại POS). |
| 2 | System | Gửi yêu cầu lấy danh sách hóa đơn tới máy chủ: `GET /api/v1/sales-invoices?storeId={storeId}&page=0&size=10`. |
| 3 | System | Máy chủ truy vấn danh sách hóa đơn kết hợp LEFT JOIN với bảng `customers` để lấy thông tin Tên và SĐT khách hàng. |
| 4 | System | Hiển thị bảng danh sách hóa đơn đầy đủ các cột và các nút Thao tác theo Table 3-16. |
| 5 | User | Nhập từ khóa tìm kiếm (Mã hóa đơn, Tên khách hàng hoặc Số điện thoại) vào ô tìm kiếm. |
| 6 | System | Hệ thống tự động lọc dữ liệu danh sách hóa đơn thời gian thực. |
| 7 | User | Bấm nút **Chi tiết**: Hệ thống mở Modal Chi Tiết Hóa Đơn (hiển thị danh mục thuốc, số lô, hạn dùng, giá, tiền thối, dược sĩ lập đơn). |
| 8 | User | Bấm nút **Trả hàng**: Hệ thống kích hoạt trực tiếp Modal Nhập Trả Hàng (UC25) cho hóa đơn đó. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Danh sách hóa đơn bán lẻ trong ngày luôn hiển thị cột Khách hàng (Họ tên & SĐT) và 2 nút hành động trực tiếp: "Chi tiết" và "Trả hàng" trên từng dòng. |
| **BR-02** | Nút "Trả hàng" chỉ được kích hoạt (Enable) đối với các hóa đơn có trạng thái hợp lệ (`canReturn = true`). Nếu hóa đơn đã bị trả toàn bộ (`status = 4`), nút trả hàng bị vô hiệu hóa để bảo vệ tính toàn vẹn dữ liệu. |
