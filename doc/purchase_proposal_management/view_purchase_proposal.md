# Đặc Tả Kỹ Thuật: 3.15.2 View Purchase Proposal (Xem Đề Xuất Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC66` (SRS 3.15.2)
- **Tên Use Case**: View Purchase Proposal (Xem danh sách & chi tiết đề xuất mua hàng)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua xem danh sách các Đề xuất mua hàng đã lập và rà soát nội dung chi tiết của một đề xuất được chọn ở **chế độ chỉ đọc (read-only)**: các Yêu cầu mua hàng liên kết, danh mục thuốc tổng hợp, trạng thái phê duyệt và lý do quyết định của Tổng Giám Đốc (nếu có).
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Tồn tại ít nhất một Đề xuất mua hàng trong hệ thống (ngược lại hiển thị danh sách rỗng).
- **Trigger**:
  - TRG-01: Người dùng chọn mục **"Đề xuất mua hàng" (Purchase Proposals)** trên menu điều hướng → route `/procurement/proposals`.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Danh sách đề xuất và/hoặc chi tiết đề xuất được chọn hiển thị ở chế độ chỉ đọc.
  - POS-02: Không có dữ liệu nào bị sửa đổi.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua chọn **"Đề xuất mua hàng"** từ menu điều hướng (`/procurement/proposals`).
2. Hệ thống gọi `GET /api/v1/purchase-proposals` (mặc định `page=0`, `size=10`, `sort=id DESC`) và hiển thị danh sách phân trang gồm: Mã đề xuất, Yêu cầu mua hàng liên kết, Trạng thái, Ngày lập.
3. Nhân viên thu mua tìm kiếm theo mã đề xuất/mã PR (`search`) và/hoặc lọc theo trạng thái (`status`).
4. Hệ thống áp dụng điều kiện lọc (`findAllWithFilters`) và làm mới danh sách.
5. Nhân viên thu mua bấm icon **Xem** trên dòng đề xuất → `GET /api/v1/purchase-proposals/{id}`.
6. Hệ thống hiển thị modal chi tiết chỉ đọc (`PurchaseProposalDetailModal.jsx`): mã đề xuất, trạng thái, ngày lập, các Yêu cầu mua hàng liên kết, danh sách thuốc tổng hợp (tên, mã, ĐVT, số lượng), lý do từ chối (nếu có), người lập/ngày lập.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT1 - Hủy/thoát**: Người dùng đóng modal hoặc rời trang → không thay đổi dữ liệu.
- **A1 - Danh sách rỗng**: Không có đề xuất nào (hoặc bộ lọc không khớp) → hiển thị trạng thái rỗng.
- **A2 - Không tìm thấy đề xuất theo ID**: `GET /{id}` với ID không tồn tại → HTTP 404; modal hiển thị *"Không có dữ liệu đề xuất"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Chỉ đọc)**: Chi tiết Đề xuất mua hàng ở use case này là **read-only**, không sửa đổi dữ liệu.
- **BR-02 (Phân trang phía Server)**: Danh sách luôn được phân trang và đếm tổng số bản ghi tại tầng CSDL (`Pageable`).
- **BR-03 (Tìm kiếm)**: `search` áp dụng cho mã đề xuất và mã Yêu cầu mua hàng liên kết (tìm tương đối, không phân biệt hoa thường).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

Màn hình chính: `PurchaseProposalsPage.jsx` (route `/procurement/proposals`) gồm: **Thanh hành động + Bộ lọc** → **Bảng dữ liệu** → **Phân trang**, kèm Modal chi tiết.

### 3.1. Bộ Lọc & Hành Động
| STT | Thành phần | Loại điều khiển | Bắt buộc | Mô tả |
| :--: | :--- | :--- | :--: | :--- |
| 1 | Search | Text | Không | Tìm theo mã đề xuất hoặc mã Yêu cầu mua hàng |
| 2 | Status | Dropdown | Không | Lọc theo trạng thái đề xuất |
| 3 | Nút "Tạo Đề Xuất Mua Hàng" | Button (Primary) | — | Mở modal tạo mới (UC65) |

