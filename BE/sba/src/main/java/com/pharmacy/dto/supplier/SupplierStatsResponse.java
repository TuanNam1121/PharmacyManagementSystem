package com.pharmacy.dto.supplier;

import lombok.Builder;

/**
 * Số liệu KPI cho màn hình danh mục nhà cung cấp (/supplier).
 * Đếm toàn hệ thống bằng truy vấn COUNT, không phụ thuộc phân trang.
 */
@Builder
public record SupplierStatsResponse(
        long total,
        long active,
        long inactive,
        long pending,
        long withTaxCode) {
}