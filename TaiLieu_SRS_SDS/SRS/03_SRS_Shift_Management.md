# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - CỤM CHỨC NĂNG 3: SHIFT MANAGEMENT

---

## 1. TỔNG QUAN CỤM CHỨC NĂNG
Cụm chức năng **Shift Management** (Quản lý Ca Làm Việc) kiểm soát chu trình làm việc tại quầy bán thuốc POS của Dược sĩ và Thu ngân: từ lúc mở ca (Open Shift) khai báo tiền mặt quỹ đầu ca, theo dõi doanh thu biến động trong ca đến khi chốt ca bàn giao tiền mặt (Close Shift), kiểm đếm đối soát độ lệch thừa/thiếu và in phiếu bàn giao ca theo chuẩn kiểm toán tài chính nhà thuốc.

---

## 2. DANH SÁCH USE CASE TRONG CỤM
- **UC21**: Open Shift (Mở ca làm việc & Khai báo tiền quỹ đầu ca)
- **UC22**: Close Shift (Chốt ca làm việc & Đối soát tiền mặt bàn giao)

---

## 3. CHI TIẾT YÊU CẦU & ĐẶC TẢ TỪNG CHỨC NĂNG

### 3.1. Chức năng: Open Shift (Mở ca làm việc)

#### Table 3-11: Screen Definition - Open Shift Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Cashier / Staff Name | Text (Read-only) | - | - | Họ tên của Dược sĩ/Thu ngân đang đăng nhập mở ca. |
| 2 | Store / Branch | Text (Read-only) | - | - | Tên chi nhánh nhà thuốc đang làm việc. |
| 3 | Opening Time | Text (Read-only) | - | - | Thời gian mở ca làm việc hiện tại (định dạng `HH:mm dd/MM/yyyy`). |
| 4 | Opening Cash (VND) | Number Input | Yes | 12 | Số tiền mặt thực tế ban đầu trong két tiền để thối lại cho khách (>= 0 VNĐ). |
| 5 | Shift Note | Textarea | No | 255 | Ghi chú ca làm việc (VD: "Ca sáng, nhận bàn giao két từ bạn Nam"). |
| 6 | Confirm Open Shift | Button | - | - | Xác nhận mở ca và kích hoạt quầy bán hàng POS. |
| 7 | Cancel | Button | - | - | Hủy bỏ mở ca và quay trở lại màn hình chính (Dashboard). |

#### 3.2.11.2 Use Case Description - UC21: Open Shift
- **Use Case ID**: `UC21`
- **Use Case Name**: Open Shift
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist (Dược sĩ bán thuốc), Cashier (Thu ngân), Store Manager (Quản lý cửa hàng)
- **Description**: Cho phép nhân viên bắt đầu ca làm việc bán lẻ tại quầy POS, ghi nhận tiền mặt quỹ đầu ca để phục vụ công tác đối soát doanh thu cuối ca.
- **Precondition**:
  - `PRE-01`: Nhân viên đã đăng nhập thành công vào hệ thống.
  - `PRE-02`: Nhân viên hiện chưa có bất kỳ ca làm việc nào ở trạng thái đang mở (`status = 1` - OPEN).
- **Trigger**:
  - `TRG-01`: Nhân viên truy cập vào màn hình quầy bán thuốc POS (`/pos`) khi chưa có ca mở.
