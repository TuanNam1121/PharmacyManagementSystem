package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StockAuditCheckRequest {
    @NotNull(message = "storeId không được để trống")
    private Long storeId;

    private Long inventoryId;

    @Size(max = 1000, message = "Ghi chú kiểm tra không được vượt quá 1000 ký tự")
    private String note;
}
