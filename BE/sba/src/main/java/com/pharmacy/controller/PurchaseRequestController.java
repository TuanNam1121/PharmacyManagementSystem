package com.pharmacy.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.warehouse.PurchaseRequestResponse;
import com.pharmacy.service.PurchaseRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/purchase-requests")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class PurchaseRequestController {

    private final PurchaseRequestService purchaseRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PurchaseRequestResponse>>> viewPurchaseRequestList(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) Short status,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<PurchaseRequestResponse> page = purchaseRequestService.getPurchaseRequests(pageable, search, status);
        PageResponse<PurchaseRequestResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase requests retrieved successfully", pageResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> viewPurchaseRequestDetail(
            @PathVariable Long id) {

        PurchaseRequestResponse data = purchaseRequestService.getPurchaseRequestDetail(id);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase request details retrieved successfully", data));
    }
}
