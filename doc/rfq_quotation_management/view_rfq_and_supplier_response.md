# Đặc Tả Kỹ Thuật: 3.14.2 View RFQ and Supplier Response (Xem RFQ & Phản Hồi Nhà Cung Cấp)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC62` (SRS 3.14.2)
- **Tên Use Case**: View RFQ and Supplier Response (Xem Yêu cầu báo giá & Phản hồi nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua) và `Supplier` (Nhà cung cấp — phía cổng công khai)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua theo dõi trạng thái truyền nhận của các RFQ đã gửi và truy cập phản hồi (báo giá) đến từ nhà cung cấp. Đồng thời mô tả luồng nhà cung cấp truy cập cổng công khai bằng token để xem đề nghị báo giá và gửi đơn giá.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff` (với luồng phản hồi: nhà cung cấp có token hợp lệ và chưa hết hạn).
- **Trigger**:
  - TRG-01: Người dùng chọn mục **"RFQ & Báo giá"** trên menu điều hướng → route `/procurement/rfq`. Nhà cung cấp mở link `/rfq-response?token=...`.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Danh sách/chi tiết RFQ và phản hồi báo giá được hiển thị.
  - POS-02: Khi nhà cung cấp gửi báo giá: RFQ chuyển sang `RESPONDED`, bản ghi `SupplierQuotation` + chi tiết được tạo, `token_hash` bị vô hiệu hóa (đặt `null`).

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính — Xem danh sách & chi tiết (Purchasing Staff)
1. Nhân viên thu mua vào `/procurement/rfq`.
2. Hệ thống gọi `GET /api/v1/rfq` (mặc định `page=0`, `size=10`, `sort=id DESC`), có thể lọc theo `search` (mã RFQ/tên NCC/mã đề xuất), `status`, `supplierId`, `purchaseProposalId`.
3. Bảng hiển thị: Mã RFQ, Nhà cung cấp, Đề xuất mua hàng liên kết, Trạng thái, Ngày gửi, Hạn chót, Thao tác.
4. Nhân viên thu mua bấm icon **Xem** → `GET /api/v1/rfq/{id}/quotation` → mở `RfqDetailModal` (thông tin RFQ, nhà cung cấp, bảng mặt hàng + đơn giá/thành tiền).
5. Với RFQ đã `RESPONDED`, modal hiển thị nút **"So sánh với các báo giá khác"** (dẫn sang UC64).

### 2.2. Luồng chính — Nhà cung cấp phản hồi báo giá (Cổng công khai)
6. Nhà cung cấp mở link `/rfq-response?token=...` từ email.
7. Frontend gọi `GET /api/public/rfq-portal?token=...`; backend băm token SHA-256 và tìm RFQ hợp lệ (`findValidRfqByTokenHash` — chỉ nhận `status = SENT` và `expiredAt > now`); không hợp lệ/hết hạn → HTTP 404 *"RFQ token is invalid or expired"*. Chặn nếu nhà cung cấp `INACTIVE`.
8. Nhà cung cấp điền **Đơn giá** cho từng mặt hàng (bắt buộc > 0) và **Ghi chú** (tùy chọn).
9. Frontend gửi `POST /api/public/rfq-portal/submit?token=...` kèm danh sách `items`.
10. Backend (`PublicRfqServiceImpl.submitQuotation`) xử lý:
    - Kiểm tra danh sách items không rỗng; xác thực token; `ensureSupplierActive`.
    - Nếu RFQ không còn `SENT` → HTTP 400 *"RFQ already responded or expired"*.
    - Nếu đã tồn tại báo giá cho RFQ → HTTP 400 *"Quotation already submitted for this RFQ"*.
    - Tạo `SupplierQuotation` (mã `QT<millis>`, `quotationDate = today`, `validUntil = today + 30` ngày, `status = 0`).
    - Với mỗi item: khớp `PurchaseProposalDetail` (nếu không có → HTTP 400), tính `subtotal = unitPrice × quantity`, cộng dồn `totalAmount`.
    - Lưu quotation + details; cập nhật RFQ `status = RESPONDED`, `responseAt = now`, `tokenHash = null`.
11. Trả về *"Quotation submitted successfully"*; trang hiển thị xác nhận hoàn tất.

### 2.3. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Lỗi validate/thiếu đơn giá**: nhà cung cấp chưa điền đủ đơn giá cho mọi mặt hàng → *"Please enter unit price for all items"*.
- **AT02 - Người dùng hủy**: đóng modal/discard.
- **A1 - Token sai/hết hạn** (quá 3 ngày): HTTP 404 *"RFQ token is invalid or expired"*.
- **A2 - Nhà cung cấp ngừng hoạt động**: HTTP 400 *"This supplier is inactive; the quotation request is no longer available"*.
- **A3 - RFQ đã phản hồi**: HTTP 400 *"RFQ already responded or expired"*.
- **A4 - Không tìm thấy RFQ theo ID**: HTTP 404 *"RFQ not found with ID: {id}"*.

### 2.4. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Trạng thái hiệu lực)**: RFQ `SENT` đã qua `expiredAt` được báo cáo hiệu lực là `EXPIRED` trong `RfqResponse.fromEntity`.
- **BR-02 (Một báo giá mỗi RFQ)**: Mỗi RFQ chỉ nhận một báo giá.
- **BR-03 (Token dùng một lần)**: Sau khi gửi báo giá, `token_hash` bị vô hiệu hóa.
- **BR-04 (Phân trang server)**: Danh sách RFQ phân trang tại CSDL (`Pageable`).
- **BR-05 (Nhật ký kiểm toán)**: Mọi thao tác sinh `audit_logs` (theo SRS).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bộ Lọc (`RfqFilters.jsx`)
| STT | Field Name | Loại điều khiển | Bắt buộc | Mô tả |
| :--: | :--- | :--- | :--: | :--- |
| 1 | Search | Text | Không | Tìm theo mã RFQ hoặc nhà cung cấp |
| 2 | Status | Dropdown | Không | Tất cả / `SENT` Đã gửi / `RESPONDED` Đã phản hồi / `EXPIRED` Đã hết hạn |
| 3 | Total Counter | Label | — | *"Tổng cộng: X yêu cầu báo giá"* |

### 3.2. Bảng RFQ (`RfqTable.jsx`)
| STT | Cột hiển thị | Trường dữ liệu | Ghi chú |
| :--: | :--- | :--- | :--- |
| 1 | STT | `page*size + idx + 1` | — |
| 2 | MÃ RFQ | `code` | Mono |
| 3 | NHÀ CUNG CẤP | `supplierName` | Kèm mã NCC |
| 4 | ĐỀ XUẤT MUA HÀNG LIÊN KẾT | `purchaseProposalCode` | — |
| 5 | TRẠNG THÁI | `status` | Badge: Đã gửi (info), Đã phản hồi (success), Đã hết hạn (warning), Đã hủy (danger) |
| 6 | NGÀY GỬI | `sentAt` | — |
| 7 | HẠN CHÓT | `expiredAt` | — |
| 8 | THAO TÁC | — | **So sánh** (khi `RESPONDED`), **Chọn NCC** (khi đề xuất `DRAFT` + NCC active + đã phản hồi), **Xem** |

### 3.3. Modal Chi Tiết (`RfqDetailModal.jsx`)
- Tiêu đề: *"Chi Tiết Yêu Cầu Báo Giá (RFQ)"*.
- Khối **Thông Tin RFQ** (mã, trạng thái, hạn chót) + **Thông Tin Nhà Cung Cấp**.
- Bảng mặt hàng: Tên thuốc, Mã thuốc, ĐVT, SL yêu cầu, Đơn giá, Thành tiền.
- Footer: **"So sánh với các báo giá khác"** (khi `RESPONDED`) + **Đóng**.

### 3.4. Trang Công Khai (`RfqResponsePage.jsx`, route `/rfq-response`)
| STT | Thành phần | Loại điều khiển | Bắt buộc | Mô tả |
| :--: | :--- | :--- | :--: | :--- |
| 1 | Supplier Info Header | Label | — | Thông tin nhà cung cấp nhận thư |
| 2 | RFQ Code | Label | — | Mã RFQ |
| 3 | Source Purchase Request | Label | — | Mã PR/đề xuất nguồn |
| 4 | Quotation Deadline | Label | — | Hạn chót (DD/MM/YYYY) kèm icon đồng hồ |
| 5 | Quotation Items Table | Grid | — | Danh sách mặt hàng cần báo giá |
| 6 | Quoted Unit Price | Number/Currency | Có | Đơn giá mỗi dòng (VND), bắt buộc, hậu tố "đ" |
| 7 | Supplier Remarks | Text | Không | Ghi chú/thời gian giao hàng/đóng gói (≤ 255) |
| 8 | Submit Quotation | Button (Primary) | — | Validate mọi đơn giá > 0, gửi & khóa form |

> **Trạng thái rỗng/lỗi**: token sai/hết hạn hiển thị *"Failed to load RFQ details. The link may be expired or invalid."*; thiếu đơn giá → *"Please enter unit price for all items"*; thành công → màn hình xác nhận.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract — Danh sách RFQ
- **Endpoint**: `GET /api/v1/rfq`
- **Handler**: `RfqController.getRfqs(@RequestParam search, status, supplierId, purchaseProposalId, Pageable)`
- **Query params**: `search` (mã RFQ/tên NCC/mã đề xuất), `status` (`RfqStatus`), `supplierId`, `purchaseProposalId`, `page`, `size`, `sort`, `direction`.

#### Response (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "RFQs retrieved successfully",
  "data": {
    "content": [
      {
        "id": 88,
        "code": "RFQ1762300000000",
        "supplierId": 21,
        "supplierName": "Công ty Cổ phần Dược Hậu Giang",
        "purchaseProposalId": 15,
        "purchaseProposalCode": "PP-20261104-01",
        "purchaseProposalStatus": 0,
        "supplierStatus": "ACTIVE",
        "status": "RESPONDED",
        "sentAt": "08/11/2026 09:15",
        "responseAt": "09/11/2026 10:30",
        "expiredAt": "11/11/2026 09:15",
        "createdAt": "08/11/2026 09:15"
      }
    ],
    "page": 0, "size": 10, "totalElements": 12, "totalPages": 2, "last": false
  }
}
```

