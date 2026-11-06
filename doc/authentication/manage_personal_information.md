# Đặc Tả Kỹ Thuật: 3.2.4 Manage Personal Information (Quản Lý Hồ Sơ Cá Nhân)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC04` (SRS 3.2.4)
- **Tên Use Case**: Manage Personal Information (Quản lý hồ sơ cá nhân)
- **Tác nhân (Actor)**: `ALL` (Người dùng đang đăng nhập trong hệ thống)
- **Mô tả nghiệp vụ**: Cho phép người dùng xem và cập nhật thông tin cá nhân của chính mình (Họ và tên, Số điện thoại, Ngày sinh, Giới tính, Địa chỉ cư trú, Ảnh đại diện), đồng thời xem thông tin vai trò và tài khoản được cấp.
- **Tiền điều kiện (Preconditions)**:
  - Người dùng đã đăng nhập thành công vào hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Thông tin mới được lưu vào bảng `dbo.account_informations`.
  - Ghi nhận lịch sử cập nhật vào `audit_logs`.
  - Giao diện người dùng cập nhật ngay tên và avatar mới trên thanh tiêu đề.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng bấm vào menu góc phải và chọn **"Hồ sơ cá nhân" (My Profile)** tại đường dẫn `/profile`.
2. Frontend gọi API `GET /api/v1/profile` kèm token xác thực.
3. Backend truy vấn dữ liệu từ bảng `accounts`, `account_informations`, `roles` và `stores` tương ứng với `accountId` của token, trả về đối tượng `UserProfileResponse`.
4. Frontend hiển thị thông tin hồ sơ:
   - Các trường chỉ đọc (Read-only): `username`, `email`, `roleName`, `storeName`, `status`.
   - Các trường được phép chỉnh sửa: `fullName`, `phone`, `dateOfBirth`, `gender`, `address`, `avatarUrl`.
5. Người dùng chỉnh sửa các thông tin cần thiết và bấm nút **"Lưu hồ sơ" (Save)**.
6. Frontend kiểm tra định dạng đầu vào:
   - `fullName` không được để trống, tối đa 100 ký tự.
   - `phone` đúng định dạng số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0).
   - `dateOfBirth` phải là ngày trong quá khứ (người dùng từ đủ 18 tuổi trở lên đối với nhân sự).
