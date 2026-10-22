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

    // Function #45: Approve / Reject Inventory Adjustment
    InventoryAdjustmentResponse approveAdjustment(Long id, Long approverId);

    InventoryAdjustmentResponse rejectAdjustment(Long id, Long approverId, String reason);

    // Function #53: Manage Purchase Receipt (Create new incoming receipt)
    WarehousePurchaseHistoryResponse createPurchaseReceipt(CreatePurchaseReceiptRequest request, Long creatorId);

    // Function #54: Confirm Purchase Receipt (Inspect and accept goods into inventory)
    WarehousePurchaseHistoryResponse confirmPurchaseReceipt(Long id, Long confirmerId);

    // Function #48: Manage Purchase Requests
    Page<PurchaseRequestResponse> getPurchaseRequests(Pageable pageable, String search, Short status);

    PurchaseRequestResponse getPurchaseRequestDetail(Long id);

    PurchaseRequestResponse createPurchaseRequest(CreatePurchaseRequest request, Long creatorId);

    // Function #49: Manage Store Replenishment Requests
    Page<StoreReplenishmentResponse> getReplenishmentRequests(Pageable pageable, String search, Short status);

    StoreReplenishmentResponse getReplenishmentRequestDetail(Long id);

    // Function #50: Approve Store Replenishment Request
    StoreReplenishmentResponse approveReplenishmentRequest(Long id, Long approverId);

    // Function #51: Reject Store Replenishment Request
    StoreReplenishmentResponse rejectReplenishmentRequest(Long id, Long approverId, String reason);

    // Function #52: Confirm Goods Dispatch
    GoodsIssueResponse confirmGoodsDispatch(Long requisitionId, DispatchGoodsRequest request, Long dispatcherId);

    // Helper: Product list for dropdowns
    List<ProductOptionDto> getProductOptions();
}
