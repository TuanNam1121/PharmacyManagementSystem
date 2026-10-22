package com.pharmacy.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptDto {
    private Long id;
    private String code;

    // Linked Requisition
    private Long stockRequisitionId;
    private String stockRequisitionCode;

    // From and To stores
    private Long fromStoreId;
    private String fromStoreName;
    private Long toStoreId;
    private String toStoreName;

    // Status and Carrier
    private Short status;
    private String statusLabel;
    private String carrier;
    private String note;

    // Personnel and Timestamps
    private String createdByUsername;
    private String dispatchedByUsername;
    private String receivedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime receivedAt;

    // Quantity summaries
    private Integer totalItems;
    private Integer totalQuantity;
    private Integer totalReceivedQuantity;

    // Detailed item lines
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

        private Long batchId;
        private String batchNumber;
        private LocalDate expiryDate;
        private LocalDate manufactureDate;

        private Integer quantity; // Dispatched quantity from central warehouse
        private Integer receivedQuantity; // Actual received quantity at branch
        private Integer difference; // Discrepancy (received - dispatched)
    }
}
