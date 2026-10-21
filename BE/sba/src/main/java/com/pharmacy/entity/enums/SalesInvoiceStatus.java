package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum SalesInvoiceStatus {
    PENDING_PAYMENT((short) 0, "Pending Payment"),
    PAID((short) 1, "Paid"),
    CANCELLED((short) 2, "Cancelled"),
    PARTIALLY_RETURNED((short) 3, "Partially Returned"),
    FULLY_RETURNED((short) 4, "Fully Returned");

    private final Short code;
    private final String label;

    SalesInvoiceStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static SalesInvoiceStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (SalesInvoiceStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        SalesInvoiceStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
