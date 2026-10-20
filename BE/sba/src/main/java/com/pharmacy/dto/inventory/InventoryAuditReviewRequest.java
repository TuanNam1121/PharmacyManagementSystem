package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InventoryAuditReviewRequest {

    @NotNull(message = "Audit ID không được để trống")
    private Long auditId;

    /**
     * 1 = Approve (Xác nhận), 2 = Reject (Từ chối & yêu cầu kiểm lại)
     */
    @NotNull(message = "Kết quả xét duyệt không được để trống")
    @Min(value = 1, message = "Kết quả không hợp lệ")
    @Max(value = 2, message = "Kết quả không hợp lệ")
    private Short decision;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String reviewNote;
}
