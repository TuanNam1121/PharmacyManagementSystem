# HƯỚNG DẪN SỬ DỤNG SEQUENCE DIAGRAMS VỚI SEQUENCEDIAGRAM.ORG
## HỆ THỐNG QUẢN LÝ CHUỖI NHÀ THUỐC (PHARMACY CHAIN MANAGEMENT SYSTEM)

---

### 1. HƯỚNG DẪN RENDER & XUẤT ẢNH TRÊN HTTPS://SEQUENCEDIAGRAM.ORG/
Toàn bộ 16 Sequence Diagrams chi tiết của 4 cụm chức năng đã được viết chuẩn theo cú pháp **PlantUML / sequencediagram.org** và xuất thành 2 định dạng:
- **File `.txt`**: Dùng để copy toàn bộ nội dung dán trực tiếp vào khung soạn thảo của [sequencediagram.org](https://sequencediagram.org/).
- **File `.puml`**: Dùng cho tiện ích mở rộng PlantUML trên VS Code, IntelliJ IDEA hoặc render offline.

#### Các bước thực hiện:
1. Truy cập vào trang web: [https://sequencediagram.org/](https://sequencediagram.org/).
2. Mở file `.txt` (hoặc `.puml`) của chức năng tương ứng, sao chép toàn bộ văn bản (`Ctrl + A`, `Ctrl + C`).
3. Dán (`Ctrl + V`) vào khung soạn thảo bên trái của `sequencediagram.org`. Biểu đồ Sequence Diagram chuẩn sắc nét sẽ lập tức được render tự động ở khung bên phải.
4. Để xuất file ảnh:
   - Bấm vào menu **Export** trên thanh công cụ của `sequencediagram.org`.
   - Chọn định dạng: **PNG**, **SVG** (vector siêu nét cho báo cáo Word), hoặc **PDF / URL**.

---

### 2. DANH MỤC 16 SEQUENCE DIAGRAMS CHI TIẾT

#### Cụm 1: Authentication (Xác thực & Bảo mật)
| Mã | Tên Use Case | File PlantUML (.puml) | File Văn Bản (.txt) |
| :---: | :--- | :--- | :--- |
| **SQ01** | Login (JWT & Refresh Token Rotation) | [SQ01_Login.puml](./01_Authentication/SQ01_Login.puml) | [SQ01_Login.txt](./01_Authentication/SQ01_Login.txt) |
| **SQ02** | Logout (Token Revocation & Clear Cookie) | [SQ02_Logout.puml](./01_Authentication/SQ02_Logout.puml) | [SQ02_Logout.txt](./01_Authentication/SQ02_Logout.txt) |
| **SQ03** | Change Password (BCrypt & Revoke Old Tokens) | [SQ03_Change_Password.puml](./01_Authentication/SQ03_Change_Password.puml) | [SQ03_Change_Password.txt](./01_Authentication/SQ03_Change_Password.txt) |
| **SQ04** | Manage Personal Information (Get & Update Profile) | [SQ04_Manage_Personal_Info.puml](./01_Authentication/SQ04_Manage_Personal_Info.puml) | [SQ04_Manage_Personal_Info.txt](./01_Authentication/SQ04_Manage_Personal_Info.txt) |
| **SQ05** | Forgot Password (SMTP OTP Email & Reset) | [SQ05_Forgot_Password.puml](./01_Authentication/SQ05_Forgot_Password.puml) | [SQ05_Forgot_Password.txt](./01_Authentication/SQ05_Forgot_Password.txt) |

#### Cụm 2: Customer Management (Quản lý Khách hàng)
| Mã | Tên Use Case | File PlantUML (.puml) | File Văn Bản (.txt) |
| :---: | :--- | :--- | :--- |
| **SQ06** | Register New Customer (Health Profile & Allergies) | [SQ06_Register_New_Customer.puml](./02_Customer_Management/SQ06_Register_New_Customer.puml) | [SQ06_Register_New_Customer.txt](./02_Customer_Management/SQ06_Register_New_Customer.txt) |
| **SQ07** | Edit Customer (Update Info & Allergies) | [SQ07_Edit_Customer.puml](./02_Customer_Management/SQ07_Edit_Customer.puml) | [SQ07_Edit_Customer.txt](./02_Customer_Management/SQ07_Edit_Customer.txt) |
| **SQ08** | View Customer Detail & Allergy Alert | [SQ08_View_Customer_Detail.puml](./02_Customer_Management/SQ08_View_Customer_Detail.puml) | [SQ08_View_Customer_Detail.txt](./02_Customer_Management/SQ08_View_Customer_Detail.txt) |
| **SQ09** | View Customer List (Server-side Pagination & Filter) | [SQ09_View_Customer_List.puml](./02_Customer_Management/SQ09_View_Customer_List.puml) | [SQ09_View_Customer_List.txt](./02_Customer_Management/SQ09_View_Customer_List.txt) |
| **SQ10** | Delete Customer (Soft Delete / Inactive) | [SQ10_Delete_Customer.puml](./02_Customer_Management/SQ10_Delete_Customer.puml) | [SQ10_Delete_Customer.txt](./02_Customer_Management/SQ10_Delete_Customer.txt) |

#### Cụm 3: Shift Management (Quản lý Ca làm việc)
| Mã | Tên Use Case | File PlantUML (.puml) | File Văn Bản (.txt) |
| :---: | :--- | :--- | :--- |
| **SQ11** | Open Shift (Opening Cash Declaration & POS Unlock) | [SQ11_Open_Shift.puml](./03_Shift_Management/SQ11_Open_Shift.puml) | [SQ11_Open_Shift.txt](./03_Shift_Management/SQ11_Open_Shift.txt) |
| **SQ12** | Close Shift (Actual vs Calculated Reconciliation) | [SQ12_Close_Shift.puml](./03_Shift_Management/SQ12_Close_Shift.puml) | [SQ12_Close_Shift.txt](./03_Shift_Management/SQ12_Close_Shift.txt) |

#### Cụm 4: Sales Management (Quản lý Bán lẻ & Thanh toán POS)
| Mã | Tên Use Case | File PlantUML (.puml) | File Văn Bản (.txt) |
| :---: | :--- | :--- | :--- |
| **SQ13** | Create Sales Invoice (FEFO Inventory Deduction & Allergy Check) | [SQ13_Create_Sales_Invoice.puml](./04_Sales_Management/SQ13_Create_Sales_Invoice.puml) | [SQ13_Create_Sales_Invoice.txt](./04_Sales_Management/SQ13_Create_Sales_Invoice.txt) |
| **SQ14** | Process Payment (Cash & PayOS VietQR Webhook) | [SQ14_Process_Payment.puml](./04_Sales_Management/SQ14_Process_Payment.puml) | [SQ14_Process_Payment.txt](./04_Sales_Management/SQ14_Process_Payment.txt) |
| **SQ15** | Cancel/Return Sales Invoice (Pre-calculated Return Type & Stock Return) | [SQ15_Cancel_Return_Sales_Invoice.puml](./04_Sales_Management/SQ15_Cancel_Return_Sales_Invoice.puml) | [SQ15_Cancel_Return_Sales_Invoice.txt](./04_Sales_Management/SQ15_Cancel_Return_Sales_Invoice.txt) |
| **SQ16** | View Customer Purchase History & Daily Invoices | [SQ16_View_Customer_Purchase_History.puml](./04_Sales_Management/SQ16_View_Customer_Purchase_History.puml) | [SQ16_View_Customer_Purchase_History.txt](./04_Sales_Management/SQ16_View_Customer_Purchase_History.txt) |
