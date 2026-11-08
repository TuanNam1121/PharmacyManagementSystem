# Đặc Tả Kỹ Thuật: 3.7.1 Create Sales Invoice (Tạo Hóa Đơn Bán Lẻ Tại Quầy POS)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC21` (SRS 3.7.1)
- **Tên Use Case**: Create Sales Invoice (Tạo hóa đơn bán lẻ)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: Cho phép nhân viên tạo mới một hóa đơn bán lẻ thuốc và thực phẩm chức năng tại quầy thu ngân (POS Counter). Hỗ trợ quét mã vạch Barcode, tìm kiếm sản phẩm thông minh, tự động chọn Lô thuốc theo nguyên tắc FEFO (Hạn dùng gần nhất xuất trước), bán thuốc lẻ đa đơn vị (Viên, Vỉ, Hộp) với cơ chế quy đổi tương thích ngược, kiểm tra tồn kho khả dụng và chiết khấu cho khách hàng.
  > [!IMPORTANT]
  > **Quy định bắt buộc**: Mọi hóa đơn bán lẻ tại quầy POS **bắt buộc phải có thông tin khách hàng định danh** (thông qua đọc Số điện thoại). Nếu khách hàng mới chưa có trong hệ thống, giao diện tự động bật Modal để thêm mới nhanh khách hàng trước khi cho phép hoàn tất đơn hàng.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập và đang có một ca làm việc đang mở (`shift.status = 'OPEN'`).
  - Sản phẩm/thuốc được bán phải còn tồn kho khả dụng tại chi nhánh (`inventories.quantity > 0`).
- **Hậu điều kiện (Postconditions)**:
  - Hóa đơn mới được lưu vào bảng `dbo.sales_invoices` với mã hóa đơn duy nhất (VD: `INV-20261104-0012`).
  - Chi tiết từng mặt hàng được lưu vào `dbo.sales_invoice_details` (kèm đơn vị tính và hệ số quy đổi lúc bán).
  - Số lượng tồn kho tại chi nhánh tương ứng với từng lô thuốc bị trừ ngay lập tức trong bảng `dbo.inventories` theo đơn vị cơ bản (Base Quantity).
  - Cập nhật tổng chi tiêu tích lũy và điểm thưởng cho khách hàng trong bảng `dbo.customers`.
  - Bản ghi nhật ký được lưu vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Dược sĩ truy cập màn hình **POS Counter** (`/pos`).
2. Hệ thống kiểm tra ca mở của dược sĩ và tự động gán `shiftId` và `storeId` cho phiên bán hàng.
3. **Thêm sản phẩm vào giỏ hàng**:
   - Dược sĩ sử dụng máy quét mã vạch để quét Barcode trên vỏ hộp thuốc, HOẶC gõ tên thuốc/hoạt chất vào thanh tìm kiếm.
   - Hệ thống lọc ra danh sách các lô thuốc còn hạn sử dụng tại kho chi nhánh và tự động chọn lô thuốc có hạn sử dụng gần nhất (**FEFO - First Expired, First Out**).
   - Sản phẩm được thêm vào bảng giỏ hàng với: Tên thuốc, Đơn vị tính (Hộp/Vỉ/Viên - có Dropdown chọn nếu thuốc có nhiều đơn vị), Số lô (Batch No), Hạn dùng (Exp Date), Đơn giá tương ứng với đơn vị chọn, Số lượng mặc định = 1, Thành tiền.
4. **Chỉnh sửa giỏ hàng & Chọn đơn vị tính bán lẻ**:
   - Dược sĩ có thể chọn đơn vị bán lẻ (Hộp, Vỉ, Viên). Khi thay đổi đơn vị, hệ thống tự động cập nhật lại đơn giá niêm yết của đơn vị đó.
   - Dược sĩ điều chỉnh số lượng mua (phím tắt `+/-` hoặc nhập số trực tiếp).
   - Hệ thống tự động quy đổi ra số lượng đơn vị cơ bản:
     $$\text{Số lượng cơ bản (Base Quantity)} = \text{Số lượng mua} \times \text{Hệ số quy đổi (conversion\_factor)}$$
   - Kiểm tra tồn kho: nếu $\text{Base Quantity} > \text{Số lượng tồn kho cơ bản của lô}$ -> cảnh báo và chặn không cho phép bán vượt quá tồn kho.
   - Dược sĩ có thể xóa dòng sản phẩm (icon thùng rác hoặc phím `Delete`).

