package com.pharmacy.dto.sales;

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
public class SalesInvoiceItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private Long batchId;
    private String batchNumber;
    private LocalDate expiryDate;
    private String unit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String dosageInstruction;
}

