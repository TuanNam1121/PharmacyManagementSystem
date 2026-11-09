package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseRequestStatus {
    SUBMITTED((short) 1, "Chờ duyệt"),
    PROPOSAL_CREATED((short) 2, "Đã lập đề xuất"),
    RFQ_SENT((short) 3, "Đang chào giá RFQ"),
    QUOTATION_SELECTED((short) 4, "Đã chọn báo giá"),
    COMPLETED((short) 5, "Đã duyệt đơn PO"),
    CANCELLED((short) 6, "Đã hủy");

    private final Short code;
    private final String label;

    PurchaseRequestStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseRequestStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseRequestStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveText(Short status) {
        if (status == null) {
            return null;
        }
        return switch (status.intValue()) {
            case 1 -> SUBMITTED.label;
            case 2 -> PROPOSAL_CREATED.label;
            case 3 -> RFQ_SENT.label;
            case 4 -> QUOTATION_SELECTED.label;
            case 5 -> COMPLETED.label;
            case 6 -> CANCELLED.label;
            default -> null;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}
