# TÀI LIỆU THIẾT KẾ HỆ THỐNG CHI TIẾT (SDS)
## CỤM CHỨC NĂNG 4: SALES MANAGEMENT (QUẢN LÝ BÁN LẺ & THANH TOÁN POS)

---

## 1. TỔNG QUAN KIẾN TRÚC THIẾT KẾ (ARCHITECTURAL OVERVIEW)
Cụm chức năng **Sales Management** là trung tâm nghiệp vụ xử lý giao dịch tại quầy bán lẻ của nhà thuốc:
- **Presentation Layer (Frontend)**: `PosCounterPage.jsx`, `PaymentModal.jsx`, `DailySalesInvoicesTable.jsx`, `SalesReturnModal.jsx`, `InvoiceDetailModal.jsx`, `InvoicePrintTemplate.jsx`. Hỗ trợ quét barcode, tự động kiểm tra dị ứng thuốc, hiển thị mã PayOS VietQR động và tiếp nhận trả hàng nhanh từ danh sách.
- **Controller Layer (REST API)**:
  * `SalesInvoiceController`: Quản lý lập hóa đơn bán lẻ (`POST /api/v1/sales-invoices`), tra cứu chi tiết, lịch sử mua hàng khách hàng và thực hiện đổi trả (`POST /api/v1/sales-invoices/return`).
  * `PaymentController`: Khởi tạo liên kết thanh toán PayOS VietQR (`POST /api/v1/payments/payos/create-payment-link`), tiếp nhận Webhook ngân hàng tự động (`POST /api/v1/payments/payos/webhook`), kiểm tra trạng thái (`GET /api/v1/payments/payos/status/{orderCode}`).
  * `DailySalesController`: Báo cáo tổng hợp doanh thu trong ngày và danh sách hóa đơn theo ca (`GET /api/v1/daily-sales/invoices`).
- **Service Layer**:
  * `SalesInvoiceServiceImpl`: Trừ kho tự động theo nguyên tắc FEFO, kiểm tra bắt buộc khách hàng, tính toán điểm thưởng thành viên, xử lý đổi trả hàng (tính toán `returnType` và hoàn nhập tồn kho).
  * `PayOSPaymentServiceImpl`: Kết nối SDK PayOS, thẩm định chữ ký bảo mật Checksum (`HMAC_SHA256`) và xác nhận thanh toán tự động qua Webhook.
  * `DailySalesServiceImpl`: Tổng hợp số liệu đối soát doanh thu chi nhánh.
- **Data Access Layer (Repository)**: `SalesInvoiceRepository`, `SalesInvoiceDetailRepository`, `PaymentRepository`, `SalesReturnRepository`, `SalesReturnDetailRepository`, `InventoryRepository`, `ProductBatchRepository`.

---

## 2. CLASS DIAGRAM CHI TIẾT (DETAILED CLASS DIAGRAM)

