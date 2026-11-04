# Đặc Tả Kỹ Thuật: 3.6.2 Close Shift (Chốt Ca & Bàn Giao Ca Làm Việc)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC20` (SRS 3.6.2)
- **Tên Use Case**: Close Shift (Chốt ca làm việc)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân), `Store Manager` (Quản lý cửa hàng)
- **Mô tả nghiệp vụ**: Cho phép nhân viên kết thúc ca làm việc của mình, thực hiện kiểm đếm tiền mặt thực tế trong két (`closing_cash`), đối soát với doanh thu tiền mặt tính toán trên hệ thống (`calculated_cash`), tính độ lệch thừa/thiếu (`discrepancy`) và in phiếu tổng kết bàn giao ca.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đang có một ca làm việc ở trạng thái mở (`status = 'OPEN'`).
- **Hậu điều kiện (Postconditions)**:
  - Trạng thái ca chuyển thành `CLOSED`, ghi nhận `closing_time = NOW()`.
  - Cập nhật số tiền thực kiểm, số tiền tính toán và độ lệch vào bảng `dbo.shifts`.
  - Khóa quyền xuất hóa đơn bán lẻ của nhân viên cho đến khi mở ca mới.
  - Ghi nhận nhật ký kiểm toán vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Khi hết ca làm việc, nhân viên chọn chức năng **"Chốt ca làm việc" (Close Shift)** từ thanh điều hướng hoặc menu POS.
2. Hệ thống gọi API lấy thông tin tóm tắt ca làm việc hiện tại: `GET /api/v1/shifts/current/summary`.
3. Hệ thống hiển thị Modal **"Chốt Ca Làm Việc"** gồm các thông tin:
   - Tên thu ngân & Chi nhánh làm việc.
   - Thời gian mở ca (`openingTime`) và Thời gian chốt ca dự kiến (`closingTime`).
   - Tiền mặt đầu ca (`openingCash`).
   - Tổng doanh thu bán hàng trong ca (phân loại: Doanh thu Tiền mặt, Doanh thu Chuyển khoản QR, Doanh thu Thẻ).
   - Tổng tiền hoàn trả do khách trả hàng trong ca (`refundCash`).
   - Tiền mặt dự kiến phải có trong két (`expectedCash = openingCash + cashSales - cashRefunds`).
   - Ô nhập **Số tiền mặt thực kiểm trong két** (`closingCashActual`).
   - Ô nhập **Ghi chú giải trình chênh lệch** (`note`).
4. Nhân viên kiểm đếm toàn bộ tiền mặt trong két, nhập số tiền thực tế vào ô `closingCashActual`.
5. Hệ thống tự động tính toán và hiển thị độ lệch ngay lập tức:
   $$\text{Chênh lệch (Discrepancy)} = \text{Tiền thực kiểm} - \text{Tiền dự kiến}$$
   - Nếu Chênh lệch = 0: Hiển thị trạng thái màu xanh lá: *"Cân bằng két chuẩn xác"*.
   - Nếu Chênh lệch > 0: Hiển thị màu vàng/cam: *"Thừa tiền két: +X VNĐ"*.
   - Nếu Chênh lệch < 0: Hiển thị màu đỏ: *"Thiếu tiền két: -X VNĐ"*.
6. Nếu có chênh lệch, nhân viên bắt buộc nhập lý do vào ô `note` (Ví dụ: *"Khách quên không lấy lại 5.000đ tiền thừa"*, *"Thối nhầm tiền cho khách"*...).
7. Nhân viên bấm nút **"Xác nhận Chốt Ca" (Confirm & Close Shift)**.
8. Frontend gửi yêu cầu `POST /api/v1/shifts/close` kèm payload đóng ca.
9. Backend tiếp nhận yêu cầu:
   - Tìm ca `OPEN` của nhân viên.
   - Tính toán lại toàn bộ hóa đơn tiền mặt trong khoảng thời gian ca làm việc để đảm bảo tính toàn vẹn dữ liệu.
   - Cập nhật bản ghi `Shift`:
     * `closingTime` = `LocalDateTime.now()`
     * `closingCash` = `closingCashActual`
     * `calculatedCash` = `expectedCash`
     * `discrepancy` = `closingCash - calculatedCash`
     * `status` = `"CLOSED"`
     * `note` = nội dung ghi chú
   - Lưu vào bảng `dbo.shifts`.
   - Ghi nhật ký vào `audit_logs` (`action_code = 'CLOSE_SHIFT'`).