5. **Xác định thông tin Khách Hàng (BẮT BUỘC - Customer Identification)**:
   - Dược sĩ hỏi / đọc **Số điện thoại** của khách hàng và nhập vào ô tìm kiếm khách hàng (phím tắt `F4`).
   - Hệ thống tự động tra cứu khách hàng theo SĐT:
     * **Trường hợp 5.1 - Khách hàng đã tồn tại**:
       - Hệ thống tự động hiển thị: Tên khách hàng, SĐT, Điểm tích lũy hiện có, Hạng thành viên.
       - Tự động gán khách hàng vào đơn bán.
       - Kiểm tra hồ sơ sức khỏe: Nếu khách hàng có tiền sử dị ứng với hoạt chất có trong thuốc đang chọn trong giỏ, lập tức hiển thị cảnh báo đỏ nổi bật để Dược sĩ tư vấn lại.
     * **Trường hợp 5.2 - Số điện thoại chưa có trong hệ thống (Khách hàng mới)**:
       - Hệ thống phát hiện khách hàng chưa đăng ký và **tự động hiển thị Modal "Thêm Mới Khách Hàng Nhanh" (Create New Customer Modal)** ngay tại màn hình POS.
       - Ô Số điện thoại được tự động điền sẵn (autofill) từ giá trị dược sĩ vừa gõ.
       - Dược sĩ hỏi và nhập nhanh:
         * **Họ và tên khách hàng** *(Bắt buộc)*
         * Giới tính *(Nam / Nữ)*
         * Năm sinh hoặc Ngày sinh *(Tùy chọn)*
         * Tiền sử dị ứng / Bệnh nền mãn tính *(Tùy chọn)*
       - Dược sĩ bấm **"Lưu khách hàng" (Enter)**:
         * Hệ thống tạo mới bản ghi khách hàng trong bảng `dbo.customers`.
         * Khách hàng mới được **tự động gán ngay vào giỏ hàng POS hiện tại**.
         * Modal đóng lại, hiển thị thông báo thành công: *"Đã lưu khách hàng mới: [Tên khách] ([SĐT])"*.

6. **Chiết khấu và Thuế**:
   - Dược sĩ có thể nhập mã giảm giá hoặc chiết khấu trực tiếp (% hoặc số tiền) nếu có quyền.
   - Hệ thống tự động tính:
     $$\text{Tổng tiền hàng (Total)} = \sum (\text{Số lượng} \times \text{Đơn giá})$$
     $$\text{Tiền thuế VAT} = \sum (\text{Thành tiền} \times \% \text{VAT})$$
     $$\text{Tiền cần thanh toán (Net Amount)} = \text{Tổng tiền hàng} - \text{Chiết khấu} + \text{Thuế VAT}$$

7. **Kiểm tra điều kiện & Tiến hành Thanh toán (F9)**:
   - **RÀNG BUỘC CHẶN ĐƠN KHÔNG CÓ KHÁCH HÀNG**: 
     - Nếu giỏ hàng có thuốc nhưng **chưa chọn khách hàng**, nút "Thanh toán (F9)" sẽ bị khóa (hoặc khi bấm vào sẽ bật cảnh báo đỏ: *"Vui lòng nhập số điện thoại khách hàng trước khi hoàn tất đơn hàng!"* và tự động focus vào ô SĐT khách hàng).
     - Tuyệt đối không cho phép tạo hóa đơn bán lẻ nếu `customerId` null.
   - Khi đã có khách hàng hợp lệ, Dược sĩ bấm **"Thanh toán" (Phím F9)** để mở cửa sổ xử lý thanh toán (chuyển sang Use Case 3.7.2: Tiền mặt hoặc Chuyển khoản PayOS VietQR tự động).

8. Sau khi thanh toán thành công, hóa đơn được lưu vào cơ sở dữ liệu với trạng thái `COMPLETED`.
9. Tồn kho chi nhánh bị trừ tự động theo giao dịch nguyên tử (`@Transactional`).
10. Hệ thống hiển thị hộp thoại in hóa đơn nhiệt khổ K80 và tự động reset giỏ hàng để đón lượt khách tiếp theo.

