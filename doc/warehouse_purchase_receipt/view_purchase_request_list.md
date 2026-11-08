# Đặc Tả Kỹ Thuật: 3.12.3 View Purchase Request List (Danh Sách Yêu Cầu Mua Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC55` (SRS 3.12.3)
- **Tên Use Case**: View Purchase Request List (Xem danh sách yêu cầu mua hàng)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua duyệt, tìm kiếm và lọc danh sách các Yêu cầu mua hàng (Purchase Request) do Quản lý kho lập, nhằm chuẩn bị cho quá trình tìm nguồn cung (sourcing). Danh sách hiển thị dạng bảng phân trang, sắp xếp mới nhất trước; bấm vào một dòng để mở chi tiết.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập thành công vào hệ thống (vai trò `Purchasing Staff`).
  - PRE-02: Hệ thống kết nối được với cơ sở dữ liệu.
- **Trigger**:
  - TRG-01: Người dùng chọn mục **"Yêu cầu mua hàng" (Purchase Requests)** trên menu điều hướng chính.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Danh sách Yêu cầu mua hàng (đã lọc/phân trang) được hiển thị.
  - POS-02: Không có dữ liệu nào bị sửa đổi.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua chọn **"Yêu cầu mua hàng"** từ menu điều hướng chính.
2. Hệ thống gọi `GET /api/v1/purchase-requests` với tham số mặc định (`page=0`, `size=10`, `sort=id DESC`) và hiển thị bảng phân trang:
   - Mã Yêu Cầu (`code`), Số Mặt Hàng (`itemCount`), Trạng Thái (`status`/`statusText`), Ngày Lập (`createdAt`), Người Tạo (`createdByUsername`), Thao tác (Xem).
3. Nhân viên thu mua nhập từ khóa và/hoặc chọn bộ lọc (trạng thái, khoảng ngày, mức ưu tiên theo SRS).
4. Hệ thống áp dụng điều kiện lọc (`findAllWithFilters`) và làm mới danh sách.
5. Nhân viên thu mua bấm icon **Xem** trên một dòng → mở chi tiết Yêu cầu mua hàng (chuyển sang UC56).
6. Nhân viên thu mua di chuyển giữa các trang bằng thanh phân trang (mặc định 10 bản ghi/trang).

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT01 - Bộ lọc/tìm kiếm không hợp lệ**: Hệ thống hiển thị cảnh báo và giữ nguyên dữ liệu nhập để người dùng chỉnh sửa.
- **AT02 - Người dùng hủy/thoát**: Hủy thao tác, quay về màn hình danh sách.
- **A1 - Không có kết quả**: Khi bộ lọc/từ khóa không khớp bản ghi nào → hiển thị trạng thái rỗng *"Không tìm thấy yêu cầu mua hàng nào."*

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Phạm vi hiển thị)**: Chỉ các Yêu cầu mua hàng đã ở trạng thái `SUBMITTED` (Chờ duyệt) hoặc các trạng thái sourcing muộn hơn mới hiển thị cho Nhân viên thu mua. PR nháp/đã hủy (`CANCELLED`) bị ẩn.
- **BR-02 (Sắp xếp & phân trang mặc định)**: Sắp xếp mặc định theo Ngày lập **giảm dần**; kích thước trang mặc định **10 bản ghi**.
- **BR-03 (Session hợp lệ)**: Mọi thao tác phải nằm trong phiên đăng nhập được cấp quyền.
- **BR-04 (Nhật ký kiểm toán)**: Mọi thao tác/thực thi phải sinh bản ghi `audit_logs` bất biến kèm người dùng/thời gian.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

Màn hình chính: `WarehousePurchaseRequestsPage.jsx` gồm: **Thanh hành động + Bộ lọc** → **Bảng dữ liệu** → **Phân trang**, kèm Modal chi tiết.

