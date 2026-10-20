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

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tồn kho tổng thành công", pageResponse));
    }

    /**
     * Function #43: Assign Shelf/Bin Location
     */
    @PatchMapping("/inventory/{id}/location")
    public ResponseEntity<ApiResponse<WarehouseInventoryResponse>> assignLocation(
            @PathVariable Long id,
            @Valid @RequestBody AssignLocationRequest request) {

        WarehouseInventoryResponse response = warehouseInventoryService.assignLocation(id, request.getLocationId());
        return ResponseEntity.ok(ApiResponse.success("Gán vị trí ô/kệ thành công", response));
    }

    /**
     * Helper: Get all available warehouse shelf/bin locations
     */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<WarehouseLocationResponse>>> getLocations() {
        List<WarehouseLocationResponse> list = warehouseInventoryService.getLocations();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục vị trí ô/kệ thành công", list));
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
                .message("Tạo vị trí ô/kệ mới thành công")
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

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập kho thành công", pageResponse));
    }

    /**
     * Function #42 Detail: View Purchase Receipt Detail & items
     */
    @GetMapping("/purchase-history/{id}")
    public ResponseEntity<ApiResponse<WarehousePurchaseHistoryResponse>> getPurchaseReceiptDetail(
            @PathVariable Long id) {

        WarehousePurchaseHistoryResponse response = warehouseInventoryService.getPurchaseReceiptDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phiếu nhập kho thành công", response));
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
                .message("Tạo phiếu điều chỉnh tồn kho thành công")
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
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {

        Page<InventoryAdjustmentResponse> page = warehouseInventoryService.getAdjustments(pageable);
        PageResponse<InventoryAdjustmentResponse> pageResponse = PageResponse.from(page);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phiếu điều chỉnh thành công", pageResponse));
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
