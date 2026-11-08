# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - CỤM CHỨC NĂNG 2: CUSTOMER MANAGEMENT

---

## 1. TỔNG QUAN CỤM CHỨC NĂNG
Cụm chức năng **Customer Management** (Quản lý Khách hàng) phục vụ công tác định danh khách hàng bán lẻ tại nhà thuốc, quản lý hồ sơ sức khỏe và bệnh lý cá nhân (Customer Health Profile: tiền sử dị ứng thuốc, bệnh mãn tính, thai kỳ/cho con bú), tích lũy điểm thưởng thành viên và lưu vết toàn diện các giao dịch mua hàng nhằm đảm bảo an toàn sử dụng thuốc theo tiêu chuẩn Thực hành tốt nhà thuốc (GPP).

---

## 2. DANH SÁCH USE CASE TRONG CỤM
- **UC29**: Register New Customer (Đăng ký khách hàng mới)
- **UC30**: Edit Customer (Chỉnh sửa thông tin khách hàng)
- **UC31**: View Customer (Xem chi tiết hồ sơ khách hàng & cảnh báo dị ứng)
- **UC32**: View Customer List (Tra cứu danh bạ khách hàng)
- **UC33**: Delete Customer (Ngừng theo dõi / Xóa khách hàng)

---

## 3. CHI TIẾT YÊU CẦU & ĐẶC TẢ TỪNG CHỨC NĂNG

### 3.1. Chức năng: Register New Customer (Đăng ký khách hàng mới)

#### Table 3-6: Screen Definition - Customer Registration Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Full Name | Text | Yes | 100 | Họ và tên đầy đủ của khách hàng. |
| 2 | Phone Number | Text | Yes | 15 | Số điện thoại di động của khách hàng (10 chữ số, dùng làm khóa tra cứu và tích điểm). |
| 3 | Gender | Select | Yes | - | Giới tính khách hàng (`Nam`, `Nữ`, `Khác`). |
| 4 | Date of Birth | Date Picker | No | - | Ngày tháng năm sinh của khách hàng (định dạng `dd/MM/yyyy`). Không được chọn ngày trong tương lai. |
| 5 | Email | Text | No | 100 | Địa chỉ email của khách hàng để nhận hóa đơn điện tử. |
| 6 | Address | Text | No | 255 | Địa chỉ cư trú hoặc nơi liên hệ của khách hàng. |
| 7 | Height (cm) | Number | No | - | Chiều cao của khách hàng tính bằng cm (VD: 165). |
| 8 | Weight (kg) | Number | No | - | Cân nặng của khách hàng tính bằng kg (VD: 60.5). |
| 9 | Allergies | Textarea | No | 500 | Tiền sử dị ứng thuốc và hoạt chất (VD: `Amoxicillin, Penicillin`). Rất quan trọng để hiển thị cảnh báo đỏ tại quầy POS. |
| 10 | Chronic Diseases | Textarea | No | 500 | Bệnh lý mãn tính hoặc tiền sử bệnh (VD: `Tiểu đường Type 2, Tăng huyết áp, Suy thận`). |
| 11 | Current Medications | Textarea | No | 500 | Các thuốc đang sử dụng tại nhà để dược sĩ kiểm tra tương tác thuốc. |
| 12 | Pregnant? | Checkbox | No | - | Đang mang thai (Dùng để cảnh báo chống chỉ định thuốc cho phụ nữ có thai). |
| 13 | Breastfeeding? | Checkbox | No | - | Đang cho con bú (Dùng để cảnh báo chống chỉ định thuốc qua sữa mẹ). |
| 14 | Medical Notes | Textarea | No | 1000 | Ghi chú tư vấn dược lâm sàng đặc biệt của dược sĩ. |
| 15 | Save Customer | Button | - | - | Xác thực dữ liệu và tạo mới hồ sơ khách hàng vào hệ thống. |
| 16 | Cancel | Button | - | - | Hủy bỏ thao tác và đóng Modal. |

