package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.CreateStockRequisitionRequest;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import com.pharmacy.service.StockRequisitionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/stock-requisitions")
@CrossOrigin(origins = "*")
public class StockRequisitionController {

    private final StockRequisitionService stockRequisitionService;

    /**
     * Get list of internal stock requisitions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StockRequisitionDto>>> getRequisitionList(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<StockRequisitionDto> result = stockRequisitionService.getRequisitionList(storeId, status, search,
                pageable);
        return ResponseEntity.ok(ApiResponse.success("Stock requisitions retrieved successfully", result));
    }

    /**
     * View requisition details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockRequisitionDto>> getRequisitionDetail(@PathVariable Long id) {
        StockRequisitionDto result = stockRequisitionService.getRequisitionDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Stock requisition details retrieved successfully", result));
    }

    /**
     * Create a new stock requisition
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StockRequisitionDto>> createRequisition(
            @Valid @RequestBody CreateStockRequisitionRequest request) {
        StockRequisitionDto result = stockRequisitionService.createRequisition(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock requisition created successfully", result));
    }

    /**
     * Search products for stock requisition
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<com.pharmacy.dto.warehouse.ProductOptionDto>>> searchProducts(
            @RequestParam(required = false) String search) {
        List<com.pharmacy.dto.warehouse.ProductOptionDto> result = stockRequisitionService.searchProducts(search);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", result));
    }
}
