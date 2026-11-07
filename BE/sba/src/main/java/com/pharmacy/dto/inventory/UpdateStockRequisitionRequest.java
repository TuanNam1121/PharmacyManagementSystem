package com.pharmacy.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Payload cập nhật phiếu yêu cầu lĩnh thuốc.
 * Chỉ cho phép sửa danh sách mặt hàng; không đổi chi nhánh / người lập phiếu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStockRequisitionRequest {

    @NotEmpty(message = "At least one product item is required")
    @Valid
    private List<CreateStockRequisitionRequest.ItemRequest> items;
}
