/* =====================================================================
   PHARMACY MANAGEMENT SYSTEM (PMS) - SQL SERVER SCHEMA
   Course : SBA301 - Group 5
   Stack  : ReactJS + Java Spring Boot (REST) + SQL Server
   Source : SRS v1.0 (72 use cases, 25 entities) - extended where use cases
            need more than the ERD (see header of each section).

   Conventions
   - snake_case table/column names (same as the SRS ERD)
   - PK: id BIGINT IDENTITY ; money: DECIMAL(18,2) ; text: NVARCHAR (Vietnamese)
   - Status/type columns are TINYINT with CHECK; meaning is documented inline
   - Dates: DATETIME2(0) for events, DATE for business dates
   - "Soft delete" = status column (no physical delete of master data)
   ===================================================================== */

USE master;
GO
IF DB_ID(N'PMS') IS NULL
    CREATE DATABASE PMS COLLATE Vietnamese_CI_AS;
GO
USE PMS;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* =====================================================================
   1. AUTHENTICATION & SECURITY  (UC 01-11)
   ===================================================================== */

-- Branches AND the central warehouse are both rows in stores (type differentiates).
CREATE TABLE dbo.stores (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_stores PRIMARY KEY,
    code        VARCHAR(20)   NOT NULL CONSTRAINT UQ_stores_code UNIQUE,
    name        NVARCHAR(150) NOT NULL,
    type        TINYINT       NOT NULL CONSTRAINT DF_stores_type DEFAULT 1
                CONSTRAINT CK_stores_type CHECK (type IN (0,1,2)),   -- 0 head office, 1 retail store, 2 central warehouse
    address     NVARCHAR(500) NULL,
    phone       VARCHAR(20)   NULL,
    status      TINYINT       NOT NULL CONSTRAINT DF_stores_status DEFAULT 1
                CONSTRAINT CK_stores_status CHECK (status IN (0,1)), -- 0 inactive, 1 active
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_stores_created DEFAULT SYSDATETIME()
);
GO

-- Roles are data (not a fixed int) so new roles can be added without code change.
CREATE TABLE dbo.roles (
    id          INT IDENTITY(1,1) CONSTRAINT PK_roles PRIMARY KEY,
    code        VARCHAR(30)   NOT NULL CONSTRAINT UQ_roles_code UNIQUE,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(300) NULL
);
GO

CREATE TABLE dbo.permissions (
    id           INT IDENTITY(1,1) CONSTRAINT PK_permissions PRIMARY KEY,
    code         VARCHAR(50)   NOT NULL CONSTRAINT UQ_permissions_code UNIQUE,
    module       VARCHAR(40)   NOT NULL,          -- feature group, e.g. PRODUCT, SALES
    description  NVARCHAR(200) NULL
);
GO

-- Permission set of a role (UC08 assigns a role to a user; permissions come only from the role)
CREATE TABLE dbo.role_permissions (
    role_id        INT NOT NULL CONSTRAINT FK_rp_role REFERENCES dbo.roles(id),
    permission_id  INT NOT NULL CONSTRAINT FK_rp_perm REFERENCES dbo.permissions(id),
    CONSTRAINT PK_role_permissions PRIMARY KEY (role_id, permission_id)
);
GO

CREATE TABLE dbo.accounts (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_accounts PRIMARY KEY,
    store_id    BIGINT        NULL CONSTRAINT FK_accounts_store REFERENCES dbo.stores(id), -- NULL = head-office user
    role_id     INT           NOT NULL CONSTRAINT FK_accounts_role REFERENCES dbo.roles(id),
    username    VARCHAR(50)   NOT NULL,
    email       VARCHAR(150)  NOT NULL,
    phone       VARCHAR(20)   NULL,
    password    VARCHAR(100)  NOT NULL,           -- BCrypt hash only
    status      TINYINT       NOT NULL CONSTRAINT DF_accounts_status DEFAULT 1
                CONSTRAINT CK_accounts_status CHECK (status IN (0,1,2)), -- 0 locked, 1 active, 2 inactive/resigned
    last_login_at DATETIME2(0) NULL,
    failed_login_count INT    NOT NULL CONSTRAINT DF_accounts_failed DEFAULT 0,
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_accounts_created DEFAULT SYSDATETIME(),
    updated_at  DATETIME2(0)  NULL
);
GO
CREATE UNIQUE INDEX UX_accounts_username ON dbo.accounts(username);
CREATE UNIQUE INDEX UX_accounts_email    ON dbo.accounts(email);
CREATE INDEX IX_accounts_store_role      ON dbo.accounts(store_id, role_id);
GO

CREATE TABLE dbo.account_informations (
    id            BIGINT IDENTITY(1,1) CONSTRAINT PK_account_informations PRIMARY KEY,
    account_id    BIGINT        NOT NULL,   -- 1-1 with accounts (UQ below)
    full_name     NVARCHAR(150) NOT NULL,
    date_of_birth DATE          NULL,
    gender        TINYINT       NULL CONSTRAINT CK_ai_gender CHECK (gender IN (0,1,2)), -- 0 female,1 male,2 other
    address       NVARCHAR(500) NULL,
    avatar_url    VARCHAR(500)  NULL,
    CONSTRAINT UQ_ai_account UNIQUE (account_id),
    CONSTRAINT FK_ai_account FOREIGN KEY (account_id) REFERENCES dbo.accounts(id)
);
GO

-- UC05 Forgot password (token is stored hashed; link is sent by SMTP)
CREATE TABLE dbo.password_reset_tokens (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_prt PRIMARY KEY,
    account_id  BIGINT       NOT NULL CONSTRAINT FK_prt_account REFERENCES dbo.accounts(id),
    token_hash  VARCHAR(100) NOT NULL,
    expires_at  DATETIME2(0) NOT NULL,
    used_at     DATETIME2(0) NULL,
    created_at  DATETIME2(0) NOT NULL CONSTRAINT DF_prt_created DEFAULT SYSDATETIME()
);
CREATE INDEX IX_prt_token ON dbo.password_reset_tokens(token_hash);
GO

-- UC11 View Audit Log
CREATE TABLE dbo.audit_logs (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_audit_logs PRIMARY KEY,
    account_id  BIGINT        NULL CONSTRAINT FK_audit_account REFERENCES dbo.accounts(id), -- NULL = system job
    action      TINYINT       NOT NULL,   -- 1 create,2 update,3 delete,4 login,5 logout,6 approve,7 reject,8 lock,9 unlock,10 other
    entity_name VARCHAR(60)   NOT NULL,
    entity_id   BIGINT        NULL,
    old_value   NVARCHAR(MAX) NULL,       -- JSON
    new_value   NVARCHAR(MAX) NULL,       -- JSON
    ip_address  VARCHAR(45)   NULL,
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_audit_created DEFAULT SYSDATETIME()
);
CREATE INDEX IX_audit_entity  ON dbo.audit_logs(entity_name, entity_id);
CREATE INDEX IX_audit_account ON dbo.audit_logs(account_id, created_at DESC);
GO

/* =====================================================================
   2. CATALOG  (UC 12-20)
   ===================================================================== */
CREATE TABLE dbo.categories (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_categories PRIMARY KEY,
    name        NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    status      TINYINT       NOT NULL CONSTRAINT DF_cat_status DEFAULT 1
                CONSTRAINT CK_cat_status CHECK (status IN (0,1)),
    created_by  BIGINT        NOT NULL CONSTRAINT FK_cat_creator REFERENCES dbo.accounts(id),
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_cat_created DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_categories_name ON dbo.categories(name);
GO

CREATE TABLE dbo.products (
    id                    BIGINT IDENTITY(1,1) CONSTRAINT PK_products PRIMARY KEY,
    category_id           BIGINT        NOT NULL CONSTRAINT FK_products_cat REFERENCES dbo.categories(id),
    barcode               VARCHAR(50)   NULL,
    name                  NVARCHAR(250) NOT NULL,
    unit                  NVARCHAR(30)  NOT NULL,                 -- box, blister, tablet, bottle...
    active_ingredient     NVARCHAR(250) NULL,
    manufacturer          NVARCHAR(200) NULL,
    is_prescription       BIT           NOT NULL CONSTRAINT DF_products_rx DEFAULT 0,   -- BR-01
    cost_price            DECIMAL(18,2) NOT NULL CONSTRAINT DF_products_cost DEFAULT 0
                          CONSTRAINT CK_products_cost CHECK (cost_price >= 0),
    selling_price         DECIMAL(18,2) NOT NULL CONSTRAINT DF_products_sell DEFAULT 0   -- BR-10: one central price
                          CONSTRAINT CK_products_sell CHECK (selling_price >= 0),
    min_quantity          INT           NOT NULL CONSTRAINT DF_products_min DEFAULT 20   -- low-stock threshold
                          CONSTRAINT CK_products_min CHECK (min_quantity >= 0),
    description           NVARCHAR(MAX) NULL,
    image_url             VARCHAR(500)  NULL,
    status                TINYINT       NOT NULL CONSTRAINT DF_products_status DEFAULT 1
                          CONSTRAINT CK_products_status CHECK (status IN (0,1)),
    created_at            DATETIME2(0)  NOT NULL CONSTRAINT DF_products_created DEFAULT SYSDATETIME(),
    updated_at            DATETIME2(0)  NULL
);
GO
CREATE UNIQUE INDEX UX_products_barcode ON dbo.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IX_products_category       ON dbo.products(category_id);
CREATE INDEX IX_products_name           ON dbo.products(name);
GO

-- UC15/16 : every price change is a new row, old rows are never updated.
CREATE TABLE dbo.price_histories (
    id             BIGINT IDENTITY(1,1) CONSTRAINT PK_price_histories PRIMARY KEY,
    product_id     BIGINT        NOT NULL CONSTRAINT FK_ph_product REFERENCES dbo.products(id),
    account_id     BIGINT        NOT NULL CONSTRAINT FK_ph_account REFERENCES dbo.accounts(id),
    cost_price     DECIMAL(18,2) NOT NULL,
    selling_price  DECIMAL(18,2) NOT NULL,
    effective_from DATETIME2(0)  NOT NULL,
    reason         NVARCHAR(500) NULL,
    created_at     DATETIME2(0)  NOT NULL CONSTRAINT DF_ph_created DEFAULT SYSDATETIME()
);
CREATE INDEX IX_ph_product ON dbo.price_histories(product_id, effective_from DESC);
GO

/* =====================================================================
   3. CUSTOMERS  (UC 29-33)  -- not in the ERD, required by the use cases
   ===================================================================== */
CREATE TABLE dbo.customers (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_customers PRIMARY KEY,
    full_name   NVARCHAR(150) NOT NULL,
    phone       VARCHAR(20)   NOT NULL,
    email       VARCHAR(150)  NULL,
    date_of_birth DATE        NULL,
    gender      TINYINT       NULL CONSTRAINT CK_cus_gender CHECK (gender IN (0,1,2)),
    address     NVARCHAR(500) NULL,
    status      TINYINT       NOT NULL CONSTRAINT DF_cus_status DEFAULT 1
                CONSTRAINT CK_cus_status CHECK (status IN (0,1)),   -- 0 deleted (soft), 1 active
    created_by  BIGINT        NULL CONSTRAINT FK_cus_creator REFERENCES dbo.accounts(id),
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_cus_created DEFAULT SYSDATETIME(),
    updated_at  DATETIME2(0)  NULL
);
CREATE UNIQUE INDEX UX_customers_phone ON dbo.customers(phone) WHERE status = 1;
CREATE INDEX IX_customers_name         ON dbo.customers(full_name);
GO

CREATE TABLE dbo.customer_health_profiles (
    id                 BIGINT IDENTITY(1,1) CONSTRAINT PK_chp PRIMARY KEY,
    customer_id        BIGINT        NOT NULL,   -- 1-1 with customers (UQ below)
    height_cm          DECIMAL(5,1)  NULL CONSTRAINT CK_chp_h CHECK (height_cm > 0),
    weight_kg          DECIMAL(5,1)  NULL CONSTRAINT CK_chp_w CHECK (weight_kg > 0),
    allergies          NVARCHAR(1000) NULL,
    medical_conditions NVARCHAR(1000) NULL,
    current_medications NVARCHAR(1000) NULL,
    note               NVARCHAR(1000) NULL,
    updated_at         DATETIME2(0)  NULL,
    CONSTRAINT UQ_chp_customer UNIQUE (customer_id),
    CONSTRAINT FK_chp_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id)
);
GO

