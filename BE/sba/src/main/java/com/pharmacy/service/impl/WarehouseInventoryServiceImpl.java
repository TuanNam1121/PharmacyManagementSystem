package com.pharmacy.service.impl;

import com.pharmacy.dto.warehouse.*;
import com.pharmacy.entity.*;
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

    @Override
    @Transactional
    public WarehouseInventoryResponse assignLocation(Long inventoryId, Long locationId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tồn kho ID: " + inventoryId));

        WarehouseLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vị trí ô/kệ ID: " + locationId));

        inventory.setLocation(location);
        inventory.setUpdatedAt(LocalDateTime.now());
        Inventory saved = inventoryRepository.save(inventory);

        return mapToInventoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseLocationResponse> getLocations() {
        return locationRepository.findAll().stream()
                .map(l -> WarehouseLocationResponse.builder()
                        .id(l.getId())
                        .code(l.getCode())
                        .aisle(l.getAisle())
                        .shelf(l.getShelf())
                        .bin(l.getBin())
                        .status(l.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseLocationResponse createLocation(CreateLocationRequest request) {
        if (locationRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã vị trí đã tồn tại: " + request.getCode());
        }

        WarehouseLocation loc = new WarehouseLocation();
        Store store = storeRepository.findAll().stream().findFirst().orElse(null);
        loc.setStore(store);
        loc.setCode(request.getCode().trim().toUpperCase());
        loc.setAisle(request.getAisle() != null ? request.getAisle().trim() : "");
        loc.setShelf(request.getShelf() != null ? request.getShelf().trim() : "");
        loc.setBin(request.getBin() != null ? request.getBin().trim() : "");
        loc.setStatus((short) 1);

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

    @Override
    @Transactional(readOnly = true)
    public Page<WarehousePurchaseHistoryResponse> getPurchaseHistory(Pageable pageable, String search) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<PurchaseReceipt> page = purchaseReceiptRepository.searchReceipts(querySearch, pageable);

        List<WarehousePurchaseHistoryResponse> list = page.getContent().stream()
                .map(this::mapToPurchaseHistoryResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehousePurchaseHistoryResponse getPurchaseReceiptDetail(Long id) {
        PurchaseReceipt receipt = purchaseReceiptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phiếu nhập kho ID: " + id));

        WarehousePurchaseHistoryResponse res = mapToPurchaseHistoryResponse(receipt);
        List<PurchaseReceiptDetail> details = purchaseReceiptDetailRepository.findByPurchaseReceiptIdWithDetails(id);

        List<PurchaseReceiptItemResponse> items = details.stream().map(d -> PurchaseReceiptItemResponse.builder()
                .id(d.getId())
                .productId(d.getProduct().getId())
                .productName(d.getProduct().getName())
                .batchNumber(d.getBatchNumber())
                .manufactureDate(d.getManufactureDate())
                .expiryDate(d.getExpiryDate())
                .orderQuantity(d.getOrderQuantity())
                .receivedQuantity(d.getQuantity())
                .unitCost(d.getUnitCost())
                .subtotal(d.getSubtotal())
                .locationCode(d.getLocation() != null ? d.getLocation().getCode() : "Chưa gán")
                .build()).collect(Collectors.toList());

        res.setItems(items);
        res.setItemCount(items.size());
        return res;
    }

    @Override
    @Transactional
    public InventoryAdjustmentResponse createAdjustment(CreateAdjustmentRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm ID: " + request.getProductId()));

        ProductBatch batch = productBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy số lô ID: " + request.getBatchId()));

        Store store = null;
        if (request.getStoreId() != null) {
            store = storeRepository.findById(request.getStoreId()).orElse(null);
        }
        if (store == null) {
            store = storeRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Không có thông tin kho/cửa hàng trong hệ thống"));
        }

        Account account = accountRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản người tạo"));

        // Lookup current quantity in inventory
        Inventory inventory = inventoryRepository.findByStoreIdAndProductIdAndBatchId(store.getId(), product.getId(), batch.getId())
                .orElse(null);

        int quantityBefore = (inventory != null) ? inventory.getQuantity() : 0;
        int quantityAfter = request.getQuantityAfter();
        int difference = quantityAfter - quantityBefore;

        BigDecimal unitCost = product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO;
        BigDecimal valueImpact = unitCost.multiply(BigDecimal.valueOf(difference));

        InventoryAdjustment adj = new InventoryAdjustment();
        adj.setStore(store);
        adj.setProduct(product);
        adj.setBatch(batch);
        adj.setCreatedBy(account);
        adj.setType(request.getType());
        adj.setStatus((short) 0); // 0: Pending approval
        adj.setQuantityBefore(quantityBefore);
        adj.setQuantityAfter(quantityAfter);
        adj.setDifference(difference);
        adj.setValueImpact(valueImpact);
        adj.setReason(request.getReason().trim());
        adj.setCreatedAt(LocalDateTime.now());

        InventoryAdjustment saved = adjustmentRepository.save(adj);

        return mapToAdjustmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryAdjustmentResponse> getAdjustments(Pageable pageable) {
        Page<InventoryAdjustment> page = adjustmentRepository.findAllWithDetails(pageable);
        List<InventoryAdjustmentResponse> list = page.getContent().stream()
                .map(this::mapToAdjustmentResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    private WarehouseInventoryResponse mapToInventoryResponse(Inventory i) {
        Product p = i.getProduct();
        ProductBatch b = i.getBatch();
        WarehouseLocation l = i.getLocation();

        LocalDate exp = (b != null) ? b.getExpiryDate() : null;
        Long days = null;
        String status = "SAFE";

        if (exp != null) {
            days = ChronoUnit.DAYS.between(LocalDate.now(), exp);
            if (days < 0) {
                status = "EXPIRED";
            } else if (days <= 90) {
                status = "EXPIRING_SOON";
            } else {
                status = "SAFE";
            }
        }

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
                .locationCode(l != null ? l.getCode() : "Chưa gán vị trí")
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
        String deliveryLabel = (pr.getDeliveryType() != null && pr.getDeliveryType() == 1) ? "Giao hàng trực tiếp" : "Vận chuyển đường dài";
        String statusLabel = (pr.getStatus() != null && pr.getStatus() == 1) ? "Đã nhập kho" : "Đang chờ nhận";

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
        String typeLabel = switch (a.getType() != null ? a.getType() : 0) {
            case 1 -> "Hỏng vỡ (Damaged)";
            case 2 -> "Hết hạn (Expired)";
            case 3 -> "Kiểm kê lệch (Cycle Count)";
            default -> "Khác (Other)";
        };

        String statusLabel = switch (a.getStatus() != null ? a.getStatus() : 0) {
            case 1 -> "Đã duyệt";
            case 2 -> "Từ chối";
            default -> "Chờ duyệt";
        };

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
                .createdByName(a.getCreatedBy() != null ? a.getCreatedBy().getUsername() : "Hệ thống")
                .createdAt(a.getCreatedAt())
                .approvedAt(a.getApprovedAt())
                .build();
    }
}
