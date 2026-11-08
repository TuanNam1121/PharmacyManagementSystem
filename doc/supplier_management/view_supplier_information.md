# Đặc Tả Kỹ Thuật: 3.13.2 View Supplier Information (Tra Cứu Danh Bạ & Hồ Sơ Nhà Cung Cấp)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC58` (SRS 3.13.2)
- **Tên Use Case**: View Supplier Information (Xem thông tin / tra cứu nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua tìm kiếm và xem danh bạ nhà cung cấp (bao gồm thông tin liên hệ và hồ sơ năng lực phân phối dược phẩm đã đăng ký), đồng thời xem hồ sơ chi tiết của một nhà cung cấp được chọn. Đây là use case **chỉ đọc (read-only)**, không làm thay đổi dữ liệu.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
- **Trigger**:
  - TRG-01: Người dùng chọn mục **"Nhà cung cấp" (Suppliers)** từ menu điều hướng chính → route `/supplier`.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Danh sách nhà cung cấp và/hoặc hồ sơ chi tiết nhà cung cấp được chọn hiển thị trên màn hình.
  - POS-02: Không có dữ liệu nào bị sửa đổi.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính — Xem danh sách (Main Flow: List)
1. Nhân viên thu mua chọn mục **"Nhà cung cấp"** từ menu điều hướng (`/supplier`).
2. Hệ thống gọi API `GET /api/v1/supplier` với tham số mặc định (`page=0`, `size=10`, `sort=id`, `direction=DESC`) và hiển thị danh sách được phân trang (Mã NCC, Tên, Người liên hệ, SĐT, Email, Trạng thái).
3. Nhân viên thu mua tìm kiếm theo tên/mã/người liên hệ/SĐT (`keyword`) và/hoặc lọc theo trạng thái (`status`).
4. Hệ thống áp dụng điều kiện lọc và làm mới danh sách (`SupplierFilters` → `useSuppliers.fetchList`).

### 2.2. Luồng phụ — Xem chi tiết (Detail Flow)
5. Nhân viên thu mua bấm icon **Xem chi tiết (Con mắt)** trên dòng nhà cung cấp hoặc bấm vào dòng trong bảng.
6. Hệ thống gọi `GET /api/v1/supplier/{id}` và hiển thị Modal hồ sơ chi tiết (`SupplierDetailModal.jsx`) gồm: thông tin chung, thông tin liên hệ, địa chỉ trụ sở, ghi chú mua hàng nội bộ, trạng thái, và (nếu có) lý do ngừng hoạt động.

### 2.3. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Không tìm thấy kết quả**: Nếu từ khóa/bộ lọc không khớp bản ghi nào, bảng hiển thị trạng thái rỗng: *"Không tìm thấy nhà cung cấp nào"* kèm dòng phụ *"Không có bản ghi nào khớp với điều kiện tìm kiếm hoặc trạng thái đã chọn."*
- **A2 - Không tìm thấy nhà cung cấp theo ID**: `GET /api/v1/supplier/{id}` với ID không tồn tại → `EntityNotFoundException` → HTTP **404** *"Supplier not found with id: {id}"*; modal hiển thị *"Không tìm thấy thông tin nhà cung cấp"*.
- **A3 - Nhà cung cấp đã ngừng hoạt động**: Bản ghi `INACTIVE` vẫn hiển thị trong danh sách kèm badge **"Ngừng hoạt động"**, nhưng bị loại khỏi danh sách chọn của RFQ mới; nút Chỉnh sửa/Xóa bị ẩn.

### 2.4. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Hiển thị NCC ngừng hoạt động)**: Nhà cung cấp `INACTIVE` hiển thị kèm badge "Inactive" và bị loại khỏi lựa chọn trong RFQ mới, nhưng vẫn xem được để phục vụ tra cứu lịch sử/kiểm toán.
- **BR-02 (Phân trang phía Server)**: Không tải toàn bộ danh bạ về client. Luôn phân trang và đếm tổng số bản ghi tại tầng CSDL (`Spring Data JPA Pageable` → `SQL Server OFFSET / FETCH NEXT`).
- **BR-03 (Chỉ đọc)**: Use case này không tạo/sửa/xóa dữ liệu.
- **BR-04 (Tìm kiếm)**: Từ khóa `keyword` áp dụng cho tên nhà cung cấp (tìm tương đối, không phân biệt hoa thường).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

Màn hình chính: `SupplierPage.jsx` (route `/supplier`) gồm 4 vùng: **Stats Grid** → **Filters Bar** → **Data Table** → **Pagination**, kèm các Modal.

### 3.1. Vùng Thẻ KPI (`SupplierStats.jsx`)
| # | Thẻ KPI | Nguồn dữ liệu | Mô tả |
| :--: | :--- | :--- | :--- |
| 1 | **Tổng Nhà Cung Cấp** | `total` từ `GET /api/v1/supplier/stats` | Số đối tác trong hệ thống |
| 2 | **Đang Hợp Tác** | `active` từ `GET /api/v1/supplier/stats` | Sẵn sàng giao dịch |
| 3 | **Tạm Ngừng** | `inactive` từ `GET /api/v1/supplier/stats` | Tạm ngưng hoặc khóa |
| 4 | **Đầy Đủ MST** | `withTaxCode` từ `GET /api/v1/supplier/stats` | Đã xác thực mã số thuế |

> **Cách lấy số liệu**: `SupplierPage.jsx` gọi `GET /api/v1/supplier/stats` khi mở trang (và gọi lại sau mỗi thao tác tạo / cập nhật / ngừng hoạt động) để lấy số liệu **đếm toàn hệ thống** — không phụ thuộc phân trang hay bộ lọc đang chọn. Nếu API thống kê gặp lỗi, `SupplierStats.jsx` tự fallback sang đếm cục bộ theo `status` (`ACTIVE`/`INACTIVE`) và `taxCode` của trang hiện tại.
> API còn trả sẵn trường `pending` (NCC `PENDING` — chờ duyệt) để dùng khi bổ sung thẻ KPI thứ 5.

### 3.2. Bảng Điều Khiển Bộ Lọc (`SupplierFilters.jsx`)
| STT | Field Name | Loại điều khiển | Bắt buộc | Max Length | Mô tả |
| :--: | :--- | :--- | :--: | :--: | :--- |
| 1 | Search | Text | Không | 100 | Tìm theo tên NCC, mã, người liên hệ, SĐT. Placeholder: *"Tìm theo tên nhà cung cấp, mã, người liên hệ, SĐT…"* |
| 2 | Status | Dropdown | Không | — | Lọc theo trạng thái: `Tất cả` (rỗng) / `Hoạt động` (ACTIVE) / `Ngừng hoạt động` (INACTIVE) / `Chờ duyệt` (PENDING) |
| 3 | Results Count | Label | — | — | *"Tìm thấy **X** nhà cung cấp"* |
| 4 | Add Supplier | Button (Primary) | — | — | Nhãn **"Thêm Nhà Cung Cấp"** — mở form đăng ký (UC57) |

### 3.3. Bảng Danh Sách Nhà Cung Cấp (`SupplierTable.jsx`)
| STT | Cột hiển thị | Trường dữ liệu | Ghi chú |
| :--: | :--- | :--- | :--- |
| 1 | `#` | STT | `page * size + i + 1` |
| 2 | Nhà Cung Cấp / Đối Tác | `name`, `code` | Avatar chữ cái đầu (`getInitials`) + tên + badge mã NCC |
| 3 | Người Liên Hệ | `contactPerson` | — |
| 4 | Thông Tin Liên Lạc | `phone`, `email` | Cột kết hợp SĐT và Email |
| 5 | Mã Số Thuế | `taxCode` | — |
| 6 | Trạng Thái | `status` | Badge: **Hoạt động** (xanh), **Chờ duyệt** (vàng), **Ngừng hoạt động** (đỏ/xám) |
| 7 | Ngày Tạo | `createdAt` | Định dạng `dd/MM/yyyy` |
| 8 | Thao Tác | — | Icon **Xem** (luôn có); **Sửa** & **Xóa** chỉ hiện với NCC `ACTIVE` |

> **Trạng thái rỗng (Empty state)**: tiêu đề *"Không tìm thấy nhà cung cấp nào"* + mô tả; **Trạng thái tải (Loading)**: spinner + *"Đang tải danh bạ nhà cung cấp…"*.

### 3.4. Modal Hồ Sơ Chi Tiết (`SupplierDetailModal.jsx`)
| # | Thành phần | Chi tiết |
| :--: | :--- | :--- |
| 1 | Tiêu đề | *"Hồ Sơ Chi Tiết Nhà Cung Cấp"* |
| 2 | Banner đối tác | Avatar + Tên NCC + Badge trạng thái |
| 3 | Khối thông tin | Người liên hệ, SĐT, Email, Mã số thuế, Mã NCC |
| 4 | Địa chỉ trụ sở | `address` (hoặc *"Chưa cập nhật địa chỉ trụ sở."*) |
| 5 | Ghi chú mua hàng | `note` (nếu có) |
| 6 | Lý do ngừng hoạt động | `deleteReason` (chỉ hiển thị khi NCC `INACTIVE`) |
| 7 | Nút Đóng | Button (Secondary) |
| 8 | Nút Chỉnh sửa | Button (Primary) — chỉ hiện khi NCC đang `ACTIVE` (dẫn sang UC59) |

### 3.5. Thanh Phân Trang
- Hiển thị nút Prev/Next cùng dãy số trang (tối đa 7 nút + dấu `…`).
- Ẩn hoàn toàn khi `total <= size`.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract — Danh sách nhà cung cấp
- **Endpoint**: `GET /api/v1/supplier`
- **Handler**: `SupplierController.viewSupplierList(@RequestParam keyword, @RequestParam status, @PageableDefault(sort = "id", direction = DESC) Pageable)`
- **Mức độ truy cập**: `Purchasing Staff`

#### Query Parameters:
| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :--: | :--- | :--- |
| `keyword` | String | Không | `null` | Tìm theo tên nhà cung cấp (chứa, không phân biệt hoa thường) |
| `status` | `SupplierStatus` | Không | `null` | Lọc theo `ACTIVE` / `INACTIVE` / `PENDING` |
| `page` | int | Không | `0` | Trang hiện tại (0-based) |
| `size` | int | Không | `10` | Số bản ghi mỗi trang |
| `sort` | String | Không | `id` | Trường sắp xếp |
| `direction` | String | Không | `DESC` | Chiều sắp xếp |

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Suppliers retrieved successfully",
  "data": {
    "content": [
      {
        "id": 21,
        "code": "SUP-DHG",
        "name": "Công ty Cổ phần Dược Hậu Giang",
        "contactPerson": "Nguyễn Văn An",
        "phone": "02923891234",
        "taxCode": "1800156123",
        "status": "ACTIVE",
        "createdAt": "08/11/2026"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 21,
    "totalPages": 3,
    "last": false
  }
}
```

### 4.2. RESTful API Contract — Chi tiết nhà cung cấp
- **Endpoint**: `GET /api/v1/supplier/{id}`
- **Handler**: `SupplierController.viewSupplierDetail(@PathVariable Long id)`
- **Mức độ truy cập**: `Purchasing Staff`

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Supplier details retrieved successfully",
  "data": {
    "id": 21,
    "code": "SUP-DHG",
    "name": "Công ty Cổ phần Dược Hậu Giang",
    "contactPerson": "Nguyễn Văn An",
    "phone": "02923891234",
    "email": "orders@dhgpharma.com.vn",
    "address": "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
    "taxCode": "1800156123",
    "note": "Điều khoản thanh toán Net 30.",
    "deleteReason": null,
    "status": "ACTIVE",
    "createdAt": "08/11/2026"
  }
}
```

#### Response khi không tìm thấy (HTTP 404 Not Found):
```json
{
  "status": 404,
  "message": "Supplier not found with id: 999",
  "data": null
}
```
> Controller xử lý qua `@ExceptionHandler(EntityNotFoundException.class)` → HTTP 404.

### 4.3. Khai Báo DTO Java (`SupplierResponse`)
> Là Java `record` bất biến, cung cấp 5 factory method tương ứng 5 nghiệp vụ. Danh sách dùng `fromEntityToList` (gọn), chi tiết dùng `fromEntityToDetail` (đầy đủ). `createdAt` được format `dd/MM/yyyy`.

```java
package com.pharmacy.dto.supplier;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.enums.SupplierStatus;
import lombok.Builder;

@Builder
public record SupplierResponse(
        Long id, String code, String name, String contactPerson, String phone,
        String email, String address, String taxCode, String note,
        String deleteReason, SupplierStatus status, String createdAt) {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public static SupplierResponse fromEntityToList(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .taxCode(supplier.getTaxCode())
                .status(supplier.getStatus())
                .createdAt(convertLocalDateTime(supplier.getCreatedAt()))
                .build();
    }

    public static SupplierResponse fromEntityToDetail(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .taxCode(supplier.getTaxCode())
                .note(supplier.getNote())
                .deleteReason(supplier.getDeleteReason())
                .status(supplier.getStatus())
                .createdAt(convertLocalDateTime(supplier.getCreatedAt()))
                .build();
    }

    private static String convertLocalDateTime(LocalDateTime time) {
        return time == null ? null : time.format(DATE_FORMATTER);
    }
}
```

### 4.4. Thuật Toán Service Layer (`SupplierServiceImpl`)
```java
@Override
public Page<SupplierResponse> viewSupplierList(String keyword, SupplierStatus status, Pageable pageable) {
    boolean hasKeyword = StringUtils.hasText(keyword);
    boolean hasStatus  = (status != null);
    int state = (hasKeyword ? 1 : 0) | (hasStatus ? 2 : 0);

    Page<Supplier> page;
    switch (state) {
        case 1:  page = supplierRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable); break;
        case 2:  page = supplierRepository.findByStatus(status, pageable); break;
        case 3:  page = supplierRepository.findByNameContainingIgnoreCaseAndStatus(keyword.trim(), status, pageable); break;
        default: page = supplierRepository.findAll(pageable);
    }
    return page.map(SupplierResponse::fromEntityToList);
}

@Override
public SupplierResponse viewSupplierDetail(Long id) {
    if (id == null)
        throw new IllegalArgumentException("Invalid request to view supplier details");
    return supplierRepository.findById(id)
            .map(SupplierResponse::fromEntityToDetail)
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
}
```

#### Bảng chọn truy vấn động (theo `state` bit-mask):
| `keyword` | `status` | `state` | Repository method |
| :--: | :--: | :--: | :--- |
| ✗ | ✗ | 0 | `findAll(pageable)` |
| ✓ | ✗ | 1 | `findByNameContainingIgnoreCase(keyword, pageable)` |
| ✗ | ✓ | 2 | `findByStatus(status, pageable)` |
| ✓ | ✓ | 3 | `findByNameContainingIgnoreCaseAndStatus(keyword, status, pageable)` |

### 4.5. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.13.2 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Tìm kiếm theo **tên, mã, mã số thuế hoặc catalog thuốc** | Service chỉ tìm theo **tên** (`findByNameContainingIgnoreCase`) | Bổ sung tìm theo `code`/`taxCode` (dùng `Specification` hoặc `@Query` OR) |
| 2 | Hồ sơ chi tiết hiển thị **Payment Terms, Catalog/khả năng phân phối, lịch sử RFQ/báo giá/PO** | `SupplierResponse` chưa gồm các khối này | Bổ sung DTO tổng hợp hoặc gọi API RFQ/PO riêng khi mở chi tiết |
| 3 | SRS chỉ mô tả status Active/Inactive | Enum có thêm `PENDING` | Đồng bộ nhãn dropdown `Chờ duyệt` |

### 4.6. RESTful API Contract — Thống kê KPI nhà cung cấp
- **Endpoint**: `GET /api/v1/supplier/stats`
- **Handler**: `SupplierController.viewSupplierStatistics()`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mục đích**: Trả số liệu KPI cho vùng thẻ `SupplierStats.jsx`; đếm **toàn hệ thống** bằng truy vấn `COUNT` nên không phụ thuộc `page`/`size`/`keyword`/`status`.

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Supplier statistics retrieved successfully",
  "data": {
    "total": 21,
    "active": 18,
    "inactive": 2,
    "pending": 1,
    "withTaxCode": 15
  }
}
```

#### Truy vấn tương ứng tại Repository:
| Trường | Ý nghĩa | Repository method |
| :--- | :--- | :--- |
| `total` | Tổng số NCC (bao gồm cả `INACTIVE`, vì hệ thống chỉ xóa mềm) | `JpaRepository.count()` |
| `active` | NCC `ACTIVE` (đang hợp tác) | `countByStatus(SupplierStatus.ACTIVE)` |
| `inactive` | NCC `INACTIVE` (tạm ngừng) | `countByStatus(SupplierStatus.INACTIVE)` |
| `pending` | NCC `PENDING` (chờ duyệt) | `countByStatus(SupplierStatus.PENDING)` |
| `withTaxCode` | NCC có `tax_code` khác `NULL` và khác chuỗi rỗng | `countWithTaxCode()` (`@Query`) |

> **Định tuyến**: `stats` là literal segment nên được ưu tiên hơn `/{id}` (PathPattern literal-precedence) → không bị lỗi chuyển đổi `Long`, không ảnh hưởng API chi tiết.

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện lọc & tìm kiếm | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-VSU-01** | Lấy danh sách mặc định trang đầu | `page=0`, `size=10`, không keyword/status | Trả 10 bản ghi mới nhất, `totalElements` chính xác |
| **TC-VSU-02** | Tìm theo tên nhà cung cấp | `keyword="Dược Hậu Giang"` | Trả về các NCC có tên chứa từ khóa |
| **TC-VSU-03** | Lọc theo trạng thái Active | `status=ACTIVE` | Chỉ trả các NCC `ACTIVE` |
| **TC-VSU-04** | Kết hợp keyword + status | `keyword="DHG"`, `status=ACTIVE` | Dùng truy vấn `state = 3`, trả đúng giao của 2 điều kiện |
| **TC-VSU-05** | Chuyển trang | Bấm Next sang trang 2 | Trả 10 bản ghi của trang 2, tham số `page=1` |
| **TC-VSU-06** | Từ khóa không tồn tại | `keyword="xyz999abc"` | `content: []`, `totalElements: 0`, hiển thị Empty state |
| **TC-VSU-07** | Xem chi tiết NCC hợp lệ | `GET /api/v1/supplier/21` | HTTP 200, đầy đủ trường chi tiết, `createdAt` định dạng `dd/MM/yyyy` |
| **TC-VSU-08** | Xem chi tiết NCC không tồn tại | `GET /api/v1/supplier/999` | HTTP 404 "Supplier not found with id: 999", modal báo không tìm thấy |
| **TC-VSU-09** | NCC ngừng hoạt động hiển thị badge | Bản ghi `INACTIVE` | Hiển thị badge "Ngừng hoạt động", ẩn nút Sửa/Xóa |
| **TC-VSU-10** | Thống kê KPI nhà cung cấp | `GET /api/v1/supplier/stats` | HTTP 200, trả `total`/`active`/`inactive`/`pending`/`withTaxCode` khớp dữ liệu **toàn hệ thống** (không phụ thuộc trang) |
| **TC-VSU-11** | KPI cập nhật sau khi ngừng hoạt động NCC | Ngừng hoạt động 1 NCC `ACTIVE` | Thẻ "Đang Hợp Tác" giảm 1, "Tạm Ngừng" tăng 1 ngay sau thao tác |

