package com.pharmacy.dto.warehouse;

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
public class InventoryAdjustmentResponse {
    private Long id;
    private String storeName;
    private String productCode;
    private String productName;
    private String batchNumber;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private Integer difference;
    private BigDecimal valueImpact;
    private String reason;
    private Short type;
    private String typeLabel;
    private Short status;
    private String statusLabel;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
}
