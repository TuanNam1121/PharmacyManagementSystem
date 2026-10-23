package com.pharmacy.dto.procurement;

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
public class PurchaseOrderResponse {
    private Long id;
    private String code;
    private Long purchaseRequestId;
    private String purchaseRequestCode;
    private Long supplierQuotationId;
    private String supplierQuotationCode;
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private String createdByUsername;
    private String createdByFullName;
    private String approvedByUsername;
    private String approvedByFullName;
    private Short status;
    private String statusText;
    private String rejectReason;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<PurchaseOrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemDto {
        private Long id;
        private Long productId;
        private String productBarcode;
        private String productName;
        private String unit;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private BigDecimal subtotal;
    }
}
