package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.warehouse.*;
import com.pharmacy.service.WarehouseInventoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse")
@CrossOrigin(origins = "*")
public class WarehouseInventoryController {

    private final WarehouseInventoryService warehouseInventoryService;

    /**
     * Function #41: View Inventory (Warehouse Inventory)
     */
    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<PageResponse<WarehouseInventoryResponse>>> getWarehouseInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String expiryStatus,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<WarehouseInventoryResponse> page = warehouseInventoryService.getWarehouseInventory(pageable, search, expiryStatus);
        PageResponse<WarehouseInventoryResponse> pageResponse = PageResponse.from(page);

        return ResponseEntity.ok(ApiResponse.success("Warehouse inventory retrieved successfully", pageResponse));
    }

    /**
     * Function #43: Assign Shelf/Bin Location
     */
    @PatchMapping("/inventory/{id}/location")
    public ResponseEntity<ApiResponse<WarehouseInventoryResponse>> assignLocation(
            @PathVariable Long id,
            @Valid @RequestBody AssignLocationRequest request) {

        WarehouseInventoryResponse response = warehouseInventoryService.assignLocation(id, request.getLocationId());
        return ResponseEntity.ok(ApiResponse.success("Location assigned successfully", response));
    }

    /**
     * Helper: Get all available warehouse shelf/bin locations
     */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<WarehouseLocationResponse>>> getLocations() {
        List<WarehouseLocationResponse> list = warehouseInventoryService.getLocations();
        return ResponseEntity.ok(ApiResponse.success("Warehouse locations retrieved successfully", list));
    }

    /**
     * Helper: Create new warehouse location
     */
    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<WarehouseLocationResponse>> createLocation(
            @Valid @RequestBody CreateLocationRequest request) {

        WarehouseLocationResponse response = warehouseInventoryService.createLocation(request);
        ApiResponse<WarehouseLocationResponse> body = ApiResponse.<WarehouseLocationResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Warehouse location created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Function #42: View Purchase History
     */
    @GetMapping("/purchase-history")
    public ResponseEntity<ApiResponse<PageResponse<WarehousePurchaseHistoryResponse>>> getPurchaseHistory(
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<WarehousePurchaseHistoryResponse> page = warehouseInventoryService.getPurchaseHistory(pageable, search);
        PageResponse<WarehousePurchaseHistoryResponse> pageResponse = PageResponse.from(page);

        return ResponseEntity.ok(ApiResponse.success("Purchase history retrieved successfully", pageResponse));
    }

    /**
     * Function #42 Detail: View Purchase Receipt Detail & items
     */
    @GetMapping("/purchase-history/{id}")
    public ResponseEntity<ApiResponse<WarehousePurchaseHistoryResponse>> getPurchaseReceiptDetail(
            @PathVariable Long id) {

        WarehousePurchaseHistoryResponse response = warehouseInventoryService.getPurchaseReceiptDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase receipt details retrieved successfully", response));
    }

    /**
     * Function #44: Create Inventory Adjustment
     */
    @PostMapping("/inventory-adjustments")
    public ResponseEntity<ApiResponse<InventoryAdjustmentResponse>> createAdjustment(
            @Valid @RequestBody CreateAdjustmentRequest request) {

        InventoryAdjustmentResponse response = warehouseInventoryService.createAdjustment(request);
        ApiResponse<InventoryAdjustmentResponse> body = ApiResponse.<InventoryAdjustmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Inventory adjustment created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Function #44 List: View Inventory Adjustments List
     */
    @GetMapping("/inventory-adjustments")
    public ResponseEntity<ApiResponse<PageResponse<InventoryAdjustmentResponse>>> getAdjustments(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        Page<InventoryAdjustmentResponse> page = warehouseInventoryService.getAdjustments(pageable);
        PageResponse<InventoryAdjustmentResponse> pageResponse = PageResponse.from(page);

        return ResponseEntity.ok(ApiResponse.success("Inventory adjustments retrieved successfully", pageResponse));
    }

    /**
     * Function #45: Approve Inventory Adjustment
     */
    @PatchMapping("/inventory-adjustments/{id}/approve")
    public ResponseEntity<ApiResponse<InventoryAdjustmentResponse>> approveAdjustment(
            @PathVariable Long id,
            @RequestParam(required = false) Long approverId) {

        InventoryAdjustmentResponse response = warehouseInventoryService.approveAdjustment(id, approverId);
        return ResponseEntity.ok(ApiResponse.success("Inventory adjustment approved successfully", response));
    }

    /**
     * Function #45: Reject Inventory Adjustment
     */
    @PatchMapping("/inventory-adjustments/{id}/reject")
    public ResponseEntity<ApiResponse<InventoryAdjustmentResponse>> rejectAdjustment(
            @PathVariable Long id,
            @RequestParam(required = false) Long approverId,
            @RequestBody(required = false) RejectRequest request) {

        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Rejected by manager";
        InventoryAdjustmentResponse response = warehouseInventoryService.rejectAdjustment(id, approverId, reason);
        return ResponseEntity.ok(ApiResponse.success("Inventory adjustment rejected successfully", response));
    }

    /**
     * Function #53: Manage Purchase Receipt (Create new incoming receipt)
     */
    @PostMapping("/purchase-receipts")
    public ResponseEntity<ApiResponse<WarehousePurchaseHistoryResponse>> createPurchaseReceipt(
            @Valid @RequestBody CreatePurchaseReceiptRequest request,
            @RequestParam(required = false) Long creatorId) {

        WarehousePurchaseHistoryResponse response = warehouseInventoryService.createPurchaseReceipt(request, creatorId);
        ApiResponse<WarehousePurchaseHistoryResponse> body = ApiResponse.<WarehousePurchaseHistoryResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Purchase receipt created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Function #54: Confirm Purchase Receipt (Inspect & accept into stock)
     */
    @PatchMapping("/purchase-receipts/{id}/confirm")
    public ResponseEntity<ApiResponse<WarehousePurchaseHistoryResponse>> confirmPurchaseReceipt(
            @PathVariable Long id,
            @RequestParam(required = false) Long confirmerId) {

        WarehousePurchaseHistoryResponse response = warehouseInventoryService.confirmPurchaseReceipt(id, confirmerId);
        return ResponseEntity.ok(ApiResponse.success("Purchase receipt confirmed successfully, inventory updated", response));
    }

    /**
     * Function #48: Manage Purchase Requests - List
     */
    @GetMapping("/purchase-requests")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseRequestResponse>>> getPurchaseRequests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short status,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<PurchaseRequestResponse> page = warehouseInventoryService.getPurchaseRequests(pageable, search, status);
        PageResponse<PurchaseRequestResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(ApiResponse.success("Purchase requests retrieved successfully", pageResponse));
    }

    /**
     * Function #48: Manage Purchase Requests - Detail
     */
    @GetMapping("/purchase-requests/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> getPurchaseRequestDetail(@PathVariable Long id) {
        PurchaseRequestResponse response = warehouseInventoryService.getPurchaseRequestDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase request details retrieved successfully", response));
    }

    /**
     * Function #48: Manage Purchase Requests - Create
     */
    @PostMapping("/purchase-requests")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> createPurchaseRequest(
            @Valid @RequestBody CreatePurchaseRequest request,
            @RequestParam(required = false) Long creatorId) {

        PurchaseRequestResponse response = warehouseInventoryService.createPurchaseRequest(request, creatorId);
        ApiResponse<PurchaseRequestResponse> body = ApiResponse.<PurchaseRequestResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Purchase request created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Function #49: Manage Store Replenishment Requests - List
     */
    @GetMapping("/replenishment-requests")
    public ResponseEntity<ApiResponse<PageResponse<StoreReplenishmentResponse>>> getReplenishmentRequests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short status,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<StoreReplenishmentResponse> page = warehouseInventoryService.getReplenishmentRequests(pageable, search, status);
        PageResponse<StoreReplenishmentResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(ApiResponse.success("Store replenishment requests retrieved successfully", pageResponse));
    }

    /**
     * Function #49: Manage Store Replenishment Requests - Detail
     */
    @GetMapping("/replenishment-requests/{id}")
    public ResponseEntity<ApiResponse<StoreReplenishmentResponse>> getReplenishmentRequestDetail(@PathVariable Long id) {
        StoreReplenishmentResponse response = warehouseInventoryService.getReplenishmentRequestDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Replenishment request details retrieved successfully", response));
    }

    /**
     * Function #50: Approve Store Replenishment Request
     */
    @PatchMapping("/replenishment-requests/{id}/approve")
    public ResponseEntity<ApiResponse<StoreReplenishmentResponse>> approveReplenishmentRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long approverId) {

        StoreReplenishmentResponse response = warehouseInventoryService.approveReplenishmentRequest(id, approverId);
        return ResponseEntity.ok(ApiResponse.success("Replenishment request approved successfully", response));
    }

    /**
     * Function #51: Reject Store Replenishment Request
     */
    @PatchMapping("/replenishment-requests/{id}/reject")
    public ResponseEntity<ApiResponse<StoreReplenishmentResponse>> rejectReplenishmentRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long approverId,
            @RequestBody(required = false) RejectRequest request) {

        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Request rejected";
        StoreReplenishmentResponse response = warehouseInventoryService.rejectReplenishmentRequest(id, approverId, reason);
        return ResponseEntity.ok(ApiResponse.success("Replenishment request rejected successfully", response));
    }

    /**
     * Function #52: Confirm Goods Dispatch
     */
    @PostMapping("/replenishment-requests/{id}/dispatch")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> confirmGoodsDispatch(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) DispatchGoodsRequest request,
            @RequestParam(required = false) Long dispatcherId) {

        if (request == null) {
            request = new DispatchGoodsRequest("Standard Fleet", "Inter-store transfer");
        }
        GoodsIssueResponse response = warehouseInventoryService.confirmGoodsDispatch(id, request, dispatcherId);
        ApiResponse<GoodsIssueResponse> body = ApiResponse.<GoodsIssueResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Goods dispatched successfully for branch transfer")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Helper: Product catalog options for incoming receipts & requests
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductOptionDto>>> getProducts() {
        List<ProductOptionDto> list = warehouseInventoryService.getProductOptions();
        return ResponseEntity.ok(ApiResponse.success("Product catalog retrieved successfully", list));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }
}