/* =====================================================================
   4. SUPPLIERS & PROCUREMENT  (UC 47, 55-69)
   ===================================================================== */
CREATE TABLE dbo.suppliers (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_suppliers PRIMARY KEY,
    code        VARCHAR(30)   NOT NULL CONSTRAINT UQ_suppliers_code UNIQUE,
    name        NVARCHAR(250) NOT NULL,
    contact_person NVARCHAR(150) NULL,
    phone       VARCHAR(20)   NULL,
    email       VARCHAR(150)  NULL,
    address     NVARCHAR(500) NULL,
    tax_code    VARCHAR(20)   NULL,
    status      TINYINT       NOT NULL CONSTRAINT DF_sup_status DEFAULT 1
                CONSTRAINT CK_sup_status CHECK (status IN (0,1,2)),  -- 0 inactive, 1 active, 2 blacklisted
    note        NVARCHAR(1000) NULL,
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_sup_created DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_suppliers_tax ON dbo.suppliers(tax_code) WHERE tax_code IS NOT NULL;
GO

-- Warehouse Manager's request: which medicines must be bought
CREATE TABLE dbo.purchase_requests (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_purchase_requests PRIMARY KEY,
    code        VARCHAR(30)   NOT NULL CONSTRAINT UQ_pr_code UNIQUE,
    store_id    BIGINT        NOT NULL CONSTRAINT FK_pr_store REFERENCES dbo.stores(id),  -- the warehouse
    created_by  BIGINT        NOT NULL CONSTRAINT FK_pr_creator REFERENCES dbo.accounts(id),
    approved_by BIGINT        NULL CONSTRAINT FK_pr_approver REFERENCES dbo.accounts(id),
    status      TINYINT       NOT NULL CONSTRAINT DF_pr_status DEFAULT 0
                CONSTRAINT CK_pr_status CHECK (status BETWEEN 0 AND 5),
                -- 0 draft, 1 submitted/approved for purchasing, 2 RFQ sent, 3 proposal created, 4 completed, 5 cancelled
    reason      NVARCHAR(500) NULL,
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_pr_created DEFAULT SYSDATETIME(),
    updated_at  DATETIME2(0)  NULL,
    approved_at DATETIME2(0)  NULL
);
CREATE INDEX IX_pr_status ON dbo.purchase_requests(status, created_at DESC);
GO

CREATE TABLE dbo.purchase_request_details (
    id                 BIGINT IDENTITY(1,1) CONSTRAINT PK_prd PRIMARY KEY,
    purchase_request_id BIGINT NOT NULL CONSTRAINT FK_prd_pr REFERENCES dbo.purchase_requests(id) ON DELETE CASCADE,
    product_id         BIGINT  NOT NULL CONSTRAINT FK_prd_product REFERENCES dbo.products(id),
    requested_quantity INT     NOT NULL CONSTRAINT CK_prd_qty CHECK (requested_quantity > 0),
    note               NVARCHAR(500) NULL,
    CONSTRAINT UQ_prd UNIQUE (purchase_request_id, product_id)
);
GO

-- One RFQ row = one supplier for one purchase request
CREATE TABLE dbo.rfqs (
    id                  BIGINT IDENTITY(1,1) CONSTRAINT PK_rfqs PRIMARY KEY,
    code                VARCHAR(30) NOT NULL CONSTRAINT UQ_rfq_code UNIQUE,
    purchase_request_id BIGINT NOT NULL CONSTRAINT FK_rfq_pr REFERENCES dbo.purchase_requests(id),
    supplier_id         BIGINT NOT NULL CONSTRAINT FK_rfq_supplier REFERENCES dbo.suppliers(id),
    created_by          BIGINT NOT NULL CONSTRAINT FK_rfq_creator REFERENCES dbo.accounts(id),
    status              TINYINT NOT NULL CONSTRAINT DF_rfq_status DEFAULT 0
                        CONSTRAINT CK_rfq_status CHECK (status BETWEEN 0 AND 4),
                        -- 0 draft, 1 sent, 2 send failed, 3 responded, 4 closed/expired
    sent_at             DATETIME2(0) NULL,
    response_at         DATETIME2(0) NULL,
    response_note       NVARCHAR(1000) NULL,
    created_at          DATETIME2(0) NOT NULL CONSTRAINT DF_rfq_created DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_rfq_pr_supplier UNIQUE (purchase_request_id, supplier_id)
);
GO

CREATE TABLE dbo.supplier_quotations (
    id             BIGINT IDENTITY(1,1) CONSTRAINT PK_supplier_quotations PRIMARY KEY,
    code           VARCHAR(30) NOT NULL CONSTRAINT UQ_sq_code UNIQUE,
    rfq_id         BIGINT NOT NULL CONSTRAINT FK_sq_rfq REFERENCES dbo.rfqs(id),
    supplier_id    BIGINT NOT NULL CONSTRAINT FK_sq_supplier REFERENCES dbo.suppliers(id),
    account_id     BIGINT NOT NULL CONSTRAINT FK_sq_account REFERENCES dbo.accounts(id),
    quotation_date DATE   NOT NULL,
    valid_until    DATE   NULL,
    total_amount   DECIMAL(18,2) NOT NULL CONSTRAINT DF_sq_total DEFAULT 0,
    status         TINYINT NOT NULL CONSTRAINT DF_sq_status DEFAULT 0
                   CONSTRAINT CK_sq_status CHECK (status BETWEEN 0 AND 4),
                   -- 0 draft, 1 valid, 2 selected, 3 rejected, 4 expired
    created_at     DATETIME2(0) NOT NULL CONSTRAINT DF_sq_created DEFAULT SYSDATETIME(),
    CONSTRAINT CK_sq_dates CHECK (valid_until IS NULL OR valid_until >= quotation_date)
);
CREATE INDEX IX_sq_rfq ON dbo.supplier_quotations(rfq_id);
GO

CREATE TABLE dbo.supplier_quotation_details (
    id                    BIGINT IDENTITY(1,1) CONSTRAINT PK_sqd PRIMARY KEY,
    supplier_quotation_id BIGINT NOT NULL CONSTRAINT FK_sqd_sq REFERENCES dbo.supplier_quotations(id) ON DELETE CASCADE,
    product_id            BIGINT NOT NULL CONSTRAINT FK_sqd_product REFERENCES dbo.products(id),
    quantity              INT    NOT NULL CONSTRAINT CK_sqd_qty CHECK (quantity > 0),
    unit_price            DECIMAL(18,2) NOT NULL CONSTRAINT CK_sqd_price CHECK (unit_price >= 0),
    tax_rate              DECIMAL(5,2)  NOT NULL CONSTRAINT DF_sqd_tax DEFAULT 0
                          CONSTRAINT CK_sqd_tax CHECK (tax_rate BETWEEN 0 AND 100),
    subtotal              AS CAST(quantity * unit_price * (1 + tax_rate/100.0) AS DECIMAL(18,2)) PERSISTED,
    CONSTRAINT UQ_sqd UNIQUE (supplier_quotation_id, product_id)
);
GO

-- The "Purchase Order" that the General Manager approves/rejects (UC 66-69)
CREATE TABLE dbo.purchase_proposals (
    id                   BIGINT IDENTITY(1,1) CONSTRAINT PK_purchase_proposals PRIMARY KEY,
    code                 VARCHAR(30) NOT NULL CONSTRAINT UQ_pp_code UNIQUE,
    purchase_request_id   BIGINT NOT NULL CONSTRAINT FK_pp_pr REFERENCES dbo.purchase_requests(id),
    supplier_quotation_id BIGINT NOT NULL CONSTRAINT FK_pp_sq REFERENCES dbo.supplier_quotations(id),
    created_by           BIGINT NOT NULL CONSTRAINT FK_pp_creator REFERENCES dbo.accounts(id),
    approved_by          BIGINT NULL CONSTRAINT FK_pp_approver REFERENCES dbo.accounts(id),
    status               TINYINT NOT NULL CONSTRAINT DF_pp_status DEFAULT 0
                         CONSTRAINT CK_pp_status CHECK (status BETWEEN 0 AND 5),
                         -- 0 draft, 1 pending approval, 2 approved, 3 rejected, 4 partially received, 5 completed
    reject_reason        NVARCHAR(500) NULL,
    total_amount         DECIMAL(18,2) NOT NULL CONSTRAINT DF_pp_total DEFAULT 0,
    created_at           DATETIME2(0) NOT NULL CONSTRAINT DF_pp_created DEFAULT SYSDATETIME(),
    approved_at          DATETIME2(0) NULL
);
CREATE INDEX IX_pp_status ON dbo.purchase_proposals(status, created_at DESC);
GO

/* =====================================================================
   5. INVENTORY CORE  (UC 33, 40-46)  -- batch-level, one table for store + warehouse
   ===================================================================== */
-- Physical position inside a warehouse (UC42 Assign Shelf/Bin)
CREATE TABLE dbo.warehouse_locations (
    id        BIGINT IDENTITY(1,1) CONSTRAINT PK_wl PRIMARY KEY,
    store_id  BIGINT      NOT NULL CONSTRAINT FK_wl_store REFERENCES dbo.stores(id),
    code      VARCHAR(30) NOT NULL,             -- e.g. A-01-03 (aisle-shelf-bin)
    aisle     VARCHAR(10) NULL,
    shelf     VARCHAR(10) NULL,
    bin       VARCHAR(10) NULL,
    status    TINYINT     NOT NULL CONSTRAINT DF_wl_status DEFAULT 1,
    CONSTRAINT UQ_wl UNIQUE (store_id, code)
);
GO

-- A batch (lot) is created when a purchase receipt is confirmed. Needed for FEFO (BR-02/04).
CREATE TABLE dbo.product_batches (
    id               BIGINT IDENTITY(1,1) CONSTRAINT PK_product_batches PRIMARY KEY,
    product_id       BIGINT       NOT NULL CONSTRAINT FK_pb_product REFERENCES dbo.products(id),
    batch_number     VARCHAR(50)  NOT NULL,
    manufacture_date DATE         NULL,
    expiry_date      DATE         NOT NULL,
    supplier_id      BIGINT       NULL CONSTRAINT FK_pb_supplier REFERENCES dbo.suppliers(id),
    created_at       DATETIME2(0) NOT NULL CONSTRAINT DF_pb_created DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_pb UNIQUE (product_id, batch_number),
    CONSTRAINT CK_pb_dates CHECK (manufacture_date IS NULL OR expiry_date > manufacture_date)
);
CREATE INDEX IX_pb_expiry ON dbo.product_batches(expiry_date);
GO

-- Current stock: one row per (store/warehouse, batch). version = optimistic lock for @Version.
CREATE TABLE dbo.inventories (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_inventories PRIMARY KEY,
    store_id    BIGINT NOT NULL CONSTRAINT FK_inv_store REFERENCES dbo.stores(id),
    product_id  BIGINT NOT NULL CONSTRAINT FK_inv_product REFERENCES dbo.products(id),
    batch_id    BIGINT NOT NULL CONSTRAINT FK_inv_batch REFERENCES dbo.product_batches(id),
    location_id BIGINT NULL CONSTRAINT FK_inv_location REFERENCES dbo.warehouse_locations(id),
    quantity    INT    NOT NULL CONSTRAINT DF_inv_qty DEFAULT 0 CONSTRAINT CK_inv_qty CHECK (quantity >= 0),
    version     INT    NOT NULL CONSTRAINT DF_inv_ver DEFAULT 0,
    updated_at  DATETIME2(0) NOT NULL CONSTRAINT DF_inv_updated DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_inventories UNIQUE (store_id, batch_id)
);
CREATE INDEX IX_inv_store_product ON dbo.inventories(store_id, product_id) INCLUDE (quantity, batch_id);
GO

-- Immutable stock ledger: every +/- of inventories writes one row (traceability, reports, audit).
CREATE TABLE dbo.stock_movements (
    id              BIGINT IDENTITY(1,1) CONSTRAINT PK_stock_movements PRIMARY KEY,
    store_id        BIGINT NOT NULL CONSTRAINT FK_sm_store REFERENCES dbo.stores(id),
    product_id      BIGINT NOT NULL CONSTRAINT FK_sm_product REFERENCES dbo.products(id),
    batch_id        BIGINT NOT NULL CONSTRAINT FK_sm_batch REFERENCES dbo.product_batches(id),
    movement_type   TINYINT NOT NULL CONSTRAINT CK_sm_type CHECK (movement_type BETWEEN 1 AND 8),
                    -- 1 purchase receipt, 2 goods issue out, 3 goods issue in, 4 sale,
                    -- 5 sale return, 6 adjustment, 7 audit correction, 8 expired write-off
    quantity_change INT NOT NULL,                 -- + in, - out
    quantity_after  INT NOT NULL,
    reference_type  VARCHAR(40) NOT NULL,         -- table name of the source document
    reference_id    BIGINT NOT NULL,
    created_by      BIGINT NULL CONSTRAINT FK_sm_creator REFERENCES dbo.accounts(id),
    created_at      DATETIME2(0) NOT NULL CONSTRAINT DF_sm_created DEFAULT SYSDATETIME(),
    note            NVARCHAR(500) NULL
);
CREATE INDEX IX_sm_product ON dbo.stock_movements(store_id, product_id, created_at DESC);
CREATE INDEX IX_sm_ref     ON dbo.stock_movements(reference_type, reference_id);
GO

/* =====================================================================
   6. WAREHOUSE RECEIPT  (UC 53-54)
   ===================================================================== */
CREATE TABLE dbo.purchase_receipts (
    id                   BIGINT IDENTITY(1,1) CONSTRAINT PK_purchase_receipts PRIMARY KEY,
    code                 VARCHAR(30) NOT NULL CONSTRAINT UQ_prc_code UNIQUE,
    purchase_proposal_id BIGINT NOT NULL CONSTRAINT FK_prc_pp REFERENCES dbo.purchase_proposals(id),
    supplier_id          BIGINT NOT NULL CONSTRAINT FK_prc_supplier REFERENCES dbo.suppliers(id),
    store_id             BIGINT NOT NULL CONSTRAINT FK_prc_store REFERENCES dbo.stores(id), -- receiving warehouse
    created_by           BIGINT NOT NULL CONSTRAINT FK_prc_creator REFERENCES dbo.accounts(id),
    confirmed_by         BIGINT NULL CONSTRAINT FK_prc_confirmer REFERENCES dbo.accounts(id),
    delivery_type        TINYINT NOT NULL CONSTRAINT DF_prc_dtype DEFAULT 1
                         CONSTRAINT CK_prc_dtype CHECK (delivery_type IN (1,2)),  -- 1 full, 2 partial
    status               TINYINT NOT NULL CONSTRAINT DF_prc_status DEFAULT 0
                         CONSTRAINT CK_prc_status CHECK (status BETWEEN 0 AND 3),  -- 0 draft, 1 confirmed, 2 cancelled
    total_amount         DECIMAL(18,2) NOT NULL CONSTRAINT DF_prc_total DEFAULT 0,
    note                 NVARCHAR(1000) NULL,
    created_at           DATETIME2(0) NOT NULL CONSTRAINT DF_prc_created DEFAULT SYSDATETIME(),
    confirmed_at         DATETIME2(0) NULL
);
CREATE INDEX IX_prc_status ON dbo.purchase_receipts(status, created_at DESC);
GO

CREATE TABLE dbo.purchase_receipt_details (
    id                  BIGINT IDENTITY(1,1) CONSTRAINT PK_prcd PRIMARY KEY,
    purchase_receipt_id BIGINT NOT NULL CONSTRAINT FK_prcd_prc REFERENCES dbo.purchase_receipts(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL CONSTRAINT FK_prcd_product REFERENCES dbo.products(id),
    order_quantity      INT    NOT NULL CONSTRAINT DF_prcd_oq DEFAULT 0,
    quantity            INT    NOT NULL CONSTRAINT CK_prcd_qty CHECK (quantity >= 0),
    unit_cost           DECIMAL(18,2) NOT NULL CONSTRAINT CK_prcd_cost CHECK (unit_cost >= 0),
    subtotal            AS CAST(quantity * unit_cost AS DECIMAL(18,2)) PERSISTED,
    batch_number        VARCHAR(50) NOT NULL,
    manufacture_date    DATE NULL,
    expiry_date         DATE NOT NULL,
    location_id         BIGINT NULL CONSTRAINT FK_prcd_loc REFERENCES dbo.warehouse_locations(id),
    batch_id            BIGINT NULL CONSTRAINT FK_prcd_batch REFERENCES dbo.product_batches(id) -- filled on confirm
);
GO

/* =====================================================================
   7. STORE REPLENISHMENT & GOODS ISSUE  (UC 35-39, 48-52)
   ===================================================================== */
CREATE TABLE dbo.stock_requisitions (
    id            BIGINT IDENTITY(1,1) CONSTRAINT PK_stock_requisitions PRIMARY KEY,
    code          VARCHAR(30) NOT NULL CONSTRAINT UQ_sr_code UNIQUE,
    store_id      BIGINT NOT NULL CONSTRAINT FK_sr_store REFERENCES dbo.stores(id),   -- requesting store
    created_by    BIGINT NOT NULL CONSTRAINT FK_sr_creator REFERENCES dbo.accounts(id),
    approved_by   BIGINT NULL CONSTRAINT FK_sr_approver REFERENCES dbo.accounts(id),
    status        TINYINT NOT NULL CONSTRAINT DF_sr_status DEFAULT 0
                  CONSTRAINT CK_sr_status CHECK (status BETWEEN 0 AND 7),
                  -- 0 draft, 1 pending, 2 approved, 3 rejected, 4 dispatched, 5 received, 6 cancelled, 7 partially received
    reject_reason NVARCHAR(500) NULL,
    created_at    DATETIME2(0) NOT NULL CONSTRAINT DF_sr_created DEFAULT SYSDATETIME(),
    approved_at   DATETIME2(0) NULL,
    dispatched_at DATETIME2(0) NULL,
    received_at   DATETIME2(0) NULL
);
CREATE INDEX IX_sr_store_status ON dbo.stock_requisitions(store_id, status);
GO

CREATE TABLE dbo.stock_requisition_details (
    id                   BIGINT IDENTITY(1,1) CONSTRAINT PK_srd PRIMARY KEY,
    stock_requisition_id BIGINT NOT NULL CONSTRAINT FK_srd_sr REFERENCES dbo.stock_requisitions(id) ON DELETE CASCADE,
    product_id           BIGINT NOT NULL CONSTRAINT FK_srd_product REFERENCES dbo.products(id),
    requested_qty        INT NOT NULL CONSTRAINT CK_srd_req CHECK (requested_qty > 0),
    approved_qty         INT NULL CONSTRAINT CK_srd_app CHECK (approved_qty >= 0),
    received_qty         INT NULL CONSTRAINT CK_srd_rec CHECK (received_qty >= 0),
    CONSTRAINT UQ_srd UNIQUE (stock_requisition_id, product_id)
);
GO

-- Created when the Warehouse Manager approves a requisition; confirmed by Warehouse Staff (dispatch),
-- then confirmed by the Store Manager (store goods receipt, UC38-39).
CREATE TABLE dbo.goods_issues (
    id                   BIGINT IDENTITY(1,1) CONSTRAINT PK_goods_issues PRIMARY KEY,
    code                 VARCHAR(30) NOT NULL CONSTRAINT UQ_gi_code UNIQUE,
    stock_requisition_id BIGINT NOT NULL CONSTRAINT FK_gi_sr REFERENCES dbo.stock_requisitions(id),
    from_store_id        BIGINT NOT NULL CONSTRAINT FK_gi_from REFERENCES dbo.stores(id),
    to_store_id          BIGINT NOT NULL CONSTRAINT FK_gi_to REFERENCES dbo.stores(id),
    created_by           BIGINT NOT NULL CONSTRAINT FK_gi_creator REFERENCES dbo.accounts(id),
    dispatched_by        BIGINT NULL CONSTRAINT FK_gi_dispatcher REFERENCES dbo.accounts(id),
    received_by          BIGINT NULL CONSTRAINT FK_gi_receiver REFERENCES dbo.accounts(id),
    status               TINYINT NOT NULL CONSTRAINT DF_gi_status DEFAULT 0
                         CONSTRAINT CK_gi_status CHECK (status BETWEEN 0 AND 4),
                         -- 0 picking, 1 dispatched/in transit, 2 received, 3 received with discrepancy, 4 cancelled
    carrier              NVARCHAR(150) NULL,
    note                 NVARCHAR(1000) NULL,
    created_at           DATETIME2(0) NOT NULL CONSTRAINT DF_gi_created DEFAULT SYSDATETIME(),
    dispatched_at        DATETIME2(0) NULL,
    received_at          DATETIME2(0) NULL
);
GO

CREATE TABLE dbo.goods_issue_details (
    id             BIGINT IDENTITY(1,1) CONSTRAINT PK_gid PRIMARY KEY,
    goods_issue_id BIGINT NOT NULL CONSTRAINT FK_gid_gi REFERENCES dbo.goods_issues(id) ON DELETE CASCADE,
    product_id     BIGINT NOT NULL CONSTRAINT FK_gid_product REFERENCES dbo.products(id),
    batch_id       BIGINT NOT NULL CONSTRAINT FK_gid_batch REFERENCES dbo.product_batches(id), -- picked by FEFO
    quantity       INT NOT NULL CONSTRAINT CK_gid_qty CHECK (quantity > 0),
    received_quantity INT NULL CONSTRAINT CK_gid_rec CHECK (received_quantity >= 0)
);
GO

/* =====================================================================
   8. STOCK AUDIT & ADJUSTMENT  (UC 34, 43-44)
   ===================================================================== */
CREATE TABLE dbo.inventory_audits (
    id           BIGINT IDENTITY(1,1) CONSTRAINT PK_inventory_audits PRIMARY KEY,
    code         VARCHAR(30) NOT NULL CONSTRAINT UQ_ia_code UNIQUE,
    store_id     BIGINT NOT NULL CONSTRAINT FK_ia_store REFERENCES dbo.stores(id),
    requested_by BIGINT NOT NULL CONSTRAINT FK_ia_requester REFERENCES dbo.accounts(id),
    counted_by   BIGINT NULL CONSTRAINT FK_ia_counter REFERENCES dbo.accounts(id),
    reviewed_by  BIGINT NULL CONSTRAINT FK_ia_reviewer REFERENCES dbo.accounts(id),
    status       TINYINT NOT NULL CONSTRAINT DF_ia_status DEFAULT 0
                 CONSTRAINT CK_ia_status CHECK (status BETWEEN 0 AND 4),
                 -- 0 requested, 1 counting, 2 submitted for review, 3 confirmed, 4 rejected (recount)
    audit_date   DATE NULL,
    review_note  NVARCHAR(500) NULL,
    created_at   DATETIME2(0) NOT NULL CONSTRAINT DF_ia_created DEFAULT SYSDATETIME(),
    reviewed_at  DATETIME2(0) NULL
);
GO

CREATE TABLE dbo.inventory_audit_details (
    id                 BIGINT IDENTITY(1,1) CONSTRAINT PK_iad PRIMARY KEY,
    inventory_audit_id BIGINT NOT NULL CONSTRAINT FK_iad_ia REFERENCES dbo.inventory_audits(id) ON DELETE CASCADE,
    product_id         BIGINT NOT NULL CONSTRAINT FK_iad_product REFERENCES dbo.products(id),
    batch_id           BIGINT NOT NULL CONSTRAINT FK_iad_batch REFERENCES dbo.product_batches(id),
    system_quantity    INT NOT NULL,
    counted_quantity   INT NULL CONSTRAINT CK_iad_cnt CHECK (counted_quantity >= 0),
    variance           AS (counted_quantity - system_quantity) PERSISTED,
    note               NVARCHAR(500) NULL
);
GO

CREATE TABLE dbo.inventory_adjustments (
    id              BIGINT IDENTITY(1,1) CONSTRAINT PK_inventory_adjustments PRIMARY KEY,
    store_id        BIGINT NOT NULL CONSTRAINT FK_adj_store REFERENCES dbo.stores(id),
    product_id      BIGINT NOT NULL CONSTRAINT FK_adj_product REFERENCES dbo.products(id),
    batch_id        BIGINT NOT NULL CONSTRAINT FK_adj_batch REFERENCES dbo.product_batches(id),
    inventory_audit_id BIGINT NULL CONSTRAINT FK_adj_audit REFERENCES dbo.inventory_audits(id),
    created_by      BIGINT NOT NULL CONSTRAINT FK_adj_creator REFERENCES dbo.accounts(id),
    approved_by     BIGINT NULL CONSTRAINT FK_adj_approver REFERENCES dbo.accounts(id),
    type            TINYINT NOT NULL CONSTRAINT CK_adj_type CHECK (type BETWEEN 1 AND 5),
                    -- 1 count variance, 2 damage, 3 breakage, 4 expired write-off, 5 other
    status          TINYINT NOT NULL CONSTRAINT DF_adj_status DEFAULT 0
                    CONSTRAINT CK_adj_status CHECK (status BETWEEN 0 AND 3), -- 0 pending, 1 approved, 2 rejected
    quantity_before INT NOT NULL,
    quantity_after  INT NOT NULL CONSTRAINT CK_adj_after CHECK (quantity_after >= 0),
    difference      AS (quantity_after - quantity_before) PERSISTED,
    value_impact    DECIMAL(18,2) NULL,         -- difference * cost, used for the 5,000,000 VND rule (BR-08)
    reason          NVARCHAR(500) NOT NULL,
    created_at      DATETIME2(0) NOT NULL CONSTRAINT DF_adj_created DEFAULT SYSDATETIME(),
    approved_at     DATETIME2(0) NULL
);
CREATE INDEX IX_adj_status ON dbo.inventory_adjustments(status, created_at DESC);
GO

/* =====================================================================
   9. SALES  (UC 21-28)
   ===================================================================== */
CREATE TABLE dbo.shifts (
    id           BIGINT IDENTITY(1,1) CONSTRAINT PK_shifts PRIMARY KEY,
    store_id     BIGINT NOT NULL CONSTRAINT FK_shift_store REFERENCES dbo.stores(id),
    account_id   BIGINT NOT NULL CONSTRAINT FK_shift_account REFERENCES dbo.accounts(id),  -- pharmacist
    opened_at    DATETIME2(0) NOT NULL CONSTRAINT DF_shift_opened DEFAULT SYSDATETIME(),
    closed_at    DATETIME2(0) NULL,
    opening_cash DECIMAL(18,2) NOT NULL CONSTRAINT CK_shift_open CHECK (opening_cash >= 0),
    closing_cash DECIMAL(18,2) NULL,
    expected_cash DECIMAL(18,2) NULL,
    difference   AS (closing_cash - expected_cash) PERSISTED,   -- BR-07: |diff| > 50,000 needs a note
    status       TINYINT NOT NULL CONSTRAINT DF_shift_status DEFAULT 1
                 CONSTRAINT CK_shift_status CHECK (status BETWEEN 1 AND 3), -- 1 open, 2 closed, 3 reconciled
    note         NVARCHAR(1000) NULL,
    reconciled_by BIGINT NULL CONSTRAINT FK_shift_reconciler REFERENCES dbo.accounts(id),
    reconciled_at DATETIME2(0) NULL
);
-- only one open shift per pharmacist
CREATE UNIQUE INDEX UX_shift_one_open ON dbo.shifts(account_id) WHERE status = 1;
CREATE INDEX IX_shift_store_date ON dbo.shifts(store_id, opened_at DESC);
GO

CREATE TABLE dbo.sales_invoices (
    id              BIGINT IDENTITY(1,1) CONSTRAINT PK_sales_invoices PRIMARY KEY,
    code            VARCHAR(30) NOT NULL CONSTRAINT UQ_si_code UNIQUE,
    store_id        BIGINT NOT NULL CONSTRAINT FK_si_store REFERENCES dbo.stores(id),
    shift_id        BIGINT NOT NULL CONSTRAINT FK_si_shift REFERENCES dbo.shifts(id),
    account_id      BIGINT NOT NULL CONSTRAINT FK_si_account REFERENCES dbo.accounts(id),   -- salesperson
    customer_id     BIGINT NULL CONSTRAINT FK_si_customer REFERENCES dbo.customers(id),    -- optional
    prescription_code NVARCHAR(50) NULL,                       -- BR-01 for Rx items
    total_amount    DECIMAL(18,2) NOT NULL CONSTRAINT DF_si_total DEFAULT 0,
    discount        DECIMAL(18,2) NOT NULL CONSTRAINT DF_si_disc DEFAULT 0 CONSTRAINT CK_si_disc CHECK (discount >= 0),
    final_amount    DECIMAL(18,2) NOT NULL CONSTRAINT DF_si_final DEFAULT 0,
    status          TINYINT NOT NULL CONSTRAINT DF_si_status DEFAULT 0
                    CONSTRAINT CK_si_status CHECK (status BETWEEN 0 AND 4),
                    -- 0 pending payment, 1 paid, 2 cancelled, 3 partially returned, 4 fully returned
    cancel_reason   NVARCHAR(500) NULL,
    created_at      DATETIME2(0) NOT NULL CONSTRAINT DF_si_created DEFAULT SYSDATETIME(),
    paid_at         DATETIME2(0) NULL,
    CONSTRAINT CK_si_amount CHECK (discount <= total_amount)
);
CREATE INDEX IX_si_store_date ON dbo.sales_invoices(store_id, created_at DESC);
CREATE INDEX IX_si_customer   ON dbo.sales_invoices(customer_id, created_at DESC);
CREATE INDEX IX_si_shift      ON dbo.sales_invoices(shift_id);
GO

-- batch_id is filled at payment time (FEFO allocation, BR-02/05); a line may be split per batch.
CREATE TABLE dbo.sales_invoice_details (
    id                 BIGINT IDENTITY(1,1) CONSTRAINT PK_sid PRIMARY KEY,
    sales_invoice_id   BIGINT NOT NULL CONSTRAINT FK_sid_si REFERENCES dbo.sales_invoices(id) ON DELETE CASCADE,
    product_id         BIGINT NOT NULL CONSTRAINT FK_sid_product REFERENCES dbo.products(id),
    batch_id           BIGINT NULL CONSTRAINT FK_sid_batch REFERENCES dbo.product_batches(id),
    quantity           INT NOT NULL CONSTRAINT CK_sid_qty CHECK (quantity > 0),
    unit_price         DECIMAL(18,2) NOT NULL CONSTRAINT CK_sid_price CHECK (unit_price >= 0),
    unit_cost          DECIMAL(18,2) NOT NULL CONSTRAINT DF_sid_cost DEFAULT 0,   -- snapshot, for profit report
    sub_total          AS CAST(quantity * unit_price AS DECIMAL(18,2)) PERSISTED,
    dosage_instruction NVARCHAR(300) NULL
);
CREATE INDEX IX_sid_product ON dbo.sales_invoice_details(product_id);
GO

CREATE TABLE dbo.payments (
    id               BIGINT IDENTITY(1,1) CONSTRAINT PK_payments PRIMARY KEY,
    sales_invoice_id BIGINT NOT NULL CONSTRAINT FK_pay_si REFERENCES dbo.sales_invoices(id),
    method           TINYINT NOT NULL CONSTRAINT CK_pay_method CHECK (method IN (1,2,3)), -- 1 cash, 2 bank transfer, 3 VNPay QR
    amount           DECIMAL(18,2) NOT NULL CONSTRAINT CK_pay_amount CHECK (amount > 0),
    status           TINYINT NOT NULL CONSTRAINT DF_pay_status DEFAULT 0
                     CONSTRAINT CK_pay_status CHECK (status BETWEEN 0 AND 4),
                     -- 0 pending, 1 success, 2 failed, 3 refunded, 4 expired
    transaction_ref  VARCHAR(100) NULL,        -- vnp_TxnRef / bank ref
    gateway_response NVARCHAR(MAX) NULL,       -- raw IPN/callback payload
    paid_at          DATETIME2(0) NULL,
    created_at       DATETIME2(0) NOT NULL CONSTRAINT DF_pay_created DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_pay_txn ON dbo.payments(transaction_ref) WHERE transaction_ref IS NOT NULL;
CREATE INDEX IX_pay_invoice    ON dbo.payments(sales_invoice_id);
GO

-- UC25 Cancel/Return (BR-06: within 24h with receipt)
CREATE TABLE dbo.sales_returns (
    id               BIGINT IDENTITY(1,1) CONSTRAINT PK_sales_returns PRIMARY KEY,
    code             VARCHAR(30) NOT NULL CONSTRAINT UQ_sret_code UNIQUE,
    sales_invoice_id BIGINT NOT NULL CONSTRAINT FK_sret_si REFERENCES dbo.sales_invoices(id),
    shift_id         BIGINT NOT NULL CONSTRAINT FK_sret_shift REFERENCES dbo.shifts(id),
    processed_by     BIGINT NOT NULL CONSTRAINT FK_sret_user REFERENCES dbo.accounts(id),
    return_type      TINYINT NOT NULL CONSTRAINT CK_sret_type CHECK (return_type IN (1,2)), -- 1 full, 2 partial
    refund_method    TINYINT NULL CONSTRAINT CK_sret_method CHECK (refund_method IN (1,2,3)),
    refund_amount    DECIMAL(18,2) NOT NULL CONSTRAINT CK_sret_amt CHECK (refund_amount >= 0),
    reason           NVARCHAR(500) NOT NULL,
    created_at       DATETIME2(0) NOT NULL CONSTRAINT DF_sret_created DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.sales_return_details (
    id                      BIGINT IDENTITY(1,1) CONSTRAINT PK_srtd PRIMARY KEY,
    sales_return_id         BIGINT NOT NULL CONSTRAINT FK_srtd_sret REFERENCES dbo.sales_returns(id) ON DELETE CASCADE,
    sales_invoice_detail_id BIGINT NOT NULL CONSTRAINT FK_srtd_sid REFERENCES dbo.sales_invoice_details(id),
    product_id              BIGINT NOT NULL CONSTRAINT FK_srtd_product REFERENCES dbo.products(id),
    batch_id                BIGINT NULL CONSTRAINT FK_srtd_batch REFERENCES dbo.product_batches(id),
    quantity                INT NOT NULL CONSTRAINT CK_srtd_qty CHECK (quantity > 0),
    unit_price              DECIMAL(18,2) NOT NULL,
    sub_total               AS CAST(quantity * unit_price AS DECIMAL(18,2)) PERSISTED
);
GO

-- UC27/28 Store Manager daily reconciliation (one row per store per day)
CREATE TABLE dbo.daily_sales_reconciliations (
    id                BIGINT IDENTITY(1,1) CONSTRAINT PK_dsr PRIMARY KEY,
    store_id          BIGINT NOT NULL CONSTRAINT FK_dsr_store REFERENCES dbo.stores(id),
    business_date     DATE   NOT NULL,
    system_cash       DECIMAL(18,2) NOT NULL DEFAULT 0,
    system_bank       DECIMAL(18,2) NOT NULL DEFAULT 0,
    system_vnpay      DECIMAL(18,2) NOT NULL DEFAULT 0,
    system_total      AS (system_cash + system_bank + system_vnpay) PERSISTED,
    actual_cash       DECIMAL(18,2) NULL,
    difference        AS (actual_cash - system_cash) PERSISTED,
    status            TINYINT NOT NULL CONSTRAINT DF_dsr_status DEFAULT 0
                      CONSTRAINT CK_dsr_status CHECK (status IN (0,1,2)), -- 0 open, 1 reconciled, 2 discrepancy noted
    note              NVARCHAR(1000) NULL,
    reconciled_by     BIGINT NULL CONSTRAINT FK_dsr_user REFERENCES dbo.accounts(id),
    reconciled_at     DATETIME2(0) NULL,
    CONSTRAINT UQ_dsr UNIQUE (store_id, business_date)
);
GO

/* =====================================================================
   10. SYSTEM SUPPORT (alerts, email, configurable business rules)
   ===================================================================== */
-- Business thresholds live in data, not in code (BR-03, BR-06, BR-07, BR-08 + cron).
CREATE TABLE dbo.system_settings (
    setting_key   VARCHAR(60)   NOT NULL CONSTRAINT PK_system_settings PRIMARY KEY,
    setting_value NVARCHAR(500) NOT NULL,
    description   NVARCHAR(300) NULL,
    updated_by    BIGINT NULL CONSTRAINT FK_ss_user REFERENCES dbo.accounts(id),
    updated_at    DATETIME2(0) NOT NULL CONSTRAINT DF_ss_updated DEFAULT SYSDATETIME()
);
GO

-- Output of the 08:00 low-stock / near-expiry job and other in-app messages
CREATE TABLE dbo.notifications (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_notifications PRIMARY KEY,
    account_id  BIGINT NULL CONSTRAINT FK_notif_account REFERENCES dbo.accounts(id),   -- target user
    store_id    BIGINT NULL CONSTRAINT FK_notif_store REFERENCES dbo.stores(id),       -- or all managers of a store
    type        VARCHAR(30) NOT NULL,        -- LOW_STOCK, NEAR_EXPIRY, REQUISITION_APPROVED, PO_APPROVED ...
    title       NVARCHAR(200) NOT NULL,
    message     NVARCHAR(1000) NULL,
    ref_type    VARCHAR(40) NULL,
    ref_id      BIGINT NULL,
    is_read     BIT NOT NULL CONSTRAINT DF_notif_read DEFAULT 0,
    created_at  DATETIME2(0) NOT NULL CONSTRAINT DF_notif_created DEFAULT SYSDATETIME()
);
CREATE INDEX IX_notif_account ON dbo.notifications(account_id, is_read, created_at DESC);
GO

-- Outbound mail (RFQ, password reset, receipts) via SMTP Gmail
CREATE TABLE dbo.email_logs (
    id          BIGINT IDENTITY(1,1) CONSTRAINT PK_email_logs PRIMARY KEY,
    to_email    VARCHAR(150)  NOT NULL,
    subject     NVARCHAR(300) NOT NULL,
    body        NVARCHAR(MAX) NULL,
    ref_type    VARCHAR(40)   NULL,
    ref_id      BIGINT        NULL,
    status      TINYINT       NOT NULL CONSTRAINT DF_el_status DEFAULT 0
                CONSTRAINT CK_el_status CHECK (status IN (0,1,2)),   -- 0 queued, 1 sent, 2 failed
    error_message NVARCHAR(1000) NULL,
    created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_el_created DEFAULT SYSDATETIME(),
    sent_at     DATETIME2(0)  NULL
);
GO

/* =====================================================================
   11. VIEWS / FUNCTION  (reports, alerts, FEFO)
   ===================================================================== */
-- UC40, UC33, UC71: stock per product per store
CREATE VIEW dbo.vw_stock_by_product AS
SELECT i.store_id, i.product_id, p.name AS product_name, p.min_quantity,
       SUM(i.quantity) AS total_quantity,
       SUM(i.quantity * p.cost_price) AS stock_value
FROM dbo.inventories i JOIN dbo.products p ON p.id = i.product_id
GROUP BY i.store_id, i.product_id, p.name, p.min_quantity;
GO

-- UC45 Low stock alert
CREATE VIEW dbo.vw_low_stock AS
SELECT s.store_id, s.product_id, s.product_name, s.total_quantity, s.min_quantity
FROM dbo.vw_stock_by_product s
WHERE s.total_quantity < s.min_quantity;
GO

-- UC46 Expiry alert (expired or expiring within 6 months, stock still on hand)
CREATE VIEW dbo.vw_expiring_batches AS
SELECT i.store_id, i.product_id, p.name AS product_name, b.id AS batch_id, b.batch_number,
       b.expiry_date, i.quantity,
       DATEDIFF(DAY, CAST(SYSDATETIME() AS DATE), b.expiry_date) AS days_left,
       CASE WHEN b.expiry_date <= CAST(SYSDATETIME() AS DATE) THEN 1 ELSE 0 END AS is_expired
FROM dbo.inventories i
JOIN dbo.product_batches b ON b.id = i.batch_id
JOIN dbo.products p        ON p.id = i.product_id
WHERE i.quantity > 0 AND b.expiry_date <= DATEADD(MONTH, 6, CAST(SYSDATETIME() AS DATE));
GO

-- UC27 Daily sales per store (paid invoices only)
CREATE VIEW dbo.vw_daily_sales AS
SELECT si.store_id, CAST(si.paid_at AS DATE) AS business_date,
       COUNT(*) AS invoice_count, SUM(si.final_amount) AS revenue
FROM dbo.sales_invoices si
WHERE si.status IN (1,3)
GROUP BY si.store_id, CAST(si.paid_at AS DATE);
GO

-- UC70 Profit report (revenue - cost snapshot), grouped by day
CREATE VIEW dbo.vw_profit_daily AS
SELECT si.store_id, CAST(si.paid_at AS DATE) AS business_date,
       SUM(d.sub_total)                  AS gross_revenue,
       SUM(d.quantity * d.unit_cost)     AS cost_of_goods,
       SUM(d.sub_total) - SUM(d.quantity * d.unit_cost) AS gross_profit
FROM dbo.sales_invoices si
JOIN dbo.sales_invoice_details d ON d.sales_invoice_id = si.id
WHERE si.status IN (1,3)
GROUP BY si.store_id, CAST(si.paid_at AS DATE);
GO

-- FEFO helper (BR-02/04): sellable batches, caller does ORDER BY expiry_date, batch_id
CREATE FUNCTION dbo.fn_fefo_batches (@store_id BIGINT, @product_id BIGINT)
RETURNS TABLE AS RETURN
SELECT i.batch_id, b.batch_number, b.expiry_date, i.quantity
FROM dbo.inventories i JOIN dbo.product_batches b ON b.id = i.batch_id
WHERE i.store_id = @store_id AND i.product_id = @product_id
  AND i.quantity > 0 AND b.expiry_date > CAST(SYSDATETIME() AS DATE);
GO

/* =====================================================================
   12. SEED DATA
   ===================================================================== */
INSERT dbo.roles (code, name) VALUES
 ('ADMIN',             N'Administrator'),
 ('STORE_MANAGER',     N'Store Manager'),
 ('PHARMACIST',        N'Pharmacist'),
 ('PURCHASING_STAFF',  N'Purchasing Staff'),
 ('GENERAL_MANAGER',   N'General Manager'),
 ('WAREHOUSE_MANAGER', N'Warehouse Manager'),
 ('WAREHOUSE_STAFF',   N'Warehouse Staff');
GO

INSERT dbo.permissions (code, module) VALUES
 ('USER_VIEW','USER'),('USER_CREATE','USER'),('USER_UPDATE','USER'),('USER_LOCK','USER'),('USER_ASSIGN_ROLE','USER'),('AUDIT_VIEW','USER'),
 ('PRODUCT_VIEW','PRODUCT'),('PRODUCT_CREATE','PRODUCT'),('PRODUCT_UPDATE','PRODUCT'),('PRICE_MANAGE','PRODUCT'),('PRICE_HISTORY_VIEW','PRODUCT'),
 ('CATEGORY_VIEW','CATEGORY'),('CATEGORY_CREATE','CATEGORY'),('CATEGORY_UPDATE','CATEGORY'),('CATEGORY_DELETE','CATEGORY'),
 ('SHIFT_OPEN','SHIFT'),('SHIFT_CLOSE','SHIFT'),
 ('INVOICE_CREATE','SALES'),('PAYMENT_PROCESS','SALES'),('INVOICE_CANCEL','SALES'),('INVOICE_VIEW','SALES'),('SALES_DAILY_VIEW','SALES'),('SALES_RECONCILE','SALES'),
 ('CUSTOMER_VIEW','CUSTOMER'),('CUSTOMER_CREATE','CUSTOMER'),('CUSTOMER_UPDATE','CUSTOMER'),('CUSTOMER_DELETE','CUSTOMER'),
 ('STORE_INVENTORY_VIEW','STORE_INVENTORY'),('STORE_AUDIT_REVIEW','STORE_INVENTORY'),('REQUISITION_CREATE','STORE_INVENTORY'),('REQUISITION_VIEW','STORE_INVENTORY'),
 ('REQUISITION_UPDATE','STORE_INVENTORY'),('GOODS_RECEIPT_VIEW','STORE_INVENTORY'),('GOODS_RECEIPT_CONFIRM','STORE_INVENTORY'),
 ('WH_INVENTORY_VIEW','WAREHOUSE'),('PURCHASE_HISTORY_VIEW','WAREHOUSE'),('BIN_ASSIGN','WAREHOUSE'),('ADJUSTMENT_CREATE','WAREHOUSE'),('ADJUSTMENT_APPROVE','WAREHOUSE'),
 ('ALERT_LOW_STOCK_VIEW','WAREHOUSE'),('ALERT_EXPIRY_VIEW','WAREHOUSE'),('PR_MANAGE','WAREHOUSE'),
 ('REPLENISH_MANAGE','REPLENISHMENT'),('REPLENISH_APPROVE','REPLENISHMENT'),('REPLENISH_REJECT','REPLENISHMENT'),('GOODS_DISPATCH_CONFIRM','REPLENISHMENT'),
 ('PURCHASE_RECEIPT_MANAGE','RECEIPT'),('PURCHASE_RECEIPT_CONFIRM','RECEIPT'),
 ('PR_VIEW','PURCHASING'),('SUPPLIER_VIEW','SUPPLIER'),('SUPPLIER_CREATE','SUPPLIER'),('SUPPLIER_UPDATE','SUPPLIER'),('SUPPLIER_DELETE','SUPPLIER'),
 ('RFQ_SEND','RFQ'),('RFQ_VIEW','RFQ'),('QUOTATION_MANAGE','RFQ'),('QUOTATION_COMPARE','RFQ'),
 ('PROPOSAL_CREATE','PROPOSAL'),('PROPOSAL_VIEW','PROPOSAL'),('PO_VIEW','PROPOSAL'),('PO_APPROVE','PROPOSAL'),('PO_REJECT','PROPOSAL'),
 ('REPORT_PROFIT','REPORT'),('REPORT_INVENTORY','REPORT'),('REPORT_EXPORT','REPORT');
GO

-- role -> permission mapping, taken from the "Actors" column of the SRS use-case table
DECLARE @map TABLE (role_code VARCHAR(30), perm_code VARCHAR(50));
INSERT @map VALUES
 -- ADMIN
 ('ADMIN','USER_VIEW'),('ADMIN','USER_CREATE'),('ADMIN','USER_UPDATE'),('ADMIN','USER_LOCK'),('ADMIN','USER_ASSIGN_ROLE'),('ADMIN','AUDIT_VIEW'),
 ('ADMIN','PRODUCT_VIEW'),('ADMIN','PRODUCT_CREATE'),('ADMIN','PRODUCT_UPDATE'),('ADMIN','PRICE_MANAGE'),('ADMIN','PRICE_HISTORY_VIEW'),
 ('ADMIN','CATEGORY_VIEW'),('ADMIN','CATEGORY_CREATE'),('ADMIN','CATEGORY_UPDATE'),('ADMIN','CATEGORY_DELETE'),
 -- PHARMACIST
 ('PHARMACIST','PRODUCT_VIEW'),('PHARMACIST','CATEGORY_VIEW'),('PHARMACIST','SHIFT_OPEN'),('PHARMACIST','SHIFT_CLOSE'),
 ('PHARMACIST','INVOICE_CREATE'),('PHARMACIST','PAYMENT_PROCESS'),('PHARMACIST','INVOICE_CANCEL'),('PHARMACIST','INVOICE_VIEW'),
 ('PHARMACIST','CUSTOMER_VIEW'),('PHARMACIST','CUSTOMER_CREATE'),('PHARMACIST','CUSTOMER_UPDATE'),('PHARMACIST','CUSTOMER_DELETE'),
 ('PHARMACIST','STORE_INVENTORY_VIEW'),
 -- STORE MANAGER
 ('STORE_MANAGER','PRODUCT_VIEW'),('STORE_MANAGER','CATEGORY_VIEW'),('STORE_MANAGER','SALES_DAILY_VIEW'),('STORE_MANAGER','SALES_RECONCILE'),
 ('STORE_MANAGER','STORE_INVENTORY_VIEW'),('STORE_MANAGER','STORE_AUDIT_REVIEW'),('STORE_MANAGER','REQUISITION_CREATE'),
 ('STORE_MANAGER','REQUISITION_VIEW'),('STORE_MANAGER','REQUISITION_UPDATE'),('STORE_MANAGER','GOODS_RECEIPT_VIEW'),
 ('STORE_MANAGER','GOODS_RECEIPT_CONFIRM'),('STORE_MANAGER','REPORT_PROFIT'),
 -- WAREHOUSE MANAGER
 ('WAREHOUSE_MANAGER','PRODUCT_VIEW'),('WAREHOUSE_MANAGER','CATEGORY_VIEW'),('WAREHOUSE_MANAGER','WH_INVENTORY_VIEW'),
 ('WAREHOUSE_MANAGER','PURCHASE_HISTORY_VIEW'),('WAREHOUSE_MANAGER','ADJUSTMENT_APPROVE'),('WAREHOUSE_MANAGER','ALERT_LOW_STOCK_VIEW'),
 ('WAREHOUSE_MANAGER','ALERT_EXPIRY_VIEW'),('WAREHOUSE_MANAGER','PR_MANAGE'),('WAREHOUSE_MANAGER','REPLENISH_MANAGE'),
 ('WAREHOUSE_MANAGER','REPLENISH_APPROVE'),('WAREHOUSE_MANAGER','REPLENISH_REJECT'),
 -- WAREHOUSE STAFF
 ('WAREHOUSE_STAFF','PRODUCT_VIEW'),('WAREHOUSE_STAFF','CATEGORY_VIEW'),('WAREHOUSE_STAFF','WH_INVENTORY_VIEW'),
 ('WAREHOUSE_STAFF','PURCHASE_HISTORY_VIEW'),('WAREHOUSE_STAFF','BIN_ASSIGN'),('WAREHOUSE_STAFF','ADJUSTMENT_CREATE'),
 ('WAREHOUSE_STAFF','GOODS_DISPATCH_CONFIRM'),('WAREHOUSE_STAFF','PURCHASE_RECEIPT_MANAGE'),('WAREHOUSE_STAFF','PURCHASE_RECEIPT_CONFIRM'),
 -- PURCHASING STAFF
 ('PURCHASING_STAFF','PRODUCT_VIEW'),('PURCHASING_STAFF','CATEGORY_VIEW'),('PURCHASING_STAFF','PR_VIEW'),
 ('PURCHASING_STAFF','SUPPLIER_VIEW'),('PURCHASING_STAFF','SUPPLIER_CREATE'),('PURCHASING_STAFF','SUPPLIER_UPDATE'),('PURCHASING_STAFF','SUPPLIER_DELETE'),
 ('PURCHASING_STAFF','RFQ_SEND'),('PURCHASING_STAFF','RFQ_VIEW'),('PURCHASING_STAFF','QUOTATION_MANAGE'),('PURCHASING_STAFF','QUOTATION_COMPARE'),
 ('PURCHASING_STAFF','PROPOSAL_CREATE'),('PURCHASING_STAFF','PROPOSAL_VIEW'),
 -- GENERAL MANAGER
 ('GENERAL_MANAGER','PROPOSAL_VIEW'),('GENERAL_MANAGER','PO_VIEW'),('GENERAL_MANAGER','PO_APPROVE'),('GENERAL_MANAGER','PO_REJECT'),
 ('GENERAL_MANAGER','REPORT_PROFIT'),('GENERAL_MANAGER','REPORT_INVENTORY'),('GENERAL_MANAGER','REPORT_EXPORT');

INSERT dbo.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM @map m
JOIN dbo.roles r       ON r.code = m.role_code
JOIN dbo.permissions p ON p.code = m.perm_code;
GO

INSERT dbo.stores (code, name, type, address) VALUES
 ('HQ',   N'Head Office',        0, N'Hanoi'),
 ('WH01', N'Central Warehouse',  2, N'Hanoi'),
 ('ST01', N'Pharmacy Store 01',  1, N'Hanoi');
GO

INSERT dbo.system_settings (setting_key, setting_value, description) VALUES
 ('LOW_STOCK_DEFAULT_QTY',     N'20',      N'Default min_quantity for new products'),
 ('NEAR_EXPIRY_MONTHS',        N'6',       N'Warn when expiry is within N months (UC46)'),
 ('MIN_SHELF_LIFE_ON_RECEIPT', N'6',       N'BR-03: min months of shelf life when importing'),
 ('RETURN_WINDOW_HOURS',       N'24',      N'BR-06: return window'),
 ('SHIFT_DIFF_NOTE_THRESHOLD', N'50000',   N'BR-07: cash difference (VND) that requires a note'),
 ('ADJUSTMENT_APPROVAL_VND',   N'5000000', N'BR-08: adjustment value that requires manager approval'),
 ('ALERT_JOB_CRON',            N'0 0 8 * * *', N'Spring @Scheduled cron for the daily alert job'),
 ('PASSWORD_RESET_MINUTES',    N'15',      N'Lifetime of a password reset token');
GO

-- Seed admin: username admin / password Admin@123  (BCrypt, CHANGE IT after first login)
INSERT dbo.accounts (store_id, role_id, username, email, password)
SELECT s.id, r.id, 'admin', 'admin@pms.local', '$2a$10$S0tPx9sg3egB0o66KBY4meltGnqV4PcS2p2PiqJmSpV34KltF6NhS'
FROM dbo.stores s, dbo.roles r WHERE s.code = 'HQ' AND r.code = 'ADMIN';

INSERT dbo.account_informations (account_id, full_name)
SELECT id, N'System Administrator' FROM dbo.accounts WHERE username = 'admin';
GO

-- ---------------------------------------------------------------------
-- Warehouse Management (Kho Tổng: Vị trí ô/kệ, Lô hàng, Tồn kho, Nhập kho, Điều chỉnh)
-- ---------------------------------------------------------------------

-- Master data prerequisites (Categories, Suppliers, Products)
INSERT dbo.categories (name, description, status, created_by)
SELECT c.name, c.description, 1, a.id
FROM (VALUES
 (N'Kháng sinh & Kháng khuẩn', N'Nhóm thuốc kháng sinh diệt khuẩn'),
 (N'Giảm đau, Hạ sốt, Kháng viêm', N'Thuốc hạ sốt, giảm đau thông thường'),
 (N'Tim mạch & Huyết áp', N'Thuốc tim mạch, huyết áp'),
 (N'Tiêu hóa & Gan mật', N'Thuốc dạ dày, tiêu hóa'),
 (N'Vitamin & Thực phẩm bổ sung', N'Vitamin và thực phẩm bảo vệ sức khỏe')
) c(name, description)
CROSS JOIN (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin') a
WHERE NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = c.name);
GO

INSERT dbo.suppliers (code, name, contact_person, phone, email, address, tax_code, status, note)
SELECT s.code, s.name, s.contact_person, s.phone, s.email, s.address, s.tax_code, 1, s.note
FROM (VALUES
 ('SUP001', N'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', N'Nguyễn Văn An', '02923891433', 'contact@dhgpharma.com.vn', N'288 Bis Nguyễn Văn Cừ, Cần Thơ', '1800156801', N'Đối tác chiến lược cung cấp thuốc hạ sốt, kháng sinh'),
 ('SUP002', N'Công ty Cổ phần Traphaco', N'Trần Thị Mai', '02436814980', 'info@traphaco.com.vn', N'Ngõ 15, Ngọc Hồi, Hoàng Liệt, Hà Nội', '0100108656', N'Cung cấp dòng đông dược và thuốc tim mạch'),
 ('SUP003', N'Công ty TNHH Sanofi-Aventis Việt Nam', N'Lê Minh Tuấn', '02838298526', 'vietnam.contact@sanofi.com', N'Số 10 Hàm Nghi, Q. 1, TP. HCM', '0300819934', N'Tập đoàn dược phẩm quốc tế'),
 ('SUP004', N'Công ty Cổ phần Dược phẩm Imexpharm', N'Phạm Thu Trang', '02773851941', 'imexpharm@imexpharm.com', N'Số 4, Đường 30/4, Cao Lãnh, Đồng Tháp', '1400384433', N'Nhà sản xuất kháng sinh EU-GMP')
) s(code, name, contact_person, phone, email, address, tax_code, note)
WHERE NOT EXISTS (SELECT 1 FROM dbo.suppliers WHERE code = s.code);
GO

INSERT dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status)
SELECT c.id, p.barcode, p.name, p.unit, p.active_ingredient, p.manufacturer, p.is_prescription, p.cost_price, p.selling_price, p.min_quantity, p.description, 1
FROM (VALUES
 ('893456789001', N'Paracetamol 500mg (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Paracetamol', N'DHG Pharma', 0, 45000, 65000, 50, N'Thuốc giảm đau hạ sốt', N'Giảm đau, Hạ sốt, Kháng viêm'),
 ('893456789002', N'Amoxicillin 500mg (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Amoxicillin trihydrate', N'Imexpharm', 1, 75000, 110000, 30, N'Kháng sinh nhóm penicillin', N'Kháng sinh & Kháng khuẩn'),
 ('893456789003', N'Cefuroxime 500mg (Hộp 2 vỉ x 5 viên)', N'Hộp', N'Cefuroxime axetil', N'Sanofi', 1, 125000, 175000, 20, N'Kháng sinh Cephalosporin thế hệ 2', N'Kháng sinh & Kháng khuẩn'),
 ('893456789004', N'Panadol Extra Đỏ Giảm Đau Hạ Sốt', N'Hộp', N'Paracetamol 500mg, Caffeine 65mg', N'GSK Consumer Healthcare', 0, 140000, 195000, 40, N'Giảm đau nhanh', N'Giảm đau, Hạ sốt, Kháng viêm'),
 ('893456789005', N'Vitamin C 1000mg Effervescent (Tuýp 20 viên sủi)', N'Tuýp', N'Acid Ascorbic', N'Bayer Pharma', 0, 38000, 55000, 25, N'Tăng sức đề kháng', N'Vitamin & Thực phẩm bổ sung'),
 ('893456789006', N'Omeprazole 20mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Omeprazole', N'Dược Hà Tây', 1, 48000, 70000, 30, N'Điều trị viêm loét dạ dày', N'Tiêu hóa & Gan mật'),
 ('893456789007', N'Amlodipine 5mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Amlodipine besylate', N'Traphaco', 1, 42000, 65000, 20, N'Điều trị tăng huyết áp', N'Tim mạch & Huyết áp'),
 ('893456789008', N'Berberin Clorid 100mg (Lọ 100 viên)', N'Lọ', N'Berberin clorid', N'Dược TW 3', 0, 22000, 35000, 50, N'Điều trị tiêu chảy đường ruột', N'Tiêu hóa & Gan mật')
) p(barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, cat_name)
JOIN dbo.categories c ON c.name = p.cat_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = p.barcode);
GO

-- 1. Vị trí Ô/Kệ Kho Tổng (warehouse_locations)
INSERT dbo.warehouse_locations (store_id, code, aisle, shelf, bin, status)
SELECT s.id, l.code, l.aisle, l.shelf, l.bin, 1
FROM (VALUES
 ('A-01-01', 'A', '1', '1'),
 ('A-01-02', 'A', '1', '2'),
 ('A-02-01', 'A', '2', '1'),
 ('A-02-02', 'A', '2', '2'),
 ('B-01-01', 'B', '1', '1'),
 ('B-01-02', 'B', '1', '2'),
 ('B-02-01', 'B', '2', '1'),
 ('C-01-01', 'C', '1', '1'),
 ('D-01-01', 'D', '1', '1')
) l(code, aisle, shelf, bin)
CROSS JOIN (SELECT TOP 1 id FROM dbo.stores WHERE type = 2) s
WHERE NOT EXISTS (SELECT 1 FROM dbo.warehouse_locations WHERE store_id = s.id AND code = l.code);
GO

-- 2. Lô thuốc (product_batches) - Còn hạn (>180d), Sắp hết hạn (<90d), Đã hết hạn
INSERT dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id)
SELECT p.id, b.batch_number, b.mfg_date, b.exp_date, sup.id
FROM (VALUES
 ('893456789001', 'BAT-2026-001', DATEADD(MONTH, -6, GETDATE()), DATEADD(MONTH, 18, GETDATE()), 'SUP001'),
 ('893456789002', 'BAT-2026-002', DATEADD(MONTH, -4, GETDATE()), DATEADD(MONTH, 14, GETDATE()), 'SUP004'),
 ('893456789003', 'BAT-2026-003', DATEADD(MONTH, -3, GETDATE()), DATEADD(MONTH, 20, GETDATE()), 'SUP003'),
 ('893456789004', 'BAT-2026-004', DATEADD(MONTH, -2, GETDATE()), DATEADD(MONTH, 24, GETDATE()), 'SUP001'),
 ('893456789006', 'BAT-2026-005', DATEADD(MONTH, -5, GETDATE()), DATEADD(MONTH, 12, GETDATE()), 'SUP002'),
 ('893456789005', 'BAT-2026-006', DATEADD(MONTH, -18, GETDATE()), DATEADD(DAY, 45, GETDATE()), 'SUP003'),
 ('893456789007', 'BAT-2026-007', DATEADD(MONTH, -20, GETDATE()), DATEADD(DAY, 60, GETDATE()), 'SUP002'),
 ('893456789001', 'BAT-2026-008', DATEADD(MONTH, -22, GETDATE()), DATEADD(DAY, 75, GETDATE()), 'SUP001'),
 ('893456789008', 'BAT-2025-099', DATEADD(MONTH, -26, GETDATE()), DATEADD(DAY, -45, GETDATE()), 'SUP002')
) b(barcode, batch_number, mfg_date, exp_date, sup_code)
JOIN dbo.products p ON p.barcode = b.barcode
JOIN dbo.suppliers sup ON sup.code = b.sup_code
WHERE NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = p.id AND batch_number = b.batch_number);
GO

