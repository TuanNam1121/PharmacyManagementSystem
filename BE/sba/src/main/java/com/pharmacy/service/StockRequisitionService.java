package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import org.springframework.data.domain.Pageable;

public interface StockRequisitionService {

    /** UC36 - Step 2: Lấy danh sách đơn đặt hàng nội bộ (phân trang, lọc) */
    PageResponse<StockRequisitionDto> getRequisitionList(Long storeId, Short status, String search, Pageable pageable);

    /** UC36 - Step 2 (chi tiết): Xem chi tiết 1 đơn */
    StockRequisitionDto getRequisitionDetail(Long requisitionId);
}
