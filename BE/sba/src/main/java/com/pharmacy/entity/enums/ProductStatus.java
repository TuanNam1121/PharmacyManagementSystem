package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum ProductStatus {
    INACTIVE((short) 0, "Inactive"),
    ACTIVE((short) 1, "Active");

    private final Short code;
    private final String label;

    ProductStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static ProductStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (ProductStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        ProductStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
