# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - CỤM CHỨC NĂNG 1: AUTHENTICATION

---

## 1. TỔNG QUAN CỤM CHỨC NĂNG
Cụm chức năng **Authentication** chịu trách nhiệm quản lý xác thực định danh người dùng, cấp phát phiên làm việc (Session/JWT Access Token & Refresh Token Rotation), kiểm soát truy cập phân quyền (RBAC), thay đổi mật khẩu, quản lý hồ sơ cá nhân và khôi phục mật khẩu thông qua email xác thực an toàn.

---

## 2. DANH SÁCH USE CASE TRONG CỤM
- **UC01**: Login (Đăng nhập hệ thống)
- **UC02**: Logout (Đăng xuất hệ thống)
- **UC03**: Change Password (Đổi mật khẩu tài khoản)
- **UC04**: Manage Personal Information (Quản lý hồ sơ cá nhân)
- **UC05**: Forgot Password (Quên mật khẩu & Khôi phục qua Email OTP)

---

## 3. CHI TIẾT YÊU CẦU & ĐẶC TẢ TỪNG CHỨC NĂNG

### 3.1. Chức năng: Login (Đăng nhập hệ thống)

#### Table 3-1: Screen Definition - Login Screen
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | User Name / Email | Text | Yes | 50 | Tên đăng nhập hoặc địa chỉ email đã đăng ký của nhân viên. |
| 2 | Password | Text | Yes | 32 | Mật khẩu tài khoản của người dùng. Hiển thị dưới dạng ký tự ẩn `*` kèm nút icon bật/tắt xem mật khẩu. |
| 3 | Login | Button | - | - | Xác thực thông tin đăng nhập, cấp Access Token & Refresh Token và điều hướng vào hệ thống. |
| 4 | Cancel | Button | - | - | Xóa trắng dữ liệu đã nhập trong các trường hoặc khôi phục về trạng thái ban đầu. |
| 5 | Forgot Password? | Hyperlink | - | - | Điều hướng người dùng tới màn hình Quên mật khẩu (`/forgot-password`). |

#### 3.2.1.2 Use Case Description - UC01: Login
- **Use Case ID**: `UC01`
- **Use Case Name**: Login
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: ALL (Admin, Store Manager, Pharmacist, Cashier, Warehouse Manager, Warehouse Staff, General Manager)
- **Description**: Cho phép nhân viên xác thực vào Hệ thống Quản lý Nhà thuốc (Pharmacy Management System) bằng tên đăng nhập (hoặc email) và mật khẩu để truy cập vào các tính năng được phân quyền theo vai trò.
- **Precondition**:
  - `PRE-01`: Người dùng đã được cấp tài khoản hợp lệ trong hệ thống.
  - `PRE-02`: Tính năng đăng nhập đang hoạt động và người dùng có thể truy cập được trang web.
- **Trigger**:
  - `TRG-01`: Người dùng mở trình duyệt và truy cập vào đường dẫn đăng nhập (`/login`) hoặc bị chuyển hướng khi chưa xác thực.
- **Post-Condition**:
  - `POS-01`: Người dùng được xác thực thành công, hệ thống cấp JWT Access Token (trong Response body) và Refresh Token (qua HttpOnly Cookie).
  - `POS-02`: Phiên làm việc được thiết lập và người dùng được điều hướng đến Trang làm việc/Bảng điều khiển (Dashboard / POS Counter) tương ứng với vai trò.
  - `POS-03`: Hệ thống ghi nhật ký đăng nhập thành công vào bảng `audit_logs`.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Truy cập vào giao diện Đăng nhập hệ thống (`/login`). |