#### 3.2.6.2 Use Case Description - UC29: Register New Customer
- **Use Case ID**: `UC29`
- **Use Case Name**: Register New Customer
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist (Dược sĩ bán thuốc), Store Manager (Quản lý cửa hàng), Admin (Quản trị viên)
- **Description**: Cho phép Dược sĩ tiếp nhận thông tin và tạo mới hồ sơ khách hàng kèm theo hồ sơ sức khỏe (Health Profile) ngay tại quầy POS hoặc màn hình Danh bạ khách hàng.
- **Precondition**:
  - `PRE-01`: Nhân viên đã đăng nhập vào hệ thống với vai trò được cấp phép.
- **Trigger**:
  - `TRG-01`: Dược sĩ bấm nút "+ Thêm khách hàng mới" tại trang Danh bạ khách hàng hoặc bấm "+ Thêm mới" khi tra cứu SĐT tại quầy POS.
- **Post-Condition**:
  - `POS-01`: Thông tin khách hàng được lưu vào bảng `customers` với mã tự sinh duy nhất (VD: `KH-000123`).
  - `POS-02`: Hồ sơ bệnh lý và dị ứng được lưu vào bảng `customer_health_profiles`.
  - `POS-03`: Tự động gán khách hàng vừa tạo vào đơn hàng hiện tại nếu đang thao tác tại quầy POS.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Bấm nút **+ Thêm khách hàng** (hoặc mở Modal khi tra cứu SĐT chưa có trên giỏ hàng POS). |
| 2 | System | Hiển thị biểu mẫu Đăng ký khách hàng mới (Customer Registration Modal) theo Table 3-6. |
| 3 | User | Nhập thông tin bắt buộc: Họ tên, Số điện thoại, Giới tính và các thông tin bệnh lý/dị ứng thuốc (nếu có). Bấm **Lưu khách hàng**. |
| 4 | System | Kiểm tra định dạng dữ liệu đầu vào: Họ tên tối đa 100 ký tự, SĐT đúng 10 số di động Việt Nam, ngày sinh không vượt quá ngày hiện tại. |
| 5 | System | Gửi yêu cầu tạo mới tới máy chủ: `POST /api/v1/customers`. |
| 6 | System | Máy chủ kiểm tra tính duy nhất của Số điện thoại trong bảng `customers`. |
| 7 | System | Máy chủ tạo bản ghi trong bảng `customers`, tạo bản ghi trong bảng `customer_health_profiles`, khởi tạo điểm tích lũy ban đầu = 0. |
| 8 | System | Ghi nhận nhật ký kiểm toán vào bảng `audit_logs` (`CREATE_CUSTOMER_SUCCESS`). |
| 9 | System | Trả về thông tin khách hàng đã tạo thành công (`201 Created`). |
| 10 | System | Đóng modal, hiển thị thông báo "Tạo hồ sơ khách hàng thành công!" và tự động cập nhật vào danh bạ/giỏ hàng POS. |

##### Alternative flows
- **AT01: Trùng lặp số điện thoại khách hàng (Tại Bước 6)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 6.1 | System | Máy chủ phát hiện số điện thoại này đã thuộc về khách hàng khác trong hệ thống. |
  | 6.2 | System | Trả về mã lỗi `409 Conflict` kèm thông báo: "Số điện thoại đã được đăng ký bởi khách hàng: [Tên khách hàng]". |
  | 6.3 | System | Gợi ý cho Dược sĩ chọn ngay khách hàng đó vào đơn hàng thay vì đăng ký lại. |

- **AT02: Số điện thoại sai quy cách (Tại Bước 4)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 4.1 | System | Phát hiện số điện thoại không hợp lệ (không đủ 10 số hoặc không bắt đầu bằng 03, 05, 07, 08, 09). |
  | 4.2 | System | Hiển thị lỗi kiểm tra đỏ dưới trường Phone: "Số điện thoại không đúng chuẩn di động Việt Nam". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Số điện thoại là khóa định danh khách hàng duy nhất trong toàn bộ hệ thống chuỗi nhà thuốc. |
