USE [master];
GO
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'PMS')
BEGIN
    ALTER DATABASE [PMS] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [PMS];
END;
GO
CREATE DATABASE [PMS];
GO
USE [PMS];
GO

/****** Object:  Table [dbo].[account_informations]    Script Date: 11/8/2026 7:37:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[account_informations](
    [date_of_birth] [date] NULL,
    [gender] [tinyint] NULL,
    [account_id] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [full_name] [nvarchar](150) NOT NULL,
    [address] [nvarchar](500) NULL,
    [avatar_url] [varchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    CONSTRAINT [UKojumgfcrwfqdaoh45wis80fu0] UNIQUE NONCLUSTERED
(
[account_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[accounts]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[accounts](
    [failed_login_count] [int] NOT NULL,
    [role_id] [int] NULL,
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [last_login_at] [datetime2](7) NULL,
    [store_id] [bigint] NULL,
    [updated_at] [datetime2](7) NULL,
    [phone] [varchar](20) NULL,
    [username] [varchar](50) NOT NULL,
    [password] [varchar](100) NOT NULL,
    [email] [varchar](150) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[audit_logs]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[audit_logs](
    [action] [tinyint] NOT NULL,
    [account_id] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [entity_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [ip_address] [varchar](45) NULL,
    [entity_name] [varchar](60) NOT NULL,
    [new_value] [nvarchar](max) NULL,
    [old_value] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[categories]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[categories](
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [name] [nvarchar](150) NOT NULL,
    [description] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[customer_health_profiles]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[customer_health_profiles](
    [height_cm] [numeric](5, 1) NULL,
    [weight_kg] [numeric](5, 1) NULL,
    [customer_id] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [updated_at] [datetime2](7) NULL,
    [allergies] [nvarchar](1000) NULL,
    [current_medications] [nvarchar](1000) NULL,
    [medical_conditions] [nvarchar](1000) NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    CONSTRAINT [UK7mei84tcgucu4kykemxndve2e] UNIQUE NONCLUSTERED
(
[customer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[customers]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[customers](
    [date_of_birth] [date] NULL,
    [gender] [tinyint] NULL,
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [updated_at] [datetime2](7) NULL,
    [phone] [varchar](20) NOT NULL,
    [email] [varchar](150) NULL,
    [full_name] [nvarchar](150) NOT NULL,
    [address] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[daily_sales_reconciliations]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[daily_sales_reconciliations](
    [actual_cash] [numeric](18, 2) NULL,
    [business_date] [date] NOT NULL,
    [status] [tinyint] NOT NULL,
    [system_bank] [numeric](18, 2) NOT NULL,
    [system_cash] [numeric](18, 2) NOT NULL,
    [system_vnpay] [numeric](18, 2) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [reconciled_at] [datetime2](7) NULL,
    [reconciled_by] [bigint] NULL,
    [store_id] [bigint] NOT NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[email_logs]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[email_logs](
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [ref_id] [bigint] NULL,
    [sent_at] [datetime2](7) NULL,
    [ref_type] [varchar](40) NULL,
    [to_email] [varchar](150) NOT NULL,
    [subject] [nvarchar](300) NOT NULL,
    [error_message] [nvarchar](1000) NULL,
    [body] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[goods_issue_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[goods_issue_details](
    [quantity] [int] NOT NULL,
    [received_quantity] [int] NULL,
    [batch_id] [bigint] NOT NULL,
    [goods_issue_id] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[goods_issues]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[goods_issues](
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [dispatched_at] [datetime2](7) NULL,
    [dispatched_by] [bigint] NULL,
    [from_store_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [received_at] [datetime2](7) NULL,
    [received_by] [bigint] NULL,
    [stock_requisition_id] [bigint] NULL,
    [to_store_id] [bigint] NULL,
    [code] [varchar](30) NOT NULL,
    [carrier] [nvarchar](150) NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[inventories]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[inventories](
    [quantity] [int] NOT NULL,
    [version] [int] NOT NULL,
    [batch_id] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [location_id] [bigint] NULL,
    [product_id] [bigint] NOT NULL,
    [store_id] [bigint] NOT NULL,
    [updated_at] [datetime2](7) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[inventory_adjustments]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[inventory_adjustments](
    [quantity_after] [int] NOT NULL,
    [quantity_before] [int] NOT NULL,
    [status] [tinyint] NOT NULL,
    [type] [tinyint] NOT NULL,
    [value_impact] [numeric](18, 2) NULL,
    [approved_at] [datetime2](7) NULL,
    [approved_by] [bigint] NULL,
    [batch_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [inventory_audit_id] [bigint] NULL,
    [product_id] [bigint] NOT NULL,
    [store_id] [bigint] NOT NULL,
    [reason] [nvarchar](500) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[inventory_audit_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[inventory_audit_details](
    [counted_quantity] [int] NULL,
    [system_quantity] [int] NOT NULL,
    [batch_id] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [inventory_audit_id] [bigint] NOT NULL,
    [product_id] [bigint] NOT NULL,
    [note] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[inventory_audits]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[inventory_audits](
    [audit_date] [date] NULL,
    [status] [tinyint] NOT NULL,
    [counted_by] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [requested_by] [bigint] NULL,
    [reviewed_at] [datetime2](7) NULL,
    [reviewed_by] [bigint] NULL,
    [store_id] [bigint] NULL,
    [code] [varchar](30) NOT NULL,
    [review_note] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[notifications]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[notifications](
    [is_read] [bit] NOT NULL,
    [account_id] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [ref_id] [bigint] NULL,
    [store_id] [bigint] NULL,
    [type] [varchar](30) NOT NULL,
    [ref_type] [varchar](40) NULL,
    [title] [nvarchar](200) NOT NULL,
    [message] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[password_reset_tokens]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[password_reset_tokens](
    [account_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [expires_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [used_at] [datetime2](7) NULL,
    [token_hash] [varchar](100) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[payments]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[payments](
    [amount] [numeric](18, 2) NOT NULL,
    [method] [tinyint] NOT NULL,
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [paid_at] [datetime2](7) NULL,
    [sales_invoice_id] [bigint] NOT NULL,
    [transaction_ref] [varchar](100) NULL,
    [gateway_response] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[permissions]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[permissions](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [module] [varchar](40) NOT NULL,
    [code] [varchar](50) NOT NULL,
    [description] [nvarchar](200) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[price_histories]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[price_histories](
    [cost_price] [numeric](18, 2) NOT NULL,
    [selling_price] [numeric](18, 2) NOT NULL,
    [account_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [effective_from] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [reason] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[product_batches]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[product_batches](
    [expiry_date] [date] NOT NULL,
    [manufacture_date] [date] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NULL,
    [supplier_id] [bigint] NULL,
    [batch_number] [varchar](50) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[product_units]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[product_units](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [barcode] [varchar](50) NULL,
    [conversion_factor] [int] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [is_base_unit] [bit] NOT NULL,
    [selling_price] [numeric](18, 2) NOT NULL,
    [unit_name] [nvarchar](50) NOT NULL,
    [product_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[products]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[products](
    [cost_price] [numeric](18, 2) NOT NULL,
    [is_prescription] [bit] NOT NULL,
    [min_quantity] [int] NOT NULL,
    [selling_price] [numeric](18, 2) NOT NULL,
    [status] [tinyint] NOT NULL,
    [category_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [updated_at] [datetime2](7) NULL,
    [unit] [nvarchar](30) NOT NULL,
    [barcode] [varchar](50) NULL,
    [manufacturer] [nvarchar](200) NULL,
    [active_ingredient] [nvarchar](250) NULL,
    [name] [nvarchar](250) NOT NULL,
    [image_url] [varchar](500) NULL,
    [description] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_proposal_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_proposal_details](
    [quantity] [int] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [purchase_proposal_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_proposal_requests]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_proposal_requests](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [purchase_proposal_id] [bigint] NOT NULL,
    [purchase_request_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_proposals]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_proposals](
    [status] [tinyint] NOT NULL,
    [total_amount] [numeric](18, 2) NOT NULL,
    [approved_at] [datetime2](7) NULL,
    [approved_by] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [supplier_quotation_id] [bigint] NULL,
    [code] [varchar](30) NOT NULL,
    [reject_reason] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_receipt_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_receipt_details](
    [expiry_date] [date] NOT NULL,
    [manufacture_date] [date] NULL,
    [order_quantity] [int] NOT NULL,
    [quantity] [int] NOT NULL,
    [unit_cost] [numeric](18, 2) NOT NULL,
    [batch_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [location_id] [bigint] NULL,
    [product_id] [bigint] NOT NULL,
    [purchase_receipt_id] [bigint] NOT NULL,
    [batch_number] [varchar](50) NOT NULL,
    [unit_name] [nvarchar](50) NULL,
    [conversion_factor] [int] NOT NULL,
    [base_quantity] [int] NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_receipts]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_receipts](
    [delivery_type] [tinyint] NOT NULL,
    [status] [tinyint] NOT NULL,
    [total_amount] [numeric](18, 2) NOT NULL,
    [confirmed_at] [datetime2](7) NULL,
    [confirmed_by] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [purchase_proposal_id] [bigint] NULL,
    [store_id] [bigint] NULL,
    [supplier_id] [bigint] NULL,
    [code] [varchar](30) NOT NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_request_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_request_details](
    [requested_quantity] [int] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [purchase_request_id] [bigint] NOT NULL,
    [note] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[purchase_requests]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[purchase_requests](
    [status] [tinyint] NOT NULL,
    [approved_at] [datetime2](7) NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [store_id] [bigint] NULL,
    [updated_at] [datetime2](7) NULL,
    [code] [varchar](30) NOT NULL,
    [reason] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[refresh_tokens]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[refresh_tokens](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [expiry_date] [datetime2](7) NOT NULL,
    [replaced_by_token] [varchar](500) NULL,
    [is_revoked] [bit] NOT NULL,
    [token] [varchar](500) NOT NULL,
    [account_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    CONSTRAINT [IX_refresh_tokens_token] UNIQUE NONCLUSTERED
(
[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[rfqs]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[rfqs](
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [expired_at] [datetime2](7) NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [purchase_proposal_id] [bigint] NULL,
    [purchase_request_id] [bigint] NULL,
    [response_at] [datetime2](7) NULL,
    [sent_at] [datetime2](7) NULL,
    [sent_by] [bigint] NULL,
    [supplier_id] [bigint] NOT NULL,
    [code] [varchar](30) NOT NULL,
    [token_hash] [varchar](64) NULL,
    [subject] [nvarchar](300) NULL,
    [response_note] [nvarchar](1000) NULL,
    [content] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[role_permissions]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[role_permissions](
    [permission_id] [int] NOT NULL,
    [role_id] [int] NOT NULL,
     PRIMARY KEY CLUSTERED
    (
    [permission_id] ASC,
[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[roles]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[roles](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [code] [varchar](30) NOT NULL,
    [name] [nvarchar](100) NOT NULL,
    [description] [nvarchar](300) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[sales_invoice_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[sales_invoice_details](
    [quantity] [int] NOT NULL,
    [unit_cost] [numeric](18, 2) NOT NULL,
    [unit_price] [numeric](18, 2) NOT NULL,
    [batch_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [sales_invoice_id] [bigint] NOT NULL,
    [dosage_instruction] [nvarchar](300) NULL,
    [base_quantity] [int] NULL,
    [conversion_factor] [int] NULL,
    [unit_name] [nvarchar](50) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[sales_invoices]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[sales_invoices](
    [discount] [numeric](18, 2) NOT NULL,
    [final_amount] [numeric](18, 2) NOT NULL,
    [status] [tinyint] NOT NULL,
    [total_amount] [numeric](18, 2) NOT NULL,
    [account_id] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [customer_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [paid_at] [datetime2](7) NULL,
    [shift_id] [bigint] NULL,
    [store_id] [bigint] NULL,
    [code] [varchar](30) NOT NULL,
    [prescription_code] [nvarchar](50) NULL,
    [cancel_reason] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[sales_return_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[sales_return_details](
    [quantity] [int] NOT NULL,
    [unit_price] [numeric](18, 2) NOT NULL,
    [batch_id] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [sales_invoice_detail_id] [bigint] NOT NULL,
    [sales_return_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[sales_returns]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[sales_returns](
    [refund_amount] [numeric](18, 2) NOT NULL,
    [refund_method] [tinyint] NULL,
    [return_type] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [processed_by] [bigint] NOT NULL,
    [sales_invoice_id] [bigint] NOT NULL,
    [shift_id] [bigint] NOT NULL,
    [code] [varchar](30) NOT NULL,
    [reason] [nvarchar](500) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[shifts]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[shifts](
    [closing_cash] [numeric](18, 2) NULL,
    [expected_cash] [numeric](18, 2) NULL,
    [opening_cash] [numeric](18, 2) NOT NULL,
    [status] [tinyint] NOT NULL,
    [account_id] [bigint] NOT NULL,
    [closed_at] [datetime2](7) NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [opened_at] [datetime2](7) NOT NULL,
    [reconciled_at] [datetime2](7) NULL,
    [reconciled_by] [bigint] NULL,
    [store_id] [bigint] NOT NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[stock_movements]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[stock_movements](
    [movement_type] [tinyint] NOT NULL,
    [quantity_after] [int] NOT NULL,
    [quantity_change] [int] NOT NULL,
    [batch_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [reference_id] [bigint] NOT NULL,
    [store_id] [bigint] NOT NULL,
    [reference_type] [varchar](40) NOT NULL,
    [note] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[stock_requisition_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[stock_requisition_details](
    [approved_qty] [int] NULL,
    [received_qty] [int] NULL,
    [requested_qty] [int] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [stock_requisition_id] [bigint] NOT NULL,
    [unit_name] [nvarchar](50) NULL,
    [conversion_factor] [int] NOT NULL,
    [base_requested_qty] [int] NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[stock_requisitions]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[stock_requisitions](
    [status] [tinyint] NOT NULL,
    [approved_at] [datetime2](7) NULL,
    [approved_by] [bigint] NULL,
    [created_at] [datetime2](7) NOT NULL,
    [created_by] [bigint] NOT NULL,
    [dispatched_at] [datetime2](7) NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [received_at] [datetime2](7) NULL,
    [store_id] [bigint] NOT NULL,
    [code] [varchar](30) NOT NULL,
    [reject_reason] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[stores]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[stores](
    [status] [tinyint] NOT NULL,
    [type] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [code] [varchar](20) NOT NULL,
    [phone] [varchar](20) NULL,
    [name] [nvarchar](150) NOT NULL,
    [address] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[supplier_quotation_details]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[supplier_quotation_details](
    [quantity] [int] NOT NULL,
    [tax_rate] [numeric](5, 2) NOT NULL,
    [unit_price] [numeric](18, 2) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [product_id] [bigint] NOT NULL,
    [supplier_quotation_id] [bigint] NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[supplier_quotations]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[supplier_quotations](
    [quotation_date] [date] NOT NULL,
    [status] [tinyint] NOT NULL,
    [total_amount] [numeric](18, 2) NOT NULL,
    [valid_until] [date] NULL,
    [account_id] [bigint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [rfq_id] [bigint] NOT NULL,
    [supplier_id] [bigint] NOT NULL,
    [code] [varchar](30) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[suppliers]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[suppliers](
    [status] [tinyint] NOT NULL,
    [created_at] [datetime2](7) NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [phone] [varchar](20) NULL,
    [tax_code] [varchar](20) NULL,
    [code] [varchar](30) NOT NULL,
    [contact_person] [nvarchar](150) NULL,
    [email] [varchar](150) NULL,
    [name] [nvarchar](250) NOT NULL,
    [address] [nvarchar](500) NULL,
    [delete_reason] [nvarchar](500) NULL,
    [note] [nvarchar](1000) NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[system_settings]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[system_settings](
    [updated_at] [datetime2](7) NOT NULL,
    [updated_by] [bigint] NULL,
    [setting_key] [varchar](60) NOT NULL,
    [description] [nvarchar](300) NULL,
    [setting_value] [nvarchar](500) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[setting_key] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Table [dbo].[warehouse_locations]    Script Date: 11/8/2026 7:37:32 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
CREATE TABLE [dbo].[warehouse_locations](
    [status] [tinyint] NOT NULL,
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [store_id] [bigint] NULL,
    [aisle] [varchar](10) NULL,
    [bin] [varchar](10) NULL,
    [shelf] [varchar](10) NULL,
    [code] [varchar](30) NOT NULL,
    PRIMARY KEY CLUSTERED
(
[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    GO
/****** Object:  Index [IX_refresh_tokens_account_id]    Script Date: 11/8/2026 7:37:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_refresh_tokens_account_id] ON [dbo].[refresh_tokens]
(
	[account_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[accounts] ADD  DEFAULT ((0)) FOR [failed_login_count]
    GO
ALTER TABLE [dbo].[accounts] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[accounts] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[audit_logs] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[customers] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[customers] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] ADD  DEFAULT ((0)) FOR [system_bank]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] ADD  DEFAULT ((0)) FOR [system_cash]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] ADD  DEFAULT ((0)) FOR [system_vnpay]
    GO
ALTER TABLE [dbo].[email_logs] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[email_logs] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[goods_issues] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[goods_issues] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[inventories] ADD  DEFAULT ((0)) FOR [quantity]
    GO
ALTER TABLE [dbo].[inventories] ADD  DEFAULT ((0)) FOR [version]
    GO
ALTER TABLE [dbo].[inventories] ADD  DEFAULT (sysdatetime()) FOR [updated_at]
    GO
ALTER TABLE [dbo].[inventory_adjustments] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[inventory_adjustments] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[inventory_audits] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[inventory_audits] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ((0)) FOR [is_read]
    GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[password_reset_tokens] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[price_histories] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[product_batches] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[product_units] ADD  DEFAULT ((1)) FOR [conversion_factor]
    GO
ALTER TABLE [dbo].[product_units] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[product_units] ADD  DEFAULT ((0)) FOR [is_base_unit]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [cost_price]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [is_prescription]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((20)) FOR [min_quantity]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [selling_price]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[products] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[purchase_proposals] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[purchase_proposals] ADD  DEFAULT ((0)) FOR [total_amount]
    GO
ALTER TABLE [dbo].[purchase_proposals] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[purchase_receipt_details] ADD  DEFAULT ((0)) FOR [order_quantity]
    GO
ALTER TABLE [dbo].[purchase_receipt_details] ADD  DEFAULT ((1)) FOR [conversion_factor]
    GO
ALTER TABLE [dbo].[purchase_receipts] ADD  DEFAULT ((1)) FOR [delivery_type]
    GO
ALTER TABLE [dbo].[purchase_receipts] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[purchase_receipts] ADD  DEFAULT ((0)) FOR [total_amount]
    GO
ALTER TABLE [dbo].[purchase_receipts] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[purchase_requests] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[purchase_requests] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[refresh_tokens] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[refresh_tokens] ADD  DEFAULT ((0)) FOR [is_revoked]
    GO
ALTER TABLE [dbo].[rfqs] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[rfqs] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[sales_invoice_details] ADD  DEFAULT ((0)) FOR [unit_cost]
    GO
ALTER TABLE [dbo].[sales_invoice_details] ADD  DEFAULT ((1)) FOR [conversion_factor]
    GO
ALTER TABLE [dbo].[sales_invoices] ADD  DEFAULT ((0)) FOR [discount]
    GO
ALTER TABLE [dbo].[sales_invoices] ADD  DEFAULT ((0)) FOR [final_amount]
    GO
ALTER TABLE [dbo].[sales_invoices] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[sales_invoices] ADD  DEFAULT ((0)) FOR [total_amount]
    GO
ALTER TABLE [dbo].[sales_invoices] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[sales_returns] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[shifts] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[shifts] ADD  DEFAULT (sysdatetime()) FOR [opened_at]
    GO
ALTER TABLE [dbo].[stock_movements] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[stock_requisition_details] ADD  DEFAULT ((1)) FOR [conversion_factor]
    GO
ALTER TABLE [dbo].[stock_requisitions] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[stock_requisitions] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[stores] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[stores] ADD  DEFAULT ((1)) FOR [type]
    GO
ALTER TABLE [dbo].[stores] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[supplier_quotation_details] ADD  DEFAULT ((0)) FOR [tax_rate]
    GO
ALTER TABLE [dbo].[supplier_quotations] ADD  DEFAULT ((0)) FOR [status]
    GO
ALTER TABLE [dbo].[supplier_quotations] ADD  DEFAULT ((0)) FOR [total_amount]
    GO
ALTER TABLE [dbo].[supplier_quotations] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[suppliers] ADD  DEFAULT (sysdatetime()) FOR [created_at]
    GO
ALTER TABLE [dbo].[system_settings] ADD  DEFAULT (sysdatetime()) FOR [updated_at]
    GO
ALTER TABLE [dbo].[warehouse_locations] ADD  DEFAULT ((1)) FOR [status]
    GO
ALTER TABLE [dbo].[account_informations]  WITH CHECK ADD  CONSTRAINT [FK5ij3chpycb82d8fymbunftjeo] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[account_informations] CHECK CONSTRAINT [FK5ij3chpycb82d8fymbunftjeo]
    GO
ALTER TABLE [dbo].[accounts]  WITH CHECK ADD  CONSTRAINT [FKo6cy0k9aic3npi4cefpqyhajb] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[accounts] CHECK CONSTRAINT [FKo6cy0k9aic3npi4cefpqyhajb]
    GO
ALTER TABLE [dbo].[accounts]  WITH CHECK ADD  CONSTRAINT [FKt3wava8ssfdspnh3hg4col3m1] FOREIGN KEY([role_id])
    REFERENCES [dbo].[roles] ([id])
    GO
ALTER TABLE [dbo].[accounts] CHECK CONSTRAINT [FKt3wava8ssfdspnh3hg4col3m1]
    GO
ALTER TABLE [dbo].[audit_logs]  WITH CHECK ADD  CONSTRAINT [FKkek8i3jbn3bfbkufnabud2qvb] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[audit_logs] CHECK CONSTRAINT [FKkek8i3jbn3bfbkufnabud2qvb]
    GO
ALTER TABLE [dbo].[categories]  WITH CHECK ADD  CONSTRAINT [FKad7a7mponlx0h5e8wgk6i7xge] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[categories] CHECK CONSTRAINT [FKad7a7mponlx0h5e8wgk6i7xge]
    GO
ALTER TABLE [dbo].[customer_health_profiles]  WITH CHECK ADD  CONSTRAINT [FKamcedjybwso8e8o9f38gkrv7r] FOREIGN KEY([customer_id])
    REFERENCES [dbo].[customers] ([id])
    GO
ALTER TABLE [dbo].[customer_health_profiles] CHECK CONSTRAINT [FKamcedjybwso8e8o9f38gkrv7r]
    GO
ALTER TABLE [dbo].[customers]  WITH CHECK ADD  CONSTRAINT [FKnhiq4rmktq23glndww8kv6v23] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[customers] CHECK CONSTRAINT [FKnhiq4rmktq23glndww8kv6v23]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations]  WITH CHECK ADD  CONSTRAINT [FK9hxvl69gr8wrmq23ghpxmwnke] FOREIGN KEY([reconciled_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] CHECK CONSTRAINT [FK9hxvl69gr8wrmq23ghpxmwnke]
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations]  WITH CHECK ADD  CONSTRAINT [FKa5b67vrvtypk3mmk7m693a4bk] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[daily_sales_reconciliations] CHECK CONSTRAINT [FKa5b67vrvtypk3mmk7m693a4bk]
    GO
ALTER TABLE [dbo].[goods_issue_details]  WITH CHECK ADD  CONSTRAINT [FKb5j3gpdy1ak8p8mu4r0kjp3v6] FOREIGN KEY([goods_issue_id])
    REFERENCES [dbo].[goods_issues] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[goods_issue_details] CHECK CONSTRAINT [FKb5j3gpdy1ak8p8mu4r0kjp3v6]
    GO
ALTER TABLE [dbo].[goods_issue_details]  WITH CHECK ADD  CONSTRAINT [FKjif8osdn4jj2tf56hf5ofve3b] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[goods_issue_details] CHECK CONSTRAINT [FKjif8osdn4jj2tf56hf5ofve3b]
    GO
ALTER TABLE [dbo].[goods_issue_details]  WITH CHECK ADD  CONSTRAINT [FKmprt3n023wbapq82o6680vctt] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[goods_issue_details] CHECK CONSTRAINT [FKmprt3n023wbapq82o6680vctt]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FK9ejjtj1tgd2vjy0qolau25a0w] FOREIGN KEY([stock_requisition_id])
    REFERENCES [dbo].[stock_requisitions] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FK9ejjtj1tgd2vjy0qolau25a0w]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FKa0aq9l3svovnjflufrf5982mn] FOREIGN KEY([from_store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FKa0aq9l3svovnjflufrf5982mn]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FKcx5smahruvac00y7nqsktsyl4] FOREIGN KEY([to_store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FKcx5smahruvac00y7nqsktsyl4]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FKflyd9d5nr3cwm7f082ictwbm3] FOREIGN KEY([received_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FKflyd9d5nr3cwm7f082ictwbm3]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FKjb6uhud5vviphy063j4e9f0ky] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FKjb6uhud5vviphy063j4e9f0ky]
    GO
ALTER TABLE [dbo].[goods_issues]  WITH CHECK ADD  CONSTRAINT [FKrhrr42wos4gf8gu209fn55cek] FOREIGN KEY([dispatched_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[goods_issues] CHECK CONSTRAINT [FKrhrr42wos4gf8gu209fn55cek]
    GO
ALTER TABLE [dbo].[inventories]  WITH CHECK ADD  CONSTRAINT [FK3w9dy9oo32yp79fydyxm8em28] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[inventories] CHECK CONSTRAINT [FK3w9dy9oo32yp79fydyxm8em28]
    GO
ALTER TABLE [dbo].[inventories]  WITH CHECK ADD  CONSTRAINT [FK8drmqyx629j3oo8ct9jnc5y3y] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[inventories] CHECK CONSTRAINT [FK8drmqyx629j3oo8ct9jnc5y3y]
    GO
ALTER TABLE [dbo].[inventories]  WITH CHECK ADD  CONSTRAINT [FKdhx5fp1bq8brd53xqeu92c6hm] FOREIGN KEY([location_id])
    REFERENCES [dbo].[warehouse_locations] ([id])
    GO
ALTER TABLE [dbo].[inventories] CHECK CONSTRAINT [FKdhx5fp1bq8brd53xqeu92c6hm]
    GO
ALTER TABLE [dbo].[inventories]  WITH CHECK ADD  CONSTRAINT [FKgwjy9oq9vg85d9cc1lktb49ul] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[inventories] CHECK CONSTRAINT [FKgwjy9oq9vg85d9cc1lktb49ul]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FK1arhgu15o08qvto6fonaworio] FOREIGN KEY([approved_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FK1arhgu15o08qvto6fonaworio]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FKasbjeibfq9p8p3bek1nr3ysb9] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FKasbjeibfq9p8p3bek1nr3ysb9]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FKcq2xr5pg2tq025cfchh4bep9m] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FKcq2xr5pg2tq025cfchh4bep9m]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FKesula7028r18m091jkq7vv8vy] FOREIGN KEY([inventory_audit_id])
    REFERENCES [dbo].[inventory_audits] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FKesula7028r18m091jkq7vv8vy]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FKiv3d0b77jqejhwbumur9p6s66] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FKiv3d0b77jqejhwbumur9p6s66]
    GO
ALTER TABLE [dbo].[inventory_adjustments]  WITH CHECK ADD  CONSTRAINT [FKp9fd9bmfuowqk2urx1xf4rmjm] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[inventory_adjustments] CHECK CONSTRAINT [FKp9fd9bmfuowqk2urx1xf4rmjm]
    GO
ALTER TABLE [dbo].[inventory_audit_details]  WITH CHECK ADD  CONSTRAINT [FKknjeu0wvfcgcuu5tsafc1bdhl] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[inventory_audit_details] CHECK CONSTRAINT [FKknjeu0wvfcgcuu5tsafc1bdhl]
    GO
ALTER TABLE [dbo].[inventory_audit_details]  WITH CHECK ADD  CONSTRAINT [FKll5g33ublboxb52399ep3hvv] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[inventory_audit_details] CHECK CONSTRAINT [FKll5g33ublboxb52399ep3hvv]
    GO
ALTER TABLE [dbo].[inventory_audit_details]  WITH CHECK ADD  CONSTRAINT [FKtcqmqmcuqdwohj2ls4xsn4j9d] FOREIGN KEY([inventory_audit_id])
    REFERENCES [dbo].[inventory_audits] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[inventory_audit_details] CHECK CONSTRAINT [FKtcqmqmcuqdwohj2ls4xsn4j9d]
    GO
ALTER TABLE [dbo].[inventory_audits]  WITH CHECK ADD  CONSTRAINT [FKl5bybuyvh20d9b65eovetooia] FOREIGN KEY([reviewed_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[inventory_audits] CHECK CONSTRAINT [FKl5bybuyvh20d9b65eovetooia]
    GO
ALTER TABLE [dbo].[inventory_audits]  WITH CHECK ADD  CONSTRAINT [FKosuiqaxh8glgi6uc7rqr0qdg4] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[inventory_audits] CHECK CONSTRAINT [FKosuiqaxh8glgi6uc7rqr0qdg4]
    GO
ALTER TABLE [dbo].[inventory_audits]  WITH CHECK ADD  CONSTRAINT [FKq94g68c40oq57v9fd1bu6v5r0] FOREIGN KEY([requested_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[inventory_audits] CHECK CONSTRAINT [FKq94g68c40oq57v9fd1bu6v5r0]
    GO
ALTER TABLE [dbo].[inventory_audits]  WITH CHECK ADD  CONSTRAINT [FKshc8rpc85qdad9mpa7bsaja44] FOREIGN KEY([counted_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[inventory_audits] CHECK CONSTRAINT [FKshc8rpc85qdad9mpa7bsaja44]
    GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD  CONSTRAINT [FKinagv63vd03tebhs0mpc9by4] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[notifications] CHECK CONSTRAINT [FKinagv63vd03tebhs0mpc9by4]
    GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD  CONSTRAINT [FKqye0axqv18a6egslmba3ljtcm] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[notifications] CHECK CONSTRAINT [FKqye0axqv18a6egslmba3ljtcm]
    GO
ALTER TABLE [dbo].[password_reset_tokens]  WITH CHECK ADD  CONSTRAINT [FKakpd9ro0vywgwa7hqmpbdurma] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[password_reset_tokens] CHECK CONSTRAINT [FKakpd9ro0vywgwa7hqmpbdurma]
    GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD  CONSTRAINT [FKhyreo18yep5hpt2ejsjat9r6o] FOREIGN KEY([sales_invoice_id])
    REFERENCES [dbo].[sales_invoices] ([id])
    GO
ALTER TABLE [dbo].[payments] CHECK CONSTRAINT [FKhyreo18yep5hpt2ejsjat9r6o]
    GO
ALTER TABLE [dbo].[price_histories]  WITH CHECK ADD  CONSTRAINT [FKhl2sgth9iug9pvvyxltrc704l] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[price_histories] CHECK CONSTRAINT [FKhl2sgth9iug9pvvyxltrc704l]
    GO
ALTER TABLE [dbo].[price_histories]  WITH CHECK ADD  CONSTRAINT [FKplfi8w2xsvof33kuem0ar3vm7] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[price_histories] CHECK CONSTRAINT [FKplfi8w2xsvof33kuem0ar3vm7]
    GO
ALTER TABLE [dbo].[product_batches]  WITH CHECK ADD  CONSTRAINT [FK66p4q4vitmrt0cb7pjsl8bg3s] FOREIGN KEY([supplier_id])
    REFERENCES [dbo].[suppliers] ([id])
    GO
ALTER TABLE [dbo].[product_batches] CHECK CONSTRAINT [FK66p4q4vitmrt0cb7pjsl8bg3s]
    GO
ALTER TABLE [dbo].[product_batches]  WITH CHECK ADD  CONSTRAINT [FKo2hwf6cltkf4qkdim5w29rbgq] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[product_batches] CHECK CONSTRAINT [FKo2hwf6cltkf4qkdim5w29rbgq]
    GO
ALTER TABLE [dbo].[product_units]  WITH CHECK ADD  CONSTRAINT [FK5kqda142dwa9lo7vigynbg4sb] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[product_units] CHECK CONSTRAINT [FK5kqda142dwa9lo7vigynbg4sb]
    GO
ALTER TABLE [dbo].[products]  WITH CHECK ADD  CONSTRAINT [FKog2rp4qthbtt2lfyhfo32lsw9] FOREIGN KEY([category_id])
    REFERENCES [dbo].[categories] ([id])
    GO
ALTER TABLE [dbo].[products] CHECK CONSTRAINT [FKog2rp4qthbtt2lfyhfo32lsw9]
    GO
ALTER TABLE [dbo].[purchase_proposal_details]  WITH CHECK ADD  CONSTRAINT [FK6cimuvjvghgtrrn6m9il9r08u] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposal_details] CHECK CONSTRAINT [FK6cimuvjvghgtrrn6m9il9r08u]
    GO
ALTER TABLE [dbo].[purchase_proposal_details]  WITH CHECK ADD  CONSTRAINT [FKcbx4bef52e5w8dtftrropu35l] FOREIGN KEY([purchase_proposal_id])
    REFERENCES [dbo].[purchase_proposals] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposal_details] CHECK CONSTRAINT [FKcbx4bef52e5w8dtftrropu35l]
    GO
ALTER TABLE [dbo].[purchase_proposal_requests]  WITH CHECK ADD  CONSTRAINT [FKdwkwjjheclbp9saaqyt4vptec] FOREIGN KEY([purchase_proposal_id])
    REFERENCES [dbo].[purchase_proposals] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposal_requests] CHECK CONSTRAINT [FKdwkwjjheclbp9saaqyt4vptec]
    GO
ALTER TABLE [dbo].[purchase_proposal_requests]  WITH CHECK ADD  CONSTRAINT [FKmohrtac7ti4nttkcib94fdavc] FOREIGN KEY([purchase_request_id])
    REFERENCES [dbo].[purchase_requests] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposal_requests] CHECK CONSTRAINT [FKmohrtac7ti4nttkcib94fdavc]
    GO
ALTER TABLE [dbo].[purchase_proposals]  WITH CHECK ADD  CONSTRAINT [FKbe8pjuroafsuiyk4tuweb1y8r] FOREIGN KEY([supplier_quotation_id])
    REFERENCES [dbo].[supplier_quotations] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposals] CHECK CONSTRAINT [FKbe8pjuroafsuiyk4tuweb1y8r]
    GO
ALTER TABLE [dbo].[purchase_proposals]  WITH CHECK ADD  CONSTRAINT [FKk74usfb24qfshpgj2ar97ygxh] FOREIGN KEY([approved_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposals] CHECK CONSTRAINT [FKk74usfb24qfshpgj2ar97ygxh]
    GO
ALTER TABLE [dbo].[purchase_proposals]  WITH CHECK ADD  CONSTRAINT [FKnyd2dgjpmsqv4qt9o1lke7n6q] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[purchase_proposals] CHECK CONSTRAINT [FKnyd2dgjpmsqv4qt9o1lke7n6q]
    GO
ALTER TABLE [dbo].[purchase_receipt_details]  WITH CHECK ADD  CONSTRAINT [FK30c0rutsj6hrcb9vodusmt1pw] FOREIGN KEY([location_id])
    REFERENCES [dbo].[warehouse_locations] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipt_details] CHECK CONSTRAINT [FK30c0rutsj6hrcb9vodusmt1pw]
    GO
ALTER TABLE [dbo].[purchase_receipt_details]  WITH CHECK ADD  CONSTRAINT [FKh57l6y1af5uu4k08p06jpal1m] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipt_details] CHECK CONSTRAINT [FKh57l6y1af5uu4k08p06jpal1m]
    GO
ALTER TABLE [dbo].[purchase_receipt_details]  WITH CHECK ADD  CONSTRAINT [FKphfwjtkg9bjx2xx477n5nmf1c] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipt_details] CHECK CONSTRAINT [FKphfwjtkg9bjx2xx477n5nmf1c]
    GO
ALTER TABLE [dbo].[purchase_receipt_details]  WITH CHECK ADD  CONSTRAINT [FKt9cjje7j3i78gsqvu709xj7mg] FOREIGN KEY([purchase_receipt_id])
    REFERENCES [dbo].[purchase_receipts] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[purchase_receipt_details] CHECK CONSTRAINT [FKt9cjje7j3i78gsqvu709xj7mg]
    GO
ALTER TABLE [dbo].[purchase_receipts]  WITH CHECK ADD  CONSTRAINT [FKaecq2j6kf8po8avlrtyov5glm] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipts] CHECK CONSTRAINT [FKaecq2j6kf8po8avlrtyov5glm]
    GO
ALTER TABLE [dbo].[purchase_receipts]  WITH CHECK ADD  CONSTRAINT [FKbs9dnvm2un0xq2bwxcvc7tx63] FOREIGN KEY([confirmed_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipts] CHECK CONSTRAINT [FKbs9dnvm2un0xq2bwxcvc7tx63]
    GO
ALTER TABLE [dbo].[purchase_receipts]  WITH CHECK ADD  CONSTRAINT [FKd3io39egkd9m3v31l5c5p7ylh] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipts] CHECK CONSTRAINT [FKd3io39egkd9m3v31l5c5p7ylh]
    GO
ALTER TABLE [dbo].[purchase_receipts]  WITH CHECK ADD  CONSTRAINT [FKea6nje5wwfwc1209gpotvq867] FOREIGN KEY([supplier_id])
    REFERENCES [dbo].[suppliers] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipts] CHECK CONSTRAINT [FKea6nje5wwfwc1209gpotvq867]
    GO
ALTER TABLE [dbo].[purchase_receipts]  WITH CHECK ADD  CONSTRAINT [FKmf0mcp3rt5h69ivdyhi86god7] FOREIGN KEY([purchase_proposal_id])
    REFERENCES [dbo].[purchase_proposals] ([id])
    GO
ALTER TABLE [dbo].[purchase_receipts] CHECK CONSTRAINT [FKmf0mcp3rt5h69ivdyhi86god7]
    GO
ALTER TABLE [dbo].[purchase_request_details]  WITH CHECK ADD  CONSTRAINT [FK9i7a5rqxvh7lwrwf56p863hrw] FOREIGN KEY([purchase_request_id])
    REFERENCES [dbo].[purchase_requests] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[purchase_request_details] CHECK CONSTRAINT [FK9i7a5rqxvh7lwrwf56p863hrw]
    GO
ALTER TABLE [dbo].[purchase_request_details]  WITH CHECK ADD  CONSTRAINT [FKhxbt0fkw36komhvnft0645l6j] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[purchase_request_details] CHECK CONSTRAINT [FKhxbt0fkw36komhvnft0645l6j]
    GO
ALTER TABLE [dbo].[purchase_requests]  WITH CHECK ADD  CONSTRAINT [FK1p5o2hrigg531ohlut7attkjm] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[purchase_requests] CHECK CONSTRAINT [FK1p5o2hrigg531ohlut7attkjm]
    GO
ALTER TABLE [dbo].[purchase_requests]  WITH CHECK ADD  CONSTRAINT [FK4rsc8rt29dnycvwhm5uhpt6oe] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[purchase_requests] CHECK CONSTRAINT [FK4rsc8rt29dnycvwhm5uhpt6oe]
    GO
ALTER TABLE [dbo].[refresh_tokens]  WITH CHECK ADD  CONSTRAINT [FK6fm1gdbsrg5h8r5e3voiu6bo9] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[refresh_tokens] CHECK CONSTRAINT [FK6fm1gdbsrg5h8r5e3voiu6bo9]
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD  CONSTRAINT [FK1sgthdn9rsl85k7e46hw0euof] FOREIGN KEY([supplier_id])
    REFERENCES [dbo].[suppliers] ([id])
    GO
ALTER TABLE [dbo].[rfqs] CHECK CONSTRAINT [FK1sgthdn9rsl85k7e46hw0euof]
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD  CONSTRAINT [FK2q1ul3hf1v0ek2v8vt8fxxmpc] FOREIGN KEY([purchase_proposal_id])
    REFERENCES [dbo].[purchase_proposals] ([id])
    GO
ALTER TABLE [dbo].[rfqs] CHECK CONSTRAINT [FK2q1ul3hf1v0ek2v8vt8fxxmpc]
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD  CONSTRAINT [FKhw21r9yshis08kb1m20qjs0g6] FOREIGN KEY([sent_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[rfqs] CHECK CONSTRAINT [FKhw21r9yshis08kb1m20qjs0g6]
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD  CONSTRAINT [FKipm9r9ylm5jfosi9ch7pjcq5k] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[rfqs] CHECK CONSTRAINT [FKipm9r9ylm5jfosi9ch7pjcq5k]
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD  CONSTRAINT [FKpqyat0jrkof196atvlpjorvoa] FOREIGN KEY([purchase_request_id])
    REFERENCES [dbo].[purchase_requests] ([id])
    GO
ALTER TABLE [dbo].[rfqs] CHECK CONSTRAINT [FKpqyat0jrkof196atvlpjorvoa]
    GO
ALTER TABLE [dbo].[role_permissions]  WITH CHECK ADD  CONSTRAINT [FKegdk29eiy7mdtefy5c7eirr6e] FOREIGN KEY([permission_id])
    REFERENCES [dbo].[permissions] ([id])
    GO
ALTER TABLE [dbo].[role_permissions] CHECK CONSTRAINT [FKegdk29eiy7mdtefy5c7eirr6e]
    GO
ALTER TABLE [dbo].[role_permissions]  WITH CHECK ADD  CONSTRAINT [FKn5fotdgk8d1xvo8nav9uv3muc] FOREIGN KEY([role_id])
    REFERENCES [dbo].[roles] ([id])
    GO
ALTER TABLE [dbo].[role_permissions] CHECK CONSTRAINT [FKn5fotdgk8d1xvo8nav9uv3muc]
    GO
ALTER TABLE [dbo].[sales_invoice_details]  WITH CHECK ADD  CONSTRAINT [FK1rgyk5aebm04odmi8jp80qkm6] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[sales_invoice_details] CHECK CONSTRAINT [FK1rgyk5aebm04odmi8jp80qkm6]
    GO
ALTER TABLE [dbo].[sales_invoice_details]  WITH CHECK ADD  CONSTRAINT [FK2nj6vb93f4h3ya6ugrmr9l45g] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[sales_invoice_details] CHECK CONSTRAINT [FK2nj6vb93f4h3ya6ugrmr9l45g]
    GO
ALTER TABLE [dbo].[sales_invoice_details]  WITH CHECK ADD  CONSTRAINT [FKk7nj2gaul758kx7psq7537p7b] FOREIGN KEY([sales_invoice_id])
    REFERENCES [dbo].[sales_invoices] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[sales_invoice_details] CHECK CONSTRAINT [FKk7nj2gaul758kx7psq7537p7b]
    GO
ALTER TABLE [dbo].[sales_invoices]  WITH CHECK ADD  CONSTRAINT [FK6boqj01yqbp2q3q30w7lh1ijf] FOREIGN KEY([customer_id])
    REFERENCES [dbo].[customers] ([id])
    GO
ALTER TABLE [dbo].[sales_invoices] CHECK CONSTRAINT [FK6boqj01yqbp2q3q30w7lh1ijf]
    GO
ALTER TABLE [dbo].[sales_invoices]  WITH CHECK ADD  CONSTRAINT [FKb6kam168iyaxcfb4lb2spqk8h] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[sales_invoices] CHECK CONSTRAINT [FKb6kam168iyaxcfb4lb2spqk8h]
    GO
ALTER TABLE [dbo].[sales_invoices]  WITH CHECK ADD  CONSTRAINT [FKhgqg8m34sicty4vugtxwnwtve] FOREIGN KEY([shift_id])
    REFERENCES [dbo].[shifts] ([id])
    GO
ALTER TABLE [dbo].[sales_invoices] CHECK CONSTRAINT [FKhgqg8m34sicty4vugtxwnwtve]
    GO
ALTER TABLE [dbo].[sales_invoices]  WITH CHECK ADD  CONSTRAINT [FKqynkyyc03mx9sgd7xhj8xka9h] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[sales_invoices] CHECK CONSTRAINT [FKqynkyyc03mx9sgd7xhj8xka9h]
    GO
ALTER TABLE [dbo].[sales_return_details]  WITH CHECK ADD  CONSTRAINT [FK47wwp8bujryiv6m5eakibk2on] FOREIGN KEY([sales_return_id])
    REFERENCES [dbo].[sales_returns] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[sales_return_details] CHECK CONSTRAINT [FK47wwp8bujryiv6m5eakibk2on]
    GO
ALTER TABLE [dbo].[sales_return_details]  WITH CHECK ADD  CONSTRAINT [FK9s78xbjc1jtifaphgcuty5exo] FOREIGN KEY([sales_invoice_detail_id])
    REFERENCES [dbo].[sales_invoice_details] ([id])
    GO
ALTER TABLE [dbo].[sales_return_details] CHECK CONSTRAINT [FK9s78xbjc1jtifaphgcuty5exo]
    GO
ALTER TABLE [dbo].[sales_return_details]  WITH CHECK ADD  CONSTRAINT [FKcvi0cfbbltm208h3tcu8dkpjl] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[sales_return_details] CHECK CONSTRAINT [FKcvi0cfbbltm208h3tcu8dkpjl]
    GO
ALTER TABLE [dbo].[sales_return_details]  WITH CHECK ADD  CONSTRAINT [FKsihqeon2cdl2m2a2u1qy33pak] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[sales_return_details] CHECK CONSTRAINT [FKsihqeon2cdl2m2a2u1qy33pak]
    GO
ALTER TABLE [dbo].[sales_returns]  WITH CHECK ADD  CONSTRAINT [FKf3w78t6r0gu2r66l61uxppt4] FOREIGN KEY([shift_id])
    REFERENCES [dbo].[shifts] ([id])
    GO
ALTER TABLE [dbo].[sales_returns] CHECK CONSTRAINT [FKf3w78t6r0gu2r66l61uxppt4]
    GO
ALTER TABLE [dbo].[sales_returns]  WITH CHECK ADD  CONSTRAINT [FKfuigcg56jppxobbobdv54osrb] FOREIGN KEY([sales_invoice_id])
    REFERENCES [dbo].[sales_invoices] ([id])
    GO
ALTER TABLE [dbo].[sales_returns] CHECK CONSTRAINT [FKfuigcg56jppxobbobdv54osrb]
    GO
ALTER TABLE [dbo].[sales_returns]  WITH CHECK ADD  CONSTRAINT [FKnth5mi9sit31nrq2qrt6865ky] FOREIGN KEY([processed_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[sales_returns] CHECK CONSTRAINT [FKnth5mi9sit31nrq2qrt6865ky]
    GO
ALTER TABLE [dbo].[shifts]  WITH CHECK ADD  CONSTRAINT [FK9xe5xhf0o3ix0r76oyutlo693] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[shifts] CHECK CONSTRAINT [FK9xe5xhf0o3ix0r76oyutlo693]
    GO
ALTER TABLE [dbo].[shifts]  WITH CHECK ADD  CONSTRAINT [FKei35fp3ok4wmodmm4yqr8e1lb] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[shifts] CHECK CONSTRAINT [FKei35fp3ok4wmodmm4yqr8e1lb]
    GO
ALTER TABLE [dbo].[shifts]  WITH CHECK ADD  CONSTRAINT [FKn3thtg5mcrx2b38m02yeju5c3] FOREIGN KEY([reconciled_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[shifts] CHECK CONSTRAINT [FKn3thtg5mcrx2b38m02yeju5c3]
    GO
ALTER TABLE [dbo].[stock_movements]  WITH CHECK ADD  CONSTRAINT [FK5nvt0t52amobvesm3m55np6cy] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[stock_movements] CHECK CONSTRAINT [FK5nvt0t52amobvesm3m55np6cy]
    GO
ALTER TABLE [dbo].[stock_movements]  WITH CHECK ADD  CONSTRAINT [FKjcaag8ogfjxpwmqypi1wfdaog] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[stock_movements] CHECK CONSTRAINT [FKjcaag8ogfjxpwmqypi1wfdaog]
    GO
ALTER TABLE [dbo].[stock_movements]  WITH CHECK ADD  CONSTRAINT [FKq7vmglv0q6axp0yq0oibo13pb] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[stock_movements] CHECK CONSTRAINT [FKq7vmglv0q6axp0yq0oibo13pb]
    GO
ALTER TABLE [dbo].[stock_movements]  WITH CHECK ADD  CONSTRAINT [FKqpfwbaxwvri2cxtahci1qjq6e] FOREIGN KEY([batch_id])
    REFERENCES [dbo].[product_batches] ([id])
    GO
ALTER TABLE [dbo].[stock_movements] CHECK CONSTRAINT [FKqpfwbaxwvri2cxtahci1qjq6e]
    GO
ALTER TABLE [dbo].[stock_requisition_details]  WITH CHECK ADD  CONSTRAINT [FKcgs5ase1wag9pxcbcukrjxct7] FOREIGN KEY([stock_requisition_id])
    REFERENCES [dbo].[stock_requisitions] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[stock_requisition_details] CHECK CONSTRAINT [FKcgs5ase1wag9pxcbcukrjxct7]
    GO
ALTER TABLE [dbo].[stock_requisition_details]  WITH CHECK ADD  CONSTRAINT [FKhntjfnaii5au1x4612kwofy10] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[stock_requisition_details] CHECK CONSTRAINT [FKhntjfnaii5au1x4612kwofy10]
    GO
ALTER TABLE [dbo].[stock_requisitions]  WITH CHECK ADD  CONSTRAINT [FK4h0tqimlhywnffrhpuvaebgic] FOREIGN KEY([approved_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[stock_requisitions] CHECK CONSTRAINT [FK4h0tqimlhywnffrhpuvaebgic]
    GO
ALTER TABLE [dbo].[stock_requisitions]  WITH CHECK ADD  CONSTRAINT [FKa8fg5o93mbay4sklry8s8xe6q] FOREIGN KEY([created_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[stock_requisitions] CHECK CONSTRAINT [FKa8fg5o93mbay4sklry8s8xe6q]
    GO
ALTER TABLE [dbo].[stock_requisitions]  WITH CHECK ADD  CONSTRAINT [FKgakisxoxnvsifjl6qr502dyaq] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[stock_requisitions] CHECK CONSTRAINT [FKgakisxoxnvsifjl6qr502dyaq]
    GO
ALTER TABLE [dbo].[supplier_quotation_details]  WITH CHECK ADD  CONSTRAINT [FKel63yu2olu3q65uiq9q4n9l4h] FOREIGN KEY([product_id])
    REFERENCES [dbo].[products] ([id])
    GO
ALTER TABLE [dbo].[supplier_quotation_details] CHECK CONSTRAINT [FKel63yu2olu3q65uiq9q4n9l4h]
    GO
ALTER TABLE [dbo].[supplier_quotation_details]  WITH CHECK ADD  CONSTRAINT [FKqcw5sb2uaf6o8cytvru043wsq] FOREIGN KEY([supplier_quotation_id])
    REFERENCES [dbo].[supplier_quotations] ([id])
    ON DELETE CASCADE
GO
ALTER TABLE [dbo].[supplier_quotation_details] CHECK CONSTRAINT [FKqcw5sb2uaf6o8cytvru043wsq]
    GO
ALTER TABLE [dbo].[supplier_quotations]  WITH CHECK ADD  CONSTRAINT [FKn2gtbxafrlyhc10ow3jqfaxwv] FOREIGN KEY([account_id])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[supplier_quotations] CHECK CONSTRAINT [FKn2gtbxafrlyhc10ow3jqfaxwv]
    GO
ALTER TABLE [dbo].[supplier_quotations]  WITH CHECK ADD  CONSTRAINT [FKpb87oyusxde4icr4jk0i4fxxc] FOREIGN KEY([rfq_id])
    REFERENCES [dbo].[rfqs] ([id])
    GO
ALTER TABLE [dbo].[supplier_quotations] CHECK CONSTRAINT [FKpb87oyusxde4icr4jk0i4fxxc]
    GO
ALTER TABLE [dbo].[supplier_quotations]  WITH CHECK ADD  CONSTRAINT [FKswndvr15shc6v9pg0ijjysnwq] FOREIGN KEY([supplier_id])
    REFERENCES [dbo].[suppliers] ([id])
    GO
ALTER TABLE [dbo].[supplier_quotations] CHECK CONSTRAINT [FKswndvr15shc6v9pg0ijjysnwq]
    GO
ALTER TABLE [dbo].[system_settings]  WITH CHECK ADD  CONSTRAINT [FKd4j3t4runjglrs7y386acm5uu] FOREIGN KEY([updated_by])
    REFERENCES [dbo].[accounts] ([id])
    GO
ALTER TABLE [dbo].[system_settings] CHECK CONSTRAINT [FKd4j3t4runjglrs7y386acm5uu]
    GO
ALTER TABLE [dbo].[warehouse_locations]  WITH CHECK ADD  CONSTRAINT [FKmwscymq59svj9jvnt064egvgm] FOREIGN KEY([store_id])
    REFERENCES [dbo].[stores] ([id])
    GO
ALTER TABLE [dbo].[warehouse_locations] CHECK CONSTRAINT [FKmwscymq59svj9jvnt064egvgm]
    GO
ALTER TABLE [dbo].[accounts]  WITH CHECK ADD CHECK  (([status]=(2) OR [status]=(1) OR [status]=(0)))
    GO
ALTER TABLE [dbo].[categories]  WITH CHECK ADD CHECK  (([status]=(1) OR [status]=(0)))
    GO
ALTER TABLE [dbo].[products]  WITH CHECK ADD CHECK  (([status]=(2) OR [status]=(1) OR [status]=(0)))
    GO
ALTER TABLE [dbo].[rfqs]  WITH CHECK ADD CHECK  (([status]>=(0) AND [status]<=(3)))
    GO
ALTER TABLE [dbo].[suppliers]  WITH CHECK ADD CHECK  (([status]=(3) OR [status]=(2) OR [status]=(1)))
    GO

/* PMS seed data only. Requires the PMS schema to exist before execution. */
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

