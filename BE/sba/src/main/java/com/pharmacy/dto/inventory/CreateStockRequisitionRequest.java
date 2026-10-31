package com.pharmacy.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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
public class CreateStockRequisitionRequest {

    @NotNull(message = "Store ID is required")
    private Long storeId;

    private String createdByUsername;

    @NotEmpty(message = "At least one product item is required")
    @Valid
    private List<ItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Requested quantity is required")
        @Min(value = 1, message = "Requested quantity must be at least 1")
        private Integer requestedQty;
    }
}
