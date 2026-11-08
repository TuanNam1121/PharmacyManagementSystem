# Đặc Tả Kỹ Thuật: 3.14.1 Send RFQ via Email to Supplier (Gửi Yêu Cầu Báo Giá qua Email)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC61` (SRS 3.14.1)
- **Tên Use Case**: Send RFQ via Email to Supplier (Gửi yêu cầu báo giá cho nhà cung cấp qua email)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua tạo một Yêu cầu báo giá (RFQ) cho các loại thuốc cần mua từ các Đề xuất mua hàng (Purchase Proposal) đã gộp, và gửi tự động qua email tới các nhà cung cấp được chọn. Email chứa **đường dẫn bảo mật (token)** để nhà cung cấp điền báo giá trực tuyến.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Tồn tại ít nhất một Đề xuất mua hàng ở trạng thái `DRAFT` (chưa chọn nhà cung cấp).
- **Trigger**:
  - TRG-01: Người dùng bấm nút **"Gửi Yêu Cầu Báo Giá"** trên trang `/procurement/rfq`.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Bản ghi RFQ mới được tạo với trạng thái `SENT` kèm `token_hash` và `expired_at`.
  - POS-02: Email RFQ được gửi tới nhà cung cấp kèm link báo giá trực tuyến.
  - POS-03: Các Purchase Request thuộc đề xuất chuyển sang trạng thái `RFQ_SENT`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua bấm **"Gửi Yêu Cầu Báo Giá"** → mở Modal `SendRfqModal.jsx`.
2. Hệ thống nạp danh sách đề xuất đủ điều kiện (`GET /api/v1/rfq/proposals/eligible`) và danh sách nhà cung cấp `ACTIVE`.
3. Nhân viên thu mua chọn **Nhà cung cấp**, chọn **Đề xuất mua hàng nguồn**, chỉnh **Tiêu đề Email** và **Nội dung Email** (đã pre-fill mẫu).
4. Frontend kiểm tra bắt buộc: có nhà cung cấp, có đề xuất, có subject, có content.
5. Frontend gửi `POST /api/v1/rfq/send` kèm payload `SendRfqRequest`.
6. Backend xử lý trong `RfqServiceImpl.sendRfq(...)`:
   - Tìm nhà cung cấp theo `supplierId`; không tồn tại → `EntityNotFoundException` (HTTP 404).
   - Chặn nếu nhà cung cấp `INACTIVE` → HTTP 400 *"Cannot send RFQ to supplier ... supplier is inactive"*.
   - Tìm Đề xuất mua hàng theo `purchaseProposalId`; không tồn tại → HTTP 404.
   - Chỉ cho phép đề xuất ở trạng thái `DRAFT` (chưa chọn NCC).
   - Chặn nếu đã có RFQ đang "sống" cho cùng (nhà cung cấp + đề xuất) — tức đã `RESPONDED` hoặc `SENT` chưa quá hạn.
   - Sinh mã RFQ `"RFQ" + System.currentTimeMillis()`; sinh `rawToken` (UUID bỏ dấu gạch); băm SHA-256 → `tokenHash`; hạn `expired_at = now + 3 ngày`.
   - Tạo `Rfq` (status `SENT`, `sentAt = now`, gắn `sentBy`/`createdBy`).
   - Chuyển mọi Purchase Request trong đề xuất sang `RFQ_SENT`.
   - Gửi email qua `emailService.sendRfqEmail(rfq, supplier, rawToken, frontendUrl)`.
