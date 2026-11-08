
## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC60` (SRS 3.13.4)
- **Tên Use Case**: Delete Supplier (Xóa / Vô hiệu hóa nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua ngừng hoạt động một hồ sơ nhà cung cấp khi đối tác không còn đủ điều kiện hợp tác, bị đưa vào danh sách đen (blacklist) hoặc đã ngừng hoạt động kinh doanh dược. Hệ thống áp dụng cơ chế **Xóa mềm (Soft Delete)**: chuyển trạng thái sang `INACTIVE`, lưu lý do vào `delete_reason`, bảo toàn toàn bộ lịch sử RFQ/Báo giá/Phiếu nhập kho theo quy định kiểm toán.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Bản ghi nhà cung cấp tồn tại và đang ở trạng thái `ACTIVE`.
- **Trigger**:
  - TRG-01: Người dùng bấm nút **"Xóa / Ngừng hoạt động"** trên màn hình danh sách nhà cung cấp.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Trạng thái nhà cung cấp được đặt thành `INACTIVE` (xóa mềm); lịch sử dữ liệu được bảo toàn.
  - POS-02: Hành động và lý do được ghi vào nhật ký kiểm toán (`audit_logs`).

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Tại màn hình danh sách nhà cung cấp (`/supplier`), Nhân viên thu mua bấm icon **"Xóa" (thùng rác đỏ)** trên dòng NCC tương ứng.
2. Hệ thống hiển thị Modal xác nhận (`SupplierDeleteModal.jsx`):
   - Tiêu đề: *"Ngừng Hoạt Động Nhà Cung Cấp"* kèm tên nhà cung cấp.
   - Ô nhập **Lý do ngừng hợp tác** (`reason`, không bắt buộc ở phiên bản hiện tại — SRS quy định bắt buộc).
3. Nhân viên thu mua (tùy chọn) nhập lý do và bấm **"Xác Nhận Ngừng Hợp Tác" (Confirm)**.
4. Frontend gửi yêu cầu `DELETE /api/v1/supplier/{id}?reason=...`.
5. Backend tiếp nhận và xử lý:
   - Tìm nhà cung cấp theo `id`; nếu không tồn tại → `EntityNotFoundException` (HTTP 404).
   - Nếu nhà cung cấp **đã** ở trạng thái `INACTIVE` → ném `IllegalArgumentException` *"Supplier is already inactive"* (HTTP 400).
   - Đặt `status = SupplierStatus.INACTIVE`.
   - Nếu `reason` có giá trị (sau khi trim) → lưu vào `delete_reason`; ngược lại để `null`.
   - Lưu bản ghi (`supplierRepository.save`) và ghi nhật ký kiểm toán.
6. Backend trả về HTTP `200 OK` kèm thông báo *"Supplier deleted successfully"*.
7. Frontend đóng modal, cập nhật dòng sang nhãn **"Ngừng hoạt động"** và hiển thị *"Đã vô hiệu hóa nhà cung cấp thành công!"*, sau đó nạp lại danh sách.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT1 - Hủy xóa**: Nếu người dùng bấm **"Hủy" (Cancel)** → đóng dialog, không thay đổi dữ liệu.
- **A1 - Không tìm thấy nhà cung cấp**: `id` không tồn tại → HTTP 404 *"Supplier not found with id: {id}"*.
- **A2 - Nhà cung cấp đã ngừng hoạt động**: `status = INACTIVE` → HTTP 400 *"Supplier is already inactive"*.
- **A3 - Không đủ quyền**: Token không có vai trò `Purchasing Staff` → HTTP 403 Forbidden.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Chặn xóa khi còn giao dịch mở)**: Nhà cung cấp có RFQ đang chờ phản hồi, báo giá trong đề xuất chưa chốt hoặc đơn đặt hàng PO đang treo thì **không được** ngừng hoạt động.
- **BR-02 (Xóa mềm)**: Việc xóa là xóa mềm — lịch sử RFQ, báo giá, đề xuất và phiếu nhập kho vẫn liên kết với nhà cung cấp.
- **BR-03 (Lý do bắt buộc)**: Lý do ngừng hoạt động là bắt buộc và được ghi vào `audit_logs` (theo SRS).
- **BR-04 (Loại khỏi lựa chọn)**: NCC `INACTIVE` bị loại khỏi danh sách chọn trong các RFQ mới nhưng vẫn xem được để tra cứu/kiểm toán.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Xác Nhận Xóa (`SupplierDeleteModal.jsx`)
| STT | Thành phần giao diện | Loại điều khiển | Chi tiết |
| :--: | :--- | :--- | :--- |
| 1 | Tiêu đề | Header | *"Ngừng Hoạt Động Nhà Cung Cấp"* |
| 2 | Phụ đề | Label | Tên nhà cung cấp đang thao tác |
| 3 | `reason` | Textarea | Nhãn *"Lý do ngừng hợp tác"* + ghi chú *(không bắt buộc)* |
| 4 | Nút Confirm | Button (Danger) | Nhãn **"Xác Nhận Ngừng Hợp Tác"** (khi gửi: *"Đang xử lý…"*) |
| 5 | Nút Cancel | Button (Secondary) | Nhãn **"Hủy"** |

