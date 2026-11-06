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
public class ShiftSummaryResponse {
    private Long shiftId;
    private String cashierName;
    private String storeName;
    private LocalDateTime openingTime;
    private BigDecimal openingCash;
    private Integer totalInvoices;
    private BigDecimal cashSales;
    private BigDecimal qrSales;
    private BigDecimal cardSales;
    private BigDecimal totalSales;
    private BigDecimal refundCash;
    private BigDecimal expectedCash;
}

