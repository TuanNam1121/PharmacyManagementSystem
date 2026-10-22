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
public class GoodsIssueResponse {
    private Long id;
    private String code;
    private String requisitionCode;
    private String fromStoreName;
    private String toStoreName;
    private Short status;
    private String statusText;
    private String carrier;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private List<GoodsIssueItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoodsIssueItemDto {
        private Long id;
        private Long productId;
        private String productCode;
        private String productName;
        private String batchNumber;
        private Integer quantity;
    }
}
