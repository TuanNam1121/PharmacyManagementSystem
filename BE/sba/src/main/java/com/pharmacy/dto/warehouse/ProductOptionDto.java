package com.pharmacy.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductOptionDto {
    private Long id;
    private String name;
    private String barcode;
    private String unit;
    private BigDecimal purchasePrice;
}
