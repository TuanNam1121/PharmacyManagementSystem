package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.ConfirmGoodsReceiptRequest;
import com.pharmacy.dto.inventory.GoodsReceiptDto;
import com.pharmacy.service.GoodsReceiptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/goods-receipts")
@CrossOrigin(origins = "*")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    /**
     * UC38 - Step 1, 2: Xem danh sách phiếu nhập kho theo chi nhánh
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GoodsReceiptDto>>> getGoodsReceiptList(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt") Pageable pageable) {

        PageResponse<GoodsReceiptDto> result = goodsReceiptService.getGoodsReceiptList(storeId, status, search,
                pageable);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách phiếu nhập kho thành công", result));
    }

    /**
     * UC38 - Step 2 (chi tiết): Xem chi tiết 1 phiếu nhập kho
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> getGoodsReceiptDetail(@PathVariable Long id) {
        GoodsReceiptDto result = goodsReceiptService.getGoodsReceiptDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Tải chi tiết phiếu nhập kho thành công", result));
    }

    /**
     * UC38 - Step 3, 4, 5: Xác nhận nhận hàng / kiểm nhận tại chi nhánh
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> confirmGoodsReceipt(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmGoodsReceiptRequest request,
            HttpServletRequest httpServletRequest) {

        String clientIp = httpServletRequest.getRemoteAddr();
        GoodsReceiptDto result = goodsReceiptService.confirmGoodsReceipt(id, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận kiểm nhận hàng vào kho chi nhánh thành công", result));
    }
}
