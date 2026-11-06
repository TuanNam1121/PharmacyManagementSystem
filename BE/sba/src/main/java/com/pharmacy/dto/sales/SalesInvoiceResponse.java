package com.pharmacy.dto.sales;

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
public class SalesInvoiceResponse {
    private Long invoiceId;
    private String invoiceCode;
    private Long storeId;
    private String storeName;
    private Long cashierId;
    private String cashierName;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerCode;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal paidAmount;
    private BigDecimal changeAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String invoiceStatus;
    private Short statusCode;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private Integer earnedPoints;
    private String prescriptionCode;
    private List<SalesInvoiceItemResponse> items;
}

