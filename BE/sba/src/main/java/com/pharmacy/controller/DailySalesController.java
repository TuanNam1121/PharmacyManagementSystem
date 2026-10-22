package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.sales.DailySalesOverviewDto;
import com.pharmacy.dto.sales.DailySalesReconcileRequest;
import com.pharmacy.dto.sales.SalesInvoiceSummaryDto;
import com.pharmacy.dto.sales.ShiftSummaryDto;
import com.pharmacy.service.DailySalesService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-sales")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DailySalesController {

    private final DailySalesService dailySalesService;

    /**
     * Display daily sales overview and reconciliation metrics
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DailySalesOverviewDto>> getDailySalesOverview(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        DailySalesOverviewDto overview = dailySalesService.getDailySalesOverview(storeId, targetDate);
        return ResponseEntity.ok(ApiResponse.success("Daily sales overview retrieved successfully", overview));
    }

    /**
     * Get list of daily sales invoices
     */
    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<Page<SalesInvoiceSummaryDto>>> getDailyInvoices(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        Page<SalesInvoiceSummaryDto> invoices = dailySalesService.getDailyInvoices(storeId, targetDate,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Daily sales invoices retrieved successfully", invoices));
    }

    /**
     * Get list of daily cashier shifts
     */
    @GetMapping("/shifts")
    public ResponseEntity<ApiResponse<List<ShiftSummaryDto>>> getDailyShifts(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<ShiftSummaryDto> shifts = dailySalesService.getDailyShifts(storeId, targetDate);
        return ResponseEntity.ok(ApiResponse.success("Daily cashier shifts retrieved successfully", shifts));
    }

    /**
     * Store Manager confirms reconciliation and daily sales settlement
     */
    @PostMapping("/reconcile")
    public ResponseEntity<ApiResponse<DailySalesOverviewDto>> reconcileDailySales(
            @Valid @RequestBody DailySalesReconcileRequest request,
            HttpServletRequest servletRequest) {

        // Retrieve current username from security context
        String currentUsername = "store_manager_demo";
        String clientIp = servletRequest.getRemoteAddr();

        DailySalesOverviewDto result = dailySalesService.reconcileDailySales(request, currentUsername, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Daily sales reconciled successfully", result));
    }
}