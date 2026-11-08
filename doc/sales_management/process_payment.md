# Đặc Tả Kỹ Thuật: 3.7.2 Process Payment (Xử Lý Thanh Toán Hóa Đơn)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC22` (SRS 3.7.2)
- **Tên Use Case**: Process Payment (Xử lý thanh toán bán lẻ)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: Tiếp nhận và hoàn tất thanh toán cho hóa đơn bán lẻ tại quầy POS. Hệ thống hỗ trợ **2 hình thức thanh toán duy nhất**:
  1. **Tiền mặt (CASH)**: Nhập số tiền khách đưa, tự động tính tiền thừa, kiểm tra đủ tiền và in hóa đơn.
  2. **Thanh toán Chuyển khoản (BANK_TRANSFER / PayOS VietQR)**: Tích hợp cổng thanh toán **PayOS** để tạo mã VietQR động theo từng đơn hàng. Hệ thống **tự động nhận xác nhận thanh toán thành công** (qua Webhook IPN và Polling thời gian thực) mà thu ngân không cần bấm xác nhận thủ công, tự động hoàn tất hóa đơn và in phiếu thu.
- **Tiền điều kiện (Preconditions)**:
  - Hóa đơn bán lẻ đã được khởi tạo và có tổng tiền thanh toán (`netAmount > 0`).
  - Dược sĩ/Thu ngân đang trong ca làm việc mở (`shift.status = 'OPEN'`).
  - Hệ thống đã được cấu hình các thông số bảo mật PayOS (`clientId`, `apiKey`, `checksumKey`).
- **Hậu điều kiện (Postconditions)**:
  - Bản ghi thanh toán được lưu vào bảng `dbo.payments` với `status = 'SUCCESS'`.
  - Hóa đơn chuyển trạng thái thanh toán `payment_status = 'PAID'` và `invoice_status = 'COMPLETED'`.
  - Nếu thanh toán tiền mặt: cộng vào doanh thu tiền mặt của ca hiện tại.
  - Tự động kích hoạt luồng in hóa đơn bán lẻ khổ K80.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ màn hình POS, sau khi lên đơn, Dược sĩ bấm nút **"Thanh toán" (Phím tắt F9)**.
2. Hệ thống hiển thị Modal **"Xử Lý Thanh Toán" (Payment Dialog)** gồm:
   - Thông tin tổng quan: Tiền hàng, Giảm giá/Chiết khấu, **Tổng tiền cần thanh toán (`netAmount`)**.
   - Bộ chọn phương thức thanh toán gồm 2 tab:
     * **Tab 1: Tiền mặt (Cash)** *(Mặc định)*
     * **Tab 2: Chuyển khoản PayOS VietQR (Bank Transfer)**

---

#### 2.1.1. Luồng A: Thanh toán Tiền mặt (CASH)
1. Thu ngân chọn Tab **"Tiền mặt"**.
2. Màn hình hiển thị:
   - Ô nhập `tenderedCash` (Tiền khách đưa) - tự động focus và điền sẵn số tiền đúng bằng `netAmount`.
   - Các nút phím tắt gợi ý mệnh giá tiền nhanh: `Đúng số tiền`, `50.000₫`, `100.000₫`, `200.000₫`, `500.000₫`.
3. Thu ngân nhập số tiền khách đưa hoặc bấm phím tắt mệnh giá.
4. Hệ thống tự động tính toán số tiền thừa theo thời gian thực:
   $$\text{Tiền thừa trả khách (Change)} = \text{Tiền khách đưa} - \text{Tổng tiền đơn}$$
5. **Kiểm tra tính hợp lệ**:
   - Nếu `tenderedCash < netAmount`: Nút "Xác nhận & In Hóa Đơn" bị vô hiệu hóa (disabled), hiển thị cảnh báo đỏ *"Khách đưa còn thiếu X VNĐ"*.
   - Nếu `tenderedCash >= netAmount`: Hiển thị số tiền thừa màu xanh lá nổi bật, kích hoạt nút hoàn tất (Phím tắt `Enter`).