### 4.2. RESTful API Contract — Chi tiết RFQ & Báo giá
| Endpoint | Handler | Mô tả |
| :--- | :--- | :--- |
| `GET /api/v1/rfq/{id}` | `getRfqById` | Chi tiết RFQ (404 nếu không có) |
| `GET /api/v1/rfq/supplier/{supplierId}` | `getRfqsBySupplier` | RFQ theo NCC (phân trang) |
| `GET /api/v1/rfq/{id}/quotation` | `getRfqWithQuotationDetails` | RFQ + báo giá + mặt hàng (`RfqQuotationResponse`) |

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
      "totalAmount": 12500000.00, "status": 0
    },
    "items": [
      { "productId": 101, "productName": "Paracetamol 500mg", "unit": "Hộp",
        "requestedQuantity": 100, "unitPrice": 25000, "subtotal": 2500000 }
    ]
  }
}
```

### 4.3. RESTful API Contract — Cổng công khai
| Endpoint | Handler | Mô tả |
| :--- | :--- | :--- |
| `GET /api/public/rfq-portal?token=` | `PublicRfqController.getRfqDetails` | Xem RFQ theo token |
| `POST /api/public/rfq-portal/submit?token=` | `PublicRfqController.submitQuotation` | Nhà cung cấp gửi báo giá |

#### Request (submit):
```json
{
  "items": [
    { "itemId": 501, "unitPrice": 25000, "note": "Giao trong 3 ngày" }
  ]
}
```

#### Response (HTTP 200 OK):
```json
{ "status": 200, "message": "Quotation submitted successfully", "data": null }
```

### 4.4. Thuật Toán Service Layer
**`RfqServiceImpl.getRfqsWithFilters` / `getRfqWithQuotationDetails`:**
```java
@Override
public Page<RfqResponse> getRfqsWithFilters(String search, RfqStatus status, Long supplierId,
        Long purchaseProposalId, Pageable pageable) {
    Page<Rfq> rfqs = rfqRepository.findAllWithFilters(
            search != null && !search.trim().isEmpty() ? search.trim() : null,
            status, supplierId, purchaseProposalId, pageable);
    return rfqs.map(RfqResponse::fromEntity);
}

