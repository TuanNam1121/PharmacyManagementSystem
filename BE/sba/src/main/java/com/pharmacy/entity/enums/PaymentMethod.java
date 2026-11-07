package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH((short) 1, "Tiền mặt"),
    BANK_TRANSFER((short) 2, "Chuyển khoản"),
    VNPAY((short) 3, "VNPay");

    private final Short code;
    private final String label;

    PaymentMethod(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PaymentMethod fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PaymentMethod m : values()) {
            if (m.code.equals(code)) {
                return m;
            }
        }
        return null;
    }
}