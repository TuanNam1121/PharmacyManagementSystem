package com.pharmacy.service.impl;

import com.pharmacy.dto.inventory.BranchInventoryResponse;
import com.pharmacy.dto.inventory.BranchInventorySummaryDto;
import com.pharmacy.dto.inventory.StockAuditCheckRequest;
import com.pharmacy.dto.inventory.UpdateStockThresholdRequest;
import com.pharmacy.dto.product.ProductUnitDto;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchInventoryServiceImpl implements BranchInventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final AuditLogRepository auditLogRepository;
    private final ProductUnitRepository productUnitRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BranchInventoryResponse> getBranchInventory(Long storeId, Pageable pageable, String search,
                                                            String warningFilter) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        if (warningFilter != null) {
            List<Inventory> branchInventoryResponses = inventoryRepository.findAllForInventoryReport(storeId);
            List<BranchInventoryResponse> list = branchInventoryResponses.stream()
                    .map(this::mapToBranchResponse)
                    .filter(res -> matchWarningFilter(res, warningFilter))
                    .collect(Collectors.toList());
            return new PageImpl<>(list, pageable, list.size());
        }

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
//        System.out.println("Size: " + dtoList.size());
//        for (BranchInventoryResponse res : dtoList) {
//            System.out.println("ProductID: " + res.getProductId() + "\n" + "ProductStatus: " + res.getStockStatus());
//        }

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

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Account not found: " + username));

        Integer oldMin = product.getMinQuantity();
        product.setMinQuantity(request.getMinQuantity());
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        // Record Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setAccount(account);
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
            case "LOW_STOCK" ->
                    StockStatus.LOW_STOCK.getValue().equals(res.getStockStatus()) || StockStatus.OUT_OF_STOCK.getValue().equals(res.getStockStatus());
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

        List<ProductUnitDto> unitDtos = Collections.emptyList();
        if (p != null) {
            unitDtos = productUnitRepository.findByProduct_IdOrderByConversionFactorAsc(p.getId()).stream()
                    .map(u -> ProductUnitDto.builder()
                            .id(u.getId())
                            .unitName(u.getUnitName())
                            .conversionFactor(u.getConversionFactor())
                            .sellingPrice(u.getSellingPrice())
                            .isBaseUnit(u.getIsBaseUnit())
                            .barcode(u.getBarcode())
                            .build())
                    .collect(Collectors.toList());
        }

        ProductUnitDto baseUnit = unitDtos.stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsBaseUnit()) || (u.getConversionFactor() != null && u.getConversionFactor() == 1))
                .findFirst()
                .orElse(null);
        String baseUnitName = baseUnit != null ? baseUnit.getUnitName() : (p != null ? p.getUnit() : "");
        BigDecimal unitPrice = baseUnit != null && baseUnit.getSellingPrice() != null ? baseUnit.getSellingPrice() : sell;
        BigDecimal totalVal = unitPrice.multiply(BigDecimal.valueOf(qty));
        String packagingBreakdown = calculatePackagingBreakdown(qty, unitDtos);

        return BranchInventoryResponse.builder()
                .id(i.getId())
                .storeId(s != null ? s.getId() : null)
                .storeName(s != null ? s.getName() : "")
                .productId(p != null ? p.getId() : null)
                .barcode(p != null ? p.getBarcode() : "")
                .productName(p != null ? p.getName() : "")
                .unit(p != null ? p.getUnit() : "")
                .baseUnitName(baseUnitName)
                .packagingBreakdown(packagingBreakdown)
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
                .sellingPrice(unitPrice)
                .totalValue(totalVal)
                .daysToExpiry(days)
                .stockStatus(stockStatus)
                .expiryStatus(expiryStatus)
                .warningLevel(warningLevel)
                .locationCode(l != null ? l.getCode() : "Main Counter")
                .updatedAt(i.getUpdatedAt())
                .units(unitDtos)
                .build();
    }

    private String calculatePackagingBreakdown(int totalQty, List<ProductUnitDto> units) {
        if (totalQty <= 0 || units == null || units.isEmpty()) {
            return null;
        }
        List<ProductUnitDto> higherUnits = units.stream()
                .filter(u -> u.getConversionFactor() != null && u.getConversionFactor() > 1)
                .sorted((a, b) -> Integer.compare(b.getConversionFactor(), a.getConversionFactor()))
                .collect(Collectors.toList());

        if (higherUnits.isEmpty()) {
            return null;
        }

        int remaining = totalQty;
        List<String> parts = new ArrayList<>();

        for (ProductUnitDto unit : higherUnits) {
            int factor = unit.getConversionFactor();
            int count = remaining / factor;
            if (count > 0) {
                parts.add(count + " " + unit.getUnitName());
                remaining = remaining % factor;
            }
        }

        if (remaining > 0) {
            ProductUnitDto baseUnit = units.stream()
                    .filter(u -> u.getConversionFactor() != null && u.getConversionFactor() == 1)
                    .findFirst()
                    .orElse(null);
            String baseName = baseUnit != null ? baseUnit.getUnitName() : "lẻ";
            parts.add(remaining + " " + baseName);
        }

        return parts.isEmpty() ? null : String.join(" ", parts);
    }
}
