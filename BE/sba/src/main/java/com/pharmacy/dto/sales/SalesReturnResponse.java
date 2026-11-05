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
public class SalesReturnResponse {
    private Long returnId;
    private String returnCode;
    private Long invoiceId;
    private String invoiceCode;
    private BigDecimal refundAmount;
    private String refundMethod;
    private String reason;
    private LocalDateTime createdAt;
    private String processedByName;
}