USE [PMS];
GO

-- Preserve the seed-data normalization from the original setup script.
UPDATE dbo.purchase_requests
SET status = 1, updated_at = SYSDATETIME()
WHERE status = 0;
GO

/* =========================================================================================
   PHẦN 1: CẤU HÌNH HỆ THỐNG & CHI NHÁNH / KHO TỔNG (STORES)
   ========================================================================================= */

IF OBJECT_ID('dbo.system_settings', 'U') IS NOT NULL
BEGIN
    MERGE INTO dbo.system_settings AS target
    USING (VALUES
        ('LOW_STOCK_DEFAULT_QTY',     N'20',      N'Định mức tồn kho tối thiểu mặc định cho sản phẩm mới'),
        ('NEAR_EXPIRY_MONTHS',        N'6',       N'Cảnh báo khi hạn sử dụng còn dưới N tháng (UC46)'),
        ('MIN_SHELF_LIFE_ON_RECEIPT', N'6',       N'Quy tắc BR-03: Hạn dùng tối thiểu khi nhập kho NCC'),
        ('RETURN_WINDOW_HOURS',       N'24',      N'Quy tắc BR-06: Thời hạn tiếp nhận đổi trả thuốc'),
        ('SHIFT_DIFF_NOTE_THRESHOLD', N'50000',   N'Quy tắc BR-07: Chênh lệch tiền két cần giải trình (VNĐ)'),
        ('ADJUSTMENT_APPROVAL_VND',   N'5000000', N'Quy tắc BR-08: Giá trị điều chỉnh kho cần quản lý duyệt'),
        ('ALERT_JOB_CRON',            N'0 0 8 * * *', N'Lịch chạy tác vụ quét cảnh báo hạn dùng mỗi ngày lúc 8h sáng'),
        ('PASSWORD_RESET_MINUTES',    N'15',      N'Thời gian hết hạn của mã khôi phục mật khẩu')
    ) AS source (setting_key, setting_value, description)
    ON target.setting_key = source.setting_key
    WHEN MATCHED THEN
        UPDATE SET target.setting_value = source.setting_value, target.description = source.description
    WHEN NOT MATCHED THEN
        INSERT (setting_key, setting_value, description) VALUES (source.setting_key, source.setting_value, source.description);
