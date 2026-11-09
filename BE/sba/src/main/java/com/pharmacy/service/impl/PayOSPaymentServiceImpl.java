package com.pharmacy.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy.config.PayOSConfig;
import com.pharmacy.dto.payment.CreatePayOSPaymentRequest;
import com.pharmacy.dto.payment.PayOSPaymentResponse;
import com.pharmacy.dto.payment.PayOSStatusResponse;
import com.pharmacy.dto.payment.PayOSWebhookRequest;
import com.pharmacy.service.PayOSPaymentService;
import com.pharmacy.util.PayOSChecksumUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayOSPaymentServiceImpl implements PayOSPaymentService {

    private final PayOSConfig payOSConfig;
    private final RestTemplate payOsRestTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;
    
    // Bộ nhớ cache tạm thời lưu trạng thái đơn hàng thời gian thực
    private final Map<Long, PayOSStatusResponse> localStatusCache = new ConcurrentHashMap<>();

    @Override
    public PayOSPaymentResponse createPaymentLink(CreatePayOSPaymentRequest request) {
        validatePayOSCredentials();

        long amount = request.getAmount().longValue();
        // Sinh orderCode là số nguyên dương duy nhất (11 chữ số an toàn với giới hạn PayOS)
        long orderCode = generateOrderCode();
        String cancelUrl = frontendUrl + "/pos";
        String returnUrl = frontendUrl + "/pos";

        // Chuẩn hóa mô tả tối đa 25 ký tự không dấu (theo quy định Napas)
        String description = "PMS " + (orderCode % 10000000);
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        // Tạo chữ ký số HMAC-SHA256
        String signature = PayOSChecksumUtil.createSignature(
                amount,
                cancelUrl,
                description,
                orderCode,
                returnUrl,
                payOSConfig.getChecksumKey()
        );

        Map<String, Object> reqBody = new HashMap<>();
        reqBody.put("orderCode", orderCode);
        reqBody.put("amount", amount);
        reqBody.put("description", description);
        reqBody.put("cancelUrl", cancelUrl);
        reqBody.put("returnUrl", returnUrl);
        reqBody.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", payOSConfig.getClientId());
        headers.set("x-api-key", payOSConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);
        String url = payOSConfig.getEndpoint() + "/v2/payment-requests";

        try {
            log.info("Gửi yêu cầu tạo VietQR tới PayOS: orderCode={}, amount={}", orderCode, amount);
            ResponseEntity<String> response = payOsRestTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String code = root.path("code").asText();
                if ("00".equals(code)) {
                    JsonNode data = root.path("data");
                    PayOSPaymentResponse res = PayOSPaymentResponse.builder()
                            .orderCode(orderCode)
                            .amount(amount)
                            .description(description)
                            .accountName(data.path("accountName").asText())
                            .accountNumber(data.path("accountNumber").asText())
                            .bin(data.path("bin").asText())
                            .qrCode(data.path("qrCode").asText())
                            .checkoutUrl(data.path("checkoutUrl").asText())
                            .status(data.path("status").asText("PENDING"))
                            .build();

                    // Đưa vào cache trạng thái PENDING
                    localStatusCache.put(orderCode, PayOSStatusResponse.builder()
                            .orderCode(orderCode)
                            .status("PENDING")
                            .completed(false)
                            .amount(amount)
                            .build());

                    return res;
                } else {
                    String desc = root.path("desc").asText("Không xác định");
                    throw new RuntimeException("PayOS trả về lỗi: [" + code + "] " + desc);
                }
            } else {
                throw new RuntimeException("Lỗi kết nối tới PayOS: HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi API tạo mã PayOS: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo mã VietQR từ PayOS: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean handleWebhook(PayOSWebhookRequest request) {
        if (request == null || request.getData() == null) {
            log.warn("Payload Webhook PayOS rỗng");
            return false;
        }

        // Xác thực tính toàn vẹn chữ ký số với CHECKSUM_KEY
        boolean isValid = PayOSChecksumUtil.verifyWebhookSignature(
                request.getData(),
                request.getSignature(),
                payOSConfig.getChecksumKey()
        );

        if (!isValid) {
            log.error("Xác thực chữ ký Webhook PayOS thất bại! Dữ liệu có thể bị giả mạo.");
            return false;
        }

        try {
            Object orderCodeObj = request.getData().get("orderCode");
            if (orderCodeObj == null) {
                return false;
            }
            long orderCode = Long.parseLong(orderCodeObj.toString());

            String code = request.getCode();
            boolean isSuccess = "00".equals(code);

            String reference = request.getData().get("reference") != null ? request.getData().get("reference").toString() : null;
            String transactionDateTime = request.getData().get("transactionDateTime") != null ? request.getData().get("transactionDateTime").toString() : null;
            long amount = request.getData().get("amount") != null ? Long.parseLong(request.getData().get("amount").toString()) : 0L;

            if (isSuccess) {
                log.info("Nhận Webhook PayOS THÀNH CÔNG cho orderCode={}, amount={}, ref={}", orderCode, amount, reference);
                localStatusCache.put(orderCode, PayOSStatusResponse.builder()
                        .orderCode(orderCode)
                        .status("PAID")
                        .completed(true)
                        .amount(amount)
                        .reference(reference)
                        .transactionDateTime(transactionDateTime)
                        .build());
            }

            return true;
        } catch (Exception e) {
            log.error("Lỗi khi xử lý dữ liệu Webhook PayOS: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public PayOSStatusResponse getPaymentStatus(Long orderCode) {
        if (orderCode == null) {
            return PayOSStatusResponse.builder().status("NOT_FOUND").completed(false).build();
        }

        // 1. Kiểm tra cache nếu Webhook đã báo PAID trước đó
        PayOSStatusResponse cached = localStatusCache.get(orderCode);
        if (cached != null && cached.isCompleted()) {
            return cached;
        }

        // 2. Fallback: Nếu Webhook chưa tới hoặc dev trên localhost, gọi trực tiếp API PayOS để đối soát
        try {
            validatePayOSCredentials();
            String url = payOSConfig.getEndpoint() + "/v2/payment-requests/" + orderCode;
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", payOSConfig.getClientId());
            headers.set("x-api-key", payOSConfig.getApiKey());
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = payOsRestTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String code = root.path("code").asText();
                if ("00".equals(code)) {
                    JsonNode data = root.path("data");
                    String status = data.path("status").asText("PENDING");
                    boolean completed = "PAID".equalsIgnoreCase(status);

                    String ref = null;
                    JsonNode txns = data.path("transactions");
                    if (txns.isArray() && !txns.isEmpty()) {
                        ref = txns.get(0).path("reference").asText(null);
                    }

                    PayOSStatusResponse currentStatus = PayOSStatusResponse.builder()
                            .orderCode(orderCode)
                            .status(status)
                            .completed(completed)
                            .amount(data.path("amountPaid").asLong(data.path("amount").asLong(0)))
                            .reference(ref)
                            .build();

                    if (completed) {
                        localStatusCache.put(orderCode, currentStatus);
                    }
                    return currentStatus;
                }
            }
        } catch (Exception e) {
            log.warn("Không thể kiểm tra trạng thái từ PayOS trực tiếp cho orderCode {}: {}", orderCode, e.getMessage());
        }

        return cached != null ? cached : PayOSStatusResponse.builder()
                .orderCode(orderCode)
                .status("PENDING")
                .completed(false)
                .build();
    }

    private void validatePayOSCredentials() {
        if (payOSConfig.getClientId() == null || payOSConfig.getClientId().isBlank()
                || payOSConfig.getApiKey() == null || payOSConfig.getApiKey().isBlank()
                || payOSConfig.getChecksumKey() == null || payOSConfig.getChecksumKey().isBlank()) {
            throw new IllegalArgumentException(
                    "Cổng thanh toán PayOS chưa được cấu hình. Vui lòng điền PAYOS_CLIENT_ID, PAYOS_API_KEY và PAYOS_CHECKSUM_KEY vào file .env"
            );
        }
    }

    private long generateOrderCode() {
        // Sinh số nguyên dương 11 chữ số duy nhất, đảm bảo luôn < 9007199254740991
        long timestampPart = (System.currentTimeMillis() / 1000) % 10000000L;
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return Long.parseLong(String.format("%07d%04d", timestampPart, randomPart));
    }
}

