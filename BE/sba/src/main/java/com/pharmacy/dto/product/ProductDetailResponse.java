package com.pharmacy.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String barcode;
    private String name;
    private String unit;
    private String activeIngredient;
    private String manufacturer;
    private Boolean isPrescription;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer minQuantity;
    private String description;
    private String imageUrl;
    private Short status;
    private String statusLabel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin danh mục liên kết
    private Long categoryId;
    private String categoryName;
}
