package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum InventoryAuditStatus {
    PENDING((short) 0, "Pending Review"),
    APPROVED((short) 1, "Confirmed / Approved"),
    REJECTED((short) 2, "Rejected / Recount");

    private final Short code;
    private final String label;

    InventoryAuditStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static InventoryAuditStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (InventoryAuditStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short status) {
        return switch (status == null ? 0 : status.intValue()) {
            case 0 -> PENDING.label;
            case 1 -> APPROVED.label;
            case 2 -> REJECTED.label;
            default -> "Unknown";
        };
    }
}
