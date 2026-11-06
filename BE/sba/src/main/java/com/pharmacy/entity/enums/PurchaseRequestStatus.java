package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseRequestStatus {
    DRAFT((short) 0, "Bản nháp"),
    SUBMITTED((short) 1, "Đã gửi duyệt"),
    RFQ_SENT((short) 2, "Đang chào giá RFQ"),
    PROPOSAL_CREATED((short) 3, "Đã lập đề xuất"),
    COMPLETED((short) 4, "Hoàn tất"),
    CANCELLED((short) 5, "Đã hủy");

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
        return switch (status != null ? status.intValue() : 0) {
            case 1 -> SUBMITTED.label;
            case 2 -> RFQ_SENT.label;
            case 3 -> PROPOSAL_CREATED.label;
            case 4 -> COMPLETED.label;
            case 5 -> CANCELLED.label;
            default -> DRAFT.label;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}
