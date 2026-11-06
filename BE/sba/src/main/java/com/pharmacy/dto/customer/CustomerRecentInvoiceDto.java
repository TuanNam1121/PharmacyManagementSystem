package com.pharmacy.dto.customer;

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
public class CustomerRecentInvoiceDto {
    private Long invoiceId;
    private String invoiceCode;
    private LocalDateTime createdAt;
    private BigDecimal netAmount;
    private String status;
}
