package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum PurchaseProposalStatus {
    DRAFT((short) 0, "Đã lập đề xuất"),
    RFQ_SENT((short) 1, "Đang chào giá RFQ"),
    // From the proposal screen this reads "Đã chọn báo giá"; the PO module keeps
    // its own wording ("Chờ phê duyệt") for this same code.
    QUOTATION_SELECTED((short) 2, "Đã chọn báo giá"),
    APPROVED((short) 3, "Đã duyệt đơn PO"),
    REJECTED((short) 4, "Đã từ chối");

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
            case 1 -> RFQ_SENT.label;
            case 2 -> QUOTATION_SELECTED.label;
            case 3 -> APPROVED.label;
            case 4 -> REJECTED.label;
            default -> "Trạng thái " + status;
        };
    }

    public static String resolveLabel(Short status) {
        return resolveText(status);
    }

    /**
     * True while the proposal is still in its sourcing phase (no supplier
     * decision taken yet) — i.e. a winning supplier quotation may still be chosen.
     */
    public static boolean isAwaitingSupplierSelection(Short code) {
        return DRAFT.getCode().equals(code) || RFQ_SENT.getCode().equals(code);
    }
}
