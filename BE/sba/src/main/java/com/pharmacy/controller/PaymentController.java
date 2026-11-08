package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.payment.CreatePayOSPaymentRequest;
import com.pharmacy.dto.payment.PayOSPaymentResponse;
import com.pharmacy.dto.payment.PayOSStatusResponse;
import com.pharmacy.dto.payment.PayOSWebhookRequest;
import com.pharmacy.service.PayOSPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/sales/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & PayOS Gateway", description = "Xử lý thanh toán bán lẻ qua Tiền mặt và Chuyển khoản VietQR PayOS (UC22)")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PayOSPaymentService payOSPaymentService;

    @PostMapping("/payos/create-link")
    @Operation(summary = "Tạo mã QR yêu cầu thanh toán qua cổng PayOS (VietQR)")
    public ResponseEntity<ApiResponse<PayOSPaymentResponse>> createPayOSLink(
            @Valid @RequestBody CreatePayOSPaymentRequest request) {
        PayOSPaymentResponse response = payOSPaymentService.createPaymentLink(request);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo yêu cầu thanh toán VietQR thành công", response));
    }

    @PostMapping("/payos/webhook")
    @Operation(summary = "Webhook tiếp nhận xác nhận thanh toán tự động từ PayOS")
    public ResponseEntity<Map<String, Object>> handlePayOSWebhook(
            @RequestBody PayOSWebhookRequest request) {
        log.info("Nhận Webhook từ PayOS: code={}, signature={}", request.getCode(), request.getSignature());
        boolean success = payOSPaymentService.handleWebhook(request);

        if (success) {
            return ResponseEntity.ok(Map.of("code", "00", "desc", "success"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("code", "99", "desc", "Chữ ký số không hợp lệ hoặc dữ liệu không đúng"));
        }
    }

    @GetMapping("/payos/status/{orderCode}")
    @Operation(summary = "Kiểm tra trạng thái thanh toán thời gian thực theo orderCode (Polling)")
    public ResponseEntity<ApiResponse<PayOSStatusResponse>> checkPayOSStatus(
            @PathVariable Long orderCode) {
        PayOSStatusResponse response = payOSPaymentService.getPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Tra cứu trạng thái đơn thanh toán thành công", response));
    }
}

