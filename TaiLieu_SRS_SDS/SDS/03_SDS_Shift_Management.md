# TÀI LIỆU THIẾT KẾ HỆ THỐNG CHI TIẾT (SDS)
## CỤM CHỨC NĂNG 3: SHIFT MANAGEMENT (QUẢN LÝ CA LÀM VIỆC)

---

## 1. TỔNG QUAN KIẾN TRÚC THIẾT KẾ (ARCHITECTURAL OVERVIEW)
Cụm chức năng **Shift Management** quản lý vòng đời phiên bán hàng thực tế tại quầy thuốc POS:
- **Presentation Layer (Frontend)**: Hook tùy biến `useShift.js`, modal mở ca `OpenShiftModal.jsx`, modal chốt ca `CloseShiftModal.jsx` tích hợp chặt chẽ vào quầy bán lẻ `PosCounterPage.jsx`.
- **Controller Layer (REST API)**: `ShiftController` cung cấp các endpoint RESTful:
  * `POST /api/v1/shifts/open`: Khai báo tiền quỹ và mở ca.
  * `POST /api/v1/shifts/close`: Chốt ca, đối soát và bàn giao.
  * `GET /api/v1/shifts/current`: Lấy thông tin ca đang hoạt động của tài khoản.
  * `GET /api/v1/shifts/current/summary`: Lập báo cáo doanh thu tức thời phục vụ chốt ca.
- **Service Layer**: `ShiftServiceImpl` chịu trách nhiệm:
  * Đảm bảo tính duy nhất: 1 tài khoản chỉ có tối đa 1 ca mở (`status = 1`).
  * Tự động tổng hợp doanh thu tiền mặt, chuyển khoản và tiền hoàn trả từ các hóa đơn trong ca.
  * Tính toán công thức tiền lý thuyết và độ lệch chênh lệch két (`discrepancy`).
- **Data Access Layer (Repository)**: `ShiftRepository`, `SalesInvoiceRepository`, `SalesReturnRepository`.

---

## 2. CLASS DIAGRAM CHI TIẾT (DETAILED CLASS DIAGRAM)

```mermaid
classDiagram
    direction TB

    %% Controller Layer
    class ShiftController {
        -ShiftService shiftService
        +openShift(OpenShiftRequest, Long) ResponseEntity~ApiResponse~ShiftDetailResponse~~
        +closeShift(CloseShiftRequest, Long) ResponseEntity~ApiResponse~ShiftDetailResponse~~
        +getCurrentShift(Long) ResponseEntity~ApiResponse~ShiftDetailResponse~~
        +getCurrentShiftSummary(Long) ResponseEntity~ApiResponse~ShiftSummaryResponse~~
    }

    %% Service Layer
    class ShiftService {
        <<interface>>
        +openShift(OpenShiftRequest, Long) ShiftDetailResponse
        +closeShift(CloseShiftRequest, Long) ShiftDetailResponse
        +getCurrentShift(Long) ShiftDetailResponse
        +getCurrentShiftSummary(Long) ShiftSummaryResponse
    }

    class ShiftServiceImpl {
        -ShiftRepository shiftRepository
        -StoreRepository storeRepository
        -AccountRepository accountRepository
        -SalesInvoiceRepository salesInvoiceRepository
        -SalesReturnRepository salesReturnRepository
        -AuditLogRepository auditLogRepository
        +openShift(OpenShiftRequest, Long) ShiftDetailResponse
        +closeShift(CloseShiftRequest, Long) ShiftDetailResponse
        +getCurrentShift(Long) ShiftDetailResponse
        +getCurrentShiftSummary(Long) ShiftSummaryResponse
        -calculateShiftRevenue(Shift) ShiftSummaryDto
    }

    %% Repositories
    class ShiftRepository {
        <<interface>>
        +findFirstByAccount_IdAndStatus(Long, Short) Optional~Shift~
        +findByStore_IdAndStatus(Long, Short) List~Shift~
        +existsByAccount_IdAndStatus(Long, Short) boolean
    }

    class SalesInvoiceRepository {
        <<interface>>
        +findByShift_Id(Long) List~SalesInvoice~
        +sumCashRevenueByShiftId(Long) BigDecimal
        +sumTransferRevenueByShiftId(Long) BigDecimal
    }

    class SalesReturnRepository {
        <<interface>>
        +findByShift_Id(Long) List~SalesReturn~
        +sumRefundAmountByShiftId(Long) BigDecimal
    }

    %% Domain Entities
    class Shift {
        -Long id
        -Store store
        -Account account
        -LocalDateTime openingTime
        -LocalDateTime closingTime
        -BigDecimal openingCash
        -BigDecimal closingCash
        -BigDecimal calculatedCash
        -BigDecimal discrepancy
        -Short status
        -String note
        -List~SalesInvoice~ salesInvoices
        -List~SalesReturn~ salesReturns
    }

    class Store {
        -Long id
        -String name
        -String address
        -String phone
    }

    class Account {
        -Long id
        -String username
        -Role role
    }

    %% DTOs
    class OpenShiftRequest {
        +BigDecimal openingCash
        +String note
    }

    class CloseShiftRequest {
        +BigDecimal actualCash
        +String note
    }

    class ShiftDetailResponse {
        +Long shiftId
        +Long storeId
        +String storeName
        +Long accountId
        +String cashierName
        +LocalDateTime openingTime
        +LocalDateTime closingTime
        +BigDecimal openingCash
        +BigDecimal closingCash
        +BigDecimal calculatedCash
        +BigDecimal discrepancy
        +Short status
        +String note
    }

    class ShiftSummaryResponse {
        +Long shiftId
        +LocalDateTime openingTime
        +BigDecimal openingCash
        +BigDecimal totalCashSales
        +BigDecimal totalTransferSales
        +BigDecimal totalRefunds
        +BigDecimal expectedCash
        +Integer totalInvoices
    }

    %% Relationships
    ShiftController ..> ShiftService : delegates to
    ShiftService <|.. ShiftServiceImpl : implements

    ShiftServiceImpl ..> ShiftRepository : accesses
    ShiftServiceImpl ..> SalesInvoiceRepository : accesses
    ShiftServiceImpl ..> SalesReturnRepository : accesses

    Shift "1" *-- "1" Store : belongs to
    Shift "1" *-- "1" Account : opened by
    Shift "1" o-- "*" SalesInvoice : contains
    Shift "1" o-- "*" SalesReturn : processes

    ShiftController ..> OpenShiftRequest : accepts
    ShiftController ..> CloseShiftRequest : accepts
    ShiftController ..> ShiftDetailResponse : returns
    ShiftController ..> ShiftSummaryResponse : returns
```

