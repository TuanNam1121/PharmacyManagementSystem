# BÁO CÁO RÀ SOÁT VÀ ĐỀ XUẤT ĐIỀU CHỈNH HỆ THỐNG PHARMACHAIN

**Dự án:** PharmaChain Management System  
**Loại tài liệu:** Thống kê các điểm lệch chuẩn logic nghiệp vụ, UI và Yêu cầu Kỹ thuật Backend  
**Mục đích:** Tài liệu kỹ thuật làm căn cứ điều chỉnh UI & sinh mã nguồn (Gen Code Backend)  
**Ngày cập nhật:** 21/10/2026  

---

## ⚠️ LƯU Ý QUAN TRỌNG DÀNH CHO DEVELOPERS & AI CODEGEN

> 1. **Tài liệu tham khảo bắt buộc:** Tất cả lập trình viên và công cụ sinh mã tự động (AI Codegen) **CẦN ĐỌC TOÀN BỘ CÁC FILE TÀI LIỆU TRONG THƯ MỤC `gen-skill`** trước khi tiến hành viết mã hoặc điều chỉnh hệ thống để đảm bảo nắm rõ toàn bộ ngữ cảnh kiến trúc.
> 2. **Nguyên tắc Thiết kế UI/UX:** Giao diện thực tế **KHÔNG NHẤT THIẾT PHẢI BÊ NGUYÊN 100% TỪNG PIXEL THEO SCREEN-MOCKUP TRONG SRS**. Các screen-mockup chỉ mang tính chất tham khảo khung (wireframe). Đội ngũ phát triển cần ưu tiên **tính hợp lý của UX/UI**, sự thuận tiện khi thao tác và tính đúng đắn của luồng nghiệp vụ thực tế.

---

## 1. TỔNG QUAN

Báo cáo này tập trung phân tích các mâu thuẫn nghiệp vụ, xung đột logic giữa giao diện người dùng (UI) với quy trình xử lý thực tế, đồng thời **chuẩn hóa kiến trúc backend** trong việc quản lý trạng thái (Status Management) của hệ thống **PharmaChain Management System**.

---

## 2. YÊU CẦU CHUẨN HÓA KĨ THUẬT BACKEND (TECHNICAL SPECIFICATION FOR CODEGEN)

### 🔴 Yêu cầu Bắt buộc: Chuẩn hóa Trạng thái (Status Management) bằng Type-safe Enum Converter

#### 1. Bối cảnh & Hiện trạng Codebase

* **`AccountStatus` và `ProductStatus`:** Đã được định nghĩa Enum sẵn trong codebase, tuy nhiên **CHƯA ĐƯỢC TRIỂN KHAI ĐẦY ĐỦ** trên Entity / Database layer (hiện tại Entity vẫn đang mapped với kiểu dữ liệu thô `Short` / `tinyint`).
* **`CategoryStatus`:** Hiện tại **CHƯA CÓ** Enum định nghĩa và Entity `Category` cũng chưa có trường quản lý trạng thái.
* **Vấn đề:** Việc lưu trữ kiểu `Short` thô ở Entity dẫn đến lỗi "Magic Numbers" (`status == 1`, `status == 0`) rải rác khắp Service/Repository layer, gây mất an toàn kiểu dữ liệu (Type Safety) và khó bảo trì.

#### 2. Quy chuẩn triển khai cho Lập trình viên / Codegen

**Tất cả 3 Entity (`Account`, `Product`, và `Category`) bắt buộc phải triển khai Trạng thái theo mô hình Type-safe Enum + JPA AttributeConverter.**

##### A. Định Nghĩa & Bổ Sung Enum Trạng Thái

* **`AccountStatus`** *(Đã có Enum, cần ánh xạ vào Entity)*:
  * `ACTIVE((short) 1, "Active")`
  * `DISABLED((short) 0, "Disabled")`
  * `LOCKED((short) 2, "Locked")`

* **`ProductStatus`** *(Đã có Enum, cần ánh xạ vào Entity)*:
  * `ACTIVE((short) 1, "Active")`
  * `INACTIVE((short) 0, "Inactive")`
  * `DISCONTINUED((short) 2, "Discontinued")`

* **`CategoryStatus`** *(CẦN TẠO MỚI ENUM & CONVERTER)*:
  * `ACTIVE((short) 1, "Active")`
  * `INACTIVE((short) 0, "Inactive")`

##### B. JPA AttributeConverter

Đảm bảo mỗi Enum có tương ứng 1 Class Converter triển khai `AttributeConverter<TEnum, Short>` (hoặc kế thừa `BaseEnumConverter`):
* `AccountStatusConverter` *(Đã/Cần bổ sung `@Converter(autoApply = true)`)*
* `ProductStatusConverter` *(Đã/Cần bổ sung `@Converter(autoApply = true)`)*
* `CategoryStatusConverter` *(CẦN VIẾT MỚI)*

##### C. Cập nhật Entity Layer (Refactor Entity)

Thay đổi kiểu khai báo thuộc tính trong các Entity, **loại bỏ hoàn toàn kiểu `Short` thô**:

```java
// Trong Account.java
@Column(name = "status", columnDefinition = "tinyint not null")
private AccountStatus status;

// Trong Product.java
@Column(name = "status", columnDefinition = "tinyint not null")
private ProductStatus status;

// Trong Category.java (Thêm mới thuộc tính)
@Column(name = "status", columnDefinition = "tinyint not null")
private CategoryStatus status;
```

##### D. Quy tắc áp dụng cho Service & Repository

