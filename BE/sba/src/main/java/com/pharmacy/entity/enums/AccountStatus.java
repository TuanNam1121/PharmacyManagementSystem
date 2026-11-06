package com.pharmacy.entity.enums;

import com.pharmacy.entity.converter.PersistenceEnum;
import lombok.Getter;

@Getter
public enum AccountStatus implements PersistenceEnum<Short> {
    DISABLED((short) 0, "Disabled"),
    ACTIVE((short) 1, "Active"),
    LOCKED((short) 2, "Locked");

    private final Short code;
    private final String label;

    AccountStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    @Override
    public Short getValue() {
        return code;
    }

    public static AccountStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (AccountStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static AccountStatus fromValue(Short value) {
        return fromCode(value);
    }

    public static String resolveLabel(Short code) {
        AccountStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Unknown";
    }
}
