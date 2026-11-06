package com.pharmacy.dto.rfq;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.PurchaseProposalDetail;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record PublicRfqResponse(
        Long rfqId,
        String rfqCode,
        String subject,
        String content,
        LocalDateTime expiredAt,
        
        Long supplierId,
        String supplierName,
        String supplierCode,
        String contactPerson,
        String supplierEmail,
        
        Long purchaseProposalId,
        String purchaseProposalCode,
        LocalDateTime purchaseProposalCreatedAt,
        
        List<PublicRfqItemDto> items
) {
    
    public static PublicRfqResponse fromEntity(Rfq rfq, List<PublicRfqItemDto> items) {
        if (rfq == null) return null;
        var supplier = rfq.getSupplier();
        var proposal = rfq.getPurchaseProposal();
        return PublicRfqResponse.builder()
                .rfqId(rfq.getId())
                .rfqCode(rfq.getCode())
                .subject(rfq.getSubject())
                .content(rfq.getContent())
                .expiredAt(rfq.getExpiredAt())
                .supplierId(supplier != null ? supplier.getId() : null)
                .supplierName(supplier != null ? supplier.getName() : null)
                .supplierCode(supplier != null ? supplier.getCode() : null)
                .contactPerson(supplier != null ? supplier.getContactPerson() : null)
                .supplierEmail(supplier != null ? supplier.getEmail() : null)
                .purchaseProposalId(proposal != null ? proposal.getId() : null)
                .purchaseProposalCode(proposal != null ? proposal.getCode() : null)
                .purchaseProposalCreatedAt(proposal != null ? proposal.getCreatedAt() : null)
                .items(items != null ? items : List.of())
                .build();
    }

    @Builder
    public record PublicRfqItemDto(
            Long id,
            Long productId,
            String productCode,
            String productName,
            String unit,
            Integer requestedQuantity,
            String note,
            BigDecimal unitPrice,        // for supplier to fill
            String supplierNote          // for supplier to fill
    ) {

        public static PublicRfqItemDto fromEntity(PurchaseProposalDetail d) {
            if (d == null) return null;
            var p = d.getProduct();
            return PublicRfqItemDto.builder()
                    .id(d.getId())
                    .productId(p != null ? p.getId() : null)
                    .productCode(p != null ? p.getBarcode() : "")
                    .productName(p != null ? p.getName() : "")
                    .unit(p != null ? p.getUnit() : "")
                    .requestedQuantity(d.getQuantity())
                    .note(null)
                    .unitPrice(null)
                    .supplierNote(null)
                    .build();
        }
    }
}