-- 3. Tồn kho kho tổng (inventories)
INSERT dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version)
SELECT s.id, p.id, b.id, loc.id, i.quantity, 0
FROM (VALUES
 ('893456789001', 'BAT-2026-001', 'A-01-01', 350),
 ('893456789001', 'BAT-2026-008', 'A-01-02', 85),
 ('893456789002', 'BAT-2026-002', 'A-02-01', 180),
 ('893456789003', 'BAT-2026-003', 'B-01-01', 15),
 ('893456789004', 'BAT-2026-004', NULL,      520),
 ('893456789005', 'BAT-2026-006', NULL,      140),
 ('893456789006', 'BAT-2026-005', 'B-02-01', 220),
 ('893456789007', 'BAT-2026-007', 'C-01-01', 90),
 ('893456789008', 'BAT-2025-099', 'D-01-01', 45)
) i(barcode, batch_number, loc_code, quantity)
CROSS JOIN (SELECT TOP 1 id FROM dbo.stores WHERE type = 2) s
JOIN dbo.products p ON p.barcode = i.barcode
JOIN dbo.product_batches b ON b.product_id = p.id AND b.batch_number = i.batch_number
LEFT JOIN dbo.warehouse_locations loc ON loc.store_id = s.id AND loc.code = i.loc_code
WHERE NOT EXISTS (SELECT 1 FROM dbo.inventories WHERE store_id = s.id AND batch_id = b.id);
GO

