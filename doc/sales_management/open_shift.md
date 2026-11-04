# Đặc Tả Kỹ Thuật: 3.6.1 Open Shift (Mở Ca Làm Việc)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC19` (SRS 3.6.1)
- **Tên Use Case**: Open Shift (Mở ca làm việc)
- **Tác nhân (Actor)**: `Pharmacist` (Dược sĩ bán thuốc), `Cashier` (Thu ngân), `Store Manager` (Quản lý cửa hàng)
- **Mô tả nghiệp vụ**: Cho phép nhân viên bán hàng bắt đầu một ca làm việc mới tại chi nhánh nhà thuốc bằng cách ghi nhận thời gian bắt đầu và số tiền mặt hiện có trong két bán hàng (`opening_cash`). Sau khi mở ca thành công, nhân viên mới có quyền tạo và thanh toán các hóa đơn bán hàng tại quầy POS.
- **Tiền điều kiện (Preconditions)**:
  - Nhân viên đã đăng nhập thành công vào hệ thống.
  - Nhân viên đang không có bất kỳ ca làm việc nào ở trạng thái đang mở (`status = 'OPEN'`).
- **Hậu điều kiện (Postconditions)**:
  - Bản ghi ca làm việc mới được tạo trong bảng `dbo.shifts` với `status = 'OPEN'`, `opening_time = NOW()`.
  - Quầy POS được mở khóa cho nhân viên thực hiện thao tác bán hàng.
  - Ghi nhận nhật ký vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Khi nhân viên truy cập vào màn hình Bán hàng quầy POS (`/pos`) hoặc chọn chức năng **"Mở ca làm việc"**.
2. Hệ thống kiểm tra xem nhân viên này đã có ca làm việc nào đang mở chưa thông qua API `GET /api/v1/shifts/current`.
3. Nếu chưa có ca mở, hệ thống tự động bật Modal **"Mở Ca Làm Việc" (Open Shift)**.
4. Giao diện hiển thị:
   - Tên nhân viên thu ngân: Hiển thị tên người dùng đang đăng nhập (chỉ đọc).
   - Chi nhánh làm việc: Tên chi nhánh hiện tại (chỉ đọc).
   - Thời gian mở ca: Ngày giờ hệ thống hiện tại (tự động cập nhật).
   - Số tiền mặt đầu ca (`openingCash`): Ô nhập số tiền thực tế trong két (mặc định gợi ý bằng số tiền tồn két của ca trước hoặc 0 VNĐ).
   - Ghi chú (`note`): Ô nhập ghi chú tùy chọn.
5. Nhân viên kiểm đếm tiền mặt thực tế trong két quầy thu ngân, nhập số tiền vào ô `openingCash` và bấm nút **"Xác nhận Mở Ca" (Open Shift)**.
6. Frontend kiểm tra ràng buộc:
   - `openingCash` không được để trống, phải là số nguyên >= 0.
7. Frontend gửi yêu cầu `POST /api/v1/shifts/open` lên Backend.
8. Backend tiếp nhận yêu cầu:
   - Trích xuất `accountId` và `storeId` từ thông tin xác thực JWT.
   - Kiểm tra database: nếu nhân viên đã có ca có `status = 'OPEN'` -> ném lỗi `ShiftAlreadyOpenException`.
   - Tạo mới thực thể `Shift`:
     * `accountId` = accountId hiện tại.
     * `storeId` = storeId của nhân viên.
     * `openingTime` = `LocalDateTime.now()`.
     * `openingCash` = số tiền nhân viên đã nhập.
     * `calculatedCash` = `openingCash`.
     * `status` = `"OPEN"`.
     * `note` = nội dung ghi chú.
   - Lưu vào bảng `dbo.shifts`.
   - Ghi nhận `audit_logs` (`action_code = 'OPEN_SHIFT'`, `module_name = 'SHIFT'`).