6. Thu ngân bấm **"Hoàn tất & In Hóa Đơn" (Enter)**.
7. Frontend gửi yêu cầu thanh toán `POST /api/v1/sales/payments` với `paymentMethod = CASH`.
8. Backend lưu bản ghi `payments` (`payment_method = CASH`, `status = SUCCESS`), cập nhật hóa đơn `PAID`.
9. Modal đóng lại, mở hộp thoại in hóa đơn nhiệt K80 và reset màn hình bán hàng để đón lượt khách kế tiếp.

---

#### 2.1.2. Luồng B: Thanh toán Chuyển khoản PayOS VietQR (Tự Động Xác Nhận)
1. Thu ngân chọn Tab **"Chuyển khoản (PayOS QR)"**.
2. **Khởi tạo giao dịch PayOS (Tạo mã QR)**:
   - Frontend gửi yêu cầu tới Backend `POST /api/v1/sales/payments/payos/create-payment-link` kèm `invoiceId`.
   - Backend sinh mã đơn số nguyên `orderCode` duy nhất (VD: Timestamp + ID hóa đơn) và gọi API PayOS:
     * Endpoint: `POST https://api-merchant.payos.vn/v2/payment-requests`
     * Headers: `x-client-id`, `x-api-key`
     * Body: `orderCode`, `amount`, `description` (chuẩn hóa không dấu, VD: `PMS INV2026110801`), `cancelUrl`, `returnUrl`, `signature` (tạo bằng `checksumKey`).
   - PayOS phản hồi thông tin liên kết thanh toán gồm `qrCode` (chuỗi chuẩn VietQR), `checkoutUrl`, `paymentLinkId`.
   - Backend lưu tạm thông tin thanh toán ở trạng thái `PENDING` và trả về Frontend.
3. **Hiển thị giao diện quét mã QR**:
   - Frontend hiển thị mã QR VietQR động (chứa Logo Napas 247 / Ngân hàng thụ hưởng).
   - Hiển thị thông tin chuyển khoản: Ngân hàng thụ hưởng, Số tài khoản, Chủ tài khoản, Số tiền chính xác từng đồng, Nội dung chuyển khoản.
   - Hiển thị hiệu ứng trạng thái: Biểu tượng sóng radar/spinner xoay: *"Đang chờ khách hàng chuyển khoản..."* kèm đồng hồ đếm ngược hiệu lực (15 phút).
4. **Cơ chế Nhận Tự Động Xác Nhận Thanh Toán Thành Công**:
   - Khách hàng mở ứng dụng ngân hàng hoặc ví điện tử (quét mã VietQR trên màn hình thu ngân hoặc màn hình phụ phụ trợ).
   - Khách hàng xác nhận chuyển tiền. Giao dịch chuyển tiền liên ngân hàng 247 được thực hiện tức thì.
   - Hệ thống tự động xác nhận qua **cơ chế song song 2 lớp (Dual-Channel Verification)**:
     * **Lớp 1 - Webhook IPN (Kênh chính - Tức thì)**:
       - Ngay khi tiền vào tài khoản ngân hàng, PayOS gửi Webhook `POST /api/v1/sales/payments/payos/webhook` về máy chủ PMS.
       - Backend PMS xác minh tính toàn vẹn của webhook bằng chữ ký số HMAC-SHA256 sử dụng `checksumKey`.
       - Nếu chữ ký hợp lệ và giao dịch thành công (`code = "00"`):
         + Cập nhật trạng thái bản ghi `payments`: `status = SUCCESS`, lưu mã tham chiếu `reference = data.reference`, `transactionDateTime`.
         + Cập nhật hóa đơn `payment_status = PAID`, `invoice_status = COMPLETED`.
         + Phát thông báo WebSocket / SSE (hoặc lưu trạng thái bộ nhớ đệm cache để trả lời polling).
     * **Lớp 2 - Polling Fallback (Kênh dự phòng cho Frontend)**:
       - Trong khi Modal QR đang mở, Frontend tự động gửi truy vấn kiểm tra trạng thái mỗi 2 giây: `GET /api/v1/sales/payments/payos/status/{orderCode}`.
       - Khi Backend trả về `status = SUCCESS`:
         + Modal lập tức phát âm thanh báo thành công *"Ting Ting"* (tùy chọn) và chuyển đổi giao diện thành **dấu tích xanh cỡ lớn: "Thanh toán thành công qua PayOS!"**.
         + Modal tự động đóng sau 1.5 giây và kích hoạt lệnh in hóa đơn bán lẻ K80.
         + Thu ngân hoàn toàn **không cần bấm bất kỳ nút nào** để xác nhận tiền đã vào tài khoản.

