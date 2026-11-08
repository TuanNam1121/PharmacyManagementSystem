# Đặc Tả Kỹ Thuật: 3.14.3 Manage Supplier Quotation (Quản Lý Báo Giá Nhà Cung Cấp)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC63` (SRS 3.14.3)
- **Tên Use Case**: Manage Supplier Quotation (Quản lý báo giá nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua xem danh sách báo giá nhận được từ nhà cung cấp, xem chi tiết từng dòng mặt hàng (sản phẩm, số lượng, đơn giá, thuế, thành tiền) và cập nhật các bản ghi nếu phát hiện sai sót — **với điều kiện báo giá chưa được đưa vào một Đề xuất mua hàng đã được chốt/duyệt**.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Tồn tại RFQ đã được nhà cung cấp phản hồi (`RESPONDED`) tương ứng với một báo giá.
- **Trigger**:
  - TRG-01: Người dùng chọn mục **"RFQ & Báo giá"** trên menu điều hướng.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Danh sách chi tiết báo giá được hiển thị; các thay đổi (nếu có) được lưu.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua vào trang quản lý báo giá (`/procurement/rfq`).
2. Hệ thống tải danh sách RFQ (`GET /api/v1/rfq`) và hiển thị tổng số bản ghi, bộ lọc theo mã RFQ/tên NCC và trạng thái.
3. Nhân viên thu mua chọn một RFQ đã `RESPONDED` → bấm **Xem chi tiết** → `GET /api/v1/rfq/{id}/quotation`.
4. Hệ thống hiển thị `RfqQuotationResponse`: thông tin RFQ, nhà cung cấp, đề xuất nguồn, khối báo giá (`SupplierQuotationResponse`) và danh sách mặt hàng (`QuotationItemResponse`) với đơn giá và thành tiền.
5. Nhân viên thu mua rà soát dữ liệu; nếu phát hiện sai sót và báo giá chưa thuộc đề xuất đã chốt, thực hiện điều chỉnh (cập nhật dữ liệu báo giá).
6. Hệ thống lưu thay đổi và (theo SRS) ghi nhật ký kiểm toán kèm người dùng/thời gian.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Lỗi validate/thiếu trường**: hiển thị cảnh báo, giữ nguyên dữ liệu nhập.
- **AT02 - Người dùng hủy**: bỏ thay đổi chưa lưu, quay lại danh sách.
- **A1 - RFQ không tồn tại**: `GET /{id}/quotation` → HTTP 404 *"RFQ not found with ID: {id}"*.
- **A2 - RFQ chưa được phản hồi**: `quotation = null`; `RfqQuotationResponse` trả danh sách mặt hàng theo đề xuất (dùng `costPrice`) và không có khối báo giá.
- **A3 - Báo giá đã vào đề xuất chốt/duyệt**: không cho chỉnh sửa (báo giá bị khóa).

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Session hợp lệ)**: Mọi thao tác phải nằm trong phiên đăng nhập hợp lệ.
- **BR-02 (Nhật ký kiểm toán)**: Mọi thay đổi/thi hành sinh bản ghi `audit_logs` bất biến.
- **BR-03 (Khóa sau khi vào đề xuất)**: Một khi báo giá được đưa vào đề xuất đã nộp/duyệt thì **không thể chỉnh sửa**.
- **BR-04 (Thành tiền chi tiết)**: `subtotal` của dòng báo giá = `quantity × unit_price × (1 + tax_rate/100)` (cột computed).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Màn Hình Quản Lý Báo Giá (RFQ List) — `RfqPage.jsx`
| STT | Thành phần | Loại điều khiển | Bắt buộc | Mô tả |
| :--: | :--- | :--- | :--: | :--- |
| 1 | Send RFQ | Button (Primary) | — | Góc phải trên; mở Modal Gửi RFQ (UC61) |
| 2 | Search | Text | Không (≤ 100) | Lọc theo mã RFQ hoặc tên nhà cung cấp |
| 3 | Status Filter | Dropdown | Không | Lọc theo trạng thái RFQ (mặc định "Tất cả") |
| 4 | Total Counter | Label | — | Tổng số bản ghi RFQ |
| 5 | RFQ Table | Grid | — | Bảng danh sách RFQ (mã, NCC, đề xuất, trạng thái, ngày gửi, hạn chót) |
| 6 | Pagination & Range Info | Control | — | Footer phân trang + thông tin khoảng bản ghi |

### 3.2. Chi Tiết Báo Giá (`RfqDetailModal.jsx`)
| STT | Thành phần | Mô tả |
| :--: | :--- | :--- |
| 1 | Thông tin RFQ | Mã RFQ, trạng thái, hạn chót |
| 2 | Thông tin Nhà cung cấp | Tên, mã, người liên hệ |
| 3 | Khối Báo giá | Mã báo giá, ngày báo giá, hiệu lực đến, tổng tiền, trạng thái |
| 4 | Bảng mặt hàng | Tên thuốc, Mã thuốc, ĐVT, SL yêu cầu, Đơn giá, Thành tiền |
| 5 | Nút "So sánh với các báo giá khác" | Hiện khi RFQ `RESPONDED` (dẫn sang UC64) |
| 6 | Nút Đóng | Đóng modal |

