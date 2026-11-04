# Đặc Tả Kỹ Thuật: 3.7.3 Cancel / Return Sales Invoice (Hủy Hóa Đơn & Đổi Trả Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC23` (SRS 3.7.3)
- **Tên Use Case**: Cancel/Return Sales Invoice (Hủy hóa đơn / Đổi trả hàng)
- **Tác nhân (Actor)**: `Store Manager` (Quản lý cửa hàng), `Pharmacist` (Dược sĩ bán thuốc có thẩm quyền)
- **Mô tả nghiệp vụ**: Cung cấp cơ chế xử lý hai tình huống nghiệp vụ:
  1. **Hủy hóa đơn (Cancel Invoice)**: Hủy một hóa đơn bị lập sai trong cùng ca làm việc trước khi chốt ca.
  2. **Đổi trả hàng & Hoàn tiền (Sales Return)**: Khách hàng đem thuốc/sản phẩm đã mua quay lại trả theo chính sách đổi trả của nhà thuốc. Hệ thống cho phép trả toàn phần hoặc một phần hóa đơn, tự động nhập lại số lượng vào tồn kho chi nhánh (`Inventory`), sinh phiếu hoàn trả (`SalesReturn`) và tính số tiền hoàn lại cho khách.
- **Tiền điều kiện (Preconditions)**:
  - Hóa đơn gốc tồn tại trong hệ thống với trạng thái `COMPLETED`.
  - Đối với đổi trả hàng: Hóa đơn được phát hành trong thời hạn đổi trả cho phép (tối đa 03 ngày kể từ ngày mua).
- **Hậu điều kiện (Postconditions)**:
  - Bản ghi phiếu hoàn trả được lưu vào bảng `dbo.sales_returns` và `dbo.sales_return_details`.
  - Hóa đơn gốc được cập nhật trạng thái (`invoice_status = 'CANCELLED'` hoặc `'RETURNED'`).
  - Số lượng hàng trả lại được cộng hoàn lại vào tồn kho chi nhánh (`dbo.inventories`).
  - Khấu trừ điểm tích lũy thành viên tương ứng với số tiền hoàn lại.
  - Ghi nhận chi tiết vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow - Trả hàng hoàn tiền)
1. Dược sĩ hoặc Quản lý cửa hàng truy cập màn hình **"Đổi trả hàng"** hoặc tìm kiếm hóa đơn gốc tại mục Lịch sử hóa đơn (`/sales`).
2. Nhập mã hóa đơn gốc (VD: `INV-20261104-0012`) hoặc quét mã vạch trên tờ bill khách cầm theo.
3. Hệ thống tải chi tiết hóa đơn gốc và hiển thị danh sách các sản phẩm đã mua kèm số lượng ban đầu và số lượng đã từng trả trước đó.
4. Nhân viên chọn các mặt hàng khách muốn trả:
   - Nhập **Số lượng trả** (`returnQuantity`): Phải <= số lượng còn lại có thể trả của mặt hàng đó.
   - Chọn **Lý do trả hàng** từ danh mục: *"Sản phẩm lỗi bao bì"*, *"Khách mua nhầm loại"*, *"Tác dụng phụ / Bác sĩ đổi đơn"*, *"Khác"*.
   - Kiểm tra tình trạng sản phẩm thực tế: tem niêm phong còn nguyên vẹn, vỉ thuốc không bị rách, không bảo quản sai nhiệt độ.
5. Hệ thống tự động tính toán tổng số tiền cần hoàn trả cho khách:
   $$\text{Tiền hoàn trả (Total Refund)} = \sum (\text{Số lượng trả} \times \text{Đơn giá mua sau chiết khấu})$$
6. Chọn hình thức hoàn tiền cho khách: **Tiền mặt (Cash Refund)** hoặc **Chuyển khoản (Bank Transfer)**.
7. Nhân viên bấm nút **"Xác nhận Trả hàng & Hoàn tiền" (Confirm Return)**.
8. Frontend gửi request `POST /api/v1/sales/returns` lên Backend.
9. Backend thực hiện giao dịch nguyên tử (`@Transactional`):
   - Tạo mã phiếu trả hàng duy nhất: `RET-YYYYMMDD-XXXX`.
   - Lưu vào bảng `dbo.sales_returns` và `dbo.sales_return_details`.
   - **Cộng hoàn tồn kho**: Duyệt từng mặt hàng, cộng lại số lượng vào `dbo.inventories` tương ứng với đúng chi nhánh và số lô (`batch_id`) ban đầu.
   - Cập nhật hóa đơn gốc sang trạng thái `RETURNED` (nếu trả hết) hoặc `PARTIALLY_RETURNED` (nếu trả một phần).
   - Nếu khách hàng có tích điểm, khấu trừ số điểm tương ứng khỏi tài khoản khách hàng.
   - Ghi nhận `audit_logs` (`action_code = 'SALES_RETURN'`).