---

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Khách hủy thanh toán chuyển khoản và đổi sang tiền mặt**:
  - Khách quét mã nhưng ứng dụng ngân hàng lỗi, hết tiền hoặc muốn đổi sang tiền mặt:
  - Thu ngân bấm nút **"Đổi sang Tiền mặt"** hoặc bấm trực tiếp tab **"Tiền mặt"**.
  - Frontend hủy chu kỳ Polling và chuyển mượt về form nhập tiền mặt mà không làm mất giỏ hàng hay dữ liệu đơn thuốc.
- **A2 - Hết thời gian chờ thanh toán (Timeout)**:
  - Nếu sau 15 phút chưa nhận được tiền, mã QR hết hiệu lực, hiển thị nút: *"Tạo lại mã QR mới"* hoặc *"Đổi sang tiền mặt"*.
- **A3 - Chuyển khoản sai lệch / Lỗi mạng Webhook**:
  - Trường hợp Webhook PayOS bị trễ do mạng Internet, cơ chế Polling sẽ chủ động gọi API Backend kiểm tra trực tiếp với cổng PayOS (`GET https://api-merchant.payos.vn/v2/payment-requests/{orderCode}`) để đồng bộ trạng thái ngay lập tức, đảm bảo không bao giờ bị nghẽn đơn tại quầy.

---

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Phương thức thanh toán hợp lệ)**: Hệ thống chỉ chấp nhận 2 giá trị chuẩn:
  * `CASH` (Tiền mặt)
  * `BANK_TRANSFER` (Chuyển khoản VietQR qua PayOS)
- **BR-02 (Chuẩn mã QR & Mã đơn hàng PayOS)**:
  * `orderCode`: Phải là số nguyên dương nguyên bản (64-bit integer), duy nhất trong toàn hệ thống PayOS.
  * `description`: Tối đa 25 ký tự, không dấu, không ký tự đặc biệt theo quy định Napas (Ví dụ: `PMS INV20261108001`).
- **BR-03 (Bảo mật chữ ký Webhook PayOS)**: Mọi dữ liệu Webhook gửi đến từ PayOS **bắt buộc phải được xác thực chữ ký (Signature Verification)** bằng thuật toán HMAC_SHA256 với `PAYOS_CHECKSUM_KEY`. Tuyệt đối không cập nhật hóa đơn nếu chữ ký không khớp để chống giả mạo IPN.
- **BR-04 (Toàn vẹn số tiền)**: Hóa đơn chỉ chuyển trạng thái `PAID` khi số tiền thanh toán thực tế khớp chính xác 100% với `netAmount` của hóa đơn.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Modal Thanh Toán (`PaymentModal.jsx`)

#### Tab 1: Tiền mặt (Cash)
| STT | Thành phần giao diện | Control Type | Hành vi & Ràng buộc |
| :---: | :--- | :--- | :--- |
| 1 | Ô nhập tiền khách đưa | `input[type=number]` | Tự động focus. Hiển thị đơn vị ₫ to rõ. |
| 2 | Nút chọn mệnh giá nhanh | Chips button | Các nút: `Đúng tiền`, `50k`, `100k`, `200k`, `500k`. Bấm là điền ngay vào ô nhập. |
| 3 | Khung hiển thị tiền thừa | Display Panel | Màu xanh nếu đủ tiền (`Tiền thừa trả khách: X ₫`), Màu đỏ nếu thiếu (`Còn thiếu: X ₫`). |
| 4 | Nút Xác nhận | Primary Button | Phím tắt `Enter`. Bị vô hiệu hóa nếu thiếu tiền. |

