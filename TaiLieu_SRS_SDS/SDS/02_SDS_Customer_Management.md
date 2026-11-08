# TÀI LIỆU THIẾT KẾ HỆ THỐNG CHI TIẾT (SDS)
## CỤM CHỨC NĂNG 2: CUSTOMER MANAGEMENT (QUẢN LÝ KHÁCH HÀNG)

---

## 1. TỔNG QUAN KIẾN TRÚC THIẾT KẾ (ARCHITECTURAL OVERVIEW)
Cụm chức năng **Customer Management** được thiết kế để quản lý tập trung danh bạ khách hàng, hồ sơ sức khỏe cá nhân (Customer Health Profile) và lịch sử tích điểm thành viên:
- **Presentation Layer (Frontend)**: `CustomerDirectoryPage.jsx`, `CustomerFormModal.jsx`, `CustomerDetailModal.jsx`, `CustomerSelectModal.jsx` cung cấp giao diện tương tác nhanh, tìm kiếm debounce, cảnh báo trực quan các nguy cơ dị ứng thuốc.
- **Controller Layer (REST API)**: `CustomerController` tiếp nhận các endpoint `/api/v1/customers`, kiểm tra tính hợp lệ dữ liệu bằng Jakarta Bean Validation (`@Valid`).
- **Service Layer**: `CustomerServiceImpl` xử lý các quy tắc nghiệp vụ: sinh mã khách hàng tự động (`KH-xxxxxx`), kiểm tra chống trùng số điện thoại, quản lý Soft Delete (`status = 0`), tính toán điểm tích lũy và cập nhật hồ sơ bệnh lý lâm sàng.
- **Data Access Layer (Repository)**: `CustomerRepository`, `CustomerHealthProfileRepository` truy vấn dữ liệu từ bảng `customers` và `customer_health_profiles` trên cơ sở dữ liệu quan hệ SQL Server.

---

## 2. CLASS DIAGRAM CHI TIẾT (DETAILED CLASS DIAGRAM)