-- 4. Phiếu đề xuất mua hàng (Purchase Proposals) & Phiếu nhập kho (Purchase Receipts)
IF NOT EXISTS (SELECT 1 FROM dbo.purchase_requests WHERE code = 'PR-2026-001')
    INSERT INTO dbo.purchase_requests (code, store_id, created_by, approved_by, status, reason)
    SELECT 'PR-2026-001', s.id, a.id, a.id, 4, N'Đề nghị mua thuốc bổ sung tồn kho định kỳ Quý IV'
    FROM dbo.stores s, dbo.accounts a WHERE s.type = 2 AND a.username = 'admin';

IF NOT EXISTS (SELECT 1 FROM dbo.rfqs WHERE code = 'RFQ-2026-001')
    INSERT INTO dbo.rfqs (code, purchase_request_id, supplier_id, created_by, status, sent_at)
    SELECT 'RFQ-2026-001', pr.id, sup.id, a.id, 3, DATEADD(DAY, -15, GETDATE())
    FROM dbo.purchase_requests pr, dbo.suppliers sup, dbo.accounts a
    WHERE pr.code = 'PR-2026-001' AND sup.code = 'SUP001' AND a.username = 'admin';

IF NOT EXISTS (SELECT 1 FROM dbo.supplier_quotations WHERE code = 'SQ-2026-001')
    INSERT INTO dbo.supplier_quotations (code, rfq_id, supplier_id, account_id, quotation_date, valid_until, total_amount, status)
    SELECT 'SQ-2026-001', r.id, sup.id, a.id, CAST(DATEADD(DAY, -14, GETDATE()) AS DATE), CAST(DATEADD(MONTH, 2, GETDATE()) AS DATE), 15750000, 2
    FROM dbo.rfqs r, dbo.suppliers sup, dbo.accounts a
    WHERE r.code = 'RFQ-2026-001' AND sup.code = 'SUP001' AND a.username = 'admin';

