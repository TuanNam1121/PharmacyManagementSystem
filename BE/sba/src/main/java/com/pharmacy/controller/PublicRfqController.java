package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.rfq.PublicRfqResponse;
import com.pharmacy.dto.rfq.SubmitQuotationRequest;
import com.pharmacy.service.PublicRfqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/rfq-portal")
@Tag(name = "Public RFQ Portal", description = "Public APIs for suppliers to respond to RFQs")
public class PublicRfqController {

    private final PublicRfqService publicRfqService;
    
    @Operation(summary = "Get RFQ details by token")
    @GetMapping
    public ResponseEntity<ApiResponse<PublicRfqResponse>> getRfqDetails(
            @RequestParam String token) {
        PublicRfqResponse data = publicRfqService.getRfqDetails(token);
        return ResponseEntity.ok(
                ApiResponse.success("RFQ details retrieved successfully", data));
    }
    
    @Operation(summary = "Submit quotation by supplier")
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Void>> submitQuotation(
            @RequestParam String token,
            @Valid @RequestBody SubmitQuotationRequest request) {
        boolean success = publicRfqService.submitQuotation(token, request);
        if (success) {
            ApiResponse<Void> body = ApiResponse.<Void>builder()
                    .status(HttpStatus.OK.value())
                    .message("Quotation submitted successfully")
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.ok(body);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                            "Failed to submit quotation"));
        }
    }
}