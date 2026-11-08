# Đặc Tả Kỹ Thuật: 3.7.1 Create Sales Invoice (Tạo Hóa Đơn Bán Lẻ Tại Quầy POS)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC21` (SRS 3.7.1)
- **Tên Use Case**: Create Sales Invoice (Tạo hóa đơn bán lẻ)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: Cho phép nhân viên tạo mới một hóa đơn bán lẻ thuốc và thực phẩm chức năng tại quầy thu ngân (POS Counter). Hỗ trợ quét mã vạch Barcode, tìm kiếm sản phẩm thông minh, tự động chọn Lô thuốc theo nguyên tắc FEFO (Hạn dùng gần nhất xuất trước), bán thuốc lẻ đa đơn vị (Viên, Vỉ, Hộp) với cơ chế quy đổi tương thích ngược, kiểm tra tồn kho khả dụng và chiết khấu cho khách hàng.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập và đang có một ca làm việc đang mở (`status = 'OPEN'`).
  - Sản phẩm/thuốc được bán phải còn tồn kho khả dụng tại chi nhánh (`inventories.quantity > 0`).
- **Hậu điều kiện (Postconditions)**:
  - Hóa đơn mới được lưu vào bảng `dbo.sales_invoices` với mã hóa đơn duy nhất (VD: `INV-20261104-0012`).
  - Chi tiết từng mặt hàng được lưu vào `dbo.sales_invoice_details` (kèm đơn vị tính và hệ số quy đổi lúc bán).
  - Số lượng tồn kho tại chi nhánh tương ứng với từng lô thuốc bị trừ ngay lập tức trong bảng `dbo.inventories` theo đơn vị cơ bản (Base Quantity).
  - Cập nhật tổng chi tiêu tích lũy cho khách hàng (nếu có chọn khách hàng).
  - Bản ghi nhật ký được lưu vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Dược sĩ truy cập màn hình **POS Counter** (`/pos`).
2. Hệ thống kiểm tra ca mở của dược sĩ và tự động gán `shiftId` và `storeId` cho phiên bán hàng.
3. **Thêm sản phẩm vào giỏ hàng**:
   - Dược sĩ sử dụng máy quét mã vạch để quét Barcode trên vỏ hộp thuốc, HOẶC gõ tên thuốc/hoạt chất vào thanh tìm kiếm
   - Hệ thống lọc ra danh sách các lô thuốc còn hạn sử dụng tại kho chi nhánh và tự động chọn lô thuốc có hạn sử dụng gần nhất (**FEFO - First Expired, First Out**).
   - Sản phẩm được thêm vào bảng giỏ hàng với: Tên thuốc, Đơn vị tính (Hộp/Vỉ/Viên - có Dropdown chọn nếu thuốc có nhiều đơn vị), Số lô (Batch No), Hạn dùng (Exp Date), Đơn giá tương ứng với đơn vị chọn, Số lượng mặc định = 1, Thành tiền.
4. **Chỉnh sửa giỏ hàng & Chọn đơn vị tính bán lẻ**:
   - Dược sĩ có thể chọn đơn vị bán lẻ (Hộp, Vỉ, Viên). Khi thay đổi đơn vị, hệ thống tự động cập nhật lại đơn giá niêm yết của đơn vị đó.
   - Dược sĩ điều chỉnh số lượng mua (phím tắt `+/-` hoặc nhập số trực tiếp).
   - Hệ thống tự động quy đổi ra số lượng đơn vị cơ bản:
     $$\text{Số lượng cơ bản (Base Quantity)} = \text{Số lượng mua} \times \text{Hệ số quy đổi (conversion\_factor)}$$
   - Kiểm tra tồn kho: nếu $\text{Base Quantity} > \text{Số lượng tồn kho cơ bản của lô}$ -> cảnh báo và chặn không cho phép bán vượt quá tồn kho.
   - Dược sĩ có thể xóa dòng sản phẩm (icon thùng rác hoặc phím `Delete`).
