package com.pharmacy.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfitReportResponse {

    // Filter Info
    private LocalDate startDate;
    private LocalDate endDate;
    private Long storeId;
    private String storeName;

    // Financial KPI Summary
    private BigDecimal totalRevenue; // Total Gross Sales
    private BigDecimal totalCost; // Cost of Goods Sold (COGS)
    private BigDecimal grossProfit; // Revenue - COGS
    private BigDecimal grossMarginPercentage; // (Gross Profit / Revenue) * 100
    private Long totalInvoices; // Total Paid Invoices
    private BigDecimal averageOrderValue; // Revenue / Total Invoices

    // Breakdowns
    private List<ProductProfitDto> topProducts;
    private List<StoreProfitDto> storeBreakdown;
    private List<DailyProfitTrendDto> dailyTrends;

    // Metadata & Audit
    private LocalDateTime generatedAt;
    private String generatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductProfitDto {
        private Long productId;
        private String barcode;
        private String productName;
        private String unit;
        private Integer quantitySold;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal grossProfit;
        private BigDecimal marginPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreProfitDto {
        private Long storeId;
        private String storeCode;
        private String storeName;
        private Long invoiceCount;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal grossProfit;
        private BigDecimal marginPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyProfitTrendDto {
        private LocalDate date;
        private Long invoiceCount;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal grossProfit;
        private BigDecimal marginPercentage;
    }
}