| **BR-02** | Khách hàng mới tạo luôn có số điểm tích lũy khởi tạo là `0` và hạng thành viên mặc định là `Standard` (Thành viên tiêu chuẩn). |
| **BR-03** | Nếu khách hàng có khai báo tiền sử dị ứng thuốc (`allergies`), hệ thống bắt buộc phải lưu trữ và kích hoạt cờ cảnh báo nguy cơ dị ứng khi kê đơn thuốc chứa hoạt chất đó tại quầy POS. |

---

### 3.2. Chức năng: Edit Customer (Chỉnh sửa thông tin khách hàng)

#### Table 3-7: Screen Definition - Customer Edit Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Customer Code | Text (Read-only) | - | 20 | Mã khách hàng duy nhất được cấp (VD: `KH-000105`). Không cho phép sửa đổi. |
| 2 | Full Name | Text | Yes | 100 | Họ và tên của khách hàng. |
| 3 | Phone Number | Text | Yes | 15 | Số điện thoại liên hệ của khách hàng. |
| 4 | Gender | Select | Yes | - | Giới tính (`Nam`, `Nữ`, `Khác`). |
| 5 | Date of Birth | Date Picker | No | - | Ngày sinh của khách hàng. |
| 6 | Email | Text | No | 100 | Địa chỉ email liên hệ. |
| 7 | Address | Text | No | 255 | Địa chỉ khách hàng. |
| 8 | Allergies | Textarea | No | 500 | Tiền sử dị ứng thuốc được cập nhật bổ sung. |
| 9 | Chronic Diseases | Textarea | No | 500 | Bệnh mãn tính cập nhật bổ sung. |
| 10 | Save Changes | Button | - | - | Lưu các thông tin đã chỉnh sửa vào hệ thống. |
| 11 | Cancel | Button | - | - | Đóng Modal và không áp dụng các thay đổi. |

#### 3.2.7.2 Use Case Description - UC30: Edit Customer
- **Use Case ID**: `UC30`
- **Use Case Name**: Edit Customer
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Store Manager, Admin
- **Description**: Cho phép nhân viên cập nhật thông tin cá nhân và cập nhật hồ sơ bệnh lý, dị ứng thuốc của khách hàng khi có thông tin mới phát sinh.
- **Precondition**:
  - `PRE-01`: Khách hàng đã tồn tại trong cơ sở dữ liệu hệ thống.
- **Trigger**:
  - `TRG-01`: Người dùng bấm vào nút "Chỉnh sửa" (Icon cây bút) tại dòng khách hàng trong danh bạ hoặc từ modal chi tiết.
