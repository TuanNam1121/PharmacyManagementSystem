package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StockStatus {
    IN_STOCK("IN_STOCK", "In Stock"),
    LOW_STOCK("LOW_STOCK", "Low Stock"),
    OUT_OF_STOCK("OUT_OF_STOCK", "Out of Stock");

    private final String value;
    private final String label;

    StockStatus(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public static StockStatus fromQuantity(int quantity, int minQuantity) {
        if (quantity == 0) {
            return OUT_OF_STOCK;
        }
        if (quantity <= minQuantity) {
            return LOW_STOCK;
        }
        return IN_STOCK;
    }
}
