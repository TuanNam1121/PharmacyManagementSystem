package com.pharmacy.dto.warehouse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdjustmentRequest {
    private Long inventoryId;
    private Long storeId;

    @NotNull(message = "Product ID must not be null")
    private Long productId;

    @NotNull(message = "Batch ID must not be null")
    private Long batchId;

    @NotNull(message = "Target quantity must not be null")
    private Integer quantityAfter;

    @NotBlank(message = "Adjustment reason is required")
    private String reason;

    @NotNull(message = "Adjustment type is required")
    private Short type; // 1: Hỏng vỡ (Damaged), 2: Hết hạn (Expired), 3: Kiểm kê (Cycle Count Variance), 4: Khác (Other)
}
