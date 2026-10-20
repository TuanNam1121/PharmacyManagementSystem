package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.InventoryAuditDto;
import com.pharmacy.dto.inventory.InventoryAuditReviewRequest;
import org.springframework.data.domain.Pageable;

public interface InventoryAuditService {

    /** UC34 - Step 2: Lấy danh sách phiếu kiểm kê (có phân trang, lọc) */
    PageResponse<InventoryAuditDto> getAuditList(Short status, String search, Pageable pageable);

    /** UC34 - Step 2 (chi tiết): Xem chi tiết 1 phiếu */
    InventoryAuditDto getAuditDetail(Long auditId);

    /** UC34 - Step 3,4,5: Xét duyệt (Approve/Reject) + ghi AuditLog */
    InventoryAuditDto reviewAudit(InventoryAuditReviewRequest request, String username, String clientIp);
}