```mermaid
classDiagram
    direction TB

    %% Controller Layer
    class CustomerController {
        -CustomerService customerService
        +getCustomers(String, Short, int, int, String, String) ResponseEntity~ApiResponse~PageResponse~CustomerResponse~~~
        +getCustomerDetail(Long) ResponseEntity~ApiResponse~CustomerDetailResponse~~
        +registerCustomer(CustomerCreateRequest, Authentication) ResponseEntity~ApiResponse~CustomerDetailResponse~~
        +updateCustomer(Long, CustomerUpdateRequest, Authentication) ResponseEntity~ApiResponse~CustomerDetailResponse~~
        +deleteCustomer(Long, Authentication) ResponseEntity~ApiResponse~Map~String, Object~~~
        +reactivateCustomer(Long) ResponseEntity~ApiResponse~Map~String, Object~~~
    }

    %% Service Layer
    class CustomerService {
        <<interface>>
        +getCustomers(String, Short, int, int, String, String) PageResponse~CustomerResponse~
        +getCustomerDetail(Long) CustomerDetailResponse
        +registerCustomer(CustomerCreateRequest) CustomerDetailResponse
        +updateCustomer(Long, CustomerUpdateRequest) CustomerDetailResponse
        +deleteCustomer(Long, String) void
        +reactivateCustomer(Long) void
    }

    class CustomerServiceImpl {
        -CustomerRepository customerRepository
        -CustomerHealthProfileRepository healthProfileRepository
        -AuditLogRepository auditLogRepository
        +getCustomers(String, Short, int, int, String, String) PageResponse~CustomerResponse~
        +getCustomerDetail(Long) CustomerDetailResponse
        +registerCustomer(CustomerCreateRequest) CustomerDetailResponse
        +updateCustomer(Long, CustomerUpdateRequest) CustomerDetailResponse
        +deleteCustomer(Long, String) void
        +reactivateCustomer(Long) void
        -generateCustomerCode() String
        -mapToDetailResponse(Customer, CustomerHealthProfile) CustomerDetailResponse
    }

    %% Repositories
    class CustomerRepository {
        <<interface>>
        +findByPhone(String) Optional~Customer~
        +existsByPhone(String) boolean
        +existsByPhoneAndIdNot(String, Long) boolean
        +findWithFilter(String, Short, Pageable) Page~Customer~
        +countByStatus(Short) long
    }

    class CustomerHealthProfileRepository {
        <<interface>>
        +findByCustomer_Id(Long) Optional~CustomerHealthProfile~
        +deleteByCustomer_Id(Long) void
    }

    %% Domain Entities
    class Customer {
        -Long id
        -String code
        -String fullName
        -String phone
        -String email
        -String address
        -LocalDate dateOfBirth
        -Short gender
        -Integer loyaltyPoints
        -Short status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        -CustomerHealthProfile healthProfile
        -List~SalesInvoice~ salesInvoices
    }

    class CustomerHealthProfile {
        -Long id
        -Customer customer
        -BigDecimal heightCm
        -BigDecimal weightKg
        -String allergies
        -String chronicDiseases
        -String currentMedications
        -Boolean isPregnant
        -Boolean isBreastfeeding
        -String notes
        -LocalDateTime updatedAt
    }

    %% DTOs
    class CustomerCreateRequest {
        +String fullName
        +String phone
        +String email
        +String address
        +LocalDate dateOfBirth
        +Short gender
        +BigDecimal heightCm
        +BigDecimal weightKg
        +String allergies
        +String chronicDiseases
        +String currentMedications
        +Boolean isPregnant
        +Boolean isBreastfeeding
        +String notes
    }

    class CustomerUpdateRequest {
        +String fullName
        +String phone
        +String email
        +String address
        +LocalDate dateOfBirth
        +Short gender
        +BigDecimal heightCm
        +BigDecimal weightKg
        +String allergies
        +String chronicDiseases
        +String currentMedications
        +Boolean isPregnant
        +Boolean isBreastfeeding
        +String notes
    }

    class CustomerResponse {
        +Long id
        +String code
        +String fullName
        +String phone
        +Short gender
        +Integer loyaltyPoints
        +Short status
        +Boolean hasAllergies
        +LocalDateTime createdAt
    }

    class CustomerDetailResponse {
        +Long id
        +String code
        +String fullName
        +String phone
        +String email
        +String address
        +LocalDate dateOfBirth
        +Short gender
        +Integer loyaltyPoints
        +Short status
        +CustomerHealthProfileDto healthProfile
        +LocalDateTime createdAt
    }

    class CustomerHealthProfileDto {
        +BigDecimal heightCm
        +BigDecimal weightKg
        +String allergies
        +String chronicDiseases
        +String currentMedications
        +Boolean isPregnant
        +Boolean isBreastfeeding
        +String notes
    }

    %% Relationships
    CustomerController ..> CustomerService : delegates to
    CustomerService <|.. CustomerServiceImpl : implements
    CustomerServiceImpl ..> CustomerRepository : accesses
    CustomerServiceImpl ..> CustomerHealthProfileRepository : accesses

    Customer "1" *-- "0..1" CustomerHealthProfile : has
    Customer "1" o-- "*" SalesInvoice : makes

    CustomerController ..> CustomerCreateRequest : accepts
    CustomerController ..> CustomerUpdateRequest : accepts
    CustomerController ..> CustomerDetailResponse : returns
    CustomerController ..> CustomerResponse : returns
    CustomerDetailResponse *-- CustomerHealthProfileDto : contains
```

---

## 3. SEQUENCE DIAGRAMS CHI TIẾT CHO CẢ 5 CHỨC NĂNG

### 3.1. Sequence Diagram: UC29 - Register New Customer (Đăng ký khách hàng mới)