END;

IF OBJECT_ID('dbo.stores', 'U') IS NOT NULL
BEGIN
    -- Dọn dẹp ràng buộc dữ liệu liên quan đến HQ (nếu có) trước khi xóa
    IF EXISTS (SELECT 1 FROM dbo.stores WHERE code = 'HQ')
    BEGIN
        DECLARE @OldHqId BIGINT = (SELECT id FROM dbo.stores WHERE code = 'HQ');
        DECLARE @DefaultWhId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
        DECLARE @DefaultSt01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');

        UPDATE dbo.accounts SET store_id = NULL WHERE store_id = @OldHqId;
        IF @DefaultSt01Id IS NOT NULL UPDATE dbo.goods_issues SET to_store_id = @DefaultSt01Id WHERE to_store_id = @OldHqId;
        IF @DefaultWhId IS NOT NULL UPDATE dbo.goods_issues SET from_store_id = @DefaultWhId WHERE from_store_id = @OldHqId;
        IF @DefaultWhId IS NOT NULL UPDATE dbo.purchase_requests SET store_id = @DefaultWhId WHERE store_id = @OldHqId;
        IF @DefaultSt01Id IS NOT NULL UPDATE dbo.stock_requisitions SET store_id = @DefaultSt01Id WHERE store_id = @OldHqId;
        DELETE FROM dbo.inventories WHERE store_id = @OldHqId;
        DELETE FROM dbo.stores WHERE id = @OldHqId;
    END

    MERGE INTO dbo.stores AS target
    USING (VALUES
        ('WH01', N'Kho Tổng Trung Tâm Miền Bắc', 2, N'Lô B2, KCN Đài Tư, 386 Nguyễn Văn Linh, Long Biên, Hà Nội', '02438759999', 1),
        ('ST01', N'Nhà Thuốc Chi Nhánh 01 - Cầu Giấy', 1, N'123 Đường Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', '02438332211', 1),
        ('ST02', N'Nhà Thuốc Chi Nhánh 02 - Đống Đa', 1, N'45 Phố Chùa Bộc, P. Quang Trung, Q. Đống Đa, Hà Nội', '02438523344', 1)
    ) AS source (code, name, type, address, phone, status)
    ON target.code = source.code
    WHEN MATCHED THEN
        UPDATE SET target.name = source.name, target.type = source.type, target.address = source.address, target.phone = source.phone, target.status = source.status
    WHEN NOT MATCHED THEN
        INSERT (code, name, type, address, phone, status, created_at) VALUES (source.code, source.name, source.type, source.address, source.phone, source.status, SYSDATETIME());
