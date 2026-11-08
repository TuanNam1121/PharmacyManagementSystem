# Đặc Tả Kỹ Thuật: 3.2.4 Manage Personal Information (Quản Lý Hồ Sơ Cá Nhân)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC04` (SRS 3.2.4)
- **Tên Use Case**: Manage Personal Information (Quản lý hồ sơ cá nhân)
- **Tác nhân (Actor)**: `ALL` (Người dùng đang đăng nhập trong hệ thống)
- **Mô tả nghiệp vụ**: Cho phép người dùng xem và cập nhật thông tin cá nhân của chính mình (Họ và tên, Số điện thoại, Ngày sinh, Giới tính, Địa chỉ cư trú). Đồng thời xem thông tin tài khoản, vai trò quyền hạn và chi nhánh/kho công tác (`storeName`) được cấp mà không được phép tự ý chỉnh sửa. Ảnh đại diện sử dụng hình ảnh silhouette mặc định chuẩn theo nhận diện hệ thống (bỏ ô nhập URL ảnh đại diện trên UI).
- **Tiền điều kiện (Preconditions)**:
  - Người dùng đã đăng nhập thành công vào hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Thông tin mới được lưu vào bảng `dbo.account_informations`.
  - Ghi nhận lịch sử cập nhật vào `audit_logs`.
  - Giao diện người dùng cập nhật ngay họ tên mới trên thanh tiêu đề và AuthContext.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng bấm vào menu góc phải và chọn **"Hồ sơ cá nhân" (My Profile)** tại đường dẫn `/profile`.
2. Frontend gọi API `GET /api/v1/profile` kèm token xác thực.
3. Backend truy vấn dữ liệu từ bảng `accounts`, `account_informations`, `roles` và `stores` tương ứng với `accountId` của token, trả về đối tượng `UserProfileResponse`.
4. Frontend hiển thị giao diện hồ sơ cá nhân gồm 2 khu vực:
   - **Khu vực Thông Tin Tài Khoản (Read-only - Không cho phép chỉnh sửa)**:
     - Tên đăng nhập (`username`).
     - Email hệ thống (`email`).
     - Vai trò quyền hạn (`roleName`).
     - **Chi nhánh / Kho làm việc (`storeName`)**: Bắt buộc hiển thị tên chi nhánh hoặc "Hội sở chính / Chưa phân bổ", ở trạng thái chỉ đọc (disabled / read-only), người dùng không thể can thiệp chỉnh sửa.
     - Trạng thái tài khoản (`status`).
   - **Khu vực Chỉnh Sửa Hồ Sơ Cá Nhân (Form nhập liệu)**:
     - Các trường được phép chỉnh sửa: `fullName`, `phone`, `dateOfBirth`, `gender`, `address`.
     - *Lưu ý*: Bỏ hoàn toàn trường nhập "Đường dẫn ảnh đại diện (Avatar URL)" trên UI.
   - **Khu vực Avatar đại diện**: Hiển thị ảnh đại diện mặc định chuẩn hệ thống (hình bóng người silhouette nền xám tối giản, đồng bộ theo thiết kế).
5. Người dùng chỉnh sửa các thông tin cần thiết và bấm nút **"Lưu hồ sơ" (Save)** (hoặc bấm **"Hủy bỏ"** để quay về trang chủ).
6. Frontend kiểm tra định dạng đầu vào:
   - `fullName` không được để trống, tối đa 100 ký tự.
   - `phone` đúng định dạng số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).
   - `dateOfBirth` phải là ngày trong quá khứ (trước ngày hiện tại).
7. Frontend gửi yêu cầu `PUT /api/v1/profile` kèm payload cập nhật.
8. Backend tiếp nhận, validate dữ liệu, cập nhật bản ghi trong bảng `account_informations`.
9. Backend ghi nhật ký kiểm toán `audit_logs` (`action_code = 'UPDATE_PROFILE'`).
10. Backend trả về HTTP `200 OK` kèm thông tin đã cập nhật.
11. Frontend cập nhật lại `AuthContext` và hiển thị thông báo thành công: *"Cập nhật hồ sơ cá nhân thành công!"*.

---

