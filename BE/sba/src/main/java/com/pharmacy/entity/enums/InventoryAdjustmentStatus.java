package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum InventoryAdjustmentStatus {
    PENDING((short) 0, "Pending Review"),
    APPROVED((short) 1, "Approved"),
    REJECTED((short) 2, "Rejected");

    private final Short code;
    private final String label;

    InventoryAdjustmentStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static InventoryAdjustmentStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (InventoryAdjustmentStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short status) {
        return switch (status != null ? status.intValue() : 0) {
            case 1 -> APPROVED.label;
            case 2 -> REJECTED.label;
            default -> PENDING.label;
        };
    }
}
