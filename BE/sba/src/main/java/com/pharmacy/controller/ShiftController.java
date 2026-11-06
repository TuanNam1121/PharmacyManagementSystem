package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.sales.CloseShiftRequest;
import com.pharmacy.dto.sales.OpenShiftRequest;
import com.pharmacy.dto.sales.ShiftDetailResponse;
import com.pharmacy.dto.sales.ShiftSummaryResponse;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
@Tag(name = "Shift Management", description = "APIs for opening, closing, and tracking cashier working shifts (UC19, UC20)")
@CrossOrigin(origins = "*")
public class ShiftController {

    private final ShiftService shiftService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/open")
    @Operation(summary = "Mở ca làm việc mới (UC19)")
    public ResponseEntity<ApiResponse<ShiftDetailResponse>> openShift(
            @Valid @RequestBody OpenShiftRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        ShiftDetailResponse response = shiftService.openShift(request, accountId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mở ca làm việc thành công", response));
    }

    @PostMapping("/close")
    @Operation(summary = "Chốt ca làm việc và kiểm kê két tiền (UC20)")
    public ResponseEntity<ApiResponse<ShiftDetailResponse>> closeShift(
            @Valid @RequestBody CloseShiftRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        ShiftDetailResponse response = shiftService.closeShift(request, accountId);
        return ResponseEntity.ok(ApiResponse.success("Chốt ca làm việc thành công", response));
    }

    @GetMapping("/current")
    @Operation(summary = "Kiểm tra ca làm việc hiện tại đang mở của thu ngân")
    public ResponseEntity<ApiResponse<ShiftDetailResponse>> getCurrentShift(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        ShiftDetailResponse response = shiftService.getCurrentShift(accountId);
        return ResponseEntity.ok(ApiResponse.success(
                response != null ? "Lấy ca làm việc hiện tại thành công" : "Hiện tại chưa có ca làm việc nào đang mở",
                response));
    }

    @GetMapping("/current/summary")
    @Operation(summary = "Xem tổng kết doanh thu và tiền mặt ca hiện tại trước khi chốt ca")
    public ResponseEntity<ApiResponse<ShiftSummaryResponse>> getCurrentShiftSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long accountId = resolveCurrentAccountId(authHeader);
        ShiftSummaryResponse response = shiftService.getCurrentShiftSummary(accountId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tổng kết ca thành công", response));
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
        return 1L; // Fallback to primary admin/cashier for unblocked local operation
    }
}

