package com.pharmacy.service.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailServiceImplValidateTest {

    private EmailServiceImpl newService(boolean verifyDomain) {
        EmailServiceImpl service = new EmailServiceImpl(null, null);
        setField(service, "verifyDomain", verifyDomain);
        setField(service, "dnsTimeoutMs", 1000);
        return service;
    }

    private void setField(EmailServiceImpl target, String name, Object value) {
        try {
            Field field = EmailServiceImpl.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Unable to set field " + name, e);
        }
    }

    @Test
    @DisplayName("Email trống/null => có lý do không hợp lệ")
    void validateRecipient_blankOrNull() {
        EmailServiceImpl service = newService(false);
        assertNotNull(service.validateRecipient(null));
        assertNotNull(service.validateRecipient("   "));
    }

    @Test
    @DisplayName("Email sai định dạng => có lý do không hợp lệ")
    void validateRecipient_invalidFormat() {
        EmailServiceImpl service = newService(false);
        assertNotNull(service.validateRecipient("abc@"));
        assertNotNull(service.validateRecipient("abc@@gmail.com"));
        assertNotNull(service.validateRecipient("no-at-sign.com"));
    }

    @Test
    @DisplayName("Email hợp lệ, không bật kiểm tra domain => null")
    void validateRecipient_validWithoutDomainCheck() {
        EmailServiceImpl service = newService(false);
        assertNull(service.validateRecipient("supplier@example.com"));
    }

    @Test
    @DisplayName("Bật kiểm tra domain, tên miền không tồn tại (TLD .invalid) => có lý do")
    void validateRecipient_domainDoesNotExist() {
        EmailServiceImpl service = newService(true);
        assertNotNull(service.validateRecipient("nobody@nonexistent-domain-xyz-12345.invalid"));
    }

    @Test
    @DisplayName("MX = null/localhost/1-nhãn => KHÔNG dùng được")
    void isUsableMxHost_rejectsPlaceholders() {
        EmailServiceImpl service = newService(false);
        assertFalse(service.isUsableMxHost("."));
        assertFalse(service.isUsableMxHost("localhost"));
        assertFalse(service.isUsableMxHost("localhost.localdomain"));
        assertFalse(service.isUsableMxHost("mail"));
        assertFalse(service.isUsableMxHost(""));
        assertFalse(service.isUsableMxHost(null));
    }

    @Test
    @DisplayName("MX hợp lệ (đa nhãn) => dùng được")
    void isUsableMxHost_acceptsRealHosts() {
        EmailServiceImpl service = newService(false);
        assertTrue(service.isUsableMxHost("mx156.hostedmxserver.com"));
        assertTrue(service.isUsableMxHost("gmail-smtp-in.l.google.com"));
    }

    @Test
    @DisplayName("Domain parking MX=localhost (fewf.com) => cảnh báo vì không nhận thư")
    void validateRecipient_parkedDomainWarns() {
        EmailServiceImpl service = newService(true);
        assertNotNull(service.validateRecipient("uqf@fewf.com"));
    }

    @Test
    @DisplayName("Trích host từ bản ghi MX của JNDI")
    void extractMxExchange_parsesRecord() {
        EmailServiceImpl service = newService(false);
        assertEquals("localhost", service.extractMxExchange("0 localhost"));
        assertEquals("mail.example.com", service.extractMxExchange("10 mail.example.com."));
        assertEquals(".", service.extractMxExchange("0 ."));
    }
}