| 2 | System | Hiển thị biểu mẫu Đăng nhập (Login Form) với các trường thông tin theo Table 3-1. |
| 3 | User | Nhập `User Name / Email` và `Password`, sau đó bấm nút **Login** (hoặc nhấn phím `Enter`). |
| 4 | System | Kiểm tra tính hợp lệ về mặt dữ liệu đầu vào (Client-side validation: không được để trống, kiểm tra độ dài). |
| 5 | System | Gửi yêu cầu xác thực tới máy chủ Backend (`POST /api/v1/auth/login`). |
| 6 | System | Máy chủ kiểm tra tài khoản trong Database, đối soát mật khẩu đã mã hóa (BCrypt) và kiểm tra trạng thái tài khoản. |
| 7 | System | Tạo cặp Token: Access Token (15 phút) và Refresh Token (8 tiếng lưu vào DB & HttpOnly Cookie). |
| 8 | System | Ghi nhận nhật ký đăng nhập vào `audit_logs` (`LOGIN_SUCCESS`). |
| 9 | System | Thiết lập phiên đăng nhập tại Frontend và điều hướng người dùng tới màn hình làm việc tương ứng với quyền hạn (Role). |

##### Alternative flows
- **AT01: Để trống các trường bắt buộc (Tại Bước 4)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4.1 | System | Hiển thị thông báo lỗi kiểm tra: "Vui lòng nhập tên đăng nhập/email" hoặc "Vui lòng nhập mật khẩu". |
  | 4.2 | System | Giữ nguyên dữ liệu người dùng đã nhập và con trỏ chuột tập trung vào trường bị thiếu. |

- **AT02: Sai Tên đăng nhập hoặc Mật khẩu (Tại Bước 6)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 6.1 | System | Máy chủ trả về lỗi xác thực `401 Unauthorized`. |
  | 6.2 | System | Hiển thị thông báo lỗi: "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!". |
  | 6.3 | System | Tăng số lần đăng nhập sai liên tiếp của tài khoản. Xóa trắng trường mật khẩu để người dùng nhập lại. |

- **AT03: Tài khoản bị Khóa hoặc Ngừng hoạt động (Tại Bước 6)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 6.1 | System | Máy chủ kiểm tra thấy trạng thái tài khoản `status != 1` (Inactive/Locked). |
  | 6.2 | System | Hiển thị thông báo lỗi: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ Quản trị viên hệ thống!". |
  | 6.3 | System | Hủy bỏ quá trình đăng nhập và giữ người dùng ở lại màn hình đăng nhập. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Mật khẩu phải được băm bảo mật bằng thuật toán BCrypt trước khi lưu trữ hoặc đối soát. Tuyệt đối không lưu trữ hay ghi log mật khẩu dạng văn bản thô (Plain text). |
| **BR-02** | Trường `User Name / Email` không phân biệt chữ hoa chữ thường (Case-insensitive); trường `Password` phân biệt chặt chẽ chữ hoa chữ thường (Case-sensitive). |
| **BR-03** | Chỉ có tài khoản có trạng thái Hoạt động (`status = 1` - Active) mới được phép đăng nhập vào hệ thống. |
| **BR-04** | Nếu người dùng nhập sai mật khẩu liên tiếp quá 5 lần, hệ thống tự động khóa tài khoản tạm thời để ngăn chặn tấn công Brute-force. |
| **BR-05** | Access Token có thời hạn 15 phút. Hệ thống sử dụng cơ chế Refresh Token Rotation (RTR) với thời hạn 8 tiếng (tương đương 1 ca làm việc) lưu trong HttpOnly Cookie để tự động làm mới phiên làm việc ngầm mà không làm gián đoạn người dùng. |

---

### 3.2. Chức năng: Logout (Đăng xuất hệ thống)

