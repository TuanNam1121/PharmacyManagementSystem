# Đặc Tả Kỹ Thuật: 3.7.4 View Customer Purchase History (Tra Cứu Lịch Sử Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC24` (SRS 3.7.4)
- **Tên Use Case**: View Customer Purchase History (Xem lịch sử mua hàng của khách hàng)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Store Manager` (Quản lý cửa hàng), `Cashier` (Thu ngân)
- **Mô tả nghiệp vụ**: Cho phép Dược sĩ tra cứu nhanh toàn bộ lịch sử các lần mua thuốc, đơn thuốc cũ, ngày mua, số lượng, liều dùng và chi nhánh đã mua của một khách hàng dựa trên Số điện thoại hoặc Mã khách hàng. Giúp Dược sĩ nắm bắt được phác đồ điều trị trước đây, kiểm tra nguy cơ tương tác thuốc bất lợi khi kê đơn mới và phục vụ khách hàng chu đáo.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập vào hệ thống.
  - Khách hàng đã từng phát sinh ít nhất 01 giao dịch hoặc đã có hồ sơ trong hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Hiển thị danh sách hóa đơn theo thứ tự thời gian từ mới nhất đến cũ nhất.
  - Cho phép xem chi tiết từng mặt hàng và hướng dẫn sử dụng trong từng đơn.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ màn hình quầy bán lẻ POS hoặc màn hình Quản lý khách hàng, Dược sĩ bấm vào nút **"Xem lịch sử mua hàng" (Purchase History - Phím tắt F7)**.
2. Dược sĩ nhập **Số điện thoại** hoặc **Tên khách hàng** vào thanh tra cứu.
3. Hệ thống gợi ý danh sách khách hàng khớp thông tin. Dược sĩ chọn khách hàng cần xem.
4. Frontend gọi API `GET /api/v1/customers/{id}/purchase-history`.
5. Backend tiếp nhận:
   - Truy vấn thông tin khách hàng từ bảng `dbo.customers`.
   - Truy vấn danh sách các hóa đơn từ bảng `dbo.sales_invoices` có `customer_id` tương ứng, sắp xếp theo `created_at DESC`.
   - Nạp thông tin chi tiết các mặt hàng thuốc trong từng hóa đơn từ `dbo.sales_invoice_details` và `dbo.products`.
   - Trả về đối tượng `CustomerPurchaseHistoryResponse`.
6. Frontend hiển thị giao diện trượt dạng Drawer hoặc Modal chia làm 2 phần:
   - **Phần thông tin tổng quan khách hàng**: Họ tên, SĐT, Hạng thành viên, Tổng chi tiêu trọn đời, Điểm tích lũy hiện có, Cảnh báo dị ứng / bệnh lý mãn tính.
   - **Bảng danh sách hóa đơn đã mua**: Mã hóa đơn, Ngày giờ mua, Chi nhánh nhà thuốc, Dược sĩ bán, Tổng tiền, Trạng thái thanh toán (`PAID`, `RETURNED`).
7. Khi Dược sĩ bấm vào một dòng hóa đơn cụ thể, hệ thống mở rộng chi tiết các loại thuốc trong đơn đó (Tên thuốc, số lượng, đơn vị, hàm lượng, số lô, hạn dùng).
8. Dược sĩ có thể bấm nút **"Sao chép đơn cũ vào giỏ hàng" (Re-order)** để tự động thêm các loại thuốc khách quen hay uống định kỳ vào giỏ hàng POS hiện tại mà không phải quét lại từng hộp thuốc.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Khách hàng chưa từng mua hàng**: Hệ thống hiển thị trạng thái trống (Empty State): *"Khách hàng chưa có lịch sử giao dịch nào tại hệ thống"*.
- **A2 - Khách hàng vãng lai không lưu thông tin**: Các đơn hàng bán cho khách vãng lai (không đăng ký SĐT) sẽ không thể tra cứu theo lịch sử khách hàng cá nhân.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Sắp xếp thời gian)**: Lịch sử mua hàng luôn luôn được sắp xếp theo thời gian giảm dần (`created_at DESC`), ưu tiên hiển thị đơn thuốc mua gần nhất lên đầu trang.
- **BR-02 (Bảo mật thông tin bệnh án)**: Chỉ có Dược sĩ và Quản lý cửa hàng đang phục vụ khách hàng mới được quyền xem lịch sử mua thuốc; không chia sẻ thông tin đơn thuốc của khách hàng ra ngoài phạm vi vận hành y tế của nhà thuốc.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Drawer Lịch Sử Mua Hàng
| STT | Tên trường hiển thị | Kiểu hiển thị | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `customerSummary` | Card Profile | Tên khách, SĐT, Điểm thưởng, Hạng thẻ |
| 2 | `medicalWarning` | Banner (Cảnh báo đỏ) | Tiền sử dị ứng thuốc và bệnh nền (nếu có) |
| 3 | `invoiceCode` | Text / Link | Mã hóa đơn (Click để xem chi tiết / in lại) |
| 4 | `purchaseDate` | Date Time | Định dạng: `dd/MM/yyyy HH:mm` |
| 5 | `storeName` | Text | Chi nhánh nơi khách hàng mua thuốc |
| 6 | `cashierName` | Text | Dược sĩ trực tiếp tư vấn và xuất hóa đơn |
| 7 | `netAmount` | Currency | Số tiền khách đã thanh toán cho đơn hàng đó |
| 8 | `status` | Badge Tag | Xanh lá: `Hoàn tất`, Đỏ: `Đã hủy / Đã trả hàng` |
| 9 | Nút `Re-order` | Button (Small) | Nạp toàn bộ thuốc trong đơn cũ vào giỏ POS hiện tại |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `GET /api/v1/customers/{id}/purchase-history`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Query Params**:
  * `page` (default: 0)
  * `size` (default: 10)
  * `startDate` (optional: `YYYY-MM-DD`)
  * `endDate` (optional: `YYYY-MM-DD`)

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Lấy lịch sử mua hàng thành công",
  "data": {
    "customerId": 105,
    "customerName": "Trần Thị Lan",
    "phone": "0987123456",
    "membershipTier": "GOLD",
    "loyaltyPoints": 45,
    "totalSpent": 4850000.00,
    "allergies": "Dị ứng Penicillin, Paracetamol gây đau dạ dày nhẹ",
    "invoices": [
      {
        "invoiceId": 1205,
        "invoiceCode": "INV-20261104-0012",
        "purchaseDate": "2026-11-04T09:15:30",
        "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
        "cashierName": "Nguyễn Văn Dược",
        "netAmount": 305000.00,
        "paymentMethod": "CASH",
        "status": "COMPLETED",
        "items": [
          {
            "productName": "Panadol Extra Đỏ",
            "quantity": 2,
            "unit": "Hộp",
            "unitPrice": 120000.00,
            "batchNumber": "BATCH-202512-01"
          },
          {
            "productName": "Berberin 100mg",
            "quantity": 1,
            "unit": "Lọ",
            "unitPrice": 85000.00,
            "batchNumber": "BATCH-202605-03"
          }
        ]
      }
    ]
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomerPurchaseHistoryResponse {
    private Long customerId;
    private String customerName;
    private String phone;
    private String membershipTier;
    private Integer loyaltyPoints;
    private BigDecimal totalSpent;
    private String allergies;
    private List<CustomerInvoiceSummaryDto> invoices;
}

@Data
public class CustomerInvoiceSummaryDto {
    private Long invoiceId;
    private String invoiceCode;
    private LocalDateTime purchaseDate;
    private String storeName;
    private String cashierName;
    private BigDecimal netAmount;
    private String paymentMethod;
    private String status;
    private List<CustomerInvoiceItemDto> items;
}

@Data
public class CustomerInvoiceItemDto {
    private String productName;
    private Integer quantity;
    private String unit;
    private BigDecimal unitPrice;
    private String batchNumber;
}
```

