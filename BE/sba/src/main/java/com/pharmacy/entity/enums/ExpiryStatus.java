package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum ExpiryStatus {
    SAFE("SAFE", "Safe"),
    GOOD("GOOD", "Good"),
    EXPIRING_SOON("EXPIRING_SOON", "Expiring Soon"),
    EXPIRED("EXPIRED", "Expired");

    private final String value;
    private final String label;

    ExpiryStatus(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public static ExpiryStatus fromDays(Long days) {
        if (days == null) {
            return SAFE;
        }
        if (days < 0) {
            return EXPIRED;
        }
        if (days <= 90) {
            return EXPIRING_SOON;
        }
        return SAFE;
    }

    public static String resolveWarehouseExpiry(long days) {
        if (days < 0) {
            return EXPIRED.value;
        }
        if (days <= 90) {
            return EXPIRING_SOON.value;
        }
        return GOOD.value;
    }
}
