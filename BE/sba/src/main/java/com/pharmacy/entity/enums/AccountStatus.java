package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum AccountStatus {
    LOCKED((short) 0, "Locked"),
    ACTIVE((short) 1, "Active"),
    INACTIVE((short) 2, "Inactive");

    private final Short code;
    private final String label;

    AccountStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static AccountStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (AccountStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        AccountStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
