package com.pharmacy.entity.enums;

import com.pharmacy.entity.converter.PersistenceEnum;

import lombok.Getter;

@Getter 
public enum SupplierStatus implements PersistenceEnum<Integer> {
    ACTIVE(1, "Active"),
    INACTIVE(2, "Inactive"),
    PENDING(3, "Pending");

    private final Integer value;
    private final String label;

    SupplierStatus(Integer value, String label) {
        this.value = value;
        this.label = label;
    }

    public Short getCode() {
        return value != null ? value.shortValue() : null;
    }

    public static SupplierStatus fromValue(int value) {
        for (SupplierStatus ss : SupplierStatus.values()) {
            if (ss.value == value) {
                return ss;
            }
        }
        throw new IllegalArgumentException("Error: Not found SupplierStatus with value: " + value);
    }

    public static SupplierStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (SupplierStatus ss : SupplierStatus.values()) {
            if (ss.value == code.intValue()) {
                return ss;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        if (code == null) {
            return null;
        }
        SupplierStatus s = fromCode(code);
        return s != null ? s.getLabel() : "N/A";
    }

    public static String resolveLabel(Integer value) {
        if (value == null) {
            return null;
        }
        for (SupplierStatus ss : SupplierStatus.values()) {
            if (ss.value.equals(value)) {
                return ss.getLabel();
            }
        }
        return "N/A";
    }
}
