package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import org.springframework.data.domain.Pageable;

public interface StockRequisitionService {

    /** Get list of internal stock requisitions with pagination and filter */
    PageResponse<StockRequisitionDto> getRequisitionList(Long storeId, Short status, String search, Pageable pageable);

    /** View detailed information of a stock requisition */
    StockRequisitionDto getRequisitionDetail(Long requisitionId);
}
