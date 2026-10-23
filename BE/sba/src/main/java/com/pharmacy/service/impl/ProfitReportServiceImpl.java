package com.pharmacy.service.impl;

import com.pharmacy.dto.report.ProfitReportRequest;
import com.pharmacy.dto.report.ProfitReportResponse;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.SalesInvoice;
import com.pharmacy.entity.SalesInvoiceDetail;
import com.pharmacy.entity.Store;
import com.pharmacy.entity.enums.SalesInvoiceStatus;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.SalesInvoiceDetailRepository;
import com.pharmacy.repository.StoreRepository;
import com.pharmacy.service.ProfitExcelExportService;
import com.pharmacy.service.ProfitReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfitReportServiceImpl implements ProfitReportService {

    private final SalesInvoiceDetailRepository detailRepository;
    private final StoreRepository storeRepository;
    private final ProfitExcelExportService excelExportService;

    @Override
    @Transactional
    public ProfitReportResponse generateProfitReport(ProfitReportRequest request, String clientIp) {
        // 1. Validation constraints (Step 4 & AT01)
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date must not be null.");
        }
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date (Business Rule BR-03).");
        }

        String storeName = "All Stores (Chain-wide)";
        if (request.getStoreId() != null) {
            Store store = storeRepository.findById(request.getStoreId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Store not found with ID: " + request.getStoreId()));
            storeName = store.getName();
        }

        LocalDateTime startDateTime = request.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = request.getEndDate().atTime(LocalTime.MAX);

        // 2. Fetch all paid sales invoice details (Status = PAID: 1)
        List<SalesInvoiceDetail> details = detailRepository.findDetailsForProfitReport(
                SalesInvoiceStatus.PAID.getCode(),
                startDateTime,
                endDateTime,
                request.getStoreId());

        // 3. Aggregate totals
        Set<Long> uniqueInvoiceIds = new HashSet<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (SalesInvoiceDetail d : details) {
            uniqueInvoiceIds.add(d.getSalesInvoice().getId());

            BigDecimal itemRevenue = d.getSubTotal() != null ? d.getSubTotal()
                    : d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity()));
            BigDecimal itemCost = d.getUnitCost().multiply(BigDecimal.valueOf(d.getQuantity()));

            totalRevenue = totalRevenue.add(itemRevenue);
            totalCost = totalCost.add(itemCost);
        }

        BigDecimal grossProfit = totalRevenue.subtract(totalCost);
        BigDecimal grossMarginPercentage = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long invoiceCount = uniqueInvoiceIds.size();
        BigDecimal averageOrderValue = invoiceCount > 0
                ? totalRevenue.divide(BigDecimal.valueOf(invoiceCount), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 4. Breakdown by Product
        Map<Long, List<SalesInvoiceDetail>> byProduct = details.stream()
                .collect(Collectors.groupingBy(d -> d.getProduct().getId()));

        List<ProfitReportResponse.ProductProfitDto> topProducts = byProduct.values().stream().map(prodDetails -> {
            SalesInvoiceDetail first = prodDetails.get(0);
            int qty = prodDetails.stream().mapToInt(SalesInvoiceDetail::getQuantity).sum();
            BigDecimal prodRev = prodDetails.stream()
                    .map(d -> d.getSubTotal() != null ? d.getSubTotal()
                            : d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal prodCost = prodDetails.stream()
                    .map(d -> d.getUnitCost().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal prodProfit = prodRev.subtract(prodCost);
            BigDecimal prodMargin = prodRev.compareTo(BigDecimal.ZERO) > 0
                    ? prodProfit.multiply(BigDecimal.valueOf(100)).divide(prodRev, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return ProfitReportResponse.ProductProfitDto.builder()
                    .productId(first.getProduct().getId())
                    .barcode(first.getProduct().getBarcode())
                    .productName(first.getProduct().getName())
                    .unit(first.getProduct().getUnit())
                    .quantitySold(qty)
                    .revenue(prodRev)
                    .cost(prodCost)
                    .grossProfit(prodProfit)
                    .marginPercentage(prodMargin)
                    .build();
        }).sorted(Comparator.comparing(ProfitReportResponse.ProductProfitDto::getGrossProfit).reversed())
                .collect(Collectors.toList());

        // 5. Breakdown by Store
        Map<Long, List<SalesInvoiceDetail>> byStore = details.stream()
                .collect(Collectors.groupingBy(d -> d.getSalesInvoice().getStore().getId()));

        List<ProfitReportResponse.StoreProfitDto> storeBreakdown = byStore.values().stream().map(storeDetails -> {
            Store s = storeDetails.get(0).getSalesInvoice().getStore();
            long count = storeDetails.stream().map(d -> d.getSalesInvoice().getId()).distinct().count();
            BigDecimal sRev = storeDetails.stream()
                    .map(d -> d.getSubTotal() != null ? d.getSubTotal()
                            : d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal sCost = storeDetails.stream()
                    .map(d -> d.getUnitCost().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal sProfit = sRev.subtract(sCost);
            BigDecimal sMargin = sRev.compareTo(BigDecimal.ZERO) > 0
                    ? sProfit.multiply(BigDecimal.valueOf(100)).divide(sRev, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return ProfitReportResponse.StoreProfitDto.builder()
                    .storeId(s.getId())
                    .storeCode(s.getCode())
                    .storeName(s.getName())
                    .invoiceCount(count)
                    .revenue(sRev)
                    .cost(sCost)
                    .grossProfit(sProfit)
                    .marginPercentage(sMargin)
                    .build();
        }).sorted(Comparator.comparing(ProfitReportResponse.StoreProfitDto::getRevenue).reversed())
                .collect(Collectors.toList());

        // 6. Breakdown by Daily Trend
        Map<LocalDate, List<SalesInvoiceDetail>> byDate = details.stream()
                .collect(Collectors.groupingBy(d -> d.getSalesInvoice().getCreatedAt().toLocalDate()));

        List<ProfitReportResponse.DailyProfitTrendDto> dailyTrends = byDate.entrySet().stream().map(entry -> {
            LocalDate dDate = entry.getKey();
            List<SalesInvoiceDetail> dList = entry.getValue();
            long count = dList.stream().map(d -> d.getSalesInvoice().getId()).distinct().count();
            BigDecimal dRev = dList.stream()
                    .map(d -> d.getSubTotal() != null ? d.getSubTotal()
                            : d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal dCost = dList.stream()
                    .map(d -> d.getUnitCost().multiply(BigDecimal.valueOf(d.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal dProfit = dRev.subtract(dCost);
            BigDecimal dMargin = dRev.compareTo(BigDecimal.ZERO) > 0
                    ? dProfit.multiply(BigDecimal.valueOf(100)).divide(dRev, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return ProfitReportResponse.DailyProfitTrendDto.builder()
                    .date(dDate)
                    .invoiceCount(count)
                    .revenue(dRev)
                    .cost(dCost)
                    .grossProfit(dProfit)
                    .marginPercentage(dMargin)
                    .build();
        }).sorted(Comparator.comparing(ProfitReportResponse.DailyProfitTrendDto::getDate))
                .collect(Collectors.toList());

        return ProfitReportResponse.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .storeId(request.getStoreId())
                .storeName(storeName)
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .grossProfit(grossProfit)
                .grossMarginPercentage(grossMarginPercentage)
                .totalInvoices(invoiceCount)
                .averageOrderValue(averageOrderValue)
                .topProducts(topProducts)
                .storeBreakdown(storeBreakdown)
                .dailyTrends(dailyTrends)
                .generatedAt(LocalDateTime.now())
                .generatedBy(request.getRequestedBy())
                .build();
    }

    @Override
    @Transactional
    public byte[] exportProfitReportExcel(ProfitReportRequest request, String clientIp) {
        ProfitReportResponse report = generateProfitReport(request, clientIp);
        return excelExportService.exportToExcel(report);
    }
}
