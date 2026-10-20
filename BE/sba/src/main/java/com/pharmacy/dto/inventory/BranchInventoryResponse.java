package com.pharmacy.dto.inventory;

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
public class BranchInventoryResponse {
    private Long id;
    private Long storeId;
    private String storeName;
    private Long productId;
    private String barcode;
    private String productName;
    private String unit;
    private String activeIngredient;
    private String manufacturer;
    private Boolean isPrescription;
    private Long batchId;
    private String batchNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Integer quantity;
    private Integer minQuantity;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal totalValue;
    private Long daysToExpiry;
    private String stockStatus; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    private String expiryStatus; // SAFE, EXPIRING_SOON, EXPIRED
    private String warningLevel; // NORMAL, WARNING, DANGER
    private String locationCode;
    private LocalDateTime updatedAt;
}
