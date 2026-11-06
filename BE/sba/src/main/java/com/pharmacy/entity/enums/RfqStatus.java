package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum RfqStatus {
    SENT((short) 0, "Sent"),
    RESPONDED((short) 1, "Responded"),
    EXPIRED((short) 2, "Expired"),
    CANCELLED((short) 3, "Cancelled");

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
            case 2 -> EXPIRED.label;
            case 3 -> CANCELLED.label;
            default -> SENT.label;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}