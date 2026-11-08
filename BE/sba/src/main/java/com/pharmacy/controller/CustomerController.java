package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerCreateRequest;
import com.pharmacy.dto.customer.CustomerDetailResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.dto.customer.CustomerUpdateRequest;
import com.pharmacy.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "APIs for managing customer accounts and medical profiles")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Lấy danh sách khách hàng có tìm kiếm, lọc và phân trang (UC30)")
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Short status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<CustomerResponse> response = customerService.getCustomers(
                keyword, status, page, size, sortBy, sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khách hàng thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết hồ sơ khách hàng (UC29)")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getCustomerDetail(@PathVariable Long id) {
        CustomerDetailResponse response = customerService.getCustomerDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết khách hàng thành công", response));
    }

    @PostMapping
    @Operation(summary = "Đăng ký khách hàng mới (UC27)")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> registerCustomer(
            @Valid @RequestBody CustomerCreateRequest request) {
        CustomerDetailResponse response = customerService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký khách hàng mới thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin khách hàng (UC28)")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerDetailResponse response = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin khách hàng thành công", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Vô hiệu hóa (xóa mềm) khách hàng (UC31)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteCustomer(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Khách hàng yêu cầu ngừng sử dụng dịch vụ") String reason) {
        customerService.deleteCustomer(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa khách hàng thành công",
                Map.of("customerId", id, "status", 0)));
    }

    @PatchMapping("/{id}/reactivate")
    @Operation(summary = "Kích hoạt lại khách hàng (UC31)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateCustomer(@PathVariable Long id) {
        customerService.reactivateCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt lại khách hàng thành công",
                Map.of("customerId", id, "status", 1)));
    }
}
