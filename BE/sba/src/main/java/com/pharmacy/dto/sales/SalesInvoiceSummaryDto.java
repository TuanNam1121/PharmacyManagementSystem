package com.pharmacy.dto.sales;

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
public class SalesInvoiceSummaryDto {
    private Long id;
    private String code;
    private String prescriptionCode;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private Short status; // 1: Completed, 2: Cancelled
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String paymentMethod; // "CASH", "BANK_TRANSFER", "VNPAY"
}