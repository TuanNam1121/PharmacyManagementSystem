package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.InventoryAuditDto;
import com.pharmacy.dto.inventory.InventoryAuditReviewRequest;
import com.pharmacy.service.InventoryAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/inventory-audits")
@CrossOrigin(origins = "*")
public class InventoryAuditController {

    private final InventoryAuditService inventoryAuditService;

    /**
     * UC34 - Step 2: Lấy danh sách phiếu kiểm kê chi nhánh
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InventoryAuditDto>>> getAuditList(
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt") Pageable pageable) {

        PageResponse<InventoryAuditDto> result = inventoryAuditService.getAuditList(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách phiếu kiểm kê thành công", result));
    }

    /**
     * UC34 - Step 2 (chi tiết): Xem chi tiết 1 phiếu kiểm kê
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> getAuditDetail(@PathVariable Long id) {
        InventoryAuditDto result = inventoryAuditService.getAuditDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Tải chi tiết phiếu kiểm kê thành công", result));
    }

    /**
     * UC34 - Step 3,4,5: Xét duyệt phiếu (Approve / Reject) + ghi AuditLog (BR-02)
     */
    @PatchMapping("/review")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> reviewAudit(
            @Valid @RequestBody InventoryAuditReviewRequest request,
            HttpServletRequest servletRequest) {

        String username = "store_manager"; // TODO: lấy từ SecurityContext khi có auth
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.reviewAudit(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Xét duyệt phiếu kiểm kê thành công", result));
    }
}