END;
GO

/* =========================================================================================
   PHẦN 2: VAI TRÒ (ROLES), QUYỀN HẠN (PERMISSIONS) & PHÂN QUYỀN
   ========================================================================================= */

MERGE INTO dbo.roles AS target
USING (VALUES
    ('ADMIN',             N'Quản trị viên hệ thống',       N'Toàn quyền quản trị tài khoản, phân quyền và danh mục hệ thống'),
    ('STORE_MANAGER',     N'Cửa hàng trưởng chi nhánh',    N'Quản lý bán hàng, ca làm việc, duyệt đề xuất và kiểm kê tại chi nhánh'),
    ('PHARMACIST',        N'Dược sĩ tư vấn & Thu ngân',   N'Thực hiện bán lẻ, quản lý giỏ hàng, mở/đóng ca và tiếp nhận thanh toán'),
    ('WAREHOUSE_MANAGER', N'Quản lý kho tổng',             N'Duyệt nhập/xuất kho, điều chuyển, kiểm kê và cảnh báo tồn kho'),
    ('WAREHOUSE_STAFF',   N'Thủ kho / Nhân viên kho',     N'Thực hiện nhập kho, phân bổ vị trí ô kệ, điều chuyển và xuất hàng'),
    ('PURCHASING_STAFF',  N'Nhân viên thu mua',           N'Lập yêu cầu mua hàng, gửi RFQ, tiếp nhận báo giá và theo dõi đơn hàng'),
    ('GENERAL_MANAGER',   N'Tổng giám đốc điều hành',      N'Xem báo cáo kinh doanh, báo cáo tài chính và duyệt đơn đặt hàng lớn')
) AS source (code, name, description)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.name = source.name, target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (code, name, description) VALUES (source.code, source.name, source.description);

MERGE INTO dbo.permissions AS target
USING (VALUES
    ('USER_VIEW',             'USER',             N'Xem danh sách người dùng'),
    ('USER_CREATE',           'USER',             N'Tạo người dùng mới'),
    ('USER_UPDATE',           'USER',             N'Cập nhật thông tin người dùng'),
    ('USER_LOCK',             'USER',             N'Khóa/mở khóa tài khoản'),
    ('USER_ASSIGN_ROLE',      'USER',             N'Phân vai trò cho người dùng'),
    ('AUDIT_VIEW',            'USER',             N'Xem nhật ký kiểm toán hệ thống'),
    ('PRODUCT_VIEW',          'PRODUCT',          N'Xem danh mục và thông tin sản phẩm'),
    ('PRODUCT_CREATE',        'PRODUCT',          N'Thêm sản phẩm mới vào danh mục'),
    ('PRODUCT_UPDATE',        'PRODUCT',          N'Chỉnh sửa thông tin sản phẩm'),
    ('PRICE_MANAGE',          'PRODUCT',          N'Thiết lập và điều chỉnh giá bán'),
    ('PRICE_HISTORY_VIEW',    'PRODUCT',          N'Xem lịch sử thay đổi giá bán'),
    ('CATEGORY_VIEW',         'CATEGORY',         N'Xem danh mục nhóm sản phẩm'),
    ('CATEGORY_CREATE',       'CATEGORY',         N'Tạo nhóm danh mục mới'),
    ('CATEGORY_UPDATE',       'CATEGORY',         N'Cập nhật nhóm danh mục'),
    ('CATEGORY_DELETE',       'CATEGORY',         N'Xóa nhóm danh mục'),
    ('SHIFT_OPEN',            'SHIFT',            N'Mở ca làm việc tại quầy POS'),
    ('SHIFT_CLOSE',           'SHIFT',            N'Đóng ca làm việc và kết toán tiền mặt'),
    ('INVOICE_CREATE',        'SALES',            N'Tạo hóa đơn bán lẻ thuốc tại quầy'),
    ('PAYMENT_PROCESS',       'SALES',            N'Thực hiện thanh toán đơn hàng'),
    ('INVOICE_CANCEL',        'SALES',            N'Hủy hóa đơn bán lẻ'),
    ('INVOICE_VIEW',          'SALES',            N'Xem lịch sử hóa đơn bán lẻ'),
    ('SALES_DAILY_VIEW',      'SALES',            N'Xem báo cáo doanh thu theo ngày'),
    ('SALES_RECONCILE',       'SALES',            N'Đối soát và điều chỉnh doanh thu ngày'),
    ('CUSTOMER_VIEW',         'CUSTOMER',         N'Xem danh sách khách hàng & tiền sử bệnh'),
    ('CUSTOMER_CREATE',       'CUSTOMER',         N'Tạo hồ sơ khách hàng mới'),
    ('CUSTOMER_UPDATE',       'CUSTOMER',         N'Cập nhật thông tin và tiền sử bệnh khách hàng'),
    ('CUSTOMER_DELETE',       'CUSTOMER',         N'Vô hiệu hóa hồ sơ khách hàng'),
    ('STORE_INVENTORY_VIEW',  'STORE_INVENTORY',  N'Xem tồn kho tại chi nhánh'),
    ('STORE_AUDIT_REVIEW',    'STORE_INVENTORY',  N'Duyệt kết quả kiểm kê chi nhánh'),
    ('REQUISITION_CREATE',    'STORE_INVENTORY',  N'Tạo phiếu yêu cầu điều chuyển hàng từ kho tổng'),
    ('REQUISITION_VIEW',      'STORE_INVENTORY',  N'Xem danh sách phiếu yêu cầu điều chuyển'),
    ('REQUISITION_UPDATE',    'STORE_INVENTORY',  N'Chỉnh sửa phiếu yêu cầu điều chuyển'),
    ('GOODS_RECEIPT_VIEW',    'STORE_INVENTORY',  N'Xem danh sách phiếu nhận hàng điều chuyển'),
    ('GOODS_RECEIPT_CONFIRM', 'STORE_INVENTORY',  N'Xác nhận nhập hàng vào kho chi nhánh'),
    ('WH_INVENTORY_VIEW',     'WAREHOUSE',        N'Xem tồn kho tổng theo lô FEFO & vị trí ô kệ'),
    ('WH_PURCHASE_HISTORY',   'WAREHOUSE',        N'Xem lịch sử nhập kho hàng hóa'),
    ('WH_ASSIGN_LOCATION',    'WAREHOUSE',        N'Gán và điều chỉnh vị trí ô kệ lưu trữ'),
    ('WH_ADJUSTMENT_CREATE',  'WAREHOUSE',        N'Tạo phiếu kiểm kê điều chỉnh kho'),
    ('WH_ADJUSTMENT_APPROVE', 'WAREHOUSE',        N'Duyệt / Từ chối phiếu điều chỉnh tồn kho'),
    ('WH_LOW_STOCK_ALERT',    'WAREHOUSE',        N'Xem cảnh báo thuốc sắp hết hàng'),
    ('WH_EXPIRY_ALERT',       'WAREHOUSE',        N'Xem cảnh báo thuốc cận hạn & hết hạn'),
    ('WH_PURCHASE_REQUEST',   'WAREHOUSE',        N'Quản lý yêu cầu mua hàng phục vụ kho'),
    ('WH_REPLENISHMENT_VIEW', 'WAREHOUSE',        N'Xem yêu cầu điều chuyển từ các cửa hàng'),
    ('WH_REPLENISHMENT_APPROVE','WAREHOUSE',      N'Duyệt yêu cầu điều chuyển hàng'),
    ('WH_REPLENISHMENT_REJECT','WAREHOUSE',       N'Từ chối yêu cầu điều chuyển hàng'),
    ('WH_DISPATCH_CONFIRM',   'WAREHOUSE',        N'Xác nhận xuất kho điều chuyển theo FEFO'),
    ('WH_RECEIPT_CREATE',     'WAREHOUSE',        N'Tạo phiếu nhập kho mua hàng từ NCC'),
    ('WH_RECEIPT_CONFIRM',    'WAREHOUSE',        N'Xác nhận nhập kho & tăng tồn kho theo lô'),
    ('PROC_REQUEST_VIEW',     'PROCUREMENT',      N'Xem danh sách yêu cầu mua hàng'),
    ('PROC_REQUEST_CREATE',   'PROCUREMENT',      N'Tạo mới yêu cầu mua hàng'),
    ('PROC_PROPOSAL_MANAGE',  'PROCUREMENT',      N'Tạo và theo dõi đề xuất mua hàng tổng hợp'),
    ('PROC_PROPOSAL_APPROVE', 'PROCUREMENT',      N'Duyệt đề xuất mua hàng và đơn đặt hàng PO'),
    ('PROC_RFQ_MANAGE',       'PROCUREMENT',      N'Gửi RFQ và tiếp nhận báo giá từ NCC'),
    ('REPORT_VIEW_ALL',       'REPORT',           N'Xem báo cáo tồn kho và báo cáo doanh thu lợi nhuận')
) AS source (code, module, description)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.module = source.module, target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (code, module, description) VALUES (source.code, source.module, source.description);

-- Gán quyền cho các vai trò
DECLARE @RolePermMap TABLE (role_code VARCHAR(30), perm_code VARCHAR(40));

-- ADMIN: Toàn quyền
INSERT INTO @RolePermMap
SELECT 'ADMIN', code FROM dbo.permissions;

-- STORE_MANAGER:
INSERT INTO @RolePermMap VALUES
('STORE_MANAGER', 'USER_VIEW'),
('STORE_MANAGER', 'PRODUCT_VIEW'),
('STORE_MANAGER', 'PRICE_HISTORY_VIEW'),
('STORE_MANAGER', 'CATEGORY_VIEW'),
('STORE_MANAGER', 'SHIFT_OPEN'),
('STORE_MANAGER', 'SHIFT_CLOSE'),
('STORE_MANAGER', 'INVOICE_CREATE'),
('STORE_MANAGER', 'PAYMENT_PROCESS'),
('STORE_MANAGER', 'INVOICE_CANCEL'),
('STORE_MANAGER', 'INVOICE_VIEW'),
('STORE_MANAGER', 'SALES_DAILY_VIEW'),
('STORE_MANAGER', 'SALES_RECONCILE'),
('STORE_MANAGER', 'CUSTOMER_VIEW'),
('STORE_MANAGER', 'CUSTOMER_CREATE'),
('STORE_MANAGER', 'CUSTOMER_UPDATE'),
('STORE_MANAGER', 'STORE_INVENTORY_VIEW'),
('STORE_MANAGER', 'STORE_AUDIT_REVIEW'),
('STORE_MANAGER', 'REQUISITION_CREATE'),
('STORE_MANAGER', 'REQUISITION_VIEW'),
('STORE_MANAGER', 'REQUISITION_UPDATE'),
('STORE_MANAGER', 'GOODS_RECEIPT_VIEW'),
('STORE_MANAGER', 'GOODS_RECEIPT_CONFIRM'),
('STORE_MANAGER', 'REPORT_VIEW_ALL');

-- PHARMACIST:
INSERT INTO @RolePermMap VALUES
('PHARMACIST', 'PRODUCT_VIEW'),
('PHARMACIST', 'CATEGORY_VIEW'),
('PHARMACIST', 'SHIFT_OPEN'),
('PHARMACIST', 'SHIFT_CLOSE'),
('PHARMACIST', 'INVOICE_CREATE'),
('PHARMACIST', 'PAYMENT_PROCESS'),
('PHARMACIST', 'INVOICE_VIEW'),
('PHARMACIST', 'CUSTOMER_VIEW'),
('PHARMACIST', 'CUSTOMER_CREATE'),
('PHARMACIST', 'CUSTOMER_UPDATE'),
('PHARMACIST', 'STORE_INVENTORY_VIEW');

