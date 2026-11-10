package com.pharmacy.dto.rfq;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record SubmitQuotationRequest(
        @NotNull(message = "Items are required")
        List<QuotationItemDto> items
) {
    
    @Builder
    public record QuotationItemDto(
            @NotNull(message = "Item ID is required")
            Long itemId, // PurchaseRequestDetail id
            
            @NotNull(message = "Unit price is required")
            @Min (value = 0, message = "Unit price must be > 0")
            BigDecimal unitPrice,
            
            String note
    ) {}
}