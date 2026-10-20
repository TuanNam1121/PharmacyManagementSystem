package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.DailySalesOverviewDto;
import com.pharmacy.dto.DailySalesReconcileRequest;
import com.pharmacy.dto.SalesInvoiceSummaryDto;
import com.pharmacy.dto.ShiftSummaryDto;
import com.pharmacy.service.DailySalesService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-sales")
@CrossOrigin(origins = "*") // Hoặc cấu hình CORS theo môi trường FE
@RequiredArgsConstructor
public class DailySalesController {

    private final DailySalesService dailySalesService;

    /**
     * UC27 - Main Flow Step 2: Hiển thị giao diện dữ liệu doanh thu ngày & chỉ số đối soát
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DailySalesOverviewDto>> getDailySalesOverview(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        DailySalesOverviewDto overview = dailySalesService.getDailySalesOverview(storeId, targetDate);
        return ResponseEntity.ok(ApiResponse.ok(overview, "Tải dữ liệu doanh thu ngày thành công"));
    }

    /**
     * UC27 - Step 2 (Chi tiết): Danh sách hóa đơn bán hàng trong ngày
     */
    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<Page<SalesInvoiceSummaryDto>>> getDailyInvoices(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        Page<SalesInvoiceSummaryDto> invoices = dailySalesService.getDailyInvoices(storeId, targetDate, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Tải danh sách hóa đơn thành công"));
    }

    /**
     * UC27 - Step 2 (Chi tiết): Danh sách ca làm việc trong ngày
     */
    @GetMapping("/shifts")
    public ResponseEntity<ApiResponse<List<ShiftSummaryDto>>> getDailyShifts(
            @RequestParam Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<ShiftSummaryDto> shifts = dailySalesService.getDailyShifts(storeId, targetDate);
        return ResponseEntity.ok(ApiResponse.ok(shifts, "Tải danh sách ca làm việc thành công"));
    }

    /**
     * UC27 - Main Flow Step 3, 4, 5: Store Manager xác nhận đối soát & chốt sổ doanh thu ngày
     * Validate ràng buộc nghiệp vụ (BR-01, BR-02, BR-03)
     */
    @PostMapping("/reconcile")
    public ResponseEntity<ApiResponse<DailySalesOverviewDto>> reconcileDailySales(
            @Valid @RequestBody DailySalesReconcileRequest request,
            HttpServletRequest servletRequest) {

        // Lấy username từ security context (hoặc header auth)
        String currentUsername = "store_manager_demo";
        String clientIp = servletRequest.getRemoteAddr();

        DailySalesOverviewDto result = dailySalesService.reconcileDailySales(request, currentUsername, clientIp);
        return ResponseEntity.ok(ApiResponse.ok(result, "Xác nhận đối soát doanh thu ngày thành công"));
    }
}