---

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Hết tồn kho khả dụng**: Khi thêm sản phẩm hoặc tăng số lượng vượt quá số lượng tồn thực tế của chi nhánh, hệ thống thông báo lỗi: *"Số lượng trong kho không đủ (Hiện còn: X đơn vị)"*.
- **A2 - Thuốc đã hết hạn sử dụng**: Các lô thuốc có `expiry_date <= CURRENT_DATE` sẽ bị khóa và ẩn khỏi danh sách tìm kiếm bán lẻ, không cho phép đưa vào giỏ hàng.
- **A3 - Cảnh báo dị ứng thuốc**: Nếu khách hàng có hồ sơ y tế ghi nhận dị ứng với hoạt chất có trong thuốc vừa chọn, hệ thống lập tức hiển thị cảnh báo đỏ nổi bật: *"CẢNH BÁO: Khách hàng có tiền sử dị ứng với thành phần [Tên hoạt chất]!"* để Dược sĩ tư vấn lại.
- **A4 - Khách chưa có thông tin khi bấm Thanh toán**: Hệ thống chặn lại, tự động trỏ chuột vào ô nhập SĐT khách hàng kèm thông báo: *"Bắt buộc phải có thông tin khách hàng để thanh toán hóa đơn"*.
- **A5 - Khách không đồng ý cung cấp thông tin cá nhân chi tiết**: Dược sĩ chỉ cần hỏi Tên và Số điện thoại để hoàn tất việc đăng ký nhanh trong vòng 5 giây.
- **A6 - Lưu tạm đơn hàng (Hold Order)**: Dược sĩ có thể bấm "Lưu tạm đơn" (phím `F8`) để phục vụ khách khác khi khách hiện tại cần thời gian chọn thêm hoặc chuyển tiền; sau đó có thể mở lại đơn tạm bất cứ lúc nào.

---

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
- **BR-05 (Bắt buộc định danh khách hàng)**: Mọi hóa đơn bán lẻ phát sinh tại quầy POS **bắt buộc phải gắn với 1 khách hàng cụ thể (`customerId != null`)**. Không hỗ trợ hóa đơn khuyết danh để đảm bảo an toàn sử dụng thuốc, tích lũy điểm thưởng thành viên và truy xuất lịch sử điều trị theo quy định ngành y tế.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Màn Hình POS (`PosCounterPage.jsx`)
- **Phía trên**: Thông tin ca làm việc, tên thu ngân, chi nhánh, thời gian thực.
- **Cột bên trái (65% chiều rộng)**:
  - Thanh tìm kiếm thuốc / ô quét Barcode (`input` luôn tự động autofocus).
  - Bảng danh sách mặt hàng trong giỏ (`PosCartTable`): STT, Tên thuốc & hàm lượng, Số lô, Hạn dùng, Đơn vị tính, Đơn giá, Số lượng, Thành tiền, Nút xóa dòng.
- **Cột bên phải (35% chiều rộng)**:
  - **Khung thông tin khách hàng (`CustomerBox`)**:
    * Ô nhập Số điện thoại khách hàng (Phím tắt `F4`).
    * Nếu chưa chọn khách: Hiển thị dòng nhắc màu cam nổi bật *"Vui lòng nhập SĐT khách hàng (Bắt buộc)"*.
    * Nếu đã chọn khách: Hiển thị tên khách hàng in đậm, số điện thoại, điểm tích lũy (`+X điểm`), nút thay đổi khách hàng (icon đổi/xóa).
  - Bảng tóm tắt thanh toán: Tổng tiền hàng, Giảm giá/Chiết khấu, Thuế VAT, **Tổng thanh toán (Net Amount)** hiển thị cỡ chữ lớn màu xanh nổi bật.
  - Phím chức năng: `F2 - Tìm thuốc`, `F4 - Tìm khách`, `F8 - Lưu đơn tạm`, `F9 - Thanh toán`, `ESC - Hủy đơn`.

---

