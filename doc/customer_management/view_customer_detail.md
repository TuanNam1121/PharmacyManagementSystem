# Đặc Tả Kỹ Thuật: 3.8.3 View Customer Detail (Xem Chi Tiết Khách Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC29` (SRS 3.8.3)
- **Tên Use Case**: View Customer Detail (Xem chi tiết hồ sơ khách hàng)
- **Tác nhân (Actor)**: `ALL` (Dược sĩ bán thuốc, Quản lý cửa hàng, Thu ngân, Quản trị viên)
- **Mô tả nghiệp vụ**: Cung cấp giao diện toàn diện hiển thị tất cả các thông tin định danh, lịch sử mua hàng tổng quan, chính sách ưu đãi thành viên và hồ sơ y tế chuyên sâu (tiền sử dị ứng, bệnh nền, chống chỉ định) của một khách hàng cụ thể.
- **Tiền điều kiện (Preconditions)**:
  - Khách hàng có tồn tại trong hệ thống.
  - Người dùng đã đăng nhập vào hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Trả về toàn bộ thông tin chi tiết và hiển thị dạng Drawer trượt hoặc trang chi tiết.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng bấm vào tên khách hàng hoặc nút **"Xem chi tiết" (icon con mắt)** từ bảng danh sách khách hàng (`/customers`) hoặc thanh tìm kiếm tại quầy POS.
2. Frontend gửi request `GET /api/v1/customers/{id}` lên Backend.
3. Backend tiếp nhận yêu cầu:
   - Truy vấn thông tin tài khoản khách hàng từ bảng `dbo.customers`.
   - Nạp thông tin hồ sơ sức khỏe từ bảng `dbo.customer_health_profiles`.
   - Tính toán thống kê: tổng số đơn hàng đã mua, số ngày kể từ lần mua gần nhất.
   - Trả về đối tượng `CustomerDetailResponse`.
4. Frontend hiển thị **Customer Detail Drawer** được bố cục khoa học gồm 3 tab/khối chính:
   - **Khối 1: Thông tin định danh & Thành viên**:
     * Mã khách hàng, Họ và tên, Số điện thoại, Giới tính, Ngày sinh, Tuổi, Email, Địa chỉ.
     * Thẻ hội viên (Badge): Standard, Silver, Gold, Diamond.
     * Điểm thưởng hiện có & Giá trị quy đổi tiền mặt.
     * Tổng số tiền đã chi tiêu tích lũy (`total_spent`).
   - **Khối 2: Hồ sơ sức khỏe & Cảnh báo an toàn y tế**:
     * Banner cảnh báo màu đỏ nếu có tiền sử dị ứng thuốc.
     * Danh sách bệnh lý mãn tính.
     * Thuốc đang sử dụng định kỳ.
     * Tình trạng mang thai hoặc đang nuôi con bằng sữa mẹ.
     * Ghi chú của Dược sĩ theo dõi.
   - **Khối 3: Lịch sử đơn hàng gần nhất**:
     * Danh sách 5 đơn hàng mua gần đây nhất (Mã đơn, ngày giờ, chi nhánh, tổng tiền, trạng thái).
     * Nút bấm *"Xem toàn bộ lịch sử mua hàng"* (chuyển sang Use Case 3.7.4).
5. Từ màn hình này, nhân viên có thể bấm nhanh nút: **"Chỉnh sửa hồ sơ"**, **"Tạo đơn bán hàng mới cho khách này"**, hoặc **"In mã thành viên"**.

### 2.2. Luồng ngoại lệ
- **A1 - Khách hàng không tồn tại**: Nếu ID không tồn tại hoặc đã bị xóa vĩnh viễn, Backend trả về HTTP `404 Not Found`. Frontend hiển thị thông báo: *"Không tìm thấy thông tin khách hàng yêu cầu"*.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Giao Diện Detail Drawer (`CustomerDetailDrawer.jsx`)
- **Header Drawer**:
  - Avatar đại diện theo giới tính.
  - Họ và tên khách hàng (In đậm, font 20px).
  - Huy hiệu Hạng thành viên (Badge: Vàng cho Gold, Bạc cho Silver, Tím cho Diamond).
  - Trạng thái: Đang hoạt động (Active) / Đã vô hiệu hóa (Inactive).
