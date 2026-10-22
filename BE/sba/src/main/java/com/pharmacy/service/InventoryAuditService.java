package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.InventoryAuditDto;
import com.pharmacy.dto.inventory.InventoryAuditReviewRequest;
import org.springframework.data.domain.Pageable;

public interface InventoryAuditService {

    /** Get list of branch inventory audits with pagination and filter */
    PageResponse<InventoryAuditDto> getAuditList(Short status, String search, Pageable pageable);

    /** View detailed information of an inventory audit */
    InventoryAuditDto getAuditDetail(Long auditId);

    /** Review (Approve/Reject) audit and record AuditLog */
    InventoryAuditDto reviewAudit(InventoryAuditReviewRequest request, String username, String clientIp);
}