```mermaid
sequenceDiagram
    autonumber
    actor User as Dược sĩ / Thu ngân
    participant FE as Frontend (CustomerFormModal)
    participant CC as CustomerController
    participant CS as CustomerServiceImpl
    participant CR as CustomerRepository
    participant HR as CustomerHealthProfileRepository
    participant ALR as AuditLogRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Nhập fullName, phone, gender, allergies... -> Bấm "Lưu khách hàng"
    FE->>FE: Client-side Validation (phone 10 số, fullName không rỗng)
    FE->>CC: POST /api/v1/customers (CustomerCreateRequest, Bearer AT)
    activate CC
    CC->>CS: registerCustomer(CustomerCreateRequest)
    activate CS

    CS->>CR: existsByPhone(phone)
    activate CR
    CR->>DB: SELECT COUNT(*) FROM customers WHERE phone=?
    DB-->>CR: count
    CR-->>CS: boolean (isPhoneExists)
    deactivate CR

    alt SĐT đã tồn tại
        CS-->>CC: throw DuplicateResourceException("Số điện thoại đã được đăng ký")
        CC-->>FE: HTTP 409 Conflict
        FE-->>User: Hiển thị thông báo "Số điện thoại này đã có trên hệ thống"
    else SĐT hợp lệ
        CS->>CS: generateCustomerCode() -> 'KH-000108'
        CS->>CR: save(Customer entity)
        activate CR
        CR->>DB: INSERT INTO customers (code, full_name, phone, gender, loyalty_points=0, status=1)
        DB-->>CR: Customer saved (id=108)
        CR-->>CS: savedCustomer
        deactivate CR

        opt Có thông tin sức khỏe (chiều cao, cân nặng, dị ứng...)
            CS->>HR: save(CustomerHealthProfile)
            activate HR
            HR->>DB: INSERT INTO customer_health_profiles (customer_id, allergies, chronic_diseases...)
            DB-->>HR: OK
            deactivate HR
        end

        CS->>ALR: save(AuditLog 'CREATE_CUSTOMER_SUCCESS')
        activate ALR
        ALR->>DB: INSERT INTO audit_logs (...)
        DB-->>ALR: OK
        deactivate ALR

        CS-->>CC: CustomerDetailResponse
        deactivate CS
        CC-->>FE: HTTP 201 Created + CustomerDetailResponse
        deactivate CC

        FE->>FE: Tự động gán khách hàng mới vào giỏ hàng POS (nếu đang ở màn hình bán hàng)
        FE-->>User: Đóng modal, hiển thị Toast "Tạo hồ sơ khách hàng thành công!"
    end
```

---

### 3.2. Sequence Diagram: UC30 - Edit Customer (Chỉnh sửa thông tin khách hàng)