7. Backend trả về HTTP `201 Created` kèm `RfqResponse`.
8. Frontend đóng modal, hiển thị *"Gửi yêu cầu báo giá thành công!"* và làm mới danh sách.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Lỗi validate/thiếu trường**: hiển thị cảnh báo và giữ nguyên dữ liệu đã nhập.
- **AT02 - Người dùng hủy**: đóng modal, không gửi.
- **A1 - Nhà cung cấp ngừng hoạt động**: HTTP 400 *"Cannot send RFQ to supplier '{code}': supplier is inactive"*.
- **A2 - Đề xuất không ở trạng thái DRAFT**: HTTP 400 (đề xuất đã chọn NCC rồi).
- **A3 - Đã có RFQ đang hiệu lực**: HTTP 400 *"RFQ already sent to this supplier for the same purchase proposal"* (RFQ đã hết hạn/hủy thì được gửi lại).

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Session hợp lệ)**: Mọi thao tác phải nằm trong phiên đăng nhập hợp lệ, đúng quyền.
- **BR-02 (Nhật ký kiểm toán)**: Mọi thay đổi/thi hành phải sinh bản ghi `audit_logs` bất biến kèm `user_id`/`timestamp`.
- **BR-03 (Toàn vẹn & phân quyền)**: Kiểm tra toàn vẹn dữ liệu và phân quyền trước khi lưu.
- **BR-04 (Chống trùng RFQ)**: Không gửi trùng một RFQ đang hiệu lực cho cùng cặp (NCC, đề xuất).
- **BR-05 (Token bảo mật)**: Link báo giá dùng token ngẫu nhiên, chỉ lưu bản băm SHA-256, hết hạn sau 3 ngày.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Gửi RFQ (`SendRfqModal.jsx`)
| STT | Field Name | Loại điều khiển | Bắt buộc | Max Length | Mô tả |
| :--: | :--- | :--- | :--: | :--: | :--- |
| 1 | Close Modal | Icon Button | — | — | Góc phải trên; đóng modal mà không gửi |
| 2 | Supplier | Dropdown | Có | — | Chọn nhà cung cấp nhận RFQ (tên + mã NCC) |
| 3 | Source Purchase Request / Proposal | Dropdown | Có | — | Gắn RFQ với Đề xuất mua hàng nguồn |
| 4 | Email Subject | Text | Có (≤ 300) | 300 | Tiêu đề email, pre-fill mẫu, có thể sửa |
| 5 | Email Content | Textarea | Có (≤ 5000) | 5000 | Nội dung thư; hệ thống tự đính kèm link báo giá |
| 6 | Nút Submit | Button (Primary) | — | — | Nhãn **"Gửi RFQ"**, khi gửi: *"Đang gửi…"* |
| 7 | Nút Cancel | Button (Ghost) | — | — | Nhãn **"Hủy"**, reset form |

> **Ghi chú UI**: Hint dưới form: *"Đường dẫn bảo mật để nhà cung cấp điền báo giá sẽ được hệ thống đính kèm tự động... Liên kết có hiệu lực trong vòng 3 ngày."* Nếu không có đề xuất `DRAFT`, hiển thị *"Hiện không có đề xuất mua hàng nào ở trạng thái Sẵn sàng tạo RFQ."*

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract — Đề xuất đủ điều kiện
- **Endpoint**: `GET /api/v1/rfq/proposals/eligible`
- **Handler**: `RfqController.getEligiblePurchaseProposals()`
- **Mô tả**: Trả về danh sách đề xuất mua hàng ở trạng thái `DRAFT` (chưa chọn NCC).

