package com.pharmacy.dto.inventory;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ConfirmGoodsReceiptRequest {
    private String note;
    private String receivedByUsername;

    @NotEmpty(message = "Received item list must not be empty")
    private List<ItemConfirmDto> items;

    @Data
    public static class ItemConfirmDto {
        private Long detailId;
        private Integer receivedQuantity;
    }
}