```mermaid
sequenceDiagram
    autonumber
    actor User as Dược sĩ / Quản lý
    participant FE as Frontend (CustomerFormModal)
    participant CC as CustomerController
    participant CS as CustomerServiceImpl
    participant CR as CustomerRepository
    participant HR as CustomerHealthProfileRepository
    participant ALR as AuditLogRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Chỉnh sửa fullName, phone, cập nhật dị ứng mới -> Bấm "Lưu thay đổi"
    FE->>CC: PUT /api/v1/customers/{id} (CustomerUpdateRequest, Bearer AT)
    activate CC
    CC->>CS: updateCustomer(customerId, CustomerUpdateRequest)
    activate CS

    CS->>CR: findById(customerId)
    activate CR
    CR->>DB: SELECT * FROM customers WHERE id=?
    DB-->>CR: Customer entity
    CR-->>CS: Customer
    deactivate CR

    CS->>CR: existsByPhoneAndIdNot(newPhone, customerId)
    activate CR
    CR->>DB: SELECT COUNT(*) FROM customers WHERE phone=? AND id != ?
    DB-->>CR: count
    CR-->>CS: boolean (isPhoneDuplicated)
    deactivate CR

    alt SĐT bị trùng với khách hàng khác
        CS-->>CC: throw DuplicateResourceException("Số điện thoại đã thuộc về khách hàng khác")
        CC-->>FE: HTTP 409 Conflict
        FE-->>User: Cảnh báo "Số điện thoại đã trùng với khách hàng khác!"
    else Hợp lệ
        CS->>CR: Cập nhật fullName, phone, email, address, gender
        activate CR
        CR->>DB: UPDATE customers SET full_name=?, phone=?, email=? WHERE id=?
        DB-->>CR: OK
        deactivate CR

        CS->>HR: findByCustomer_Id(customerId)
        activate HR
        HR->>DB: SELECT * FROM customer_health_profiles WHERE customer_id=?
        DB-->>HR: CustomerHealthProfile entity
        deactivate HR

        CS->>HR: Cập nhật allergies, chronicDiseases, isPregnant, notes...
        activate HR
        HR->>DB: UPDATE customer_health_profiles SET allergies=?, chronic_diseases=? WHERE id=?
        DB-->>HR: OK
        deactivate HR

        CS->>ALR: save(AuditLog 'UPDATE_CUSTOMER_SUCCESS')
        activate ALR
        ALR->>DB: INSERT INTO audit_logs (...)
        DB-->>ALR: OK
        deactivate ALR

        CS-->>CC: CustomerDetailResponse
        deactivate CS
        CC-->>FE: HTTP 200 OK + CustomerDetailResponse
        deactivate CC

        FE-->>User: Đóng modal, cập nhật dữ liệu bảng và báo "Cập nhật thành công!"
    end
```

---

### 3.3. Sequence Diagram: UC31 - View Customer Detail (Xem chi tiết hồ sơ & cảnh báo dị ứng)

```mermaid
sequenceDiagram
    autonumber
    actor User as Dược sĩ
    participant FE as Frontend (CustomerDetailModal)
    participant CC as CustomerController
    participant CS as CustomerServiceImpl
    participant CR as CustomerRepository
    participant HR as CustomerHealthProfileRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Bấm vào tên khách hàng hoặc nút "Xem chi tiết" (Icon mắt)
    FE->>CC: GET /api/v1/customers/{id} (Bearer AT)
    activate CC
    CC->>CS: getCustomerDetail(customerId)
    activate CS

    CS->>CR: findById(customerId)
    activate CR
    CR->>DB: SELECT * FROM customers WHERE id=?
    DB-->>CR: Customer entity
    CR-->>CS: Customer
    deactivate CR

    CS->>HR: findByCustomer_Id(customerId)
    activate HR
    HR->>DB: SELECT * FROM customer_health_profiles WHERE customer_id=?
    DB-->>HR: CustomerHealthProfile entity
    deactivate HR

    CS->>CS: mapToDetailResponse(customer, healthProfile)
    CS-->>CC: CustomerDetailResponse (kèm điểm tích lũy & tiền sử dị ứng)
    deactivate CS
    CC-->>FE: HTTP 200 OK + CustomerDetailResponse
    deactivate CC

    FE->>FE: Render thông tin cá nhân, chỉ số BMI và lịch sử mua
    opt Có tiền sử dị ứng thuốc
        FE->>FE: Hiển thị Alert Banner màu đỏ nổi bật: "⚠️ Tiền sử dị ứng: [danh sách thuốc]"
    end
    FE-->>User: Hiển thị giao diện Modal chi tiết khách hàng
```

---