#### Tab 2: Chuyển khoản PayOS VietQR
| STT | Thành phần giao diện | Control Type | Hành vi & Ràng buộc |
| :---: | :--- | :--- | :--- |
| 1 | Ảnh mã VietQR động | Image / Canvas | Render từ chuỗi `qrCode` do PayOS trả về, kích thước tối thiểu 200x200px. |
| 2 | Thông tin tài khoản nhận | Typography / Box | Ngân hàng tiếp nhận, Tên chủ tài khoản, Số tiền (xanh lá đậm), Cú pháp nội dung. |
| 3 | Trạng thái lắng nghe | Loading Animation | Vòng xoay Pulse: *"Đang đợi thanh toán từ khách hàng..."*. |
| 4 | Trạng thái thành công | Success Banner | Khi Webhook/Polling báo `PAID`: Hiện icon tích xanh, thông báo *"Giao dịch thành công!"*, tự đóng sau 1.5s. |
| 5 | Nút Hủy / Đổi phương thức | Secondary Button | Hủy bỏ phiên QR, chuyển về tab Tiền mặt. |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. Biến Môi Trường Cấu Hình (Environment Variables)
Khai báo trong `BE/sba/src/main/resources/application.properties` (hoặc biến môi trường hệ thống):
```properties
# PayOS Payment Gateway Configuration
payos.client-id=${PAYOS_CLIENT_ID:your_client_id_here}
payos.api-key=${PAYOS_API_KEY:your_api_key_here}
payos.checksum-key=${PAYOS_CHECKSUM_KEY:your_checksum_key_here}
payos.endpoint=https://api-merchant.payos.vn
```

---

### 4.2. Danh Sách RESTful API Contracts

#### API 1: Thanh toán Tiền mặt
- **Endpoint**: `POST /api/v1/sales/payments/cash`
- **Quyền hạn**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Request Body**:
  ```json
  {
    "invoiceId": 1205,
    "tenderedCash": 500000.00,
    "note": "Khách thanh toán tiền mặt"
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Thanh toán tiền mặt thành công",
    "data": {
      "paymentId": 8012,
      "invoiceId": 1205,
      "invoiceCode": "INV-20261108-0012",
      "paymentMethod": "CASH",
      "amount": 305000.00,
      "tenderedCash": 500000.00,
      "changeAmount": 195000.00,
      "status": "SUCCESS",
      "paymentTime": "2026-11-08T18:30:00"
    }
  }
  ```

---

#### API 2: Khởi tạo Yêu cầu Thanh toán PayOS VietQR
- **Endpoint**: `POST /api/v1/sales/payments/payos/create-link`
- **Quyền hạn**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Request Body**:
  ```json
  {
    "invoiceId": 1205
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Tạo mã QR thanh toán PayOS thành công",
    "data": {
      "orderCode": 173106540012,
      "amount": 305000,
      "description": "PMS INV202611080012",
      "accountName": "NHA THUOC PHARMACY",
      "accountNumber": "0987654321",
      "bin": "970422",
      "qrCode": "00020101021238570010A000000727012700069704220113...",
      "checkoutUrl": "https://pay.payos.vn/web/...",
      "status": "PENDING"
    }
  }
  ```

---

#### API 3: Webhook Nhận Tự Động Từ PayOS (IPN Callback)
- **Endpoint**: `POST /api/v1/sales/payments/payos/webhook`
- **Quyền hạn**: `PermitAll` (Bảo mật bằng chữ ký số HMAC-SHA256)
- **PayOS Request Body**:
  ```json
  {
    "code": "00",
    "desc": "success",
    "data": {
      "orderCode": 173106540012,
      "amount": 305000,
      "description": "PMS INV202611080012",
      "accountNumber": "0987654321",
      "reference": "FT261108091234",
      "transactionDateTime": "2026-11-08 18:32:15",
      "currency": "VND",
      "paymentLinkId": "c71a337c-..."
    },
    "signature": "a68f0c978052bf89c836dbf0e9..."
  }
  ```
- **Logic Xử Lý Tại Backend**:
  1. Trích xuất `data` và `signature`.
  2. Sắp xếp các trường của `data` theo alphabet và tạo chuỗi hash key=value.
  3. Tạo chữ ký HMAC-SHA256 với `payos.checksum-key`.
  4. Nếu `signature` không khớp $\rightarrow$ Trả về HTTP `400 Bad Request` ("Invalid signature").
  5. Nếu chữ ký hợp lệ và `code == "00"`:
     - Tìm hóa đơn liên quan qua `orderCode`.
     - Nếu hóa đơn đã `PAID` $\rightarrow$ Trả về HTTP `200 OK` (idempotency, tránh xử lý trùng).
     - Tạo bản ghi `Payment` (`method = 'BANK_TRANSFER'`, `status = 'SUCCESS'`, `transaction_code = reference`).
     - Đổi trạng thái hóa đơn `payment_status = 'PAID'`, `invoice_status = 'COMPLETED'`.
     - Trả về HTTP `200 OK` cho PayOS.