5. **Chọn thông tin khách hàng (Tùy chọn)**:
   - Mặc định là **"Khách vãng lai"** (Customer ID = null hoặc ID mặc định).
   - Nếu khách hàng đã đăng ký, dược sĩ nhập Số điện thoại khách hàng (phím tắt `F4`). Hệ thống hiển thị: Tên khách hàng, Số điện thoại và cảnh báo tiền sử dị ứng thuốc (nếu có trong hồ sơ sức khỏe).
6. **Chiết khấu và Thuế**:
   - Dược sĩ có thể nhập mã giảm giá hoặc chiết khấu trực tiếp (% hoặc số tiền) nếu có quyền.
   - Hệ thống tự động tính:
     $$\text{Tổng tiền hàng (Total)} = \sum (\text{Số lượng} \times \text{Đơn giá})$$
     $$\text{Tiền thuế VAT} = \sum (\text{Thành tiền} \times \% \text{VAT})$$
     $$\text{Tiền cần thanh toán (Net Amount)} = \text{Tổng tiền hàng} - \text{Chiết khấu} + \text{Thuế VAT}$$
7. Dược sĩ bấm nút **"Thanh toán" (Process Payment - Phím F9)** để mở cửa sổ xử lý thanh toán (chuyển sang Use Case 3.7.2).
8. Sau khi thanh toán thành công, hóa đơn được lưu vào cơ sở dữ liệu với trạng thái `COMPLETED`.
9. Tồn kho chi nhánh bị trừ tự động theo giao dịch nguyên tử (`@Transactional`).
10. Hệ thống hiển thị hộp thoại in hóa đơn nhiệt khổ K80 và tự động reset giỏ hàng để đón lượt khách tiếp theo.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Hết tồn kho khả dụng**: Khi thêm sản phẩm hoặc tăng số lượng vượt quá số lượng tồn thực tế của chi nhánh, hệ thống thông báo lỗi: *"Số lượng trong kho không đủ (Hiện còn: X đơn vị)"*.
- **A2 - Thuốc đã hết hạn sử dụng**: Các lô thuốc có `expiry_date <= CURRENT_DATE` sẽ bị khóa và ẩn khỏi danh sách tìm kiếm bán lẻ, không cho phép đưa vào giỏ hàng.
- **A3 - Cảnh báo dị ứng thuốc**: Nếu khách hàng có hồ sơ y tế ghi nhận dị ứng với hoạt chất có trong thuốc vừa chọn, hệ thống lập tức hiển thị cảnh báo đỏ nổi bật: *"CẢNH BÁO: Khách hàng có tiền sử dị ứng với thành phần [Tên hoạt chất]!"* để Dược sĩ tư vấn lại.
- **A4 - Lưu tạm đơn hàng (Hold Order)**: Dược sĩ có thể bấm "Lưu tạm đơn" (phím `F8`) để phục vụ khách khác khi khách hiện tại cần thời gian chọn thêm hoặc chuyển tiền; sau đó có thể mở lại đơn tạm bất cứ lúc nào.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bắt buộc phải có Ca làm việc đang mở)**: Hóa đơn chỉ được tạo khi người dùng có `Shift` hợp lệ với trạng thái `OPEN`.
- **BR-02 (Quy tắc xuất kho FEFO)**: Hệ thống ưu tiên xuất các lô thuốc có hạn sử dụng gần nhất trước. Trường hợp một lô không đủ số lượng, hệ thống tự động tách thành 2 dòng với 2 lô khác nhau.
- **BR-03 (Định dạng mã hóa đơn)**: `invoice_code` được sinh tự động theo quy tắc: `INV-YYYYMMDD-XXXX` (Ví dụ: `INV-20261104-0001`), đảm bảo tính duy nhất tuyệt đối.
- **BR-04 (Quy ước ngầm định & Tương thích ngược khi bán lẻ đa đơn vị)**:
  * **Tồn kho chuẩn**: Số lượng tồn kho trong bảng `inventories` luôn được lưu trữ và tính toán theo **Đơn vị nhỏ nhất (Base Unit / Smallest Unit)** (VD: Viên).
  * **Quy ước ngầm định (Default / Fallback)**: Nếu một sản phẩm **chưa được thiết lập bảng quy đổi** trong `product_units` (hoặc là các sản phẩm đóng gói đơn chiếc như Chai siro, Tuýp kem, Que thử thai), hệ thống sẽ tự động coi sản phẩm đó chỉ có **1 đơn vị duy nhất** lấy từ bảng `products`:
    * Tên đơn vị: `product.unit`
    * Hệ số quy đổi: `conversion_factor = 1`
    * Đơn giá: `product.selling_price`
  * **Khi bán hàng có đơn vị quy đổi**: 
    $$\text{Số lượng trừ kho thực tế} = \text{Số lượng bán (quantity)} \times \text{conversion\_factor}$$
    *Ví dụ*: Thuốc Decolgen có quy đổi (1 Hộp = 25 Vỉ = 100 Viên). Khi Dược sĩ bán 2 Vỉ (hệ số 4) $\rightarrow$ Kho trừ $2 \times 4 = 8$ Viên.