10. Backend trả về HTTP `201 Created` kèm phiếu hoàn trả.
11. Giao diện hiển thị phiếu hoàn trả và kích hoạt in **"Biên bản trả hàng & Phiếu chi hoàn tiền"**.

### 2.2. Luồng Hủy Hóa Đơn Nhanh (Cancel Invoice trong ca)
- Áp dụng khi vừa in xong hóa đơn nhưng phát hiện sai sót (chưa đưa thuốc cho khách):
1. Quản lý cửa hàng vào chi tiết hóa đơn bấm nút **"Hủy hóa đơn" (Cancel Invoice)**.
2. Nhập lý do hủy hóa đơn (bắt buộc).
3. Hệ thống hoàn lại 100% tồn kho của tất cả các dòng sản phẩm, chuyển trạng thái hóa đơn sang `CANCELLED`.
4. Ghi nhận giao dịch hoàn tiền tương ứng trong ca để cân bằng két tiền mặt.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Thời hạn đổi trả)**: Chỉ chấp nhận đổi trả trong vòng **72 giờ (03 ngày)** kể từ thời điểm in hóa đơn gốc. Hóa đơn quá 72 giờ sẽ bị khóa chức năng trả hàng tự động (cần Quản trị viên can thiệp đặc biệt).
- **BR-02 (Quy định hoàn trả thuốc đặc thù)**: Các mặt hàng thuốc kháng sinh tiêm truyền, thuốc bảo quản lạnh (2-8°C như Insulin, vắc xin) theo quy định y tế KHÔNG được phép đổi trả nếu đã rời khỏi quầy thuốc để đảm bảo an toàn cho người bệnh khác.
- **BR-03 (Hoàn kho đúng lô)**: Sản phẩm trả lại bắt buộc phải được cộng đúng vào lô thuốc (`batch_id`) mà khách đã mua, không được cộng dồn vào lô khác làm sai lệch hạn dùng.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Modal Đổi Trả Hàng
| STT | Tên trường | Control Type | Bắt buộc | Ràng buộc dữ liệu |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `invoiceCode` | Search Box | Có | Mã hóa đơn hợp lệ |
| 2 | `returnItems` | Bảng chọn checkbox | Có | Chọn ít nhất 01 mặt hàng |
| 3 | `returnQuantity` | Number Input | Có | `1 <= returnQuantity <= soldQuantity - previouslyReturned` |
| 4 | `reason` | Dropdown + Text Area | Có | Chọn lý do chuẩn và nhập mô tả chi tiết |
| 5 | `refundMethod` | Dropdown | Có | Lựa chọn: Tiền mặt hoặc Chuyển khoản |
| 6 | `totalRefundAmount`| Display (Bold Red) | - | Tự động tính số tiền hoàn trả cho khách |
| 7 | Nút `Confirm Return`| Button (Danger) | - | Xác nhận hoàn tất đổi trả |
| 8 | Nút `Cancel` | Button (Secondary) | - | Đóng modal |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Xử lý đổi trả hàng & hoàn tiền:
- **Endpoint**: `POST /api/v1/sales/returns`
- **Mức độ truy cập**: `ROLE_STORE_MANAGER`, `ROLE_PHARMACIST`
- **Request Payload**:
```json
{
  "originalInvoiceId": 1205,
  "refundMethod": "CASH",
  "reason": "Khách dùng bị nổi mẩn ngứa, bác sĩ chỉ định ngừng thuốc",
  "items": [
    {
      "productId": 501,
      "batchId": 12,
      "returnQuantity": 1,
      "unitPrice": 120000.00
    }
  ]
}
```

- **Response Payload (HTTP 201 Created)**:
```json
{
  "status": 201,
  "message": "Xử lý trả hàng và hoàn tiền thành công",
  "data": {
    "returnId": 305,
    "returnCode": "RET-20261104-0003",
    "originalInvoiceCode": "INV-20261104-0012",
    "totalRefundAmount": 120000.00,
    "refundMethod": "CASH",
    "returnedAt": "2026-11-04T10:30:00",
    "processedByName": "Trần Quản Lý",
    "items": [
      {
        "productName": "Panadol Extra Đỏ",
        "returnQuantity": 1,
        "refundPrice": 120000.00
      }
    ]
  }
}
```

