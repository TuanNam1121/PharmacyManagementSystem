package com.pharmacy.controller;
import lombok.extern.slf4j.Slf4j;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.rfq.RfqResponse;
import com.pharmacy.dto.rfq.SendRfqRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.service.RfqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import com.pharmacy.dto.rfq.RfqQuotationResponse;
import com.pharmacy.dto.rfq.CompareResponse;
import com.pharmacy.entity.enums.RfqStatus;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rfq")
@Tag(name = "RFQ Management", description = "APIs for managing RFQs")
public class RfqController {

    private final RfqService rfqService;
    
    @Operation(summary = "Get eligible purchase proposals ready for RFQ")
    @GetMapping("/proposals/eligible")
    public ResponseEntity<ApiResponse<List<PurchaseProposalResponse>>> getEligiblePurchaseProposals() {
        List<PurchaseProposalResponse> data = rfqService.getEligiblePurchaseProposals();
        return ResponseEntity.ok(
                ApiResponse.success("Eligible purchase proposals retrieved successfully", data));
    }
    
    @Operation(summary = "Send RFQ to supplier")
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<RfqResponse>> sendRfq(@Valid @RequestBody SendRfqRequest request) {
        RfqResponse data = rfqService.sendRfq(request);
        ApiResponse<RfqResponse> body = ApiResponse.<RfqResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("RFQ sent successfully")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
    
    @Operation(summary = "Get RFQs by supplier")
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<PageResponse<RfqResponse>>> getRfqsBySupplier(
            @PathVariable Long supplierId,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<RfqResponse> page = rfqService.getRfqsBySupplier(supplierId, pageable);
        PageResponse<RfqResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(
                ApiResponse.success("RFQs retrieved successfully", pageResponse));
    }
    
    @Operation(summary = "Get RFQ by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RfqResponse>> getRfqById(@PathVariable Long id) {
        RfqResponse data = rfqService.getRfqById(id);
        return ResponseEntity.ok(
                ApiResponse.success("RFQ details retrieved successfully", data));
    }
    
    @Operation(summary = "Get RFQs with filtering and pagination")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RfqResponse>>> getRfqs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RfqStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long purchaseProposalId,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<RfqResponse> page = rfqService.getRfqsWithFilters(search, status, supplierId, purchaseProposalId, pageable);
        PageResponse<RfqResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(
                ApiResponse.success("RFQs retrieved successfully", pageResponse));
    }
    
    @Operation(summary = "Get RFQ details with quotation items")
    @GetMapping("/{id}/quotation")
    public ResponseEntity<ApiResponse<RfqQuotationResponse>> getRfqQuotationDetails(@PathVariable Long id) {
        RfqQuotationResponse data = rfqService.getRfqWithQuotationDetails(id);
        return ResponseEntity.ok(
                ApiResponse.success("RFQ quotation details retrieved successfully", data));
    }
    
    @Operation(summary = "Compare multiple RFQs")
    @GetMapping("/compare")
    public ResponseEntity<ApiResponse<CompareResponse>> compareRfqs(
            @RequestParam List<Long> ids) {
        try {
            CompareResponse data = rfqService.compareRfqs(ids);
            return ResponseEntity.ok(
                    ApiResponse.success("RFQ comparison generated successfully", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("Error comparing RFQs: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "Failed to generate comparison: " + e.getMessage()));
        }
    }
}