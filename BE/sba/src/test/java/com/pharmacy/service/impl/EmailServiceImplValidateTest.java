package com.pharmacy.service.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class EmailServiceImplValidateTest {

    private EmailServiceImpl newService() {
        return new EmailServiceImpl(null, null);
    }

    @Test
    @DisplayName("Email trống/null => có lý do không hợp lệ")
    void validateRecipient_blankOrNull() {
        EmailServiceImpl service = newService();
        assertNotNull(service.validateRecipient(null));
        assertNotNull(service.validateRecipient("   "));
    }

    @Test
    @DisplayName("Email sai định dạng => có lý do không hợp lệ")
    void validateRecipient_invalidFormat() {
        EmailServiceImpl service = newService();
        assertNotNull(service.validateRecipient("abc@"));
        assertNotNull(service.validateRecipient("abc@@gmail.com"));
        assertNotNull(service.validateRecipient("no-at-sign.com"));
    }

    @Test
    @DisplayName("Email hợp lệ, không kiểm tra domain => null (luôn cho phép gửi)")
    void validateRecipient_validWithoutDomainCheck() {
        EmailServiceImpl service = newService();
        assertNull(service.validateRecipient("supplier@example.com"));
    }
}