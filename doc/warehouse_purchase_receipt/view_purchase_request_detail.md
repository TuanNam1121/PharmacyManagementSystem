# Đặc Tả Kỹ Thuật: 3.12.4 View Purchase Request Detail (Chi Tiết Yêu Cầu Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC56` (SRS 3.12.4)
- **Tên Use Case**: View Purchase Request Detail (Xem chi tiết yêu cầu mua hàng)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua xem toàn bộ thông tin chi tiết của một Yêu cầu mua hàng (Purchase Request) được chọn từ danh sách (UC55): thông tin chung, lý do/giải trình và danh sách mặt hàng yêu cầu (sản phẩm, số lượng, ghi chú). Use case này **chỉ đọc (read-only)**.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Yêu cầu mua hàng cần xem tồn tại trong hệ thống.
- **Trigger**:
  - TRG-01: Người dùng bấm **Xem chi tiết** trên một dòng của danh sách Yêu cầu mua hàng.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Thông tin chi tiết Yêu cầu mua hàng (kèm danh sách mặt hàng) được hiển thị ở chế độ chỉ đọc.
  - POS-02: Không có dữ liệu nào bị sửa đổi.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ danh sách Yêu cầu mua hàng (UC55), Nhân viên thu mua bấm icon **Xem** trên một dòng.
2. Hệ thống gọi `GET /api/v1/purchase-requests/{id}`.
3. Backend (`PurchaseRequestServiceImpl.getPurchaseRequestDetail`) xử lý:
   - Kiểm tra `id` hợp lệ (nếu null → `IllegalArgumentException`).
   - Tìm Yêu cầu mua hàng theo `id`; nếu không tồn tại → `EntityNotFoundException` (HTTP 404).
   - Ánh xạ sang `PurchaseRequestResponse` (thông tin chung).
   - Nạp danh sách mặt hàng qua `purchaseRequestDetailRepository.findByPurchaseRequestIdWithProduct(id)` và gán vào `items`, đồng thời set `itemCount`.
4. Hệ thống hiển thị Modal chi tiết (`WarehousePurchaseRequestDetailModal.jsx`) ở chế độ chỉ đọc gồm: thẻ tóm tắt (Mã Yêu Cầu, Trạng Thái, Ngày Gửi, Người Tạo), Lý Do/Giải Trình (nếu có) và bảng mặt hàng.
5. Nhân viên thu mua xem thông tin và bấm **Đóng** để trở về danh sách.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Lỗi validate/thiếu dữ liệu**: hiển thị cảnh báo, giữ nguyên trạng thái hiện tại.
- **AT02 - Người dùng hủy/đóng**: đóng modal, không thay đổi dữ liệu.
- **A1 - Không tìm thấy Yêu cầu mua hàng**: `id` không tồn tại → HTTP 404 *"Purchase request not found with ID: {id}"*; modal hiển thị *"Không có dữ liệu chi tiết"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Session hợp lệ)**: Mọi thao tác phải nằm trong phiên đăng nhập được cấp quyền.
- **BR-02 (Nhật ký kiểm toán)**: Mọi thao tác/thực thi phải sinh bản ghi `audit_logs` bất biến kèm người dùng/thời gian.
- **BR-03 (Toàn vẹn & phân quyền)**: Kiểm tra toàn vẹn dữ liệu và phân quyền trước khi xử lý.
- **BR-04 (Chỉ đọc)**: Chi tiết Yêu cầu mua hàng không cho phép chỉnh sửa trong use case này.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Chi Tiết (`WarehousePurchaseRequestDetailModal.jsx`)
Tiêu đề: *"Yêu Cầu Mua Hàng — {code}"* — phụ đề: *"Phiếu đề xuất mua bổ sung tồn kho gửi phòng Thu mua"*.

| STT | Thành phần | Loại điều khiển | Chi tiết |
| :--: | :--- | :--- | :--- |
| 1 | Thẻ tóm tắt (4 ô) | Label group | Mã Yêu Cầu (`code`), Trạng Thái (badge), Ngày Gửi (`createdAt`), Người Tạo (`createdByUsername` / *"Nhân viên Kho"*) |
| 2 | Lý Do / Giải Trình | Callout | Chỉ hiển thị khi có `reason` |
| 3 | Bảng mặt hàng | Grid | # · Tên Thuốc / Sản Phẩm · Mã Thuốc · ĐVT · SL Yêu Cầu · Ghi Chú |
| 4 | Nút Đóng | Button (Secondary) | Đóng modal, quay về danh sách |

### 3.2. Bảng Mặt Hàng Trong Chi Tiết
| STT | Cột hiển thị | Trường dữ liệu | Ghi chú |
| :--: | :--- | :--- | :--- |
| 1 | # | `i + 1` | — |
| 2 | Tên Thuốc / Sản Phẩm | `productName` | Đậm |
| 3 | Mã Thuốc | `productCode` | Badge mono (hoặc `—`) |
| 4 | ĐVT | `unit` | Hoặc `—` |
| 5 | SL Yêu Cầu | `requestedQuantity` | Căn phải, đậm |
| 6 | Ghi Chú | `note` | Hoặc `—` |

