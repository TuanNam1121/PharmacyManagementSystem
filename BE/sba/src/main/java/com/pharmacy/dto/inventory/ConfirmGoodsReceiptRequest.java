package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ConfirmGoodsReceiptRequest {
    private String note;
    private String receivedByUsername;

    @NotEmpty(message = "Danh sách sản phẩm kiểm nhận không được để trống")
    private List<ItemConfirmDto> items;

    @Data
    public static class ItemConfirmDto {
        private Long detailId;
        private Integer receivedQuantity;
    }
}
