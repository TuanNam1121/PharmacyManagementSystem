package com.pharmacy.service;

import com.pharmacy.dto.report.ProfitReportRequest;
import com.pharmacy.dto.report.ProfitReportResponse;

public interface ProfitReportService {
    ProfitReportResponse generateProfitReport(ProfitReportRequest request, String clientIp);

    byte[] exportProfitReportExcel(ProfitReportRequest request, String clientIp);
}