### 4.2. RESTful API Contract — Gửi RFQ
- **Endpoint**: `POST /api/v1/rfq/send`
- **Handler**: `RfqController.sendRfq(@Valid @RequestBody SendRfqRequest request)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `201 Created`

#### Request Payload:
```json
{
  "supplierId": 21,
  "purchaseProposalId": 15,
  "subject": "Yêu cầu báo giá dược phẩm - Công ty Dược Hậu Giang",
  "content": "Kính gửi Quý Nhà cung cấp, chúng tôi xin gửi danh mục yêu cầu báo giá..."
}
```

#### Response Payload (HTTP 201 Created):
```json
{
  "status": 201,
  "message": "RFQ sent successfully",
  "data": {
    "id": 88,
    "code": "RFQ1762300000000",
    "supplierId": 21,
    "supplierName": "Công ty Cổ phần Dược Hậu Giang",
    "purchaseProposalId": 15,
    "purchaseProposalCode": "PP-20261104-01",
    "status": "SENT",
    "sentAt": "08/11/2026 09:15",
    "expiredAt": "11/11/2026 09:15"
  }
}
```

### 4.3. Khai Báo DTO Java (`SendRfqRequest`)
```java
package com.pharmacy.dto.rfq;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record SendRfqRequest(
    @NotNull(message = "Supplier ID is required")
    Long supplierId,
    @NotNull(message = "Purchase proposal ID is required")
    Long purchaseProposalId,
    @NotBlank(message = "Email subject is required")
    @Size(max = 300, message = "Subject cannot exceed 300 characters")
    String subject,
    @NotBlank(message = "Email content is required")
    @Size(max = 5000, message = "Content cannot exceed 5000 characters")
    String content
) {
}
```

### 4.4. Thuật Toán Service Layer (`RfqServiceImpl.sendRfq` — trích lược)
```java
@Override
@Transactional
public RfqResponse sendRfq(SendRfqRequest request) {
    Supplier supplier = supplierRepository.findById(request.supplierId())
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with ID: " + request.supplierId()));

    if (SupplierStatus.INACTIVE.equals(supplier.getStatus())) {
        throw new IllegalArgumentException(
                "Cannot send RFQ to supplier '" + supplier.getCode() + "': supplier is inactive");
    }

    PurchaseProposal proposal = purchaseProposalRepository.findById(request.purchaseProposalId())
            .orElseThrow(() -> new EntityNotFoundException(
                    "Purchase proposal not found with ID: " + request.purchaseProposalId()));

    if (proposal.getStatus() == null
            || !proposal.getStatus().equals(PurchaseProposalStatus.DRAFT.getCode())) {
        throw new IllegalArgumentException("Chỉ đề xuất chưa chọn nhà cung cấp mới được gửi RFQ");
    }

    LocalDateTime now = LocalDateTime.now();
    boolean hasActiveRfq = rfqRepository
            .findBySupplierIdAndPurchaseProposalId(supplier.getId(), proposal.getId())
            .stream().anyMatch(r -> r.getStatus() == RfqStatus.RESPONDED
                    || (r.getStatus() == RfqStatus.SENT
                        && (r.getExpiredAt() == null || r.getExpiredAt().isAfter(now))));
    if (hasActiveRfq) {
        throw new IllegalArgumentException("RFQ already sent to this supplier for the same purchase proposal");
    }

    String rawToken = UUID.randomUUID().toString().replace("-", "");
    String tokenHash = SecurityUtils.sha256Hex(rawToken);

    Rfq rfq = Rfq.builder()
            .code("RFQ" + System.currentTimeMillis())
            .supplier(supplier)
            .purchaseProposal(proposal)
            .createdBy(getCurrentAccount()).sentBy(getCurrentAccount())
            .tokenHash(tokenHash)
            .expiredAt(now.plusDays(3))
            .subject(request.subject()).content(request.content())
            .status(RfqStatus.SENT).sentAt(now).createdAt(now)
            .build();

    Rfq savedRfq = rfqRepository.save(rfq);

    // Đẩy mọi Purchase Request trong đề xuất sang RFQ_SENT
    for (PurchaseProposalRequest link : proposal.getRequests()) {
        PurchaseRequest pr = link.getPurchaseRequest();
        if (pr != null && !PurchaseRequestStatus.RFQ_SENT.getCode().equals(pr.getStatus())) {
            pr.setStatus(PurchaseRequestStatus.RFQ_SENT.getCode());
            pr.setUpdatedAt(now);
            purchaseRequestRepository.save(pr);
        }
    }

    emailService.sendRfqEmail(savedRfq, supplier, rawToken, frontendUrl); // link token, 3 ngày
    return RfqResponse.fromEntity(savedRfq);
}
```

### 4.5. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.14.1 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Ghi nhật ký khi gửi | `sendRfq` **chưa** gọi `auditLogService.log(...)` | Bổ sung ghi `audit_logs` (đủ POS) |
| 2 | Gửi cho nhiều NCC được chọn | Mỗi lần gọi chỉ gửi cho 1 NCC | FE lặp gọi nhiều lần cho nhiều NCC |
| 3 | Email Subject max length | DTO giới hạn 300 ký tự (mock-up SRS ghi 255) | Thống nhất giới hạn |
| 4 | — | Mã RFQ `RFQ<epoch millis>` (không theo `RFQ-YYYYMMDD-XXXX`) | Cân nhắc format mã thân thiện hơn |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-SRF-01** | Gửi RFQ thành công | NCC `ACTIVE`, đề xuất `DRAFT`, subject/content hợp lệ | HTTP 201, RFQ `status=SENT`, email có link token |
| **TC-SRF-02** | Gửi cho NCC ngừng hoạt động | NCC `INACTIVE` | HTTP 400 "... supplier is inactive" |
| **TC-SRF-03** | Đề xuất không ở DRAFT | Đề xuất đã chọn NCC | HTTP 400 "Chỉ đề xuất chưa chọn nhà cung cấp mới được gửi RFQ" |
| **TC-SRF-04** | Gửi trùng RFQ đang hiệu lực | Đã có RFQ `SENT` chưa hết hạn cho cùng cặp | HTTP 400 "RFQ already sent to this supplier..." |
| **TC-SRF-05** | Gửi lại sau khi hết hạn | RFQ cũ đã `EXPIRED` | Gửi thành công, tạo RFQ mới |
| **TC-SRF-06** | Thiếu subject | `subject = ""` | HTTP 400 "Email subject is required" |
| **TC-SRF-07** | Thiếu content | `content = null` | HTTP 400 "Email content is required" |
| **TC-SRF-08** | Cập nhật Purchase Request | PR trong đề xuất chưa `RFQ_SENT` | PR chuyển sang `RFQ_SENT` |


