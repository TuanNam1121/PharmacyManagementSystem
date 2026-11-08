package com.pharmacy.service;

import com.pharmacy.dto.payment.CreatePayOSPaymentRequest;
import com.pharmacy.dto.payment.PayOSPaymentResponse;
import com.pharmacy.dto.payment.PayOSStatusResponse;
import com.pharmacy.dto.payment.PayOSWebhookRequest;

public interface PayOSPaymentService {
    PayOSPaymentResponse createPaymentLink(CreatePayOSPaymentRequest request);
    boolean handleWebhook(PayOSWebhookRequest request);
    PayOSStatusResponse getPaymentStatus(Long orderCode);
}

