package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(required = false) String membershipTier,
            @RequestParam(required = false) Short status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<CustomerResponse> response = customerService.getCustomers(
                keyword, membershipTier, status, page, size, sortBy, sortDir
        );

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khách hàng thành công", response));
    }
}
