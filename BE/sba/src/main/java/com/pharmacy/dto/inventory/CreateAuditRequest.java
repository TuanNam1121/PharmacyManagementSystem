package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateAuditRequest {
    @NotNull(message = "Branch store ID is required")
    private Long storeId;

    @NotNull(message = "Audit date is required")
    private LocalDate auditDate;

    @Size(max = 500, message = "Reason/notes must not exceed 500 characters")
    private String reason;
}
