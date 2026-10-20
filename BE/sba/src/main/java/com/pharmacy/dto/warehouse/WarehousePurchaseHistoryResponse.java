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
public class WarehousePurchaseHistoryResponse {
    private Long id;
    private String code;
    private Short deliveryType;
    private String deliveryTypeLabel;
    private Short status;
    private String statusLabel;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private Integer itemCount;
    private List<PurchaseReceiptItemResponse> items;
}
