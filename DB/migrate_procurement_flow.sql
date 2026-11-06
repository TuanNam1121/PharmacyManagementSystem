/* =====================================================================
   MIGRATION - PROCUREMENT FLOW REWORK
   Target : SQL Server (Pharmacy Management System - PMS)

   New flow:
       Purchase Request(s)  ->  Purchase Proposal (aggregates N PRs)
       ->  RFQ (built from the purchase proposal)  ->  Supplier Quotation

   NOTE
   ----
   The two new tables (purchase_proposal_requests, purchase_proposal_details)
   and the new nullable column rfqs.purchase_proposal_id are created
   automatically by Hibernate (spring.jpa.hibernate.ddl-auto=update).

   The statements below are ONLY required for an EXISTING database, because
   Hibernate's "update" mode never relaxes a NOT NULL constraint that already
   exists on a table. Run them once, in the order shown.

   If you are starting from a fresh/empty PMS database you can skip this file:
   Hibernate will create everything correctly on first start.
   ===================================================================== */

USE PMS;

/* 1. Purchase proposals no longer reference a single purchase request
      (PRs are now aggregated through purchase_proposal_requests). The legacy
      column is kept but must accept NULL so new inserts succeed.            */
IF EXISTS (SELECT 1 FROM sys.columns
           WHERE Name = 'purchase_request_id'
             AND Object_ID = Object_ID('dbo.purchase_proposals'))
BEGIN
    ALTER TABLE dbo.purchase_proposals ALTER COLUMN purchase_request_id BIGINT NULL;
END

/* 2. A proposal is now created BEFORE any supplier quotation exists,
      so the selected-quotation FK must accept NULL.                          */
IF EXISTS (SELECT 1 FROM sys.columns
           WHERE Name = 'supplier_quotation_id'
             AND Object_ID = Object_ID('dbo.purchase_proposals'))
BEGIN
    ALTER TABLE dbo.purchase_proposals ALTER COLUMN supplier_quotation_id BIGINT NULL;
END

/* 3. RFQs are now linked to a purchase proposal. The legacy single-PR column
      is no longer populated, so it must accept NULL.                         */
IF EXISTS (SELECT 1 FROM sys.columns
           WHERE Name = 'purchase_request_id'
             AND Object_ID = Object_ID('dbo.rfqs'))
BEGIN
    ALTER TABLE dbo.rfqs ALTER COLUMN purchase_request_id BIGINT NULL;
END

/* 4. New column used as the RFQ source document (auto-added by Hibernate,
      included here only as a safety net for manual setups).                  */
IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE Name = 'purchase_proposal_id'
                 AND Object_ID = Object_ID('dbo.rfqs'))
BEGIN
    ALTER TABLE dbo.rfqs ADD purchase_proposal_id BIGINT NULL;
END