IF NOT EXISTS (SELECT 1 FROM dbo.purchase_proposals WHERE code = 'PO-2026-001')
    INSERT INTO dbo.purchase_proposals (code, purchase_request_id, supplier_quotation_id, created_by, approved_by, status, total_amount, approved_at)
    SELECT 'PO-2026-001', pr.id, sq.id, a.id, a.id, 5, 15750000, DATEADD(DAY, -12, GETDATE())
    FROM dbo.purchase_requests pr, dbo.supplier_quotations sq, dbo.accounts a
    WHERE pr.code = 'PR-2026-001' AND sq.code = 'SQ-2026-001' AND a.username = 'admin';

IF NOT EXISTS (SELECT 1 FROM dbo.purchase_proposals WHERE code = 'PO-2026-002')
    INSERT INTO dbo.purchase_proposals (code, purchase_request_id, supplier_quotation_id, created_by, approved_by, status, total_amount, approved_at)
    SELECT 'PO-2026-002', pr.id, sq.id, a.id, a.id, 5, 22500000, DATEADD(DAY, -8, GETDATE())
    FROM dbo.purchase_requests pr, dbo.supplier_quotations sq, dbo.accounts a
    WHERE pr.code = 'PR-2026-001' AND sq.code = 'SQ-2026-001' AND a.username = 'admin';

