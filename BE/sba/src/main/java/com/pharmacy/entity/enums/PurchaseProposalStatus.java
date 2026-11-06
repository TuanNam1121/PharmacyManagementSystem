package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseProposalStatus {
    PENDING((short) 0, "Pending"),
    APPROVED((short) 1, "Approved"),
    REJECTED((short) 2, "Rejected"),
    COMPLETED((short) 3, "Completed");

    private final Short code;
    private final String label;

    PurchaseProposalStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseProposalStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseProposalStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveText(Short status) {
        return switch (status != null ? status.intValue() : 0) {
            case 1 -> APPROVED.label;
            case 2 -> REJECTED.label;
            case 3 -> COMPLETED.label;
            default -> PENDING.label;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}