### 2.4. Lộ Trình Triển Khai Cuốn Chiếu (Phased Rollout Plan)
Để đảm bảo hệ thống không bị gián đoạn hoạt động và bảo toàn tính toàn vẹn dữ liệu, tính năng bán lẻ đa đơn vị được thực hiện theo 3 giai đoạn:
- **Bước 1 (Danh mục & Cấu hình Đơn vị)**: Tạo bảng cơ sở dữ liệu `product_units`. Bổ sung giao diện thiết lập danh sách đơn vị quy đổi (Tên đơn vị, Hệ số quy đổi, Giá bán riêng) trong màn hình Quản lý Sản phẩm.
- **Bước 2 (Bán hàng POS & Trừ tồn kho)**: Cập nhật giao diện bán hàng POS cho phép chọn đơn vị quy đổi; chỉnh sửa logic Backend `createInvoice` và `returnSalesInvoice` để trừ và hoàn kho theo `conversion_factor` (kèm quy ước ngầm định cho thuốc chưa quy đổi).
- **Bước 3 (Kiểm kê kho & Báo cáo)**: Nâng cấp màn hình Kiểm kê kho (`Inventory Audit`) hỗ trợ nhập kiểm kê chẵn/lẻ (Hộp + Vỉ + Viên); cập nhật các Báo cáo Doanh thu và Báo cáo Xuất - Nhập - Tồn hiển thị quy đổi chuẩn xác.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Màn Hình POS (`PosCounterPage.jsx`)
Giao diện được tối ưu hóa cho thao tác nhanh không cần chuột (hỗ trợ toàn bộ phím tắt):
- **Phía trên**: Thông tin ca làm việc, tên thu ngân, chi nhánh, thời gian thực.
- **Cột bên trái (65% chiều rộng)**:
  - Thanh tìm kiếm thuốc / ô quét Barcode (`input` luôn tự động autofocus).
  - Bảng danh sách mặt hàng trong giỏ (`PosCartTable`): STT, Tên thuốc & hàm lượng, Số lô, Hạn dùng, Đơn vị tính, Đơn giá, Số lượng, Thành tiền, Nút xóa dòng.
- **Cột bên phải (35% chiều rộng)**:
  - Ô tìm kiếm / Thông tin khách hàng (`CustomerBox`).
  - Bảng tóm tắt thanh toán: Tổng tiền hàng, Giảm giá/Chiết khấu, Thuế VAT, **Tổng thanh toán (Net Amount)** hiển thị cỡ chữ lớn màu xanh nổi bật.
  - Phím chức năng: `F2 - Tìm thuốc`, `F4 - Tìm khách`, `F8 - Lưu đơn tạm`, `F9 - Thanh toán`, `ESC - Hủy đơn`.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `POST /api/v1/sales/invoices`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Content-Type**: `application/json`

