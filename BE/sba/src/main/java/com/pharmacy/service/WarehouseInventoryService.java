package com.pharmacy.service;

import com.pharmacy.dto.warehouse.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WarehouseInventoryService {

    // Function #41: View Inventory
    Page<WarehouseInventoryResponse> getWarehouseInventory(Pageable pageable, String search, String expiryStatus);

    // Function #43: Assign Shelf/Bin Location
    WarehouseInventoryResponse assignLocation(Long inventoryId, Long locationId);

    List<WarehouseLocationResponse> getLocations();

    WarehouseLocationResponse createLocation(CreateLocationRequest request);

    // Function #42: View Purchase History
    Page<WarehousePurchaseHistoryResponse> getPurchaseHistory(Pageable pageable, String search);

    WarehousePurchaseHistoryResponse getPurchaseReceiptDetail(Long id);

    // Function #44: Create Inventory Adjustment
    InventoryAdjustmentResponse createAdjustment(CreateAdjustmentRequest request);

    Page<InventoryAdjustmentResponse> getAdjustments(Pageable pageable);
}
