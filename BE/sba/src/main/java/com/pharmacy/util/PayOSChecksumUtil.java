package com.pharmacy.util;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
public class PayOSChecksumUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * Tạo chữ ký cho yêu cầu thanh toán (Create Payment Request)
     * Format: amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}
     */
    public static String createSignature(long amount, String cancelUrl, String description, long orderCode, String returnUrl, String checksumKey) {
        String data = String.format("amount=%d&cancelUrl=%s&description=%s&orderCode=%d&returnUrl=%s",
                amount,
                cancelUrl != null ? cancelUrl : "",
                description != null ? description : "",
                orderCode,
                returnUrl != null ? returnUrl : "");
        return hmacSha256(data, checksumKey);
    }

    /**
     * Xác thực chữ ký webhook từ PayOS
     */
    public static boolean verifyWebhookSignature(Map<String, Object> data, String signature, String checksumKey) {
        if (data == null || signature == null || checksumKey == null) {
            return false;
        }

        try {
            // Sắp xếp các khóa theo alphabet
            List<String> sortedKeys = new ArrayList<>(data.keySet());
            Collections.sort(sortedKeys);

            StringBuilder sb = new StringBuilder();
            for (String key : sortedKeys) {
                Object val = data.get(key);
                if (val != null) {
                    if (!sb.isEmpty()) {
                        sb.append("&");
                    }
                    sb.append(key).append("=").append(val.toString());
                }
            }

            String calculatedSignature = hmacSha256(sb.toString(), checksumKey);
            return calculatedSignature.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Lỗi khi xác thực chữ ký Webhook PayOS: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Tính mã băm HMAC-SHA256 và trả về chuỗi Hex chữ thường
     */
    public static String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tính toán HMAC-SHA256: " + e.getMessage(), e);
        }
    }
}