---

## 3. SEQUENCE DIAGRAMS CHI TIẾT CHO CẢ 2 CHỨC NĂNG

### 3.1. Sequence Diagram: UC21 - Open Shift (Mở ca làm việc & Khai báo tiền quỹ đầu ca)

```mermaid
sequenceDiagram
    autonumber
    actor User as Dược sĩ / Thu ngân
    participant FE as Frontend (PosCounterPage / OpenShiftModal)
    participant SC as ShiftController
    participant SS as ShiftServiceImpl
    participant SR as ShiftRepository
    participant AR as AccountRepository
    participant ALR as AuditLogRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Truy cập quầy bán thuốc POS (/pos)
    FE->>SC: GET /api/v1/shifts/current (Bearer AT)
    activate SC
    SC->>SS: getCurrentShift(accountId)
    activate SS
    SS->>SR: findFirstByAccount_IdAndStatus(accountId, 1)
    activate SR
    SR->>DB: SELECT * FROM shifts WHERE account_id=? AND status=1
    DB-->>SR: Không có bản ghi (Chưa mở ca)
    SR-->>SS: Optional.empty()
    deactivate SR
    SS-->>SC: null
    deactivate SS
    SC-->>FE: HTTP 200 OK (data: null)
    deactivate SC

    FE->>FE: Phát hiện chưa có ca mở -> Tự động bật OpenShiftModal
    User->>FE: Nhập openingCash (VD: 1.500.000đ), nhập ghi chú -> Bấm "Xác nhận Mở Ca"
    FE->>FE: Client-side Validation (openingCash >= 0 và <= 100.000.000đ)

    FE->>SC: POST /api/v1/shifts/open (OpenShiftRequest, Bearer AT)
    activate SC
    SC->>SS: openShift(OpenShiftRequest, accountId)
    activate SS

    SS->>SR: existsByAccount_IdAndStatus(accountId, 1)
    activate SR
    SR->>DB: SELECT COUNT(*) FROM shifts WHERE account_id=? AND status=1
    DB-->>SR: 0
    SR-->>SS: false (Hợp lệ)
    deactivate SR

    SS->>AR: findById(accountId)
    activate AR
    AR->>DB: SELECT * FROM accounts WHERE id=?
    DB-->>AR: Account (kèm Store trực thuộc)
    AR-->>SS: Account entity
    deactivate AR

    SS->>SR: save(Shift entity: openingCash, status=1, openingTime=NOW())
    activate SR
    SR->>DB: INSERT INTO shifts (store_id, account_id, opening_time, opening_cash, status=1, note)
    DB-->>SR: Shift entity (id=50)
    SR-->>SS: savedShift
    deactivate SR

    SS->>ALR: save(AuditLog 'OPEN_SHIFT_SUCCESS', shiftId=50)
    activate ALR
    ALR->>DB: INSERT INTO audit_logs (...)
    DB-->>ALR: OK
    deactivate ALR

    SS-->>SC: ShiftDetailResponse
    deactivate SS
    SC-->>FE: HTTP 201 Created + ShiftDetailResponse
    deactivate SC

    FE->>FE: Cập nhật currentShift vào Global State, đóng OpenShiftModal
    FE-->>User: Mở khóa quầy POS, hiển thị trạng thái "Ca đang mở" sẵn sàng bán hàng
```

