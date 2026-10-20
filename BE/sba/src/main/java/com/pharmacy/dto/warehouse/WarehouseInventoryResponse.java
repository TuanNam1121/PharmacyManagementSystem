package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseInventoryResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String unit;
    private String activeIngredient;
    private Long batchId;
    private String batchNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Long locationId;
    private String locationCode;
    private String aisle;
    private String shelf;
    private String bin;
    private Integer quantity;
    private BigDecimal costPrice;
    private BigDecimal totalValue;
    private Long daysToExpiry;
    private String expiryStatus; // SAFE, EXPIRING_SOON, EXPIRED
}