### 3.2. Modal Thêm Mới Khách Hàng Nhanh (`CustomerCreateQuickModal.jsx`)
| STT | Tên trường | Control Type | Bắt buộc | Ghi chú & Ràng buộc |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `phone` | Text Input | Có | Tự động điền SĐT vừa đọc từ khách. Kiểm tra 10 chữ số hợp lệ. |
| 2 | `fullName` | Text Input | Có | Họ và tên khách hàng (Tự động focus để gõ ngay). |
| 3 | `gender` | Radio / Button Group | Không | Nam / Nữ. Mặc định chọn Nam hoặc để trống. |
| 4 | `birthYear` | Number Input | Không | Năm sinh (VD: 1990) để tính tuổi tư vấn liều dùng. |
| 5 | `allergies` | Textarea | Không | Tiền sử dị ứng thuốc (VD: Dị ứng Penicillin, Aspirin...). |
| 6 | Nút `Lưu & Chọn` | Primary Button | - | Phím `Enter`. Lưu vào DB và tự gán vào đơn POS. |

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
  "discountAmount": 0.00,
  "taxAmount": 0.00,
  "prescriptionCode": null,
  "note": "Khách mua theo tư vấn dược sĩ",
  "items": [
    {
      "productId": 501,
      "batchId": 12,
      "unitId": 102,
      "unitName": "Vỉ",
      "quantity": 2,
      "unitPrice": 30000.00,
      "discount": 0.00
    }
  ],
  "payment": {
    "paymentMethod": "CASH",
    "amountPaid": 60000.00,
    "tenderedCash": 100000.00
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
    "invoiceCode": "INV-20261108-0012",
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "cashierName": "Nguyễn Văn Dược",
    "customerId": 105,
    "customerName": "Trần Thị Lan",
    "customerPhone": "0987123456",
    "totalAmount": 60000.00,
    "discountAmount": 0.00,
    "taxAmount": 0.00,
    "netAmount": 60000.00,
    "changeAmount": 40000.00,
    "paymentMethod": "CASH",
    "paymentStatus": "PAID",
    "invoiceStatus": "COMPLETED",
    "createdAt": "2026-11-08T18:55:00",
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
      }
    ]
  }
}
```

---

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateSalesInvoiceRequest {
    @NotNull(message = "Thông tin khách hàng là bắt buộc đối với mọi hóa đơn bán lẻ")
    private Long customerId;

    private Long shiftId;
    private Long storeId;
    private String prescriptionCode;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private String note;

    @NotEmpty(message = "Hóa đơn phải có ít nhất một sản phẩm")
    @Valid
    private List<InvoiceItemRequest> items;

    @NotNull(message = "Thông tin thanh toán không được để trống")
    @Valid
    private ProcessPaymentRequest payment;
}
```

---

