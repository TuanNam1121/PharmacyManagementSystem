package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovedPurchaseProposalDto {
    private Long id;
    private String code;
    private Long supplierId;
    private String supplierName;
    private String supplierCode;
    private BigDecimal totalAmount;
    private LocalDateTime approvedAt;
    private List<ProposalItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposalItemDto {
        private Long productId;
        private String productCode;
        private String productName;
        private String unit;
        private Integer quantity;
        private BigDecimal unitCost;
        private Long suggestedLocationId;
        private String suggestedLocationCode;
        private Long unitId;
        private String unitName;
        private Integer conversionFactor;
    }
}
