# Đặc Tả Kỹ Thuật: 3.7.2 Process Payment (Xử Lý Thanh Toán Hóa Đơn)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC22` (SRS 3.7.2)
- **Tên Use Case**: Process Payment (Xử lý thanh toán)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: Tiếp nhận và hoàn tất thanh toán cho hóa đơn bán lẻ tại quầy bằng nhiều phương thức thanh toán linh hoạt: **Tiền mặt (Cash)**, **Chuyển khoản mã VietQR động (Dynamic QR Transfer)**, hoặc **Thẻ ngân hàng (POS Card)**. Tự động tính toán số tiền thừa trả lại cho khách hàng và lưu trữ chi tiết giao dịch vào bảng `dbo.payments`.
- **Tiền điều kiện (Preconditions)**:
  - Hóa đơn bán lẻ đã được khởi tạo và có tổng tiền thanh toán (`netAmount > 0`).
  - Thu ngân đang trong ca làm việc `OPEN`.
- **Hậu điều kiện (Postconditions)**:
  - Bản ghi thanh toán được tạo trong bảng `dbo.payments` với `status = 'SUCCESS'`.
  - Hóa đơn chuyển trạng thái thanh toán `payment_status = 'PAID'`.
  - Nếu thanh toán bằng tiền mặt, số tiền được tính vào doanh thu tiền mặt của ca hiện tại.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ màn hình POS, sau khi lên đơn, Dược sĩ bấm nút **"Thanh toán" (Phím tắt F9)**.
2. Hệ thống hiển thị Modal **"Xử Lý Thanh Toán" (Payment Dialog)** gồm:
   - Tổng tiền cần thanh toán (`netAmount`).
   - Các tab lựa chọn phương thức thanh toán:
     * **Tab 1: Tiền mặt (Cash)**
     * **Tab 2: Chuyển khoản VietQR (Bank Transfer)**
     * **Tab 3: Thẻ ngân hàng (Card)**
3. **Trường hợp A: Khách thanh toán Tiền mặt (Cash)**:
   - Giao diện cung cấp các nút gợi ý tiền nhanh: `Đúng số tiền`, `100.000₫`, `200.000₫`, `500.000₫`.
   - Thu ngân nhập số tiền khách đưa vào ô `tenderedCash`.
   - Hệ thống tự động tính tiền thừa trả khách:
     $$\text{Tiền thừa (Change)} = \text{Tiền khách đưa} - \text{Tổng tiền đơn}$$
   - Thu ngân bấm nút **"Xác nhận thanh toán" (Confirm)**.
4. **Trường hợp B: Khách thanh toán Chuyển khoản VietQR**:
   - Thu ngân chọn tab "Chuyển khoản QR".
   - Hệ thống tự động sinh mã VietQR chuẩn NAPAS 247 chứa thông tin tài khoản ngân hàng của chuỗi, số tiền chính xác từng đồng và nội dung chuyển khoản là mã hóa đơn (VD: `INV202611040012`).
   - Khách hàng quét mã QR trên ứng dụng Mobile Banking và thực hiện chuyển khoản.
   - Thu ngân kiểm tra thông báo nhận tiền trên app ngân hàng / màn hình và bấm **"Đã nhận tiền thành công"** kèm mã tham chiếu giao dịch.
5. **Trường hợp C: Thanh toán bằng Thẻ (POS Card)**:
   - Thu ngân quẹt/chạm thẻ trên máy POS của ngân hàng.
   - Sau khi máy in bill thẻ thành công, thu ngân nhập mã chuẩn chi (Approval Code / Ref Code) vào ô `transactionCode` và bấm xác nhận.
6. Frontend gửi yêu cầu `POST /api/v1/sales/payments` lên Backend.
7. Backend kiểm tra:
   - Số tiền thanh toán phải đủ (đối với tiền mặt: `tenderedCash >= netAmount`).
   - Lưu bản ghi vào bảng `dbo.payments` (`invoice_id`, `payment_method`, `amount`, `transaction_code`, `status = 'SUCCESS'`).
   - Cập nhật trạng thái hóa đơn `sales_invoices.payment_status = 'PAID'`.
