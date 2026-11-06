package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.procurement.PurchaseOrderActionRequest;
import com.pharmacy.dto.procurement.PurchaseOrderResponse;
import com.pharmacy.service.PurchaseOrderService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/procurement/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    /**
     * UC67: View Purchase Order List (with filters for search and status)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderResponse>>> getPurchaseOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<PurchaseOrderResponse> page = purchaseOrderService.getPurchaseOrders(pageable, search, status);
        return ResponseEntity
                .ok(ApiResponse.success("Purchase orders retrieved successfully", PageResponse.from(page)));
    }

    /**
     * UC67 Detail: View Purchase Order Details with Quotation Items
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrderDetail(@PathVariable Long id) {
        PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order details retrieved successfully", response));
    }

    /**
     * UC67 Action: General Manager Approves Purchase Order
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> approvePurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderActionRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = servletRequest.getRemoteAddr();
        PurchaseOrderResponse response = purchaseOrderService.approvePurchaseOrder(id, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Purchase order approved successfully", response));
    }

    /**
     * UC67 Action: General Manager Rejects Purchase Order
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> rejectPurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderActionRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = servletRequest.getRemoteAddr();
        PurchaseOrderResponse response = purchaseOrderService.rejectPurchaseOrder(id, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Purchase order rejected", response));
    }

}
