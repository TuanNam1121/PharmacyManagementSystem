USE [master]
GO
/****** Object:  Database [PMS]    Script Date: 11/8/2026 7:37:32 PM ******/
CREATE DATABASE [PMS]
 CONTAINMENT = NONE
 ON  PRIMARY
( NAME = N'PMS', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\PMS.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON
( NAME = N'PMS_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\PMS_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [PMS] SET COMPATIBILITY_LEVEL = 170
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PMS].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PMS] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [PMS] SET ANSI_NULLS OFF
GO
ALTER DATABASE [PMS] SET ANSI_PADDING OFF
GO
ALTER DATABASE [PMS] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [PMS] SET ARITHABORT OFF
GO
ALTER DATABASE [PMS] SET AUTO_CLOSE ON
GO
ALTER DATABASE [PMS] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [PMS] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [PMS] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [PMS] SET CURSOR_DEFAULT  GLOBAL
GO
ALTER DATABASE [PMS] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [PMS] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [PMS] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [PMS] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [PMS] SET  ENABLE_BROKER
GO
ALTER DATABASE [PMS] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [PMS] SET DATE_CORRELATION_OPTIMIZATION OFF
GO
ALTER DATABASE [PMS] SET TRUSTWORTHY OFF
GO
ALTER DATABASE [PMS] SET ALLOW_SNAPSHOT_ISOLATION OFF
GO
ALTER DATABASE [PMS] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [PMS] SET READ_COMMITTED_SNAPSHOT OFF
GO
ALTER DATABASE [PMS] SET HONOR_BROKER_PRIORITY OFF
GO
ALTER DATABASE [PMS] SET RECOVERY SIMPLE
GO
ALTER DATABASE [PMS] SET  MULTI_USER
GO
ALTER DATABASE [PMS] SET PAGE_VERIFY CHECKSUM
GO
ALTER DATABASE [PMS] SET DB_CHAINING OFF
GO
ALTER DATABASE [PMS] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF )
GO
ALTER DATABASE [PMS] SET TARGET_RECOVERY_TIME = 60 SECONDS
GO
ALTER DATABASE [PMS] SET DELAYED_DURABILITY = DISABLED
GO
ALTER DATABASE [PMS] SET OPTIMIZED_LOCKING = OFF
GO
ALTER DATABASE [PMS] SET ACCELERATED_DATABASE_RECOVERY = OFF
GO
ALTER DATABASE [PMS] SET QUERY_STORE = ON
GO
ALTER DATABASE [PMS] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PMS]
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
    USE [master]
    GO
ALTER DATABASE [PMS] SET  READ_WRITE
GO