---

#### API 4: Kiểm tra trạng thái giao dịch (Frontend Polling Fallback)
- **Endpoint**: `GET /api/v1/sales/payments/payos/status/{orderCode}`
- **Quyền hạn**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Response Body (200 OK)**:
  ```json
  {
    "status": 200,
    "data": {
      "orderCode": 173106540012,
      "invoiceId": 1205,
      "paymentStatus": "PAID",
      "isCompleted": true,
      "amount": 305000.00,
      "transactionCode": "FT261108091234",
      "paidAt": "2026-11-08T18:32:15"
    }
  }
  ```

---

### 4.3. Cấu Trúc Lớp DTO Java

```java
package com.pharmacy.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

public class PaymentDTO {

    @Data
    public static class CashPaymentRequest {
        @NotNull(message = "Mã hóa đơn không được để trống")
        private Long invoiceId;

        @NotNull(message = "Số tiền khách đưa không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0")
        private BigDecimal tenderedCash;

        private String note;
    }

    @Data
    public static class CreatePayOSLinkRequest {
        @NotNull(message = "Mã hóa đơn không được để trống")
        private Long invoiceId;
    }

    @Data
    public static class PayOSLinkResponse {
        private Long orderCode;
        private Long invoiceId;
        private Long amount;
        private String description;
        private String accountName;
        private String accountNumber;
        private String bin;
        private String qrCode;
        private String checkoutUrl;
        private String status;
    }

    @Data
    public static class PayOSWebhookPayload {
        private String code;
        private String desc;
        private PayOSWebhookData data;
        private String signature;
    }

    @Data
    public static class PayOSWebhookData {
        private Long orderCode;
        private Long amount;
        private String description;
        private String accountNumber;
        private String reference;
        private String transactionDateTime;
        private String currency;
        private String paymentLinkId;
    }
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Mô tả & Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-PAY-01** | Thanh toán tiền mặt đủ tiền | `netAmount`: 150.000₫, `tenderedCash`: 200.000₫ | Thành công. Tiền thừa: 50.000₫. Hóa đơn `PAID`. Trả về HTTP 200. |
| **TC-PAY-02** | Khách đưa thiếu tiền mặt | `netAmount`: 150.000₫, `tenderedCash`: 120.000₫ | Chặn tại giao diện (disable nút xác nhận), API trả về 400 "Số tiền khách đưa không đủ". |
| **TC-PAY-03** | Khởi tạo QR PayOS thành công | Gọi `POST /payos/create-link` cho hóa đơn `netAmount = 250.000₫` | Nhận chuỗi VietQR `qrCode` hợp lệ, hiển thị mã QR trên Modal. Trạng thái `PENDING`. |
| **TC-PAY-04** | Webhook PayOS xác nhận hợp lệ | PayOS gửi Webhook kèm chữ ký đúng chuẩn HMAC-SHA256, `code = "00"` | Hệ thống tự xác thực chữ ký, lưu `Payment` thành công, hóa đơn chuyển `PAID`. |
| **TC-PAY-05** | Webhook PayOS chữ ký giả mạo | Gửi Webhook với `signature` sai hoặc không khớp checksumKey | Bị từ chối HTTP 400 "Invalid signature", không thay đổi trạng thái hóa đơn. |
| **TC-PAY-06** | Frontend Polling nhận diện thanh toán | Khách thanh toán xong, Frontend đang poll API status mỗi 2s | Polling trả về `isCompleted: true`, Modal tự động đổi sang dấu tích xanh và đóng lại sau 1.5s, in hóa đơn. |
| **TC-PAY-07** | Khách hủy chuyển khoản đổi tiền mặt | Đang ở màn hình chờ QR PayOS, bấm đổi sang Tiền mặt | Dừng polling PayOS, giao diện chuyển mượt về Tab Tiền mặt, giỏ hàng giữ nguyên vẹn. |
