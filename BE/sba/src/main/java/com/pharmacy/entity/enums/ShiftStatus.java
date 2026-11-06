package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum ShiftStatus {
    OPEN((short) 1, "Đang mở"),
    CLOSED((short) 2, "Đã đóng"),
    RECONCILED((short) 3, "Đã kết toán");

    private final Short code;
    private final String label;

    ShiftStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static ShiftStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (ShiftStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        ShiftStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
