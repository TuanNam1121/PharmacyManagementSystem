package com.pharmacy.dto.purchaseproposal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseProposalRequest {

    /**
     * Optional purchase requests to consolidate into a single proposal.
     */
    private List<Long> purchaseRequestIds;

    /**
     * Optional direct items chosen proactively by purchasing staff.
     */
    private List<CreateProposalItemRequest> items;

    /**
     * Proactive purchase justification/note (e.g. good price, promotional discount).
     */
    private String note;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProposalItemRequest {
        private Long productId;
        private Integer quantity;
        private String note;
    }
}
