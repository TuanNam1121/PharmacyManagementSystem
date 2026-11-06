package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.*;
import org.springframework.data.domain.Pageable;

public interface InventoryAuditService {

    // 1. Pharmacist requests an audit session (Status: 0)
    InventoryAuditDto requestAuditSession(CreateAuditRequest request, String username, String clientIp);

    // 2. Store Manager approves / rejects opening the audit (Status 0 -> 1 or 4)
    InventoryAuditDto approveAuditRequest(ApproveAuditRequest request, String username, String clientIp);

    // 3. Pharmacist submits counted quantities (Status 1 -> 2)
    InventoryAuditDto submitAuditCount(SubmitAuditCountRequest request, String username, String clientIp);

    // 4. Store Manager final review & reconcile (Status 2 -> 3 or 4)
    InventoryAuditDto reviewAudit(InventoryAuditReviewRequest request, String username, String clientIp);

    // Query methods
    PageResponse<InventoryAuditDto> getAuditList(Long storeId, Short status, String search, Pageable pageable);

    InventoryAuditDto getAuditDetail(Long auditId);
}
