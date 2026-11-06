package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseDeliveryType {
    DIRECT((short) 1, "Giao hàng trực tiếp"),
    FREIGHT((short) 2, "Vận chuyển hàng hóa");

    private final Short code;
    private final String label;

    PurchaseDeliveryType(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseDeliveryType fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseDeliveryType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String resolveLabel(Short type) {
        return (type != null && type == 1) ? DIRECT.label : FREIGHT.label;
    }
}
