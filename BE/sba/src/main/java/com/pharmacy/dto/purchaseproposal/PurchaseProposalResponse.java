package com.pharmacy.dto.purchaseproposal;

import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
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
public class PurchaseProposalResponse {

    private Long id;
    private String code;
    private List<ProposalRequestDto> purchaseRequests;
    private List<ProposalItemDto> items;
    private Short status;
    private String statusText;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String rejectReason;

    public static PurchaseProposalResponse fromEntity(PurchaseProposal pp) {
        if (pp == null) {
            return null;
        }

        List<ProposalRequestDto> requestDtos = pp.getRequests() == null ? Collections.emptyList()
                : pp.getRequests().stream()
                        .map(PurchaseProposalRequest::getPurchaseRequest)
                        .filter(java.util.Objects::nonNull)
                        .map(ProposalRequestDto::fromEntity)
                        .toList();

        List<ProposalItemDto> itemDtos = pp.getDetails() == null ? Collections.emptyList()
                : pp.getDetails().stream()
                        .map(ProposalItemDto::fromEntity)
                        .toList();

        return PurchaseProposalResponse.builder()
                .id(pp.getId())
                .code(pp.getCode())
                .purchaseRequests(requestDtos)
                .items(itemDtos)
                .status(pp.getStatus())
                .statusText(PurchaseProposalStatus.resolveText(pp.getStatus()))
                .createdById(pp.getCreatedBy() != null ? pp.getCreatedBy().getId() : null)
                .createdByUsername(pp.getCreatedBy() != null ? pp.getCreatedBy().getUsername() : null)
                .createdAt(pp.getCreatedAt())
                .approvedAt(pp.getApprovedAt())
                .rejectReason(pp.getRejectReason())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposalRequestDto {
        private Long id;
        private String code;
        private Short status;
        private String statusText;
        private LocalDateTime createdAt;

        public static ProposalRequestDto fromEntity(PurchaseRequest pr) {
            if (pr == null) {
                return null;
            }
            return ProposalRequestDto.builder()
                    .id(pr.getId())
                    .code(pr.getCode())
                    .status(pr.getStatus())
                    .statusText(PurchaseRequestStatus.resolveText(pr.getStatus()))
                    .createdAt(pr.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposalItemDto {
        private Long productId;
        private String productCode;
        private String productName;
        private String unit;
        private Integer quantity;

        public static ProposalItemDto fromEntity(PurchaseProposalDetail d) {
            if (d == null) {
                return null;
            }
            var p = d.getProduct();
            return ProposalItemDto.builder()
                    .productId(p != null ? p.getId() : null)
                    .productCode(p != null ? p.getBarcode() : "")
                    .productName(p != null ? p.getName() : "")
                    .unit(p != null ? p.getUnit() : "")
                    .quantity(d.getQuantity())
                    .build();
        }
    }
}