```mermaid
classDiagram
    direction TB

    %% Controllers
    class SalesInvoiceController {
        -SalesInvoiceService salesInvoiceService
        +createSalesInvoice(CreateSalesInvoiceRequest, AccountDetails) ResponseEntity~ApiResponse~SalesInvoiceResponse~~
        +getInvoice(String) ResponseEntity~ApiResponse~SalesInvoiceResponse~~
        +getInvoices(Long, Long, Long, String, Short, int, int) ResponseEntity~ApiResponse~PageResponse~SalesInvoiceResponse~~~
        +returnSalesInvoice(SalesReturnRequest, AccountDetails) ResponseEntity~ApiResponse~SalesReturnResponse~~
        +getCustomerPurchaseHistory(Long) ResponseEntity~ApiResponse~List~SalesInvoiceResponse~~~
    }

    class PaymentController {
        -PayOSPaymentService payOSPaymentService
        +createPaymentLink(CreatePayOSPaymentRequest) ResponseEntity~ApiResponse~PayOSPaymentResponse~~
        +handlePayOSWebhook(PayOSWebhookRequest) ResponseEntity~ApiResponse~Void~~
        +checkPaymentStatus(Long) ResponseEntity~ApiResponse~PayOSStatusResponse~~
    }

    class DailySalesController {
        -DailySalesService dailySalesService
        +getDailyInvoices(Long, LocalDate, int, int) ResponseEntity~ApiResponse~Page~SalesInvoiceSummaryDto~~~
        +getDailySalesOverview(Long, LocalDate) ResponseEntity~ApiResponse~DailySalesOverviewDto~~
    }

    %% Services
    class SalesInvoiceService {
        <<interface>>
        +createSalesInvoice(CreateSalesInvoiceRequest, Long) SalesInvoiceResponse
        +getInvoiceByCodeOrId(String) SalesInvoiceResponse
        +getInvoices(Long, Long, Long, String, Short, Pageable) PageResponse~SalesInvoiceResponse~
        +returnSalesInvoice(SalesReturnRequest, Long) SalesReturnResponse
        +getCustomerPurchaseHistory(Long) List~SalesInvoiceResponse~
    }

    class SalesInvoiceServiceImpl {
        -SalesInvoiceRepository salesInvoiceRepository
        -SalesInvoiceDetailRepository salesInvoiceDetailRepository
        -PaymentRepository paymentRepository
        -SalesReturnRepository salesReturnRepository
        -SalesReturnDetailRepository salesReturnDetailRepository
        -ShiftRepository shiftRepository
        -StoreRepository storeRepository
        -AccountRepository accountRepository
        -CustomerRepository customerRepository
        -ProductRepository productRepository
        -ProductBatchRepository productBatchRepository
        -InventoryRepository inventoryRepository
        -ProductUnitRepository productUnitRepository
        +createSalesInvoice(CreateSalesInvoiceRequest, Long) SalesInvoiceResponse
        +getInvoiceByCodeOrId(String) SalesInvoiceResponse
        +returnSalesInvoice(SalesReturnRequest, Long) SalesReturnResponse
        +getCustomerPurchaseHistory(Long) List~SalesInvoiceResponse~
        -generateInvoiceCode() String
        -generateReturnCode() String
        -applyFefoDeduction(Product, Integer, Store, List) void
    }

    class PayOSPaymentService {
        <<interface>>
        +createPaymentLink(CreatePayOSPaymentRequest) PayOSPaymentResponse
        +processWebhook(PayOSWebhookRequest) void
        +checkStatus(Long) PayOSStatusResponse
    }

    class PayOSPaymentServiceImpl {
        -PayOS payOS
        -PaymentRepository paymentRepository
        -SalesInvoiceRepository salesInvoiceRepository
        -PayOSChecksumUtil checksumUtil
        +createPaymentLink(CreatePayOSPaymentRequest) PayOSPaymentResponse
        +processWebhook(PayOSWebhookRequest) void
        +checkStatus(Long) PayOSStatusResponse
    }

    %% Repositories
    class SalesInvoiceRepository {
        <<interface>>
        +findByCode(String) Optional~SalesInvoice~
        +findByShift_Id(Long) List~SalesInvoice~
        +findByCustomer_IdOrderByCreatedAtDesc(Long) List~SalesInvoice~
    }

    class SalesInvoiceDetailRepository {
        <<interface>>
        +findBySalesInvoice_Id(Long) List~SalesInvoiceDetail~
    }

    class PaymentRepository {
        <<interface>>
        +findBySalesInvoice_Id(Long) Optional~Payment~
        +findByTransactionCode(String) Optional~Payment~
    }

    class SalesReturnRepository {
        <<interface>>
        +findBySalesInvoice_Id(Long) List~SalesReturn~
        +save(SalesReturn) SalesReturn
    }

    class SalesReturnDetailRepository {
        <<interface>>
        +save(SalesReturnDetail) SalesReturnDetail
    }

    class InventoryRepository {
        <<interface>>
        +findByStoreIdAndProductIdAndBatchId(Long, Long, Long) Optional~Inventory~
    }

    %% Entities
    class SalesInvoice {
        -Long id
        -String code
        -Store store
        -Shift shift
        -Account account
        -Customer customer
        -String prescriptionCode
        -BigDecimal totalAmount
        -BigDecimal discountAmount
        -BigDecimal finalAmount
        -Short status
        -String cancelReason
        -LocalDateTime createdAt
        -List~SalesInvoiceDetail~ details
        -Payment payment
        -List~SalesReturn~ returns
    }

    class SalesInvoiceDetail {
        -Long id
        -SalesInvoice salesInvoice
        -Product product
        -ProductBatch batch
        -ProductUnit unit
        -Integer quantity
        -Integer conversionFactor
        -BigDecimal unitPrice
        -BigDecimal lineTotal
        -String dosageInstruction
    }

    class Payment {
        -Long id
        -SalesInvoice salesInvoice
        -BigDecimal amount
        -Short paymentMethod
        -Short paymentStatus
        -String transactionCode
        -LocalDateTime paymentTime
    }

    class SalesReturn {
        -Long id
        -String code
        -SalesInvoice salesInvoice
        -Shift shift
        -Account processedBy
        -Short returnType
        -Short refundMethod
        -BigDecimal refundAmount
        -String reason
        -LocalDateTime createdAt
        -List~SalesReturnDetail~ details
    }

    class SalesReturnDetail {
        -Long id
        -SalesReturn salesReturn
        -SalesInvoiceDetail salesInvoiceDetail
        -Product product
        -ProductBatch batch
        -Integer quantity
        -BigDecimal unitPrice
    }

    class Inventory {
        -Long id
        -Store store
        -Product product
        -ProductBatch batch
        -Integer quantity
        -LocalDateTime updatedAt
    }

    %% DTOs
    class CreateSalesInvoiceRequest {
        +Long shiftId
        +Long customerId
        +String prescriptionCode
        +String orderNote
        +BigDecimal discountAmount
        +List~InvoiceItemRequest~ items
        +ProcessPaymentRequest payment
    }

    class InvoiceItemRequest {
        +Long productId
        +Long batchId
        +Long unitId
        +Integer quantity
        +BigDecimal unitPrice
        +String dosageInstruction
    }

    class ProcessPaymentRequest {
        +Short paymentMethod
        +BigDecimal paidAmount
        +String transactionCode
    }

    class SalesInvoiceResponse {
        +Long invoiceId
        +String invoiceCode
        +Long customerId
        +String customerName
        +BigDecimal totalAmount
        +BigDecimal discountAmount
        +BigDecimal finalAmount
        +String paymentMethod
        +Short statusCode
        +List~SalesInvoiceItemResponse~ items
    }

    class SalesReturnRequest {
        +Long invoiceId
        +String reason
        +Short refundMethod
        +List~ReturnItemRequest~ items
    }

    class SalesReturnResponse {
        +Long returnId
        +String returnCode
        +Long invoiceId
        +String invoiceCode
        +BigDecimal refundAmount
        +String refundMethod
        +String reason
        +LocalDateTime createdAt
    }

    %% Relationships
    SalesInvoiceController ..> SalesInvoiceService : delegates to
    PaymentController ..> PayOSPaymentService : delegates to
    SalesInvoiceService <|.. SalesInvoiceServiceImpl : implements
    PayOSPaymentService <|.. PayOSPaymentServiceImpl : implements

    SalesInvoice "1" *-- "*" SalesInvoiceDetail : contains
    SalesInvoice "1" *-- "0..1" Payment : settled by
    SalesInvoice "1" o-- "*" SalesReturn : has
    SalesReturn "1" *-- "*" SalesReturnDetail : contains

    SalesInvoiceServiceImpl ..> SalesInvoiceRepository : accesses
    SalesInvoiceServiceImpl ..> InventoryRepository : updates FEFO
    SalesInvoiceServiceImpl ..> SalesReturnRepository : saves return
    PayOSPaymentServiceImpl ..> PaymentRepository : updates webhook status
```

