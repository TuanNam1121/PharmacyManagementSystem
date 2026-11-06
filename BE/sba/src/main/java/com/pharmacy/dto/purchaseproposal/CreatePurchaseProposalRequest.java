package com.pharmacy.dto.purchaseproposal;

import jakarta.validation.constraints.NotEmpty;
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
     * One or more purchase requests to consolidate into a single proposal.
     */
    @NotEmpty(message = "At least one purchase request is required")
    private List<Long> purchaseRequestIds;
}
