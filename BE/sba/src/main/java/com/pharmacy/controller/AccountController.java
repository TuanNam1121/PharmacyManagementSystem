package com.pharmacy.controller;

import com.pharmacy.dto.*;
import com.pharmacy.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "APIs for managing accounts and profiles with RBAC")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Tạo mới tài khoản")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin tài khoản")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse response = accountService.updateAccount(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết tài khoản")
    public ResponseEntity<ApiResponse<AccountDetailResponse>> getAccountDetail(
            @PathVariable Long id) {
        AccountDetailResponse response = accountService.getAccountDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", response));
    }

    @GetMapping
    @Operation(summary = "Xem danh sách tài khoản (phân trang, tìm kiếm, lọc)")
    public ResponseEntity<ApiResponse<PageResponse<AccountResponse>>> getAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Short status,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<AccountResponse> response = accountService.getAccounts(
                keyword, status, roleId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài khoản thành công", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Thay đổi trạng thái tài khoản (Active/Inactive)")
    public ResponseEntity<ApiResponse<Void>> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam Short status) {
        accountService.updateAccountStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công", null));
    }
}
