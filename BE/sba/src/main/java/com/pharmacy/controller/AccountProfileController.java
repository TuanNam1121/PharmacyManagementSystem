package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.auth.ProfileUpdateRequest;
import com.pharmacy.dto.auth.UserProfileResponse;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Tag(name = "Profile Management", description = "APIs for viewing and updating personal profile")
@CrossOrigin(origins = "*")
public class AccountProfileController {

    private final ProfileService profileService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    @Operation(summary = "Xem hồ sơ thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        UserProfileResponse response = profileService.getProfile(accountId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hồ sơ thành công", response));
    }

    @PutMapping
    @Operation(summary = "Cập nhật hồ sơ cá nhân (Họ tên, SĐT, Ngày sinh, Giới tính, Địa chỉ, Avatar)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        Long accountId = resolveCurrentAccountId(authHeader);
        UserProfileResponse response = profileService.updateProfile(accountId, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ cá nhân thành công", response));
    }

    private Long resolveCurrentAccountId(String authHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getAccountIdFromToken(token);
        }
        throw new IllegalStateException("Không xác định được danh tính người dùng đang thao tác");
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

