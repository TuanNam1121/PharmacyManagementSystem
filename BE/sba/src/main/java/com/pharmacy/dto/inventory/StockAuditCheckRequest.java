package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StockAuditCheckRequest {
    @NotNull(message = "Store ID is required")
    private Long storeId;

    private Long inventoryId;

    @Size(max = 1000, message = "Audit note cannot exceed 1000 characters")
    private String note;
}
