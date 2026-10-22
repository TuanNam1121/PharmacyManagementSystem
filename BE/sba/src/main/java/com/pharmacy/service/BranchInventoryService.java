package com.pharmacy.service;

import com.pharmacy.dto.inventory.BranchInventoryResponse;
import com.pharmacy.dto.inventory.BranchInventorySummaryDto;
import com.pharmacy.dto.inventory.StockAuditCheckRequest;
import com.pharmacy.dto.inventory.UpdateStockThresholdRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BranchInventoryService {
    Page<BranchInventoryResponse> getBranchInventory(Long storeId, Pageable pageable, String search,
            String warningFilter);

    BranchInventorySummaryDto getBranchInventorySummary(Long storeId);

    BranchInventoryResponse getInventoryDetail(Long id);

    BranchInventoryResponse updateMinQuantity(UpdateStockThresholdRequest request, String username, String clientIp);

    void logStockAuditCheck(StockAuditCheckRequest request, String username, String clientIp);
}
