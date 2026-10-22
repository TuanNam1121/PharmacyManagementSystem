package com.pharmacy.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceUpdateRequest {

    @NotNull(message = "Giá vốn không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá vốn phải lớn hơn hoặc bằng 0")
    private BigDecimal costPrice;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal sellingPrice;

    private LocalDateTime effectiveFrom;

    @NotBlank(message = "Lý do thay đổi giá không được để trống")
    @Size(max = 500, message = "Lý do điều chỉnh giá tối đa 500 ký tự")
    private String reason;
}
