package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.ConfirmGoodsReceiptRequest;
import com.pharmacy.dto.inventory.GoodsReceiptDto;
import org.springframework.data.domain.Pageable;

public interface GoodsReceiptService {
    /** Get list of goods receipts with pagination and filter */
    PageResponse<GoodsReceiptDto> getGoodsReceiptList(Long storeId, Short status, String search, Pageable pageable);

    /**
     * View detailed information of goods receipt and product batch list
     */
    GoodsReceiptDto getGoodsReceiptDetail(Long id);

    /**
     * Confirm goods receipt, update branch inventory and record AuditLog
     */
    GoodsReceiptDto confirmGoodsReceipt(Long id, ConfirmGoodsReceiptRequest request, String clientIp);
}
