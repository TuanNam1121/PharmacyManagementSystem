package com.pharmacy.dto.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class ProcessPaymentRequest {
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // CASH, BANK_TRANSFER, VNPAY_QR

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền thanh toán phải lớn hơn hoặc bằng 0")
    private BigDecimal amountPaid;

    private BigDecimal tenderedCash; // Tiền khách đưa (cho tiền mặt)

    private String transactionRef; // Mã giao dịch ngân hàng / cổng thanh toán nếu có
}

