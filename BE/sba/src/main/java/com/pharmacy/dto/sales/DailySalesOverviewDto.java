package com.pharmacy.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesOverviewDto {
    private Long storeId;
    private String storeName;
    private String storeCode;
    private LocalDate businessDate;

    // System revenue computed from sales invoices and cashier shifts
    private BigDecimal systemCash;
    private BigDecimal systemBank;
    private BigDecimal systemVnpay;
    private BigDecimal systemTotal;

    // Actual count from Store Manager
    private BigDecimal actualCash;
    private BigDecimal difference;
    private Short status; // 0: Open / Draft, 1: Reconciled
    private String note;

    // Reconciled by and timestamp
    private Long reconciledById;
    private String reconciledByName;
    private LocalDateTime reconciledAt;

    // Metrics
    private Integer totalInvoices;
    private Integer totalShifts;
    private Double growthPercentageVsYesterday;
}