### 3.1. Bộ Lọc & Hành Động (theo SRS 3.12.3)
| STT | Field Name | Loại điều khiển | Bắt buộc | Max Length | Mô tả |
| :--: | :--- | :--- | :--: | :--: | :--- |
| 1 | Search | Text | Không | 100 | Từ khóa: mã PR hoặc tên thuốc |
| 2 | Date Range | Date picker | Không | — | Lọc PR theo ngày lập (từ – đến) |
| 3 | Status | Dropdown | Không | — | Lọc theo trạng thái (Chờ duyệt, Đang chào giá RFQ, Đã lập đề xuất…) |
| 4 | Priority | Dropdown | Không | — | Lọc theo mức ưu tiên (High / Medium / Low) |
| 5 | PR Table | Grid | — | — | Bảng danh sách PR, mới nhất trước |
| 6 | Pagination | Control | — | — | Phân trang, mặc định 10 bản ghi/trang |

### 3.2. Bảng Danh Sách Yêu Cầu Mua Hàng (`WarehousePurchaseRequestsPage.jsx`)
| STT | Cột hiển thị | Trường dữ liệu | Ghi chú |
| :--: | :--- | :--- | :--- |
| 1 | # | `page*size + i + 1` | — |
| 2 | Mã Yêu Cầu | `code` | Mono, đậm |
| 3 | Số Mặt Hàng | `itemCount` | Badge *"X mặt hàng"* |
| 4 | Trạng Thái | `status` / `statusText` | Badge màu theo trạng thái |
| 5 | Ngày Lập | `createdAt` | Định dạng `dd/MM/yyyy` |
| 6 | Người Tạo | `createdByUsername` | Hoặc `—` |
| 7 | Thao Tác | — | Icon **Xem** (mở chi tiết) |

### 3.3. Badge Trạng Thái Yêu Cầu Mua Hàng (`getPrStatusBadge`)
| `status` | Nhãn hiển thị | Màu |
| :--: | :--- | :--- |
| 1 | Chờ duyệt (Đã gửi duyệt) | warning |
| 2 | Đang chào giá RFQ | info |
| 3 | Đã lập đề xuất | info |
| 4 | Đã duyệt đơn PO (Hoàn tất) | success |
| 5 | Đã hủy | danger |

> **Trạng thái rỗng**: *"Không tìm thấy yêu cầu mua hàng nào."*; **Đang tải**: spin + *"Đang tải danh sách yêu cầu mua hàng…"*. Bấm vào dòng hoặc icon Xem để mở chi tiết (UC56).

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `GET /api/v1/purchase-requests`
- **Handler**: `PurchaseRequestController.viewPurchaseRequestList(@RequestParam(name="search") String search, @RequestParam(name="status") Short status, @PageableDefault(page=0, size=10, sort="id", direction=DESC) Pageable pageable)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `200 OK`

#### Query Parameters:
| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :--: | :--- | :--- |
| `search` | String | Không | `null` | Từ khóa khớp mã PR hoặc lý do (`code` / `reason`) |
| `status` | Short | Không | `null` | Lọc theo `PurchaseRequestStatus` |
| `page` | int | Không | `0` | Trang hiện tại (0-based) |
| `size` | int | Không | `10` | Số bản ghi mỗi trang |
| `sort` | String | Không | `id` | Trường sắp xếp |
| `direction` | String | Không | `DESC` | Chiều sắp xếp |

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Purchase requests retrieved successfully",
  "data": {
    "content": [
      {
        "id": 12,
        "code": "PR-20261101-0007",
        "createdByUsername": "warehouse01",
        "status": 1,
        "statusText": "Đã gửi duyệt",
        "reason": "Bổ sung tồn kho Paracetamol theo định mức tháng",
        "createdAt": "2026-11-01T08:00:00",
        "approvedAt": null,
        "items": [],
        "itemCount": 3
      }
    ],
    "page": 0, "size": 10, "totalElements": 42, "totalPages": 5, "last": false
  }
}
```
> Ghi chú: ở endpoint danh sách, `items` rỗng và `itemCount` phản ánh số mặt hàng.

