# Đặc Tả Kỹ Thuật: 3.15.1 Create Purchase Proposal (Tạo Đề Xuất Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC65` (SRS 3.15.1)
- **Tên Use Case**: Create Purchase Proposal (Tạo đề xuất mua hàng)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua tạo một Đề xuất mua hàng (Purchase Proposal) chính thức bằng cách **tổng hợp một hoặc nhiều Yêu cầu mua hàng (Purchase Request)** từ bộ phận kho và/hoặc **các mặt hàng mua chủ động** (nhân dịp khuyến mãi, giá tốt, dự phòng tồn kho). Đề xuất tổng hợp danh mục thuốc kèm số lượng làm cơ sở phát hành RFQ chào giá tới nhà cung cấp.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Tồn tại ít nhất một Yêu cầu mua hàng ở trạng thái `SUBMITTED` **hoặc** người dùng có nhu cầu mua chủ động.
  - PRE-03: Yêu cầu mua hàng được chọn chưa từng được gộp vào đề xuất nào khác.
- **Trigger**:
  - TRG-01: Người dùng bấm nút **"Tạo Đề Xuất Mua Hàng"** trên trang Danh sách đề xuất hoặc từ màn hình so sánh báo giá.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Một Đề xuất mua hàng mới được tạo, gắn với các Yêu cầu mua hàng nguồn và/hoặc các mặt hàng chủ động.
  - POS-02: Hành động được ghi vào nhật ký kiểm toán (`audit_logs`).
  - POS-03: Trạng thái nguồn của các Yêu cầu mua hàng liên quan được cập nhật.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua bấm **"Tạo Đề Xuất Mua Hàng"** → mở Modal `PurchaseProposalCreateModal.jsx`.
2. Hệ thống nạp dữ liệu nền:
   - Danh sách Yêu cầu mua hàng đủ điều kiện: `GET /api/v1/purchase-proposals/eligible-requests` (chỉ PR trạng thái `SUBMITTED` và chưa được gộp).
   - Danh mục sản phẩm/thuốc để mua chủ động.
3. Nhân viên thu mua thao tác trên 2 tab:
   - **Tab "Yêu cầu kho"**: tích chọn một hoặc nhiều Yêu cầu mua hàng cần gộp.
   - **Tab "Mua chủ động"**: thêm từng dòng mặt hàng gồm Sản phẩm, Số lượng, Ghi chú.
4. Frontend kiểm tra: phải có ít nhất 1 Yêu cầu kho **hoặc** 1 mặt hàng chủ động hợp lệ (có sản phẩm và số lượng > 0).
5. Frontend gửi `POST /api/v1/purchase-proposals` kèm payload `CreatePurchaseProposalRequest`.
6. Backend (`PurchaseProposalServiceImpl.createPurchaseProposal`) xử lý:
   - Lọc/dedup danh sách `purchaseRequestIds` và `items` hợp lệ; nếu cả hai rỗng → HTTP 400.
   - Kiểm tra từng Yêu cầu mua hàng: tồn tại, trạng thái `SUBMITTED`, chưa được gộp vào đề xuất khác.
   - **Gộp (consolidate) các mặt hàng**: cộng dồn số lượng theo cùng sản phẩm (dùng `LinkedHashMap`) thành danh sách `PurchaseProposalDetail`.
   - Bổ sung các mặt hàng mua chủ động (tra `Product` theo `productId`).
   - Sinh mã đề xuất tự động dạng `PP-YYYYMMDD-####` (`generateProposalCode`).
   - Tính **tạm tính** `totalAmount = Σ (costPrice × quantity)` theo **giá vốn danh mục** sản phẩm. Giá trị này **sẽ được tính lại theo báo giá thực tế** khi chốt nhà cung cấp (xem `selectSupplier`).
   - Lưu `PurchaseProposal` với `status = DRAFT`, `createdBy = người dùng hiện tại`.
   - Cập nhật trạng thái các Yêu cầu mua hàng liên quan sang `PROPOSAL_CREATED`.
   - Ghi nhật ký kiểm toán.
