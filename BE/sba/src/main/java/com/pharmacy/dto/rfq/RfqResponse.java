package com.pharmacy.dto.rfq;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.enums.RfqStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Builder
public record RfqResponse(
        Long id,
        String code,
        Long supplierId,
        String supplierName,
        String supplierCode,
        Long purchaseProposalId,
        String purchaseProposalCode,
        String subject,
        String content,
        RfqStatus status,
        String sentAt,
        String responseAt,
        String expiredAt,
        String createdAt
) {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public static RfqResponse fromEntity(Rfq rfq) {
        if (rfq == null) return null;
        return RfqResponse.builder()
                .id(rfq.getId())
                .code(rfq.getCode())
                .supplierId(rfq.getSupplier() != null ? rfq.getSupplier().getId() : null)
                .supplierName(rfq.getSupplier() != null ? rfq.getSupplier().getName() : null)
                .supplierCode(rfq.getSupplier() != null ? rfq.getSupplier().getCode() : null)
                .purchaseProposalId(rfq.getPurchaseProposal() != null ? rfq.getPurchaseProposal().getId() : null)
                .purchaseProposalCode(rfq.getPurchaseProposal() != null ? rfq.getPurchaseProposal().getCode() : null)
                .subject(rfq.getSubject())
                .content(rfq.getContent())
                .status(rfq.getStatus())
                .sentAt(convertLocalDateTime(rfq.getSentAt()))
                .responseAt(convertLocalDateTime(rfq.getResponseAt()))
                .expiredAt(convertLocalDateTime(rfq.getExpiredAt()))
                .createdAt(convertLocalDateTime(rfq.getCreatedAt()))
                .build();
    }

    private static String convertLocalDateTime(LocalDateTime time) {
        if (time == null) {
            return null;
        }
        return time.format(DATE_FORMATTER);
    }
}