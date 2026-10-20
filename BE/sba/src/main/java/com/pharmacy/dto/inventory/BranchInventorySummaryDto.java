package com.pharmacy.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchInventorySummaryDto {
    private Long storeId;
    private String storeName;
    private Integer totalProducts;
    private Integer totalBatches;
    private Integer totalUnits;
    private BigDecimal totalInventoryValue;
    private Integer lowStockCount;
    private Integer expiringSoonCount;
    private Integer expiredCount;
    private Integer outOfStockCount;
}