#### Table 3-2: Screen Definition - Logout Component (Avatar Dropdown)
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | User Avatar / Name | Dropdown Trigger | - | - | Vị trí góc trên cùng bên phải thanh Header, hiển thị avatar và họ tên nhân viên đăng nhập. |
| 2 | Logout | Dropdown Item / Button | - | - | Khi bấm sẽ kích hoạt quy trình hủy phiên làm việc và đăng xuất. |
| 3 | Confirm Logout | Modal Button | - | - | Xác nhận đồng ý đăng xuất trong hộp thoại cảnh báo (nếu có đơn thuốc chưa lưu). |
| 4 | Cancel | Modal Button | - | - | Đóng hộp thoại xác nhận và tiếp tục ở lại phiên làm việc hiện tại. |

#### 3.2.2.2 Use Case Description - UC02: Logout
- **Use Case ID**: `UC02`
- **Use Case Name**: Logout
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: ALL (Tất cả người dùng đã đăng nhập)
- **Description**: Cho phép người dùng chủ động kết thúc phiên làm việc hiện tại, vô hiệu hóa các token xác thực và đưa hệ thống về trạng thái an toàn.
- **Precondition**:
  - `PRE-01`: Người dùng hiện đang ở trạng thái đã đăng nhập vào hệ thống.
- **Trigger**:
  - `TRG-01`: Người dùng bấm vào avatar ở thanh điều hướng trên cùng và chọn mục "Đăng xuất" (Logout).