- **Post-Condition**:
  - `POS-01`: Bản ghi ca làm việc mới được tạo trong bảng `shifts` với trạng thái `status = 1` (OPEN), lưu vết thời gian bắt đầu và số tiền quỹ đầu ca.
  - `POS-02`: Quầy POS được mở khóa cho phép quét mã thuốc và tạo hóa đơn bán lẻ.
  - `POS-03`: Ghi nhận nhật ký vào bảng `audit_logs` (`OPEN_SHIFT_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Truy cập vào màn hình Bán lẻ POS (`/pos`). |
| 2 | System | Kiểm tra trạng thái ca làm việc của tài khoản (`GET /api/v1/shifts/current`). |
| 3 | System | Xác định chưa có ca mở, tự động hiển thị Modal **"Mở Ca Làm Việc"** (Open Shift Modal) theo Table 3-11. |
| 4 | User | Kiểm đếm tiền mặt có sẵn trong két, nhập số tiền vào ô `Opening Cash` và nhập ghi chú (nếu có). Bấm nút **Xác nhận Mở Ca**. |
| 5 | System | Kiểm tra hợp lệ: số tiền đầu ca không được để trống, phải là số nguyên $\ge 0$ và $\le 100.000.000$ VNĐ. |
| 6 | System | Gửi yêu cầu mở ca lên máy chủ Backend: `POST /api/v1/shifts/open`. |
| 7 | System | Máy chủ kiểm tra điều kiện an toàn (không có ca nào khác đang mở bởi tài khoản này). |
| 8 | System | Tạo bản ghi mới trong bảng `shifts` với `status = 1`, `opening_time = NOW()`, `opening_cash = [số tiền đã nhập]`. |
| 9 | System | Ghi log vào bảng `audit_logs`. |
| 10 | System | Trả về thông tin ca vừa mở (`201 Created`). Đóng modal và kích hoạt trạng thái sẵn sàng bán hàng trên giao diện POS. |

##### Alternative flows
- **AT01: Tiền mặt đầu ca bị âm (Tại Bước 5)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 5.1 | System | Phát hiện giá trị số tiền đầu ca nhỏ hơn 0. |
  | 5.2 | System | Hiển thị cảnh báo lỗi: "Số tiền mặt đầu ca không được là số âm (>= 0 VNĐ)!". |

- **AT02: Tài khoản đã có ca làm việc khác đang mở (Tại Bước 7)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 7.1 | System | Máy chủ phát hiện tài khoản đã có một ca ở trạng thái `status = 1` (OPEN). |
  | 7.2 | System | Trả về mã lỗi `400 Bad Request`: "Bạn đang có một ca làm việc chưa kết thúc. Vui lòng hoàn thành ca hiện tại!". |
  | 7.3 | System | Điều hướng thẳng vào giao diện POS của ca đang hoạt động. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Mỗi tài khoản Dược sĩ/Thu ngân chỉ được phép sở hữu duy nhất 01 ca làm việc ở trạng thái OPEN tại một thời điểm. |
| **BR-02** | Mọi hóa đơn bán lẻ (`sales_invoices`) và giao dịch trả hàng (`sales_returns`) bắt buộc phải gắn với một `shift_id` đang mở. Không có ca mở thì hệ thống khóa chặt chức năng thanh toán. |
| **BR-03** | Số tiền quỹ đầu ca (`opening_cash`) tối đa không vượt quá 100.000.000 VNĐ để ngăn ngừa rủi ro gõ nhầm chữ số. |

---

### 3.2. Chức năng: Close Shift (Chốt ca làm việc & Bàn giao)

#### Table 3-12: Screen Definition - Close Shift Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Cashier & Shift Info | Info Header | - | - | Tên thu ngân, Chi nhánh, Thời gian mở ca (`openingTime`) và Giờ kết ca dự kiến. |
| 2 | Opening Cash | Read-only Text | - | - | Số tiền mặt quỹ đầu ca đã khai báo (VD: `1,500,000 VND`). |
| 3 | Cash Sales | Read-only Text | - | - | Tổng doanh thu tiền mặt thu được từ các hóa đơn trong ca. |
| 4 | Bank Transfer Sales | Read-only Text | - | - | Tổng doanh thu chuyển khoản ngân hàng PayOS trong ca. |
| 5 | Total Cash Refunds | Read-only Text | - | - | Tổng số tiền mặt đã hoàn trả cho khách do trả hàng trong ca. |
| 6 | Expected Cash in Drawer | Highlight Card | - | - | Tiền mặt lý thuyết phải có trong két = `Opening Cash + Cash Sales - Total Cash Refunds`. |
| 7 | Actual Closing Cash | Number Input | Yes | 12 | Số tiền mặt thực tế nhân viên kiểm đếm được trong két két tại thời điểm chốt ca. |
| 8 | Discrepancy Banner | Dynamic Card | - | - | Độ lệch = `Thực tế - Lý thuyết`. Hiển thị: Xanh lá (Khớp 0đ), Cam (Thừa tiền +X), Đỏ (Thiếu tiền -X). |
| 9 | Explanation Note | Textarea | Conditional | 500 | Lý do giải trình chênh lệch tiền két. **Bắt buộc nhập nếu có chênh lệch** (`Discrepancy != 0`). |
| 10 | Confirm & Close Shift | Button | - | - | Xác nhận chốt ca, khóa quyền bán hàng và lưu kết quả đối soát. |
| 11 | Print Handover Slip | Button | - | - | In phiếu bàn giao ca và đối soát tiền két khổ K80. |
| 12 | Cancel | Button | - | - | Hủy bỏ chốt ca và tiếp tục bán hàng. |

#### 3.2.12.2 Use Case Description - UC22: Close Shift
- **Use Case ID**: `UC22`
- **Use Case Name**: Close Shift
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Cashier, Store Manager
- **Description**: Cho phép nhân viên kết thúc ca làm việc, thực hiện kiểm đếm tiền mặt thực tế trong két, đối soát tự động với số liệu hệ thống tính toán, giải trình chênh lệch và in phiếu bàn giao ca cho nhân viên ca sau.
- **Precondition**:
  - `PRE-01`: Nhân viên đang có một ca làm việc ở trạng thái mở (`status = 1` - OPEN).
- **Trigger**:
  - `TRG-01`: Nhân viên bấm nút "Kết thúc ca" / "Chốt ca" (Icon ổ khóa) trên thanh điều hướng quầy POS.
- **Post-Condition**:
  - `POS-01`: Bản ghi ca làm việc cập nhật trạng thái `status = 2` (CLOSED), lưu `closing_time = NOW()`, số tiền thực tế, số tiền tính toán và độ lệch (`discrepancy`).
  - `POS-02`: Quầy POS bị khóa đối với nhân viên cho đến khi mở ca mới.
  - `POS-03`: Cho phép in phiếu bàn giao ca có chữ ký xác nhận của 2 bên giao - nhận.
  - `POS-04`: Ghi nhật ký vào bảng `audit_logs` (`CLOSE_SHIFT_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Tại quầy POS, bấm nút **Chốt ca làm việc**. |
| 2 | System | Gọi API `GET /api/v1/shifts/current/summary` để tổng hợp số liệu doanh thu trong ca. |
| 3 | System | Hiển thị Modal "Chốt Ca & Bàn Giao Tiền Két" theo Table 3-12 với số tiền dự kiến tính toán tự động. |
| 4 | User | Kiểm đếm toàn bộ tiền mặt trong két và nhập số tiền vào ô `Actual Closing Cash`. |
| 5 | System | Tự động tính toán độ chênh lệch thời gian thực: $\text{Chênh lệch} = \text{Tiền thực tế} - \text{Tiền lý thuyết}$. Hiển thị banner màu tương ứng. |
| 6 | User | Nếu có chênh lệch tiền két, nhập lý do giải trình vào ô `Explanation Note`. Bấm nút **Xác nhận Chốt Ca**. |
| 7 | System | Kiểm tra: nếu có chênh lệch (`discrepancy != 0`) mà chưa nhập ghi chú thì yêu cầu nhập giải trình. |
| 8 | System | Gửi yêu cầu đóng ca lên máy chủ: `POST /api/v1/shifts/close`. |
| 9 | System | Máy chủ chốt số liệu, cập nhật bảng `shifts`: `status = 2`, `closing_time = NOW()`, `closing_cash`, `calculated_cash`, `discrepancy`, `note`. |
| 10 | System | Ghi nhận nhật ký kiểm toán vào bảng `audit_logs`. |
| 11 | System | Trả về kết quả tổng kết ca thành công (`200 OK`). Hiển thị nút **In phiếu bàn giao** và thông báo "Chốt ca thành công!". |

##### Alternative flows
- **AT01: Lệch tiền nhưng không nhập lý do giải trình (Tại Bước 7)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 7.1 | System | Phát hiện `discrepancy != 0` nhưng trường `Explanation Note` bị bỏ trống. |
  | 7.2 | System | Chặn submit và hiển thị cảnh báo đỏ: "Tiền két bị chênh lệch! Bắt buộc phải nhập lý do giải trình trước khi chốt ca!". |

- **AT02: Không tìm thấy ca mở hợp lệ (Tại Bước 2)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 2.1 | System | Máy chủ báo không tìm thấy ca nào đang mở của tài khoản này. |
  | 2.2 | System | Thông báo lỗi: "Không tìm thấy ca làm việc đang hoạt động để chốt ca!". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Khi đã chốt ca thành công (`status = 2` - CLOSED), bản ghi ca làm việc bị đóng băng vĩnh viễn (Read-only), không một ai (kể cả Admin) được phép sửa đổi số liệu tài chính đã chốt. |
| **BR-02** | Công thức tính tiền mặt lý thuyết trong két:  
$$\text{Expected Cash} = \text{Opening Cash} + \text{Cash Sales} - \text{Cash Refunds}$$
Doanh thu chuyển khoản PayOS chỉ được ghi nhận vào báo cáo doanh thu tài khoản ngân hàng, không được cộng vào tiền mặt trong két. |
| **BR-03** | Mọi trường hợp chênh lệch tiền két (dù thừa hay thiếu) đều bắt buộc phải nhập lý do giải trình để phục vụ công tác thanh tra kiểm toán nội bộ của Quản lý cửa hàng. |