---

## 3. SEQUENCE DIAGRAMS CHI TIẾT CHO CẢ 4 CHỨC NĂNG

### 3.1. Sequence Diagram: UC23 - Create Sales Invoice (Lập hóa đơn bán lẻ thuốc tại quầy POS)

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Dược sĩ
    participant FE as Frontend (PosCounterPage)
    participant SIC as SalesInvoiceController
    participant SIS as SalesInvoiceServiceImpl
    participant CR as CustomerRepository
    participant SR as ShiftRepository
    participant IR as InventoryRepository
    participant SIR as SalesInvoiceRepository
    participant SIDR as SalesInvoiceDetailRepository
    participant DB as SQL Server (PMS DB)

    Pharmacist->>FE: Quét mã vạch thuốc, chọn ĐVT (Viên/Vỉ/Hộp)
    FE->>FE: Kiểm tra hồ sơ dị ứng của khách hàng với thành phần thuốc
    opt Phát hiện hoạt chất dị ứng
        FE-->>Pharmacist: Bật Alert đỏ: "Khách hàng dị ứng với hoạt chất [X]!"
    end
    Pharmacist->>FE: Chọn Khách hàng (SĐT), nhập đơn thuốc, bấm "Thanh toán (F9)"

    alt Thiếu khách hàng định danh (customerId == null)
        FE-->>Pharmacist: Chặn submit, tự động mở CustomerSelectModal
    else Có đầy đủ khách hàng và mặt hàng
        FE->>SIC: POST /api/v1/sales-invoices (CreateSalesInvoiceRequest, Bearer AT)
        activate SIC
        SIC->>SIS: createSalesInvoice(CreateSalesInvoiceRequest, accountId)
        activate SIS

        SIS->>SR: findFirstByAccount_IdAndStatus(accountId, 1)
        activate SR
        SR-->>SIS: Shift entity (openShift)
        deactivate SR

        SIS->>CR: findById(request.getCustomerId())
        activate CR
        CR-->>SIS: Customer entity
        deactivate CR

        %% Trừ kho FEFO
        loop Với từng mặt hàng thuốc
            SIS->>IR: findByStoreIdAndProductIdAndBatchId(...)
            activate IR
            IR->>DB: SELECT * FROM inventories WHERE store_id=? AND product_id=? AND batch_id=?
            DB-->>IR: Inventory entity (lô thuốc hạn dùng gần nhất)
            deactivate IR
            SIS->>IR: inv.setQuantity(inv.getQuantity() - baseQuantity)
            activate IR
            IR->>DB: UPDATE inventories SET quantity=?, updated_at=NOW() WHERE id=?
            DB-->>IR: OK
            deactivate IR
        end

        SIS->>SIS: generateInvoiceCode() -> 'INV-20261108-3910'
        SIS->>SIR: save(SalesInvoice: status=1, finalAmount, shiftId, customerId)
        activate SIR
        SIR->>DB: INSERT INTO sales_invoices (...)
        DB-->>SIR: SalesInvoice entity (id=3910)
        SIR-->>SIS: savedInvoice
        deactivate SIR

        SIS->>SIDR: saveAll(SalesInvoiceDetails)
        activate SIDR
        SIDR->>DB: INSERT INTO sales_invoice_details (...)
        DB-->>SIDR: OK
        deactivate SIDR

        SIS->>CR: Cộng điểm tích lũy: customer.setLoyaltyPoints(points + finalAmount/100000)
        activate CR
        CR->>DB: UPDATE customers SET loyalty_points=? WHERE id=?
        DB-->>CR: OK
        deactivate CR

        SIS-->>SIC: SalesInvoiceResponse
        deactivate SIS
        SIC-->>FE: HTTP 201 Created + SalesInvoiceResponse
        deactivate SIC

        FE->>FE: Tự động bật Modal Xem & In Hóa Đơn K80
        FE-->>Pharmacist: Hoàn tất hóa đơn, xóa giỏ hàng sẵn sàng cho đơn tiếp theo
    end
