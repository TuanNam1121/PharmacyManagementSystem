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
public class PurchaseReceiptItemResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String unit;
    private String batchNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Integer orderQuantity;
    private Integer receivedQuantity;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
    private String locationCode;
}
