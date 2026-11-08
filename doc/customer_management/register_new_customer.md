# Đặc Tả Kỹ Thuật: 3.8.1 Register New Customer (Đăng Ký Khách Hàng Mới)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC27` (SRS 3.8.1)
- **Tên Use Case**: Register New Customer (Đăng ký khách hàng mới)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân), `Store Manager` (Quản lý cửa hàng)
- **Mô tả nghiệp vụ**: Cho phép nhân viên đăng ký hồ sơ khách hàng mới vào hệ thống tại quầy POS hoặc từ màn hình quản lý khách hàng. Hỗ trợ lưu trữ thông tin liên lạc và ghi nhận hồ sơ y tế ban đầu (tiền sử dị ứng thuốc, bệnh mãn tính) nhằm đảm bảo an toàn sử dụng thuốc.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập thành công vào hệ thống.
  - Số điện thoại đăng ký chưa từng tồn tại trên toàn bộ chuỗi nhà thuốc.
- **Hậu điều kiện (Postconditions)**:
  - Bản ghi khách hàng mới được lưu vào bảng `dbo.customers` với `status = 1` (Active), tổng chi tiêu ban đầu là `0`.
  - Bản ghi hồ sơ sức khỏe tương ứng được tạo trong bảng `dbo.customer_health_profiles`.
  - Ghi nhận nhật ký vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên mở Modal **"Đăng ký khách hàng mới"** bằng một trong hai cách:
   - Tại quầy POS: Nhập SĐT lạ và bấm nút **"Thêm nhanh khách hàng" (F3)**.
   - Tại trang Quản lý khách hàng (`/customers`): Bấm nút **"Thêm khách hàng" (+ Register)**.
2. Giao diện hiển thị Form đăng ký gồm hai khối thông tin:
   - **Khối 1: Thông tin cá nhân cơ bản**:
     * Họ và tên (`fullName`) - Bắt buộc.
     * Số điện thoại (`phone`) - Bắt buộc (duy nhất).
     * Giới tính (`gender`) - Bắt buộc (Nam / Nữ / Khác).
     * Ngày sinh (`dateOfBirth`) - Tùy chọn.
     * Email (`email`) - Tùy chọn.
     * Địa chỉ (`address`) - Tùy chọn.
   - **Khối 2: Hồ sơ sức khỏe y tế (Health Profile)**:
     * Tiền sử dị ứng thuốc (`allergies`): Nhập tên thuốc hoặc hoạt chất gây dị ứng (VD: Penicillin, Cephalosporin, Aspirin...).
     * Bệnh lý nền mãn tính (`chronicDiseases`): Chọn hoặc nhập bệnh nền (VD: Đái tháo đường, Tăng huyết áp, Hen suyễn...).
     * Tình trạng đặc biệt: Checkbox *"Đang mang thai"*, *"Đang cho con bú"*.
3. Nhân viên điền thông tin và bấm nút **"Lưu khách hàng" (Save)**.
4. Frontend kiểm tra định dạng dữ liệu (Client-side validation):
   - `fullName` không được rỗng, tối đa 100 ký tự.
   - `phone` phải gồm 10 chữ số hợp lệ theo chuẩn mạng viễn thông Việt Nam.
5. Frontend gửi yêu cầu `POST /api/v1/customers` kèm payload lên Backend.
6. Backend tiếp nhận yêu cầu:
   - Kiểm tra số điện thoại: truy vấn `customerRepository.existsByPhone(phone)`. Nếu đã tồn tại -> ném ngoại lệ `CustomerPhoneAlreadyExistsException`.
   - Sinh mã khách hàng tự động: `KH-YYYYMMDD-XXXX` (Ví dụ: `KH-20261104-0025`).
   - Khởi tạo đối tượng `Customer`: `status = 1`, `totalSpent = 0`.
   - Khởi tạo đối tượng `CustomerHealthProfile` liên kết với `customerId`.
   - Lưu vào cơ sở dữ liệu trong cùng một giao dịch `@Transactional`.
   - Ghi nhật ký vào `audit_logs` (`action_code = 'REGISTER_CUSTOMER'`).