> **Hành vi UI**: Nút xóa chỉ hiển thị với nhà cung cấp đang `ACTIVE` (`SupplierTable.jsx`). Khi thành công, hook `useSuppliers.handleDelete` đặt thông báo *"Supplier partner deactivated successfully!"* và gọi `fetchList()`.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `DELETE /api/v1/supplier/{id}?reason=...`
- **Handler**: `SupplierController.deleteSupplier(@PathVariable Long id, @RequestParam(required = false) String reason)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `200 OK`

#### Query Params:
| Tham số | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--: | :--- |
| `reason` | String | Không (hiện tại) | Lý do ngừng hoạt động, lưu vào `delete_reason` |

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Supplier deleted successfully",
  "data": {
    "id": 21,
    "status": "INACTIVE",
    "deleteReason": "Dừng hợp đồng phân phối năm 2026"
  }
}
```

#### Response lỗi:
| Trường hợp | HTTP | Message |
| :--- | :--: | :--- |
| Không tìm thấy NCC | 404 | `Supplier not found with id: {id}` |
| NCC đã ngừng hoạt động | 400 | `Supplier is already inactive` |

### 4.2. Thuật Toán Service Layer (`SupplierServiceImpl.deleteSupplier`)
```java
@Transactional
@Override
public SupplierResponse deleteSupplier(Long id, String reason) {
    if (id == null)
        throw new IllegalArgumentException("Invalid request to delete supplier");

    Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));

    if (SupplierStatus.INACTIVE.equals(supplier.getStatus())) {
        throw new IllegalArgumentException("Supplier is already inactive");
    }

    supplier.setStatus(SupplierStatus.INACTIVE);
    supplier.setDeleteReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);

    Supplier savedSupplier = supplierRepository.save(supplier);
    return SupplierResponse.fromEntityToDelete(savedSupplier);
}
```

> **Ánh xạ phản hồi**: `SupplierResponse.fromEntityToDelete(...)` chỉ trả `id`, `status`, `deleteReason` — đủ để frontend cập nhật badge trên bảng.

### 4.3. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.13.4 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Lý do (`reason`) là **bắt buộc** | `@RequestParam(required = false)`; nếu trống lưu `null` | Bổ sung validate bắt buộc `reason` ở Controller/Service |
| 2 | Reason options: Not eligible / Blacklisted / Ceased operations / Other (dropdown) | UI dùng Textarea tự do thay vì Dropdown | Đổi thành Dropdown hoặc kết hợp dropdown + text |
| 3 | Chặn xóa khi có RFQ/PO đang treo (BR-01) | Service **chưa** kiểm tra giao dịch mở, chỉ chặn khi đã `INACTIVE` | Bổ sung kiểm tra RFQ/Quotation/PO trước khi chuyển `INACTIVE` |
| 4 | Ghi nhật ký kiểm toán | `deleteSupplier` **chưa** gọi `auditLogService.log(...)` | Bổ sung ghi `audit_logs` kèm lý do |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện thực hiện | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-DSU-01** | Ngừng hoạt động thành công | NCC `ACTIVE`, có nhập lý do | `status = INACTIVE`, `deleteReason` lưu đúng |
| **TC-DSU-02** | Ngừng hoạt động không nhập lý do | NCC `ACTIVE`, `reason` trống | Thành công, `deleteReason = null` |
| **TC-DSU-03** | Xóa NCC đã ngừng hoạt động | NCC `INACTIVE` | HTTP 400 "Supplier is already inactive" |
| **TC-DSU-04** | Xóa NCC không tồn tại | `id = 999` | HTTP 404 "Supplier not found with id: 999" |
| **TC-DSU-05** | Bảo toàn lịch sử sau xóa | NCC có RFQ/báo giá cũ | Lịch sử vẫn nguyên vẹn; NCC bị loại khỏi RFQ mới |
| **TC-DSU-06** | Hủy xóa (AT1) | Bấm nút "Hủy" | Đóng dialog, trạng thái giữ nguyên `ACTIVE` |
| **TC-DSU-07** | Ẩn nút thao tác với NCC `INACTIVE` | Dòng NCC `INACTIVE` | Không hiện nút Sửa/Xóa trên bảng |

