package com.pharmacy.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayOSWebhookRequest {
    private String code;
    private String desc;
    private Map<String, Object> data;
    private String signature;
}

