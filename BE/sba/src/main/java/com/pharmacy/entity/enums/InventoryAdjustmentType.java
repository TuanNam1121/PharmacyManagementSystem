package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum InventoryAdjustmentType {
    COUNT_VARIANCE((short) 1, "Count Variance"),
    DAMAGE_SPOILAGE((short) 2, "Damage / Spoilage"),
    BREAKAGE((short) 3, "Breakage"),
    EXPIRED_WRITEOFF((short) 4, "Expired Write-Off"),
    OTHER((short) 5, "Other Discrepancy");

    private final Short code;
    private final String label;

    InventoryAdjustmentType(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static InventoryAdjustmentType fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (InventoryAdjustmentType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String resolveLabel(Short type) {
        return switch (type != null ? type.intValue() : 0) {
            case 1 -> COUNT_VARIANCE.label;
            case 2 -> DAMAGE_SPOILAGE.label;
            case 3 -> BREAKAGE.label;
            case 4 -> EXPIRED_WRITEOFF.label;
            default -> OTHER.label;
        };
    }
}