- **Post-Condition**:
  - `POS-01`: Các trường thông tin chỉnh sửa được cập nhật vào bảng `customers` và `customer_health_profiles`.
  - `POS-02`: Ghi nhận nhật ký sửa đổi vào bảng `audit_logs` (`UPDATE_CUSTOMER_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Tại Danh bạ khách hàng, bấm nút **Sửa** tại dòng khách hàng cần cập nhật. |
| 2 | System | Mở Modal "Chỉnh Sửa Hồ Sơ Khách Hàng", tải và điền sẵn dữ liệu hiện tại theo Table 3-7. |
| 3 | User | Chỉnh sửa các trường thông tin cần thiết (Họ tên, SĐT, Tiền sử dị ứng mới...) và bấm **Lưu thay đổi**. |
| 4 | System | Kiểm tra hợp lệ dữ liệu đầu vào. |
| 5 | System | Gửi yêu cầu cập nhật lên máy chủ: `PUT /api/v1/customers/{id}`. |
| 6 | System | Máy chủ kiểm tra nếu SĐT thay đổi thì không được trùng với bất kỳ khách hàng nào khác. |
| 7 | System | Cập nhật bản ghi trong cơ sở dữ liệu và ghi log kiểm toán. |
| 8 | System | Trả về thông tin cập nhật thành công (`200 OK`). Giao diện danh bạ tự động làm mới và thông báo hoàn tất. |

##### Alternative flows
- **AT01: SĐT mới bị trùng với khách hàng khác (Tại Bước 6)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 6.1 | System | Máy chủ kiểm tra thấy SĐT mới nhập đã tồn tại trên một khách hàng khác. |
  | 6.2 | System | Báo lỗi `409 Conflict`: "Số điện thoại này đã được sử dụng bởi một khách hàng khác!". |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Mã khách hàng (`customer_code`) và Điểm tích lũy (`loyalty_points`) không được phép chỉnh sửa thủ công từ form cập nhật thông tin cá nhân. |
| **BR-02** | Mọi thay đổi về tiền sử dị ứng thuốc phải có hiệu lực ngay lập tức tại các quầy bán thuốc POS trong toàn hệ thống chuỗi. |

---

### 3.3. Chức năng: View Customer (Xem chi tiết hồ sơ khách hàng & cảnh báo dị ứng)

#### Table 3-8: Screen Definition - Customer Detail Modal
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Customer Code & Name | Header | - | - | Hiển thị mã khách hàng (in đậm) và họ tên khách hàng. |
| 2 | Loyalty Points | Badge | - | - | Tổng số điểm tích lũy hiện có của khách hàng (VD: `350 điểm`). |
| 3 | Contact Info | Info Card | - | - | Số điện thoại, Email, Địa chỉ, Giới tính, Ngày sinh, Tuổi. |
| 4 | Allergy Warning Banner | Alert Banner (Red) | - | - | Khung cảnh báo đỏ nổi bật: hiển thị danh sách các thuốc/hoạt chất khách hàng bị dị ứng nghiêm trọng. |
| 5 | Health Profile Info | Info Card | - | - | Chiều cao, Cân nặng, BMI, Bệnh mãn tính, Thuốc đang dùng, Trạng thái mang thai/cho con bú. |
| 6 | Purchase Summary | Info Card | - | - | Tổng chi tiêu tích lũy trọn đời, số lần mua hàng, ngày mua gần nhất. |
| 7 | View Purchase History | Button | - | - | Mở lịch sử các hóa đơn mua thuốc cũ của khách hàng (UC26). |
| 8 | Close | Button | - | - | Đóng Modal chi tiết. |

#### 3.2.8.2 Use Case Description - UC31: View Customer
- **Use Case ID**: `UC31`
- **Use Case Name**: View Customer
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Store Manager, Admin
- **Description**: Cho phép Dược sĩ xem toàn diện thông tin lâm sàng của khách hàng, bao gồm tiền sử bệnh lý, dị ứng thuốc và lịch sử chi tiêu để hỗ trợ ra quyết định bán thuốc an toàn.
- **Precondition**:
  - `PRE-01`: Khách hàng có tồn tại trong hệ thống.
- **Trigger**:
  - `TRG-01`: Dược sĩ bấm vào tên khách hàng hoặc nút "Xem chi tiết" (Icon con mắt) trên bảng danh bạ.
- **Post-Condition**:
  - `POS-01`: Toàn bộ thông tin khách hàng và hồ sơ sức khỏe được tải và hiển thị trực quan.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Bấm nút **Xem chi tiết** tại dòng khách hàng mong muốn. |
| 2 | System | Gửi yêu cầu lấy chi tiết tới máy chủ: `GET /api/v1/customers/{id}`. |
| 3 | System | Máy chủ truy vấn bảng `customers`, `customer_health_profiles` và tổng hợp thống kê hóa đơn từ `sales_invoices`. |
| 4 | System | Hiển thị Modal "Chi Tiết Khách Hàng & Sổ Sức Khỏe" với các khối thông tin theo Table 3-8. |
| 5 | System | Nếu khách hàng có tiền sử dị ứng, làm nổi bật khung cảnh báo màu đỏ với icon nguy hiểm ⚠️. |
| 6 | User | Đọc thông tin tư vấn và bấm nút **Đóng** khi hoàn tất. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Cảnh báo dị ứng thuốc phải luôn được ưu tiên hiển thị ở vị trí dễ nhìn nhất với màu đỏ cảnh báo để Dược sĩ nhận diện tức thì nguy cơ sốc phản vệ hoặc ngộ độc thuốc. |

---

### 3.4. Chức năng: View Customer List (Tra cứu danh bạ khách hàng)

#### Table 3-9: Screen Definition - Customer Directory Page (`/customers`)
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Search Box | Text Input | No | 100 | Ô tìm kiếm đa năng: tìm kiếm theo Tên khách hàng, Số điện thoại hoặc Mã khách hàng. |
| 2 | Allergy Filter | Select | No | - | Bộ lọc khách hàng theo trạng thái dị ứng (`Tất cả`, `Có tiền sử dị ứng`, `Không có dị ứng`). |
| 3 | Customer Table | Data Table | - | - | Bảng danh sách khách hàng gồm các cột: Mã KH, Họ tên, Số điện thoại, Giới tính, Điểm tích lũy, Cảnh báo dị ứng, Thao tác. |
| 4 | Add Customer Button | Button | - | - | Nút bấm mở Modal đăng ký khách hàng mới (UC29). |
| 5 | Pagination Controls | Pagination | - | - | Điều khiển phân trang (Trang trước, Trang sau, Chọn số lượng bản ghi hiển thị: 10, 25, 50). |

#### 3.2.9.2 Use Case Description - UC32: View Customer List
- **Use Case ID**: `UC32`
- **Use Case Name**: View Customer List
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Pharmacist, Store Manager, Admin
- **Description**: Cung cấp danh bạ khách hàng toàn chuỗi nhà thuốc với công cụ tìm kiếm nhanh theo số điện thoại và lọc theo nhóm dị ứng phục vụ tra cứu hàng ngày.
- **Precondition**:
  - `PRE-01`: Người dùng đã đăng nhập vào hệ thống.
- **Trigger**:
  - `TRG-01`: Người dùng chọn menu "Khách hàng" trên thanh điều hướng Sidebar.
- **Post-Condition**:
  - `POS-01`: Danh sách khách hàng được tải và hiển thị dạng bảng có phân trang rõ ràng.

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Điều hướng tới trang **Danh bạ Khách hàng** (`/customers`). |
| 2 | System | Gửi yêu cầu lấy danh sách khách hàng tới máy chủ: `GET /api/v1/customers?page=0&size=10`. |
| 3 | System | Máy chủ truy vấn danh sách khách hàng trong Database và trả về danh sách kèm thông tin phân trang. |
| 4 | System | Hiển thị bảng danh bạ khách hàng theo Table 3-9. |
| 5 | User | Nhập số điện thoại hoặc họ tên vào ô tìm kiếm. |
| 6 | System | Tự động lọc danh sách khách hàng theo từ khóa sau 300ms (Debounce). |
| 7 | User | Xem danh sách hoặc sử dụng các nút thao tác trên từng dòng (Xem chi tiết, Sửa, Xóa). |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Bảng danh bạ khách hàng được áp dụng phân trang ở cấp độ Database (Server-side pagination) để đảm bảo tốc độ phản hồi tối ưu khi số lượng khách hàng lên đến hàng trăm nghìn bản ghi. |
| **BR-02** | Khách hàng có tiền sử dị ứng thuốc được gắn huy hiệu cảnh báo màu cam/đỏ trực tiếp ngay trên bảng để nhân viên dễ dàng nhận biết. |

---

### 3.5. Chức năng: Delete Customer (Ngừng theo dõi / Xóa khách hàng)

#### Table 3-10: Screen Definition - Delete Customer Confirmation Dialog
| # | Field Name | Type | Mandatory | Max Length | Description |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | Confirmation Message | Text (Alert) | - | - | Thông điệp xác nhận: "Bạn có chắc chắn muốn xóa/ngừng theo dõi khách hàng [Tên KH] - SĐT: [SĐT] không?". |
| 2 | Dependency Warning | Text (Warning) | - | - | Cảnh báo về hóa đơn và lịch sử tích điểm của khách hàng sẽ được bảo lưu. |
| 3 | Confirm Delete | Button | - | - | Xác nhận thực hiện xóa khách hàng. |
| 4 | Cancel | Button | - | - | Đóng hộp thoại và giữ nguyên khách hàng. |

#### 3.2.10.2 Use Case Description - UC33: Delete Customer
- **Use Case ID**: `UC33`
- **Use Case Name**: Delete Customer
- **Author**: NamNT
- **Version**: 1.0
- **Date**: 4/10/2026
- **Actor**: Store Manager, Admin
- **Description**: Cho phép Quản lý cửa hàng hoặc Quản trị viên xóa (Soft Delete / Hủy kích hoạt) khách hàng khỏi danh bạ hoạt động mà không làm ảnh hưởng đến tính toàn vẹn của dữ liệu hóa đơn tài chính đã xuất trước đó.
- **Precondition**:
  - `PRE-01`: Người dùng có quyền Quản lý cửa hàng (Store Manager) hoặc Quản trị viên (Admin).
  - `PRE-02`: Khách hàng đang ở trạng thái hoạt động.
- **Trigger**:
  - `TRG-01`: Người dùng bấm nút "Xóa" (Icon thùng rác) tại dòng khách hàng trong bảng danh bạ.
- **Post-Condition**:
  - `POS-01`: Trạng thái của khách hàng được cập nhật thành đã ngừng hoạt động (`status = 0` / Soft Delete).
  - `POS-02`: Khách hàng không còn xuất hiện trong kết quả tìm kiếm danh bạ thông thường tại quầy bán thuốc.
  - `POS-03`: Toàn bộ hóa đơn bán lẻ lịch sử của khách hàng vẫn được bảo lưu vẹn toàn.
  - `POS-04`: Ghi nhật ký vào bảng `audit_logs` (`DELETE_CUSTOMER_SUCCESS`).

##### Main flows
| Step | Actor | Action |
| :---: | :--- | :--- |
| 1 | User | Bấm nút **Xóa** tại dòng khách hàng cần xóa trong danh bạ. |
| 2 | System | Hiển thị Hộp thoại xác nhận xóa (Delete Confirmation Dialog) theo Table 3-10. |
| 3 | User | Bấm nút **Xác nhận xóa**. |
| 4 | System | Gửi yêu cầu xóa tới máy chủ: `DELETE /api/v1/customers/{id}`. |
| 5 | System | Máy chủ kiểm tra quyền hạn của người thực hiện (chỉ Admin hoặc Store Manager). |
| 6 | System | Máy chủ thực hiện Soft Delete: cập nhật `status = 0` cho bản ghi khách hàng trong bảng `customers`. |
| 7 | System | Ghi nhận nhật ký kiểm toán vào bảng `audit_logs`. |
| 8 | System | Trả về thông báo thành công (`200 OK`). Danh bạ khách hàng tự động loại bỏ bản ghi và hiển thị thông báo "Đã xóa khách hàng thành công!". |

##### Alternative flows
- **AT01: Người dùng hủy thao tác (Tại Bước 3)**
  | Sub step | Actor | Action |
  | :---: | :--- | :--- |
  | 3.1 | User | Bấm nút "Hủy bỏ" hoặc click ra ngoài hộp thoại. |
  | 3.2 | System | Đóng hộp thoại xác nhận, không thực hiện bất kỳ thay đổi nào trong cơ sở dữ liệu. |

##### Business Rules
| # | Rule Description |
| :---: | :--- |
| **BR-01** | Tuyệt đối không xóa vật lý (Hard Delete) bản ghi khách hàng đã có liên kết hóa đơn bán lẻ trong bảng `sales_invoices` nhằm đảm bảo nguyên tắc toàn vẹn dữ liệu kế toán và sổ sách dược GPP. |
| **BR-02** | Dược sĩ bán thuốc thông thường (Pharmacist) không có quyền xóa khách hàng, chỉ có Store Manager và Admin mới có quyền thực hiện thao tác này. |
