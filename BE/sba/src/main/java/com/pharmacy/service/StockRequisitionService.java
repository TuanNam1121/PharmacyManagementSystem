package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.CreateStockRequisitionRequest;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import com.pharmacy.dto.inventory.UpdateStockRequisitionRequest;
import com.pharmacy.dto.warehouse.ProductOptionDto;

import java.util.List;

import org.springframework.data.domain.Pageable;

public interface StockRequisitionService {

    /**
     * Get list of internal stock requisitions with pagination and filter
     */
    PageResponse<StockRequisitionDto> getRequisitionList(Long storeId, Short status, String search, Pageable pageable);

    /**
     * View detailed information of a stock requisition
     */
    StockRequisitionDto getRequisitionDetail(Long requisitionId);

    /**
     * Create a new internal stock requisition from branch to central warehouse
     */
    StockRequisitionDto createRequisition(CreateStockRequisitionRequest request);

    /**
     * Update item list of a requisition (only allowed before warehouse accepts it)
     */
    StockRequisitionDto updateRequisition(Long requisitionId, UpdateStockRequisitionRequest request);

    /**
     * Search product catalog from database by keyword
     */
    List<ProductOptionDto> searchProducts(String search);
}