### 2.2. Luồng ngoại lệ & Rẽ nhánh (Alternative Flows)
- **A1 - Số điện thoại không đúng định dạng**: Frontend hiển thị cảnh báo ngay dưới trường SĐT: *"Số điện thoại phải gồm 10 chữ số hợp lệ (bắt đầu bằng 03, 05, 07, 08, 09)"*.
- **A2 - Người dùng bấm nút "Hủy bỏ" (Cancel)**: Hệ thống điều hướng người dùng quay trở lại trang chủ (`/home`).
- **A3 - Họ tên để trống**: Frontend chặn submit và báo lỗi: *"Họ và tên không được để trống"*.
- **A4 - Ngày sinh không hợp lệ**: Nếu chọn ngày trong tương lai hoặc ngày hiện tại, Frontend hiển thị cảnh báo: *"Ngày sinh phải là một ngày trong quá khứ"*.

---

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bảo toàn danh tính cốt lõi & Đơn vị công tác)**: Người dùng tuyệt đối không được tự ý sửa đổi `username`, `email`, `role`, và `storeName` (chi nhánh/kho làm việc) từ màn hình cá nhân. Các trường này thuộc quyền quản trị tập trung của Quản trị viên (Admin) và chỉ hiển thị ở chế độ Read-only.
- **BR-02 (Ràng buộc số điện thoại)**: Định dạng chuẩn số điện thoại Việt Nam: `^(0[3|5|7|8|9])+([0-9]{8})$`.
- **BR-03 (Ảnh đại diện chuẩn mặc định)**: Loại bỏ ô nhập link URL ảnh đại diện trên giao diện người dùng. Hệ thống sử dụng avatar đại diện mặc định chuẩn (biểu tượng hình người silhouette tối giản với nền xám và hình tròn/vòm vai màu trắng) để đảm bảo tính đồng bộ, thẩm mỹ và an toàn thông tin.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Bố Cục Màn Hình
- **Banner đầu trang (Profile Header)**: Hiển thị avatar tròn mặc định (silhouette xám/trắng chuẩn), Họ tên, Email, Vai trò và nút **"Đổi mật khẩu"**.
- **Cột Trái - Tab/Khối Thông Tin Tài Khoản (Read-Only)**:
  - Tên đăng nhập (`username`)
  - Email hệ thống (`email`)
  - Vai trò quyền hạn (`roleName`)
  - **Chi nhánh / Kho làm việc (`storeName`)**: Hiển thị tên chi nhánh (ví dụ: *"Nhà thuốc Chi nhánh 1 - Cầu Giấy"*) hoặc *"Hội sở chính"*, định dạng chữ in đậm / badge / input disabled, không có khả năng chỉnh sửa.
  - Trạng thái tài khoản (`status`: Active/Locked)
  - Thông báo ghi chú quyền quản trị.
- **Cột Phải - Form Chỉnh Sửa Hồ Sơ Cá Nhân**:
  - `fullName` (Bắt buộc)
  - `phone` (Bắt buộc)
  - `dateOfBirth`
  - `gender` (Dropdown: Nam, Nữ, Khác)
  - `address` (Text Area)
  - *Đã loại bỏ*: Trường `avatarUrl` (Đường dẫn ảnh đại diện).
  - Nhóm nút thao tác:
    - Nút **"Hủy bỏ"** (Secondary): Nhấn vào sẽ điều hướng về trang chủ (`/home`).
    - Nút **"Lưu hồ sơ"** (Primary): Gửi form cập nhật thông tin.

---

### 3.2. Bảng Định Nghĩa Các Trường Form

