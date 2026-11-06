package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.store.StoreResponse;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Tag(name = "Store Management", description = "APIs for retail branches and stores")
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    @Operation(summary = "Get authorized active retail branches for authenticated user")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getAuthorizedRetailStores(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<StoreResponse> stores = storeService.getAuthorizedRetailStores(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Stores retrieved successfully", stores));
    }
}

