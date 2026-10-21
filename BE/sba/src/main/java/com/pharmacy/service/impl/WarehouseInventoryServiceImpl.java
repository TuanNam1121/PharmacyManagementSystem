package com.pharmacy.service.impl;

import com.pharmacy.dto.warehouse.*;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.*;
import com.pharmacy.repository.*;
import com.pharmacy.service.WarehouseInventoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseInventoryServiceImpl implements WarehouseInventoryService {

    private final InventoryRepository inventoryRepository;
    private final WarehouseLocationRepository locationRepository;
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final PurchaseReceiptDetailRepository purchaseReceiptDetailRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StoreRepository storeRepository;
    private final AccountRepository accountRepository;
    private final SupplierRepository supplierRepository;
    private final StockRequisitionRepository stockRequisitionRepository;
    private final StockRequisitionDetailRepository stockRequisitionDetailRepository;
    private final GoodsIssueRepository goodsIssueRepository;
    private final GoodsIssueDetailRepository goodsIssueDetailRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;

    /* =========================================================================
       FUNCTION #41: VIEW INVENTORY
       ========================================================================= */
    @Override
    @Transactional(readOnly = true)
    public Page<WarehouseInventoryResponse> getWarehouseInventory(Pageable pageable, String search, String expiryStatus) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Inventory> page = inventoryRepository.searchWarehouseInventory(querySearch, pageable);

        List<WarehouseInventoryResponse> list = page.getContent().stream()
                .map(this::mapToInventoryResponse)
                .filter(res -> {
                    if (expiryStatus == null || expiryStatus.trim().isEmpty() || "ALL".equalsIgnoreCase(expiryStatus)) {
                        return true;
                    }
                    return expiryStatus.equalsIgnoreCase(res.getExpiryStatus());
                })
                .collect(Collectors.toList());

        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    /* =========================================================================
       FUNCTION #43: ASSIGN SHELF / BIN LOCATION
       ========================================================================= */
    @Override
    @Transactional
    public WarehouseInventoryResponse assignLocation(Long inventoryId, Long locationId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory record not found with ID: " + inventoryId));

        WarehouseLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Storage location not found with ID: " + locationId));

        inventory.setLocation(location);
        Inventory saved = inventoryRepository.save(inventory);
        return mapToInventoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseLocationResponse> getLocations() {
        return locationRepository.findAll().stream()
                .map(loc -> WarehouseLocationResponse.builder()
                        .id(loc.getId())
                        .code(loc.getCode())
                        .aisle(loc.getAisle())
                        .shelf(loc.getShelf())
                        .bin(loc.getBin())
                        .status(loc.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseLocationResponse createLocation(CreateLocationRequest request) {
        Store warehouse = storeRepository.findFirstByType((short) 2)
                .orElseGet(() -> storeRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("Warehouse store not configured")));

        WarehouseLocation loc = WarehouseLocation.builder()
                .code(request.getCode().trim())
                .aisle(request.getAisle() != null ? request.getAisle().trim() : null)
                .shelf(request.getShelf() != null ? request.getShelf().trim() : null)
                .bin(request.getBin() != null ? request.getBin().trim() : null)
                .store(warehouse)
                .status((short) 1)
                .build();

        WarehouseLocation saved = locationRepository.save(loc);
        return WarehouseLocationResponse.builder()
                .id(saved.getId())
                .code(saved.getCode())
                .aisle(saved.getAisle())
                .shelf(saved.getShelf())
                .bin(saved.getBin())
                .status(saved.getStatus())
                .build();
    }

    /* =========================================================================
       FUNCTION #42: VIEW PURCHASE HISTORY & DETAIL
       ========================================================================= */
    @Override
    @Transactional(readOnly = true)
    public Page<WarehousePurchaseHistoryResponse> getPurchaseHistory(Pageable pageable, String search) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<PurchaseReceipt> page = purchaseReceiptRepository.searchReceipts(query, pageable);

        List<WarehousePurchaseHistoryResponse> list = page.getContent().stream()
                .map(this::mapToPurchaseHistoryResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehousePurchaseHistoryResponse getPurchaseReceiptDetail(Long id) {
        PurchaseReceipt pr = purchaseReceiptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase receipt not found with ID: " + id));

        WarehousePurchaseHistoryResponse resp = mapToPurchaseHistoryResponse(pr);
        List<PurchaseReceiptDetail> details = purchaseReceiptDetailRepository.findByPurchaseReceiptIdWithDetails(id);

        List<PurchaseReceiptItemResponse> items = details.stream().map(d -> {
            Product p = d.getProduct();
            WarehouseLocation l = d.getLocation();
            String locCode = l != null ? l.getCode() : "Unassigned";

            return PurchaseReceiptItemResponse.builder()
                    .id(d.getId())
                    .productId(p != null ? p.getId() : null)
                    .productCode(p != null ? p.getBarcode() : "")
                    .productName(p != null ? p.getName() : "")
                    .unit(p != null ? p.getUnit() : "")
                    .orderQuantity(d.getOrderQuantity())
                    .quantity(d.getQuantity())
                    .unitCost(d.getUnitCost())
                    .subtotal(d.getSubtotal() != null ? d.getSubtotal() : (d.getUnitCost().multiply(BigDecimal.valueOf(d.getQuantity()))))
                    .batchNumber(d.getBatchNumber())
                    .manufactureDate(d.getManufactureDate())
                    .expiryDate(d.getExpiryDate())
                    .locationCode(locCode)
                    .build();
        }).collect(Collectors.toList());

        resp.setItems(items);
        resp.setItemCount(items.size());
        return resp;
    }

    /* =========================================================================
       FUNCTION #44: CREATE INVENTORY ADJUSTMENT
       ========================================================================= */
    @Override
    @Transactional
    public InventoryAdjustmentResponse createAdjustment(CreateAdjustmentRequest request) {
        Inventory inventory;
        if (request.getInventoryId() != null) {
            inventory = inventoryRepository.findById(request.getInventoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Inventory record not found with ID: " + request.getInventoryId()));
        } else {
            inventory = inventoryRepository.findAll().stream()
                    .filter(inv -> inv.getProduct().getId().equals(request.getProductId()) &&
                            inv.getBatch().getId().equals(request.getBatchId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Inventory record not found for product and batch"));
        }

        Product product = inventory.getProduct();
        ProductBatch batch = inventory.getBatch();
        Store store = inventory.getStore();

        int qtyBefore = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int qtyAfter = request.getQuantityAfter();
        int difference = qtyAfter - qtyBefore;

        BigDecimal unitCost = (product != null && product.getCostPrice() != null)
                ? product.getCostPrice()
                : BigDecimal.ZERO;
        BigDecimal valueImpact = unitCost.multiply(BigDecimal.valueOf(difference));

        Account currentUser = accountRepository.findAll().stream().findFirst().orElse(null);

        InventoryAdjustment adj = InventoryAdjustment.builder()
                .store(store)
                .product(product)
                .batch(batch)
                .createdBy(currentUser)
                .type(request.getType() != null ? request.getType() : 3)
                .status(InventoryAdjustmentStatus.APPROVED.getCode()) // Approved directly upon creation
                .quantityBefore(qtyBefore)
                .quantityAfter(qtyAfter)
                .difference(difference)
                .valueImpact(valueImpact)
                .reason(request.getReason().trim())
                .createdAt(LocalDateTime.now())
                .approvedAt(LocalDateTime.now())
                .build();

        InventoryAdjustment savedAdj = adjustmentRepository.save(adj);

        // Update physical stock in inventory
        inventory.setQuantity(qtyAfter);
        inventoryRepository.save(inventory);

        return mapToAdjustmentResponse(savedAdj);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryAdjustmentResponse> getAdjustments(Pageable pageable) {
        return adjustmentRepository.findAllWithDetails(pageable)
                .map(this::mapToAdjustmentResponse);
    }

    /* =========================================================================
       FUNCTION #45: APPROVE / REJECT INVENTORY ADJUSTMENT
       ========================================================================= */
    @Override
    @Transactional
    public InventoryAdjustmentResponse approveAdjustment(Long id, Long approverId) {
        InventoryAdjustment adj = adjustmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Adjustment not found with ID: " + id));

        if (adj.getStatus() != null && adj.getStatus().equals(InventoryAdjustmentStatus.APPROVED.getCode())) {
            throw new IllegalStateException("Adjustment is already approved");
        }

        Account approver = approverId != null ? accountRepository.findById(approverId).orElse(null) : null;
        adj.setStatus(InventoryAdjustmentStatus.APPROVED.getCode());
        adj.setApprovedBy(approver);
        adj.setApprovedAt(LocalDateTime.now());

        // Ensure inventory is synced
        if (adj.getStore() != null && adj.getBatch() != null) {
            Inventory inv = inventoryRepository.findAll().stream()
                    .filter(i -> i.getStore().getId().equals(adj.getStore().getId()) &&
                            i.getBatch().getId().equals(adj.getBatch().getId()))
                    .findFirst().orElse(null);
            if (inv != null) {
                inv.setQuantity(adj.getQuantityAfter());
                inventoryRepository.save(inv);
            }
        }

        InventoryAdjustment saved = adjustmentRepository.save(adj);
        return mapToAdjustmentResponse(saved);
    }

    @Override
    @Transactional
    public InventoryAdjustmentResponse rejectAdjustment(Long id, Long approverId, String reason) {
        InventoryAdjustment adj = adjustmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Adjustment not found with ID: " + id));

        Account approver = approverId != null ? accountRepository.findById(approverId).orElse(null) : null;
        adj.setStatus(InventoryAdjustmentStatus.REJECTED.getCode());
        adj.setApprovedBy(approver);
        adj.setApprovedAt(LocalDateTime.now());
        if (reason != null && !reason.trim().isEmpty()) {
            adj.setReason(adj.getReason() + " [Rejected: " + reason.trim() + "]");
        }

        InventoryAdjustment saved = adjustmentRepository.save(adj);
        return mapToAdjustmentResponse(saved);
    }

    /* =========================================================================
       FUNCTION #53 & #54: MANAGE & CONFIRM PURCHASE RECEIPT (GOODS INWARD)
       ========================================================================= */
    @Override
    @Transactional
    public WarehousePurchaseHistoryResponse createPurchaseReceipt(CreatePurchaseReceiptRequest request, Long creatorId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with ID: " + request.getSupplierId()));

        Store warehouse = storeRepository.findFirstByType(StoreType.CENTRAL_WAREHOUSE.getCode())
                .orElseGet(() -> storeRepository.findAll().stream().findFirst().orElseThrow());

        Account creator = creatorId != null ? accountRepository.findById(creatorId).orElse(null) : null;

        BigDecimal total = BigDecimal.ZERO;
        for (CreatePurchaseReceiptRequest.CreatePurchaseReceiptItem item : request.getItems()) {
            BigDecimal sub = item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(sub);
        }

        String receiptCode = "REC-" + System.currentTimeMillis() % 1000000;

        PurchaseReceipt receipt = PurchaseReceipt.builder()
                .code(receiptCode)
                .supplier(supplier)
                .store(warehouse)
                .createdBy(creator)
                .deliveryType(request.getDeliveryType() != null ? request.getDeliveryType() : PurchaseDeliveryType.DIRECT.getCode())
                .status(PurchaseReceiptStatus.DRAFT.getCode()) // Draft / pending inspection
                .totalAmount(total)
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .build();

        PurchaseReceipt savedReceipt = purchaseReceiptRepository.save(receipt);

        for (CreatePurchaseReceiptRequest.CreatePurchaseReceiptItem item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + item.getProductId()));

            WarehouseLocation loc = item.getLocationId() != null
                    ? locationRepository.findById(item.getLocationId()).orElse(null)
                    : null;

            PurchaseReceiptDetail detail = PurchaseReceiptDetail.builder()
                    .purchaseReceipt(savedReceipt)
                    .product(product)
                    .orderQuantity(item.getQuantity())
                    .quantity(item.getQuantity())
                    .unitCost(item.getUnitCost())
                    .subtotal(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .batchNumber(item.getBatchNumber().trim())
                    .manufactureDate(item.getManufactureDate())
                    .expiryDate(item.getExpiryDate())
                    .location(loc)
                    .build();

            purchaseReceiptDetailRepository.save(detail);
        }

        return getPurchaseReceiptDetail(savedReceipt.getId());
    }

    @Override
    @Transactional
    public WarehousePurchaseHistoryResponse confirmPurchaseReceipt(Long id, Long confirmerId) {
        PurchaseReceipt pr = purchaseReceiptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase receipt not found with ID: " + id));

        if (pr.getStatus() != null && pr.getStatus().equals(PurchaseReceiptStatus.CONFIRMED.getCode())) {
            throw new IllegalStateException("Receipt is already confirmed and accepted into inventory");
        }

        Account confirmer = confirmerId != null ? accountRepository.findById(confirmerId).orElse(null) : null;
        pr.setStatus(PurchaseReceiptStatus.CONFIRMED.getCode());
        pr.setConfirmedBy(confirmer);
        pr.setConfirmedAt(LocalDateTime.now());

        List<PurchaseReceiptDetail> details = purchaseReceiptDetailRepository.findByPurchaseReceiptIdWithDetails(id);
        Store warehouse = pr.getStore() != null ? pr.getStore() : storeRepository.findFirstByType(StoreType.CENTRAL_WAREHOUSE.getCode()).orElse(null);

        for (PurchaseReceiptDetail detail : details) {
            Product product = detail.getProduct();

            // Find or create ProductBatch
            ProductBatch batch = productBatchRepository.findAll().stream()
                    .filter(b -> b.getProduct().getId().equals(product.getId()) &&
                            b.getBatchNumber().equalsIgnoreCase(detail.getBatchNumber()))
                    .findFirst()
                    .orElseGet(() -> {
                        ProductBatch newBatch = ProductBatch.builder()
                                .product(product)
                                .batchNumber(detail.getBatchNumber())
                                .manufactureDate(detail.getManufactureDate())
                                .expiryDate(detail.getExpiryDate())
                                .supplier(pr.getSupplier())
                                .createdAt(LocalDateTime.now())
                                .build();
                        return productBatchRepository.save(newBatch);
                    });

            detail.setBatch(batch);
            purchaseReceiptDetailRepository.save(detail);

            // Update or Insert into warehouse inventory
            if (warehouse != null) {
                Inventory inv = inventoryRepository.findAll().stream()
                        .filter(i -> i.getStore().getId().equals(warehouse.getId()) &&
                                i.getBatch().getId().equals(batch.getId()))
                        .findFirst()
                        .orElse(null);

                if (inv != null) {
                    inv.setQuantity(inv.getQuantity() + detail.getQuantity());
                    if (detail.getLocation() != null) {
                        inv.setLocation(detail.getLocation());
                    }
                    inventoryRepository.save(inv);
                } else {
                    Inventory newInv = Inventory.builder()
                            .store(warehouse)
                            .product(product)
                            .batch(batch)
                            .location(detail.getLocation())
                            .quantity(detail.getQuantity())
                            .version(0)
                            .updatedAt(LocalDateTime.now())
                            .build();
                    inventoryRepository.save(newInv);
                }
            }
        }

        PurchaseReceipt savedPr = purchaseReceiptRepository.save(pr);
        return getPurchaseReceiptDetail(savedPr.getId());
    }

    /* =========================================================================
       FUNCTION #48: MANAGE PURCHASE REQUESTS
       ========================================================================= */
    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseRequestResponse> getPurchaseRequests(Pageable pageable, String search, Short status) {
        return purchaseRequestRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToPurchaseRequestResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseRequestResponse getPurchaseRequestDetail(Long id) {
        PurchaseRequest pr = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase request not found with ID: " + id));

        PurchaseRequestResponse resp = mapToPurchaseRequestResponse(pr);
        List<PurchaseRequestDetail> details = purchaseRequestDetailRepository.findByPurchaseRequestIdWithProduct(id);

        List<PurchaseRequestResponse.PurchaseRequestItemDto> items = details.stream().map(d -> {
            Product p = d.getProduct();
            return PurchaseRequestResponse.PurchaseRequestItemDto.builder()
                    .id(d.getId())
                    .productId(p != null ? p.getId() : null)
                    .productCode(p != null ? p.getBarcode() : "")
                    .productName(p != null ? p.getName() : "")
                    .unit(p != null ? p.getUnit() : "")
                    .requestedQuantity(d.getRequestedQuantity())
                    .note(d.getNote())
                    .build();
        }).collect(Collectors.toList());

        resp.setItems(items);
        return resp;
    }

    @Override
    @Transactional
    public PurchaseRequestResponse createPurchaseRequest(CreatePurchaseRequest request, Long creatorId) {
        Account creator = creatorId != null ? accountRepository.findById(creatorId).orElse(null) : null;
        String code = "PRQ-" + System.currentTimeMillis() % 1000000;

        PurchaseRequest pr = PurchaseRequest.builder()
                .code(code)
                .createdBy(creator)
                .status(PurchaseRequestStatus.SUBMITTED.getCode()) // Submitted
                .reason(request.getReason())
                .createdAt(LocalDateTime.now())
                .build();

        PurchaseRequest saved = purchaseRequestRepository.save(pr);

        for (CreatePurchaseRequest.CreatePurchaseRequestItem item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + item.getProductId()));

            PurchaseRequestDetail detail = PurchaseRequestDetail.builder()
                    .purchaseRequest(saved)
                    .product(product)
                    .requestedQuantity(item.getRequestedQuantity())
                    .note(item.getNote())
                    .build();

            purchaseRequestDetailRepository.save(detail);
        }

        return getPurchaseRequestDetail(saved.getId());
    }

    /* =========================================================================
       FUNCTION #49, #50, #51, #52: STORE REPLENISHMENT & GOODS ISSUE
       ========================================================================= */
    @Override
    @Transactional(readOnly = true)
    public Page<StoreReplenishmentResponse> getReplenishmentRequests(Pageable pageable, String search, Short status) {
        return stockRequisitionRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToReplenishmentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StoreReplenishmentResponse getReplenishmentRequestDetail(Long id) {
        StockRequisition sr = stockRequisitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Store replenishment request not found with ID: " + id));

        StoreReplenishmentResponse resp = mapToReplenishmentResponse(sr);
        List<StockRequisitionDetail> details = stockRequisitionDetailRepository.findByStockRequisitionIdWithProduct(id);

        List<StoreReplenishmentItemResponse> items = details.stream().map(d -> {
            Product p = d.getProduct();
            int totalWarehouseStock = 0;
            if (p != null) {
                totalWarehouseStock = inventoryRepository.findAll().stream()
                        .filter(inv -> inv.getProduct().getId().equals(p.getId()))
                        .mapToInt(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
                        .sum();
            }

            return StoreReplenishmentItemResponse.builder()
                    .id(d.getId())
                    .productId(p != null ? p.getId() : null)
                    .productCode(p != null ? p.getBarcode() : "")
                    .productName(p != null ? p.getName() : "")
                    .unit(p != null ? p.getUnit() : "")
                    .requestedQty(d.getRequestedQty())
                    .approvedQty(d.getApprovedQty())
                    .receivedQty(d.getReceivedQty())
                    .availableStock(totalWarehouseStock)
                    .build();
        }).collect(Collectors.toList());

        resp.setItems(items);
        return resp;
    }

    @Override
    @Transactional
    public StoreReplenishmentResponse approveReplenishmentRequest(Long id, Long approverId) {
        StockRequisition sr = stockRequisitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found with ID: " + id));

        if (sr.getStatus() != null && !sr.getStatus().equals(StockRequisitionStatus.PENDING.getCode())
                && !sr.getStatus().equals(StockRequisitionStatus.DRAFT.getCode())) {
            throw new IllegalStateException("Requisition cannot be approved from current state");
        }

        Account approver = approverId != null ? accountRepository.findById(approverId).orElse(null) : null;
        sr.setStatus(StockRequisitionStatus.APPROVED.getCode()); // Approved
        sr.setApprovedBy(approver);
        sr.setApprovedAt(LocalDateTime.now());

        List<StockRequisitionDetail> details = stockRequisitionDetailRepository.findByStockRequisitionIdWithProduct(id);
        for (StockRequisitionDetail d : details) {
            if (d.getApprovedQty() == null) {
                d.setApprovedQty(d.getRequestedQty());
                stockRequisitionDetailRepository.save(d);
            }
        }

        stockRequisitionRepository.save(sr);
        return getReplenishmentRequestDetail(id);
    }

    @Override
    @Transactional
    public StoreReplenishmentResponse rejectReplenishmentRequest(Long id, Long approverId, String reason) {
        StockRequisition sr = stockRequisitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found with ID: " + id));

        Account approver = approverId != null ? accountRepository.findById(approverId).orElse(null) : null;
        sr.setStatus(StockRequisitionStatus.REJECTED.getCode()); // Rejected
        sr.setApprovedBy(approver);
        sr.setRejectReason(reason);
        sr.setApprovedAt(LocalDateTime.now());

        stockRequisitionRepository.save(sr);
        return getReplenishmentRequestDetail(id);
    }

    @Override
    @Transactional
    public GoodsIssueResponse confirmGoodsDispatch(Long requisitionId, DispatchGoodsRequest request, Long dispatcherId) {
        StockRequisition sr = stockRequisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found with ID: " + requisitionId));

        if (sr.getStatus() != null && !sr.getStatus().equals(StockRequisitionStatus.APPROVED.getCode())) {
            throw new IllegalStateException("Requisition must be Approved before dispatching goods");
        }

        Store warehouse = storeRepository.findFirstByType(StoreType.CENTRAL_WAREHOUSE.getCode())
                .orElseGet(() -> storeRepository.findAll().stream().findFirst().orElseThrow());
        Store destinationStore = sr.getStore();

        Account dispatcher = dispatcherId != null ? accountRepository.findById(dispatcherId).orElse(null) : null;

        String issueCode = "GI-" + System.currentTimeMillis() % 1000000;

        GoodsIssue gi = GoodsIssue.builder()
                .code(issueCode)
                .stockRequisition(sr)
                .fromStore(warehouse)
                .toStore(destinationStore)
                .createdBy(sr.getCreatedBy())
                .dispatchedBy(dispatcher)
                .status(GoodsIssueStatus.DISPATCHED.getCode()) // Dispatched / in transit
                .carrier(request.getCarrier() != null ? request.getCarrier() : "Standard Fleet")
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .dispatchedAt(LocalDateTime.now())
                .build();

        GoodsIssue savedGi = goodsIssueRepository.save(gi);

        List<StockRequisitionDetail> reqDetails = stockRequisitionDetailRepository.findByStockRequisitionIdWithProduct(requisitionId);
        List<GoodsIssueResponse.GoodsIssueItemDto> itemDtos = new ArrayList<>();

        for (StockRequisitionDetail d : reqDetails) {
            int neededQty = d.getApprovedQty() != null ? d.getApprovedQty() : d.getRequestedQty();

            // Pick inventory batches by FEFO (earliest expiry date first)
            List<Inventory> candidateBatches = inventoryRepository.findAll().stream()
                    .filter(inv -> inv.getProduct().getId().equals(d.getProduct().getId()) &&
                            inv.getQuantity() != null && inv.getQuantity() > 0)
                    .sorted((a, b) -> a.getBatch().getExpiryDate().compareTo(b.getBatch().getExpiryDate()))
                    .collect(Collectors.toList());

            int remainingToDeduct = neededQty;
            for (Inventory inv : candidateBatches) {
                if (remainingToDeduct <= 0) break;
                int deduct = Math.min(inv.getQuantity(), remainingToDeduct);
                inv.setQuantity(inv.getQuantity() - deduct);
                inventoryRepository.save(inv);
                remainingToDeduct -= deduct;

                GoodsIssueDetail gid = GoodsIssueDetail.builder()
                        .goodsIssue(savedGi)
                        .product(d.getProduct())
                        .batch(inv.getBatch())
                        .quantity(deduct)
                        .build();

                goodsIssueDetailRepository.save(gid);

                itemDtos.add(GoodsIssueResponse.GoodsIssueItemDto.builder()
                        .id(gid.getId())
                        .productId(d.getProduct().getId())
                        .productCode(d.getProduct().getBarcode())
                        .productName(d.getProduct().getName())
                        .batchNumber(inv.getBatch().getBatchNumber())
                        .quantity(deduct)
                        .build());
            }
        }

        // Update requisition status
        sr.setStatus(StockRequisitionStatus.DISPATCHED.getCode()); // Dispatched
        sr.setDispatchedAt(LocalDateTime.now());
        stockRequisitionRepository.save(sr);

        return GoodsIssueResponse.builder()
                .id(savedGi.getId())
                .code(savedGi.getCode())
                .requisitionCode(sr.getCode())
                .fromStoreName(warehouse.getName())
                .toStoreName(destinationStore != null ? destinationStore.getName() : "Branch Store")
                .status(savedGi.getStatus())
                .statusText(GoodsIssueStatus.resolveText(savedGi.getStatus()))
                .carrier(savedGi.getCarrier())
                .note(savedGi.getNote())
                .createdAt(savedGi.getCreatedAt())
                .dispatchedAt(savedGi.getDispatchedAt())
                .items(itemDtos)
                .build();
    }

    /* =========================================================================
       HELPER MAPPERS
       ========================================================================= */
    private WarehouseInventoryResponse mapToInventoryResponse(Inventory i) {
        Product p = i.getProduct();
        ProductBatch b = i.getBatch();
        WarehouseLocation l = i.getLocation();

        LocalDate exp = b != null ? b.getExpiryDate() : null;
        long days = exp != null ? ChronoUnit.DAYS.between(LocalDate.now(), exp) : 999;
        String status = exp != null ? ExpiryStatus.resolveWarehouseExpiry(days) : ExpiryStatus.GOOD.getValue();

        BigDecimal cost = (p != null && p.getCostPrice() != null) ? p.getCostPrice() : BigDecimal.ZERO;
        BigDecimal totalVal = cost.multiply(BigDecimal.valueOf(i.getQuantity() != null ? i.getQuantity() : 0));

        return WarehouseInventoryResponse.builder()
                .id(i.getId())
                .productId(p != null ? p.getId() : null)
                .productCode(p != null ? p.getBarcode() : "")
                .productName(p != null ? p.getName() : "")
                .unit(p != null ? p.getUnit() : "")
                .activeIngredient(p != null ? p.getActiveIngredient() : "")
                .batchId(b != null ? b.getId() : null)
                .batchNumber(b != null ? b.getBatchNumber() : "")
                .manufactureDate(b != null ? b.getManufactureDate() : null)
                .expiryDate(exp)
                .locationId(l != null ? l.getId() : null)
                .locationCode(l != null ? l.getCode() : "Unassigned")
                .aisle(l != null ? l.getAisle() : "-")
                .shelf(l != null ? l.getShelf() : "-")
                .bin(l != null ? l.getBin() : "-")
                .quantity(i.getQuantity() != null ? i.getQuantity() : 0)
                .costPrice(cost)
                .totalValue(totalVal)
                .daysToExpiry(days)
                .expiryStatus(status)
                .build();
    }

    private WarehousePurchaseHistoryResponse mapToPurchaseHistoryResponse(PurchaseReceipt pr) {
        String deliveryLabel = PurchaseDeliveryType.resolveLabel(pr.getDeliveryType());
        String statusLabel = PurchaseReceiptStatus.resolveLabel(pr.getStatus());

        return WarehousePurchaseHistoryResponse.builder()
                .id(pr.getId())
                .code(pr.getCode())
                .deliveryType(pr.getDeliveryType())
                .deliveryTypeLabel(deliveryLabel)
                .status(pr.getStatus())
                .statusLabel(statusLabel)
                .totalAmount(pr.getTotalAmount() != null ? pr.getTotalAmount() : BigDecimal.ZERO)
                .note(pr.getNote() != null ? pr.getNote() : "")
                .createdAt(pr.getCreatedAt())
                .confirmedAt(pr.getConfirmedAt())
                .itemCount(0)
                .items(Collections.emptyList())
                .build();
    }

    private InventoryAdjustmentResponse mapToAdjustmentResponse(InventoryAdjustment a) {
        String typeLabel = InventoryAdjustmentType.resolveLabel(a.getType());
        String statusLabel = InventoryAdjustmentStatus.resolveLabel(a.getStatus());

        return InventoryAdjustmentResponse.builder()
                .id(a.getId())
                .storeName(a.getStore() != null ? a.getStore().getName() : "")
                .productCode(a.getProduct() != null ? a.getProduct().getBarcode() : "")
                .productName(a.getProduct() != null ? a.getProduct().getName() : "")
                .batchNumber(a.getBatch() != null ? a.getBatch().getBatchNumber() : "")
                .quantityBefore(a.getQuantityBefore())
                .quantityAfter(a.getQuantityAfter())
                .difference(a.getDifference())
                .valueImpact(a.getValueImpact() != null ? a.getValueImpact() : BigDecimal.ZERO)
                .reason(a.getReason())
                .type(a.getType())
                .typeLabel(typeLabel)
                .status(a.getStatus())
                .statusLabel(statusLabel)
                .createdByName(a.getCreatedBy() != null ? a.getCreatedBy().getUsername() : "System")
                .createdAt(a.getCreatedAt())
                .approvedAt(a.getApprovedAt())
                .build();
    }

    private PurchaseRequestResponse mapToPurchaseRequestResponse(PurchaseRequest pr) {
        String statusText = PurchaseRequestStatus.resolveText(pr.getStatus());

        return PurchaseRequestResponse.builder()
                .id(pr.getId())
                .code(pr.getCode())
                .createdByUsername(pr.getCreatedBy() != null ? pr.getCreatedBy().getUsername() : "Warehouse Staff")
                .status(pr.getStatus())
                .statusText(statusText)
                .reason(pr.getReason())
                .createdAt(pr.getCreatedAt())
                .approvedAt(pr.getApprovedAt())
                .items(Collections.emptyList())
                .build();
    }

    private StoreReplenishmentResponse mapToReplenishmentResponse(StockRequisition sr) {
        String statusText = StockRequisitionStatus.resolveWarehouseText(sr.getStatus());

        return StoreReplenishmentResponse.builder()
                .id(sr.getId())
                .code(sr.getCode())
                .storeId(sr.getStore() != null ? sr.getStore().getId() : null)
                .storeName(sr.getStore() != null ? sr.getStore().getName() : "Branch Store")
                .createdByUsername(sr.getCreatedBy() != null ? sr.getCreatedBy().getUsername() : "")
                .approvedByUsername(sr.getApprovedBy() != null ? sr.getApprovedBy().getUsername() : null)
                .status(sr.getStatus())
                .statusText(statusText)
                .rejectReason(sr.getRejectReason())
                .createdAt(sr.getCreatedAt())
                .approvedAt(sr.getApprovedAt())
                .dispatchedAt(sr.getDispatchedAt())
                .receivedAt(sr.getReceivedAt())
                .items(Collections.emptyList())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductOptionDto> getProductOptions() {
        return productRepository.findAll().stream()
                .map(p -> new ProductOptionDto(
                        p.getId(),
                        p.getName(),
                        p.getBarcode(),
                        p.getUnit(),
                        p.getCostPrice()
                ))
                .collect(Collectors.toList());
    }
}
