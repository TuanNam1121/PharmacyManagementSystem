package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum InventoryAuditStatus {
    REQUESTED((short) 0, "Requested / Pending Approval"),
    APPROVED_TO_COUNT((short) 1, "Approved / Counting in Progress"),
    SUBMITTED_FOR_REVIEW((short) 2, "Submitted for Review"),
    CONFIRMED((short) 3, "Confirmed & Approved"),
    REJECTED((short) 4, "Rejected / Recount");

    private final Short code;
    private final String label;

    InventoryAuditStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static InventoryAuditStatus fromCode(Short code) {
        if (code == null)
            return null;
        for (InventoryAuditStatus status : values()) {
            if (status.code.equals(code))
                return status;
        }
        return null;
    }

    public static String resolveLabel(Short status) {
        if (status == null)
            return "Unknown";
        return switch (status.intValue()) {
            case 0 -> REQUESTED.label;
            case 1 -> APPROVED_TO_COUNT.label;
            case 2 -> SUBMITTED_FOR_REVIEW.label;
            case 3 -> CONFIRMED.label;
            case 4 -> REJECTED.label;
            default -> "Unknown";
        };
    }
}
