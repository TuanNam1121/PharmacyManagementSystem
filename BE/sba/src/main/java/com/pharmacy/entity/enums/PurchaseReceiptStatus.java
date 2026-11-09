package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseReceiptStatus {
    DRAFT((short) 0, "Chờ kiểm nhận"),
    CONFIRMED((short) 1, "Đã nhập kho"),
    CANCELLED((short) 2, "Đã hủy");

    private final Short code;
    private final String label;

    PurchaseReceiptStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseReceiptStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseReceiptStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short status) {
        if (status == null) {
            return DRAFT.label;
        }
        if (status == 1) {
            return CONFIRMED.label;
        }
        if (status == 2) {
            return "Từ chối / Đã hủy";
        }
        return DRAFT.label;
    }
}
