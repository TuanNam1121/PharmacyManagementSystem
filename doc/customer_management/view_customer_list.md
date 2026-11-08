# Đặc Tả Kỹ Thuật: 3.8.4 View Customer List (Danh Sách Khách Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC30` (SRS 3.8.4)
- **Tên Use Case**: View Customer List (Xem danh sách khách hàng, tìm kiếm & phân trang)
- **Tác nhân (Actor)**: `ALL` (Dược sĩ bán thuốc, Thu ngân, Quản lý cửa hàng, Quản trị viên)
- **Mô tả nghiệp vụ**: Cung cấp màn hình quản lý danh sách toàn bộ khách hàng trong chuỗi nhà thuốc với khả năng tìm kiếm đa năng tức thời (theo Số điện thoại, Mã khách hàng, Tên), lọc dữ liệu theo Trạng thái hoạt động (`status`), sắp xếp linh hoạt và phân trang tối ưu hiệu năng.
- **Tiền điều kiện (Preconditions)**:
  - Người dùng đã đăng nhập thành công vào hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Hiển thị bảng danh sách khách hàng theo đúng tiêu chí tìm kiếm và trang hiện tại.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng chọn mục **"Khách hàng" (Customers)** từ thanh điều hướng chính (Sidebar) tại đường dẫn `/customers`.
2. Frontend tự động gọi API `GET /api/v1/customers` với các tham số mặc định: `page=0`, `size=10`, `sortBy=createdAt`, `sortDir=desc`.
3. Backend tiếp nhận:
   - Thực hiện truy vấn động với Spring Data JPA `Pageable` và `Specification`.
   - Đếm tổng số bản ghi và trả về đối tượng `PageResponse<CustomerResponse>`.
4. Frontend hiển thị giao diện danh sách gồm:
   - **Thanh công cụ phía trên**:
     * Ô tìm kiếm nhanh (Search Box): hỗ trợ gõ SĐT, Tên, Mã khách hàng (có Debounce 300ms).
     * Bộ lọc Trạng thái: Tất cả, Đang hoạt động (`status = 1`), Ngừng hoạt động (`status = 0`).
     * Nút "Đăng ký khách hàng mới" (+ Register).
     * Nút "Xuất file Excel" (Export).
   - **Bảng dữ liệu (Data Table)**:
     * Cột 1: Mã khách hàng (`customerCode`).
     * Cột 2: Họ và tên (`fullName`).
     * Cột 3: Số điện thoại (`phone`).
     * Cột 4: Giới tính (`gender`).
     * Cột 5: Tổng chi tiêu (`totalSpent` - định dạng tiền tệ VNĐ).
     * Cột 6: Trạng thái (Active / Inactive).
     * Cột 7: Thao tác (Icon Xem chi tiết, Sửa, Xóa).
   - **Thanh phân trang phía dưới**:
     * Hiển thị: "Hiển thị X - Y trong tổng số Z khách hàng".
     * Chọn số dòng mỗi trang: 10, 20, 50 dòng.
     * Nút chuyển trang (First, Prev, Next, Last, các số trang).
5. Khi người dùng nhập từ khóa tìm kiếm hoặc đổi trang:
   - Frontend gửi lại request với các query params tương ứng.
   - Bảng hiển thị hiệu ứng Loading mờ nhẹ và nạp lại dữ liệu mới trong chưa đầy 200ms.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Không tìm thấy kết quả**: Nếu từ khóa tìm kiếm không khớp với bất kỳ khách hàng nào, hệ thống hiển thị hình minh họa trống kèm thông báo: *"Không tìm thấy khách hàng nào phù hợp với từ khóa tìm kiếm"* và nút *"Xóa bộ lọc"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Hiệu năng phân trang)**: Tuyệt đối không tải toàn bộ database khách hàng về client. Luôn luôn thực hiện phân trang và đếm tổng số trang tại tầng cơ sở dữ liệu (`SQL Server OFFSET / FETCH NEXT`).
