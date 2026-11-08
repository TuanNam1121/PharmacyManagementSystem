# Đặc Tả Kỹ Thuật: 3.8.2 Edit Customer (Chỉnh Sửa Thông Tin Khách Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC28` (SRS 3.8.2)
- **Tên Use Case**: Edit Customer (Chỉnh sửa thông tin khách hàng)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Store Manager` (Quản lý cửa hàng), `Admin`
- **Mô tả nghiệp vụ**: Cho phép nhân viên cập nhật thông tin cá nhân và hồ sơ y tế bệnh lý của khách hàng khi khách hàng có sự thay đổi về số điện thoại, địa chỉ cư trú hoặc phát sinh các bệnh lý mãn tính, dị ứng thuốc mới cần ghi nhận vào hồ sơ.
- **Tiền điều kiện (Preconditions)**:
  - Khách hàng đã tồn tại trong hệ thống và chưa bị xóa (`status = 1`).
  - Nhân viên có quyền truy cập chức năng quản lý khách hàng.
- **Hậu điều kiện (Postconditions)**:
  - Thông tin mới được cập nhật vào bảng `dbo.customers` và `dbo.customer_health_profiles`.
  - Cập nhật thời điểm sửa đổi `updated_at = NOW()`.
  - Ghi nhận lịch sử chỉnh sửa vào bảng `dbo.audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Từ danh sách khách hàng (`/customers`) hoặc màn hình chi tiết khách hàng, nhân viên bấm vào nút **"Chỉnh sửa" (Edit - icon cây bút)**.
2. Hệ thống mở Modal **"Chỉnh Sửa Thông Tin Khách Hàng"** và tự động nạp toàn bộ dữ liệu hiện tại của khách hàng vào các ô input.
3. Nhân viên tiến hành chỉnh sửa các trường thông tin:
   - Thông tin cá nhân: Họ và tên, Số điện thoại (nếu khách đổi số), Giới tính, Ngày sinh, Email, Địa chỉ.
   - Thông tin y tế: Cập nhật thêm các dị ứng thuốc mới phát hiện, bệnh nền, thay đổi tình trạng mang thai/cho con bú.
4. Nhân viên bấm nút **"Lưu thay đổi" (Save Changes)**.
5. Frontend kiểm tra ràng buộc đầu vào (validate phone, email, full name).
6. Frontend gửi request `PUT /api/v1/customers/{id}` kèm payload cập nhật lên Backend.
7. Backend tiếp nhận yêu cầu:
   - Tìm kiếm khách hàng theo `customerId`.
   - Nếu số điện thoại mới khác số điện thoại cũ: kiểm tra xem số mới có bị trùng lặp với khách hàng khác trong hệ thống hay không (`existsByPhoneAndCustomerIdNot`).
   - Cập nhật các trường thông tin của bảng `dbo.customers`.
   - Cập nhật bản ghi tương ứng trong bảng `dbo.customer_health_profiles`.
   - Ghi nhận audit log (`action_code = 'EDIT_CUSTOMER'`).
8. Backend trả về HTTP `200 OK` kèm dữ liệu khách hàng sau khi cập nhật.
9. Frontend đóng modal, làm mới dòng dữ liệu trong bảng và hiển thị toast thông báo: *"Cập nhật thông tin khách hàng thành công!"*.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Đổi sang số điện thoại đã có người khác sử dụng**: Backend trả về HTTP `409 Conflict`. Frontend cảnh báo: *"Số điện thoại [SĐT mới] đã thuộc về một khách hàng khác trong hệ thống"*.
- **A2 - Khách hàng không tồn tại**: Nếu ID khách hàng bị sai hoặc đã bị xóa trước đó, Backend trả về HTTP `404 Not Found`.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bảo toàn doanh số tích lũy)**: Khi cập nhật hồ sơ cá nhân, trường tổng chi tiêu `total_spent` KHÔNG được phép thay đổi thủ công qua form này; giá trị này được tính toán tự động dựa trên lịch sử đơn hàng hoàn tất.
- **BR-02 (Kiểm tra trùng SĐT khi thay đổi)**: Chỉ cho phép đổi số điện thoại nếu số mới chưa được sử dụng bởi bất kỳ tài khoản khách hàng nào khác.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Modal Chỉnh Sửa
| STT | Tên trường | Control Type | Bắt buộc | Cho phép sửa | Ràng buộc dữ liệu |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `customerCode` | Text Box | Có | Không (Disabled) | Mã định danh khách hàng (VD: `KH-20261104-0025`) |
| 2 | `fullName` | Text Box | Có | Có | Tối đa 100 ký tự |
| 3 | `phone` | Text Box | Có | Có | Đúng chuẩn 10 chữ số Việt Nam |
| 4 | `gender` | Dropdown | Có | Có | MALE, FEMALE, OTHER |
| 5 | `dateOfBirth` | Date Picker | Không | Có | Phải là ngày trong quá khứ |
| 6 | `email` | Email Input | Không | Có | Tối đa 100 ký tự |
| 7 | `address` | Text Area | Không | Có | Tối đa 255 ký tự |
| 8 | `allergies` | Tags Input | Không | Có | Danh sách thuốc dị ứng |
| 9 | `chronicDiseases`| Multi-select | Không | Có | Bệnh lý nền |
| 10 | `isPregnant` | Checkbox | Không | Có | Đang mang thai |
| 11 | `isBreastfeeding`| Checkbox | Không | Có | Đang cho con bú |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

