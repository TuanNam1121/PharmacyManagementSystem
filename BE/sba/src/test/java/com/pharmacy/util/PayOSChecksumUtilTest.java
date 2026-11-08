package com.pharmacy.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PayOSChecksumUtilTest {

    private final String sampleChecksumKey = "d870d0bf3d83870817c2f8fdfab5f1712a32c25fb18a9fc8ecf84a44139e83ec";

    @Test
    @DisplayName("Tạo chữ ký yêu cầu thanh toán hợp lệ")
    void testCreateSignature() {
        long amount = 50000;
        String cancelUrl = "http://localhost:3000/pos";
        String description = "PMS 12345";
        long orderCode = 123456789L;
        String returnUrl = "http://localhost:3000/pos";

        String signature = PayOSChecksumUtil.createSignature(amount, cancelUrl, description, orderCode, returnUrl, sampleChecksumKey);

        assertNotNull(signature);
        assertFalse(signature.isBlank());
        assertEquals(64, signature.length(), "HMAC-SHA256 hex string phải có độ dài đúng 64 ký tự");
    }

    @Test
    @DisplayName("Xác thực chữ ký Webhook PayOS thành công khi chữ ký khớp")
    void testVerifyWebhookSignature_Success() {
        Map<String, Object> data = new HashMap<>();
        data.put("orderCode", 123456789L);
        data.put("amount", 50000);
        data.put("description", "PMS 12345");
        data.put("code", "00");

        // Tự tạo signature đúng chuẩn
        // amount=50000&code=00&description=PMS 12345&orderCode=123456789
        String dataStr = "amount=50000&code=00&description=PMS 12345&orderCode=123456789";
        String expectedSig = PayOSChecksumUtil.hmacSha256(dataStr, sampleChecksumKey);

        boolean isValid = PayOSChecksumUtil.verifyWebhookSignature(data, expectedSig, sampleChecksumKey);
        assertTrue(isValid, "Chữ ký số webhook phải được xác thực thành công");
    }

    @Test
    @DisplayName("Từ chối Webhook khi chữ ký bị làm giả hoặc sai checksumKey")
    void testVerifyWebhookSignature_Tampered() {
        Map<String, Object> data = new HashMap<>();
        data.put("orderCode", 123456789L);
        data.put("amount", 50000);

        boolean isValid = PayOSChecksumUtil.verifyWebhookSignature(data, "fake_tampered_signature_12345", sampleChecksumKey);
        assertFalse(isValid, "Phải từ chối chữ ký không hợp lệ để chống giả mạo IPN");
    }
}