-- Phiếu nhập kho (purchase_receipts)
INSERT dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by, delivery_type, status, total_amount, note, created_at, confirmed_at)
SELECT r.code, pp.id, sup.id, s.id, a.id, a.id, r.delivery_type, r.status, r.total_amount, r.note, r.created_at, r.confirmed_at
FROM (VALUES
 ('REC-2026-001', 'PO-2026-001', 'SUP001', 1, 1, 15750000, N'Nhập hàng Paracetamol theo đơn PO-2026-001', DATEADD(DAY, -10, SYSDATETIME()), DATEADD(DAY, -10, SYSDATETIME())),
 ('REC-2026-002', 'PO-2026-002', 'SUP004', 1, 1, 22500000, N'Nhập kháng sinh Amoxicillin và Omeprazole theo đơn PO-2026-002', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME()))
) r(code, po_code, sup_code, delivery_type, status, total_amount, note, created_at, confirmed_at)
JOIN dbo.purchase_proposals pp ON pp.code = r.po_code
JOIN dbo.suppliers sup ON sup.code = r.sup_code
CROSS JOIN (SELECT TOP 1 id FROM dbo.stores WHERE type = 2) s
CROSS JOIN (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin') a
WHERE NOT EXISTS (SELECT 1 FROM dbo.purchase_receipts WHERE code = r.code);
GO

-- Chi tiết phiếu nhập (purchase_receipt_details)
INSERT dbo.purchase_receipt_details (purchase_receipt_id, product_id, order_quantity, quantity, unit_cost, batch_number, manufacture_date, expiry_date, location_id, batch_id)
SELECT pr.id, p.id, d.order_qty, d.qty, d.unit_cost, b.batch_number, b.manufacture_date, b.expiry_date, loc.id, b.id
FROM (VALUES
 ('REC-2026-001', '893456789001', 'BAT-2026-001', 'A-01-01', 350, 350, 45000),
 ('REC-2026-002', '893456789002', 'BAT-2026-002', 'A-02-01', 180, 180, 75000),
 ('REC-2026-002', '893456789006', 'BAT-2026-005', 'B-02-01', 220, 220, 40909.09)
) d(rec_code, barcode, batch_number, loc_code, order_qty, qty, unit_cost)
JOIN dbo.purchase_receipts pr ON pr.code = d.rec_code
JOIN dbo.products p ON p.barcode = d.barcode
JOIN dbo.product_batches b ON b.product_id = p.id AND b.batch_number = d.batch_number
CROSS JOIN (SELECT TOP 1 id FROM dbo.stores WHERE type = 2) s
LEFT JOIN dbo.warehouse_locations loc ON loc.store_id = s.id AND loc.code = d.loc_code
WHERE NOT EXISTS (SELECT 1 FROM dbo.purchase_receipt_details WHERE purchase_receipt_id = pr.id AND product_id = p.id);
GO

-- 5. Phiếu điều chỉnh tồn kho (inventory_adjustments)
INSERT dbo.inventory_adjustments (store_id, product_id, batch_id, created_by, approved_by, type, status, quantity_before, quantity_after, value_impact, reason, created_at, approved_at)
SELECT s.id, p.id, b.id, a.id, a.id, adj.type, 1, adj.qty_before, adj.qty_after, adj.val_impact, adj.reason, adj.created_at, adj.created_at
FROM (VALUES
 ('893456789001', 'BAT-2026-001', 1, 360, 350, -450000, N'Hao hụt tự nhiên trong kỳ kiểm kê định kỳ', DATEADD(DAY, -4, SYSDATETIME())),
 ('893456789002', 'BAT-2026-002', 1, 175, 180, 375000,  N'Thực tế kiểm đếm phát hiện dôi dư 5 hộp so với sổ sách', DATEADD(DAY, -1, SYSDATETIME()))
) adj(barcode, batch_number, type, qty_before, qty_after, val_impact, reason, created_at)
CROSS JOIN (SELECT TOP 1 id FROM dbo.stores WHERE type = 2) s
CROSS JOIN (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin') a
JOIN dbo.products p ON p.barcode = adj.barcode
JOIN dbo.product_batches b ON b.product_id = p.id AND b.batch_number = adj.batch_number
WHERE NOT EXISTS (SELECT 1 FROM dbo.inventory_adjustments WHERE store_id = s.id AND batch_id = b.id);
GO

-- 6. Ca làm việc 
-- Ca sáng (07:00 - 15:00)
INSERT INTO [dbo].[shifts]
           ([store_id],[account_id],[opened_at],[closed_at],[opening_cash],[closing_cash],[expected_cash],[status],[note],[reconciled_by],[reconciled_at])
     VALUES
           (1, 1,
            DATETIMEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), DAY(SYSDATETIME()), 7, 0, 0, 0),
            DATETIMEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), DAY(SYSDATETIME()), 15, 0, 0, 0),
            2000000.00, 3500000.00, 3500000.00, 1,
            N'Ca sáng hoạt động bình thường', 1,
            DATETIMEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), DAY(SYSDATETIME()), 15, 5, 0, 0));