- **Post-Condition**:
  - `POS-01`: Refresh Token bị thu hồi/xóa bỏ trong Database và HttpOnly Cookie bị xóa sạch khỏi trình duyệt.
  - `POS-02`: Trạng thái xác thực phía Client (Auth State/Memory) được giải phóng hoàn toàn.
  - `POS-03`: Trình duyệt tự động chuyển hướng về trang Đăng nhập (`/login`).
  - `POS-04`: Ghi nhật ký đăng xuất vào bảng `audit_logs` (`LOGOUT_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Bấm vào menu cá nhân (Avatar Dropdown) ở góc trên bên phải màn hình và chọn **Đăng xuất**. |
| 2 | System | Gửi yêu cầu đăng xuất tới máy chủ Backend: `POST /api/v1/auth/logout`. |
| 3 | System | Máy chủ thu hồi Refresh Token tương ứng trong Database (`is_revoked = 1` hoặc xóa token). |
| 4 | System | Máy chủ gửi chỉ thị xóa Cookie chứa Refresh Token (`Set-Cookie: refreshToken=; Max-Age=0`). |
| 5 | System | Ghi nhận nhật ký đăng xuất vào bảng `audit_logs`. |
| 6 | System | Phía Client xóa Access Token khỏi bộ nhớ cục bộ và Reset toàn bộ Auth State. |
| 7 | System | Điều hướng người dùng về màn hình Đăng nhập (`/login`). |

##### Alternative flows
- **AT01: Mất kết nối mạng hoặc Backend không phản hồi**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 2.1 | System | Client phát hiện mất kết nối mạng hoặc request timeout. |
  | 2.2 | System | Phía Client vẫn chủ động xóa sạch Access Token và thông tin phiên lưu trữ cục bộ để đảm bảo an toàn tuyệt đối. |
  | 2.3 | System | Chuyển hướng người dùng về trang `/login` kèm thông báo: "Đã kết thúc phiên làm việc trên thiết bị này". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Khi đăng xuất, Refresh Token bắt buộc phải bị vô hiệu hóa hoàn toàn trên cơ sở dữ liệu để ngăn chặn việc sử dụng lại token cũ. |
| **BR-02** | Nếu người dùng là Dược sĩ đang mở ca làm việc (Open Shift) tại quầy POS, hệ thống sẽ nhắc nhở người dùng cần bàn giao hoặc kết ca (Close Shift) trước khi đăng xuất. |

---

### 3.3. Chức năng: Change Password (Đổi mật khẩu tài khoản)

#### Table 3-3: Screen Definition - Change Password Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Current Password | Text (Password) | Yes | 32 | Mật khẩu hiện tại của người dùng để xác minh danh tính. |
| 2 | New Password | Text (Password) | Yes | 32 | Mật khẩu mới cần đổi. Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt. |
| 3 | Confirm New Password | Text (Password) | Yes | 32 | Nhập lại mật khẩu mới để đảm bảo tính chính xác, phải trùng khớp 100% với New Password. |
| 4 | Update Password | Button | - | - | Xác nhận đổi mật khẩu và cập nhật vào hệ thống. |
| 5 | Cancel | Button | - | - | Đóng hộp thoại đổi mật khẩu và không lưu thay đổi. |

#### 3.2.3.2 Use Case Description - UC03: Change Password
- **Use Case ID**: `UC03`
- **Use Case Name**: Change Password
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: ALL (Tất cả người dùng đã đăng nhập)
- **Description**: Cho phép người dùng chủ động thay đổi mật khẩu đăng nhập của chính mình nhằm tăng cường tính bảo mật cho tài khoản cá nhân.
- **Precondition**:
  - `PRE-01`: Người dùng đã đăng nhập thành công vào hệ thống.
- **Trigger**:
  - `TRG-01`: Người dùng bấm vào Avatar cá nhân và chọn mục "Đổi mật khẩu" (Change Password).
- **Post-Condition**:
  - `POS-01`: Mật khẩu mới được băm bảo mật bằng thuật toán BCrypt và cập nhật vào bảng `accounts`.
  - `POS-02`: Toàn bộ các Refresh Token cũ của tài khoản bị vô hiệu hóa (buộc các thiết bị khác phải đăng nhập lại).
  - `POS-03`: Hiển thị thông báo thành công và ghi nhận nhật ký vào `audit_logs` (`CHANGE_PASSWORD_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Chọn tính năng "Đổi mật khẩu" từ Avatar Dropdown. |
| 2 | System | Hiển thị Modal "Đổi Mật Khẩu" với các trường thông tin theo Table 3-3. |
| 3 | User | Nhập Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới, sau đó bấm **Cập nhật mật khẩu**. |
| 4 | System | Kiểm tra dữ liệu đầu vào: độ dài tối thiểu 8 ký tự, quy tắc bảo mật mật khẩu, so khớp mật khẩu mới và xác nhận mật khẩu. |
| 5 | System | Gửi yêu cầu cập nhật mật khẩu tới máy chủ: `POST /api/v1/profile/change-password`. |
| 6 | System | Máy chủ xác minh Mật khẩu hiện tại có đúng với mã băm trong DB hay không. |
| 7 | System | Máy chủ kiểm tra Mật khẩu mới không được trùng với Mật khẩu hiện tại. |
| 8 | System | Máy chủ băm Mật khẩu mới bằng BCrypt, cập nhật vào bảng `accounts`, vô hiệu hóa toàn bộ Refresh Token cũ và tạo cặp Token mới. |
| 9 | System | Ghi nhận nhật ký vào bảng `audit_logs`. |
| 10 | System | Hiển thị thông báo "Đổi mật khẩu thành công!" và đóng Modal. |

##### Alternative flows
- **AT01: Mật khẩu hiện tại không chính xác (Tại Bước 6)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 6.1 | System | Máy chủ trả về lỗi `400 Bad Request` với thông điệp: "Mật khẩu hiện tại không chính xác". |
  | 6.2 | System | Hiển thị thông báo lỗi và bôi đỏ trường "Current Password". Dữ liệu mật khẩu mới được giữ nguyên. |

- **AT02: Mật khẩu mới không khớp hoặc vi phạm độ phức tạp (Tại Bước 4)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4.1 | System | Hiển thị thông báo lỗi: "Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt" hoặc "Xác nhận mật khẩu mới không trùng khớp". |
  | 4.2 | System | Ngăn chặn việc gửi request lên server. |

- **AT03: Mật khẩu mới trùng với Mật khẩu cũ (Tại Bước 7)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 7.1 | System | Máy chủ phát hiện Mật khẩu mới trùng với Mật khẩu đang sử dụng. |
  | 7.2 | System | Trả về thông báo lỗi: "Mật khẩu mới không được trùng với mật khẩu hiện tại". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Mật khẩu mới phải có độ dài tối thiểu 8 ký tự, tối đa 32 ký tự, bắt buộc chứa đồng thời chữ in hoa, chữ in thường, chữ số và ký tự đặc biệt (`!@#$%^&*`). |
| **BR-02** | Mật khẩu mới không được phép trùng với mật khẩu hiện tại đang sử dụng. |
| **BR-03** | Khi đổi mật khẩu thành công, hệ thống phải tự động vô hiệu hóa toàn bộ các Refresh Token cũ đang lưu hành để đảm bảo an toàn nếu tài khoản bị xâm nhập trước đó. |

---

### 3.4. Chức năng: Manage Personal Information (Quản lý hồ sơ cá nhân)

#### Table 3-4: Screen Definition - Personal Information Page (`/profile`)
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Avatar | Image / Upload | No | - | Ảnh đại diện của nhân viên (hỗ trợ JPG, PNG, GIF, dung lượng tối đa 2MB). Cung cấp avatar mặc định nếu chưa cập nhật. |
| 2 | Full Name | Text | Yes | 100 | Họ và tên đầy đủ của nhân viên. |
| 3 | Username | Text (Read-only) | - | 50 | Tên đăng nhập tài khoản hệ thống (không cho phép chỉnh sửa). |
| 4 | Email | Text (Read-only) | - | 100 | Địa chỉ email của nhân viên gắn với tài khoản. |
| 5 | Phone Number | Text | Yes | 15 | Số điện thoại liên hệ cá nhân của nhân viên (chuẩn 10 chữ số). |
| 6 | Role | Badge (Read-only) | - | - | Vai trò công tác của nhân viên trong hệ thống (Admin, Pharmacist, Cashier...). |
| 7 | Assigned Store / Branch | Text (Read-only) | - | - | Tên chi nhánh/kho công tác được chỉ định của nhân viên. |
| 8 | Save Changes | Button | - | - | Lưu các thông tin cá nhân vừa cập nhật. |
| 9 | Cancel / Reset | Button | - | - | Khôi phục lại thông tin ban đầu khi chưa chỉnh sửa. |

#### 3.2.4.2 Use Case Description - UC04: Manage Personal Information
- **Use Case ID**: `UC04`
- **Use Case Name**: Manage Personal Information
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: ALL (Tất cả nhân viên đã đăng nhập)
- **Description**: Cho phép nhân viên xem và cập nhật thông tin hồ sơ cá nhân của mình bao gồm Họ tên, Số điện thoại và Ảnh đại diện nhằm đảm bảo hồ sơ nhân sự luôn chuẩn xác.
- **Precondition**:
  - `PRE-01`: Người dùng đã đăng nhập thành công vào hệ thống.
- **Trigger**:
  - `TRG-01`: Người dùng bấm vào Avatar góc trên bên phải và chọn mục "Thông tin cá nhân" (Personal Profile).
- **Post-Condition**:
  - `POS-01`: Thông tin hồ sơ cá nhân được cập nhật vào bảng `account_informations`.
  - `POS-02`: Hiển thị thông báo cập nhật thành công và ảnh avatar mới được cập nhật đồng bộ trên toàn bộ giao diện Header.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Chọn mục "Thông tin cá nhân" từ Avatar Dropdown trên Header. |
| 2 | System | Điều hướng tới trang Hồ sơ cá nhân (`/profile`) và gọi API `GET /api/v1/profile`. |
| 3 | System | Lấy dữ liệu từ bảng `accounts` và `account_informations`, hiển thị đầy đủ thông tin cá nhân theo Table 3-4. |
| 4 | User | Chỉnh sửa Họ tên, Số điện thoại hoặc tải lên ảnh Avatar mới. Bấm nút **Lưu thay đổi** (Save Changes). |
| 5 | System | Kiểm tra hợp lệ dữ liệu đầu vào (Họ tên không rỗng, Số điện thoại đúng định dạng 10 số di động Việt Nam). |
| 6 | System | Gửi yêu cầu cập nhật tới máy chủ: `PUT /api/v1/profile`. |
| 7 | System | Máy chủ kiểm tra số điện thoại (nếu thay đổi không được trùng lặp với tài khoản khác). |
| 8 | System | Cập nhật dữ liệu vào bảng `account_informations` và ghi nhận lịch sử vào `audit_logs`. |
| 9 | System | Trả về thông tin hồ sơ đã cập nhật (`200 OK`). Frontend cập nhật lại State và hiển thị thông báo "Cập nhật hồ sơ thành công!". |

##### Alternative flows
- **AT01: Định dạng số điện thoại không hợp lệ (Tại Bước 5)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 5.1 | System | Phát hiện số điện thoại không đúng chuẩn (phải gồm 10 chữ số và bắt đầu bằng các đầu số 03, 05, 07, 08, 09). |
  | 5.2 | System | Hiển thị thông báo lỗi: "Số điện thoại không đúng định dạng di động Việt Nam!". |

- **AT02: Ảnh đại diện vượt quá kích thước cho phép (Tại Bước 4)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4.1 | System | Phát hiện file ảnh tải lên có dung lượng vượt quá 2MB hoặc định dạng không hỗ trợ (chỉ chấp nhận PNG, JPG, JPEG, WEBP). |
  | 4.2 | System | Từ chối file và hiển thị cảnh báo: "Vui lòng chọn ảnh định dạng JPG/PNG dung lượng dưới 2MB!". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Các trường định danh hệ thống như `Username`, `Email`, `Role` (Vai trò) và `Assigned Store` (Chi nhánh trực thuộc) chỉ có tính chất hiển thị (Read-only), nhân viên không có quyền tự thay đổi mà phải do Quản trị viên (Admin) điều chuyển. |
| **BR-02** | Số điện thoại nhân viên phải là số điện thoại hợp lệ và duy nhất trong hệ thống nhân sự. |

---

### 3.5. Chức năng: Forgot Password (Quên mật khẩu & Khôi phục qua Email OTP)

#### Table 3-5: Screen Definition - Forgot Password Page (`/forgot-password`)
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Registered Email | Text | Yes | 100 | Địa chỉ email đã đăng ký gắn với tài khoản cần khôi phục. |
| 2 | Send Verification Code | Button | - | - | Gửi mã xác thực OTP 6 chữ số tới địa chỉ email của người dùng. |
| 3 | OTP Code | Text | Yes | 6 | Mã số xác thực gồm 6 chữ số nhận qua email (có hiệu lực trong 15 phút). |
| 4 | New Password | Text (Password) | Yes | 32 | Mật khẩu mới cần thiết lập. |
| 5 | Confirm New Password | Text (Password) | Yes | 32 | Nhập lại mật khẩu mới để xác nhận. |
| 6 | Reset Password | Button | - | - | Xác nhận mã OTP và cập nhật mật khẩu mới. |
| 7 | Back to Login | Hyperlink | - | - | Quay trở lại màn hình Đăng nhập (`/login`). |

#### 3.2.5.2 Use Case Description - UC05: Forgot Password
- **Use Case ID**: `UC05`
- **Use Case Name**: Forgot Password
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: ALL (Người dùng có tài khoản nhưng quên mật khẩu)
- **Description**: Cho phép người dùng khôi phục lại quyền truy cập tài khoản khi bị quên mật khẩu bằng cách xác thực qua mã OTP được gửi tự động tới địa chỉ email đăng ký.
- **Precondition**:
  - `PRE-01`: Tài khoản người dùng có tồn tại trong hệ thống và đã được liên kết với một địa chỉ email hợp lệ.
  - `PRE-02`: Dịch vụ gửi email SMTP của hệ thống đang hoạt động bình thường.
- **Trigger**:
  - `TRG-01`: Tại màn hình Đăng nhập, người dùng bấm vào liên kết "Quên mật khẩu?" (Forgot Password?).
- **Post-Condition**:
  - `POS-01`: Mã OTP xác thực được sinh ra, băm an toàn và lưu vào bảng `password_reset_tokens`.
  - `POS-02`: Sau khi xác thực OTP thành công, mật khẩu mới được băm bằng BCrypt và cập nhật vào bảng `accounts`.
  - `POS-03`: Mã OTP được đánh dấu đã sử dụng (`used = 1`) và người dùng có thể dùng mật khẩu mới để đăng nhập.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Tại màn hình Đăng nhập, bấm vào liên kết **Quên mật khẩu?**. |
| 2 | System | Hiển thị màn hình Khôi phục mật khẩu (`/forgot-password`). |
| 3 | User | Nhập địa chỉ Email đăng ký và bấm nút **Gửi mã xác thực** (Send Code). |
| 4 | System | Kiểm tra định dạng email và đối soát trong Database (`dbo.accounts`). |
| 5 | System | Sinh mã OTP ngẫu nhiên 6 chữ số, thiết lập thời hạn hết hạn là 15 phút và lưu vào bảng `password_reset_tokens`. |
| 6 | System | Gửi email chứa mã OTP và hướng dẫn bảo mật tới hòm thư người dùng qua giao thức SMTP. |
| 7 | System | Hiển thị bước 2: nhập mã OTP và đặt mật khẩu mới. |
| 8 | User | Nhập mã OTP nhận được từ email, nhập Mật khẩu mới và Xác nhận mật khẩu mới, sau đó bấm **Đặt lại mật khẩu** (Reset Password). |
| 9 | System | Kiểm tra mã OTP: đúng mã, chưa hết hạn và chưa từng được sử dụng. |
| 10 | System | Băm mật khẩu mới bằng BCrypt, cập nhật vào bảng `accounts`, đánh dấu mã OTP đã sử dụng. |
| 11 | System | Ghi nhận nhật ký vào bảng `audit_logs` (`RESET_PASSWORD_SUCCESS`). |
| 12 | System | Hiển thị thông báo "Đặt lại mật khẩu thành công!" và tự động chuyển hướng về trang Đăng nhập (`/login`). |

##### Alternative flows
- **AT01: Email không tồn tại trong hệ thống (Tại Bước 4)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4.1 | System | Không tìm thấy tài khoản nào khớp với địa chỉ email đã nhập. |
  | 4.2 | System | Hiển thị thông báo: "Không tìm thấy tài khoản với email này trong hệ thống. Vui lòng kiểm tra lại!". |

- **AT02: Mã OTP không chính xác hoặc đã hết hạn (Tại Bước 9)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 9.1 | System | Máy chủ phát hiện mã OTP nhập sai hoặc thời gian yêu cầu đã vượt quá 15 phút. |
  | 9.2 | System | Hiển thị thông báo lỗi: "Mã xác thực OTP không đúng hoặc đã hết hạn. Vui lòng bấm gửi lại mã mới!". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Mã xác thực OTP bao gồm đúng 6 chữ số ngẫu nhiên, chỉ có giá trị sử dụng một lần duy nhất (One-time use) và tự động hết hạn sau 15 phút kể từ thời điểm gửi. |
| **BR-02** | Hệ thống áp dụng cơ chế Rate Limiting: một địa chỉ email chỉ được phép yêu cầu gửi lại mã OTP tối đa 3 lần trong vòng 10 phút để tránh bị spam thư rác. |
| **BR-03** | Mật khẩu mới đặt lại phải tuân thủ nghiêm ngặt chuẩn độ phức tạp (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt). |

