package com.pharmacy.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long accountId;
    private String accountUsername;
    private String accountFullName;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private LocalDateTime effectiveFrom;
    private String reason;
    private LocalDateTime createdAt;
}
