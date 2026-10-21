package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.ConfirmGoodsReceiptRequest;
import com.pharmacy.dto.inventory.GoodsReceiptDto;
import org.springframework.data.domain.Pageable;

public interface GoodsReceiptService {
    /** UC38 - Step 1, 2: Lấy danh sách phiếu nhập kho phân trang & bộ lọc */
    PageResponse<GoodsReceiptDto> getGoodsReceiptList(Long storeId, Short status, String search, Pageable pageable);

    /**
     * UC38 - Step 2 (chi tiết): Xem chi tiết phiếu nhập kho và danh sách lô thuốc
     */
    GoodsReceiptDto getGoodsReceiptDetail(Long id);

    /**
     * UC38 - Step 3,4,5: Xác nhận nhận hàng, cập nhật tồn kho chi nhánh & ghi
     * AuditLog (BR-02)
     */
    GoodsReceiptDto confirmGoodsReceipt(Long id, ConfirmGoodsReceiptRequest request, String clientIp);
}
