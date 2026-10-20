package com.pharmacy.dto;

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
public class ShiftSummaryDto {
    private Long id;
    private String cashierUsername;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal openingCash;
    private BigDecimal closingCash;
    private BigDecimal expectedCash;
    private BigDecimal difference;
    private Short status; // 1: Đang mở, 2: Đã đóng
    private String note;
}