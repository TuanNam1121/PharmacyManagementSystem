package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.report.InventoryReportRequest;
import com.pharmacy.dto.report.InventoryReportResponse;
import com.pharmacy.service.InventoryReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports/inventory")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    /**
     * UC71: Auto-fetch inventory report with filters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<InventoryReportResponse>> getInventoryReport(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false, defaultValue = "ALL") String stockStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest servletRequest) {

        InventoryReportRequest request = InventoryReportRequest.builder()
                .storeId(storeId)
                .stockStatus(stockStatus)
                .startDate(startDate)
                .endDate(endDate)
                .requestedBy("general_manager")
                .build();

        InventoryReportResponse response = inventoryReportService.generateInventoryReport(request,
                servletRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Inventory report retrieved successfully", response));
    }

    /**
     * UC71 Step 3, 4, 5: General Manager confirms parameters & commits audit trail
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<InventoryReportResponse>> generateInventoryReport(
            @Valid @RequestBody InventoryReportRequest request,
            HttpServletRequest servletRequest) {

        InventoryReportResponse response = inventoryReportService.generateInventoryReport(request,
                servletRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Inventory report generated and audit log recorded", response));
    }

    /**
     * UC71: Export Executive Inventory Report in Excel (.xlsx) format with embedded
     * chart
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportInventoryReportExcel(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false, defaultValue = "ALL") String stockStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest servletRequest) {

        InventoryReportRequest request = InventoryReportRequest.builder()
                .storeId(storeId)
                .stockStatus(stockStatus)
                .startDate(startDate)
                .endDate(endDate)
                .requestedBy("general_manager")
                .build();

        byte[] excelBytes = inventoryReportService.exportInventoryReportExcel(request, servletRequest.getRemoteAddr());
        String filename = String.format("Executive_Inventory_Valuation_Report_%s.xlsx", LocalDate.now());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
