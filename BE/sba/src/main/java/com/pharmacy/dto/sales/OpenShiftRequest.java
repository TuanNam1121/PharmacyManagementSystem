package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenShiftRequest {
    @NotNull(message = "Chi nhánh không được để trống")
    private Long storeId;

    @NotNull(message = "Số tiền mặt đầu ca không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền đầu ca phải lớn hơn hoặc bằng 0")
    private BigDecimal openingCash;

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    private String note;
}