```

---

### 3.2. Sequence Diagram: UC24 - Process Payment (Thanh toán Tiền mặt & PayOS VietQR)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    actor Cashier as Dược sĩ / Thu ngân
    participant FE as Frontend (PaymentModal)
    participant PC as PaymentController
    participant PPS as PayOSPaymentServiceImpl
    participant PayOS as Cổng Thanh Toán PayOS (VietQR)
    participant PR as PaymentRepository
    participant SIR as SalesInvoiceRepository
    participant DB as SQL Server (PMS DB)

    Cashier->>FE: Bấm "Thanh toán (F9)", chọn tab phương thức

    %% Nhánh 1: Tiền mặt
    alt Chọn phương thức Tiền mặt (CASH)
        Cashier->>FE: Nhập số tiền khách đưa (VD: 200.000đ)
        FE->>FE: Tính tiền thừa = 200.000đ - 154.000đ = 46.000đ
        Cashier->>FE: Bấm "Xác nhận Thanh toán (F10)"
        FE->>PC: Ghi nhận thanh toán Tiền mặt kèm hóa đơn
        PC->>PR: INSERT INTO payments (method=1, status=1, amount=154000)
        PR->>DB: OK
        FE-->>Cashier: Mở ngăn kéo két, in hóa đơn K80

    %% Nhánh 2: Chuyển khoản QR PayOS
    else Chọn phương thức Chuyển khoản QR PayOS
        FE->>PC: POST /api/v1/payments/payos/create-payment-link (CreatePayOSPaymentRequest: invoiceId, amount)
        activate PC
        PC->>PPS: createPaymentLink(request)
        activate PPS
        PPS->>PayOS: createPaymentLink(PaymentData: orderCode, amount, description)
        activate PayOS
        PayOS-->>PPS: CheckoutResponseData (qrCode, paymentLinkId, accountNo)
        deactivate PayOS
        PPS-->>PC: PayOSPaymentResponse (qrCodeUrl, orderCode)
        deactivate PPS
        PC-->>FE: HTTP 200 OK + qrCodeUrl
        deactivate PC

        FE-->>Customer: Hiển thị mã VietQR động trên màn hình kèm đồng hồ đếm ngược 15 phút
        Customer->>PayOS: Mở App Ngân hàng quét VietQR và bấm Chuyển khoản
        PayOS->>PayOS: Xử lý biến động số dư thành công

        %% Webhook tự động
        PayOS->>PC: POST /api/v1/payments/payos/webhook (PayOSWebhookRequest kèm Signature)
        activate PC
        PC->>PPS: processWebhook(PayOSWebhookRequest)
        activate PPS
        PPS->>PPS: verifyChecksum(data, signature, CHECKSUM_KEY)

        alt Chữ ký Checksum hợp lệ
            PPS->>PR: save(Payment: method=2, status=1, transactionCode=orderCode)
            activate PR
            PR->>DB: INSERT INTO payments (...)
            DB-->>PR: OK
            deactivate PR

            PPS->>SIR: updateStatus(invoiceId, status=1 - PAID)
            activate SIR
            SIR->>DB: UPDATE sales_invoices SET status=1 WHERE id=?
            DB-->>SIR: OK
            deactivate SIR

            PPS-->>PC: void (Webhook processed)
            deactivate PPS
            PC-->>PayOS: HTTP 200 OK (Thành công)
            deactivate PC

            FE->>FE: Nhận tín hiệu thời gian thực (Polling hoặc SSE): Trạng thái -> "Thanh toán thành công!"
            FE-->>Cashier: Tự động in hóa đơn bán lẻ K80 và đóng Modal thanh toán
        else Chữ ký giả mạo
            PPS-->>PC: throw InvalidSignatureException
            PC-->>PayOS: HTTP 400 Bad Request (Từ chối)
        end
    end
```

