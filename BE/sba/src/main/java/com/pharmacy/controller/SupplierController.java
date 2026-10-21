package com.pharmacy.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.dto.supplier.UpdateSupplierRequest;
import com.pharmacy.entity.enums.SupplierStatus;
import com.pharmacy.service.SupplierService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/supplier")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class SupplierController {

        private final SupplierService supplierService;

        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> viewSupplierList(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) SupplierStatus status,
                        @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
                Page<SupplierResponse> page = supplierService.viewSupplierList(keyword, status, pageable);
                PageResponse<SupplierResponse> pageResponse = PageResponse.from(page);
                return ResponseEntity.ok(
                                ApiResponse.success("Suppliers retrieved successfully", pageResponse));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<SupplierResponse>> viewSupplierDetail(
                        @PathVariable Long id) {
                SupplierResponse data = supplierService.viewSupplierDetail(id);
                return ResponseEntity.ok(
                                ApiResponse.success("Supplier details retrieved successfully", data));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
                        @RequestBody CreateSupplierRequest request) {
                SupplierResponse data = supplierService.createSupplier(request);
                ApiResponse<SupplierResponse> body = ApiResponse.<SupplierResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Supplier created successfully")
                                .data(data)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED).body(body);
        }

        @PatchMapping("/{id}")
        public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplierInformation(
                        @PathVariable Long id,
                        @RequestBody UpdateSupplierRequest request) {
                SupplierResponse data = supplierService.updateSupplierInformation(id, request);
                ApiResponse<SupplierResponse> body = ApiResponse.<SupplierResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Supplier updated successfully")
                                .data(data)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.OK).body(body);
        }

        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<SupplierResponse>> deleteSupplier(
                        @PathVariable Long id) {
                SupplierResponse data = supplierService.deleteSupplier(id);
                return ResponseEntity.ok(
                                ApiResponse.success("Supplier deleted successfully", data));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
        }
}