7. Backend trả về HTTP `201 Created` kèm `PurchaseProposalResponse` (chứa `code`).
8. Frontend đóng modal, hiển thị *"Đề xuất mua hàng {code} đã được tạo thành công!"* và nạp lại danh sách.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT1 - Hủy tạo**: Người dùng bấm **"Hủy bỏ"** → bỏ dữ liệu đã nhập, không tạo đề xuất.
- **A1 - Không chọn gì**: Không có PR và không có item hợp lệ → HTTP 400 *"Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho hoặc thêm ít nhất một mặt hàng mua chủ động."*
- **A2 - Yêu cầu mua hàng không hợp lệ**: PR không ở trạng thái `SUBMITTED` → HTTP 400.
- **A3 - Yêu cầu đã được gộp**: PR đã thuộc đề xuất khác → HTTP 400.
- **A4 - Không tìm thấy Yêu cầu mua hàng**: `purchaseRequestIds` chứa ID không tồn tại → HTTP 404 *"Không tìm thấy yêu cầu mua hàng ID: {id}"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bắt buộc đầu vào)**: Đề xuất phải dựa trên ít nhất một Yêu cầu mua hàng hoặc một mặt hàng mua chủ động.
- **BR-02 (Toàn vẹn nguồn)**: Chỉ được gộp các Yêu cầu mua hàng ở trạng thái `SUBMITTED` và chưa từng được gộp.
- **BR-03 (Mã đề xuất duy nhất)**: Mã sinh tự động theo mẫu `PP-YYYYMMDD-####`, tăng dần trong ngày.
- **BR-04 (Khóa báo giá)**: Một khi đề xuất đã được nộp/duyệt, báo giá liên kết không thể chỉnh sửa.
- **BR-05 (Nhật ký kiểm toán)**: Mọi thao tác tạo đề xuất phải sinh bản ghi `audit_logs` kèm người dùng/thời gian.
- **BR-06 (Đồng bộ tổng tiền theo báo giá)**: Khi chốt nhà cung cấp (`selectSupplier`), `total_amount` phải được **tính lại** bằng `Σ supplier_quotation_details.subtotal` để tổng của đơn đặt hàng (`/procurement/orders`) khớp với các dòng hàng báo giá. `total_amount` lúc tạo đề xuất chỉ là **tạm tính** theo giá vốn danh mục. Ngoài ra, API đơn đặt hàng **không đọc** `total_amount` để hiển thị mà luôn **suy tổng tại thời điểm đọc** (báo giá nếu có, ngược lại tạm tính theo giá vốn) — xem `PurchaseOrderServiceImpl.applyDerivedTotals`, đảm bảo danh sách và chi tiết luôn cùng một con số.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Tạo Đề Xuất (`PurchaseProposalCreateModal.jsx`)
Tiêu đề: *"Tạo Đề Xuất Mua Hàng"* — phụ đề: *"Tổng hợp từ phiếu yêu cầu của kho hoặc chủ động đặt hàng thuốc (khuyến mãi, giá tốt, dự phòng)"*.

| STT | Thành phần | Loại điều khiển | Bắt buộc | Mô tả |
| :--: | :--- | :--- | :--: | :--- |
| 1 | Tab "Yêu cầu kho" | Tab | — | Danh sách PR đủ điều kiện (mã, ngày, trạng thái) để tích chọn |
| 2 | Tab "Mua chủ động" | Tab | — | Bảng thêm dòng mặt hàng mua chủ động |
| 3 | Sản phẩm (mua chủ động) | Dropdown chọn sản phẩm | Có (mỗi dòng) | Chọn thuốc/sản phẩm |
| 4 | Số lượng | Number (min 1) | Có (mỗi dòng) | Mặc định 100 |
| 5 | Ghi chú | Text | Không | VD: *"Giá NCC đang giảm 10%…"* |
| 6 | Nút xóa dòng | Icon Button | — | Xóa một dòng mặt hàng chủ động |
| 7 | Thanh tổng hợp | Label | — | *"Tổng hợp: X yêu cầu kho + Y thuốc mua chủ động"*; cảnh báo đỏ nếu chưa đủ điều kiện |
| 8 | Nút "Hủy bỏ" | Button (Secondary) | — | Đóng modal, không lưu |
| 9 | Nút "Tạo Đề Xuất Mua Hàng" | Button (Primary) | — | Bị khóa khi chưa đủ điều kiện; khi gửi: *"Đang tạo đề xuất…"* |

