package com.pharmacy.service.impl;

import com.pharmacy.dto.inventory.BranchInventoryResponse;
import com.pharmacy.dto.inventory.BranchInventorySummaryDto;
import com.pharmacy.dto.inventory.StockAuditCheckRequest;
import com.pharmacy.dto.inventory.UpdateStockThresholdRequest;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.ExpiryStatus;
import com.pharmacy.entity.enums.StockStatus;
import com.pharmacy.entity.enums.StockWarningLevel;
import com.pharmacy.repository.*;
import com.pharmacy.service.BranchInventoryService;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchInventoryServiceImpl implements BranchInventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BranchInventoryResponse> getBranchInventory(Long storeId, Pageable pageable, String search,
            String warningFilter) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Inventory> page = inventoryRepository.searchBranchInventory(storeId, querySearch, pageable);

        List<BranchInventoryResponse> list = page.getContent().stream()
                .map(this::mapToBranchResponse)
                .filter(res -> matchWarningFilter(res, warningFilter))
                .collect(Collectors.toList());

        return new PageImpl<>(list, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public BranchInventorySummaryDto getBranchInventorySummary(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found with ID: " + storeId));

        List<Inventory> allItems = inventoryRepository.findByStoreId(storeId);
        List<BranchInventoryResponse> dtoList = allItems.stream()
                .map(this::mapToBranchResponse)
                .toList();

        int totalUnits = dtoList.stream().mapToInt(BranchInventoryResponse::getQuantity).sum();
        BigDecimal totalValue = dtoList.stream()
                .map(BranchInventoryResponse::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long distinctProducts = dtoList.stream().map(BranchInventoryResponse::getProductId).distinct().count();
        long lowStockCount = dtoList.stream().filter(i -> StockStatus.LOW_STOCK.getValue().equals(i.getStockStatus())).count();
        long outOfStockCount = dtoList.stream().filter(i -> StockStatus.OUT_OF_STOCK.getValue().equals(i.getStockStatus())).count();
        long expiringSoonCount = dtoList.stream().filter(i -> ExpiryStatus.EXPIRING_SOON.getValue().equals(i.getExpiryStatus())).count();
        long expiredCount = dtoList.stream().filter(i -> ExpiryStatus.EXPIRED.getValue().equals(i.getExpiryStatus())).count();

        return BranchInventorySummaryDto.builder()
                .storeId(store.getId())
                .storeName(store.getName())
                .totalProducts((int) distinctProducts)
                .totalBatches(dtoList.size())
                .totalUnits(totalUnits)
                .totalInventoryValue(totalValue)
                .lowStockCount((int) lowStockCount)
                .outOfStockCount((int) outOfStockCount)
                .expiringSoonCount((int) expiringSoonCount)
                .expiredCount((int) expiredCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BranchInventoryResponse getInventoryDetail(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with ID: " + id));
        return mapToBranchResponse(inventory);
    }

    @Override
    @Transactional
    public BranchInventoryResponse updateMinQuantity(UpdateStockThresholdRequest request, String username,
            String clientIp) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Product not found with ID: " + request.getProductId()));

        Integer oldMin = product.getMinQuantity();
        product.setMinQuantity(request.getMinQuantity());
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        // Record Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setAction((short) 2); // 2: UPDATE
        auditLog.setEntityName("Product_MinQuantity");
        auditLog.setEntityId(product.getId());
        auditLog.setOldValue("minQuantity=" + oldMin);
        auditLog.setNewValue("minQuantity=" + request.getMinQuantity() + ", note=" + request.getNote());
        auditLog.setIpAddress(clientIp);
        auditLog.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(auditLog);

        Inventory inv = inventoryRepository.findFirstByProductIdAndBatchId(product.getId(), null)
                .orElseGet(() -> inventoryRepository.findAll().stream()
                        .filter(i -> i.getProduct() != null && i.getProduct().getId().equals(product.getId()))
                        .findFirst().orElse(null));

        if (inv != null) {
            return mapToBranchResponse(inv);
        }

        return BranchInventoryResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .minQuantity(product.getMinQuantity())
                .build();
    }

    @Override
    @Transactional
    public void logStockAuditCheck(StockAuditCheckRequest request, String username, String clientIp) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction((short) 3); // 3: AUDIT_CHECK / VERIFY
        auditLog.setEntityName("StoreInventoryCheck");
        auditLog.setEntityId(request.getStoreId());
        auditLog.setOldValue("storeId=" + request.getStoreId());
        auditLog.setNewValue(
                "verifiedBy=" + username + ", inventoryId=" + request.getInventoryId() + ", note=" + request.getNote());
        auditLog.setIpAddress(clientIp);
        auditLog.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }

    private boolean matchWarningFilter(BranchInventoryResponse res, String filter) {
        if (filter == null || filter.trim().isEmpty() || "ALL".equalsIgnoreCase(filter)) {
            return true;
        }
        return switch (filter.toUpperCase()) {
            case "LOW_STOCK" -> StockStatus.LOW_STOCK.getValue().equals(res.getStockStatus()) || StockStatus.OUT_OF_STOCK.getValue().equals(res.getStockStatus());
            case "OUT_OF_STOCK" -> StockStatus.OUT_OF_STOCK.getValue().equals(res.getStockStatus());
            case "EXPIRING_SOON" -> ExpiryStatus.EXPIRING_SOON.getValue().equals(res.getExpiryStatus());
            case "EXPIRED" -> ExpiryStatus.EXPIRED.getValue().equals(res.getExpiryStatus());
            case "SAFE" -> StockWarningLevel.NORMAL.getValue().equals(res.getWarningLevel());
            default -> true;
        };
    }

    private BranchInventoryResponse mapToBranchResponse(Inventory i) {
        Product p = i.getProduct();
        ProductBatch b = i.getBatch();
        Store s = i.getStore();
        WarehouseLocation l = i.getLocation();

        LocalDate exp = (b != null) ? b.getExpiryDate() : null;
        Long days = null;
        String expiryStatus = ExpiryStatus.SAFE.getValue();

        if (exp != null) {
            days = ChronoUnit.DAYS.between(LocalDate.now(), exp);
            expiryStatus = ExpiryStatus.fromDays(days).getValue();
        }

        int qty = i.getQuantity() != null ? i.getQuantity() : 0;
        int minQ = (p != null && p.getMinQuantity() != null) ? p.getMinQuantity() : 20;

        String stockStatus = StockStatus.fromQuantity(qty, minQ).getValue();
        String warningLevel = StockWarningLevel.resolve(expiryStatus, stockStatus).getValue();

        BigDecimal cost = (p != null && p.getCostPrice() != null) ? p.getCostPrice() : BigDecimal.ZERO;
        BigDecimal sell = (p != null && p.getSellingPrice() != null) ? p.getSellingPrice() : BigDecimal.ZERO;
        BigDecimal totalVal = sell.multiply(BigDecimal.valueOf(qty));

        return BranchInventoryResponse.builder()
                .id(i.getId())
                .storeId(s != null ? s.getId() : null)
                .storeName(s != null ? s.getName() : "")
                .productId(p != null ? p.getId() : null)
                .barcode(p != null ? p.getBarcode() : "")
                .productName(p != null ? p.getName() : "")
                .unit(p != null ? p.getUnit() : "")
                .activeIngredient(p != null ? p.getActiveIngredient() : "")
                .manufacturer(p != null ? p.getManufacturer() : "")
                .isPrescription(p != null && Boolean.TRUE.equals(p.getIsPrescription()))
                .batchId(b != null ? b.getId() : null)
                .batchNumber(b != null ? b.getBatchNumber() : "")
                .manufactureDate(b != null ? b.getManufactureDate() : null)
                .expiryDate(exp)
                .quantity(qty)
                .minQuantity(minQ)
                .costPrice(cost)
                .sellingPrice(sell)
                .totalValue(totalVal)
                .daysToExpiry(days)
                .stockStatus(stockStatus)
                .expiryStatus(expiryStatus)
                .warningLevel(warningLevel)
                .locationCode(l != null ? l.getCode() : "Main Counter")
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