#### Request Payload Schema:
```json
{
  "customerId": 105,
  "discountAmount": 20000.00,
  "taxAmount": 15000.00,
  "note": "Khách mua theo đơn bác sĩ viện K",
  "items": [
    {
      "productId": 501,
      "batchId": 12,
      "unitId": 102,
      "unitName": "Vỉ",
      "quantity": 2,
      "unitPrice": 30000.00,
      "discount": 0.00
    },
    {
      "productId": 508,
      "batchId": 45,
      "unitId": null,
      "unitName": "Lọ",
      "quantity": 1,
      "unitPrice": 85000.00,
      "discount": 0.00
    }
  ],
  "payment": {
    "paymentMethod": "CASH",
    "amountPaid": 145000.00,
    "tenderedCash": 200000.00
  }
}
```

#### Response Payload (Thành công - HTTP 201 Created):
```json
{
  "status": 201,
  "message": "Tạo và thanh toán hóa đơn thành công",
  "data": {
    "invoiceId": 1205,
    "invoiceCode": "INV-20261104-0012",
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "cashierName": "Nguyễn Văn Dược",
    "customerName": "Trần Thị Lan",
    "totalAmount": 145000.00,
    "discountAmount": 0.00,
    "taxAmount": 0.00,
    "netAmount": 145000.00,
    "changeAmount": 55000.00,
    "paymentStatus": "PAID",
    "invoiceStatus": "COMPLETED",
    "createdAt": "2026-11-04T09:15:30",
    "items": [
      {
        "productName": "Panadol Extra Đỏ",
        "batchNumber": "BATCH-202512-01",
        "unit": "Vỉ",
        "conversionFactor": 12,
        "quantity": 2,
        "baseQuantity": 24,
        "unitPrice": 30000.00,
        "lineTotal": 60000.00
      },
      {
        "productName": "Berberin 100mg",
        "batchNumber": "BATCH-202605-03",
        "unit": "Lọ",
        "conversionFactor": 1,
        "quantity": 1,
        "baseQuantity": 1,
        "unitPrice": 85000.00,
        "lineTotal": 85000.00
      }
    ]
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateSalesInvoiceRequest {
    private Long customerId;
    
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private String note;

    @NotEmpty(message = "Hóa đơn phải có ít nhất một sản phẩm")
    @Valid
    private List<InvoiceItemRequest> items;

    @NotNull(message = "Thông tin thanh toán không được để trống")
    @Valid
    private PaymentInfoRequest payment;
}

@Data
public class InvoiceItemRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Mã lô thuốc không được để trống")
    private Long batchId;

    private Long unitId; // Null nếu là sản phẩm đơn vị mặc định
    private String unitName; // "Hộp", "Vỉ", "Viên"

    @NotNull(message = "Số lượng không được để trống")
    @DecimalMin(value = "1", message = "Số lượng bán phải từ 1 trở lên")
    private Integer quantity;

    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal unitPrice;

    private BigDecimal discount = BigDecimal.ZERO;
}
```

