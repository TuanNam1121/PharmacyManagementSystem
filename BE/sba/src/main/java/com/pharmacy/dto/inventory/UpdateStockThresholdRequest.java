package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStockThresholdRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Minimum quantity is required")
    @Min(value = 0, message = "Minimum stock threshold cannot be negative")
    private Integer minQuantity;

    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;
}
