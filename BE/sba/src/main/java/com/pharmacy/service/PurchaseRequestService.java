package com.pharmacy.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.pharmacy.dto.warehouse.PurchaseRequestResponse;

public interface PurchaseRequestService {

    Page<PurchaseRequestResponse> getPurchaseRequests(Pageable pageable, String search, Short status);

    Page<PurchaseRequestResponse> getPurchaseRequestsByStatuses(Pageable pageable, List<Short> statuses);

    PurchaseRequestResponse getPurchaseRequestDetail(Long id);
}
