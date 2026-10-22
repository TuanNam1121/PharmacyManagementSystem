package com.pharmacy.entity.enums;

import lombok.Getter;

@Getter
public enum StockRequisitionStatus {
    DRAFT((short) 0, "Draft"),
    PENDING((short) 1, "Pending Review"),
    APPROVED((short) 2, "Approved"),
    REJECTED((short) 3, "Rejected"),
    DISPATCHED((short) 4, "Dispatched"),
    RECEIVED((short) 5, "Received"),
    CANCELLED((short) 6, "Cancelled"),
    PARTIALLY_RECEIVED((short) 7, "Partially Received");

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
            return "Unknown";
        }
        return switch (status.intValue()) {
            case 0 -> "Pending Review";
            case 1 -> "Approved";
            case 2 -> "Dispatched";
            case 3 -> "Received";
            case 4 -> "Rejected";
            default -> "Unknown";
        };
    }

    /**
     * Resolves status text for Central Warehouse Replenishment module.
     */
    public static String resolveWarehouseText(Short status) {
        if (status == null) {
            return "Draft";
        }
        return switch (status.intValue()) {
            case 1 -> "Pending Review";
            case 2 -> "Approved";
            case 3 -> "Rejected";
            case 4 -> "Dispatched";
            case 5 -> "Received";
            case 6 -> "Cancelled";
            default -> "Draft";
        };
    }

    public static String resolveLabel(Short status) {
        return resolveWarehouseText(status);
    }
}