7. Frontend gửi yêu cầu `PUT /api/v1/profile` kèm payload cập nhật.
8. Backend tiếp nhận, validate dữ liệu, cập nhật bản ghi trong bảng `account_informations`.
9. Backend ghi nhật ký kiểm toán `audit_logs` (`action_code = 'UPDATE_PROFILE'`).
10. Backend trả về HTTP `200 OK` kèm thông tin đã cập nhật.
11. Frontend cập nhật lại `AuthContext` và hiển thị thông báo thành công: *"Cập nhật hồ sơ cá nhân thành công!"*.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Số điện thoại không đúng định dạng**: Frontend hiển thị cảnh báo ngay dưới trường SĐT: *"Số điện thoại phải gồm 10 chữ số hợp lệ"*.
- **A2 - Người dùng bấm nút "Hủy bỏ" (Cancel)**: Form khôi phục lại các giá trị ban đầu đã tải từ server.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bảo toàn danh tính cốt lõi)**: Người dùng tuyệt đối không được tự ý sửa đổi `username`, `email`, `role`, và `store_id` từ màn hình profile cá nhân. Các trường này chỉ có Quản trị viên hệ thống (Admin) mới có quyền phân quyền và luân chuyển chi nhánh.
- **BR-02 (Ràng buộc số điện thoại)**: Định dạng chuẩn số điện thoại Việt Nam: `^(0[3|5|7|8|9])+([0-9]{8})$`.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Form
| STT | Tên trường | Control Type | Bắt buộc | Cho phép sửa | Ràng buộc dữ liệu |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `username` | Text Box | Có | Không (Disabled) | Tên đăng nhập hệ thống |
| 2 | `email` | Text Box | Có | Không (Disabled) | Email công việc |
| 3 | `roleName` | Badge / Text | Có | Không (Disabled) | Tên vai trò (VD: Dược sĩ, Quản lý kho) |
| 4 | `storeName` | Text Box | Không | Không (Disabled) | Chi nhánh nhà thuốc công tác |
| 5 | `fullName` | Text Box | Có | Có | Tối đa 100 ký tự |
| 6 | `phone` | Text Box | Có | Có | 10 số, bắt đầu bằng 03, 05, 07, 08, 09 |
| 7 | `dateOfBirth` | Date Picker | Không | Có | Ngày sinh (phải trước ngày hiện tại) |
| 8 | `gender` | Dropdown | Có | Có | Lựa chọn: Nam, Nữ, Khác |
| 9 | `address` | Text Area | Không | Có | Tối đa 255 ký tự |
| 10 | `avatarUrl` | Image Upload / URL | Không | Có | Ảnh định dạng PNG/JPG, tối đa 2MB |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Lấy thông tin hồ sơ:
- **Endpoint**: `GET /api/v1/profile`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Lấy thông tin hồ sơ thành công",
  "data": {
    "accountId": 1001,
    "username": "pharmacist_hn01",
    "email": "pharmacist1@pharmacy.com",
    "role": "ROLE_PHARMACIST",
    "roleName": "Dược sĩ bán thuốc",
    "storeId": 1,
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "fullName": "Nguyễn Văn Dược",
    "phone": "0987654321",
    "nationalId": "001099012345",
    "dateOfBirth": "1995-05-15",
    "gender": "MALE",
    "address": "Số 123 Đường Cầu Giấy, Hà Nội",
    "avatarUrl": "https://cdn.pharmacy.com/avatars/user_1001.png"
  }
}
```

#### B. Cập nhật thông tin hồ sơ:
- **Endpoint**: `PUT /api/v1/profile`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Request Payload Schema**:
```json
{
  "fullName": "Nguyễn Văn Dược",
  "phone": "0912345678",
  "dateOfBirth": "1995-05-15",
  "gender": "MALE",
  "address": "Số 456 Đường Láng, Đống Đa, Hà Nội",
  "avatarUrl": "https://cdn.pharmacy.com/avatars/user_1001_new.png"
}
```

- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Cập nhật hồ sơ cá nhân thành công",
  "data": { ... }
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String phone;

    @Past(message = "Ngày sinh phải trong quá khứ")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Vui lòng chọn giới tính")
    private String gender;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String address;

    private String avatarUrl;
}
```

### 4.3. Thuật Toán Xử Lý Tại Service Layer (`ProfileServiceImpl.updateProfile`)
```java
@Transactional
public UserProfileResponse updateProfile(Long accountId, ProfileUpdateRequest request, String clientIp) {
    AccountInformation profile = accountInfoRepository.findById(accountId)
            .orElseGet(() -> {
                AccountInformation newProfile = new AccountInformation();
                newProfile.setAccountId(accountId);
                return newProfile;
            });

    profile.setFullName(request.getFullName());
    profile.setPhone(request.getPhone());
    profile.setDateOfBirth(request.getDateOfBirth());
    profile.setGender(request.getGender());
    profile.setAddress(request.getAddress());
    profile.setAvatarUrl(request.getAvatarUrl());

    accountInfoRepository.save(profile);

    // Ghi audit log
    auditLogService.log("AUTH", "UPDATE_PROFILE", accountId, clientIp, "Cập nhật hồ sơ cá nhân");

    return getProfile(accountId);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-PRF-01** | Cập nhật hồ sơ hợp lệ | Nhập họ tên, SĐT đúng, chọn ngày sinh hợp lệ | Lưu thành công vào DB, HTTP 200, hiển thị toast thông báo |
| **TC-PRF-02** | Bỏ trống họ tên | `fullName`: "" | Validation lỗi: "Họ và tên không được để trống" |
| **TC-PRF-03** | Sai định dạng số điện thoại | `phone`: "12345" hoặc "0123456789" | Validation lỗi: "Số điện thoại không đúng định dạng Việt Nam" |
| **TC-PRF-04** | Ngày sinh trong tương lai | `dateOfBirth`: Ngày mai | Validation lỗi: "Ngày sinh phải trong quá khứ" |

