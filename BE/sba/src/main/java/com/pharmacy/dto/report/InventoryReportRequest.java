package com.pharmacy.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportRequest {

    private Long storeId; // null = All Stores (Chain-wide)
    private String stockStatus; // ALL, LOW_STOCK, OUT_OF_STOCK, EXPIRING_SOON, IN_STOCK

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate; // For movement timeline

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    @Builder.Default
    private String requestedBy = "general_manager";
}