### 4.3. Thuật Toán Service Layer
```java
@Transactional(readOnly = true)
public CustomerPurchaseHistoryResponse getPurchaseHistory(Long customerId, Pageable pageable) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

    CustomerHealthProfile healthProfile = healthProfileRepository.findByCustomerId(customerId).orElse(null);

    Page<SalesInvoice> invoicePage = salesInvoiceRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);

    List<CustomerInvoiceSummaryDto> invoiceDtos = invoicePage.getContent().stream().map(invoice -> {
        CustomerInvoiceSummaryDto dto = new CustomerInvoiceSummaryDto();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setInvoiceCode(invoice.getInvoiceCode());
        dto.setPurchaseDate(invoice.getCreatedAt());
        dto.setStoreName(storeRepository.findNameById(invoice.getStoreId()));
        dto.setCashierName(accountInfoRepository.findFullNameByAccountId(invoice.getCashierId()));
        dto.setNetAmount(invoice.getNetAmount());
        dto.setStatus(invoice.getInvoiceStatus());

        List<CustomerInvoiceItemDto> itemDtos = invoice.getDetails().stream().map(detail -> {
            CustomerInvoiceItemDto item = new CustomerInvoiceItemDto();
            item.setProductName(productRepository.findNameById(detail.getProductId()));
            item.setQuantity(detail.getQuantity());
            item.setUnitPrice(detail.getUnitPrice());
            item.setBatchNumber(productBatchRepository.findBatchNumberById(detail.getBatchId()));
            return item;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }).collect(Collectors.toList());

    CustomerPurchaseHistoryResponse response = new CustomerPurchaseHistoryResponse();
    response.setCustomerId(customer.getCustomerId());
    response.setCustomerName(customer.getFullName());
    response.setPhone(customer.getPhone());
    response.setMembershipTier(customer.getMembershipTier());
    response.setLoyaltyPoints(customer.getLoyaltyPoints());
    response.setTotalSpent(customer.getTotalSpent());
    response.setAllergies(healthProfile != null ? healthProfile.getAllergies() : "Không có ghi nhận dị ứng");
    response.setInvoices(invoiceDtos);

    return response;
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-HIS-01** | Khách hàng có nhiều hóa đơn cũ | Khách hàng ID 105 đã mua 5 lần | Trả về danh sách 5 đơn hàng sắp xếp ngày giảm dần, hiển thị đủ thuốc |
| **TC-HIS-02** | Khách hàng mới chưa có đơn | Khách hàng mới đăng ký hôm nay | Trả về thông tin khách hàng, danh sách `invoices` rỗng (`[]`) |
| **TC-HIS-03** | Khách hàng có cảnh báo dị ứng | Khách hàng dị ứng Penicillin | Hiển thị nổi bật cảnh báo dị ứng thuốc trên đầu giao diện |
| **TC-HIS-04** | Tìm kiếm theo số điện thoại | Nhập SĐT "0987123456" | Tìm đúng khách hàng và tải ngay lịch sử đơn hàng |

