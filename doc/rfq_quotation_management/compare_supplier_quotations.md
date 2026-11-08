# Đặc Tả Kỹ Thuật: 3.14.4 Compare Supplier Quotations (So Sánh Báo Giá Nhà Cung Cấp)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC64` (SRS 3.14.4)
- **Tên Use Case**: Compare Supplier Quotations (So sánh báo giá các nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cung cấp một **ma trận so sánh song song** giữa các báo giá hợp lệ của các nhà cung cấp trong cùng một vòng RFQ (tức cùng một Đề xuất mua hàng), giúp nhân viên thu mua đối chiếu đơn giá từng mặt hàng, nhận diện giá thấp nhất và chốt nhà cung cấp thắng.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Tồn tại ≥ 2 RFQ đã được phản hồi (`RESPONDED`) và cùng thuộc một Đề xuất mua hàng.
- **Trigger**:
  - TRG-01: Người dùng bấm nút **"So sánh"** trên một dòng RFQ đã phản hồi hoặc từ Modal chi tiết RFQ.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Ma trận so sánh báo giá được hiển thị.
  - POS-02: Nếu chọn nhà cung cấp: Đề xuất chuyển sang trạng thái "Chờ phê duyệt" và báo giá bị khóa không thể chỉnh sửa.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ trang danh sách RFQ, Nhân viên thu mua bấm **"So sánh"** trên một RFQ đã phản hồi (hoặc từ Modal chi tiết RFQ).
2. Frontend xác định `purchaseProposalId` của RFQ và thu thập **toàn bộ** RFQ đã `RESPONDED` thuộc cùng đề xuất (`fetchRespondedRfqIds` — gọi `getRfqs` với `status=RESPONDED`, `size` lớn để không sót bản ghi ở trang khác).
3. Nếu số RFQ đã phản hồi **< 2**: hiển thị thông báo *"Không có hoặc chưa có nhà cung cấp khác báo giá cho cùng đề xuất mua hàng."*
4. Nếu ≥ 2: mở `QuotationCompareModal` và gọi `GET /api/v1/rfq/compare?ids=...`.
5. Backend (`RfqServiceImpl.compareRfqs`) kiểm tra và dựng ma trận:
   - Yêu cầu ≥ 2 RFQ; nếu không → HTTP 400.
   - Tìm các RFQ kèm quan hệ; nếu thiếu → HTTP 404.
   - Yêu cầu tất cả RFQ thuộc cùng một Đề xuất mua hàng (nếu khác → HTTP 400).
   - Gom báo giá của các RFQ `RESPONDED`.
   - Trả `CompareResponse` (cột theo từng NCC, dòng theo từng mặt hàng, tổng tiền theo NCC).
6. Frontend hiển thị ma trận, **tô nổi bật giá thấp nhất** mỗi dòng và hàng **Tổng Tiền Đơn Hàng**.
7. Nếu Đề xuất đang ở trạng thái `DRAFT` (`purchaseProposalStatus = 0`), mỗi cột có nút **"Chọn NCC"**. Nhân viên thu mua bấm chọn → `selectProposalSupplier(proposalId, rfqId)` → đề xuất chuyển "Chờ phê duyệt".

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Nhà cung cấp bị vô hiệu hóa (khi chọn NCC)**: hiển thị cảnh báo lỗi; không chọn được.
- **AT02 - Người dùng hủy**: đóng modal, không thay đổi gì.
- **A1 - Ít hơn 2 RFQ**: HTTP 400 *"At least 2 RFQs are required for comparison"* / thông báo empty.
- **A2 - RFQ không cùng đề xuất**: HTTP 400 *"All RFQs must belong to the same purchase proposal"*.
- **A3 - Không tìm thấy RFQ**: HTTP 404 *"One or more RFQs not found"*.
- **A4 - RFQ không gắn đề xuất**: HTTP 400 *"RFQs are not linked to a purchase proposal"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Session hợp lệ)**: Mọi thao tác phải nằm trong phiên đăng nhập hợp lệ.
- **BR-02 (Nhật ký kiểm toán)**: Mọi thay đổi/thi hành sinh `audit_logs` bất biến.
- **BR-03 (Chỉ báo giá hợp lệ)**: Chỉ so sánh các báo giá thuộc RFQ đã `RESPONDED` trong cùng một vòng (đề xuất).
- **BR-04 (Chọn NCC khóa báo giá)**: Sau khi chọn nhà cung cấp, đề xuất chuyển "Chờ phê duyệt" và báo giá không thể chỉnh sửa.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal So Sánh (`QuotationCompareModal.jsx`)
| STT | Thành phần | Loại điều khiển | Mô tả |
| :--: | :--- | :--- | :--- |
| 1 | Close Modal | Icon Button | Góc phải trên; đóng modal so sánh |
| 2 | Source Purchase Proposal | Label | Hiển thị mã Đề xuất mua hàng nguồn |
| 3 | Compared RFQ Count | Label | Số lượng báo giá/NCC tham gia so sánh |
| 4 | Quotation Comparison Matrix | Grid | Ma trận đối chiếu đơn giá theo từng mặt hàng × từng NCC |
| 5 | Quoted Unit Price & Best Price Badge | Cell | Đơn giá mỗi NCC; ô giá thấp nhất được tô nổi bật (badge "Thấp nhất") |
| 6 | Nút "Chọn NCC" | Button (Primary) | Mỗi cột NCC; chỉ bật khi đề xuất `DRAFT` và NCC có báo giá |
| 7 | Tổng Tiền Đơn Hàng | Row | Tổng tiền theo từng NCC |
| 8 | Nút Đóng | Button (Secondary) | Đóng modal |

