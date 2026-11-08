# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS - SOFTWARE REQUIREMENTS SPECIFICATION)
## HỆ THỐNG QUẢN LÝ CHUỖI NHÀ THUỐC (PHARMACY CHAIN MANAGEMENT SYSTEM)

---

### MỤC LỤC TÀI LIỆU SRS
| STT | Mã Cụm | Tên Cụm Chức Năng | File Đặc Tả | Danh Sách Use Cases |
| :---: | :---: | :--- | :--- | :--- |
| 1 | **AUTH** | Authentication | [01_SRS_Authentication.md](./01_SRS_Authentication.md) | `UC01` Login<br>`UC02` Logout<br>`UC03` Change Password<br>`UC04` Manage Personal Information<br>`UC05` Forgot Password |
| 2 | **CUST** | Customer Management | [02_SRS_Customer_Management.md](./02_SRS_Customer_Management.md) | `UC29` Register New Customer<br>`UC30` Edit Customer<br>`UC31` View Customer Detail<br>`UC32` View Customer List<br>`UC33` Delete Customer |
| 3 | **SHFT** | Shift Management | [03_SRS_Shift_Management.md](./03_SRS_Shift_Management.md) | `UC21` Open Shift<br>`UC22` Close Shift |
| 4 | **SALE** | Sales Management | [04_SRS_Sales_Management.md](./04_SRS_Sales_Management.md) | `UC23` Create Sales Invoice<br>`UC24` Process Payment (Cash & PayOS QR)<br>`UC25` Cancel/Return Sales Invoice<br>`UC26` View Customer Purchase History |

---

### QUY ƯỚC CHUẨN TÀI LIỆU
1. **Screen Definition (Table 3-X)**: Định nghĩa chi tiết từng trường dữ liệu trên màn hình, kiểu dữ liệu, tính bắt buộc, độ dài tối đa và diễn giải nghiệp vụ.
2. **Use Case Description (3.X.X.X)**:
   - Thông tin định danh: Mã UC, Tên UC, Tác giả (`NamNT`), Phiên bản (`1.0`), Ngày lập (`4/10/2026`), Vai trò (`Actor`).
   - Tiền điều kiện (`Precondition`), Điều kiện kích hoạt (`Trigger`), Hậu điều kiện (`Post-condition`).
   - Luồng sự kiện chính (`Main flows`).
   - Các luồng rẽ nhánh / ngoại lệ (`Alternative flows`: AT01, AT02...).
   - Các quy tắc nghiệp vụ cốt lõi (`Business Rules`: BR-01, BR-02...).

