package com.pharmacy.service;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;

public interface EmailService {

    boolean sendRfqEmail(Rfq rfq, Supplier supplier, String rawToken, String frontendUrl);

    /**
     * Validate a recipient email before sending (presence, format and, when enabled, domain MX).
     *
     * @return null when the address is valid and (optionally) the domain can receive mail;
     *         otherwise a human-readable Vietnamese reason.
     */
    String validateRecipient(String email);

    boolean sendQuotationConfirmationEmail(Supplier supplier, String rfqCode);

    boolean sendPasswordResetEmail(String toEmail, String username, String resetToken);
}
