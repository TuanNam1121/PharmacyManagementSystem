package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StockRequisitionStatus {
    DRAFT((short) 0, "Bản nháp"),
    PENDING((short) 1, "Chờ xét duyệt"),
    APPROVED((short) 2, "Đã phê duyệt"),
    REJECTED((short) 3, "Đã từ chối"),
    DISPATCHED((short) 4, "Đã xuất kho / Đang giao"),
    RECEIVED((short) 5, "Đã nhận hàng"),
    CANCELLED((short) 6, "Đã hủy"),
    PARTIALLY_RECEIVED((short) 7, "Nhận một phần");

    private final Short code;
    private final String label;

    StockRequisitionStatus(Short code, String label) {
        this.code = code;
        this.label = label;
    }

    public static StockRequisitionStatus fromCode(Short code) {
        if (code == null) {
            return null;
        }
        for (StockRequisitionStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    /**
     * Resolves status label for Branch Stock Requisition module.
     */
    public static String resolveBranchLabel(Short status) {
        if (status == null) {
            return "Không xác định";
        }
        return switch (status.intValue()) {
            case 0 -> "Bản nháp";
            case 1 -> "Chờ xét duyệt";
            case 2 -> "Đã phê duyệt";
            case 3 -> "Đã từ chối";
            case 4 -> "Đã xuất kho / Đang giao";
            case 5 -> "Đã nhận hàng";
            case 6 -> "Đã hủy";
            case 7 -> "Nhận một phần";
            default -> "Không xác định";
        };
    }

    /**
     * Resolves status text for Central Warehouse Replenishment module.
     */
    public static String resolveWarehouseText(Short status) {
        return resolveBranchLabel(status);
    }

    public static String resolveLabel(Short status) {
        return resolveWarehouseText(status);
    }
}
