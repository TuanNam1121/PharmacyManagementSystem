package com.pharmacy.dto.purchaseproposal;

import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.PurchaseProposalRequest;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.PurchaseRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private Long supplierQuotationId;
    private String supplierQuotationCode;
    private Long supplierId;
    private String supplierName;
    private BigDecimal totalAmount;

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
                .supplierQuotationId(pp.getSupplierQuotation() != null ? pp.getSupplierQuotation().getId() : null)
                .supplierQuotationCode(pp.getSupplierQuotation() != null ? pp.getSupplierQuotation().getCode() : null)
                .supplierId(pp.getSupplierQuotation() != null && pp.getSupplierQuotation().getSupplier() != null
                        ? pp.getSupplierQuotation().getSupplier().getId() : null)
                .supplierName(pp.getSupplierQuotation() != null && pp.getSupplierQuotation().getSupplier() != null
                        ? pp.getSupplierQuotation().getSupplier().getName() : null)
                .totalAmount(pp.getTotalAmount())
                .build();
    }

    /**
     * Like {@link #fromEntity(PurchaseProposal)} but overlays the pricing of the
     * winning supplier quotation (unit price, tax rate and line subtotal) onto each
     * consolidated item. Used by the detail endpoint once a supplier has been chosen
     * so the proposal shows the selected supplier and the agreed prices instead of a
     * bare requested-quantity list.
     */
    public static PurchaseProposalResponse fromEntity(PurchaseProposal pp,
            List<SupplierQuotationDetail> winnerDetails) {
        PurchaseProposalResponse response = fromEntity(pp);
        if (response == null || winnerDetails == null || winnerDetails.isEmpty()
                || response.getItems() == null || response.getItems().isEmpty()) {
            return response;
        }

        Map<Long, SupplierQuotationDetail> quotedByProductId = winnerDetails.stream()
                .filter(d -> d != null && d.getProduct() != null && d.getProduct().getId() != null)
                .collect(Collectors.toMap(d -> d.getProduct().getId(), d -> d, (existing, replacement) -> existing));

        for (ProposalItemDto item : response.getItems()) {
            SupplierQuotationDetail detail = quotedByProductId.get(item.getProductId());
            if (detail == null) {
                continue;
            }
            item.setUnitPrice(detail.getUnitPrice());
            item.setTaxRate(detail.getTaxRate());
            item.setSubtotal(resolveSubtotal(detail));
        }

        return response;
    }

    /**
     * Uses the persisted {@code subtotal} formula value when available, otherwise
     * recomputes {@code quantity * unitPrice * (1 + taxRate/100)}.
     */
    private static BigDecimal resolveSubtotal(SupplierQuotationDetail detail) {
        if (detail.getSubtotal() != null) {
            return detail.getSubtotal();
        }
        if (detail.getUnitPrice() == null || detail.getQuantity() == null) {
            return null;
        }
        BigDecimal taxRate = detail.getTaxRate() != null ? detail.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxMultiplier = BigDecimal.ONE.add(taxRate.divide(BigDecimal.valueOf(100)));
        return detail.getUnitPrice()
                .multiply(BigDecimal.valueOf(detail.getQuantity()))
                .multiply(taxMultiplier);
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
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private BigDecimal subtotal;

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
