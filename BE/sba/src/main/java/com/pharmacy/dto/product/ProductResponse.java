package com.pharmacy.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String barcode;
    private String name;
    private String unit;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private Short status;
    private String statusLabel;
    private String imageUrl;

    // Thông tin danh mục liên kết
    private Long categoryId;
    private String categoryName;
}
