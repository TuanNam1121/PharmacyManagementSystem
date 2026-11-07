package com.pharmacy.dto.rfq;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.entity.enums.SupplierStatus;
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
        Short purchaseProposalStatus,
        SupplierStatus supplierStatus,
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

        // An RFQ past its deadline without a response is reported as EXPIRED.
        RfqStatus effectiveStatus = rfq.getStatus();
        if (effectiveStatus == RfqStatus.SENT
                && rfq.getExpiredAt() != null
                && rfq.getExpiredAt().isBefore(LocalDateTime.now())) {
            effectiveStatus = RfqStatus.EXPIRED;
        }

        return RfqResponse.builder()
                .id(rfq.getId())
                .code(rfq.getCode())
                .supplierId(rfq.getSupplier() != null ? rfq.getSupplier().getId() : null)
                .supplierName(rfq.getSupplier() != null ? rfq.getSupplier().getName() : null)
                .supplierCode(rfq.getSupplier() != null ? rfq.getSupplier().getCode() : null)
                .purchaseProposalId(rfq.getPurchaseProposal() != null ? rfq.getPurchaseProposal().getId() : null)
                .purchaseProposalCode(rfq.getPurchaseProposal() != null ? rfq.getPurchaseProposal().getCode() : null)
                .purchaseProposalStatus(rfq.getPurchaseProposal() != null ? rfq.getPurchaseProposal().getStatus() : null)
                .supplierStatus(rfq.getSupplier() != null ? rfq.getSupplier().getStatus() : null)
                .subject(rfq.getSubject())
                .content(rfq.getContent())
                .status(effectiveStatus)
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