* **Loại bỏ 100% Magic Numbers:** Thay thế mọi đoạn mã kiểm tra dạng `if (entity.getStatus() == 1)` bằng `if (entity.getStatus() == AccountStatus.ACTIVE)`.
* **Repository Queries:** Khi viết JPQL / HQL / Native Query, truyền trực tiếp Enum instance vào tham số thay vì truyền số nguyên `Short`.

---

## 3. CHI TIẾT CÁC ĐIỂM CẦN ĐIỀU CHỈNH NGHIỆP VỤ & UI/UX

*(Lưu ý: Thiết kế lại giao diện hướng tới trải nghiệm tối ưu cho người dùng, không gượng ép theo screen-mockup trong SRS)*

### 3.1. Lỗi Xung Đột Logic Nghiệp Vụ (Business Logic Overlaps)

#### 🛑 Điểm 1: Chồng chéo giữa Edit User (`UC09`) và Lock/Unlock User (`UC10`)

* **Mô tả vấn đề:**
  * Trong form **Edit User**, giao diện không nên cho phép Admin thay đổi trực tiếp trường `Status` vì sẽ bỏ qua quy trình kiểm soát bảo mật của `UC10`.
  * Tính năng Lock/Unlock (`UC10`) quy định quy trình riêng: **bắt buộc nhập lý do khóa** (Lock Reason) và vô hiệu hóa tất cả session/token đang hoạt động.
* **Hướng xử lý đề xuất (Tối ưu UI/UX & Security):**
  * **UI:** Vô hiệu hóa (Read-only) hoặc ẩn trường `Status` trên form Edit User thông thường.
  * **Action:** Thao tác khóa/mở khóa tài khoản phải thực hiện qua nút bấm **Lock/Unlock** riêng trên danh sách. Nút này mở Modal bắt buộc nhập lý do và cập nhật trạng thái `AccountStatus.LOCKED` hoặc `AccountStatus.DISABLED`.

#### 🛑 Điểm 2: Mâu thuẫn giữa Form Thêm/Sửa Sản Phẩm và Phân Hệ Quản Lý Giá (`UC15`, `UC16`)

* **Mô tả vấn đề:**
  * Luồng quản lý giá yêu cầu lưu vết lịch sử trong bảng `price_histories`. Khi nhập/sửa giá trực tiếp từ form Add/Edit Product, nếu backend không xử lý sẽ bị đứt gãy dữ liệu lịch sử giá.
* **Hướng xử lý đề xuất:**
  * **Backend Processing:** Khi người dùng lưu form Add/Edit Product mà có thay đổi về `cost_price` hoặc `selling_price`, Backend phải tự động chèn 1 bản ghi mới vào bảng `price_histories` với lý do hệ thống (*"Cập nhật từ form quản lý sản phẩm"*).

---

### 3.2. Bổ Sung Tính Năng Trực Quan Trên Giao Diện (UI/UX Enhancements)

#### 🛑 Điểm 3: Thêm trạng thái và tính năng Vô hiệu hóa Danh mục (`UC20 - Delete/Disable Category`)

* **Mô tả vấn đề:** Bảng danh sách `Product Categories` trên UI cần bổ sung quản lý trạng thái (`CategoryStatus`) và thao tác vô hiệu hóa.
* **Hướng xử lý đề xuất:**
  * Bổ sung trường `status` (`CategoryStatus`) trên UI và DTO.
  * Thêm nút bấm/Toggle **Disable / Enable / Delete** linh hoạt trên UI.
  * **Ràng buộc backend:** Chỉ cho phép đổi sang `CategoryStatus.INACTIVE` hoặc Xóa danh mục khi không có sản phẩm nào thuộc danh mục đó đang ở trạng thái `ProductStatus.ACTIVE`.

#### 🛑 Điểm 4: Hiển thị Xem Lịch sử Giá (`UC15 - View Price History`)

* **Mô tả vấn đề:** Trang chi tiết sản phẩm (`Product Details`) cần có khu vực trực quan để tra cứu lịch sử giá.
* **Hướng xử lý đề xuất:**
  * Bổ sung Tab **"Lịch sử giá" (Price History)** trong Modal/Trang chi tiết sản phẩm.
  * Bảng hiển thị gồm: *Ngày áp dụng, Giá vốn, Giá bán, Người thực hiện, Lý do thay đổi*.

---

## 4. BẢNG TỔNG HỢP KẾ HOẠCH XỬ LÝ (ACTION PLAN FOR DEVELOPERS)

| STT | Phân hệ | Hạng mục công việc / Yêu cầu Kỹ thuật | Phân loại | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Core Backend** | Đọc các file trong thư mục `gen-skill`. Ánh xạ `AccountStatus`, `ProductStatus` vào Entity; tạo mới `CategoryStatus` Enum & Converter. Loại bỏ kiểu `Short` thô. | Architecture / Refactor | **Rất Cao** |
| **2** | **User Management** | Khóa trường Status ở form Edit User; tách riêng luồng Lock/Unlock kèm lý do khóa. | Logic UI & Backend | **Cao** |
| **3** | **Product & Pricing** | Tự động chèn bản ghi `price_histories` khi lưu giá sản phẩm. Chuyển thuộc tính `status` sang `ProductStatus`. | Logic Backend | **Cao** |
| **4** | **Categories** | Bổ sung `CategoryStatus` cho Backend & UI. Thiết kế lại UI quản lý danh mục (thêm Disable/Delete) đảm bảo UX linh hoạt. | Fullstack | Trung bình |
| **5** | **Product Details** | Thiết kế Tab "Price History" trong popup chi tiết sản phẩm. | UI / Feature | Trung bình |