### 4.3. Thuật Toán Service Layer (`SalesInvoiceServiceImpl.createInvoice`)
```java
@Transactional(rollbackFor = Exception.class)
public SalesInvoiceResponse createInvoice(CreateSalesInvoiceRequest request, Long accountId, String clientIp) {
    // 1. Kiểm tra ca làm việc đang mở của nhân viên
    Shift currentShift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
            .orElseThrow(() -> new NoOpenShiftException("Bạn chưa mở ca làm việc hoặc ca đã bị đóng!"));

    // 2. Khởi tạo đối tượng SalesInvoice
    SalesInvoice invoice = new SalesInvoice();
    invoice.setCode(generateInvoiceCode());
    invoice.setStore(currentShift.getStore());
    invoice.setShift(currentShift);
    invoice.setAccount(accountRepository.findById(accountId).orElse(null));
    if (request.getCustomerId() != null) {
        invoice.setCustomer(customerRepository.findById(request.getCustomerId()).orElse(null));
    }
    invoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
    invoice.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
    invoice.setCreatedAt(LocalDateTime.now());

    BigDecimal totalAmount = BigDecimal.ZERO;
    List<SalesInvoiceDetail> details = new ArrayList<>();

    // 3. Duyệt và kiểm tra tồn kho quy đổi cho từng sản phẩm
    for (InvoiceItemRequest itemReq : request.getItems()) {
        Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdAndBatchId(
                currentShift.getStore().getId(), itemReq.getProductId(), itemReq.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong kho chi nhánh!"));

        // Quy ước ngầm định (Backward Compatibility):
        ProductUnit unit = itemReq.getUnitId() != null 
                ? productUnitRepository.findById(itemReq.getUnitId()).orElse(null) 
                : null;
        
        String unitName = (unit != null) ? unit.getUnitName() : product.getUnit();
        int conversionFactor = (unit != null) ? unit.getConversionFactor() : 1;
        BigDecimal unitPrice = (unit != null) ? unit.getSellingPrice() : (itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getSellingPrice());

        // Tính số lượng cơ bản trừ kho
        int baseQuantityToDeduct = itemReq.getQuantity() * conversionFactor;

        if (inventory.getQuantity() < baseQuantityToDeduct) {
            throw new InsufficientStockException("Sản phẩm " + product.getName() + " không đủ tồn kho khả dụng! Hiện còn: " + inventory.getQuantity() + " " + product.getUnit());
        }

        // Trừ tồn kho chi nhánh theo đơn vị cơ bản
        inventory.setQuantity(inventory.getQuantity() - baseQuantityToDeduct);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Tạo chi tiết hóa đơn
        SalesInvoiceDetail detail = new SalesInvoiceDetail();
        detail.setSalesInvoice(invoice);
        detail.setProduct(product);
        detail.setBatch(inventory.getBatch());
        detail.setQuantity(itemReq.getQuantity());
        detail.setUnitName(unitName);
        detail.setConversionFactor(conversionFactor);
        detail.setBaseQuantity(baseQuantityToDeduct);
        detail.setUnitPrice(unitPrice);
        
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).subtract(itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO);
        detail.setSubTotal(lineTotal);
        details.add(detail);

        totalAmount = totalAmount.add(lineTotal);
    }

    BigDecimal netAmount = totalAmount.subtract(invoice.getDiscountAmount()).add(invoice.getTaxAmount());
    invoice.setTotalAmount(totalAmount);
    invoice.setFinalAmount(netAmount);
    invoice.setStatus((short) 1); // 1 = COMPLETED
    invoice.setDetails(details);
    SalesInvoice savedInvoice = salesInvoiceRepository.save(invoice);

    // 4. Xử lý thanh toán
    paymentService.recordPayment(savedInvoice, request.getPayment());

    // 5. Ghi Audit Log
    auditLogService.log("SALES", "CREATE_INVOICE", accountId, clientIp, 
        "Tạo hóa đơn #" + savedInvoice.getCode() + " với số tiền " + netAmount + " VNĐ");

    return mapToInvoiceResponse(savedInvoice, request.getPayment());
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-INV-01** | Bán hàng thành công | Thuốc có đủ tồn kho, thanh toán tiền mặt | Tạo hóa đơn thành công, tồn kho trừ đúng, in được bill |
| **TC-INV-02** | Bán khi chưa mở ca | Nhân viên chưa có ca OPEN | Chặn lại và báo lỗi "Bạn chưa mở ca làm việc" |
| **TC-INV-03** | Bán quá số lượng tồn kho | Tồn kho cơ bản = 5 viên, bán 2 vỉ (8 viên) | Báo lỗi HTTP 400 "Số lượng trong kho không đủ" |
| **TC-INV-04** | Giỏ hàng trống | `items`: [] | Validation lỗi "Hóa đơn phải có ít nhất một sản phẩm" |
| **TC-INV-05** | Bán thuốc lẻ đa đơn vị có quy đổi | Bán 2 vỉ Decolgen (hệ số 4 viên/vỉ) | Hóa đơn lưu 2 Vỉ, tồn kho `inventories` trừ đúng 8 Viên cơ bản |
| **TC-INV-06** | Bán sản phẩm đơn chiếc (Fallback quy ước ngầm định) | `unitId: null`, Siro Prospan (hệ số = 1) | Tự động áp dụng đơn vị gốc "Chai", hệ số 1, trừ kho 1 chai |