---

### 3.2. Sequence Diagram: UC22 - Close Shift (Chốt ca làm việc & Đối soát tiền két)

```mermaid
sequenceDiagram
    autonumber
    actor User as Dược sĩ / Thu ngân
    participant FE as Frontend (CloseShiftModal)
    participant SC as ShiftController
    participant SS as ShiftServiceImpl
    participant SR as ShiftRepository
    participant SIR as SalesInvoiceRepository
    participant SRR as SalesReturnRepository
    participant ALR as AuditLogRepository
    participant DB as SQL Server (PMS DB)

    %% Giai đoạn 1: Tải số liệu doanh thu trong ca
    User->>FE: Bấm nút "Chốt ca làm việc" tại quầy POS
    FE->>SC: GET /api/v1/shifts/current/summary (Bearer AT)
    activate SC
    SC->>SS: getCurrentShiftSummary(accountId)
    activate SS

    SS->>SR: findFirstByAccount_IdAndStatus(accountId, 1)
    activate SR
    SR->>DB: SELECT * FROM shifts WHERE account_id=? AND status=1
    DB-->>SR: Shift entity (openShift)
    SR-->>SS: Shift
    deactivate SR

    SS->>SIR: sumCashRevenueByShiftId(shift.getId())
    activate SIR
    SIR->>DB: SELECT SUM(p.amount) FROM payments p JOIN sales_invoices i ON p.sales_invoice_id = i.id WHERE i.shift_id=? AND p.payment_method=1
    DB-->>SIR: totalCashSales (VD: 8.500.000đ)
    SIR-->>SS: BigDecimal
    deactivate SIR

    SS->>SIR: sumTransferRevenueByShiftId(shift.getId())
    activate SIR
    SIR->>DB: SELECT SUM(p.amount) FROM payments p JOIN sales_invoices i ON p.sales_invoice_id = i.id WHERE i.shift_id=? AND p.payment_method=2
    DB-->>SIR: totalTransferSales (VD: 3.200.000đ)
    SIR-->>SS: BigDecimal
    deactivate SIR

    SS->>SRR: sumRefundAmountByShiftId(shift.getId())
    activate SRR
    SRR->>DB: SELECT SUM(refund_amount) FROM sales_returns WHERE shift_id=? AND refund_method=1
    DB-->>SRR: totalRefunds (VD: 200.000đ)
    SRR-->>SS: BigDecimal
    deactivate SRR

    SS->>SS: expectedCash = openingCash + totalCashSales - totalRefunds (1.5M + 8.5M - 0.2M = 9.8M)
    SS-->>SC: ShiftSummaryResponse
    deactivate SS
    SC-->>FE: HTTP 200 OK + ShiftSummaryResponse
    deactivate SC

    FE-->>User: Hiển thị CloseShiftModal với số tiền dự kiến trong két: 9.800.000đ

    %% Giai đoạn 2: Nhập tiền thực tế và chốt ca
    User->>FE: Kiểm đếm tiền két, nhập actualCash = 9.800.000đ -> Bấm "Xác nhận Chốt Ca"
    FE->>FE: Tính discrepancy = actualCash - expectedCash (0đ -> Cân bằng)
    FE->>SC: POST /api/v1/shifts/close (CloseShiftRequest, Bearer AT)
    activate SC
    SC->>SS: closeShift(CloseShiftRequest, accountId)
    activate SS

    SS->>SR: findFirstByAccount_IdAndStatus(accountId, 1)
    activate SR
    SR-->>SS: Shift entity
    deactivate SR

    SS->>SS: Cập nhật: closingTime=NOW(), closingCash=actualCash, calculatedCash=expectedCash, discrepancy=0, status=2 (CLOSED)
    SS->>SR: save(Shift)
    activate SR
    SR->>DB: UPDATE shifts SET closing_time=NOW(), closing_cash=?, calculated_cash=?, discrepancy=?, status=2 WHERE id=?
    DB-->>SR: OK
    deactivate SR

    SS->>ALR: save(AuditLog 'CLOSE_SHIFT_SUCCESS', shiftId)
    activate ALR
    ALR->>DB: INSERT INTO audit_logs (...)
    DB-->>ALR: OK
    deactivate ALR

    SS-->>SC: ShiftDetailResponse
    deactivate SS
    SC-->>FE: HTTP 200 OK + ShiftDetailResponse
    deactivate SC

    FE->>FE: Reset currentShift state, khóa quyền quầy POS
    FE-->>User: Hiển thị thông báo "Chốt ca thành công!", bật Modal In Phiếu Bàn Giao Ca K80
```
