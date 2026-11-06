package com.pharmacy.dto.rfq;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record SendRfqRequest(
        @NotNull(message = "Supplier ID is required")
        Long supplierId,
        
        @NotNull(message = "Purchase proposal ID is required")
        Long purchaseProposalId,
        
        @NotBlank(message = "Email subject is required")
        @Size(max = 300, message = "Subject cannot exceed 300 characters")
        String subject,
        
        @NotBlank(message = "Email content is required")
        @Size(max = 5000, message = "Content cannot exceed 5000 characters")
        String content
) {
}