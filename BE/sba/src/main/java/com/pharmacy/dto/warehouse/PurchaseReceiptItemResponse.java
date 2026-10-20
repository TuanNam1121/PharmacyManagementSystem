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
    private String productName;
    private String batchNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Integer orderQuantity;
    private Integer receivedQuantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
    private String locationCode;
}