-- 7. Customers
INSERT INTO [dbo].[customers]
           ([full_name]
           ,[phone]
           ,[email]
           ,[date_of_birth]
           ,[gender]
           ,[address]
           ,[status]
           ,[created_by]
           ,[created_at]
           ,[updated_at])
     VALUES
           (N'Nguyễn Văn An', '0912345678', 'nguyenvanan@gmail.com', '1990-05-15', 1, N'123 Nguyễn Trãi, Thanh Xuân, Hà Nội', 1, 1, SYSDATETIME(), SYSDATETIME()),
           (N'Trần Thị Mai', '0987654321', 'tranthimai@gmail.com', '1995-10-20', 0, N'45 Cầu Giấy, Hà Nội', 1, 1, SYSDATETIME(), SYSDATETIME()),
           (N'Lê Hoàng Nam', '0901122334', 'lehoangnam@gmail.com', '1988-12-01', 1, N'78 Lê Lợi, Quận 1, TP.HCM', 1, 1, SYSDATETIME(), SYSDATETIME());
GO

-- 8. Stock requisition
INSERT INTO stock_requisitions 
    (code, store_id, created_by, approved_by, status, reject_reason, created_at, approved_at)
VALUES 
    ('REQ-20261021-001', 1, 1, 1, 2, NULL, SYSDATETIME(), SYSDATETIME());

