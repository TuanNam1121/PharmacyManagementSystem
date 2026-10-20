package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesOverviewDto {
    private Long storeId;
    private String storeName;
    private String storeCode;
    private LocalDate businessDate;

    // Doanh thu hệ thống tính từ các hóa đơn & ca làm việc
    private BigDecimal systemCash;
    private BigDecimal systemBank;
    private BigDecimal systemVnpay;
    private BigDecimal systemTotal;

    // Số liệu kiểm đếm thực tế của Store Manager
    private BigDecimal actualCash;
    private BigDecimal difference;
    private Short status; // 0: Chờ đối soát (Draft), 1: Đã chốt (Reconciled)
    private String note;

    // Thông tin người chốt & thời gian
    private Long reconciledById;
    private String reconciledByName;
    private LocalDateTime reconciledAt;

    // Thống kê phụ
    private Integer totalInvoices;
    private Integer totalShifts;
    private Double growthPercentageVsYesterday;
}