-- WAREHOUSE_MANAGER & WAREHOUSE_STAFF:
INSERT INTO @RolePermMap VALUES
('WAREHOUSE_MANAGER', 'PRODUCT_VIEW'),
('WAREHOUSE_MANAGER', 'CATEGORY_VIEW'),
('WAREHOUSE_MANAGER', 'WH_INVENTORY_VIEW'),
('WAREHOUSE_MANAGER', 'WH_PURCHASE_HISTORY'),
('WAREHOUSE_MANAGER', 'WH_ASSIGN_LOCATION'),
('WAREHOUSE_MANAGER', 'WH_ADJUSTMENT_CREATE'),
('WAREHOUSE_MANAGER', 'WH_ADJUSTMENT_APPROVE'),
('WAREHOUSE_MANAGER', 'WH_LOW_STOCK_ALERT'),
('WAREHOUSE_MANAGER', 'WH_EXPIRY_ALERT'),
('WAREHOUSE_MANAGER', 'WH_PURCHASE_REQUEST'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_VIEW'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_APPROVE'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_REJECT'),
('WAREHOUSE_MANAGER', 'WH_DISPATCH_CONFIRM'),
('WAREHOUSE_MANAGER', 'WH_RECEIPT_CREATE'),
('WAREHOUSE_MANAGER', 'WH_RECEIPT_CONFIRM'),
('WAREHOUSE_MANAGER', 'REPORT_VIEW_ALL'),

('WAREHOUSE_STAFF', 'PRODUCT_VIEW'),
('WAREHOUSE_STAFF', 'WH_INVENTORY_VIEW'),
('WAREHOUSE_STAFF', 'WH_ASSIGN_LOCATION'),
('WAREHOUSE_STAFF', 'WH_ADJUSTMENT_CREATE'),
('WAREHOUSE_STAFF', 'WH_DISPATCH_CONFIRM'),
('WAREHOUSE_STAFF', 'WH_RECEIPT_CREATE');

-- PURCHASING_STAFF:
INSERT INTO @RolePermMap VALUES
('PURCHASING_STAFF', 'PRODUCT_VIEW'),
('PURCHASING_STAFF', 'PRICE_MANAGE'),
('PURCHASING_STAFF', 'PROC_REQUEST_VIEW'),
('PURCHASING_STAFF', 'PROC_REQUEST_CREATE'),
('PURCHASING_STAFF', 'PROC_PROPOSAL_MANAGE'),
('PURCHASING_STAFF', 'PROC_RFQ_MANAGE');

-- GENERAL_MANAGER:
INSERT INTO @RolePermMap VALUES
('GENERAL_MANAGER', 'PRODUCT_VIEW'),
('GENERAL_MANAGER', 'PRICE_MANAGE'),
('GENERAL_MANAGER', 'PROC_PROPOSAL_APPROVE'),
('GENERAL_MANAGER', 'REPORT_VIEW_ALL');

-- Insert phân quyền vào bảng role_permissions
INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM @RolePermMap m
JOIN dbo.roles r ON r.code = m.role_code
JOIN dbo.permissions p ON p.code = m.perm_code
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
GO

/* =========================================================================================
   PHẦN 3: TÀI KHOẢN NGƯỜI DÙNG (ACCOUNTS) & HỒ SƠ NHÂN VIÊN
   Mật khẩu chung cho tất cả tài khoản kiểm thử: Password@123
   BCrypt: $2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W
   ========================================================================================= */

DECLARE @AdminRoleId       INT = (SELECT id FROM dbo.roles WHERE code = 'ADMIN');
DECLARE @StoreManagerRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'STORE_MANAGER');
DECLARE @PharmacistRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PHARMACIST');
DECLARE @WarehouseMgrRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_MANAGER');
DECLARE @WarehouseStaffRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_STAFF');
DECLARE @PurchasingRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PURCHASING_STAFF');
DECLARE @GmRoleId           INT = (SELECT id FROM dbo.roles WHERE code = 'GENERAL_MANAGER');

DECLARE @WhId   BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
DECLARE @St01Id BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST01');

DECLARE @AccountData TABLE (
    username VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(20),
    role_id INT,
    store_id BIGINT,
    status TINYINT,
    full_name NVARCHAR(150),
    dob DATE,
    gender TINYINT,
    address NVARCHAR(250),
    avatar_url VARCHAR(500)
);