-- Lấy ID vừa insert để thêm chi tiết
DECLARE @RequisitionId BIGINT = SCOPE_IDENTITY();

INSERT INTO stock_requisition_details 
    (stock_requisition_id, product_id, requested_qty, approved_qty, received_qty) -- Thay đổi các cột theo thực tế
VALUES 
    (@RequisitionId, 1, 50,50,50),
    (@RequisitionId, 2, 100,100,100);

-- 9. Good Issues
INSERT INTO goods_issues 
    (code, stock_requisition_id, from_store_id, to_store_id, created_by, dispatched_by, received_by, status, carrier, note, created_at, dispatched_at, received_at)
VALUES 
    ('GI-20261021-001', 2, 1, 2, 1, 1, 1, 2, N'Giao Hàng Nhanh', N'Xuất chuyển kho theo phiếu yêu cầu #2', DATEADD(HOUR, -5, SYSDATETIME()), DATEADD(HOUR, -3, SYSDATETIME()), SYSDATETIME());

-- 10. Inventory


INSERT INTO [dbo].[inventory_audits]
           ([code]
           ,[store_id]
           ,[requested_by]
           ,[counted_by]
           ,[reviewed_by]
           ,[status]
           ,[audit_date]
           ,[review_note]
           ,[created_at]
           ,[reviewed_at])
     VALUES
           -- Bản ghi 1: Trạng thái Hoàn thành (status = 1)
           ('AUD-202610-001'
           ,2
           ,1
           ,1
           ,1
           ,1
           ,CAST('2026-10-20' AS DATE)
           ,N'Kiểm kê định kỳ tháng 10 - Đã duyệt, khớp số lượng'
           ,SYSDATETIME()
           ,SYSDATETIME()),

           -- Bản ghi 2: Trạng thái Đang kiểm/Chờ duyệt (status = 0)
           ('AUD-202610-002'
           ,2
           ,1
           ,1
           ,1
           ,0
           ,CAST('2026-10-21' AS DATE)
           ,N'Kiểm kê đột xuất khu vực thuốc kê đơn - Đang xử lý'
           ,SYSDATETIME()
           ,NULL)

		 
GO
INSERT INTO [dbo].[inventory_audit_details]
           ([inventory_audit_id]
           ,[product_id]
           ,[batch_id]
           ,[system_quantity]
           ,[counted_quantity]
           ,[note])
     VALUES
           -- Chi tiết cho Audit ID 1 (AUD-202610-001)
           (1, 1, 1, 100, 100, N'Khớp số lượng hệ thống'),
           (1, 2, 2, 50, 48, N'Lệch -2: Hư hỏng do vỡ vỏ hộp trong quá trình vận chuyển'),
           (1, 3, 3, 30, 32, N'Lệch +2: Hàng khuyến mãi chưa cập nhật nhập kho'),

           -- Chi tiết cho Audit ID 2 (AUD-202610-002)
           (2, 4, 4, 200, 200, N'Đã kiểm đếm - Đúng thực tế'),
           (2, 5, 5, 80, 75, N'Thiếu 5 đơn vị - Đang rà soát lại hóa đơn xuất')
GO