9. Backend trả về thông tin ca vừa tạo với HTTP `201 Created`.
10. Frontend lưu `currentShift` vào state toàn cục (`useShift`), đóng modal mở ca và chuyển giao diện POS sang trạng thái sẵn sàng quét mã thuốc bán hàng.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Nhân viên đã có ca đang mở**: Nếu nhân viên đã mở ca trước đó mà chưa chốt, hệ thống không cho phép mở ca mới mà điều hướng thẳng vào màn hình bán hàng kèm cảnh báo: *"Bạn đang có một ca làm việc chưa kết thúc"*.
- **A2 - Số tiền đầu ca âm**: Nếu nhân viên nhập số âm (ví dụ: -50.000 VNĐ), hệ thống báo lỗi: *"Số tiền đầu ca không được nhỏ hơn 0"*.
- **A3 - Hủy mở ca**: Nếu nhân viên bấm "Hủy bỏ", hệ thống không cho phép vào quầy bán hàng và điều hướng về trang chủ `/home`.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Mỗi người một ca duy nhất tại một thời điểm)**: Một tài khoản chỉ được phép có tối đa 01 ca làm việc ở trạng thái `OPEN`. Không thể mở ca thứ hai nếu ca trước chưa được đóng.
- **BR-02 (Ràng buộc quầy POS)**: Mọi thao tác xuất hóa đơn (`SalesInvoice`) bắt buộc phải gắn liền với một `shift_id` đang mở. Nếu không có ca mở, giao dịch bán hàng sẽ bị từ chối tuyệt đối.
- **BR-03 (Toàn vẹn tiền đầu ca)**: `opening_cash` phải là số tiền hợp lệ, không âm (>= 0 VNĐ) và tối đa 100.000.000 VNĐ (để tránh lỗi nhập nhầm số 0).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Modal Mở Ca
| STT | Tên trường | Control Type | Bắt buộc | Mặc định | Ràng buộc & Gợi ý |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `cashierName` | Text Box | Có | Tên tài khoản | Chỉ đọc (Read-only) |
| 2 | `storeName` | Text Box | Có | Tên chi nhánh | Chỉ đọc (Read-only) |
| 3 | `systemTime` | Text Box | Có | Ngày giờ hiện tại | Chỉ đọc, hiển thị định dạng `dd/MM/yyyy HH:mm:ss` |
| 4 | `openingCash` | Currency Input | Có | 0 | Số >= 0, tự động phân tách hàng nghìn (VD: `1,500,000 ₫`) |
| 5 | `note` | Text Area | Không | Rỗng | Tối đa 255 ký tự (Ghi chú số lượng tiền lẻ, tiền rách...) |
| 6 | Nút `Open Shift` | Button (Primary) | - | - | Xác nhận mở ca |
| 7 | Nút `Cancel` | Button (Secondary) | - | - | Quay lại trang chủ |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Mở ca làm việc mới:
- **Endpoint**: `POST /api/v1/shifts/open`
- **Mức độ truy cập**: `ROLE_PHARMACIST`, `ROLE_STORE_MANAGER`
- **Request Payload**:
```json
{
  "storeId": 1,
  "openingCash": 1500000.00,
  "note": "Tiền lẻ đầu ca gồm 50 tờ 10k, 20 tờ 50k"
}
```

- **Response Payload (Thành công - HTTP 201 Created)**:
```json
{
  "status": 201,
  "message": "Mở ca làm việc thành công",
  "data": {
    "shiftId": 205,
    "storeId": 1,
    "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy",
    "accountId": 1001,
    "cashierName": "Nguyễn Văn Dược",
    "openingTime": "2026-11-04T07:30:00",
    "openingCash": 1500000.00,
    "status": "OPEN",
    "note": "Tiền lẻ đầu ca gồm 50 tờ 10k, 20 tờ 50k"
  }
}
```

#### B. Kiểm tra ca làm việc hiện tại của nhân viên:
- **Endpoint**: `GET /api/v1/shifts/current`
- **Mức độ truy cập**: Authenticated (`Pharmacist`, `Store Manager`)
- **Response 200 OK**: Trả về chi tiết ca `OPEN` nếu có, hoặc trả về `data: null` nếu chưa mở ca.

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OpenShiftRequest {
    @NotNull(message = "Chi nhánh không được để trống")
    private Long storeId;

    @NotNull(message = "Số tiền mặt đầu ca không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền đầu ca phải lớn hơn hoặc bằng 0")
    private BigDecimal openingCash;

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    private String note;
}
```

### 4.3. Thuật Toán Service Layer (`ShiftServiceImpl.openShift`)
```java
@Transactional
public ShiftDetailResponse openShift(OpenShiftRequest request, Long accountId, String clientIp) {
    // 1. Kiểm tra tài khoản đã có ca OPEN hay chưa
    boolean hasActiveShift = shiftRepository.existsByAccountIdAndStatus(accountId, "OPEN");
    if (hasActiveShift) {
        throw new ShiftAlreadyOpenException("Bạn đang có một ca làm việc chưa kết thúc!");
    }

    // 2. Khởi tạo đối tượng Shift mới
    Shift shift = new Shift();
    shift.setAccountId(accountId);
    shift.setStoreId(request.getStoreId());
    shift.setOpeningTime(LocalDateTime.now());
    shift.setOpeningCash(request.getOpeningCash());
    shift.setCalculatedCash(request.getOpeningCash());
    shift.setStatus("OPEN");
    shift.setNote(request.getNote());

    Shift savedShift = shiftRepository.save(shift);

    // 3. Ghi vết Audit Log
    auditLogService.log("SHIFT", "OPEN_SHIFT", accountId, clientIp, 
        "Mở ca làm việc #" + savedShift.getShiftId() + " với số tiền " + request.getOpeningCash() + " VNĐ");

    return mapToShiftDetailResponse(savedShift);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-SFT-01** | Mở ca thành công với số tiền hợp lệ | `openingCash`: 2.000.000 | Ca được tạo với status = 'OPEN', HTTP 201, mở khóa quầy POS |
| **TC-SFT-02** | Mở ca với số tiền = 0 | `openingCash`: 0 | Chấp nhận mở ca thành công (trường hợp đầu ca không có tiền mặt) |
| **TC-SFT-03** | Mở ca với số tiền âm | `openingCash`: -100.000 | Validation lỗi: "Số tiền đầu ca phải lớn hơn hoặc bằng 0" |
| **TC-SFT-04** | Cố tình mở ca khi đang có ca OPEN | User đã có ca #200 OPEN | Báo lỗi HTTP 400 "Bạn đang có một ca làm việc chưa kết thúc" |
| **TC-SFT-05** | Bỏ trống số tiền đầu ca | `openingCash`: null | Validation lỗi: "Số tiền mặt đầu ca không được để trống" |

