package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStockThresholdRequest {
    @NotNull(message = "productId không được để trống")
    private Long productId;

    @NotNull(message = "minQuantity không được để trống")
    @Min(value = 0, message = "Ngưỡng tồn tối thiểu không được âm")
    private Integer minQuantity;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
}
