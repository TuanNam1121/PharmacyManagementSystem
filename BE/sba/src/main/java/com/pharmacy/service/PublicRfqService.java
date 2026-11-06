package com.pharmacy.service;

import com.pharmacy.dto.rfq.PublicRfqResponse;
import com.pharmacy.dto.rfq.SubmitQuotationRequest;

public interface PublicRfqService {
    PublicRfqResponse getRfqDetails(String rawToken);
    
    boolean submitQuotation(String rawToken, SubmitQuotationRequest request);
}