### 3.2. Bảng Danh Sách Đề Xuất
| STT | Cột hiển thị | Trường dữ liệu | Ghi chú |
| :--: | :--- | :--- | :--- |
| 1 | STT | `page*size + idx + 1` | — |
| 2 | Mã Đề Xuất | `code` | Mono |
| 3 | Yêu Cầu Mua Hàng Liên Kết | `purchaseRequests[].code` | Nối bằng dấu phẩy (hoặc `—`) |
| 4 | Trạng Thái | `status` / `statusText` | Badge màu theo trạng thái |
| 5 | Ngày Lập | `createdAt` | Định dạng `dd/MM/yyyy` |
| 6 | Thao Tác | — | Icon **Tạo RFQ** (khi `status === 0`) + Icon **Xem** |

**Badge trạng thái** (`PurchaseProposalDetailModal.renderStatusBadge`):
| `status` | Nhãn |
| :--: | :--- |
| 0 | Đã lập đề xuất (info) |
| 1 | Chờ phê duyệt (warning) |
| 2 | Đã phê duyệt (success) |
| 3 | Đã từ chối (danger) |
| 4 | Nhập một phần (info) |
| 5 | Hoàn tất (success) |
| 6 | Đã hủy (danger) |

### 3.3. Modal Chi Tiết (`PurchaseProposalDetailModal.jsx`)
Tiêu đề: *"Chi Tiết Đề Xuất Mua Hàng — {code}"*.
| STT | Thành phần | Chi tiết |
| :--: | :--- | :--- |
| 1 | Thẻ tóm tắt (3 ô) | Mã Đề Xuất, Trạng Thái (badge), Ngày Lập |
| 2 | Yêu Cầu Mua Hàng Liên Kết | Danh sách mã PR (hoặc `—`) |
| 3 | Danh Sách Thuốc & Sản Phẩm Tổng Hợp | Bảng: Tên thuốc, Mã thuốc, ĐVT, Số lượng |
| 4 | Lý Do Từ Chối | Chỉ hiển thị khi có `rejectReason` |
| 5 | Người Lập / Ngày Lập | `createdByUsername` / `createdAt` |
| 6 | Nút Đóng | Button (Secondary) |

> **Trạng thái rỗng/tải**: spin + *"Đang tải chi tiết đề xuất mua hàng…"*; nếu không có dữ liệu → *"Không có dữ liệu đề xuất"*.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract — Danh sách đề xuất
- **Endpoint**: `GET /api/v1/purchase-proposals`
- **Handler**: `PurchaseProposalController.getPurchaseProposals(@RequestParam String search, @RequestParam Short status, Pageable)`
- **Mức độ truy cập**: `Purchasing Staff`

#### Query Parameters:
| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :--: | :--- | :--- |
| `search` | String | Không | `null` | Tìm theo mã đề xuất hoặc mã PR liên kết |
| `status` | Short | Không | `null` | Lọc theo `PurchaseProposalStatus` |
| `page` | int | Không | `0` | Trang hiện tại (0-based) |
| `size` | int | Không | `10` | Số bản ghi mỗi trang |
| `sort` | String | Không | `id` | Trường sắp xếp |
| `direction` | String | Không | `DESC` | Chiều sắp xếp |

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Purchase proposals retrieved successfully",
  "data": {
    "content": [
      {
        "id": 15,
        "code": "PP-20261108-0001",
        "status": 1,
        "statusText": "Chờ phê duyệt",
        "createdByUsername": "purchasing01",
        "createdAt": "2026-11-08T09:15:00",
        "purchaseRequests": [ { "id": 12, "code": "PR-20261101-0007", "status": 1 } ],
        "supplierName": "Công ty Cổ phần Dược Hậu Giang"
      }
    ],
    "page": 0, "size": 10, "totalElements": 24, "totalPages": 3, "last": false
  }
}
```

### 4.2. RESTful API Contract — Chi tiết đề xuất
- **Endpoint**: `GET /api/v1/purchase-proposals/{id}`
- **Handler**: `PurchaseProposalController.getPurchaseProposalDetail(@PathVariable Long id)`
- **Mức độ truy cập**: `Purchasing Staff`

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Purchase proposal details retrieved successfully",
  "data": {
    "id": 15,
    "code": "PP-20261108-0001",
    "status": 0,
    "statusText": "Đã lập đề xuất",
    "createdById": 4,
    "createdByUsername": "purchasing01",
    "createdAt": "2026-11-08T09:15:00",
    "approvedAt": null,
    "rejectReason": null,
    "supplierQuotationId": null,
    "supplierId": null,
    "supplierName": null,
    "purchaseRequests": [
      { "id": 12, "code": "PR-20261101-0007", "status": 1, "statusText": "Đã gửi", "createdAt": "2026-11-01T08:00:00" }
    ],
    "items": [
      { "productId": 101, "productCode": "SP0001", "productName": "Paracetamol 500mg", "unit": "Hộp", "quantity": 200 }
    ]
  }
}
```

