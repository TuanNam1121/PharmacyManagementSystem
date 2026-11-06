package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.*;
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
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<InventoryAuditDto> result = inventoryAuditService.getAuditList(storeId, status, search, pageable);
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
     * STEP 1 (Pharmacist): Request a new audit session
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> requestAuditSession(
            @Valid @RequestBody CreateAuditRequest request,
            HttpServletRequest servletRequest) {

        String username = "pharmacist_duty";
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.requestAuditSession(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory audit session requested successfully. Waiting for Store Manager approval.", result));
    }

    /**
     * STEP 2 (Store Manager): Approve or reject audit opening request
     */
    @PatchMapping("/approve-request")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> approveAuditRequest(
            @Valid @RequestBody ApproveAuditRequest request,
            HttpServletRequest servletRequest) {

        String username = "store_manager";
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.approveAuditRequest(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Audit request reviewed successfully", result));
    }

    /**
     * STEP 3 (Pharmacist): Submit counted quantities (Only if Manager approved)
     */
    @PutMapping("/submit-count")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> submitAuditCount(
            @Valid @RequestBody SubmitAuditCountRequest request,
            HttpServletRequest servletRequest) {

        String username = "pharmacist_duty";
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.submitAuditCount(request, username, clientIp);
        return ResponseEntity
                .ok(ApiResponse.success("Counted quantities submitted successfully for final review", result));
    }

    /**
     * STEP 4 (Store Manager): Final confirm/reconcile or reject (recount)
     */
    @PatchMapping("/review")
    public ResponseEntity<ApiResponse<InventoryAuditDto>> reviewAudit(
            @Valid @RequestBody InventoryAuditReviewRequest request,
            HttpServletRequest servletRequest) {

        String username = "store_manager";
        String clientIp = servletRequest.getRemoteAddr();
        InventoryAuditDto result = inventoryAuditService.reviewAudit(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Inventory audit final review completed successfully", result));
    }
}
