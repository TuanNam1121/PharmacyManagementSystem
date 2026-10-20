package com.pharmacy.service;

import com.pharmacy.dto.DailySalesOverviewDto;
import com.pharmacy.dto.DailySalesReconcileRequest;
import com.pharmacy.dto.SalesInvoiceSummaryDto;
import com.pharmacy.dto.ShiftSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface DailySalesService {
    DailySalesOverviewDto getDailySalesOverview(Long storeId, LocalDate businessDate);
    Page<SalesInvoiceSummaryDto> getDailyInvoices(Long storeId, LocalDate businessDate, Pageable pageable);
    List<ShiftSummaryDto> getDailyShifts(Long storeId, LocalDate businessDate);
    DailySalesOverviewDto reconcileDailySales(DailySalesReconcileRequest request, String currentUsername, String clientIp);
}