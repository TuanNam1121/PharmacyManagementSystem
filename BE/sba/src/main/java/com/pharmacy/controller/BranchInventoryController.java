package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.BranchInventoryResponse;
import com.pharmacy.dto.inventory.BranchInventorySummaryDto;
import com.pharmacy.dto.inventory.StockAuditCheckRequest;
import com.pharmacy.dto.inventory.UpdateStockThresholdRequest;
import com.pharmacy.service.BranchInventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-inventory")
@CrossOrigin(origins = "*")
public class BranchInventoryController {

    private final BranchInventoryService branchInventoryService;

    /**
     * Get branch inventory with pagination, search, and warning level filter
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BranchInventoryResponse>>> getBranchInventory(
            @RequestParam(defaultValue = "1") Long storeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String warningFilter,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<BranchInventoryResponse> page = branchInventoryService.getBranchInventory(storeId, pageable, search,
                warningFilter);
        return ResponseEntity
                .ok(ApiResponse.success("Branch inventory retrieved successfully", PageResponse.from(page)));
    }

    /**
     * Get branch inventory summary and warning metrics
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<BranchInventorySummaryDto>> getBranchInventorySummary(
            @RequestParam(defaultValue = "1") Long storeId) {

        BranchInventorySummaryDto summary = branchInventoryService.getBranchInventorySummary(storeId);
        return ResponseEntity.ok(ApiResponse.success("Branch inventory summary retrieved successfully", summary));
    }

    /**
     * View inventory item details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchInventoryResponse>> getInventoryDetail(@PathVariable Long id) {
        BranchInventoryResponse response = branchInventoryService.getInventoryDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Inventory detail retrieved successfully", response));
    }

    /**
     * Update product minimum stock threshold
     */
    @PatchMapping("/threshold")
    public ResponseEntity<ApiResponse<BranchInventoryResponse>> updateMinQuantity(
            @Valid @RequestBody UpdateStockThresholdRequest request,
            HttpServletRequest servletRequest) {

        String username = "store_manager_or_pharmacist";
        String clientIp = servletRequest.getRemoteAddr();
        BranchInventoryResponse response = branchInventoryService.updateMinQuantity(request, username, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Stock threshold updated successfully", response));
    }

    /**
     * Confirm stock audit check and record AuditLog
     */
    @PostMapping("/audit-check")
    public ResponseEntity<ApiResponse<String>> logStockAuditCheck(
            @Valid @RequestBody StockAuditCheckRequest request,
            HttpServletRequest servletRequest) {

        String username = "pharmacist_duty";
        String clientIp = servletRequest.getRemoteAddr();
        branchInventoryService.logStockAuditCheck(request, username, clientIp);
        return ResponseEntity
                .ok(ApiResponse.success("Stock audit inspection recorded successfully", "Audit Log ID saved"));
    }
}
