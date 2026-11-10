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
}
