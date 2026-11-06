package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StockStatus {
    IN_STOCK("IN_STOCK", "Còn hàng"),
    LOW_STOCK("LOW_STOCK", "Sắp hết hàng"),
    OUT_OF_STOCK("OUT_OF_STOCK", "Hết hàng");

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