8. Backend trả về HTTP `200 OK`.
9. Frontend kích hoạt lệnh in hóa đơn và hoàn tất đơn hàng.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Khách đưa thiếu tiền mặt**: Nếu `tenderedCash < netAmount`, nút Xác nhận thanh toán bị vô hiệu hóa (disabled), hiển thị cảnh báo đỏ: *"Khách đưa còn thiếu X VNĐ"*.
- **A2 - Khách hủy giao dịch chuyển khoản**: Khách không muốn chuyển khoản nữa và đổi sang tiền mặt -> Thu ngân bấm chuyển tab sang "Tiền mặt" mà không làm mất thông tin giỏ hàng.
- **A3 - Giao dịch quẹt thẻ bị từ chối**: Khách hàng thẻ không đủ số dư hoặc lỗi thẻ -> Thu ngân thông báo khách thử lại thẻ khác hoặc đổi phương thức thanh toán.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Phương thức thanh toán hợp lệ)**: Chỉ chấp nhận 3 giá trị chuẩn: `CASH`, `BANK_TRANSFER`, `CREDIT_CARD`.
- **BR-02 (Chuẩn mã QR VietQR)**: Nội dung chuyển khoản phải được chuẩn hóa không dấu và chứa mã hóa đơn để hệ thống kế toán có thể đối soát tự động (`pms_<invoice_code>`).
- **BR-03 (Toàn vẹn số tiền)**: Hóa đơn chỉ được coi là hoàn tất khi tổng số tiền các đợt thanh toán hợp lệ bằng hoặc lớn hơn số tiền cần thanh toán (`net_amount`).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Modal Thanh Toán
| STT | Tên trường | Control Type | Bắt buộc | Mặc định | Ghi chú & Ràng buộc |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `netAmount` | Display (Large) | - | - | Số tiền cần thanh toán (Màu xanh, font to) |
| 2 | `paymentMethod` | Tab / Radio Button | Có | `CASH` | Lựa chọn: Tiền mặt, VietQR, Thẻ |
| 3 | `tenderedCash` | Currency Input | Có (khi chọn Cash) | Bằng `netAmount` | Số tiền khách đưa (phải >= `netAmount`) |
| 4 | `changeAmount` | Display | - | 0 | Tiền thừa gửi lại khách (Chỉ đọc) |
| 5 | `qrCodeImage` | Image / SVG | - | - | Hiển thị mã QR VietQR động (chỉ hiện khi chọn Tab VietQR) |
| 6 | `transactionCode` | Text Box | Không | Rỗng | Mã giao dịch ngân hàng / Mã POS |
| 7 | Nút `Confirm` | Button (Primary) | - | - | Xác nhận thanh toán (Phím `Enter`) |
| 8 | Nút `Cancel` | Button (Secondary) | - | - | Quay lại giỏ hàng (Phím `ESC`) |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `POST /api/v1/sales/payments`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Content-Type**: `application/json`

#### Request Payload Schema:
```json
{
  "invoiceId": 1205,
  "paymentMethod": "CASH",
  "amount": 305000.00,
  "tenderedCash": 500000.00,
  "transactionCode": null,
  "note": "Khách thanh toán tiền mặt 500k"
}
```

#### Response Payload (Thành công - HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Xử lý thanh toán thành công",
  "data": {
    "paymentId": 8012,
    "invoiceId": 1205,
    "invoiceCode": "INV-20261104-0012",
    "paymentMethod": "CASH",
    "amount": 305000.00,
    "tenderedCash": 500000.00,
    "changeAmount": 195000.00,
    "status": "SUCCESS",
    "paymentTime": "2026-11-04T09:15:35"
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessPaymentRequest {
    @NotNull(message = "Mã hóa đơn không được để trống")
    private Long invoiceId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // CASH, BANK_TRANSFER, CREDIT_CARD

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    private BigDecimal tenderedCash;
    private String transactionCode;
    private String note;
}
```

### 4.3. Thuật Toán Service Layer (`PaymentServiceImpl.processPayment`)
```java
@Transactional
public PaymentResponse processPayment(ProcessPaymentRequest request, Long accountId, String clientIp) {
    SalesInvoice invoice = salesInvoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại"));

    if ("PAID".equalsIgnoreCase(invoice.getPaymentStatus())) {
        throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất!");
    }

    // Kiểm tra tiền mặt
    BigDecimal changeAmount = BigDecimal.ZERO;
    if ("CASH".equalsIgnoreCase(request.getPaymentMethod())) {
        if (request.getTenderedCash() == null || request.getTenderedCash().compareTo(invoice.getNetAmount()) < 0) {
            throw new IllegalArgumentException("Số tiền khách đưa không đủ để thanh toán hóa đơn!");
        }
        changeAmount = request.getTenderedCash().subtract(invoice.getNetAmount());
    }

    // Tạo bản ghi Payment
    Payment payment = new Payment();
    payment.setInvoiceId(invoice.getInvoiceId());
    payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
    payment.setAmount(request.getAmount());
    payment.setTransactionCode(request.getTransactionCode());
    payment.setStatus("SUCCESS");
    payment.setPaymentTime(LocalDateTime.now());
    paymentRepository.save(payment);

    // Cập nhật trạng thái hóa đơn
    invoice.setPaymentStatus("PAID");
    invoice.setInvoiceStatus("COMPLETED");
    salesInvoiceRepository.save(invoice);

    // Ghi Audit Log
    auditLogService.log("PAYMENT", "PROCESS_PAYMENT", accountId, clientIp, 
        "Thanh toán hóa đơn #" + invoice.getInvoiceCode() + " bằng " + request.getPaymentMethod() + " số tiền " + request.getAmount() + " VNĐ");

    return buildPaymentResponse(payment, changeAmount);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-PAY-01** | Thanh toán tiền mặt đủ tiền | `netAmount`: 150k, `tenderedCash`: 200k | Thành công, tính tiền thừa 50k, hóa đơn PAID |
| **TC-PAY-02** | Khách đưa thiếu tiền mặt | `netAmount`: 150k, `tenderedCash`: 100k | Chặn lại, báo lỗi "Số tiền khách đưa không đủ" |
| **TC-PAY-03** | Thanh toán VietQR thành công | Chọn VietQR, nhập mã giao dịch ngân hàng | Lưu thành công, paymentMethod = 'BANK_TRANSFER' |
| **TC-PAY-04** | Thanh toán hóa đơn đã PAID | Hóa đơn đã thanh toán trước đó | Báo lỗi HTTP 400 "Hóa đơn này đã được thanh toán hoàn tất" |