@Override
public RfqQuotationResponse getRfqWithQuotationDetails(Long rfqId) {
    Rfq rfq = rfqRepository.findById(rfqId)
            .orElseThrow(() -> new EntityNotFoundException("RFQ not found with ID: " + rfqId));
    SupplierQuotation quotation = supplierQuotationRepository.findByRfqIdWithDetails(rfqId).orElse(null);
    return RfqQuotationResponse.from(rfq, quotation);
}
```

**`PublicRfqServiceImpl.submitQuotation` (trích lược):**
```java
@Override
@Transactional
public boolean submitQuotation(String rawToken, SubmitQuotationRequest request) {
    if (request.items() == null || request.items().isEmpty()) {
        throw new IllegalArgumentException("Quotation must contain at least one item");
    }
    String tokenHash = SecurityUtils.sha256Hex(rawToken);
    Rfq rfq = rfqRepository.findValidRfqByTokenHash(tokenHash, LocalDateTime.now())
            .orElseThrow(() -> new EntityNotFoundException("RFQ token is invalid or expired"));

    ensureSupplierActive(rfq);

    if (rfq.getStatus() != RfqStatus.SENT) {
        throw new IllegalArgumentException("RFQ already responded or expired");
    }
    if (supplierQuotationRepository.findByRfqId(rfq.getId()).isPresent()) {
        throw new IllegalArgumentException("Quotation already submitted for this RFQ");
    }

    PurchaseProposal proposal = rfq.getPurchaseProposal();
    Map<Long, PurchaseProposalDetail> proposalDetailMap = proposal.getDetails().stream()
            .collect(Collectors.toMap(PurchaseProposalDetail::getId, d -> d, (a, b) -> a));

    BigDecimal totalAmount = BigDecimal.ZERO;
    SupplierQuotation quotation = SupplierQuotation.builder()
            .code("QT" + System.currentTimeMillis())
            .rfq(rfq).supplier(rfq.getSupplier()).account(rfq.getSentBy())
            .quotationDate(LocalDate.now())
            .validUntil(LocalDate.now().plusDays(30))
            .status((short) 0).createdAt(LocalDateTime.now())
            .build();

    List<SupplierQuotationDetail> details = new ArrayList<>();
    for (SubmitQuotationRequest.QuotationItemDto item : request.items()) {
        PurchaseProposalDetail pd = proposalDetailMap.get(item.itemId());
        if (pd == null) throw new IllegalArgumentException("Item ID " + item.itemId() + " not found in purchase proposal");
        int qty = pd.getQuantity() != null ? pd.getQuantity() : 0;
        BigDecimal price = item.unitPrice() != null ? item.unitPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty));
        details.add(SupplierQuotationDetail.builder()
                .supplierQuotation(quotation).product(pd.getProduct())
                .quantity(qty).unitPrice(price).taxRate(BigDecimal.ZERO).subtotal(subtotal).build());
        totalAmount = totalAmount.add(subtotal);
    }
    quotation.setTotalAmount(totalAmount);
    SupplierQuotation saved = supplierQuotationRepository.save(quotation);
    supplierQuotationDetailRepository.saveAll(details);

    rfq.setStatus(RfqStatus.RESPONDED);
    rfq.setResponseAt(LocalDateTime.now());
    rfq.setTokenHash(null);
    rfqRepository.save(rfq);
    return true;
}
```

### 4.5. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.14.2 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | `tax_rate` có tính thuế | Báo giá công khai đặt `taxRate = 0` (chưa có tax) | Bổ sung nhập thuế nếu cần |
| 2 | Ghi nhật ký kiểm toán | `submitQuotation` **chưa** ghi `audit_logs` | Bổ sung ghi audit |
| 3 | Trạng thái EF Core | `RfqStatus` dùng `@Enumerated(ORDINAL)` (lưu số thứ tự) | Cân nhắc `STRING`/converter để an toàn khi thêm enum |
| 4 | — | `SupplierQuotation.account` gán = `rfq.getSentBy()` (người gửi RFQ, không phải NCC) | Ghi nhận như tài khoản đại diện |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-VRR-01** | Danh sách RFQ mặc định | `page=0`, `size=10` | 10 bản ghi, `totalElements` đúng |
| **TC-VRR-02** | Lọc theo trạng thái | `status=RESPONDED` | Chỉ trả RFQ `RESPONDED` |
| **TC-VRR-03** | Tìm theo mã/nhà cung cấp | `search="DHG"` | Trả RFQ khớp mã/đề xuất/tên NCC |
| **TC-VRR-04** | Xem chi tiết RFQ hợp lệ | `GET /{id}/quotation` | HTTP 200, có supplier + items |
| **TC-VRR-05** | RFQ không tồn tại | `id=999` | HTTP 404 "RFQ not found with ID: 999" |
| **TC-VRR-06** | RFQ SENT quá hạn báo EXPIRED | `expiredAt < now`, `status=SENT` | `RfqResponse.status = EXPIRED` |
| **TC-VRR-07** | Nhà cung cấp gửi báo giá thành công | token hợp lệ, đủ đơn giá | RFQ → `RESPONDED`, quotation + details được tạo |
| **TC-VRR-08** | Token hết hạn | token quá 3 ngày | HTTP 404 "RFQ token is invalid or expired" |
| **TC-VRR-09** | Gửi báo giá lần 2 | RFQ đã `RESPONDED` | HTTP 400 "RFQ already responded or expired" |
| **TC-VRR-10** | NCC ngừng hoạt động truy cập link | NCC `INACTIVE` | HTTP 400 "This supplier is inactive..." |
| **TC-VRR-11** | Thiếu đơn giá | 1 item `unitPrice` trống | Lỗi "Please enter unit price for all items" |
| **TC-VRR-12** | itemId không thuộc đề xuất | `itemId` không tồn tại | HTTP 400 "Item ID ... not found in purchase proposal" |