> **Empty state**: khi chưa có báo giá, `RfqQuotationResponse.quotation = null` và danh sách mặt hàng lấy từ đề xuất (đơn giá tạm dùng giá vốn), kèm ghi chú RFQ chưa được phản hồi.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint danh sách**: `GET /api/v1/rfq` (search, status, supplierId, purchaseProposalId, phân trang)
- **Endpoint chi tiết báo giá**: `GET /api/v1/rfq/{id}/quotation`
- **Handler**: `RfqController.getRfqQuotationDetails(@PathVariable Long id)`
- **Mức độ truy cập**: `Purchasing Staff`

#### Response Payload — Chi tiết báo giá (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "RFQ quotation details retrieved successfully",
  "data": {
    "rfqId": 88,
    "rfqCode": "RFQ1762300000000",
    "status": "RESPONDED",
    "supplier": { "id": 21, "code": "SUP-DHG", "name": "Công ty Cổ phần Dược Hậu Giang" },
    "purchaseProposal": { "id": 15, "code": "PP-20261104-01" },
    "quotation": {
      "id": 55, "code": "QT1762400000000",
      "quotationDate": "2026-11-09T10:30:00",
      "validUntil": "2026-12-09T00:00:00",
      "totalAmount": 12500000.00,
      "status": 0
    },
    "items": [
      { "productId": 101, "productName": "Paracetamol 500mg", "productCode": "SP0001",
        "unit": "Hộp", "requestedQuantity": 100, "unitPrice": 25000, "subtotal": 2500000, "supplierNote": null }
    ]
  }
}
```

#### Response khi chưa có báo giá:
```json
{
  "status": 200,
  "message": "RFQ quotation details retrieved successfully",
  "data": { "rfqId": 88, "rfqCode": "RFQ1762300000000", "status": "SENT",
            "quotation": null,
            "items": [ { "productName": "Paracetamol 500mg", "requestedQuantity": 100, "unitPrice": 18000 } ] }
}
```

### 4.2. Khai Báo DTO Java (`RfqQuotationResponse`)
```java
@Builder
public record RfqQuotationResponse(
    Long rfqId,
    String rfqCode,
    RfqStatus status,
    SupplierResponse supplier,
    PurchaseProposalResponse purchaseProposal,
    SupplierQuotationResponse quotation,   // nullable nếu chưa phản hồi
    List<QuotationItemResponse> items) {

    @Builder
    public record SupplierQuotationResponse(
        Long id, String code, LocalDateTime quotationDate, LocalDateTime validUntil,
        BigDecimal totalAmount, Short status) { }  // 0=pending, 1=approved, 2=rejected

    @Builder
    public record QuotationItemResponse(
        Long productId, String productName, String productCode, String unit,
        Integer requestedQuantity, BigDecimal unitPrice, BigDecimal subtotal, String supplierNote) { }

    public static RfqQuotationResponse from(Rfq rfq, SupplierQuotation quotation) { /* ... */ }
}
```

### 4.3. Entity Chi Tiết Báo Giá (`SupplierQuotationDetail`)
```java
@Entity
@Table(name = "supplier_quotation_details")
public class SupplierQuotationDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_quotation_id", nullable = false)
    private SupplierQuotation supplierQuotation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;
    private BigDecimal unitPrice;

    @ColumnDefault("0")
    private BigDecimal taxRate;

    // Cột computed: qty * price * (1 + tax/100)
    @Formula("CAST(quantity * unit_price * (1 + tax_rate / 100.0) AS DECIMAL(18,2))")
    private BigDecimal subtotal;
}
```

### 4.4. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.14.3 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Cho phép **cập nhật** báo giá khi chưa vào đề xuất chốt | Chưa có endpoint cập nhật báo giá; hiện chỉ xem | Bổ sung `PATCH` cập nhật dòng báo giá kèm kiểm tra trạng thái đề xuất |
| 2 | Ghi nhật ký kiểm toán | Chưa ghi `audit_logs` | Bổ sung ghi audit khi thay đổi |
| 3 | `tax_rate` dùng cho thành tiền | Báo giá công khai nhập `taxRate = 0` | Bổ sung thuế nếu nghiệp vụ yêu cầu |
| 4 | Trạng thái báo giá (0/1/2) | `SupplierQuotation.status` là `Short`, mặc định `0` | Ghi nhận hằng số trạng thái (pending/approved/rejected) |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-MSQ-01** | Xem danh sách RFQ/báo giá | `page=0`, `size=10` | Danh sách + tổng số bản ghi đúng |
| **TC-MSQ-02** | Lọc theo trạng thái RFQ | `status=RESPONDED` | Chỉ trả RFQ đã phản hồi |
| **TC-MSQ-03** | Tìm theo mã RFQ/NCC | `search="DHG"` | Trả bản ghi khớp |
| **TC-MSQ-04** | Xem chi tiết báo giá đã phản hồi | `GET /{id}/quotation` | Có khối `quotation` + items đầy đủ đơn giá/thành tiền |
| **TC-MSQ-05** | Xem RFQ chưa phản hồi | RFQ `SENT` | `quotation = null`, items lấy từ đề xuất |
| **TC-MSQ-06** | RFQ không tồn tại | `id=999` | HTTP 404 "RFQ not found with ID: 999" |
| **TC-MSQ-07** | Tính thành tiền dòng | `qty=10`, `unitPrice=25000`, `tax=0` | `subtotal = 250000` |
| **TC-MSQ-08** | Báo giá đã vào đề xuất chốt | Đề xuất đã chọn NCC | Không cho chỉnh sửa báo giá |

