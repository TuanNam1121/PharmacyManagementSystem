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
import org.springframework.data.domain.Sort;
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
     * Get list of branch inventory audits
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InventoryAuditDto>>> getAuditList(
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<InventoryAuditDto> result = inventoryAuditService.getAuditList(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Inventory audits retrieved successfully", result));
    }

    /**
     * View inventory audit details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> getAuditDetail(@PathVariable Long id) {
        InventoryAuditDto result = inventoryAuditService.getAuditDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Inventory audit details retrieved successfully", result));
    }

    /**
     * Review audit (Approve / Reject) + record AuditLog
     */
    @PatchMapping("/review")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> reviewAudit(
            @Valid @RequestBody InventoryAuditReviewRequest request,
            HttpServletRequest servletRequest) {

        String username = "store_manager";
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.reviewAudit(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Inventory audit reviewed successfully", result));
    }
}