7. Backend trả về HTTP `201 Created` kèm thông tin khách hàng chi tiết.
8. Frontend đóng modal, thông báo thành công: *"Đăng ký khách hàng thành công!"*, và tự động chọn khách hàng này vào đơn hàng POS hiện tại (nếu đang ở màn hình POS).

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Số điện thoại đã tồn tại**: Nếu SĐT đã có trong hệ thống, Backend trả về HTTP `409 Conflict`. Frontend hiển thị cảnh báo đỏ ngay dưới ô SĐT: *"Số điện thoại này đã được đăng ký cho khách hàng [Tên khách hàng cũ]"* kèm nút *"Chọn khách hàng này"*.
- **A2 - Hủy bỏ đăng ký**: Nhân viên bấm nút "Hủy" -> Đóng form và không lưu dữ liệu.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Định danh duy nhất bằng Số điện thoại)**: Mỗi khách hàng trong toàn chuỗi nhà thuốc chỉ được sở hữu một số điện thoại duy nhất. Trường `phone` trong bảng `customers` được đánh chỉ mục `UNIQUE INDEX`.
- **BR-02 (Cảnh báo dị ứng bắt buộc nổi bật)**: Bất kỳ ghi chú nào trong trường `allergies` sẽ được đánh dấu cờ cảnh báo ưu tiên cao nhất trong suốt quá trình bán thuốc tại quầy POS.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Modal Đăng Ký
| STT | Tên trường | Control Type | Bắt buộc | Max Length | Validation & Gợi ý |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `fullName` | Text Box | Có | 100 | Viết hoa chữ cái đầu (VD: Nguyễn Văn An) |
| 2 | `phone` | Text Box | Có | 15 | Regex: `^(0[3\|5\|7\|8\|9])+([0-9]{8})$` |
| 3 | `gender` | Dropdown / Radio | Có | - | MALE, FEMALE, OTHER |
| 4 | `dateOfBirth` | Date Picker | Không | - | Ngày sinh phải trong quá khứ |
| 5 | `email` | Email Input | Không | 100 | Đúng cú pháp email |
| 6 | `address` | Text Area | Không | 255 | Địa chỉ thường trú |
| 7 | `allergies` | Tags Input / Text | Không | 255 | Nhập tên thuốc dị ứng (nhấn Enter để thêm tag) |
| 8 | `chronicDiseases` | Multi-select Dropdown | Không | 255 | Chọn: Tiểu đường, Huyết áp, Tim mạch... |
| 9 | `isPregnant` | Checkbox | Không | - | Đang mang thai |
| 10 | `isBreastfeeding` | Checkbox | Không | - | Đang cho con bú |
| 11 | Nút `Save` | Button (Primary) | - | - | Submit đăng ký khách hàng |
| 12 | Nút `Cancel` | Button (Secondary) | - | - | Đóng modal |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `POST /api/v1/customers`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`, `ROLE_ADMIN`
- **Content-Type**: `application/json`

#### Request Payload Schema:
```json
{
  "fullName": "Trần Thị Lan",
  "phone": "0987123456",
  "gender": "FEMALE",
  "dateOfBirth": "1990-08-20",
  "email": "lan.tran@gmail.com",
  "address": "Số 15 Phố Duy Tân, Cầu Giấy, Hà Nội",
  "healthProfile": {
    "allergies": "Dị ứng Penicillin, Amoxicillin",
    "chronicDiseases": "Viêm loét dạ dày tá tràng",
    "isPregnant": false,
    "isBreastfeeding": false,
    "notes": "Nhạy cảm với thuốc giảm đau NSAIDs"
  }
}
```

#### Response Payload (Thành công - HTTP 201 Created):
```json
{
  "status": 201,
  "message": "Đăng ký khách hàng mới thành công",
  "data": {
    "customerId": 105,
    "customerCode": "KH-20261104-0025",
    "fullName": "Trần Thị Lan",
    "phone": "0987123456",
    "gender": "FEMALE",
    "dateOfBirth": "1990-08-20",
    "email": "lan.tran@gmail.com",
    "address": "Số 15 Phố Duy Tân, Cầu Giấy, Hà Nội",
    "totalSpent": 0.00,
    "status": 1,
    "createdAt": "2026-11-04T10:00:00",
    "healthProfile": {
      "allergies": "Dị ứng Penicillin, Amoxicillin",
      "chronicDiseases": "Viêm loét dạ dày tá tràng",
      "isPregnant": false,
      "isBreastfeeding": false,
      "notes": "Nhạy cảm với thuốc giảm đau NSAIDs"
    }
  }
}
```

#### Response Payload (Lỗi trùng SĐT - HTTP 409 Conflict):
```json
{
  "status": 409,
  "error": "PHONE_EXISTS",
  "message": "Số điện thoại 0987123456 đã được đăng ký bởi khách hàng khác!",
  "timestamp": "2026-11-04T10:00:00"
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.customer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerCreateRequest {
    @NotBlank(message = "Họ và tên khách hàng không được để trống")
    @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String phone;

    @NotBlank(message = "Giới tính không được để trống")
    private String gender;

    @Past(message = "Ngày sinh phải trong quá khứ")
    private LocalDate dateOfBirth;

    private String email;
    private String address;

    @Valid
    private CustomerHealthProfileDto healthProfile;
}

@Data
public class CustomerHealthProfileDto {
    private String allergies;
    private String chronicDiseases;
    private String currentMedications;
    private Boolean isPregnant = false;
    private Boolean isBreastfeeding = false;
    private String notes;
}
```

### 4.3. Thuật Toán Service Layer (`CustomerServiceImpl.registerCustomer`)
```java
@Transactional(rollbackFor = Exception.class)
public CustomerDetailResponse registerCustomer(CustomerCreateRequest request, Long accountId, String clientIp) {
    // 1. Kiểm tra trùng số điện thoại
    if (customerRepository.existsByPhone(request.getPhone())) {
        throw new CustomerPhoneAlreadyExistsException("Số điện thoại " + request.getPhone() + " đã tồn tại trong hệ thống");
    }

    // 2. Khởi tạo đối tượng Customer
    Customer customer = new Customer();
    customer.setCustomerCode(generateCustomerCode());
    customer.setFullName(request.getFullName().trim());
    customer.setPhone(request.getPhone().trim());
    customer.setGender(request.getGender().toUpperCase());
    customer.setDateOfBirth(request.getDateOfBirth());
    customer.setEmail(request.getEmail());
    customer.setAddress(request.getAddress());
    customer.setTotalSpent(BigDecimal.ZERO);
    customer.setStatus((short) 1);
    customer.setCreatedAt(LocalDateTime.now());
    customer.setUpdatedAt(LocalDateTime.now());
    Customer savedCustomer = customerRepository.save(customer);

    // 3. Khởi tạo và liên kết hồ sơ y tế
    if (request.getHealthProfile() != null) {
        CustomerHealthProfile healthProfile = new CustomerHealthProfile();
        healthProfile.setCustomerId(savedCustomer.getCustomerId());
        healthProfile.setAllergies(request.getHealthProfile().getAllergies());
        healthProfile.setChronicDiseases(request.getHealthProfile().getChronicDiseases());
        healthProfile.setIsPregnant((short) (Boolean.TRUE.equals(request.getHealthProfile().getIsPregnant()) ? 1 : 0));
        healthProfile.setIsBreastfeeding((short) (Boolean.TRUE.equals(request.getHealthProfile().getIsBreastfeeding()) ? 1 : 0));
        healthProfile.setNotes(request.getHealthProfile().getNotes());
        healthProfile.setUpdatedAt(LocalDateTime.now());
        healthProfileRepository.save(healthProfile);
    }

    // 4. Ghi Audit Log
    auditLogService.log("CUSTOMER", "REGISTER_CUSTOMER", accountId, clientIp, 
        "Đăng ký khách hàng mới #" + savedCustomer.getCustomerCode() + " - " + savedCustomer.getFullName());

    return mapToCustomerDetailResponse(savedCustomer);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CST-01** | Đăng ký thành công đầy đủ thông tin | SĐT đúng, họ tên hợp lệ, có tiền sử dị ứng | Lưu thành công khách hàng và hồ sơ sức khỏe, HTTP 201 |
| **TC-CST-02** | Trùng số điện thoại | SĐT đã có trong cơ sở dữ liệu | Trả về HTTP 409 Conflict "Số điện thoại đã tồn tại" |
| **TC-CST-03** | Sai định dạng số điện thoại | `phone`: "0123" hoặc "abcdefgh" | Validation lỗi tại Client & Server |
| **TC-CST-04** | Bỏ trống họ tên | `fullName`: "" | Validation lỗi "Họ và tên khách hàng không được để trống" |
| **TC-CST-05** | Ngày sinh trong tương lai | `dateOfBirth`: Năm 2030 | Validation lỗi "Ngày sinh phải trong quá khứ" |