INSERT INTO @AccountData VALUES
('admin', 'admin@pharmacy.com', '0901234567', @AdminRoleId, NULL, 1, N'Quản Trị Viên Hệ Thống', '1988-05-15', 1, N'Tầng 10, Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('pharmacist_hn01', 'pharmacist1@pharmacy.com', '0912345678', @PharmacistRoleId, @St01Id, 1, N'Nguyễn Văn Dược', '1995-10-20', 1, N'Số 45 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Hà Nội', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
('pharmacist1', 'pharmacist_alt@pharmacy.com', '0912999888', @PharmacistRoleId, @St01Id, 1, N'Đỗ Minh Ngọc', '1998-03-12', 0, N'Số 12 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('manager_hn01', 'manager1@pharmacy.com', '0922345678', @StoreManagerRoleId, @St01Id, 1, N'Trần Thị Hương', '1990-08-25', 0, N'Tòa Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('warehouse01', 'warehouse1@pharmacy.com', '0932345678', @WarehouseStaffRoleId, @WhId, 1, N'Lê Văn Kho', '1993-12-05', 1, N'Số 88 Sài Đồng, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('wh_manager01', 'wh_manager1@pharmacy.com', '0942345678', @WarehouseMgrRoleId, @WhId, 1, N'Phạm Đình Quân', '1987-04-18', 1, N'Số 22 Phúc Lợi, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('purchasing01', 'purchasing1@pharmacy.com', '0952345678', @PurchasingRoleId, NULL, 1, N'Vũ Hoàng Nam', '1992-07-22', 1, N'Số 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
('gm01', 'gm@pharmacy.com', '0962345678', @GmRoleId, NULL, 1, N'Bùi Quang Huy', '1980-01-10', 1, N'Khu đô thị Ciputra, Tây Hồ, Hà Nội', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
('locked_user', 'locked@pharmacy.com', '0972345678', @PharmacistRoleId, @St01Id, 2, N'Tài Khoản Đã Bị Khóa', '1999-01-01', 1, N'Hà Nội', NULL),
('inactive_user', 'inactive@pharmacy.com', '0982345678', @PharmacistRoleId, @St01Id, 0, N'Tài Khoản Vô Hiệu Hóa', '1999-02-02', 0, N'Hà Nội', NULL);

MERGE INTO dbo.accounts AS target
USING @AccountData AS source
ON target.username = source.username
WHEN MATCHED THEN
    UPDATE SET 
        target.email = source.email,
        target.phone = source.phone,
        target.role_id = source.role_id,
        target.store_id = source.store_id,
        target.status = source.status,
        target.password = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W',
        target.failed_login_count = 0
WHEN NOT MATCHED THEN
    INSERT (username, email, phone, role_id, store_id, status, [password], failed_login_count, created_at)
    VALUES (source.username, source.email, source.phone, source.role_id, source.store_id, source.status,
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 0, SYSDATETIME());

MERGE INTO dbo.account_informations AS target
USING (
    SELECT a.id AS account_id, src.full_name, src.dob, src.gender, src.address, src.avatar_url
    FROM @AccountData src
    JOIN dbo.accounts a ON a.username = src.username
) AS source
ON target.account_id = source.account_id
WHEN MATCHED THEN
    UPDATE SET 
        target.full_name = source.full_name,
        target.date_of_birth = source.dob,
        target.gender = source.gender,
        target.address = source.address,
        target.avatar_url = source.avatar_url
WHEN NOT MATCHED THEN
    INSERT (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (source.account_id, source.full_name, source.dob, source.gender, source.address, source.avatar_url);
GO

/* =========================================================================================
   PHẦN 4: NHÀ CUNG CẤP & VỊ TRÍ Ô KỆ KHO TỔNG (LOCATIONS)
   ========================================================================================= */

MERGE INTO dbo.suppliers AS target
USING (VALUES
    ('SUP-DHG',      N'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', N'Nguyễn Văn Hùng', '02923891433', 'dhgpharma@dhgpharma.com.vn', N'288 Bis Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ', '1800156801', 1, N'Nhà sản xuất dược phẩm đạt chuẩn GMP-Japan/WHO hàng đầu VN'),
    ('SUP-TRAPHACO', N'Công ty Cổ phần Traphaco',                   N'Trần Thị Mai',    '02437341797', 'info@traphaco.com.vn',       N'Số 75 Phố Yên Ninh, Ba Đình, Hà Nội',                      '0100108656', 1, N'Thương hiệu thuốc đông dược, thuốc thảo dược và ho bổ phế số 1 VN'),
    ('SUP-IMEX',     N'Công ty Cổ phần Dược phẩm Imexpharm',        N'Lê Minh Tuấn',    '02773851941', 'imexpharm@imexpharm.com',    N'Số 4 Đường 30/4, P. 1, TP. Cao Lãnh, Đồng Tháp',           '1400384433', 1, N'Chuyên sản xuất kháng sinh cao cấp đạt tiêu chuẩn EU-GMP'),
    ('SUP-HATAP',    N'Công ty Cổ phần Dược phẩm Hà Tây (Hataphar)',N'Phạm Quang Thắng', '02433522203', 'hataphar@hn.vnn.vn',        N'Số 10A Phố Quang Trung, Hà Đông, Hà Nội',                  '0500105312', 1, N'Nhà sản xuất các loại thuốc thiết yếu, hạ sốt giảm đau phổ biến'),
    ('SUP-SANOFI',   N'Công ty TNHH Sanofi-Aventis Việt Nam',       N'Vũ Bích Ngọc',    '02838298526', 'contact-vn@sanofi.com',      N'Lô I-8-1, Đường D8, Khu Công Nghệ Cao, Q. 9, TP.HCM',      '0300823528', 1, N'Tập đoàn dược phẩm đa quốc gia hàng đầu về tiêu hóa và tim mạch'),
    ('SUP-GSK',      N'GlaxoSmithKline (GSK) Việt Nam',             N'David Harrison',  '02839102860', 'vietnam.contact@gsk.com',    N'Tầng 16, Tòa nhà Metropolitan, 235 Đồng Khởi, Q. 1, TP.HCM', '0303867123', 1, N'Hãng dược phẩm phát minh hàng đầu thế giới (Panadol, Augmentin)'),
    ('SUP-ASTRA',    N'AstraZeneca Việt Nam',                       N'Trần Anh Thư',    '02838221666', 'astrazeneca@astra.com.vn',    N'Tòa nhà Deutsches Haus, 33 Lê Duẩn, Q. 1, TP.HCM',         '0302243209', 1, N'Hãng dược phẩm phát minh sinh phẩm y tế & tim mạch')
) AS source (code, name, contact_person, phone, email, address, tax_code, status, note)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.name = source.name, target.contact_person = source.contact_person, target.phone = source.phone, target.email = source.email, target.address = source.address, target.tax_code = source.tax_code, target.status = source.status, target.note = source.note
WHEN NOT MATCHED THEN
    INSERT (code, name, contact_person, phone, email, address, tax_code, status, note, created_at)
    VALUES (source.code, source.name, source.contact_person, source.phone, source.email, source.address, source.tax_code, source.status, source.note, SYSDATETIME());

-- Nạp 36 vị trí ô kệ kho tổng WH01 (Định dạng chuẩn: Dãy-Kệ-Hộc, hoàn toàn không có LOC-)
DECLARE @Wh01Id BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
IF @Wh01Id IS NOT NULL AND OBJECT_ID('dbo.warehouse_locations', 'U') IS NOT NULL
BEGIN
    -- Xóa các vị trí cũ không chuẩn (LOC-)
    DELETE FROM dbo.inventories WHERE location_id IN (SELECT id FROM dbo.warehouse_locations WHERE code LIKE 'LOC-%');
    DELETE FROM dbo.purchase_receipt_details WHERE location_id IN (SELECT id FROM dbo.warehouse_locations WHERE code LIKE 'LOC-%');
    DELETE FROM dbo.warehouse_locations WHERE code LIKE 'LOC-%';

    MERGE INTO dbo.warehouse_locations AS target
    USING (VALUES
        -- Dãy A: Giảm đau, hạ sốt, kháng viêm
        ('A-01-01', 'A', '01', '01', @Wh01Id, 1),
        ('A-01-02', 'A', '01', '02', @Wh01Id, 1),
        ('A-01-03', 'A', '01', '03', @Wh01Id, 1),
        ('A-01-04', 'A', '01', '04', @Wh01Id, 1),
        ('A-02-01', 'A', '02', '01', @Wh01Id, 1),
        ('A-02-02', 'A', '02', '02', @Wh01Id, 1),
        ('A-02-03', 'A', '02', '03', @Wh01Id, 1),
        ('A-02-04', 'A', '02', '04', @Wh01Id, 1),

        -- Dãy B: Kháng sinh, kháng nấm
        ('B-01-01', 'B', '01', '01', @Wh01Id, 1),
        ('B-01-02', 'B', '01', '02', @Wh01Id, 1),
        ('B-01-03', 'B', '01', '03', @Wh01Id, 1),
        ('B-01-04', 'B', '01', '04', @Wh01Id, 1),
        ('B-02-01', 'B', '02', '01', @Wh01Id, 1),
        ('B-02-02', 'B', '02', '02', @Wh01Id, 1),
        ('B-02-03', 'B', '02', '03', @Wh01Id, 1),
        ('B-02-04', 'B', '02', '04', @Wh01Id, 1),

        -- Dãy C: Tiêu hóa, dạ dày, đại tràng
        ('C-01-01', 'C', '01', '01', @Wh01Id, 1),
        ('C-01-02', 'C', '01', '02', @Wh01Id, 1),
        ('C-01-03', 'C', '01', '03', @Wh01Id, 1),
        ('C-01-04', 'C', '01', '04', @Wh01Id, 1),
        ('C-02-01', 'C', '02', '01', @Wh01Id, 1),
        ('C-02-02', 'C', '02', '02', @Wh01Id, 1),
        ('C-02-03', 'C', '02', '03', @Wh01Id, 1),

        -- Dãy D: Tim mạch, huyết áp, chuyển hóa
        ('D-01-01', 'D', '01', '01', @Wh01Id, 1),
        ('D-01-02', 'D', '01', '02', @Wh01Id, 1),
        ('D-01-03', 'D', '01', '03', @Wh01Id, 1),
        ('D-02-01', 'D', '02', '01', @Wh01Id, 1),
        ('D-02-02', 'D', '02', '02', @Wh01Id, 1),

        -- Dãy E: Hô hấp, cảm cúm, dị ứng
        ('E-01-01', 'E', '01', '01', @Wh01Id, 1),
        ('E-01-02', 'E', '01', '02', @Wh01Id, 1),
        ('E-01-03', 'E', '01', '03', @Wh01Id, 1),
        ('E-02-01', 'E', '02', '01', @Wh01Id, 1),
        ('E-02-02', 'E', '02', '02', @Wh01Id, 1),

        -- Dãy COOL: Kho lạnh (2-8 độ C) - Vaccine, men vi sinh, sinh phẩm
        ('COOL-01-01', 'COOL', '01', '01', @Wh01Id, 1),
        ('COOL-01-02', 'COOL', '01', '02', @Wh01Id, 1),
        ('COOL-02-01', 'COOL', '02', '01', @Wh01Id, 1),
        ('COOL-02-02', 'COOL', '02', '02', @Wh01Id, 1)
    ) AS source(code, aisle, shelf, bin, store_id, status)
    ON target.code = source.code
    WHEN MATCHED THEN
        UPDATE SET target.aisle = source.aisle, target.shelf = source.shelf, target.bin = source.bin, target.store_id = source.store_id, target.status = source.status
    WHEN NOT MATCHED THEN
        INSERT (code, aisle, shelf, bin, store_id, status)
        VALUES (source.code, source.aisle, source.shelf, source.bin, source.store_id, source.status);
END;
GO
/* =========================================================================================
   PHẦN 5: DANH MỤC NHÓM THUỐC (CATEGORIES) & SẢN PHẨM (PRODUCTS & PRICE HISTORIES)
   ========================================================================================= */

DECLARE @AdminId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'admin');

DECLARE @CategoryData TABLE (name NVARCHAR(150), description NVARCHAR(500));
INSERT INTO @CategoryData VALUES
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', N'Các loại thuốc giảm đau thông thường (Paracetamol), kháng viêm không steroid (NSAIDs) và hạ sốt cho người lớn & trẻ em'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', N'Các nhóm kháng sinh kê đơn (Rx) như Penicillin, Cephalosporin, Macrolide, Quinolone điều trị nhiễm khuẩn'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', N'Thuốc điều trị loét dạ dày (PPI), trung hòa acid, men tiêu hóa, men vi sinh và thuốc tiêu chảy'),
(N'Thuốc Tim Mạch & Huyết Áp', N'Thuốc kê đơn điều trị tăng huyết áp, hạ mỡ máu và trợ tim'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', N'Siro ho, viên ngậm thảo dược bổ phế, long đờm và chế phẩm đặc trị cảm cúm'),
(N'Thuốc Dị Ứng & Kháng Histamin', N'Các thuốc kháng histamin thế hệ mới điều trị viêm mũi dị ứng, mày đay, mẩn ngứa'),
(N'Thuốc Da Liễu & Trị Mụn', N'Các loại kem bôi ngoài da, thuốc mỡ kháng khuẩn, kem trị mụn và nấm da'),
(N'Thuốc Nhãn Khoa & Tai Mũi Họng', N'Thuốc nhỏ mắt, nước mắt nhân tạo, dung dịch xịt mũi co mạch'),
(N'Vitamin, Khoáng Chất & Dinh Dưỡng', N'Viên sủi tăng đề kháng, canxi, vitamin tổng hợp, kẽm và khoáng chất thiết yếu'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', N'Dầu cá Omega-3, viên bổ xương khớp Glucosamine và thực phẩm chức năng hỗ trợ sức khỏe'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', N'Băng dán y tế, cồn sát khuẩn, nước muối sinh lý, nhiệt kế điện tử, khẩu trang y tế');

MERGE INTO dbo.categories AS target
USING @CategoryData AS source
ON target.name = source.name
WHEN MATCHED THEN
    UPDATE SET target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (name, description, status, created_by, created_at)
    VALUES (source.name, source.description, 1, @AdminId, SYSDATETIME());

-- Dọn dẹp danh mục rác / trùng lặp lỗi font không có sản phẩm nào tham chiếu
DELETE FROM dbo.categories WHERE id >= 17 AND id NOT IN (SELECT DISTINCT category_id FROM dbo.products WHERE category_id IS NOT NULL);

-- Nạp 30+ sản phẩm y tế
DECLARE @ProductData TABLE (
    category_name NVARCHAR(150),
    barcode VARCHAR(50),
    name NVARCHAR(200),
    unit NVARCHAR(30),
    active_ingredient NVARCHAR(250),
    manufacturer NVARCHAR(150),
    is_prescription BIT,
    cost_price DECIMAL(18,2),
    selling_price DECIMAL(18,2),
    min_quantity INT,
    description NVARCHAR(500)
);

INSERT INTO @ProductData VALUES
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890123', N'Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)', N'Hộp', N'Paracetamol 500mg, Caffeine 65mg', N'GSK Consumer Healthcare', 0, 165000.00, 195000.00, 40, N'Thuốc giảm đau nhanh cho các cơn đau đầu, đau răng, hạ sốt hiệu quả.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890124', N'Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Paracetamol 500mg', N'Dược phẩm Hà Tây (Hataphar)', 0, 45000.00, 60000.00, 50, N'Thuốc hạ sốt, giảm đau thông thường không gây kích ứng dạ dày.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890133', N'Efferalgan 500mg (Hộp 4 vỉ x 4 viên sủi)', N'Hộp', N'Paracetamol 500mg', N'UPSA SAS (Pháp)', 0, 60000.00, 78000.00, 30, N'Viên sủi tác dụng giảm đau hạ sốt nhanh, hòa tan hoàn toàn trong nước.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890134', N'Mobic 7.5mg (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Meloxicam 7.5mg', N'Boehringer Ingelheim', 1, 155000.00, 185000.00, 20, N'Thuốc kháng viêm không steroid (NSAID) kê đơn dùng cho viêm khớp mạn tính.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890135', N'Hapacol 250 Trẻ Em Vị Cam (Hộp 24 gói)', N'Hộp', N'Paracetamol 250mg', N'DHG Pharma', 0, 42000.00, 55000.00, 35, N'Bột sủi hương cam dịu ngọt hạ sốt cho trẻ từ 2 đến 6 tuổi.'),

(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890125', N'Augmentin 1g (Hộp 14 viên)', N'Hộp', N'Amoxicillin 875mg, Acid Clavulanic 125mg', N'GlaxoSmithKline (GSK)', 1, 215000.00, 260000.00, 30, N'Kháng sinh phổ rộng điều trị nhiễm khuẩn đường hô hấp, nhiễm khuẩn da.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890126', N'Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Amoxicillin trihydrate 500mg', N'DHG Pharma', 1, 65000.00, 85000.00, 40, N'Kháng sinh nhóm penicillin điều trị nhiễm trùng do vi khuẩn nhạy cảm.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890136', N'Cefixim 200mg DHG (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Cefixim 200mg', N'DHG Pharma', 1, 72000.00, 95000.00, 25, N'Kháng sinh Cephalosporin thế hệ 3 điều trị viêm phế quản, viêm tai giữa.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890137', N'Zithromax 500mg (Hộp 1 vỉ x 3 viên)', N'Hộp', N'Azithromycin dihydrate 500mg', N'Pfizer (Mỹ)', 1, 135000.00, 165000.00, 20, N'Kháng sinh nhóm Macrolide liều ngắn ngày cho nhiễm trùng hô hấp.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890138', N'Ciprofloxacin 500mg Vidipha (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Ciprofloxacin 500mg', N'Vidipha', 1, 85000.00, 110000.00, 25, N'Kháng sinh Quinolone điều trị nhiễm khuẩn đường tiết niệu, đường tiêu hóa.'),

(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890127', N'Nexium Mups 40mg (Hộp 14 viên)', N'Hộp', N'Esomeprazole magnesium trihydrate 40mg', N'AstraZeneca', 1, 295000.00, 350000.00, 25, N'Thuốc ức chế bơm proton (PPI) điều trị trào ngược dạ dày thực quản (GERD).'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890128', N'Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)', N'Hộp', N'Natri alginate, Natri bicarbonat, Calci carbonat', N'Reckitt Benckiser', 0, 110000.00, 135000.00, 40, N'Lớp gel bảo vệ thực quản ngăn ngừa trào ngược acid và chứng ợ chua nóng rát.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890139', N'Phosphalugel Thuốc Dạ Dày Chữ P (Hộp 26 gói x 20g)', N'Hộp', N'Nhôm phosphat gel 20%', N'Sanofi Aventis', 0, 98000.00, 120000.00, 50, N'Hỗn dịch kháng acid làm dịu nhanh cơn đau do viêm dạ dày cấp và mãn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890140', N'Smecta 3g Vị Vani (Hộp 30 gói)', N'Hộp', N'Diosmectite 3g', N'Ipsen Pharma', 0, 120000.00, 145000.00, 40, N'Bột pha uống bảo vệ niêm mạc ruột và điều trị tiêu chảy cấp & mạn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890141', N'Men vi sinh Enterogermina 2 tỷ bào tử (Hộp 20 ống x 5ml)', N'Hộp', N'Bacillus clausii 2 tỷ bào tử', N'Sanofi Aventis', 0, 145000.00, 175000.00, 45, N'Bào tử men vi sinh phục hồi hệ vi sinh đường ruột do dùng kháng sinh dài ngày.'),

(N'Thuốc Tim Mạch & Huyết Áp', '8934567890129', N'Amlodipine 5mg Stada (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Amlodipine besylate 5mg', N'Stada', 1, 22000.00, 30000.00, 30, N'Thuốc chẹn kênh canxi điều trị tăng huyết áp và đau thắt ngực ổn định.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890142', N'Concor 5mg (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Bisoprolol fumarate 5mg', N'Merck Healthcare', 1, 180000.00, 225000.00, 20, N'Thuốc chẹn thụ thể beta chọn lọc điều trị tăng huyết áp và suy tim mạn tính.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890143', N'Micardis 40mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Telmisartan 40mg', N'Boehringer Ingelheim', 1, 230000.00, 280000.00, 20, N'Thuốc đối kháng thụ thể angiotensin II hạ huyết áp và phòng ngừa biến cố tim mạch.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890144', N'Lipitor 20mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Atorvastatin calcium 20mg', N'Pfizer', 1, 410000.00, 495000.00, 15, N'Thuốc điều hòa lipid máu nhóm statin hạ cholesterol máu và triglyceride.'),

(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890145', N'Siro Ho Prospan Chai 100ml', N'Chai', N'Cao khô lá thường xuân', N'Engelhard Arzneimittel (Đức)', 0, 95000.00, 125000.00, 35, N'Siro thảo dược trị ho phế quản, viêm đường hô hấp cấp, dùng an toàn cho trẻ sơ sinh.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890146', N'Viên ngậm ho Bảo Thanh (Hộp 20 vỉ x 5 viên)', N'Hộp', N'Ô mai, Mật ong, Tỳ bà diệp, Xuyên bối mẫu', N'Dược phẩm Hoa Linh', 0, 110000.00, 140000.00, 40, N'Viên ngậm bổ phế, nhuận phế, giảm ngứa rát cổ họng do ho khan, ho gió.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890147', N'Decolgen Cảm Cúm (Hộp 25 vỉ x 4 viên)', N'Hộp', N'Paracetamol, Phenylephrine, Chlorpheniramine', N'United Pharma', 0, 90000.00, 115000.00, 30, N'Thuốc điều trị triệu chứng cảm cúm, nhức đầu, sốt, nghẹt mũi và hắt hơi.'),

(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890131', N'Telfast HD 180mg (Hộp 1 vỉ x 10 viên)', N'Hộp', N'Fexofenadine HCl 180mg', N'Sanofi Aventis', 0, 72000.00, 90000.00, 30, N'Kháng histamin thế hệ 2 không gây buồn ngủ, trị viêm mũi dị ứng và mề đay.'),
(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890149', N'Cetirizin 10mg Stada (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Cetirizin dihydroclorid 10mg', N'Stada', 0, 40000.00, 55000.00, 30, N'Thuốc chống dị ứng điều trị các chứng viêm kết mạc dị ứng, ngứa da do phát ban.'),

(N'Vitamin, Khoáng Chất & Dinh Dưỡng', '8934567890130', N'Viên sủi Berocca Performance Vị Xoài (Tuýp 10 viên)', N'Tuýp', N'Vitamin nhóm B tổng hợp, Vitamin C, Kẽm, Magiê', N'Bayer Pharma', 0, 75000.00, 95000.00, 30, N'Viên sủi bổ sung năng lượng, hỗ trợ tỉnh táo tập trung và tăng cường sức đề kháng.'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', '8934567890132', N'Viên uống Dầu cá Omega 3 Fish Oil (Chai 100 viên)', N'Chai', N'EPA 180mg, DHA 120mg, Dầu cá tinh khiết', N'Blackmores (Úc)', 0, 380000.00, 480000.00, 25, N'Cung cấp acid béo Omega 3 tự nhiên hỗ trợ sức khỏe tim mạch, não bộ và thị lực.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890156', N'Nước muối sinh lý Natri Clorid 0.9% (Chai 500ml)', N'Chai', N'Natri clorid 0.9% đẳng trương', N'Dược phẩm Pharmedic', 0, 5000.00, 8000.00, 100, N'Dung dịch rửa vết thương, súc miệng vệ sinh họng và rửa mũi an toàn.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890157', N'Băng dán y tế cá nhân Urgo Waterproof (Hộp 20 miếng)', N'Hộp', N'Màng PU chống nước vô trùng', N'Urgo Healthcare', 0, 28000.00, 38000.00, 50, N'Băng dán cá nhân thoáng khí chống nước bảo vệ vết thương khỏi vi khuẩn và bụi bẩn.');

MERGE INTO dbo.products AS target
USING (
    SELECT 
        c.id AS category_id,
        src.barcode,
        src.name,
        src.unit,
        src.active_ingredient,
        src.manufacturer,
        src.is_prescription,
        src.cost_price,
        src.selling_price,
        src.min_quantity,
        src.description
    FROM @ProductData src
    JOIN dbo.categories c ON c.name = src.category_name
) AS source
ON target.barcode = source.barcode
WHEN MATCHED THEN
    UPDATE SET 
        target.category_id = source.category_id,
        target.name = source.name,
        target.unit = source.unit,
        target.active_ingredient = source.active_ingredient,
        target.manufacturer = source.manufacturer,
        target.is_prescription = source.is_prescription,
        target.cost_price = source.cost_price,
        target.selling_price = source.selling_price,
        target.min_quantity = source.min_quantity,
        target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, status, description, created_at)
    VALUES (source.category_id, source.barcode, source.name, source.unit, source.active_ingredient, source.manufacturer, source.is_prescription, source.cost_price, source.selling_price, source.min_quantity, 1, source.description, SYSDATETIME());

-- Nạp lịch sử giá niêm yết ban đầu
INSERT INTO dbo.price_histories (product_id, account_id, cost_price, selling_price, effective_from, reason, created_at)
SELECT p.id, @AdminId, p.cost_price, p.selling_price, SYSDATETIME(), N'Thiết lập giá niêm yết ban đầu khi khởi tạo sản phẩm', SYSDATETIME()
FROM dbo.products p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.price_histories ph WHERE ph.product_id = p.id
);
GO

/* =========================================================================================
   PHẦN 6: LÔ THUỐC FEFO & TỒN KHO THỰC TẾ (INVENTORIES)
   ========================================================================================= */

DECLARE @defaultSupplierId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers ORDER BY id);

-- 7.1 Lô chuẩn cho tất cả sản phẩm (HSD 2028)
INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
SELECT 
    p.id,
    'LOT-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) + '-2026',
    CAST('2026-01-15' AS DATE),
    CAST('2028-12-31' AS DATE),
    ISNULL((SELECT TOP 1 id FROM dbo.suppliers WHERE id = (p.id % 5 + 1)), @defaultSupplierId),
    SYSDATETIME()
FROM dbo.products p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.product_batches pb WHERE pb.product_id = p.id AND pb.batch_number = ('LOT-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) + '-2026')
);

-- 7.2 Lô CẬN HẠN (Expiring Soon - còn 45 ngày nữa hết hạn) để kiểm thử cảnh báo kho tổng & FEFO
DECLARE @PAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @PPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @PParacet   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890124');

IF @PAugmentin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXP-AUG-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PAugmentin, 'LOT-EXP-AUG-01', DATEADD(MONTH, -20, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, 45, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

IF @PPanadol IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXP-PANA-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PPanadol, 'LOT-EXP-PANA-01', DATEADD(MONTH, -22, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, 60, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

-- 7.3 Lô ĐÃ HẾT HẠN (Expired - hết hạn 10 ngày trước) để kiểm thử chặn FEFO và cảnh báo nguy cấp
IF @PParacet IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXPIRED-PARA-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PParacet, 'LOT-EXPIRED-PARA-01', DATEADD(YEAR, -3, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, -10, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

-- 7.4 Phân bổ tồn kho cho Kho tổng WH01 và các chi nhánh
INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
SELECT 
    s.id AS store_id,
    p.id AS product_id,
    b.id AS batch_id,
    (SELECT TOP 1 loc.id FROM dbo.warehouse_locations loc WHERE loc.store_id = s.id),
    CASE 
        WHEN s.type = 2 THEN 1000  -- Kho tổng 1,000 hộp
        ELSE 250                   -- Chi nhánh / Quầy POS 250 hộp
    END AS quantity,
    0 AS version,
    SYSDATETIME() AS updated_at
FROM dbo.stores s
CROSS JOIN dbo.products p
JOIN dbo.product_batches b ON b.product_id = p.id
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.inventories inv 
    WHERE inv.store_id = s.id AND inv.product_id = p.id AND inv.batch_id = b.id
);
GO

/* =========================================================================================
   PHẦN 7: KHÁCH HÀNG & HỒ SƠ DỊ ỨNG (CUSTOMERS & HEALTH PROFILES)
   ========================================================================================= */

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');
IF @AdminId IS NULL SET @AdminId = 1;

-- KH 1: Nguyễn Văn An - Tiền sử dị ứng Paracetamol
DECLARE @Cus1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0912345678')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Nguyễn Văn An', '0912345678', 'an.nguyen@gmail.com', '1988-04-12', 1, N'Số 15 Ngõ 68 Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus1Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus1Id = (SELECT id FROM dbo.customers WHERE phone = '0912345678');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus1Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus1Id, 172.0, 68.5, N'Paracetamol, Aspirin', N'Tăng huyết áp vô căn, Viêm loét dạ dày', N'Amlodipine 5mg', N'Khách có tiền sử sốc dị ứng nhẹ với Paracetamol', SYSDATETIME());

-- KH 2: Trần Thị Bích - Mang thai tuần 24, dị ứng Amoxicillin
DECLARE @Cus2Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0987654321')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Trần Thị Bích', '0987654321', 'bich.tran@gmail.com', '1995-09-20', 2, N'Tòa CT2 Chung cư FPT, Duy Tân, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus2Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus2Id = (SELECT id FROM dbo.customers WHERE phone = '0987654321');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus2Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus2Id, 160.0, 58.0, N'Amoxicillin, Penicillin', N'Đang mang thai tuần 24', N'Sắt sinh học, Axit Folic', N'Lưu ý chống chỉ định kháng sinh nhóm Penicillin khi kê đơn', SYSDATETIME());

-- KH 3: Lê Hoàng Long - Đái tháo đường Type 2
DECLARE @Cus3Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0903456789')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Lê Hoàng Long', '0903456789', 'long.le@yahoo.com', '1962-11-05', 1, N'Số 88 Trần Đăng Ninh, Dịch Vọng, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus3Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus3Id = (SELECT id FROM dbo.customers WHERE phone = '0903456789');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus3Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus3Id, 168.0, 72.0, NULL, N'Đái tháo đường type 2, Mỡ máu cao', N'Metformin 850mg, Atorvastatin 20mg', N'Người cao tuổi mua thuốc định kỳ hàng tháng', SYSDATETIME());

-- KH 4: Phạm Quỳnh Chi - Khách quen thân thiết (Hội viên Vàng)
DECLARE @Cus4Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0934567890')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Phạm Quỳnh Chi', '0934567890', 'quynhchi.pham@gmail.com', '1992-03-15', 2, N'Số 45 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus4Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus4Id = (SELECT id FROM dbo.customers WHERE phone = '0934567890');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus4Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus4Id, 163.0, 50.0, N'Hải sản, Phấn hoa', N'Viêm xoang dị ứng thời tiết', NULL, N'Hội viên Vàng thường xuyên mua thực phẩm chức năng', SYSDATETIME());

-- KH 5: Đỗ Thị Thu Trang - Khách hàng bị vô hiệu hóa để test khôi phục
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0966778899')
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Đỗ Thị Thu Trang', '0966778899', 'thutrang.do@gmail.com', '1998-07-28', 2, N'Số 12 Xuân Thủy, Cầu Giấy, Hà Nội', 0, @AdminId, SYSDATETIME());
GO

/* =========================================================================================
   PHẦN 8: BÁN HÀNG TẠI QUẦY POS: CA LÀM VIỆC, HÓA ĐƠN & ĐỔI TRẢ THUỐC
   ========================================================================================= */

DECLARE @StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @PharmacistId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
DECLARE @ManagerId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'manager_hn01');

-- 9.1 Ca Sáng Hôm Qua (CLOSED & RECONCILED)
DECLARE @ShiftYesterdayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (
        @StoreId, @PharmacistId,
        DATEADD(HOUR, -30, SYSDATETIME()),
        DATEADD(HOUR, -23, SYSDATETIME()),
        1500000.00, 1955000.00, 1955000.00, 2,
        N'Ca sáng bàn giao chuẩn xác. Tiền két khớp 100%.',
        @ManagerId, DATEADD(HOUR, -22, SYSDATETIME())
    );
    SET @ShiftYesterdayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftYesterdayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2 ORDER BY id DESC);

-- 9.2 Ca Sáng Hôm Nay (OPEN) phục vụ kiểm thử POS trực tiếp
DECLARE @ShiftTodayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note)
    VALUES (@StoreId, @PharmacistId, DATEADD(HOUR, -4, SYSDATETIME()), NULL, 1000000.00, NULL, NULL, 1, N'Ca làm việc trực quầy POS buổi sáng');
    SET @ShiftTodayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftTodayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1);

-- 9.3 Hóa đơn bán lẻ mẫu
DECLARE @PAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @BAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PAugmentin);
DECLARE @PGaviscon  BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890128');
DECLARE @BGaviscon  BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PGaviscon);
DECLARE @PPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @BPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PPanadol);

IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261104-0001')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261104-0001', @StoreId, @ShiftYesterdayId, @PharmacistId, 1, 'RX-BACHMAI-1029', 395000.00, 0.00, 395000.00, 1, DATEADD(HOUR, -25, SYSDATETIME()));
    
    DECLARE @InvId BIGINT = SCOPE_IDENTITY();

    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES 
    (@InvId, @PAugmentin, @BAugmentin, 1, 260000.00, 215000.00, N'Uống 1 viên x 2 lần/ngày sau bữa ăn'),
    (@InvId, @PGaviscon, @BGaviscon, 1, 135000.00, 110000.00, N'Uống 1 gói sau khi ăn 30 phút');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@InvId, 1, 395000.00, 1, NULL, DATEADD(HOUR, -25, SYSDATETIME()), DATEADD(HOUR, -25, SYSDATETIME()));

    -- Phiếu đổi trả hàng (UC25)
    IF NOT EXISTS (SELECT 1 FROM dbo.sales_returns WHERE code = 'RET-20261104-0001')
    BEGIN
        INSERT INTO dbo.sales_returns (code, sales_invoice_id, shift_id, processed_by, return_type, refund_method, refund_amount, reason, created_at)
        VALUES ('RET-20261104-0001', @InvId, @ShiftYesterdayId, @PharmacistId, 2, 1, 135000.00, N'Khách mua nhầm loại hỗn dịch, muốn hoàn tiền', DATEADD(HOUR, -24, SYSDATETIME()));
        
        DECLARE @RetId BIGINT = SCOPE_IDENTITY();
        DECLARE @Detail2Id BIGINT = (SELECT TOP 1 id FROM dbo.sales_invoice_details WHERE sales_invoice_id = @InvId AND product_id = @PGaviscon);
        
        INSERT INTO dbo.sales_return_details (sales_return_id, sales_invoice_detail_id, product_id, batch_id, quantity, unit_price)
        VALUES (@RetId, @Detail2Id, @PGaviscon, @BGaviscon, 1, 135000.00);
    END
END
GO

/* =========================================================================================
   PHẦN 9: QUY TRÌNH MUA HÀNG & BÁO GIÁ ĐẤU THẦU (PROCUREMENT FLOW)
   ========================================================================================= */

DECLARE @BuyerId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'purchasing01');
IF @BuyerId IS NULL SET @BuyerId = 1;
DECLARE @GmId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'gm01');
IF @GmId IS NULL SET @GmId = 1;
DECLARE @WhStoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
IF @WhStoreId IS NULL SET @WhStoreId = 2;

DECLARE @P1 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123'); -- Panadol
DECLARE @P2 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125'); -- Augmentin
DECLARE @SupplierDhgId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers WHERE code = 'SUP-DHG');

-- 10.1 Yêu cầu mua hàng (Purchase Requests)
DECLARE @Pr1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.purchase_requests WHERE code = 'PR-20261101-0001')
BEGIN
    INSERT INTO dbo.purchase_requests (code, store_id, created_by, status, reason, created_at, approved_at)
    VALUES ('PR-20261101-0001', @WhStoreId, @BuyerId, 1, N'Bổ sung lượng dự trữ kho tổng chuẩn bị mùa đông', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -4, SYSDATETIME()));
    SET @Pr1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES 
    (@Pr1Id, @P1, 500, N'Hàng chuẩn bị cho đợt khuyến mãi'),
    (@Pr1Id, @P2, 200, N'Thuốc kháng sinh dự trữ mùa rét');
