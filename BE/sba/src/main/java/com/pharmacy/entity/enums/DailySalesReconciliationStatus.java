package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum DailySalesReconciliationStatus {
    OPEN((short) 0, "Open"),
    RECONCILED((short) 1, "Reconciled"),
    DISCREPANCY_NOTED((short) 2, "Discrepancy Noted");

    private final Short code;
    private final String label;

    DailySalesReconciliationStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static DailySalesReconciliationStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (DailySalesReconciliationStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        DailySalesReconciliationStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Open";
    }
}
