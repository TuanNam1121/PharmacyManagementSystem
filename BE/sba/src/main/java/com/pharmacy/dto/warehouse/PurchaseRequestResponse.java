package com.pharmacy.dto.warehouse;

import com.pharmacy.entity.Product;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.PurchaseRequestDetail;
import com.pharmacy.entity.enums.PurchaseRequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestResponse {
    private Long id;
    private String code;
    private String createdByUsername;
    private Short status; // 1 submitted, 2 RFQ sent, 3 proposal created, 4 completed, 5 cancelled
    private String statusText;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<PurchaseRequestItemDto> items;
    private Integer itemCount;

    public static PurchaseRequestResponse fromEntity(PurchaseRequest pr) {
        if (pr == null)
            return null;
        return PurchaseRequestResponse.builder()
                .id(pr.getId())
                .code(pr.getCode())
                .createdByUsername(pr.getCreatedBy() != null ? pr.getCreatedBy().getUsername() : "Warehouse Staff")
                .status(pr.getStatus())
                .statusText(PurchaseRequestStatus.resolveText(pr.getStatus()))
                .reason(pr.getReason())
                .createdAt(pr.getCreatedAt())
                .approvedAt(pr.getApprovedAt())
                .items(List.of())
                .itemCount(pr.getDetails() != null ? pr.getDetails().size() : 0)
                .build();
    }

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

        public static PurchaseRequestItemDto toItemDto(PurchaseRequestDetail detail) {
            if (detail == null) {
                return null;
            }

            Product product = detail.getProduct();

            return PurchaseRequestItemDto.builder()
                    .id(detail.getId())
                    .productId(product != null ? product.getId() : null)
                    .productCode(product != null && product.getBarcode() != null ? product.getBarcode() : "")
                    .productName(product != null && product.getName() != null ? product.getName() : "")
                    .unit(product != null && product.getUnit() != null ? product.getUnit() : "")
                    .requestedQuantity(detail.getRequestedQuantity())
                    .note(detail.getNote())
                    .build();
        }

        public static List<PurchaseRequestItemDto> toItemDtoList(List<PurchaseRequestDetail> details) {
            if (details == null) {
                return Collections.emptyList();
            }
            return details.stream()
                    .map(PurchaseRequestItemDto::toItemDto)
                    .toList();
        }
    }
}
