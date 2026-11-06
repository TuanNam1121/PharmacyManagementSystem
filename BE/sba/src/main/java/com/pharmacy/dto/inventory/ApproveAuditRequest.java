package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveAuditRequest {
    @NotNull(message = "Audit ID is required")
    private Long auditId;

    /**
     * 1 = Approve request (Allow counting)
     * 4 = Reject request
     */
    @NotNull(message = "Decision is required (1: Approve, 4: Reject)")
    private Short decision;

    private String note;
}