- **Endpoint**: `PUT /api/v1/customers/{id}`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`, `ROLE_ADMIN`
- **Content-Type**: `application/json`

#### Request Payload Schema:
```json
{
  "fullName": "Trần Thị Lan",
  "phone": "0987123999",
  "gender": "FEMALE",
  "dateOfBirth": "1990-08-20",
  "email": "lan.tran.updated@gmail.com",
  "address": "Số 99 Đường Cầu Giấy, Hà Nội",
  "healthProfile": {
    "allergies": "Dị ứng Penicillin, Amoxicillin, Ciprofloxacin",
    "chronicDiseases": "Viêm loét dạ dày tá tràng, Huyết áp thấp",
    "isPregnant": false,
    "isBreastfeeding": true,
    "notes": "Đang cho con bú tháng thứ 3"
  }
}
```

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Cập nhật thông tin khách hàng thành công",
  "data": {
    "customerId": 105,
    "customerCode": "KH-20261104-0025",
    "fullName": "Trần Thị Lan",
    "phone": "0987123999",
    "gender": "FEMALE",
    "dateOfBirth": "1990-08-20",
    "email": "lan.tran.updated@gmail.com",
    "address": "Số 99 Đường Cầu Giấy, Hà Nội",
    "totalSpent": 1500000.00,
    "updatedAt": "2026-11-04T10:45:00",
    "healthProfile": {
      "allergies": "Dị ứng Penicillin, Amoxicillin, Ciprofloxacin",
      "chronicDiseases": "Viêm loét dạ dày tá tràng, Huyết áp thấp",
      "isPregnant": false,
      "isBreastfeeding": true,
      "notes": "Đang cho con bú tháng thứ 3"
    }
  }
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
public class CustomerUpdateRequest {
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
```

### 4.3. Thuật Toán Service Layer (`CustomerServiceImpl.updateCustomer`)
```java
@Transactional(rollbackFor = Exception.class)
public CustomerDetailResponse updateCustomer(Long customerId, CustomerUpdateRequest request, Long accountId, String clientIp) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));

    // 1. Kiểm tra trùng SĐT nếu có thay đổi
    if (!customer.getPhone().equals(request.getPhone())) {
        boolean phoneTaken = customerRepository.existsByPhoneAndCustomerIdNot(request.getPhone(), customerId);
        if (phoneTaken) {
            throw new CustomerPhoneAlreadyExistsException("Số điện thoại " + request.getPhone() + " đã thuộc về một khách hàng khác");
        }
        customer.setPhone(request.getPhone().trim());
    }

    // 2. Cập nhật thông tin cơ bản
    customer.setFullName(request.getFullName().trim());
    customer.setGender(request.getGender().toUpperCase());
    customer.setDateOfBirth(request.getDateOfBirth());
    customer.setEmail(request.getEmail());
    customer.setAddress(request.getAddress());
    customer.setUpdatedAt(LocalDateTime.now());
    customerRepository.save(customer);

    // 3. Cập nhật hồ sơ sức khỏe
    if (request.getHealthProfile() != null) {
        CustomerHealthProfile healthProfile = healthProfileRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    CustomerHealthProfile newProfile = new CustomerHealthProfile();
                    newProfile.setCustomerId(customerId);
                    return newProfile;
                });

        healthProfile.setAllergies(request.getHealthProfile().getAllergies());
        healthProfile.setChronicDiseases(request.getHealthProfile().getChronicDiseases());
        healthProfile.setIsPregnant((short) (Boolean.TRUE.equals(request.getHealthProfile().getIsPregnant()) ? 1 : 0));
        healthProfile.setIsBreastfeeding((short) (Boolean.TRUE.equals(request.getHealthProfile().getIsBreastfeeding()) ? 1 : 0));
        healthProfile.setNotes(request.getHealthProfile().getNotes());
        healthProfile.setUpdatedAt(LocalDateTime.now());
        healthProfileRepository.save(healthProfile);
    }

    // 4. Ghi Audit Log
    auditLogService.log("CUSTOMER", "EDIT_CUSTOMER", accountId, clientIp, 
        "Cập nhật thông tin khách hàng #" + customer.getCustomerCode() + " - " + customer.getFullName());

    return mapToCustomerDetailResponse(customer);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-EDT-01** | Cập nhật thông tin hợp lệ | Đổi tên, thêm dị ứng Aspirin | Lưu thành công, HTTP 200, phản ánh ngay trên UI |
| **TC-EDT-02** | Đổi số điện thoại trùng người khác | Đổi sang SĐT của khách hàng B | Báo lỗi HTTP 409 "Số điện thoại đã thuộc về khách hàng khác" |
| **TC-EDT-03** | Bỏ trống họ và tên | `fullName`: "" | Validation lỗi "Họ và tên không được để trống" |
| **TC-EDT-04** | Cập nhật cho khách hàng không tồn tại | `customerId` không có trong DB | Trả về HTTP 404 Not Found |
