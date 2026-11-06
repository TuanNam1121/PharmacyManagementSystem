package com.pharmacy.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitAuditCountRequest {
    @NotNull(message = "Audit ID is required")
    private Long auditId;

    @NotEmpty(message = "Item counts cannot be empty")
    @Valid
    private List<ItemCount> items;

    @Data
    public static class ItemCount {
        @NotNull(message = "Detail ID is required")
        private Long detailId;

        @NotNull(message = "Counted quantity is required")
        private Integer countedQuantity;

        private String note;
    }
}
