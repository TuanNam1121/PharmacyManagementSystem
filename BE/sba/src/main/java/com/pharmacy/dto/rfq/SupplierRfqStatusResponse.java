package com.pharmacy.dto.rfq;

import com.pharmacy.entity.enums.RfqStatus;
import lombok.Builder;

/**
 * A supplier candidate for an RFQ, together with the RFQ state (if any) that
 * already exists for the purchase proposal being sourced. Powers the supplier
 * selection popup on the RFQ screen so purchasing staff can see, per supplier,
 * whether an RFQ has already been sent for the chosen purchase proposal.
 */
@Builder
public record SupplierRfqStatusResponse(
        Long id,
        String code,
        String name,
        String contactPerson,
        String email,
        /** True while an active RFQ already exists for this proposal (blocks re-send). */
        boolean rfqSent,
        /** Effective status of the latest RFQ (SENT / RESPONDED / EXPIRED / ...) or null. */
        RfqStatus rfqStatus,
        /** Code of the latest RFQ for this proposal or null. */
        String rfqCode,
        /** Sent time of the latest RFQ (dd/MM/yyyy HH:mm) or null. */
        String rfqSentAt
) {
}