- **BR-02 (Tối ưu tìm kiếm SĐT)**: Tìm kiếm số điện thoại sử dụng toán tử khớp chính xác hoặc bắt đầu bằng (`phone LIKE 'keyword%'`) có tận dụng Index để đạt tốc độ phản hồi dưới 50ms.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Điều Khiển Bộ Lọc & Bảng Danh Sách
| STT | Tên điều khiển | Loại điều khiển | Giá trị lựa chọn | Hành động kích hoạt |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `keywordInput` | Search Input Box | Tự do (SĐT, Họ tên, Mã KH) | Tìm kiếm tự động sau khi dừng gõ 300ms |
| 2 | `statusSelect` | Dropdown Filter | Tất cả, Hoạt động (1), Ngừng hoạt động (0) | Lọc danh sách theo trạng thái |
| 3 | `btnRegister` | Button (Primary) | - | Mở Modal Đăng ký khách hàng mới |
| 4 | `pagination` | Pagination Bar | Trang 1..N, Size: 10, 20, 50 | Chuyển trang và thay đổi kích thước trang |
| 5 | Nút `View Detail`| Action Icon (Mắt) | - | Mở CustomerDetailDrawer |
| 6 | Nút `Edit` | Action Icon (Bút) | - | Mở CustomerEditModal |
| 7 | Nút `Delete` | Action Icon (Thùng rác)| - | Mở CustomerDeleteModal (nếu có quyền) |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `GET /api/v1/customers`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Query Parameters**:
  * `keyword` (String, optional): Từ khóa tìm theo SĐT, Tên hoặc Mã KH.
  * `status` (Short, optional): `1` (Active), `0` (Inactive).
  * `page` (Integer, default: 0): Số thứ tự trang (bắt đầu từ 0).
  * `size` (Integer, default: 10): Số lượng bản ghi mỗi trang.
  * `sortBy` (String, default: "createdAt"): Trường sắp xếp (`createdAt`, `fullName`, `totalSpent`).
  * `sortDir` (String, default: "desc"): Chiều sắp xếp (`asc`, `desc`).

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Lấy danh sách khách hàng thành công",
  "data": {
    "content": [
      {
        "customerId": 105,
        "customerCode": "KH-20261104-0025",
        "fullName": "Trần Thị Lan",
        "phone": "0987123456",
        "gender": "FEMALE",
        "totalSpent": 12500000.00,
        "status": 1,
        "hasAllergies": true,
        "createdAt": "2026-01-15T08:30:00"
      },
      {
        "customerId": 102,
        "customerCode": "KH-20261020-0014",
        "fullName": "Hoàng Minh Tuấn",
        "phone": "0912345678",
        "gender": "MALE",
        "totalSpent": 4500000.00,
        "status": 1,
        "hasAllergies": false,
        "createdAt": "2026-10-20T14:10:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 248,
    "totalPages": 25,
    "last": false
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.customer;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CustomerResponse {
    private Long customerId;
    private String customerCode;
    private String fullName;
    private String phone;
    private String gender;
    private BigDecimal totalSpent;
    private Short status;
    private Boolean hasAllergies;
    private LocalDateTime createdAt;
}
```

### 4.3. Thuật Toán Service Layer (`CustomerServiceImpl.getCustomers`)
```java
@Transactional(readOnly = true)
public PageResponse<CustomerResponse> getCustomers(String keyword, Short status, int page, int size, String sortBy, String sortDir) {
    Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);

    Specification<Customer> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            Predicate phonePredicate = cb.like(root.get("phone"), "%" + keyword.trim() + "%");
            Predicate namePredicate = cb.like(cb.lower(root.get("fullName")), kw);
            Predicate codePredicate = cb.like(cb.lower(root.get("customerCode")), kw);
            predicates.add(cb.or(phonePredicate, namePredicate, codePredicate));
        }

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };

    Page<Customer> customerPage = customerRepository.findAll(spec, pageable);

    List<CustomerResponse> content = customerPage.getContent().stream()
            .map(this::mapToCustomerResponse)
            .collect(Collectors.toList());

    return new PageResponse<>(content, customerPage.getNumber(), customerPage.getSize(),
            customerPage.getTotalElements(), customerPage.getTotalPages(), customerPage.isLast());
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện lọc & tìm kiếm | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-LST-01** | Lấy danh sách mặc định trang đầu | `page`: 0, `size`: 10 | Trả về 10 bản ghi mới nhất, tính đúng `totalElements` |
| **TC-LST-02** | Tìm kiếm theo số điện thoại | `keyword`: "0987123456" | Trả về đúng 1 bản ghi khớp SĐT |
| **TC-LST-03** | Chuyển sang trang tiếp theo | Bấm Next sang trang 2 | Trả về 10 bản ghi của trang 2 |
| **TC-LST-04** | Tìm từ khóa không tồn tại | `keyword`: "xyz123abc999" | Trả về danh sách rỗng (`content: []`), `totalElements: 0` |

