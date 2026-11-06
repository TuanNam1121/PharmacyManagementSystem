package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum GoodsIssueStatus {
    PICKING((short) 0, "Đang soạn hàng"),
    DISPATCHED((short) 1, "Đang vận chuyển"),
    RECEIVED((short) 2, "Đã nhận hàng"),
    RECEIVED_DISCREPANCY((short) 3, "Nhận có chênh lệch"),
    CANCELLED((short) 4, "Đã hủy");

    private final Short code;
    private final String label;

    GoodsIssueStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static GoodsIssueStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (GoodsIssueStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveLabel(Short code) {
        GoodsIssueStatus status = fromCode(code);
        return status != null ? status.getLabel() : "Không xác định";
    }

    public static String resolveText(Short code) {
        return resolveLabel(code);
    }
}