10. Backend trả về HTTP `200 OK` kèm theo phiếu tổng kết ca (`ShiftSummaryDto`).
11. Frontend hiển thị màn hình tóm tắt bàn giao ca và nút **"In Phiếu Bàn Giao Ca" (Print Handover Slip)**.
12. Sau khi in hoặc đóng, hệ thống chuyển về màn hình đăng nhập hoặc trang chủ.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Két bị lệch tiền nhưng không nhập ghi chú**: Nếu `discrepancy != 0` mà ô `note` để trống, hệ thống chặn submit và yêu cầu: *"Vui lòng nhập lý do giải trình khi két tiền bị chênh lệch"*.
- **A2 - Số tiền thực tế âm**: Báo lỗi *"Số tiền thực tế không được là số âm"*.
- **A3 - Chưa có ca mở**: Nếu nhân viên không có ca mở nào, hệ thống thông báo lỗi: *"Không tìm thấy ca làm việc đang hoạt động"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Công thức tính tiền két hệ thống)**:
  $$\text{calculatedCash} = \text{openingCash} + \sum(\text{Hóa đơn thanh toán tiền mặt}) - \sum(\text{Phiếu trả hàng hoàn tiền mặt})$$
  *(Lưu ý: Doanh thu từ Chuyển khoản QR và Quẹt thẻ POS được tính vào tổng doanh thu bán hàng nhưng KHÔNG cộng vào tiền mặt trong két).*
