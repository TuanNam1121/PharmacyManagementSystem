package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    PENDING((short) 0, "Pending"),
    SUCCESS((short) 1, "Success"),
    FAILED((short) 2, "Failed"),
    REFUNDED((short) 3, "Refunded"),
    EXPIRED((short) 4, "Expired");

    private final Short code;
    private final String label;

    PaymentStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PaymentStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PaymentStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        PaymentStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