---

### 3.3. Sequence Diagram: UC25 - Cancel/Return Sales Invoice (Tiếp nhận trả hàng & Hoàn tiền)

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Dược sĩ
    participant FE as Frontend (SalesReturnModal)
    participant SIC as SalesInvoiceController
    participant SIS as SalesInvoiceServiceImpl
    participant SIR as SalesInvoiceRepository
    participant SIDR as SalesInvoiceDetailRepository
    participant SRR as SalesReturnRepository
    participant SRDR as SalesReturnDetailRepository
    participant IR as InventoryRepository
    participant DB as SQL Server (PMS DB)

    Pharmacist->>FE: Bấm nút "Trả hàng" tại dòng hóa đơn trên bảng "Hóa Đơn Bán Lẻ Trong Ngày"
    FE->>SIC: GET /api/v1/sales-invoices/{codeOrId} (Bearer AT)
    activate SIC
    SIC->>SIS: getInvoiceByCodeOrId(codeOrId)
    activate SIS
    SIS-->>SIC: SalesInvoiceResponse (chi tiết danh mục thuốc đã mua)
    deactivate SIS
    SIC-->>FE: HTTP 200 OK
    deactivate SIC

    FE->>FE: Mở ngay SalesReturnModal, điền sẵn danh mục thuốc và số lượng đã mua
    Pharmacist->>FE: Tích chọn thuốc muốn trả, điều chỉnh SL trả, chọn hình thức hoàn tiền và nhập lý do
    Pharmacist->>FE: Bấm "Xác nhận Trả Hàng"

    FE->>SIC: POST /api/v1/sales-invoices/return (SalesReturnRequest, Bearer AT)
    activate SIC
    SIC->>SIS: returnSalesInvoice(SalesReturnRequest, accountId)
    activate SIS

    SIS->>SIR: findById(invoiceId)
    activate SIR
    SIR-->>SIS: SalesInvoice entity
    deactivate SIR

    %% Tính toán trước returnType và totalRefund
    SIS->>SIS: Tính totalRefund = SUM(returnQty * unitPrice)
    SIS->>SIS: isFullReturn = (totalRefund >= invoice.finalAmount)
    SIS->>SIS: returnType = isFullReturn ? 1 : 2 (1 = FULL, 2 = PARTIAL)

    SIS->>SIS: generateReturnCode() -> 'RET-20261108-0001'
    SIS->>SRR: save(SalesReturn: code, invoiceId, shiftId, returnType, refundAmount, reason)
    activate SRR
    SRR->>DB: INSERT INTO sales_returns (code, return_type, refund_amount, sales_invoice_id, ...)
    DB-->>SRR: SalesReturn entity (đầy đủ return_type không bị null)
    SRR-->>SIS: savedReturn
    deactivate SRR

    %% Hoàn trả tồn kho theo đơn vị cơ bản
    loop Từng mặt hàng trả lại
        SIS->>SIDR: findById(salesInvoiceDetailId)
        activate SIDR
        SIDR-->>SIS: SalesInvoiceDetail
        deactivate SIDR

        SIS->>IR: findByStoreIdAndProductIdAndBatchId(...)
        activate IR
        IR->>DB: SELECT * FROM inventories WHERE store_id=? AND product_id=? AND batch_id=?
        DB-->>IR: Inventory entity
        deactivate IR

        SIS->>IR: inv.setQuantity(inv.getQuantity() + item.quantity * conversionFactor)
        activate IR
        IR->>DB: UPDATE inventories SET quantity=?, updated_at=NOW() WHERE id=?
        DB-->>IR: OK
        deactivate IR

        SIS->>SRDR: save(SalesReturnDetail)
        activate SRDR
        SRDR->>DB: INSERT INTO sales_return_details (...)
        DB-->>SRDR: OK
        deactivate SRDR
    end

    %% Cập nhật trạng thái hóa đơn gốc
    SIS->>SIR: invoice.setStatus(isFullReturn ? 4 : 3) -- 4=FULLY_RETURNED, 3=PARTIALLY_RETURNED
    activate SIR
    SIR->>DB: UPDATE sales_invoices SET status=?, cancel_reason=? WHERE id=?
    DB-->>SIR: OK
    deactivate SIR

    SIS-->>SIC: SalesReturnResponse (returnCode, refundAmount)
    deactivate SIS
    SIC-->>FE: HTTP 200 OK + SalesReturnResponse
    deactivate SIC

    FE-->>Pharmacist: Hiển thị màn hình thành công "Hoàn Trả Thuốc Thành Công!", tự động làm mới bảng hóa đơn