END
ELSE
    SET @Pr1Id = (SELECT id FROM dbo.purchase_requests WHERE code = 'PR-20261101-0001');

-- 10.2 Đề xuất mua hàng (Purchase Proposals)
DECLARE @Pp1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001')
BEGIN
    INSERT INTO dbo.purchase_proposals (code, created_by, approved_by, status, reject_reason, total_amount, created_at, approved_at)
    VALUES ('PP-20261102-0001', @BuyerId, @GmId, 2, NULL, 125500000.00, DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, -3, SYSDATETIME()));
    SET @Pp1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.purchase_proposal_requests (purchase_proposal_id, purchase_request_id)
    VALUES (@Pp1Id, @Pr1Id);

    INSERT INTO dbo.purchase_proposal_details (purchase_proposal_id, product_id, quantity)
    VALUES 
    (@Pp1Id, @P1, 500),
    (@Pp1Id, @P2, 200);
END
ELSE
    SET @Pp1Id = (SELECT id FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001');

-- 10.3 Yêu cầu báo giá (RFQs)
DECLARE @Rfq1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.rfqs WHERE code = 'RFQ-20261102-0001')
BEGIN
    INSERT INTO dbo.rfqs (code, supplier_id, purchase_proposal_id, created_by, sent_by, token_hash, expired_at, subject, content, status, sent_at, created_at)
    VALUES (
        'RFQ-20261102-0001', @SupplierDhgId, @Pp1Id, @BuyerId, @BuyerId,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        DATEADD(DAY, 7, SYSDATETIME()),
        N'Yêu cầu báo giá vật tư y tế & dược phẩm đợt Tháng 11/2026',
        N'Kính gửi Quý đối tác DHG Pharma, vui lòng cung cấp bảng báo giá cho các mặt hàng đính kèm.',
        0, -- SENT
        DATEADD(DAY, -3, SYSDATETIME()),
        DATEADD(DAY, -3, SYSDATETIME())
    );
    SET @Rfq1Id = SCOPE_IDENTITY();
END
ELSE
    SET @Rfq1Id = (SELECT id FROM dbo.rfqs WHERE code = 'RFQ-20261102-0001');

-- 10.4 Báo giá phản hồi từ nhà cung cấp (Supplier Quotations)
DECLARE @Quo1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.supplier_quotations WHERE code = 'QUO-DHG-20261103-01')
BEGIN
    INSERT INTO dbo.supplier_quotations (code, rfq_id, supplier_id, account_id, quotation_date, valid_until, total_amount, status, created_at)
    VALUES ('QUO-DHG-20261103-01', @Rfq1Id, @SupplierDhgId, @BuyerId, CAST(DATEADD(DAY, -2, SYSDATETIME()) AS DATE), CAST(DATEADD(DAY, 30, SYSDATETIME()) AS DATE), 125500000.00, 1, DATEADD(DAY, -2, SYSDATETIME()));
    SET @Quo1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES 
    (@Quo1Id, @P1, 500, 160000.00, 5.0),
    (@Quo1Id, @P2, 200, 205000.00, 5.0);

    -- Cập nhật proposal liên kết với báo giá trúng thầu
    UPDATE dbo.purchase_proposals 
    SET supplier_quotation_id = @Quo1Id 
    WHERE id = @Pp1Id;
END
GO

/* =========================================================================================
   PHẦN 10: QUY TRÌNH KHO TRUNG TÂM & ĐIỀU CHUYỂN HÀNG HÓA (ROWS 45-58 - NHẬT HUY)
   ========================================================================================= */

DECLARE @WhStoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
DECLARE @St01StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @WhStaffId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'warehouse01');
DECLARE @WhMgrId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'wh_manager01');
DECLARE @SupplierId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers WHERE code = 'SUP-DHG');

DECLARE @ProdPana BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @BatchPana BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @ProdPana);
DECLARE @ProdAug BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @BatchAug BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @ProdAug);

-- 11.1 Phiếu nhập kho mua hàng (Purchase Receipts)
DECLARE @PpRecId BIGINT = (SELECT TOP 1 id FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001');

IF NOT EXISTS (SELECT 1 FROM dbo.purchase_receipts WHERE code = 'REC-20261104-0001')
BEGIN
    INSERT INTO dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by, delivery_type, status, total_amount, note, created_at, confirmed_at)
    VALUES ('REC-20261104-0001', @PpRecId, @SupplierId, @WhStoreId, @WhStaffId, @WhMgrId, 1, 1, 80000000.00, N'Nhập hàng nguyên lô Panadol Extra theo hợp đồng tháng 11', DATEADD(DAY, -2, SYSDATETIME()), DATEADD(DAY, -2, SYSDATETIME()));
    
    DECLARE @RecId BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.purchase_receipt_details (purchase_receipt_id, product_id, order_quantity, quantity, unit_cost, batch_number, manufacture_date, expiry_date, location_id)
    VALUES (@RecId, @ProdPana, 500, 500, 160000.00, 'LOT-PANA-2026-IN', CAST('2026-02-01' AS DATE), CAST('2028-12-31' AS DATE), 1);

    -- Đã duyệt nhập kho: Tạo lô hàng và bản ghi tồn kho mới trong kho tổng
    DECLARE @BatchPanaIn BIGINT;
    IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @ProdPana AND batch_number = 'LOT-PANA-2026-IN')
    BEGIN
        INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
        VALUES (@ProdPana, 'LOT-PANA-2026-IN', CAST('2026-02-01' AS DATE), CAST('2028-12-31' AS DATE), @SupplierId, SYSDATETIME());
        SET @BatchPanaIn = SCOPE_IDENTITY();
    END
    ELSE
        SET @BatchPanaIn = (SELECT id FROM dbo.product_batches WHERE product_id = @ProdPana AND batch_number = 'LOT-PANA-2026-IN');

    IF NOT EXISTS (SELECT 1 FROM dbo.inventories WHERE store_id = @WhStoreId AND batch_id = @BatchPanaIn)
    BEGIN
        INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
        VALUES (@WhStoreId, @ProdPana, @BatchPanaIn, 1, 500, 0, SYSDATETIME());
    END
END

-- 11.2 Yêu cầu điều chuyển từ cửa hàng (Stock Requisitions)
DECLARE @Req1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.stock_requisitions WHERE code = 'REQ-20261105-0001')
BEGIN
    INSERT INTO dbo.stock_requisitions (code, store_id, created_by, approved_by, status, created_at, approved_at)
    VALUES ('REQ-20261105-0001', @St01StoreId, @WhStaffId, @WhMgrId, 2, DATEADD(DAY, -1, SYSDATETIME()), DATEADD(DAY, -1, SYSDATETIME()));
    SET @Req1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.stock_requisition_details (stock_requisition_id, product_id, requested_qty, approved_qty, received_qty)
    VALUES 
    (@Req1Id, @ProdPana, 100, 100, NULL),
    (@Req1Id, @ProdAug, 50, 50, NULL);
END
ELSE
    SET @Req1Id = (SELECT id FROM dbo.stock_requisitions WHERE code = 'REQ-20261105-0001');

-- 11.3 Phiếu xuất kho điều chuyển theo FEFO (Goods Issues)
IF NOT EXISTS (SELECT 1 FROM dbo.goods_issues WHERE code = 'GI-20261105-0001')
BEGIN
    INSERT INTO dbo.goods_issues (code, stock_requisition_id, from_store_id, to_store_id, created_by, dispatched_by, status, carrier, note, created_at, dispatched_at)
    VALUES ('GI-20261105-0001', @Req1Id, @WhStoreId, @St01StoreId, @WhStaffId, @WhStaffId, 1, N'Đội xe vận chuyển PharmaChain Fleet #02', N'Hàng đang trên đường vận chuyển sang Nhà thuốc Cầu Giấy', DATEADD(HOUR, -6, SYSDATETIME()), DATEADD(HOUR, -6, SYSDATETIME()));
    
    DECLARE @GiId BIGINT = SCOPE_IDENTITY();

    INSERT INTO dbo.goods_issue_details (goods_issue_id, product_id, batch_id, quantity)
    VALUES 
    (@GiId, @ProdPana, @BatchPana, 100),
    (@GiId, @ProdAug, @BatchAug, 50);
END

-- 11.4 Đợt kiểm kê kho định kỳ (Inventory Audits)
DECLARE @Audit1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.inventory_audits WHERE code = 'AUD-20261101-0001')
BEGIN
    INSERT INTO dbo.inventory_audits (code, store_id, requested_by, counted_by, reviewed_by, status, audit_date, review_note, created_at)
    VALUES ('AUD-20261101-0001', @WhStoreId, @WhMgrId, @WhStaffId, @WhMgrId, 2, CAST(DATEADD(DAY, -5, SYSDATETIME()) AS DATE), N'Kiểm kê đầu tháng 11 - Khớp 100% sổ sách', DATEADD(DAY, -5, SYSDATETIME()));
    SET @Audit1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.inventory_audit_details (inventory_audit_id, product_id, batch_id, system_quantity, counted_quantity, note)
    VALUES 
    (@Audit1Id, @ProdPana, @BatchPana, 1000, 1000, N'Bao bì nguyên vẹn, xếp đúng kệ A1'),
    (@Audit1Id, @ProdAug, @BatchAug, 1000, 998, N'Lệch âm 2 hộp do nứt vỡ trong lúc dỡ hàng');
END
ELSE
    SET @Audit1Id = (SELECT id FROM dbo.inventory_audits WHERE code = 'AUD-20261101-0001');

-- 11.5 Phiếu điều chỉnh kiểm kê (Inventory Adjustments)
IF NOT EXISTS (SELECT 1 FROM dbo.inventory_adjustments WHERE reason LIKE N'%Hao hụt nứt vỡ%')
BEGIN
    INSERT INTO dbo.inventory_adjustments (store_id, product_id, batch_id, inventory_audit_id, created_by, approved_by, type, status, quantity_before, quantity_after, value_impact, reason, created_at, approved_at)
    VALUES (@WhStoreId, @ProdAug, @BatchAug, @Audit1Id, @WhStaffId, @WhMgrId, 3, 2, 1000, 998, -430000.00, N'Hao hụt nứt vỡ vỉ thuốc trong quá trình vận chuyển nội bộ', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME()));
END
GO

/* =========================================================================================
   PHẦN 11: ĐỐI SOÁT DOANH THU, THẺ KHO KIỂM TOÁN (STOCK MOVEMENTS) & THÔNG BÁO HỆ THỐNG
   ========================================================================================= */

DECLARE @St01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @Wh01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
DECLARE @MgrId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'manager_hn01');
DECLARE @StaffId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');

-- 12.1 Đối soát doanh thu ngày hôm qua cho ST01
DECLARE @Yesterday DATE = CAST(DATEADD(DAY, -1, SYSDATETIME()) AS DATE);
IF NOT EXISTS (SELECT 1 FROM dbo.daily_sales_reconciliations WHERE store_id = @St01Id AND business_date = @Yesterday)
BEGIN
    INSERT INTO dbo.daily_sales_reconciliations (store_id, business_date, system_cash, system_bank, system_vnpay, actual_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@St01Id, @Yesterday, 395000.00, 0.00, 0.00, 395000.00, 1, N'Đối soát khớp 100% giữa tiền thực nộp và hệ thống POS', @MgrId, SYSDATETIME());
END

-- 12.2 Thẻ kho kiểm toán mẫu (Stock Movements)
DECLARE @P1 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @B1 BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @P1);

IF @P1 IS NOT NULL AND @B1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.stock_movements WHERE reference_type = 'INIT_STOCK')
BEGIN
    INSERT INTO dbo.stock_movements (store_id, product_id, batch_id, movement_type, quantity_change, quantity_after, reference_type, reference_id, created_by, note, created_at)
    VALUES 
    (@Wh01Id, @P1, @B1, 1, 1000, 1000, 'INIT_STOCK', 1, @MgrId, N'Khởi tạo số dư kho đầu kỳ', DATEADD(DAY, -10, SYSDATETIME())),
    (@St01Id, @P1, @B1, 1, 250, 250, 'INIT_STOCK', 2, @MgrId, N'Cấp phát tồn kho quầy thuốc đầu kỳ', DATEADD(DAY, -10, SYSDATETIME())),
    (@St01Id, @P1, @B1, 2, -1, 249, 'SALES_INVOICE', 1, @StaffId, N'Xuất bán lẻ theo hóa đơn INV-20261104-0001', DATEADD(HOUR, -25, SYSDATETIME()));
END

-- 12.3 Thông báo hệ thống (Notifications)
DECLARE @WhMgrAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'wh_manager01');
IF @WhMgrAccId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE account_id = @WhMgrAccId)
BEGIN
    INSERT INTO dbo.notifications (account_id, store_id, type, title, message, ref_type, ref_id, is_read, created_at)
    VALUES 
    (@WhMgrAccId, @Wh01Id, 'WARNING', N'Cảnh báo lô thuốc cận hạn', N'Lô thuốc LOT-EXP-AUG-01 (Augmentin 1g) còn 45 ngày hết hạn. Vui lòng ưu tiên xuất FEFO.', 'BATCH', 1, 0, DATEADD(HOUR, -12, SYSDATETIME())),
    (@WhMgrAccId, @Wh01Id, 'INFO', N'Yêu cầu điều chuyển hàng mới', N'Nhà thuốc Cầu Giấy ST01 vừa gửi yêu cầu bổ sung 150 đơn vị thuốc.', 'REQUISITION', 1, 0, DATEADD(HOUR, -2, SYSDATETIME()));
END

