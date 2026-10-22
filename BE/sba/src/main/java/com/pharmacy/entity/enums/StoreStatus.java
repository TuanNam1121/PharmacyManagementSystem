package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StoreStatus {
    INACTIVE((short) 0, "Inactive"),
    ACTIVE((short) 1, "Active");

    private final Short code;
    private final String label;

    StoreStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static StoreStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (StoreStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        StoreStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
