package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailySalesReconcileRequest {
    @NotNull(message = "Store ID is required")
    private Long storeId;

    @NotNull(message = "Business date is required")
    private LocalDate businessDate;

    @NotNull(message = "Actual cash amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Actual cash amount cannot be negative")
    private BigDecimal actualCash;

    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    private String note;
}