```

---

### 3.4. Sequence Diagram: UC26 - View Customer Purchase History & Daily Invoices (Tra cứu lịch sử mua thuốc)

```mermaid
sequenceDiagram
    autonumber
    actor Pharmacist as Dược sĩ
    participant FE as Frontend (DailySalesInvoicesTable / CustomerHistoryDrawer)
    participant DSC as DailySalesController
    participant SIC as SalesInvoiceController
    participant DSS as DailySalesServiceImpl
    participant SIS as SalesInvoiceServiceImpl
    participant SIR as SalesInvoiceRepository
    participant DB as SQL Server (PMS DB)

    %% Flow 1: Tra cứu danh sách hóa đơn trong ngày
    Pharmacist->>FE: Truy cập tab "Hóa Đơn Bán Lẻ Trong Ngày"
    FE->>DSC: GET /api/v1/daily-sales/invoices?storeId=1&page=0&size=10
    activate DSC
    DSC->>DSS: getDailyInvoices(storeId, today, pageable)
    activate DSS
    DSS->>SIR: findDailyInvoicesByStore(...)
    activate SIR
    SIR->>DB: SELECT i.id, i.code, c.full_name, c.phone, i.final_amount, i.status FROM sales_invoices i LEFT JOIN customers c ON i.customer_id = c.id
    DB-->>SIR: Page<SalesInvoiceSummaryDto>
    SIR-->>DSS: Page<SalesInvoiceSummaryDto>
    deactivate SIR
    DSS-->>DSC: Page<SalesInvoiceSummaryDto> (có customerName, customerPhone, canReturn)
    deactivate DSS
    DSC-->>FE: HTTP 200 OK + Page
    deactivate DSC
    FE-->>Pharmacist: Hiển thị bảng danh sách hóa đơn kèm 2 nút Thao tác: "Chi tiết" và "Trả hàng"

    %% Flow 2: Tìm kiếm thời gian thực theo mã HĐ, tên khách, SĐT
    Pharmacist->>FE: Gõ mã "3910" hoặc tên "Lê Hoàng Long" vào Search Bar
    FE->>FE: Client-side Filter thời gian thực (codeMatch, nameMatch, phoneMatch)
    FE-->>Pharmacist: Danh sách bảng lọc tức thì không cần tải lại trang

    %% Flow 3: Tra cứu lịch sử mua hàng cũ của khách hàng tại quầy POS (F7)
    Pharmacist->>FE: Bấm "Lịch sử mua hàng (F7)" khi đang chọn khách hàng ID=101
    FE->>SIC: GET /api/v1/sales-invoices/customer/101 (Bearer AT)
    activate SIC
    SIC->>SIS: getCustomerPurchaseHistory(101)
    activate SIS
    SIS->>SIR: findByCustomer_IdOrderByCreatedAtDesc(101)
    activate SIR
    SIR->>DB: SELECT * FROM sales_invoices WHERE customer_id=101 ORDER BY created_at DESC
    DB-->>SIR: List<SalesInvoice>
    SIR-->>SIS: invoices
    deactivate SIR
    SIS-->>SIC: List<SalesInvoiceResponse>
    deactivate SIS
    SIC-->>FE: HTTP 200 OK + List<SalesInvoiceResponse>
    deactivate SIC
    FE-->>Pharmacist: Mở Drawer hiển thị danh mục các lần mua cũ và nút "Sao chép đơn cũ vào giỏ POS"
```

