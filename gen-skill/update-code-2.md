# BÁO CÁO CẬP NHẬT YÊU CẦU DỰ ÁN (PHẦN CẬP NHẬT 2)

**Hệ thống:** PharmaChain Management System  
**Loại tài liệu:** Yêu cầu điều chỉnh Chức năng, Giao diện người dùng (UI/UX) và Luồng xử lý Backend  
**Ngày cập nhật:** 22/10/2026  

---

## 1. TÁCH RIÊNG TÍNH NĂNG QUẢN LÝ GIÁ SẢN PHẨM (`MANAGE PRODUCT PRICE`)

* **Hiện trạng:** Form Tạo/Cập nhật sản phẩm (`Add/Edit Product`) hiện đang gộp chung các trường nhập giá (`Cost Price`, `Selling Price`).
* **Yêu cầu điều chỉnh:**
  1. **Loại bỏ nhập giá trên Form Add/Edit:** Màn hình Tạo và Chỉnh sửa thông tin chung của sản phẩm sẽ loại bỏ các ô nhập giá (`Cost Price` và `Selling Price` cùng ô nhập lý do).
  2. **Tách thành Nút Hành động / Modal riêng:** Tạo nút hành động **"Cập nhật giá" (Set/Update Price)** ngay trên dòng sản phẩm ở trang Bảng danh sách sản phẩm (`Product List`), nằm song song với các nút hành động như *Sửa*, *Xem chi tiết*, *Inactive*.
  3. **Quy trình xử lý:** Khi bấm nút cập nhật giá, một Modal popup chuyên biệt sẽ xuất hiện cho phép nhập Giá vốn mới, Giá bán mới, Ngày áp dụng và Lý do thay đổi giá (`Reason`). Thao tác này sẽ tự động ghi nhận bản ghi mới vào bảng lịch sử giá (`price_histories`).

---

## 2. CHUẨN HÓA GIAO DIỆN POPUP XÁC NHẬN INACTIVE CHO DANH MỤC (`CATEGORY`)

* **Hiện trạng:** Khi thực hiện vô hiệu hóa Danh mục (Inactive Category), hệ thống đang dùng hộp thoại cảnh báo mặc định của trình duyệt (`window.confirm`) xuất hiện ở phía trên màn hình, gây mất thẩm mỹ và không nhất quán.
* **Yêu cầu điều chỉnh:**
  * Thay thế hoàn toàn `window.confirm` bằng **Modal Popup tùy chỉnh (Custom Modal/Dialog)** của hệ thống UI.
  * Phong cách thiết kế (Style, Icon, Layout, Nút bấm) phải đồng bộ 100% với Modal Khóa/Mở khóa tài khoản (`Lock/Unlock Account`) hiện tại.

---

## 3. VÔ HIỆU HÓA SẢN PHẨM (`INACTIVE PRODUCT`) - CHỈ DÙNG TRẠNG THÁI INACTIVE

* **Hiện trạng:** Giao diện quản lý sản phẩm chưa có thao tác vô hiệu hóa/chuyển trạng thái khi sản phẩm ngừng kinh doanh.
* **Yêu cầu điều chỉnh:**
  * Bổ sung nút hành động **Inactive** (Chuyển trạng thái ngừng kinh doanh) cho từng dòng sản phẩm trên bảng danh sách.
  * **Lưu ý nghiệp vụ:** Sản phẩm **không hỗ trợ tính năng Xóa** (kể cả xóa cứng hay xóa mềm). Hệ thống **chỉ dừng lại ở việc chuyển trạng thái sang `INACTIVE`** để vừa ngừng hiển thị trên màn hình POS bán hàng, vừa bảo toàn toàn bộ dữ liệu lịch sử giao dịch và kho hàng đã phát sinh.

---

## 4. BỎ HOÀN TOÀN TÍNH NĂNG XÓA DANH MỤC (`CATEGORY`)

* **Hiện trạng:** Một số bản thiết kế có đề cập đến tính năng Xóa danh mục (`Delete Category`).
* **Yêu cầu điều chỉnh:**
  * Bỏ hoàn toàn thao tác Xóa (Delete) đối với Danh mục sản phẩm.
  * Quản lý trạng thái danh mục **chỉ dừng lại ở việc chuyển đổi giữa `ACTIVE` và `INACTIVE`**. Khi một danh mục bị `INACTIVE`, các sản phẩm thuộc danh mục đó vẫn được lưu giữ an toàn trong cơ sở dữ liệu.

---

## 5. BỔ SUNG HIỂN THỊ HÌNH ẢNH/AVATAR SẢN PHẨM (`IMAGE URL / AVATAR`)

* **Hiện trạng:** Trường dữ liệu đường dẫn hình ảnh sản phẩm (`image_url`) trong Database chưa được hiển thị trên giao diện người dùng.
* **Yêu cầu điều chỉnh:**
  1. **Bảng danh sách Sản phẩm (`Product Table`):** Bổ sung một cột hiển thị ảnh thu nhỏ (Thumbnail/Avatar) ở đầu mỗi dòng sản phẩm. Nếu sản phẩm chưa có ảnh, hiển thị hình ảnh mặc định (Placeholder image).
  2. **Modal Chi tiết Sản phẩm (`Product Detail Modal`):** Hiển thị hình ảnh sản phẩm với kích thước rõ ràng, sắc nét bên cạnh các thông tin chi tiết kỹ thuật/dược học.

---

## BẢNG TỔNG HỢP YÊU CẦU ĐIỀU CHỈNH UI/UX (CẬP NHẬT 2)

| STT | Phân hệ / Component | Giao diện / Vị trí | Thao tác / Yêu cầu Kỹ thuật cụ thể |
| :---: | :--- | :--- | :--- |
| **1** | **Product Management** | Form Add / Edit Product | Bỏ 2 trường `Cost Price` và `Selling Price`. Bổ sung ô nhập/upload `Image URL`. |
| **2** | **Product Management** | Product List Table | Bổ sung cột **Avatar** (Thumbnail) và nút bấm **Set/Update Price** riêng biệt cho từng sản phẩm. |
| **3** | **Product Management** | Product Action | Bổ sung nút **Inactive Product** (Chỉ chuyển trạng thái sang `INACTIVE`, không hỗ trợ chức năng Delete). |
| **4** | **Category Management** | Category List Table | Loại bỏ toàn bộ nút/chức năng Xóa (Delete). Chỉ giữ lại hành động Chuyển trạng thái `ACTIVE` / `INACTIVE`. |
| **5** | **Category Management** | Inactive Confirmation | Thay thế `window.confirm` trên trình duyệt bằng **Custom Modal Popup** thiết kế đồng bộ với Modal Lock User. |