### 3.4. Sequence Diagram: UC32 - View Customer List (Tra cứu danh bạ khách hàng)

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên
    participant FE as Frontend (CustomerDirectoryPage)
    participant CC as CustomerController
    participant CS as CustomerServiceImpl
    participant CR as CustomerRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Truy cập trang Danh bạ Khách hàng (/customers)
    FE->>CC: GET /api/v1/customers?page=0&size=10&sortBy=id&sortDir=desc (Bearer AT)
    activate CC
    CC->>CS: getCustomers(keyword="", status=null, 0, 10, "id", "desc")
    activate CS

    CS->>CR: findWithFilter(keyword, status, Pageable)
    activate CR
    CR->>DB: SELECT c FROM customers c WHERE c.status=1 ORDER BY c.id DESC OFFSET 0 ROWS FETCH NEXT 10 ROWS
    DB-->>CR: Page<Customer> + TotalElements
    CR-->>CS: Page<Customer>
    deactivate CR

    CS-->>CC: PageResponse<CustomerResponse> (content, page, totalElements, totalPages)
    deactivate CS
    CC-->>FE: HTTP 200 OK + PageResponse
    deactivate CC

    FE-->>User: Hiển thị bảng danh bạ khách hàng kèm phân trang

    %% Flow tìm kiếm thời gian thực
    User->>FE: Gõ số điện thoại "0987123456" vào ô tìm kiếm
    FE->>FE: Chờ 300ms Debounce
    FE->>CC: GET /api/v1/customers?keyword=0987123456&page=0&size=10
    activate CC
    CC->>CS: getCustomers("0987123456", null, 0, 10, "id", "desc")
    activate CS
    CS->>CR: findWithFilter("0987123456", null, Pageable)
    activate CR
    CR->>DB: SELECT c FROM customers c WHERE (c.phone LIKE '%0987123456%' OR c.fullName LIKE ...)
    DB-->>CR: Kết quả lọc
    CR-->>CS: Page<Customer>
    deactivate CR
    CS-->>CC: PageResponse<CustomerResponse>
    deactivate CS
    CC-->>FE: HTTP 200 OK (Kết quả tìm kiếm)
    deactivate CC
    FE-->>User: Cập nhật danh sách bảng khớp với số điện thoại vừa tìm
```

---

### 3.5. Sequence Diagram: UC33 - Delete Customer (Xóa / Ngừng theo dõi khách hàng - Soft Delete)

```mermaid
sequenceDiagram
    autonumber
    actor User as Quản lý cửa hàng / Admin
    participant FE as Frontend (DeleteConfirmDialog)
    participant CC as CustomerController
    participant CS as CustomerServiceImpl
    participant CR as CustomerRepository
    participant ALR as AuditLogRepository
    participant DB as SQL Server (PMS DB)

    User->>FE: Bấm nút "Xóa" tại dòng khách hàng -> Bấm "Xác nhận xóa"
    FE->>CC: DELETE /api/v1/customers/{id}?reason=Ngừng-liên-hệ (Bearer AT)
    activate CC
    CC->>CS: deleteCustomer(customerId, reason)
    activate CS

    CS->>CR: findById(customerId)
    activate CR
    CR->>DB: SELECT * FROM customers WHERE id=?
    DB-->>CR: Customer entity
    CR-->>CS: Customer
    deactivate CR

    CS->>CR: customer.setStatus((short) 0) -- Soft Delete
    activate CR
    CR->>DB: UPDATE customers SET status=0, updated_at=NOW() WHERE id=?
    DB-->>CR: OK (Bản ghi được đánh dấu Inactive, không làm mất hóa đơn lịch sử)
    deactivate CR

    CS->>ALR: save(AuditLog 'DELETE_CUSTOMER_SUCCESS', customerId, reason)
    activate ALR
    ALR->>DB: INSERT INTO audit_logs (...)
    DB-->>ALR: OK
    deactivate ALR

    CS-->>CC: void (Thành công)
    deactivate CS
    CC-->>FE: HTTP 200 OK ("Xóa khách hàng thành công")
    deactivate CC

    FE->>FE: Loại bỏ khách hàng khỏi danh sách đang hiển thị
    FE-->>User: Hiển thị thông báo "Đã ngừng theo dõi khách hàng!"
```