> Ghi chú: `items` là **danh mục tổng hợp** (đã cộng dồn theo sản phẩm).

### 4.3. DTO Java (`PurchaseProposalResponse`)
```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PurchaseProposalResponse {
    private Long id;
    private String code;
    private List<ProposalRequestDto> purchaseRequests;   // các PR liên kết
    private List<ProposalItemDto> items;                 // danh mục tổng hợp
    private Short status;
    private String statusText;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String rejectReason;
    private Long supplierQuotationId;
    private Long supplierId;
    private String supplierName;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProposalRequestDto {
        private Long id; private String code; private Short status;
        private String statusText; private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProposalItemDto {
        private Long productId; private String productCode; private String productName;
        private String unit; private Integer quantity;
    }

    public static PurchaseProposalResponse fromEntity(PurchaseProposal pp) { /* map entity -> DTO */ }
}
```

### 4.4. Thuật Toán Service Layer (`PurchaseProposalServiceImpl`)
```java
@Override
public Page<PurchaseProposalResponse> getPurchaseProposals(String search, Short status, Pageable pageable) {
    Page<PurchaseProposal> page = purchaseProposalRepository.findAllWithFilters(
            (search != null && !search.trim().isEmpty()) ? search.trim() : null,
            status, pageable);
    return page.map(PurchaseProposalResponse::fromEntity);
}

@Override
public PurchaseProposalResponse getPurchaseProposalDetail(Long id) {
    PurchaseProposal pp = purchaseProposalRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase proposal not found with ID: " + id));
    return PurchaseProposalResponse.fromEntity(pp);
}
```

> Truy vấn `findAllWithFilters` lọc theo `code` (mã đề xuất) **hoặc** `code` của Yêu cầu mua hàng liên kết, kết hợp `status`; `findByIdWithRelations` nạp kèm `createdBy`/`approvedBy`.

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện lọc & tìm kiếm | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-VPP-01** | Lấy danh sách mặc định trang đầu | `page=0`, `size=10` | 10 bản ghi mới nhất, `totalElements` đúng |
| **TC-VPP-02** | Tìm theo mã đề xuất | `search="PP-2026"` | Trả các đề xuất khớp mã |
| **TC-VPP-03** | Tìm theo mã Yêu cầu mua hàng | `search="PR-20261101"` | Trả đề xuất có PR liên kết khớp |
| **TC-VPP-04** | Lọc theo trạng thái | `status=1` (Chờ phê duyệt) | Chỉ trả đề xuất `PENDING_APPROVAL` |
| **TC-VPP-05** | Chuyển trang | Bấm Next sang trang 2 | Trả 10 bản ghi của trang 2, `page=1` |
| **TC-VPP-06** | Xem chi tiết đề xuất hợp lệ | `GET /{id}` | HTTP 200, có PR liên kết + items + trạng thái |
| **TC-VPP-07** | Đề xuất không tồn tại | `id=999` | HTTP 404 "Purchase proposal not found with ID: 999" |
| **TC-VPP-08** | Danh sách rỗng | Bộ lọc không khớp | `content: []`, hiển thị empty state |
| **TC-VPP-09** | Chi tiết chỉ đọc | Mở modal chi tiết | Không có nút sửa/xóa dữ liệu đề xuất |
| **TC-VPP-10** | Hiển thị lý do từ chối | Đề xuất `status=3` có `rejectReason` | Khối "Lý Do Từ Chối" hiển thị đúng nội dung |


