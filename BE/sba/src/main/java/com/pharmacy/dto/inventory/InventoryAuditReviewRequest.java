package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InventoryAuditReviewRequest {

    @NotNull(message = "Audit ID is required")
    private Long auditId;

    /**
     * 1 = Approve, 2 = Reject & request recount
     */
    @NotNull(message = "Review decision is required")
    @Min(value = 1, message = "Invalid decision value")
    @Max(value = 2, message = "Invalid decision value")
    private Short decision;

    @Size(max = 500, message = "Review note cannot exceed 500 characters")
    private String reviewNote;
}
