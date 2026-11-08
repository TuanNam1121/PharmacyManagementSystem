package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.auth.*;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user login, logout, token refresh, password lifecycle and recovery")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống bằng username hoặc email và password")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        LoginResult result = authService.login(request, clientIp);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(jwtTokenProvider.getRefreshTokenExpirationInSeconds())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Đăng nhập thành công", result.getResponse()));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới Access Token bằng Refresh Token từ HttpOnly Cookie")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenCookie,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        String tokenToRefresh = refreshTokenCookie;
        if (tokenToRefresh == null || tokenToRefresh.isBlank()) {
            tokenToRefresh = extractCookieFromRequest(httpRequest, "refreshToken");
        }

        LoginResult result = authService.refreshToken(tokenToRefresh, clientIp);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(jwtTokenProvider.getRefreshTokenExpirationInSeconds())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Làm mới token thành công", result.getResponse()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất khỏi hệ thống và vô hiệu hóa phiên làm việc")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        String tokenToRevoke = refreshTokenCookie;
        if (tokenToRevoke == null || tokenToRevoke.isBlank()) {
            tokenToRevoke = extractCookieFromRequest(httpRequest, "refreshToken");
        }

        authService.logout(authHeader, tokenToRevoke, clientIp);

        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        Long accountId = resolveCurrentAccountId(authHeader);
        authService.changePassword(accountId, request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Yêu cầu gửi liên kết đặt lại mật khẩu qua email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        authService.processForgotPassword(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(
                "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn nếu địa chỉ hợp lệ",
                null
        ));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu mới bằng token hợp lệ")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        authService.resetPassword(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(
                "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ",
                null
        ));
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

    private String extractCookieFromRequest(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
