package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.purchaseproposal.CreatePurchaseProposalRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.dto.warehouse.PurchaseRequestResponse;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import com.pharmacy.repository.PurchaseProposalRequestRepository;
import com.pharmacy.service.PurchaseProposalService;
import com.pharmacy.service.PurchaseRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/purchase-proposals")
@Tag(name = "Purchase Proposal Management", description = "APIs for managing purchase proposals")
public class PurchaseProposalController {

    private final PurchaseProposalService purchaseProposalService;
    private final PurchaseRequestService purchaseRequestService;
    private final PurchaseProposalRequestRepository purchaseProposalRequestRepository;

    @Operation(summary = "Create a new purchase proposal by aggregating one or more purchase requests")
    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseProposalResponse>> createPurchaseProposal(
            @Valid @RequestBody CreatePurchaseProposalRequest request) {

        PurchaseProposalResponse data = purchaseProposalService.createPurchaseProposal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase proposal created successfully", data));
    }

    @Operation(summary = "Get purchase proposals with filtering and pagination")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PurchaseProposalResponse>>> getPurchaseProposals(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short status,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<PurchaseProposalResponse> page = purchaseProposalService.getPurchaseProposals(search, status, pageable);
        PageResponse<PurchaseProposalResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase proposals retrieved successfully", pageResponse));
    }

    @Operation(summary = "Get purchase proposal detail by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseProposalResponse>> getPurchaseProposalDetail(@PathVariable Long id) {
        PurchaseProposalResponse data = purchaseProposalService.getPurchaseProposalDetail(id);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase proposal details retrieved successfully", data));
    }

    @Operation(summary = "Approve a purchase proposal")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseProposalResponse>> approvePurchaseProposal(@PathVariable Long id) {
        PurchaseProposalResponse data = purchaseProposalService.approvePurchaseProposal(id);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase proposal approved successfully", data));
    }

    @Operation(summary = "Reject a purchase proposal")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PurchaseProposalResponse>> rejectPurchaseProposal(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        PurchaseProposalResponse data = purchaseProposalService.rejectPurchaseProposal(id, reason);
        return ResponseEntity.ok(
                ApiResponse.success("Purchase proposal rejected successfully", data));
    }

    @Operation(summary = "Get eligible purchase requests (SUBMITTED and not yet aggregated) for creating proposals")
    @GetMapping("/eligible-requests")
    public ResponseEntity<ApiResponse<List<PurchaseRequestResponse>>> getEligiblePurchaseRequests() {
        List<PurchaseRequestResponse> requests = purchaseRequestService.getPurchaseRequestsByStatuses(
                Pageable.unpaged(),
                List.of(PurchaseRequestStatus.SUBMITTED.getCode()))
                .getContent().stream()
                .filter(r -> !purchaseProposalRequestRepository.existsByPurchaseRequestId(r.getId()))
                .toList();
        return ResponseEntity.ok(
                ApiResponse.success("Eligible purchase requests retrieved successfully", requests));
    }
}
