package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    PENDING((short) 0, "Chờ thanh toán"),
    SUCCESS((short) 1, "Thành công"),
    FAILED((short) 2, "Thất bại"),
    REFUNDED((short) 3, "Đã hoàn tiền"),
    EXPIRED((short) 4, "Hết hạn");

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
