/* ==============================================================================
   PMS - DDL CHO 7 BẢNG CÒN THIẾU (CÁC BẢNG CÓ CỘT COMPUTED)
   ------------------------------------------------------------------------------
   Nguồn sự thật: các @Entity tương ứng trong BE/sba/src/main/java/com/pharmacy/entity/
     shifts                   -> Shift
     sales_invoice_details    -> SalesInvoiceDetail        (sub_total computed)
     sales_return_details     -> SalesReturnDetail         (sub_total computed)
     supplier_quotation_details -> SupplierQuotationDetail (subtotal computed, PERSISTED)
     inventory_audit_details  -> InventoryAuditDetail      (variance computed, PERSISTED)
     inventory_adjustments    -> InventoryAdjustment       (difference computed, PERSISTED)
     daily_sales_reconciliations -> DailySalesReconciliation (system_total, difference computed)
   ------------------------------------------------------------------------------
   - Idempotent: bảng nào đã tồn tại thì bỏ qua (IF OBJECT_ID(...) IS NULL)
   - Chỉ chạy file này khi DB chưa có các bảng trên, TRƯỚC khi chạy pms_seed_entities.sql
   - Không chứa GO -> chạy trực tiếp được trên DBeaver (Alt+X)
   ============================================================================== */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;

IF OBJECT_ID('dbo.shifts', 'U') IS NULL
CREATE TABLE dbo.shifts (
    id            BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_shifts PRIMARY KEY,
    store_id      BIGINT       NOT NULL,
    account_id    BIGINT       NOT NULL,
    opened_at     DATETIME2(0) NOT NULL CONSTRAINT DF_shifts_opened_at DEFAULT SYSDATETIME(),
    closed_at     DATETIME2(0) NULL,
    opening_cash  DECIMAL(18,2) NOT NULL,
    closing_cash  DECIMAL(18,2) NULL,
    expected_cash DECIMAL(18,2) NULL,
    difference    AS (closing_cash - expected_cash) PERSISTED,
    status        TINYINT      NOT NULL CONSTRAINT DF_shifts_status DEFAULT 1,
    note          NVARCHAR(1000) NULL,
    reconciled_by BIGINT       NULL,
    reconciled_at DATETIME2(0) NULL,
    CONSTRAINT FK_shifts_stores       FOREIGN KEY (store_id)      REFERENCES dbo.stores(id),
    CONSTRAINT FK_shifts_accounts     FOREIGN KEY (account_id)    REFERENCES dbo.accounts(id),
    CONSTRAINT FK_shifts_reconciled   FOREIGN KEY (reconciled_by) REFERENCES dbo.accounts(id)
);

IF OBJECT_ID('dbo.sales_invoice_details', 'U') IS NULL
CREATE TABLE dbo.sales_invoice_details (
    id                  BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_sales_invoice_details PRIMARY KEY,
    sales_invoice_id    BIGINT        NOT NULL,
    product_id          BIGINT        NOT NULL,
    batch_id            BIGINT        NULL,
    quantity            INT           NOT NULL CONSTRAINT CK_sid_quantity CHECK (quantity > 0),
    unit_price          DECIMAL(18,2) NOT NULL CONSTRAINT CK_sid_unit_price CHECK (unit_price >= 0),
    unit_cost           DECIMAL(18,2) NOT NULL CONSTRAINT DF_sid_unit_cost DEFAULT 0,
    sub_total           AS (CONVERT(DECIMAL(18,2), quantity * unit_price)),
    dosage_instruction  NVARCHAR(300) NULL,
    CONSTRAINT FK_sid_sales_invoice FOREIGN KEY (sales_invoice_id) REFERENCES dbo.sales_invoices(id) ON DELETE CASCADE,
    CONSTRAINT FK_sid_product       FOREIGN KEY (product_id)       REFERENCES dbo.products(id),
    CONSTRAINT FK_sid_batch         FOREIGN KEY (batch_id)         REFERENCES dbo.product_batches(id)
);

IF OBJECT_ID('dbo.sales_return_details', 'U') IS NULL
CREATE TABLE dbo.sales_return_details (
    id                      BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_sales_return_details PRIMARY KEY,
    sales_return_id         BIGINT        NOT NULL,
    sales_invoice_detail_id BIGINT        NOT NULL,
    product_id              BIGINT        NOT NULL,
    batch_id                BIGINT        NULL,
    quantity                INT           NOT NULL CONSTRAINT CK_srd_quantity CHECK (quantity > 0),
    unit_price              DECIMAL(18,2) NOT NULL CONSTRAINT CK_srd_unit_price CHECK (unit_price >= 0),
    sub_total               AS (CONVERT(DECIMAL(18,2), quantity * unit_price)),
    CONSTRAINT FK_srd_sales_return FOREIGN KEY (sales_return_id)         REFERENCES dbo.sales_returns(id) ON DELETE CASCADE,
    CONSTRAINT FK_srd_invoice_det  FOREIGN KEY (sales_invoice_detail_id) REFERENCES dbo.sales_invoice_details(id),
    CONSTRAINT FK_srd_product      FOREIGN KEY (product_id)              REFERENCES dbo.products(id),
    CONSTRAINT FK_srd_batch        FOREIGN KEY (batch_id)                REFERENCES dbo.product_batches(id)
);