### 4.3. Thuật Toán Service Layer (`SalesInvoiceServiceImpl.createInvoice`)
```java
@Transactional(rollbackFor = Exception.class)
public SalesInvoiceResponse createInvoice(CreateSalesInvoiceRequest request, Long accountId, String clientIp) {
    // 1. Kiểm tra bắt buộc phải có khách hàng
    if (request.getCustomerId() == null) {
        throw new IllegalArgumentException("Hóa đơn bán lẻ bắt buộc phải có thông tin khách hàng định danh!");
    }

    Customer customer = customerRepository.findById(request.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin khách hàng với ID: " + request.getCustomerId()));

    // 2. Kiểm tra ca làm việc đang mở của nhân viên
    Shift currentShift = shiftRepository.findFirstByAccount_IdAndStatus(accountId, (short) 1)
            .orElseThrow(() -> new NoOpenShiftException("Bạn chưa mở ca làm việc hoặc ca đã bị đóng!"));

    // 3. Khởi tạo đối tượng SalesInvoice
    SalesInvoice invoice = new SalesInvoice();
    invoice.setCode(generateInvoiceCode());
    invoice.setStore(currentShift.getStore());
    invoice.setShift(currentShift);
    invoice.setAccount(accountRepository.findById(accountId).orElse(null));
    invoice.setCustomer(customer);
    invoice.setPrescriptionCode(request.getPrescriptionCode());
    invoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
    invoice.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
    invoice.setCreatedAt(LocalDateTime.now());

    // 4. Duyệt các sản phẩm, trừ tồn kho chi nhánh theo Base Quantity (Đơn vị nhỏ nhất)
    BigDecimal totalAmount = BigDecimal.ZERO;
    List<SalesInvoiceDetail> details = new ArrayList<>();

    for (InvoiceItemRequest itemReq : request.getItems()) {
        Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdAndBatchId(
                currentShift.getStore().getId(), itemReq.getProductId(), itemReq.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho cho sản phẩm " + product.getName()));

        ProductUnit unit = itemReq.getUnitId() != null 
                ? productUnitRepository.findById(itemReq.getUnitId()).orElse(null) 
                : null;
        
        String unitName = (unit != null) ? unit.getUnitName() : product.getUnit();
        int conversionFactor = (unit != null) ? unit.getConversionFactor() : 1;
        BigDecimal unitPrice = (unit != null) ? unit.getSellingPrice() : (itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getSellingPrice());

        int baseQuantityToDeduct = itemReq.getQuantity() * conversionFactor;

        if (inventory.getQuantity() < baseQuantityToDeduct) {
            throw new InsufficientStockException("Sản phẩm " + product.getName() + " không đủ tồn kho khả dụng! Hiện còn: " + inventory.getQuantity() + " " + product.getUnit());
        }

        inventory.setQuantity(inventory.getQuantity() - baseQuantityToDeduct);
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        SalesInvoiceDetail detail = new SalesInvoiceDetail();
        detail.setSalesInvoice(invoice);
        detail.setProduct(product);
        detail.setBatch(inventory.getBatch());
        detail.setQuantity(itemReq.getQuantity());
        detail.setUnitName(unitName);
        detail.setConversionFactor(conversionFactor);
        detail.setBaseQuantity(baseQuantityToDeduct);
        detail.setUnitPrice(unitPrice);
        
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
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

    // 5. Cập nhật điểm tích lũy và tổng chi tiêu cho khách hàng
    customer.setTotalSpent(customer.getTotalSpent().add(netAmount));
    int earnedPoints = netAmount.divide(BigDecimal.valueOf(100000), 0, RoundingMode.FLOOR).intValue();
    customer.setLoyaltyPoints(customer.getLoyaltyPoints() + earnedPoints);
    customerRepository.save(customer);

    // 6. Xử lý lưu thông tin thanh toán (Tiền mặt hoặc PayOS VietQR)
    paymentService.recordPayment(savedInvoice, request.getPayment());

    // 7. Ghi nhật ký hệ thống
    auditLogService.log("SALES", "CREATE_INVOICE", accountId, clientIp, 
        "Tạo hóa đơn #" + savedInvoice.getCode() + " cho khách hàng " + customer.getFullName() + " số tiền " + netAmount + " VNĐ");

    return mapToInvoiceResponse(savedInvoice, request.getPayment());
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Mô tả & Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-INV-01** | Bán hàng thành công khi có khách hàng | Chọn khách hàng ID 105, thuốc đủ tồn kho, thanh toán | Hóa đơn tạo thành công, trừ tồn kho đúng, cộng điểm tích lũy |
| **TC-INV-02** | Chặn bán hàng khi chưa chọn khách hàng | Có thuốc trong giỏ nhưng `customerId: null` | Nút thanh toán bị chặn, thông báo lỗi *"Vui lòng nhập số điện thoại khách hàng trước khi thanh toán"* |
| **TC-INV-03** | Đọc SĐT khách hàng đã tồn tại | Nhập `0987123456` | Tự động tải thông tin khách hàng, điểm tích lũy và cảnh báo dị ứng (nếu có) |
| **TC-INV-04** | Đọc SĐT khách hàng mới chưa tồn tại | Nhập SĐT `0912345678` chưa có trong DB | Tự động mở Modal thêm mới khách hàng với SĐT được điền sẵn |
| **TC-INV-05** | Lưu khách hàng mới từ Modal | Nhập tên "Nguyễn Văn Nam", bấm Lưu | Khách hàng được tạo trong DB và tự động chọn ngay vào đơn POS |
| **TC-INV-06** | Bán thuốc lẻ đa đơn vị có quy đổi | Bán 2 vỉ Decolgen (hệ số 4 viên/vỉ) | Hóa đơn lưu 2 Vỉ, tồn kho `inventories` trừ đúng 8 Viên cơ bản |
| **TC-INV-07** | Bán sản phẩm đơn chiếc (Fallback quy ước ngầm định) | `unitId: null`, Siro Prospan (hệ số = 1) | Tự động áp dụng đơn vị gốc "Chai", hệ số 1, trừ kho 1 chai |
