USE PMS;
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.supplier_quotation_details', 'U') IS NULL
BEGIN
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
    PRINT N'Created table supplier_quotation_details';
END
ELSE
    PRINT N'Table supplier_quotation_details already exists';
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.inventory_audit_details', 'U') IS NULL
BEGIN
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
    PRINT N'Created table inventory_audit_details';
END
ELSE
    PRINT N'Table inventory_audit_details already exists';
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.inventory_adjustments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.inventory_adjustments (
        id              BIGINT IDENTITY(1,1) CONSTRAINT PK_inventory_adjustments PRIMARY KEY,
        store_id        BIGINT NOT NULL CONSTRAINT FK_adj_store REFERENCES dbo.stores(id),
        product_id      BIGINT NOT NULL CONSTRAINT FK_adj_product REFERENCES dbo.products(id),
        batch_id        BIGINT NOT NULL CONSTRAINT FK_adj_batch REFERENCES dbo.product_batches(id),
        inventory_audit_id BIGINT NULL CONSTRAINT FK_adj_audit REFERENCES dbo.inventory_audits(id),
        created_by      BIGINT NOT NULL CONSTRAINT FK_adj_creator REFERENCES dbo.accounts(id),
        approved_by     BIGINT NULL CONSTRAINT FK_adj_approver REFERENCES dbo.accounts(id),
        type            TINYINT NOT NULL CONSTRAINT CK_adj_type CHECK (type BETWEEN 1 AND 5),
        status          TINYINT NOT NULL CONSTRAINT DF_adj_status DEFAULT 0
                        CONSTRAINT CK_adj_status CHECK (status BETWEEN 0 AND 3),
        quantity_before INT NOT NULL,
        quantity_after  INT NOT NULL CONSTRAINT CK_adj_after CHECK (quantity_after >= 0),
        difference      AS (quantity_after - quantity_before) PERSISTED,
        value_impact    DECIMAL(18,2) NULL,
        reason          NVARCHAR(500) NOT NULL,
        created_at      DATETIME2(0) NOT NULL CONSTRAINT DF_adj_created DEFAULT SYSDATETIME(),
        approved_at     DATETIME2(0) NULL
    );
    CREATE INDEX IX_adj_status ON dbo.inventory_adjustments(status, created_at DESC);
    PRINT N'Created table inventory_adjustments';
END
ELSE
    PRINT N'Table inventory_adjustments already exists';
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sales_return_details', 'U') IS NULL
BEGIN
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
    PRINT N'Created table sales_return_details';
END
ELSE
    PRINT N'Table sales_return_details already exists';
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.daily_sales_reconciliations', 'U') IS NULL
BEGIN
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
                          CONSTRAINT CK_dsr_status CHECK (status IN (0,1,2)),
        note              NVARCHAR(1000) NULL,
        reconciled_by     BIGINT NULL CONSTRAINT FK_dsr_user REFERENCES dbo.accounts(id),
        reconciled_at     DATETIME2(0) NULL,
        CONSTRAINT UQ_dsr UNIQUE (store_id, business_date)
    );
    PRINT N'Created table daily_sales_reconciliations';
END
ELSE
    PRINT N'Table daily_sales_reconciliations already exists';
GO

