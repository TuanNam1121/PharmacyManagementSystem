package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseReceiptStatus {
    DRAFT((short) 0, "Pending Inspection"),
    CONFIRMED((short) 1, "Received / In Stock"),
    CANCELLED((short) 2, "Cancelled");

    private final Short code;
    private final String label;

    PurchaseReceiptStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseReceiptStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseReceiptStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short status) {
        return (status != null && status == 1) ? CONFIRMED.label : DRAFT.label;
    }
}
