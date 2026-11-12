package com.pharmacy.service;

import com.pharmacy.dto.rfq.RfqResponse;
import com.pharmacy.dto.rfq.RfqQuotationResponse;
import com.pharmacy.dto.rfq.CompareResponse;
import com.pharmacy.dto.rfq.SendRfqRequest;
import com.pharmacy.dto.rfq.SupplierRfqStatusResponse;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.enums.RfqStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RfqService {
    
    List<PurchaseProposalResponse> getEligiblePurchaseProposals();
    
    /**
     * Active suppliers together with the RFQ status they hold for the given
     * purchase proposal. Used by the supplier selection popup when sending RFQs.
     */
    List<SupplierRfqStatusResponse> getSupplierRfqStatuses(Long purchaseProposalId);
    
    RfqResponse sendRfq(SendRfqRequest request);
    
    Page<RfqResponse> getRfqsBySupplier(Long supplierId, Pageable pageable);
    
    RfqResponse getRfqById(Long rfqId);
    
    Page<RfqResponse> getRfqsWithFilters(String search, RfqStatus status, Long supplierId, Long purchaseProposalId, Pageable pageable);
    
    RfqQuotationResponse getRfqWithQuotationDetails(Long rfqId);
    
    CompareResponse compareRfqs(List<Long> rfqIds);
}