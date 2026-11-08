package com.pharmacy.service;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;

public interface EmailService {

    boolean sendRfqEmail(Rfq rfq, Supplier supplier, String rawToken, String frontendUrl);

    boolean sendQuotationConfirmationEmail(Supplier supplier, String rfqCode);

    boolean sendPasswordResetEmail(String toEmail, String username, String resetToken);
}
