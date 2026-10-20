package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.inventory.StockRequisitionDto;
import com.pharmacy.service.StockRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/stock-requisitions")
@CrossOrigin(origins = "*")
public class StockRequisitionController {

    private final StockRequisitionService stockRequisitionService;

    /**
     * UC36 - Step 2: Lấy danh sách đơn yêu cầu nhập hàng nội bộ
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StockRequisitionDto>>> getRequisitionList(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt") Pageable pageable) {

        PageResponse<StockRequisitionDto> result = stockRequisitionService.getRequisitionList(storeId, status, search,
                pageable);
        return ResponseEntity.ok(ApiResponse.success("Tải danh sách đơn yêu cầu thành công", result));
    }

    /**
     * UC36 - Step 2 (chi tiết): Xem chi tiết 1 đơn yêu cầu
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockRequisitionDto>> getRequisitionDetail(@PathVariable Long id) {
        StockRequisitionDto result = stockRequisitionService.getRequisitionDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Tải chi tiết đơn yêu cầu thành công", result));
    }
}
