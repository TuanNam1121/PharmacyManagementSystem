package com.pharmacy.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.service.SupplierService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/supplier")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @RequestBody CreateSupplierRequest request) {
        SupplierResponse data = supplierService.createSupplier(request);
        ApiResponse<SupplierResponse> body = ApiResponse.<SupplierResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo nhà cung cấp thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> viewSupplierList(
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {
        Page<SupplierResponse> page = supplierService.viewSupplierList(pageable);
        PageResponse<SupplierResponse> pageResponse = PageResponse.from(page);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách nhà cung cấp thành công", pageResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> viewSupplierDetail(
            @PathVariable Long id) {
        SupplierResponse data = supplierService.viewSupplierDetail(id);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết nhà cung cấp thành công", data));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }
}