> **Trạng thái rỗng/tải**: spin + *"Đang tải chi tiết yêu cầu mua hàng…"*; nếu không có mặt hàng → *"Không có mặt hàng nào trong yêu cầu này."*; nếu không có dữ liệu → *"Không có dữ liệu chi tiết"*.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `GET /api/v1/purchase-requests/{id}`
- **Handler**: `PurchaseRequestController.viewPurchaseRequestDetail(@PathVariable Long id)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `200 OK`

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Purchase request details retrieved successfully",
  "data": {
    "id": 12,
    "code": "PR-20261101-0007",
    "createdByUsername": "warehouse01",
    "status": 1,
    "statusText": "Đã gửi duyệt",
    "reason": "Bổ sung tồn kho Paracetamol theo định mức tháng",
    "createdAt": "2026-11-01T08:00:00",
    "approvedAt": null,
    "itemCount": 2,
    "items": [
      { "id": 501, "productId": 101, "productCode": "SP0001",
        "productName": "Paracetamol 500mg", "unit": "Hộp",
        "requestedQuantity": 200, "note": "Ưu tiên giao trước ngày 10" },
      { "id": 502, "productId": 118, "productCode": "SP0018",
        "productName": "Amoxicillin 500mg", "unit": "Hộp",
        "requestedQuantity": 120, "note": null }
    ]
  }
}
```

#### Response khi không tìm thấy (HTTP 404 Not Found):
```json
{ "status": 404, "message": "Purchase request not found with ID: 999", "data": null }
```

### 4.2. DTO Java (`PurchaseRequestResponse` — nhánh chi tiết)
> Ở chi tiết, `items` được nạp đầy đủ (khác với danh sách chỉ có `itemCount`).

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PurchaseRequestResponse {
    private Long id;
    private String code;
    private String createdByUsername;
    private Short status;
    private String statusText;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<PurchaseRequestItemDto> items;
    private Integer itemCount;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PurchaseRequestItemDto {
        private Long id;
        private Long productId;
        private String productCode;   // product.getBarcode()
        private String productName;
        private String unit;
        private Integer requestedQuantity;
        private String note;

        public static PurchaseRequestItemDto toItemDto(PurchaseRequestDetail detail) {
            if (detail == null) return null;
            Product product = detail.getProduct();
            return PurchaseRequestItemDto.builder()
                    .id(detail.getId())
                    .productId(product != null ? product.getId() : null)
                    .productCode(product != null && product.getBarcode() != null ? product.getBarcode() : "")
                    .productName(product != null && product.getName() != null ? product.getName() : "")
                    .unit(product != null && product.getUnit() != null ? product.getUnit() : "")
                    .requestedQuantity(detail.getRequestedQuantity())
                    .note(detail.getNote())
                    .build();
        }
    }
}
```

### 4.3. Thuật Toán Service Layer (`PurchaseRequestServiceImpl.getPurchaseRequestDetail`)
```java
@Override
public PurchaseRequestResponse getPurchaseRequestDetail(Long id) {
    if (id == null) {
        throw new IllegalArgumentException("Invalid request to view purchase request details");
    }

    PurchaseRequest pr = purchaseRequestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase request not found with ID: " + id));

    PurchaseRequestResponse resp = PurchaseRequestResponse.fromEntity(pr);

    List<PurchaseRequestItemDto> items = PurchaseRequestItemDto.toItemDtoList(
            purchaseRequestDetailRepository.findByPurchaseRequestIdWithProduct(id));

    resp.setItems(items);
    resp.setItemCount(items.size());
    return resp;
}
```

> `findByPurchaseRequestIdWithProduct(id)` nạp chi tiết PR kèm `product` (JOIN FETCH) để tránh N+1 khi hiển thị bảng mặt hàng.

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện thực hiện | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-VPRD-01** | Xem chi tiết hợp lệ | `GET /api/v1/purchase-requests/12` | HTTP 200, đầy đủ thông tin chung + danh sách mặt hàng |
| **TC-VPRD-02** | Không tìm thấy PR | `id = 999` | HTTP 404 "Purchase request not found with ID: 999" |
| **TC-VPRD-03** | ID rỗng/không hợp lệ | `id = null` | `IllegalArgumentException` (HTTP 400) |
| **TC-VPRD-04** | PR không có mặt hàng | PR rỗng chi tiết | Bảng hiển thị *"Không có mặt hàng nào trong yêu cầu này."* |
| **TC-VPRD-05** | Đếm số mặt hàng | PR có 2 dòng chi tiết | `itemCount = 2` và bảng hiển thị 2 dòng |
| **TC-VPRD-06** | Hiển thị lý do/giải trình | PR có `reason` | Khối "Lý Do / Giải Trình" hiển thị đúng nội dung |
| **TC-VPRD-07** | Ẩn lý do khi trống | PR không có `reason` | Không hiển thị khối lý do |
| **TC-VPRD-08** | Chế độ chỉ đọc | Mở modal chi tiết | Không có nút sửa/xóa dữ liệu PR |
| **TC-VPRD-09** | Thông tin người tạo mặc định | PR `createdBy` = null | Hiển thị *"Nhân viên Kho"* |
| **TC-VPRD-10** | Đóng modal | Bấm "Đóng" | Trở về danh sách, không thay đổi dữ liệu |

