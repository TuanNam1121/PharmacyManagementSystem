package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailySalesReconcileRequest {
    @NotNull(message = "storeId không được để trống")
    private Long storeId;

    @NotNull(message = "businessDate không được để trống")
    private LocalDate businessDate;

    @NotNull(message = "Số tiền mặt thực tế không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền thực tế không được âm")
    private BigDecimal actualCash;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String note;
}