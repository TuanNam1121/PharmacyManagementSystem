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
public class InventoryAuditDto {
    private Long id;
    private String code;
    private Long storeId;
    private String storeName;
    private String requestedByUsername;
    private String countedByUsername;
    private String reviewedByUsername;
    private Short status; // 0=Requested, 1=ApprovedToCount, 2=Submitted, 3=Confirmed, 4=Rejected
    private String statusLabel;
    private LocalDate auditDate;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private List<InventoryAuditDetailDto> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryAuditDetailDto {
        private Long id;
        private Long productId;
        private String productName;
        private String batchNumber;
        private Integer systemQuantity;
        private Integer countedQuantity;
        private Integer variance;
        private String note;
    }
}
