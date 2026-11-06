package com.pharmacy.service;

import com.pharmacy.dto.purchaseproposal.CreatePurchaseProposalRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PurchaseProposalService {

    PurchaseProposalResponse createPurchaseProposal(CreatePurchaseProposalRequest request);

    Page<PurchaseProposalResponse> getPurchaseProposals(String search, Short status, Pageable pageable);

    PurchaseProposalResponse getPurchaseProposalDetail(Long id);

    PurchaseProposalResponse approvePurchaseProposal(Long id);

    PurchaseProposalResponse rejectPurchaseProposal(Long id, String reason);
}