- **BR-02 (Tính bất biến của ca đã đóng)**: Sau khi ca đã chuyển sang `CLOSED`, toàn bộ số liệu không thể bị chỉnh sửa trực tiếp. Bất kỳ sự điều chỉnh đối soát nào sau này chỉ được thực hiện bởi Cửa hàng trưởng thông qua chức năng Đối soát doanh thu cuối ngày (`Daily Sales Reconciliation`).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Form Chốt Ca
| STT | Tên trường | Control Type | Bắt buộc | Ghi chú & Ràng buộc |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `openingCash` | Currency Display | - | Số tiền đầu ca (Chỉ đọc) |
| 2 | `cashSales` | Currency Display | - | Doanh thu tiền mặt trong ca (Chỉ đọc) |
| 3 | `qrSales` | Currency Display | - | Doanh thu quét mã VietQR (Chỉ đọc) |
| 4 | `refundCash` | Currency Display | - | Tiền hoàn trả khách (Chỉ đọc) |
| 5 | `expectedCash` | Currency Display (Bold) | - | Tiền mặt dự kiến hệ thống (Chỉ đọc) |
| 6 | `closingCashActual` | Currency Input | Có | Tiền mặt thực tế đếm được trong két (>= 0) |
| 7 | `discrepancy` | Badge Display | - | Tự động tính: Đỏ nếu thiếu, Vàng nếu thừa, Xanh nếu khớp |
| 8 | `note` | Text Area | Có (nếu lệch tiền) | Tối đa 255 ký tự (Giải trình chênh lệch) |
| 9 | Nút `Close Shift` | Button (Danger) | - | Xác nhận chốt ca |
| 10 | Nút `Cancel` | Button (Secondary) | - | Quay lại bán hàng |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Lấy tóm tắt ca hiện tại trước khi chốt:
- **Endpoint**: `GET /api/v1/shifts/current/summary`
- **Quyền**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Lấy thông tin ca hiện tại thành công",
  "data": {
    "shiftId": 205,
    "cashierName": "Nguyễn Văn Dược",
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "openingTime": "2026-11-04T07:30:00",
    "openingCash": 1500000.00,
    "totalInvoices": 35,
    "cashSales": 5420000.00,
    "qrSales": 3150000.00,
    "cardSales": 800000.00,
    "totalSales": 9370000.00,
    "refundCash": 120000.00,
    "expectedCash": 6800000.00
  }
}
```

#### B. Xác nhận chốt ca làm việc:
- **Endpoint**: `POST /api/v1/shifts/close`
- **Quyền**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Request Payload**:
```json
{
  "shiftId": 205,
  "closingCashActual": 6800000.00,
  "note": "Két tiền cân khớp 100%, không phát sinh chênh lệch"
}
```

- **Response Payload (HTTP 200 OK)**:
```json
{
  "status": 200,
  "message": "Chốt ca làm việc thành công",
  "data": {
    "shiftId": 205,
    "closingTime": "2026-11-04T15:30:00",
    "openingCash": 1500000.00,
    "calculatedCash": 6800000.00,
    "closingCash": 6800000.00,
    "discrepancy": 0.00,
    "status": "CLOSED",
    "note": "Két tiền cân khớp 100%, không phát sinh chênh lệch"
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CloseShiftRequest {
    @NotNull(message = "Mã ca làm việc không được để trống")
    private Long shiftId;

    @NotNull(message = "Số tiền mặt thực kiểm không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền thực tế phải lớn hơn hoặc bằng 0")
    private BigDecimal closingCashActual;

    @Size(max = 255, message = "Ghi chú giải trình tối đa 255 ký tự")
    private String note;
}
```

### 4.3. Thuật Toán Service Layer (`ShiftServiceImpl.closeShift`)
```java
@Transactional
public ShiftSummaryDto closeShift(CloseShiftRequest request, Long accountId, String clientIp) {
    Shift shift = shiftRepository.findById(request.getShiftId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc"));

    if (!"OPEN".equalsIgnoreCase(shift.getStatus())) {
        throw new IllegalStateException("Ca làm việc này đã được chốt trước đó");
    }

    // 1. Tính toán tổng tiền mặt bán được trong ca
    BigDecimal cashSales = salesInvoiceRepository.sumCashSalesByShift(shift.getShiftId());
    if (cashSales == null) cashSales = BigDecimal.ZERO;

    // 2. Tính toán tổng tiền hoàn trả tiền mặt
    BigDecimal refundCash = salesReturnRepository.sumCashRefundByShift(shift.getShiftId());
    if (refundCash == null) refundCash = BigDecimal.ZERO;

    // 3. Tính tiền mặt dự kiến trong két
    BigDecimal expectedCash = shift.getOpeningCash().add(cashSales).subtract(refundCash);

    // 4. Tính toán độ chênh lệch
    BigDecimal discrepancy = request.getClosingCashActual().subtract(expectedCash);

    // 5. Kiểm tra bắt buộc nhập ghi chú nếu lệch tiền
    if (discrepancy.compareTo(BigDecimal.ZERO) != 0 && (request.getNote() == null || request.getNote().trim().isEmpty())) {
        throw new IllegalArgumentException("Vui lòng nhập lý do giải trình khi két tiền bị chênh lệch!");
    }

    // 6. Cập nhật và đóng ca
    shift.setClosingTime(LocalDateTime.now());
    shift.setCalculatedCash(expectedCash);
    shift.setClosingCash(request.getClosingCashActual());
    shift.setDiscrepancy(discrepancy);
    shift.setStatus("CLOSED");
    shift.setNote(request.getNote());
    shiftRepository.save(shift);

    // 7. Ghi Audit Log
    auditLogService.log("SHIFT", "CLOSE_SHIFT", accountId, clientIp, 
        "Chốt ca #" + shift.getShiftId() + " - Thực tế: " + request.getClosingCashActual() + " VNĐ, Lệch: " + discrepancy + " VNĐ");

    return buildShiftSummary(shift, cashSales, refundCash);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CSFT-01** | Chốt ca cân khớp 100% | `actualCash` = 6.800.000, `expectedCash` = 6.800.000 | `discrepancy` = 0, chốt ca thành công, status = 'CLOSED' |
| **TC-CSFT-02** | Chốt ca thiếu tiền có ghi chú | `actualCash` = 6.750.000 (lệch -50.000), có ghi chú | Lưu thành công, hiển thị chênh lệch âm trong phiếu chốt ca |
| **TC-CSFT-03** | Chốt ca lệch tiền nhưng không nhập ghi chú | Lệch tiền, `note` = "" | Bị chặn lại, thông báo yêu cầu nhập giải trình chênh lệch |
| **TC-CSFT-04** | Cố tình chốt ca đã CLOSED | `shiftId` của ca đã đóng | Trả về HTTP 400 "Ca làm việc này đã được chốt trước đó" |

