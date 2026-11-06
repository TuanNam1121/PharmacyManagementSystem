package com.pharmacy.entity.enums;

import com.pharmacy.entity.converter.PersistenceEnum;
import lombok.Getter;

@Getter
public enum CategoryStatus implements PersistenceEnum<Short> {
    INACTIVE((short) 0, "Inactive"),
    ACTIVE((short) 1, "Active");

    private final Short code;
    private final String label;

    CategoryStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    @Override
    public Short getValue() {
        return code;
    }

    public static CategoryStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (CategoryStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static CategoryStatus fromValue(Short value) {
        return fromCode(value);
    }

    public static String resolveLabel(Short code) {
        CategoryStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
