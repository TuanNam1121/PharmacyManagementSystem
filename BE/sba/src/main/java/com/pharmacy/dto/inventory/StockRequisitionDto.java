package com.pharmacy.dto.inventory;

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
public class StockRequisitionDto {
    private Long id;
    private String code;
    private Long storeId;
    private String storeName;
    private String createdByUsername;
    private String approvedByUsername;

    /**
     * 0 = PENDING, 1 = APPROVED, 2 = DISPATCHED, 3 = RECEIVED, 4 = REJECTED
     */
    private Short status;
    private String statusLabel;

    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime receivedAt;

    private List<DetailDto> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailDto {
        private Long id;
        private Long productId;
        private String productName;
        private String productUnit;
        private String barcode;
        private Integer requestedQty;
        private Integer approvedQty;
        private Integer receivedQty;
    }
}
