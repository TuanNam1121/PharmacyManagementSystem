package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestResponse {
    private Long id;
    private String code;
    private String createdByUsername;
    private Short status; // 0 draft, 1 submitted, 2 RFQ sent, 3 proposal created, 4 completed, 5 cancelled
    private String statusText;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<PurchaseRequestItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseRequestItemDto {
        private Long id;
        private Long productId;
        private String productCode;
        private String productName;
        private String unit;
        private Integer requestedQuantity;
        private String note;
    }
}