### 4.2. DTO Java (`PurchaseRequestResponse`)
```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PurchaseRequestResponse {
    private Long id;
    private String code;
    private String createdByUsername;
    private Short status;              // 1 submitted, 2 RFQ sent, 3 proposal created, 4 completed, 5 cancelled
    private String statusText;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<PurchaseRequestItemDto> items;
    private Integer itemCount;

    public static PurchaseRequestResponse fromEntity(PurchaseRequest pr) {
        if (pr == null) return null;
        return PurchaseRequestResponse.builder()
                .id(pr.getId())
                .code(pr.getCode())
                .createdByUsername(pr.getCreatedBy() != null ? pr.getCreatedBy().getUsername() : "Warehouse Staff")
                .status(pr.getStatus())
                .statusText(PurchaseRequestStatus.resolveText(pr.getStatus()))
                .reason(pr.getReason())
                .createdAt(pr.getCreatedAt())
                .approvedAt(pr.getApprovedAt())
                .items(List.of())
                .itemCount(pr.getDetails() != null ? pr.getDetails().size() : 0)
                .build();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PurchaseRequestItemDto {
        private Long id;
        private Long productId;
        private String productCode;
        private String productName;
        private String unit;
        private Integer requestedQuantity;
        private String note;
        // ... toItemDto / toItemDtoList ...
    }
}
```

### 4.3. Thuật Toán Service Layer (`PurchaseRequestServiceImpl`)
```java
@Override
public Page<PurchaseRequestResponse> getPurchaseRequests(Pageable pageable, String search, Short status) {
    return purchaseRequestRepository.findAllWithFilters(search, status, pageable)
            .map(PurchaseRequestResponse::fromEntity);
}
```

#### Truy vấn lọc động (`PurchaseRequestRepository.findAllWithFilters`):
```java
@Query(value = "SELECT pr FROM PurchaseRequest pr " +
        "LEFT JOIN FETCH pr.createdBy cb " +
        "WHERE (:search IS NULL OR :search = '' OR " +
        "       LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "       LOWER(pr.reason) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "AND (:status IS NULL OR pr.status = :status)",
        countQuery = "SELECT count(pr) FROM PurchaseRequest pr " +
        "WHERE (:search IS NULL OR :search = '' OR " +
        "       LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "       LOWER(pr.reason) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "AND (:status IS NULL OR pr.status = :status)")
Page<PurchaseRequest> findAllWithFilters(@Param("search") String search,
                                         @Param("status") Short status,
                                         Pageable pageable);
```

> `search` khớp `code` **hoặc** `reason` (không phân biệt hoa thường); `status` lọc chính xác theo mã trạng thái; phân trang & đếm tổng thực hiện tại tầng CSDL.

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện lọc & tìm kiếm | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-VPRL-01** | Danh sách mặc định trang đầu | `page=0`, `size=10` | 10 bản ghi mới nhất, `totalElements` đúng |
| **TC-VPRL-02** | Tìm theo mã PR | `search="PR-20261101"` | Trả các PR khớp mã |
| **TC-VPRL-03** | Tìm theo lý do | `search="Paracetamol"` | Trả các PR có `reason` chứa từ khóa |
| **TC-VPRL-04** | Lọc theo trạng thái | `status=1` (Đã gửi duyệt) | Chỉ trả PR `SUBMITTED` |
| **TC-VPRL-05** | Chuyển trang | Bấm Next sang trang 2 | Trả 10 bản ghi của trang 2, `page=1` |
| **TC-VPRL-06** | Số mặt hàng hiển thị | PR có 3 dòng chi tiết | Cột "Số Mặt Hàng" = 3 |
| **TC-VPRL-07** | Không có kết quả | Bộ lọc không khớp | `content: []`, `totalElements: 0`, hiển thị empty state |
| **TC-VPRL-08** | Mặc định sắp xếp | Không truyền `sort` | Danh sách sắp giảm dần theo `id`/`createdAt` |
| **TC-VPRL-09** | Mở chi tiết từ danh sách | Bấm icon Xem | Mở modal chi tiết (UC56) với đúng PR |