-- 12.4 Nhật ký gửi Email (Email Logs)
DECLARE @Rfq1Id BIGINT = (SELECT TOP 1 id FROM dbo.rfqs ORDER BY id ASC);
IF NOT EXISTS (SELECT 1 FROM dbo.email_logs WHERE to_email = 'kinhdoanh@dhgpharma.com.vn')
BEGIN
    INSERT INTO dbo.email_logs (to_email, subject, body, ref_type, ref_id, status, error_message, created_at, sent_at)
    VALUES 
    ('kinhdoanh@dhgpharma.com.vn', N'Yêu cầu báo giá Panadol Extra và Augmentin 1g',
     N'Kính gửi Quý nhà cung cấp Dược Hậu Giang, vui lòng xem chi tiết yêu cầu báo giá đính kèm.',
     'RFQ', @Rfq1Id, 1, NULL, DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME())),
    ('pharmacist.duty@pharmacy.com', N'Đặt lại mật khẩu tài khoản hệ thống',
     N'Mã đặt lại mật khẩu của bạn có hiệu lực trong 30 phút.',
     'PASSWORD_RESET', NULL, 1, NULL, DATEADD(HOUR, -5, SYSDATETIME()), DATEADD(HOUR, -5, SYSDATETIME()));
END

-- 12.5 Nhật ký kiểm toán thao tác (Audit Logs)
DECLARE @AdminAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');
DECLARE @Prod1Id BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567010012');
IF @AdminAccId IS NOT NULL AND @Prod1Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.audit_logs WHERE entity_name = 'Product' AND entity_id = @Prod1Id)
BEGIN
    INSERT INTO dbo.audit_logs (account_id, [action], entity_name, entity_id, old_value, new_value, ip_address, created_at)
    VALUES 
    (@AdminAccId, 1, 'Product', @Prod1Id, NULL, N'{"barcode":"8934567010012","name":"Panadol Extra Đỏ 500mg","price":15000}', '192.168.1.10', DATEADD(DAY, -30, SYSDATETIME())),
    (@MgrId, 2, 'SalesInvoice', 1, N'{"status":1}', N'{"status":3}', '192.168.1.24', DATEADD(HOUR, -20, SYSDATETIME()));
END

-- 12.6 Token đặt lại mật khẩu (Password Reset Tokens)
DECLARE @PharmAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
IF @PharmAccId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.password_reset_tokens WHERE account_id = @PharmAccId)
BEGIN
    INSERT INTO dbo.password_reset_tokens (account_id, token_hash, expires_at, used_at, created_at)
    VALUES (@PharmAccId, 'f4c7a1d9e2b58c03a6d9f2b5c8e1a4d7b0c3f6a9', DATEADD(MINUTE, 30, SYSDATETIME()), NULL, DATEADD(MINUTE, -5, SYSDATETIME()));
END
GO

-- 12.7 Bảng lưu trữ Refresh Tokens (Refresh Token Rotation)
IF OBJECT_ID('dbo.refresh_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.refresh_tokens (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        account_id BIGINT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        expiry_date DATETIME2 NOT NULL,
        is_revoked BIT DEFAULT 0 NOT NULL,
        created_at DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
        replaced_by_token VARCHAR(500) NULL,
        CONSTRAINT FK_refresh_tokens_accounts FOREIGN KEY (account_id) REFERENCES dbo.accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_refresh_tokens_account_id ON dbo.refresh_tokens(account_id);
    CREATE INDEX IX_refresh_tokens_token ON dbo.refresh_tokens(token);
END
GO

-- 12.8 Bảng quy đổi đơn vị bán lẻ thuốc (Product Multi-Unit Conversion)
IF OBJECT_ID('dbo.product_units', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product_units (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL,
        unit_name NVARCHAR(50) NOT NULL,
        conversion_factor INT NOT NULL DEFAULT 1,
        selling_price DECIMAL(18,2) NOT NULL,
        is_base_unit BIT NOT NULL DEFAULT 0,
        barcode VARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_product_units_products FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_product_units_product_id ON dbo.product_units(product_id);
    CREATE INDEX IX_product_units_barcode ON dbo.product_units(barcode);
END
GO

-- Bổ sung cột quy đổi vào sales_invoice_details nếu chưa có
IF COL_LENGTH('dbo.sales_invoice_details', 'unit_name') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.sales_invoice_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.sales_invoice_details', 'base_quantity') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD base_quantity INT NULL;
GO

-- Bổ sung cột quy đổi vào purchase_receipt_details nếu chưa có
IF COL_LENGTH('dbo.purchase_receipt_details', 'unit_name') IS NULL
    ALTER TABLE dbo.purchase_receipt_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.purchase_receipt_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.purchase_receipt_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.purchase_receipt_details', 'base_quantity') IS NULL
    ALTER TABLE dbo.purchase_receipt_details ADD base_quantity INT NULL;
GO

-- Bổ sung cột quy đổi vào stock_requisition_details nếu chưa có
IF COL_LENGTH('dbo.stock_requisition_details', 'unit_name') IS NULL
    ALTER TABLE dbo.stock_requisition_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.stock_requisition_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.stock_requisition_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.stock_requisition_details', 'base_requested_qty') IS NULL
    ALTER TABLE dbo.stock_requisition_details ADD base_requested_qty INT NULL;
GO

-- Seed dữ liệu mẫu quy đổi đơn vị cho thuốc Panadol Extra (barcode: 8934567890123)
DECLARE @PanadolId BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
IF @PanadolId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_units WHERE product_id = @PanadolId)
BEGIN
    INSERT INTO dbo.product_units (product_id, unit_name, conversion_factor, selling_price, is_base_unit, barcode, created_at)
    VALUES 
    (@PanadolId, N'Viên', 1, 1500.00, 1, '8934567890123-V', SYSDATETIME()),
    (@PanadolId, N'Vỉ', 12, 17000.00, 0, '8934567890123-VI', SYSDATETIME()),
    (@PanadolId, N'Hộp', 180, 245000.00, 0, '8934567890123', SYSDATETIME());
END
GO

/* =========================================================================================
   PHẦN 5.1: ĐƠN VỊ TÍNH QUY ĐỔI (PRODUCT_UNITS) VỚI GIÁ BÁN CHO TẤT CẢ 23 DƯỢC PHẨM
   ========================================================================================= */

IF OBJECT_ID('dbo.product_units', 'U') IS NOT NULL
BEGIN
    DECLARE @SeedUnits TABLE (
        product_barcode  VARCHAR(50),
        unit_name        NVARCHAR(50),
        conversion_factor INT,
        selling_price    DECIMAL(18,2),
        is_base_unit     BIT,
        unit_barcode     VARCHAR(50)
    );

    INSERT INTO @SeedUnits VALUES
        -- 1. Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)
        ('8934567890112', N'Viên', 1,   1500.00,   1, '8934567890112-V'),
        ('8934567890112', N'Vỉ',   12,  17000.00,  0, '8934567890112-VI'),
        ('8934567890112', N'Hộp',  180, 245000.00, 0, '8934567890112'),

        -- 2. Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)
        ('8934567890124', N'Viên', 1,   800.00,    1, '8934567890124-V'),
        ('8934567890124', N'Vỉ',   10,  7500.00,   0, '8934567890124-VI'),
        ('8934567890124', N'Hộp',  100, 70000.00,  0, '8934567890124'),

        -- 3. Efferalgan 500mg (Hộp 4 vỉ x 4 viên sủi)
        ('8934567890133', N'Viên', 1,   4500.00,   1, '8934567890133-V'),
        ('8934567890133', N'Vỉ',   4,   17500.00,  0, '8934567890133-VI'),
        ('8934567890133', N'Hộp',  16,  68000.00,  0, '8934567890133'),

        -- 4. Mobic 7.5mg (Hộp 2 vỉ x 10 viên)
        ('8934567890134', N'Viên', 1,   10000.00,  1, '8934567890134-V'),
        ('8934567890134', N'Vỉ',   10,  95000.00,  0, '8934567890134-VI'),
        ('8934567890134', N'Hộp',  20,  185000.00, 0, '8934567890134'),

        -- 5. Hapacol 250 Trẻ Em Vị Cam (Hộp 24 gói)
        ('8934567890135', N'Gói',  1,   2500.00,   1, '8934567890135-G'),
        ('8934567890135', N'Hộp',  24,  55000.00,  0, '8934567890135'),

        -- 6. Augmentin 1g (Hộp 14 viên)
        ('8934567890125', N'Viên', 1,   20000.00,  1, '8934567890125-V'),
        ('8934567890125', N'Vỉ',   7,   135000.00, 0, '8934567890125-VI'),
        ('8934567890125', N'Hộp',  14,  260000.00, 0, '8934567890125'),

        -- 7. Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)
        ('8934567890126', N'Viên', 1,   1000.00,   1, '8934567890126-V'),
        ('8934567890126', N'Vỉ',   10,  9000.00,   0, '8934567890126-VI'),
        ('8934567890126', N'Hộp',  100, 85000.00,  0, '8934567890126'),

        -- 8. Cefixim 200mg DHG (Hộp 2 vỉ x 10 viên)
        ('8934567890136', N'Viên', 1,   5000.00,   1, '8934567890136-V'),
        ('8934567890136', N'Vỉ',   10,  49000.00,  0, '8934567890136-VI'),
        ('8934567890136', N'Hộp',  20,  95000.00,  0, '8934567890136'),

        -- 9. Zithromax 500mg (Hộp 1 vỉ x 3 viên)
        ('8934567890137', N'Viên', 1,   60000.00,  1, '8934567890137-V'),
        ('8934567890137', N'Hộp',  3,   165000.00, 0, '8934567890137'),

        -- 10. Ciprofloxacin 500mg Vidipha (Hộp 10 vỉ x 10 viên)
        ('8934567890138', N'Viên', 1,   1200.00,   1, '8934567890138-V'),
        ('8934567890138', N'Vỉ',   10,  11500.00,  0, '8934567890138-VI'),
        ('8934567890138', N'Hộp',  100, 110000.00, 0, '8934567890138'),

        -- 11. Nexium Mups 40mg (Hộp 14 viên)
        ('8934567890127', N'Viên', 1,   27000.00,  1, '8934567890127-V'),
        ('8934567890127', N'Vỉ',   7,   180000.00, 0, '8934567890127-VI'),
        ('8934567890127', N'Hộp',  14,  350000.00, 0, '8934567890127'),

        -- 12. Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)
        ('8934567890128', N'Gói',  1,   6000.00,   1, '8934567890128-G'),
        ('8934567890128', N'Hộp',  24,  135000.00, 0, '8934567890128'),

        -- 13. Phosphalugel Chữ P (Hộp 26 gói x 20g)
        ('8934567890139', N'Gói',  1,   5000.00,   1, '8934567890139-G'),
        ('8934567890139', N'Hộp',  26,  120000.00, 0, '8934567890139'),

        -- 14. Men vi sinh Enterogermina (Hộp 20 ống)
        ('8934567890140', N'Ống',  1,   10000.00,  1, '8934567890140-O'),
        ('8934567890140', N'Vỉ',   5,   48000.00,  0, '8934567890140-VI'),
        ('8934567890140', N'Hộp',  20,  185000.00, 0, '8934567890140'),

        -- 15. Amlor 5mg (Hộp 3 vỉ x 10 viên)
        ('8934567890141', N'Viên', 1,   11000.00,  1, '8934567890141-V'),
        ('8934567890141', N'Vỉ',   10,  105000.00, 0, '8934567890141-VI'),
        ('8934567890141', N'Hộp',  30,  310000.00, 0, '8934567890141'),

        -- 16. Concor 5mg (Hộp 5 vỉ x 10 viên)
        ('8934567890142', N'Viên', 1,   5000.00,   1, '8934567890142-V'),
        ('8934567890142', N'Vỉ',   10,  47000.00,  0, '8934567890142-VI'),
        ('8934567890142', N'Hộp',  50,  225000.00, 0, '8934567890142'),

        -- 17. Micardis 40mg (Hộp 3 vỉ x 10 viên)
        ('8934567890143', N'Viên', 1,   10000.00,  1, '8934567890143-V'),
        ('8934567890143', N'Vỉ',   10,  96000.00,  0, '8934567890143-VI'),
        ('8934567890143', N'Hộp',  30,  280000.00, 0, '8934567890143'),

        -- 18. Lipitor 20mg (Hộp 3 vỉ x 10 viên)
        ('8934567890144', N'Viên', 1,   18000.00,  1, '8934567890144-V'),
        ('8934567890144', N'Vỉ',   10,  170000.00, 0, '8934567890144-VI'),
        ('8934567890144', N'Hộp',  30,  495000.00, 0, '8934567890144'),

        -- 19. Viên ngậm ho Bảo Thanh (Hộp 20 vỉ x 5 viên)
        ('8934567890146', N'Viên', 1,   1500.00,   1, '8934567890146-V'),
        ('8934567890146', N'Vỉ',   5,   7500.00,   0, '8934567890146-VI'),
        ('8934567890146', N'Hộp',  100, 140000.00, 0, '8934567890146'),

        -- 20. Decolgen Cảm Cúm (Hộp 25 vỉ x 4 viên)
        ('8934567890147', N'Viên', 1,   1300.00,   1, '8934567890147-V'),
        ('8934567890147', N'Vỉ',   4,   5000.00,   0, '8934567890147-VI'),
        ('8934567890147', N'Hộp',  100, 115000.00, 0, '8934567890147'),

        -- 21. Telfast HD 180mg (Hộp 1 vỉ x 10 viên)
        ('8934567890131', N'Viên', 1,   9500.00,   1, '8934567890131-V'),
        ('8934567890131', N'Hộp',  10,  90000.00,  0, '8934567890131'),

        -- 22. Cetirizin 10mg Stada (Hộp 5 vỉ x 10 viên)
        ('8934567890149', N'Viên', 1,   1200.00,   1, '8934567890149-V'),
        ('8934567890149', N'Vỉ',   10,  11500.00,  0, '8934567890149-VI'),
        ('8934567890149', N'Hộp',  50,  55000.00,  0, '8934567890149'),

        -- 23. Băng dán y tế cá nhân Urgo Waterproof (Hộp 20 miếng)
        ('8934567890157', N'Miếng',1,   2000.00,   1, '8934567890157-M'),
        ('8934567890157', N'Hộp',  20,  38000.00,  0, '8934567890157');

    MERGE INTO dbo.product_units AS target
    USING (
        SELECT 
            p.id AS product_id,
            src.unit_name,
            src.conversion_factor,
            src.selling_price,
            src.is_base_unit,
            src.unit_barcode
        FROM @SeedUnits src
        JOIN dbo.products p ON p.barcode = src.product_barcode
    ) AS source
    ON target.product_id = source.product_id AND target.unit_name = source.unit_name
    WHEN MATCHED THEN
        UPDATE SET 
            target.conversion_factor = source.conversion_factor,
            target.selling_price     = source.selling_price,
            target.is_base_unit      = source.is_base_unit,
            target.barcode           = source.unit_barcode
    WHEN NOT MATCHED THEN
        INSERT (product_id, unit_name, conversion_factor, selling_price, is_base_unit, barcode, created_at)
        VALUES (source.product_id, source.unit_name, source.conversion_factor, source.selling_price, source.is_base_unit, source.unit_barcode, SYSDATETIME());
END
GO


/* =========================================================================================
   PHẦN 12: ĐẢM BẢO 100% CÁC LÔ THUỐC TỒN KHO TẠI KHO TỔNG ĐÃ ĐƯỢC GÁN VỊ TRÍ Ô KỆ CHUẨN
   ========================================================================================= */

DECLARE @Wh01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01' OR type = 2);
DECLARE @DefaultLocId BIGINT = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'A-01-01');

IF @Wh01Id IS NOT NULL AND @DefaultLocId IS NOT NULL
BEGIN
    -- Gán theo nhóm thuốc
    UPDATE inv
    SET inv.location_id = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'A-01-01')
    FROM dbo.inventories inv
    JOIN dbo.products p ON inv.product_id = p.id
    WHERE inv.store_id = @Wh01Id AND p.category_id = 1 AND inv.location_id IS NULL;

    UPDATE inv
    SET inv.location_id = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'B-01-01')
    FROM dbo.inventories inv
    JOIN dbo.products p ON inv.product_id = p.id
    WHERE inv.store_id = @Wh01Id AND p.category_id = 2 AND inv.location_id IS NULL;

    UPDATE inv
    SET inv.location_id = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'C-01-01')
    FROM dbo.inventories inv
    JOIN dbo.products p ON inv.product_id = p.id
    WHERE inv.store_id = @Wh01Id AND p.category_id = 3 AND inv.location_id IS NULL;

    UPDATE inv
    SET inv.location_id = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'D-01-01')
    FROM dbo.inventories inv
    JOIN dbo.products p ON inv.product_id = p.id
    WHERE inv.store_id = @Wh01Id AND p.category_id = 4 AND inv.location_id IS NULL;

    UPDATE inv
    SET inv.location_id = (SELECT TOP 1 id FROM dbo.warehouse_locations WHERE code = 'E-01-01')
    FROM dbo.inventories inv
    JOIN dbo.products p ON inv.product_id = p.id
    WHERE inv.store_id = @Wh01Id AND p.category_id = 5 AND inv.location_id IS NULL;

    -- Tất cả các bản ghi còn lại nếu có chưa gán vị trí thì gán vào @DefaultLocId
    UPDATE dbo.inventories
    SET location_id = @DefaultLocId
    WHERE store_id = @Wh01Id AND location_id IS NULL;
    
    -- Đồng bộ liên kết phiếu nhập kho với phiếu mua hàng đã duyệt
    DECLARE @Proposal1Id BIGINT = (SELECT TOP 1 id FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001');
    IF @Proposal1Id IS NOT NULL
    BEGIN
        UPDATE dbo.purchase_receipts SET purchase_proposal_id = @Proposal1Id WHERE code IN ('REC-20261104-0001', 'REC-20261106-0002');
    END
END;
GO
