package com.pharmacy.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayOSPaymentResponse {
    private Long orderCode;
    private Long amount;
    private String description;
    private String accountName;
    private String accountNumber;
    private String bin;
    private String qrCode;
    private String checkoutUrl;
    private String status;
}
