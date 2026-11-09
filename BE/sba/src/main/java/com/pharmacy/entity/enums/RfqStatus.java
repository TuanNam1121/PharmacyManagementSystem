package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum RfqStatus {
    SENT((short) 0, "Đã gửi"),
    RESPONDED((short) 1, "Đã phản hồi"),
    SELECTED((short) 2, "Đã chọn"),
    REJECTED((short) 3, "Từ chối"),
    // Derived state: an RFQ past its deadline without a response is reported
    // (never persisted) as EXPIRED.
    EXPIRED((short) 4, "Đã hết hạn");

    private final Short code;
    private final String label;

    RfqStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static RfqStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (RfqStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveText(Short status) {
        return switch (status != null ? status.intValue() : 0) {
            case 1 -> RESPONDED.label;
            case 2 -> SELECTED.label;
            case 3 -> REJECTED.label;
            case 4 -> EXPIRED.label;
            default -> SENT.label;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}