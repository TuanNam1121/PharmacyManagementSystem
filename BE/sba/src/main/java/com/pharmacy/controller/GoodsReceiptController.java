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
     * View list of goods receipts by branch
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GoodsReceiptDto>>> getGoodsReceiptList(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt") Pageable pageable) {

        PageResponse<GoodsReceiptDto> result = goodsReceiptService.getGoodsReceiptList(storeId, status, search,
                pageable);
        return ResponseEntity.ok(ApiResponse.success("Goods receipts retrieved successfully", result));
    }

    /**
     * View goods receipt details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> getGoodsReceiptDetail(@PathVariable Long id) {
        GoodsReceiptDto result = goodsReceiptService.getGoodsReceiptDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Goods receipt details retrieved successfully", result));
    }

    /**
     * Confirm receipt inspection
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> confirmGoodsReceipt(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmGoodsReceiptRequest request,
            HttpServletRequest httpServletRequest) {

        String clientIp = httpServletRequest.getRemoteAddr();
        GoodsReceiptDto result = goodsReceiptService.confirmGoodsReceipt(id, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Goods receipt confirmed successfully", result));
    }
}
