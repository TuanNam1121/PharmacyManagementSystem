package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.sales.CreateSalesInvoiceRequest;
import com.pharmacy.dto.sales.SalesInvoiceResponse;
import com.pharmacy.dto.sales.SalesReturnRequest;
import com.pharmacy.dto.sales.SalesReturnResponse;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.SalesInvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/invoices")
@RequiredArgsConstructor
@Tag(name = "Sales Invoice & POS", description = "APIs for POS checkout, invoices, order returns, and purchase history (UC21, UC22, UC25, UC23)")
@CrossOrigin(origins = "*")
public class SalesInvoiceController {

    private final SalesInvoiceService salesInvoiceService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    @Operation(summary = "Tạo mới và thanh toán hóa đơn bán lẻ tại quầy POS (UC21, UC22)")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> createSalesInvoice(
            @Valid @RequestBody CreateSalesInvoiceRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        SalesInvoiceResponse response = salesInvoiceService.createSalesInvoice(request, accountId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo và thanh toán hóa đơn thành công", response));
    }

    @GetMapping("/{codeOrId}")
    @Operation(summary = "Xem chi tiết hóa đơn theo ID hoặc mã hóa đơn (INV-...)")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> getInvoice(@PathVariable String codeOrId) {
        SalesInvoiceResponse response;
        if (codeOrId.matches("^\\d+$")) {
            response = salesInvoiceService.getInvoiceById(Long.parseLong(codeOrId));
        } else {
            response = salesInvoiceService.getInvoiceByCode(codeOrId);
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết hóa đơn thành công", response));
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang danh sách hóa đơn bán lẻ")
    public ResponseEntity<ApiResponse<PageResponse<SalesInvoiceResponse>>> getInvoices(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long shiftId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Short status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<SalesInvoiceResponse> response = salesInvoiceService.getInvoices(
                storeId, shiftId, customerId, keyword, status, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hóa đơn thành công", response));
    }

    @PostMapping("/return")
    @Operation(summary = "Xử lý đổi trả thuốc / hoàn tiền hóa đơn (UC25)")
    public ResponseEntity<ApiResponse<SalesReturnResponse>> returnSalesInvoice(
            @Valid @RequestBody SalesReturnRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        SalesReturnResponse response = salesInvoiceService.returnSalesInvoice(request, accountId);
        return ResponseEntity.ok(ApiResponse.success("Đổi trả thuốc và hoàn tiền thành công", response));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Tra cứu lịch sử mua thuốc của khách hàng (UC23)")
    public ResponseEntity<ApiResponse<List<SalesInvoiceResponse>>> getCustomerPurchaseHistory(
            @PathVariable Long customerId) {
        List<SalesInvoiceResponse> response = salesInvoiceService.getCustomerPurchaseHistory(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử mua hàng thành công", response));
    }

    private Long resolveCurrentAccountId(String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                return jwtTokenProvider.getAccountIdFromToken(token);
            } catch (Exception ignored) {}
        }
        return 1L;
    }
}