#### B. Hủy hóa đơn bán hàng:
- **Endpoint**: `POST /api/v1/sales/invoices/{id}/cancel`
- **Mức độ truy cập**: `ROLE_STORE_MANAGER`
- **Request Payload**:
```json
{
  "reason": "Thu ngân quét nhầm số lượng 10 hộp thay vì 1 hộp, hủy lập lại"
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SalesReturnRequest {
    @NotNull(message = "Mã hóa đơn gốc không được để trống")
    private Long originalInvoiceId;

    @NotBlank(message = "Lý do trả hàng không được để trống")
    private String reason;

    @NotBlank(message = "Hình thức hoàn tiền không được để trống")
    private String refundMethod; // CASH, BANK_TRANSFER

    @NotEmpty(message = "Danh sách hàng trả không được để trống")
    @Valid
    private List<ReturnItemRequest> items;
}

@Data
public class ReturnItemRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Mã lô thuốc không được để trống")
    private Long batchId;

    @NotNull(message = "Số lượng trả không được để trống")
    @DecimalMin(value = "1", message = "Số lượng trả phải từ 1 trở lên")
    private Integer returnQuantity;

    @NotNull(message = "Đơn vị giá hoàn trả không được để trống")
    private BigDecimal unitPrice;
}
```

### 4.3. Thuật Toán Service Layer (`SalesReturnServiceImpl.processReturn`)
```java
@Transactional(rollbackFor = Exception.class)
public SalesReturnResponse processReturn(SalesReturnRequest request, Long accountId, String clientIp) {
    SalesInvoice originalInvoice = salesInvoiceRepository.findById(request.getOriginalInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn gốc không tồn tại"));

    // 1. Kiểm tra thời hạn đổi trả (72 giờ)
    if (originalInvoice.getCreatedAt().plusHours(72).isBefore(LocalDateTime.now())) {
        throw new IllegalStateException("Hóa đơn đã quá hạn đổi trả cho phép (tối đa 72 giờ kể từ khi mua)!");
    }

    SalesReturn salesReturn = new SalesReturn();
    salesReturn.setReturnCode(generateReturnCode());
    salesReturn.setOriginalInvoiceId(originalInvoice.getInvoiceId());
    salesReturn.setCustomerId(originalInvoice.getCustomerId());
    salesReturn.setProcessedBy(accountId);
    salesReturn.setReason(request.getReason());
    salesReturn.setReturnDate(LocalDateTime.now());

    BigDecimal totalRefund = BigDecimal.ZERO;
    List<SalesReturnDetail> details = new ArrayList<>();

    // 2. Xử lý từng dòng trả hàng và hoàn kho
    for (ReturnItemRequest itemReq : request.getItems()) {
        // Cộng hoàn số lượng vào bảng tồn kho chi nhánh
        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdAndBatchId(
                originalInvoice.getStoreId(), itemReq.getProductId(), itemReq.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tồn kho"));

        inventory.setQuantity(inventory.getQuantity() + itemReq.getReturnQuantity());
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Tạo chi tiết trả hàng
        SalesReturnDetail detail = new SalesReturnDetail();
        detail.setSalesReturn(salesReturn);
        detail.setProductId(itemReq.getProductId());
        detail.setBatchId(itemReq.getBatchId());
        detail.setQuantity(itemReq.getReturnQuantity());
        detail.setRefundPrice(itemReq.getUnitPrice());
        BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getReturnQuantity()));
        detail.setLineTotal(lineTotal);
        details.add(detail);

        totalRefund = totalRefund.add(lineTotal);
    }

    salesReturn.setTotalRefundAmount(totalRefund);
    salesReturn.setDetails(details);
    salesReturnRepository.save(salesReturn);

    // 3. Cập nhật trạng thái hóa đơn gốc
    originalInvoice.setInvoiceStatus("RETURNED");
    salesInvoiceRepository.save(originalInvoice);

    // 4. Khấu trừ điểm tích lũy của khách hàng (nếu có)
    if (originalInvoice.getCustomerId() != null) {
        customerService.deductPoints(originalInvoice.getCustomerId(), totalRefund);
    }

    // 5. Ghi Audit Log
    auditLogService.log("SALES", "RETURN_INVOICE", accountId, clientIp, 
        "Tạo phiếu trả hàng #" + salesReturn.getReturnCode() + " cho hóa đơn #" + originalInvoice.getInvoiceCode() + " hoàn trả " + totalRefund + " VNĐ");

    return mapToSalesReturnResponse(salesReturn);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-RET-01** | Trả hàng hợp lệ trong 72h | Mua 2 hộp, trả 1 hộp còn nguyên vẹn | Lưu phiếu trả hàng, tồn kho tăng +1, hoàn tiền đúng |
| **TC-RET-02** | Trả hàng quá hạn 72h | Hóa đơn mua từ 5 ngày trước | Báo lỗi "Hóa đơn đã quá hạn đổi trả cho phép" |
| **TC-RET-03** | Trả quá số lượng đã mua | Đã mua 1 hộp, yêu cầu trả 2 hộp | Bị chặn lại, thông báo lỗi số lượng vượt quá số đã mua |
| **TC-RET-04** | Hủy hóa đơn trong ngày | Hóa đơn vừa tạo, chưa kết ca | Hóa đơn sang CANCELLED, hoàn 100% hàng vào kho |

