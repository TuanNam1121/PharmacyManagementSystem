package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.account.AccountCreateRequest;
import com.pharmacy.dto.account.AccountDetailResponse;
import com.pharmacy.dto.account.AccountResponse;
import com.pharmacy.dto.account.AccountUpdateRequest;
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
    @Operation(summary = "Create new account")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account information")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse response = accountService.updateAccount(id, request);
        return ResponseEntity.ok(ApiResponse.success("Account updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account details")
    public ResponseEntity<ApiResponse<AccountDetailResponse>> getAccountDetail(
            @PathVariable Long id) {
        AccountDetailResponse response = accountService.getAccountDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Account details retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get accounts list (paginated, searchable, filterable)")
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
        return ResponseEntity.ok(ApiResponse.success("Accounts retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change account status (Active/Disabled/Locked)")
    public ResponseEntity<ApiResponse<Void>> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam Short status,
            @RequestParam(required = false) String reason) {
        accountService.updateAccountStatus(id, status, reason);
        return ResponseEntity.ok(ApiResponse.success("Account status updated successfully", null));
    }
}
