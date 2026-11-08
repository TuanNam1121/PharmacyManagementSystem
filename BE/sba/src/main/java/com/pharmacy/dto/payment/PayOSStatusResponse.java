package com.pharmacy.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayOSStatusResponse {
    private Long orderCode;
    private String status; // PENDING, PAID, CANCELLED
    private boolean completed;
    private Long amount;
    private String reference;
    private String transactionDateTime;
}

