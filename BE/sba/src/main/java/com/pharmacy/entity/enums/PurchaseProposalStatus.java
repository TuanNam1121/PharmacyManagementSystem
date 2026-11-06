package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseProposalStatus {
    DRAFT((short) 0, "Đã lập đề xuất"),
    PENDING_APPROVAL((short) 1, "Chờ phê duyệt"),
    APPROVED((short) 2, "Đã phê duyệt"),
    REJECTED((short) 3, "Đã từ chối"),
    PARTIALLY_RECEIVED((short) 4, "Nhập một phần"),
    COMPLETED((short) 5, "Hoàn tất"),
    CANCELLED((short) 6, "Đã hủy");

    public static final PurchaseProposalStatus PENDING = DRAFT;

    private final Short code;
    private final String label;

    PurchaseProposalStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static PurchaseProposalStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (PurchaseProposalStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String resolveText(Short status) {
        if (status == null) {
            return DRAFT.label;
        }
        return switch (status.intValue()) {
            case 0 -> DRAFT.label;
            case 1 -> PENDING_APPROVAL.label;
            case 2 -> APPROVED.label;
            case 3 -> REJECTED.label;
            case 4 -> PARTIALLY_RECEIVED.label;
            case 5 -> COMPLETED.label;
            case 6 -> CANCELLED.label;
            default -> "Trạng thái " + status;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }
}