> **Bố cục ma trận**: cột cố định "Tên Thuốc / Sản Phẩm" + "SL"; các cột động theo từng báo giá (tên NCC + mã RFQ); cột phải cùng "Thấp Nhất". Hàng cuối là **Tổng Tiền Đơn Hàng**; hàng nút "Chọn NCC" chỉ hiện khi `purchaseProposalStatus = 0`.
>
> **Empty/Error state**: tiêu đề *"Không thể so sánh báo giá"* kèm lý do (thiếu NCC khác báo giá / lỗi API).

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract — So sánh báo giá
- **Endpoint**: `GET /api/v1/rfq/compare?ids=1&ids=2&ids=3`
- **Handler**: `RfqController.compareRfqs(@RequestParam List<Long> ids)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `200 OK`

#### Response Payload:
```json
{
  "status": 200,
  "message": "RFQ comparison generated successfully",
  "data": {
    "purchaseProposalId": 15,
    "purchaseProposalCode": "PP-20261104-01",
    "purchaseProposalStatus": 0,
    "columns": [
      { "rfqId": 88, "rfqCode": "RFQ1762300000000",
        "supplier": { "id": 21, "code": "SUP-DHG", "name": "Công ty Cổ phần Dược Hậu Giang" },
        "status": "RESPONDED" },
      { "rfqId": 91, "rfqCode": "RFQ1762310000123",
        "supplier": { "id": 22, "code": "SUP-SPM", "name": "Công ty SPM" },
        "status": "RESPONDED" }
    ],
    "rows": [
      { "productId": 101, "productName": "Paracetamol 500mg", "productCode": "SP0001",
        "unit": "Hộp", "requestedQuantity": 100,
        "unitPrices": { "88": 25000, "91": 24500 } }
    ],
    "totals": { "88": 2500000, "91": 2450000 }
  }
}
```

### 4.2. RESTful API Contract — Chọn nhà cung cấp thắng
- **Endpoint**: `PATCH /api/v1/purchase-proposals/{id}/select-supplier?rfqId={rfqId}`
- **Handler**: `PurchaseProposalController.selectSupplier(@PathVariable Long id, @RequestParam Long rfqId)`
- **Mô tả**: Chọn báo giá thắng → đề xuất chuyển `PENDING_APPROVAL`; kích hoạt bởi nút **"Chọn NCC"**.

### 4.3. DTO & Thuật Toán Service Layer (`CompareResponse.from` / `RfqServiceImpl.compareRfqs`)
```java
@Override
public CompareResponse compareRfqs(List<Long> rfqIds) {
    if (rfqIds == null || rfqIds.size() < 2) {
        throw new IllegalArgumentException("At least 2 RFQs are required for comparison");
    }
    List<Rfq> rfqs = rfqRepository.findAllByIdWithRelations(rfqIds);
    if (rfqs.size() != rfqIds.size()) {
        throw new EntityNotFoundException("One or more RFQs not found");
    }
    PurchaseProposal proposal = rfqs.get(0).getPurchaseProposal();
    if (proposal == null) {
        throw new IllegalArgumentException("RFQs are not linked to a purchase proposal");
    }
    boolean diffProposal = rfqs.stream().anyMatch(r ->
            r.getPurchaseProposal() == null
            || !r.getPurchaseProposal().getId().equals(proposal.getId()));
    if (diffProposal) {
        throw new IllegalArgumentException("All RFQs must belong to the same purchase proposal");
    }
    List<Long> respondedIds = rfqs.stream()
            .filter(r -> r.getStatus() == RfqStatus.RESPONDED)
            .map(Rfq::getId).toList();
    List<SupplierQuotation> quotations = respondedIds.isEmpty()
            ? Collections.emptyList()
            : supplierQuotationRepository.findByRfqIdInWithDetails(respondedIds);
    return CompareResponse.from(proposal, rfqs, quotations);
}
```

> **Cấu trúc `CompareResponse`**: `columns` (RFQ × NCC), `rows` (`unitPrices` map `rfqId → đơn giá`), `totals` (map `rfqId → totalAmount`). Giá thấp nhất được FE tự tính để tô nổi bật.

### 4.4. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.14.4 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Ma trận có badge "Best Price" | Backend **không** trả cờ best-price; FE tự so sánh `min` | Có thể bổ sung cờ `isLowest` cho từng ô |
| 2 | Ghi nhật ký kiểm toán khi chọn NCC | Chưa ghi `audit_logs` | Bổ sung ghi audit ở `selectSupplier` |
| 3 | So sánh "vòng RFQ" | Xác định theo `purchaseProposalId` (không có bảng RFQ round riêng) | Ghi nhận mô hình vòng = đề xuất |
| 4 | — | Nút "Chọn NCC" chỉ hiện khi `purchaseProposalStatus = 0` | Đồng bộ quy tắc trạng thái DRAFT |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CSQ-01** | So sánh 2 báo giá cùng đề xuất | `ids=[88,91]` cùng proposal | HTTP 200, ma trận + totals + columns đúng |
| **TC-CSQ-02** | So sánh với 1 RFQ | `ids=[88]` | HTTP 400 "At least 2 RFQs are required for comparison" |
| **TC-CSQ-03** | So sánh 2 RFQ khác đề xuất | RFQ thuộc 2 proposal khác nhau | HTTP 400 "All RFQs must belong to the same purchase proposal" |
| **TC-CSQ-04** | Không tìm thấy RFQ | `ids=[88,999]` | HTTP 404 "One or more RFQs not found" |
| **TC-CSQ-05** | Đánh dấu giá thấp nhất | NCC A=25000, NCC B=24500 | Cột NCC B được tô nổi bật mỗi dòng |
| **TC-CSQ-06** | Tổng tiền theo NCC | Tổng dòng các mặt hàng | Hàng "Tổng Tiền Đơn Hàng" khớp tổng |
| **TC-CSQ-07** | Chọn nhà cung cấp thắng | Đề xuất `DRAFT`, bấm "Chọn NCC" | Đề xuất → "Chờ phê duyệt", báo giá bị khóa |
| **TC-CSQ-08** | Ít hơn 2 NCC báo giá | Chỉ 1 RFQ `RESPONDED` | Hiển thị thông báo không có NCC khác báo giá |