IF OBJECT_ID('dbo.supplier_quotation_details', 'U') IS NULL
CREATE TABLE dbo.supplier_quotation_details (
    id                   BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_supplier_quotation_details PRIMARY KEY,
    supplier_quotation_id BIGINT        NOT NULL,
    product_id           BIGINT        NOT NULL,
    quantity             INT           NOT NULL,
    unit_price           DECIMAL(18,2) NOT NULL,
    tax_rate             DECIMAL(5,2)  NOT NULL CONSTRAINT DF_sqd_tax_rate DEFAULT 0,
    subtotal             AS (CONVERT(DECIMAL(18,2), quantity * unit_price * (1 + tax_rate / 100.0))) PERSISTED,
    CONSTRAINT UQ_sqd_quotation_product UNIQUE (supplier_quotation_id, product_id),
    CONSTRAINT CK_sqd_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT FK_sqd_supplier_quotation FOREIGN KEY (supplier_quotation_id) REFERENCES dbo.supplier_quotations(id) ON DELETE CASCADE,
    CONSTRAINT FK_sqd_product            FOREIGN KEY (product_id)            REFERENCES dbo.products(id)
);

IF OBJECT_ID('dbo.inventory_audit_details', 'U') IS NULL
CREATE TABLE dbo.inventory_audit_details (
    id                 BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_inventory_audit_details PRIMARY KEY,
    inventory_audit_id BIGINT       NOT NULL,
    product_id         BIGINT       NOT NULL,
    batch_id           BIGINT       NOT NULL,
    system_quantity    INT          NOT NULL,
    counted_quantity   INT          NULL,
    variance           AS (counted_quantity - system_quantity) PERSISTED,
    note               NVARCHAR(500) NULL,
    CONSTRAINT FK_iad_inventory_audit FOREIGN KEY (inventory_audit_id) REFERENCES dbo.inventory_audits(id) ON DELETE CASCADE,
    CONSTRAINT FK_iad_product         FOREIGN KEY (product_id)         REFERENCES dbo.products(id),
    CONSTRAINT FK_iad_batch           FOREIGN KEY (batch_id)           REFERENCES dbo.product_batches(id)
);

IF OBJECT_ID('dbo.inventory_adjustments', 'U') IS NULL
CREATE TABLE dbo.inventory_adjustments (
    id                 BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_inventory_adjustments PRIMARY KEY,
    store_id           BIGINT       NOT NULL,
    product_id         BIGINT       NOT NULL,
    batch_id           BIGINT       NOT NULL,
    inventory_audit_id BIGINT       NULL,
    created_by         BIGINT       NOT NULL,
    approved_by        BIGINT       NULL,
    type               TINYINT      NOT NULL CONSTRAINT CK_ia_type CHECK (type BETWEEN 1 AND 5),
    status             TINYINT      NOT NULL CONSTRAINT DF_ia_status DEFAULT 0,
    quantity_before    INT          NOT NULL,
    quantity_after     INT          NOT NULL,
    difference         AS (quantity_after - quantity_before) PERSISTED,
    value_impact       DECIMAL(18,2) NULL,
    reason             NVARCHAR(500) NOT NULL,
    created_at         DATETIME2(0) NOT NULL CONSTRAINT DF_ia_created_at DEFAULT SYSDATETIME(),
    approved_at        DATETIME2(0) NULL,
    CONSTRAINT FK_ia_store        FOREIGN KEY (store_id)           REFERENCES dbo.stores(id),
    CONSTRAINT FK_ia_product      FOREIGN KEY (product_id)         REFERENCES dbo.products(id),
    CONSTRAINT FK_ia_batch        FOREIGN KEY (batch_id)           REFERENCES dbo.product_batches(id),
    CONSTRAINT FK_ia_audit        FOREIGN KEY (inventory_audit_id) REFERENCES dbo.inventory_audits(id),
    CONSTRAINT FK_ia_created_by   FOREIGN KEY (created_by)         REFERENCES dbo.accounts(id),
    CONSTRAINT FK_ia_approved_by  FOREIGN KEY (approved_by)        REFERENCES dbo.accounts(id)
);

IF OBJECT_ID('dbo.daily_sales_reconciliations', 'U') IS NULL
CREATE TABLE dbo.daily_sales_reconciliations (
    id            BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_daily_sales_reconciliations PRIMARY KEY,
    store_id      BIGINT        NOT NULL,
    business_date DATE          NOT NULL,
    system_cash   DECIMAL(18,2) NOT NULL CONSTRAINT DF_dsr_system_cash  DEFAULT 0,
    system_bank   DECIMAL(18,2) NOT NULL CONSTRAINT DF_dsr_system_bank  DEFAULT 0,
    system_vnpay  DECIMAL(18,2) NOT NULL CONSTRAINT DF_dsr_system_vnpay DEFAULT 0,
    system_total  AS (system_cash + system_bank + system_vnpay) PERSISTED,
    actual_cash   DECIMAL(18,2) NULL,
    difference    AS (actual_cash - system_cash) PERSISTED,
    status        TINYINT       NOT NULL CONSTRAINT DF_dsr_status DEFAULT 0,
    note          NVARCHAR(1000) NULL,
    reconciled_by BIGINT        NULL,
    reconciled_at DATETIME2(0)  NULL,
    CONSTRAINT UQ_dsr_store_date UNIQUE (store_id, business_date),
    CONSTRAINT FK_dsr_store        FOREIGN KEY (store_id)      REFERENCES dbo.stores(id),
    CONSTRAINT FK_dsr_reconciled   FOREIGN KEY (reconciled_by) REFERENCES dbo.accounts(id)
);
