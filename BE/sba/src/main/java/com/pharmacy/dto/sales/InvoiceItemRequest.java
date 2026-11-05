package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    private Long productId;

    private Long batchId; // if null, system selects nearest expiring batch (FEFO)

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private Integer quantity;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Đơn giá không được âm")
    private BigDecimal unitPrice;

    private String dosageInstruction;
}
