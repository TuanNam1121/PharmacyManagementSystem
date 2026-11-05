package com.pharmacy.dto.sales;

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
public class ShiftDetailResponse {
    private Long shiftId;
    private Long storeId;
    private String storeName;
    private Long accountId;
    private String cashierName;
    private LocalDateTime openingTime;
    private LocalDateTime closingTime;
    private BigDecimal openingCash;
    private BigDecimal closingCash;
    private BigDecimal calculatedCash;
    private BigDecimal difference;
    private String status; // OPEN, CLOSED, RECONCILED
    private Short statusCode;
    private String note;
}