> **Ràng buộc UI**: nút Lưu chỉ bật khi `selectedIds.length > 0 || validItems.length > 0`. Thông báo lỗi đầu form khi thiếu đầu vào.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint tạo đề xuất**: `POST /api/v1/purchase-proposals`
- **Handler**: `PurchaseProposalController.createPurchaseProposal(@Valid @RequestBody CreatePurchaseProposalRequest request)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `201 Created`
- **Endpoint phụ trợ**: `GET /api/v1/purchase-proposals/eligible-requests` → danh sách PR `SUBMITTED` chưa được gộp (`getEligiblePurchaseRequests`).

#### Request Payload:
```json
{
  "purchaseRequestIds": [12, 13],
  "items": [
    { "productId": 101, "quantity": 200, "note": "Giá NCC đang giảm 10%" }
  ],
  "note": "Tổng hợp nhu cầu quý + mua chủ động dự phòng"
}
```

#### Response Payload (HTTP 201 Created):
```json
{
  "status": 201,
  "message": "Purchase proposal created successfully",
  "data": {
    "id": 15,
    "code": "PP-20261108-0001",
    "status": 0,
    "statusText": "Đã lập đề xuất",
    "createdById": 4,
    "createdByUsername": "purchasing01",
    "createdAt": "2026-11-08T09:15:00",
    "purchaseRequests": [
      { "id": 12, "code": "PR-20261101-0007", "status": 1 },
      { "id": 13, "code": "PR-20261102-0003", "status": 1 }
    ],
    "items": [
      { "productId": 101, "productCode": "SP0001", "productName": "Paracetamol 500mg", "unit": "Hộp", "quantity": 200 }
    ]
  }
}
```

#### Response lỗi:
| Trường hợp | HTTP | Message |
| :--- | :--: | :--- |
| Không có PR và không có item | 400 | `Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho hoặc thêm ít nhất một mặt hàng mua chủ động.` |
| PR không tồn tại | 404 | `Không tìm thấy yêu cầu mua hàng ID: {id}` |
| PR sai trạng thái / đã gộp | 400 | Thông báo nghiệp vụ tương ứng |

### 4.2. Khai Báo DTO Java (`CreatePurchaseProposalRequest`)
```java
package com.pharmacy.dto.purchaseproposal;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseProposalRequest {

    /** Các yêu cầu mua hàng (tùy chọn) cần gộp vào một đề xuất. */
    private List<Long> purchaseRequestIds;

    /** Các mặt hàng mua chủ động do nhân viên thu mua tự chọn. */
    private List<CreateProposalItemRequest> items;

    /** Lý do/ghi chú mua chủ động (VD: giá tốt, chiết khấu khuyến mãi). */
    private String note;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProposalItemRequest {
        private Long productId;
        private Integer quantity;
        private String note;
    }
}
```

### 4.3. Thuật Toán Service Layer (`PurchaseProposalServiceImpl.createPurchaseProposal` — trích lược)
```java
@Override
@Transactional
public PurchaseProposalResponse createPurchaseProposal(CreatePurchaseProposalRequest request) {
    List<Long> requestedIds = request.getPurchaseRequestIds() != null
            ? request.getPurchaseRequestIds().stream().filter(Objects::nonNull).distinct().toList()
            : Collections.emptyList();
    List<CreateProposalItemRequest> directItems = request.getItems() != null
            ? request.getItems().stream()
                .filter(it -> it != null && it.getProductId() != null
                        && it.getQuantity() != null && it.getQuantity() > 0).toList()
            : Collections.emptyList();

    if (requestedIds.isEmpty() && directItems.isEmpty()) {
        throw new IllegalArgumentException(
            "Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho hoặc thêm ít nhất một mặt hàng mua chủ động.");
    }

    // 1. Kiểm tra từng yêu cầu mua hàng (tồn tại, SUBMITTED, chưa được gộp)
    List<PurchaseRequest> purchaseRequests = new ArrayList<>();
    for (Long prId : requestedIds) {
        PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu mua hàng ID: " + prId));
        // ... validate trạng thái SUBMITTED và chưa nằm trong đề xuất khác ...
        purchaseRequests.add(pr);
    }

    // 2. Gộp (consolidate) số lượng theo sản phẩm bằng LinkedHashMap
    LinkedHashMap<Long, PurchaseProposalDetail> merged = new LinkedHashMap<>();
    // ... cộng dồn quantity theo productId từ PurchaseRequestDetail của các PR ...
    // ... thêm các mặt hàng mua chủ động từ productRepository.findById(productId) ...

    // 3. Sinh mã đề xuất + khởi tạo entity
    PurchaseProposal pp = PurchaseProposal.builder()
            .code(generateProposalCode())            // PP-YYYYMMDD-####
            .createdBy(getCurrentAccount())
            .status(PurchaseProposalStatus.DRAFT.getCode())
            .createdAt(LocalDateTime.now())
            .build();

    // 4. Tính tổng tiền (costPrice × quantity) và gắn details
    BigDecimal totalAmount = BigDecimal.ZERO;
    for (PurchaseProposalDetail d : merged.values()) {
        d.setPurchaseProposal(pp);
        BigDecimal cost = (d.getProduct() != null && d.getProduct().getCostPrice() != null)
                ? d.getProduct().getCostPrice() : BigDecimal.ZERO;
        totalAmount = totalAmount.add(cost.multiply(BigDecimal.valueOf(d.getQuantity())));
    }
    pp.setDetails(new ArrayList<>(merged.values()));
    pp.setTotalAmount(totalAmount);

    // 5. Lưu đề xuất
    PurchaseProposal saved = purchaseProposalRepository.save(pp);

    // 6. Cập nhật trạng thái nguồn các PR liên quan -> PROPOSAL_CREATED
    // ... purchaseRequest.setStatus(PurchaseRequestStatus.PROPOSAL_CREATED.getCode()); ...

    return PurchaseProposalResponse.fromEntity(saved);
}
```

#### Sinh mã đề xuất (`generateProposalCode`):
```java
private String generateProposalCode() {
    String prefix = "PP-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
    int maxSeq = 0;
    for (PurchaseProposal pp : purchaseProposalRepository.findAll()) {
        String c = pp.getCode();
        if (c != null && c.startsWith(prefix)) {
            try { maxSeq = Math.max(maxSeq, Integer.parseInt(c.substring(prefix.length()))); }
            catch (NumberFormatException ignored) { }
        }
    }
    return prefix + String.format("%04d", maxSeq + 1); // VD: PP-20261108-0001
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CPP-01** | Tạo đề xuất từ PR kho | Chọn 2 PR `SUBMITTED` chưa gộp | HTTP 201, mã `PP-YYYYMMDD-####`, status `DRAFT` |
| **TC-CPP-02** | Tạo đề xuất từ mặt hàng chủ động | 1 item `productId` + `quantity=200` | HTTP 201, đề xuất có item tương ứng |
| **TC-CPP-03** | Kết hợp PR + item chủ động | 1 PR + 1 item | HTTP 201, gộp đủ danh mục |
| **TC-CPP-04** | Không chọn gì | `purchaseRequestIds=[]`, `items=[]` | HTTP 400 "Vui lòng chọn ít nhất một..." |
| **TC-CPP-05** | PR không tồn tại | `purchaseRequestIds=[999]` | HTTP 404 "Không tìm thấy yêu cầu mua hàng ID: 999" |
| **TC-CPP-06** | PR đã được gộp trước đó | PR đã thuộc đề xuất khác | HTTP 400 (không cho gộp trùng) |
| **TC-CPP-07** | Gộp trùng sản phẩm | 2 PR cùng sản phẩm | Số lượng được cộng dồn thành 1 dòng |
| **TC-CPP-08** | Cập nhật trạng thái nguồn | PR `SUBMITTED` được gộp | PR chuyển sang `PROPOSAL_CREATED` |
| **TC-CPP-09** | Item chủ động thiếu số lượng | `quantity = 0` | Item bị loại; nếu không còn gì → HTTP 400 |
| **TC-CPP-10** | Hủy tạo (AT1) | Bấm "Hủy bỏ" | Đóng modal, không tạo bản ghi |