| STT | Khu vực | Tên trường | Control Type | Bắt buộc | Cho phép sửa | Ràng buộc dữ liệu & Mô tả |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | Thông tin tài khoản | `username` | Text Display / Box | Có | Không (Disabled) | Tên đăng nhập hệ thống |
| 2 | Thông tin tài khoản | `email` | Text Display / Box | Có | Không (Disabled) | Email công việc |
| 3 | Thông tin tài khoản | `roleName` | Badge / Text | Có | Không (Disabled) | Tên vai trò (VD: Dược sĩ, Quản trị viên) |
| 4 | Thông tin tài khoản | `storeName` | Text Display / Box | Có | **Không (Disabled)** | **Chi nhánh hoặc kho làm việc được phân bổ** |
| 5 | Thông tin tài khoản | `status` | Badge Status | Có | Không (Disabled) | Trạng thái: Hoạt động (Active) / Khóa |
| 6 | Chỉnh sửa hồ sơ | `fullName` | Text Box | Có | **Có** | Tối đa 100 ký tự, không để trống |
| 7 | Chỉnh sửa hồ sơ | `phone` | Text Box | Có | **Có** | 10 số, định dạng SĐT Việt Nam (03, 05, 07, 08, 09) |
| 8 | Chỉnh sửa hồ sơ | `dateOfBirth` | Date Picker | Không | **Có** | Ngày sinh trong quá khứ |
| 9 | Chỉnh sửa hồ sơ | `gender` | Dropdown | Có | **Có** | Lựa chọn: `MALE` (Nam), `FEMALE` (Nữ), `OTHER` (Khác) |
| 10 | Chỉnh sửa hồ sơ | `address` | Text Area | Không | **Có** | Tối đa 500 ký tự |
| 11 | Nút điều hướng | Nút `Hủy bỏ` | Button (Secondary) | - | - | **Click điều hướng về trang chủ (`/home`)** |
| 12 | Nút thao tác | Nút `Lưu hồ sơ` | Button (Primary) | - | - | Trigger form submit, hiển thị spinner khi đang lưu |

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
    "avatarUrl": null
  }
}
```

#### B. Cập nhật thông tin hồ sơ:
- **Endpoint**: `PUT /api/v1/profile`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Request Payload Schema** (Không gửi `avatarUrl` từ UI):
```json
{
  "fullName": "Nguyễn Văn Dược",
  "phone": "0912345678",
  "dateOfBirth": "1995-05-15",
  "gender": "MALE",
  "address": "Số 456 Đường Láng, Đống Đa, Hà Nội"
}
```

- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Cập nhật hồ sơ cá nhân thành công",
  "data": {
    "accountId": 1001,
    "username": "pharmacist_hn01",
    "email": "pharmacist1@pharmacy.com",
    "role": "ROLE_PHARMACIST",
    "roleName": "Dược sĩ bán thuốc",
    "storeId": 1,
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "fullName": "Nguyễn Văn Dược",
    "phone": "0912345678",
    "dateOfBirth": "1995-05-15",
    "gender": "MALE",
    "address": "Số 456 Đường Láng, Đống Đa, Hà Nội",
    "avatarUrl": null
  }
}
```

---

### 4.2. Khai Báo DTO Java (`ProfileUpdateRequest.java`)
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Size(max = 500, message = "Địa chỉ tối đa 500 ký tự")
    private String address;

    private String avatarUrl; // Trường tùy chọn (optional)
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử / Hành động | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-PRF-01** | Cập nhật hồ sơ hợp lệ | Nhập `fullName`, `phone` hợp lệ, chọn ngày sinh quá khứ, bấm "Lưu hồ sơ" | Gửi PUT /api/v1/profile, lưu thành công vào DB, HTTP 200, hiển thị toast thông báo |
| **TC-PRF-02** | Bỏ trống họ tên | `fullName`: "" | Validation lỗi tại form: "Họ và tên không được để trống", chặn gửi form |
| **TC-PRF-03** | Sai định dạng số điện thoại | `phone`: "12345" hoặc "0123456789" | Validation lỗi: "Số điện thoại không đúng định dạng Việt Nam" |
| **TC-PRF-04** | Ngày sinh trong tương lai | `dateOfBirth`: Ngày mai | Validation lỗi: "Ngày sinh phải là một ngày trong quá khứ" |
| **TC-PRF-05** | Người dùng bấm nút "Hủy bỏ" | Click nút "Hủy bỏ" (Cancel) | Điều hướng ứng dụng trở về trang chủ (`/home`), không lưu bất kỳ thay đổi nào |
| **TC-PRF-06** | Kiểm tra hiển thị Store Name | Truy cập `/profile` | Tab "Thông Tin Tài Khoản" hiển thị đúng tên chi nhánh `storeName` và ở trạng thái không thể chỉnh sửa |
| **TC-PRF-07** | Kiểm tra hiển thị Avatar mặc định | Truy cập `/profile` | Banner hiển thị ảnh avatar silhouette mặc định, không hiển thị trường nhập Avatar URL trong form |
