package com.pharmacy.dto.payment;

import jakarta.validation.constraints.DecimalMin;
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
public class CreatePayOSPaymentRequest {
    private Long invoiceId;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "1000.0", message = "Số tiền thanh toán PayOS tối thiểu là 1.000 VNĐ")
    private BigDecimal amount;

    private String description;
}
