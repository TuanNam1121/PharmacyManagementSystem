package com.pharmacy.entity.enums;

import com.pharmacy.entity.converter.PersistenceEnum;
import lombok.Getter;

@Getter
public enum ProductStatus implements PersistenceEnum<Short> {
    INACTIVE((short) 0, "Inactive"),
    ACTIVE((short) 1, "Active"),
    DISCONTINUED((short) 2, "Discontinued");

    private final Short code;
    private final String label;

    ProductStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    @Override
    public Short getValue() {
        return code;
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

    public static ProductStatus fromValue(Short value) {
        return fromCode(value);
    }

    public static String resolveLabel(Short code) {
        ProductStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
