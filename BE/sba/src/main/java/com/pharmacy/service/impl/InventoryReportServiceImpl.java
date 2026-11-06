package com.pharmacy.service.impl;

import com.pharmacy.dto.report.InventoryReportRequest;
import com.pharmacy.dto.report.InventoryReportResponse;
import com.pharmacy.entity.*;
import com.pharmacy.entity.enums.ExpiryStatus;
import com.pharmacy.entity.enums.StockStatus;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.InventoryRepository;
import com.pharmacy.repository.StockMovementRepository;
import com.pharmacy.repository.StoreRepository;
import com.pharmacy.service.InventoryExcelExportService;
import com.pharmacy.service.InventoryReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryReportServiceImpl implements InventoryReportService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StoreRepository storeRepository;
    private final InventoryExcelExportService excelExportService;

    @Override
    @Transactional
    public InventoryReportResponse generateInventoryReport(InventoryReportRequest request, String clientIp) {
        String storeName = "All Stores (Chain-wide)";
        if (request.getStoreId() != null) {
            Store store = storeRepository.findById(request.getStoreId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Store not found with ID: " + request.getStoreId()));
            storeName = store.getName();
        }

        // 1. Fetch inventories
        List<Inventory> inventories = inventoryRepository.findAllForInventoryReport(request.getStoreId());
        LocalDate today = LocalDate.now();

        List<InventoryReportResponse.InventoryItemDto> itemDtos = new ArrayList<>();
        BigDecimal totalValuationCost = BigDecimal.ZERO;
        BigDecimal totalValuationRetail = BigDecimal.ZERO;
        long totalUnits = 0;
        long lowStockCount = 0;
        long outOfStockCount = 0;
        long expiringSoonCount = 0;
        Set<Long> uniqueProductIds = new HashSet<>();

        String filter = (request.getStockStatus() != null && !request.getStockStatus().trim().isEmpty())
                ? request.getStockStatus().trim().toUpperCase()
                : "ALL";

        for (Inventory inv : inventories) {
            Product p = inv.getProduct();
            ProductBatch b = inv.getBatch();
            Store s = inv.getStore();

            uniqueProductIds.add(p.getId());
            int qty = inv.getQuantity() != null ? inv.getQuantity() : 0;
            int minQty = p.getMinQuantity() != null ? p.getMinQuantity() : 0;

            StockStatus stockStatus = StockStatus.fromQuantity(qty, minQty);
            if (stockStatus == StockStatus.LOW_STOCK)
                lowStockCount++;
            if (stockStatus == StockStatus.OUT_OF_STOCK)
                outOfStockCount++;

            long daysUntilExpiry = b != null && b.getExpiryDate() != null
                    ? ChronoUnit.DAYS.between(today, b.getExpiryDate())
                    : 9999;
            ExpiryStatus expiryStatus = ExpiryStatus.fromDays(daysUntilExpiry);
            if (expiryStatus == ExpiryStatus.EXPIRING_SOON || expiryStatus == ExpiryStatus.EXPIRED) {
                expiringSoonCount++;
            }

            // Apply filter
            if ("LOW_STOCK".equals(filter) && stockStatus != StockStatus.LOW_STOCK)
                continue;
            if ("OUT_OF_STOCK".equals(filter) && stockStatus != StockStatus.OUT_OF_STOCK)
                continue;
            if ("EXPIRING_SOON".equals(filter) && expiryStatus != ExpiryStatus.EXPIRING_SOON
                    && expiryStatus != ExpiryStatus.EXPIRED)
                continue;
            if ("IN_STOCK".equals(filter) && stockStatus != StockStatus.IN_STOCK)
                continue;

            BigDecimal costPrice = p.getCostPrice() != null ? p.getCostPrice() : BigDecimal.ZERO;
            BigDecimal sellPrice = p.getSellingPrice() != null ? p.getSellingPrice() : BigDecimal.ZERO;

            BigDecimal valCost = costPrice.multiply(BigDecimal.valueOf(qty));
            BigDecimal valRetail = sellPrice.multiply(BigDecimal.valueOf(qty));

            totalValuationCost = totalValuationCost.add(valCost);
            totalValuationRetail = totalValuationRetail.add(valRetail);
            totalUnits += qty;

            itemDtos.add(InventoryReportResponse.InventoryItemDto.builder()
                    .inventoryId(inv.getId())
                    .productId(p.getId())
                    .barcode(p.getBarcode())
                    .productName(p.getName())
                    .unit(p.getUnit())
                    .batchNumber(b != null ? b.getBatchNumber() : "—")
                    .expiryDate(b != null ? b.getExpiryDate() : null)
                    .daysUntilExpiry(daysUntilExpiry)
                    .expiryStatus(expiryStatus.getValue())
                    .storeId(s.getId())
                    .storeCode(s.getCode())
                    .storeName(s.getName())
                    .quantity(qty)
                    .minQuantity(minQty)
                    .stockStatus(stockStatus.getValue())
                    .costPrice(costPrice)
                    .sellingPrice(sellPrice)
                    .valuationCost(valCost)
                    .valuationRetail(valRetail)
                    .build());
        }

        BigDecimal potentialProfit = totalValuationRetail.subtract(totalValuationCost);
        BigDecimal potentialMargin = totalValuationRetail.compareTo(BigDecimal.ZERO) > 0
                ? potentialProfit.multiply(BigDecimal.valueOf(100)).divide(totalValuationRetail, 2,
                        RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 2. Breakdown by Store
        Map<Long, List<InventoryReportResponse.InventoryItemDto>> byStore = itemDtos.stream()
                .collect(Collectors.groupingBy(InventoryReportResponse.InventoryItemDto::getStoreId));

        List<InventoryReportResponse.StoreValuationDto> storeBreakdown = byStore.values().stream().map(sItems -> {
            InventoryReportResponse.InventoryItemDto first = sItems.get(0);
            long skus = sItems.stream().map(InventoryReportResponse.InventoryItemDto::getProductId).distinct().count();
            long sUnits = sItems.stream().mapToLong(InventoryReportResponse.InventoryItemDto::getQuantity).sum();
            BigDecimal sCost = sItems.stream().map(InventoryReportResponse.InventoryItemDto::getValuationCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal sRetail = sItems.stream().map(InventoryReportResponse.InventoryItemDto::getValuationRetail)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal sProfit = sRetail.subtract(sCost);
            BigDecimal sMargin = sRetail.compareTo(BigDecimal.ZERO) > 0
                    ? sProfit.multiply(BigDecimal.valueOf(100)).divide(sRetail, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return InventoryReportResponse.StoreValuationDto.builder()
                    .storeId(first.getStoreId())
                    .storeCode(first.getStoreCode())
                    .storeName(first.getStoreName())
                    .totalSkus(skus)
                    .totalUnits(sUnits)
                    .valuationCost(sCost)
                    .valuationRetail(sRetail)
                    .potentialProfit(sProfit)
                    .potentialMarginPercentage(sMargin)
                    .build();
        }).sorted(Comparator.comparing(InventoryReportResponse.StoreValuationDto::getValuationCost).reversed())
                .collect(Collectors.toList());

        // 3. Stock Movements Log (Default: last 30 days if not specified)
        LocalDate endD = request.getEndDate() != null ? request.getEndDate() : today;
        LocalDate startD = request.getStartDate() != null ? request.getStartDate() : endD.minusDays(30);

        List<StockMovement> movements = stockMovementRepository.findMovementsForReport(
                request.getStoreId(),
                startD.atStartOfDay(),
                endD.atTime(LocalTime.MAX));

        List<InventoryReportResponse.StockMovementReportDto> movementDtos = movements.stream()
                .map(m -> InventoryReportResponse.StockMovementReportDto.builder()
                        .id(m.getId())
                        .createdAt(m.getCreatedAt())
                        .storeCode(m.getStore().getCode())
                        .storeName(m.getStore().getName())
                        .productName(m.getProduct().getName())
                        .barcode(m.getProduct().getBarcode())
                        .batchNumber(m.getBatch() != null ? m.getBatch().getBatchNumber() : "—")
                        .movementType(m.getMovementType())
                        .movementTypeName(resolveMovementTypeName(m.getMovementType()))
                        .quantityChange(m.getQuantityChange())
                        .quantityAfter(m.getQuantityAfter())
                        .referenceType(m.getReferenceType())
                        .referenceId(m.getReferenceId())
                        .createdByName(m.getCreatedBy() != null ? m.getCreatedBy().getUsername() : "System")
                        .note(m.getNote())
                        .build())
                .collect(Collectors.toList());

        return InventoryReportResponse.builder()
                .storeId(request.getStoreId())
                .storeName(storeName)
                .filterStatus(filter)
                .totalValuationCost(totalValuationCost)
                .totalValuationRetail(totalValuationRetail)
                .potentialProfit(potentialProfit)
                .potentialMarginPercentage(potentialMargin)
                .totalUnitsInStock(totalUnits)
                .totalSkus((long) uniqueProductIds.size())
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .expiringSoonCount(expiringSoonCount)
                .items(itemDtos)
                .storeBreakdown(storeBreakdown)
                .movements(movementDtos)
                .generatedAt(LocalDateTime.now())
                .generatedBy(request.getRequestedBy())
                .build();
    }

    @Override
    @Transactional
    public byte[] exportInventoryReportExcel(InventoryReportRequest request, String clientIp) {
        InventoryReportResponse report = generateInventoryReport(request, clientIp);
        return excelExportService.exportToExcel(report);
    }

    private String resolveMovementTypeName(Short type) {
        if (type == null)
            return "Unknown";
        return switch (type) {
            case 1 -> "Goods Receipt (Import)";
            case 2 -> "Sales Invoice (Issue)";
            case 3 -> "Inventory Adjustment";
            case 4 -> "Store Transfer In";
            case 5 -> "Store Transfer Out";
            case 6 -> "Sales Return (Inflow)";
            default -> "Movement Type #" + type;
        };
    }
}
