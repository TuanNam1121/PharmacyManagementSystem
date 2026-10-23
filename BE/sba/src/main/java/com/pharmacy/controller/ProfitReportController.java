package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.report.ProfitReportRequest;
import com.pharmacy.dto.report.ProfitReportResponse;
import com.pharmacy.service.ProfitReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports/profit")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfitReportController {

    private final ProfitReportService profitReportService;

    /**
     * UC70: Get quick profit report with query params
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfitReportResponse>> getProfitReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long storeId,
            HttpServletRequest servletRequest) {

        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.withDayOfMonth(1); // First day of current month

        ProfitReportRequest request = ProfitReportRequest.builder()
                .startDate(start)
                .endDate(end)
                .storeId(storeId)
                .requestedBy("general_manager")
                .build();

        ProfitReportResponse response = profitReportService.generateProfitReport(request,
                servletRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Profit report generated successfully", response));
    }

    /**
     * UC70 Step 3, 4, 5: General Manager confirms parameters, validates
     * constraints, and commits audit log
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ProfitReportResponse>> generateProfitReport(
            @Valid @RequestBody ProfitReportRequest request,
            HttpServletRequest servletRequest) {

        ProfitReportResponse response = profitReportService.generateProfitReport(request,
                servletRequest.getRemoteAddr());
        return ResponseEntity
                .ok(ApiResponse.success("Profit report generated and audit trail recorded successfully", response));
    }

    /**
     * UC70: Export Executive Profit Report in Excel (.xlsx) format with embedded
     * charts
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportProfitReportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long storeId,
            HttpServletRequest servletRequest) {

        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.withDayOfMonth(1);

        ProfitReportRequest request = ProfitReportRequest.builder()
                .startDate(start)
                .endDate(end)
                .storeId(storeId)
                .requestedBy("general_manager")
                .build();

        byte[] excelBytes = profitReportService.exportProfitReportExcel(request, servletRequest.getRemoteAddr());
        String filename = String.format("Executive_Profit_Report_%s_to_%s.xlsx", start, end);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

}
