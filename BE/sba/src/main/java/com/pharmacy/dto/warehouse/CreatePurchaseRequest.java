package com.pharmacy.dto.warehouse;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequest {
    private String reason;

    @NotEmpty(message = "Product items list cannot be empty")
    private List<CreatePurchaseRequestItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePurchaseRequestItem {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Requested quantity is required")
        private Integer requestedQuantity;

        private String note;
    }
}
