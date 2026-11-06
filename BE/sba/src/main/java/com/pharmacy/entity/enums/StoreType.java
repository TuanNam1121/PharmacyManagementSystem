package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StoreType {
    HEAD_OFFICE((short) 0, "Trụ sở chính"),
    RETAIL_STORE((short) 1, "Nhà thuốc chi nhánh"),
    CENTRAL_WAREHOUSE((short) 2, "Kho tổng");

    private final Short code;
    private final String label;

    StoreType(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static StoreType fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (StoreType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        StoreType type = fromCode(code);
        return type != null ? type.getLabel() : "Unknown";
    }
}
