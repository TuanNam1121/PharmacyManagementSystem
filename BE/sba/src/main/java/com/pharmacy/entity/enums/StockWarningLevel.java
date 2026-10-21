package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StockWarningLevel {
    NORMAL("NORMAL", "Normal"),
    WARNING("WARNING", "Warning"),
    DANGER("DANGER", "Danger");

    private final String value;
    private final String label;

    StockWarningLevel(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public static StockWarningLevel resolve(String expiryStatus, String stockStatus) {
        if (ExpiryStatus.EXPIRED.getValue().equals(expiryStatus)
                || StockStatus.OUT_OF_STOCK.getValue().equals(stockStatus)) {
            return DANGER;
        }
        if (ExpiryStatus.EXPIRING_SOON.getValue().equals(expiryStatus)
                || StockStatus.LOW_STOCK.getValue().equals(stockStatus)) {
            return WARNING;
        }
        return NORMAL;
    }
}
