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
public class InventoryReportResponse {

    private Long storeId;
    private String storeName;
    private String filterStatus;

    // Financial Valuation Metrics
    private BigDecimal totalValuationCost; // Sum(qty * costPrice)
    private BigDecimal totalValuationRetail; // Sum(qty * sellingPrice)
    private BigDecimal potentialProfit; // Retail - Cost
    private BigDecimal potentialMarginPercentage;// (Potential Profit / Retail) * 100

    // Volume & Alert Counts
    private Long totalUnitsInStock;
    private Long totalSkus;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Long expiringSoonCount;

    // Detailed lists
    private List<InventoryItemDto> items;
    private List<StoreValuationDto> storeBreakdown;
    private List<StockMovementReportDto> movements;

    private LocalDateTime generatedAt;
    private String generatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItemDto {
        private Long inventoryId;
        private Long productId;
        private String barcode;
        private String productName;
        private String unit;
        private String batchNumber;
        private LocalDate expiryDate;
        private Long daysUntilExpiry;
        private String expiryStatus; // SAFE, EXPIRING_SOON, EXPIRED
        private Long storeId;
        private String storeCode;
        private String storeName;
        private Integer quantity;
        private Integer minQuantity;
        private String stockStatus; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
        private BigDecimal costPrice;
        private BigDecimal sellingPrice;
        private BigDecimal valuationCost;
        private BigDecimal valuationRetail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreValuationDto {
        private Long storeId;
        private String storeCode;
        private String storeName;
        private Long totalSkus;
        private Long totalUnits;
        private BigDecimal valuationCost;
        private BigDecimal valuationRetail;
        private BigDecimal potentialProfit;
        private BigDecimal potentialMarginPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockMovementReportDto {
        private Long id;
        private LocalDateTime createdAt;
        private String storeCode;
        private String storeName;
        private String productName;
        private String barcode;
        private String batchNumber;
        private Short movementType;
        private String movementTypeName;
        private Integer quantityChange;
        private Integer quantityAfter;
        private String referenceType;
        private Long referenceId;
        private String createdByName;
        private String note;
    }
}
