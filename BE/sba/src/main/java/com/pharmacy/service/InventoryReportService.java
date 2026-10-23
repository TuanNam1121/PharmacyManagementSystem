package com.pharmacy.service;

import com.pharmacy.dto.report.InventoryReportRequest;
import com.pharmacy.dto.report.InventoryReportResponse;

public interface InventoryReportService {
    InventoryReportResponse generateInventoryReport(InventoryReportRequest request, String clientIp);

    byte[] exportInventoryReportExcel(InventoryReportRequest request, String clientIp);
}