- **Body Drawer**:
  - Grid 2 cột: Cột trái (Thông tin cá nhân & Thẻ thành viên), Cột phải (Hồ sơ sức khỏe y tế nổi bật).
  - Phía dưới là danh sách các hóa đơn gần đây kèm link xem lại chi tiết hóa đơn.
- **Footer Drawer**:
  - Nút "Sửa thông tin" (`secondary`).
  - Nút "Tạo đơn POS cho khách này" (`primary`).
  - Nút "Đóng" (`ghost`).

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `GET /api/v1/customers/{id}`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Response Payload (HTTP 200 OK)**:
```json
{
  "status": 200,
  "message": "Lấy chi tiết khách hàng thành công",
  "data": {
    "customerId": 105,
    "customerCode": "KH-20261104-0025",
    "fullName": "Trần Thị Lan",
    "phone": "0987123456",
    "gender": "FEMALE",
    "dateOfBirth": "1990-08-20",
    "age": 36,
    "email": "lan.tran@gmail.com",
    "address": "Số 15 Phố Duy Tân, Cầu Giấy, Hà Nội",
    "membershipTier": "GOLD",
    "loyaltyPoints": 120,
    "totalSpent": 12500000.00,
    "totalOrders": 18,
    "status": 1,
    "createdAt": "2026-01-15T08:30:00",
    "updatedAt": "2026-11-04T10:45:00",
    "healthProfile": {
      "allergies": "Dị ứng Penicillin, Amoxicillin",
      "chronicDiseases": "Viêm loét dạ dày tá tràng, Huyết áp thấp",
      "currentMedications": "Nexium 40mg (uống trước ăn sáng 30p)",
      "isPregnant": false,
      "isBreastfeeding": true,
      "notes": "Tránh kê đơn nhóm NSAIDs như Ibuprofen vì tiền sử đau dạ dày cấp"
    },
    "recentInvoices": [
      {
        "invoiceId": 1205,
        "invoiceCode": "INV-20261104-0012",
        "createdAt": "2026-11-04T09:15:30",
        "netAmount": 305000.00,
        "status": "COMPLETED"
      }
    ]
  }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.customer;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomerDetailResponse {
    private Long customerId;
    private String customerCode;
    private String fullName;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private Integer age;
    private String email;
    private String address;
    private String membershipTier;
    private Integer loyaltyPoints;
    private BigDecimal totalSpent;
    private Integer totalOrders;
    private Short status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CustomerHealthProfileDto healthProfile;
    private List<CustomerRecentInvoiceDto> recentInvoices;
}

@Data
public class CustomerRecentInvoiceDto {
    private Long invoiceId;
    private String invoiceCode;
    private LocalDateTime createdAt;
    private BigDecimal netAmount;
    private String status;
}
```

### 4.3. Thuật Toán Service Layer
```java
@Transactional(readOnly = true)
public CustomerDetailResponse getCustomerDetail(Long customerId) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));

    CustomerHealthProfile healthProfile = healthProfileRepository.findByCustomerId(customerId).orElse(null);
    List<SalesInvoice> recentInvoices = salesInvoiceRepository.findTop5ByCustomerIdOrderByCreatedAtDesc(customerId);

    return buildCustomerDetailResponse(customer, healthProfile, recentInvoices);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-DTL-01** | Xem chi tiết khách hàng hợp lệ | `customerId`: 105 | Trả về HTTP 200, hiển thị đầy đủ thông tin cá nhân và hồ sơ y tế |
| **TC-DTL-02** | Khách hàng không có hồ sơ bệnh lý | Khách hàng mới chưa có bệnh án | Trả về thông tin khách hàng, `healthProfile` null hoặc các trường rỗng |
| **TC-DTL-03** | Khách hàng không tồn tại | `customerId`: 999999 | Trả về HTTP 404 Not Found "Không tìm thấy khách hàng" |

