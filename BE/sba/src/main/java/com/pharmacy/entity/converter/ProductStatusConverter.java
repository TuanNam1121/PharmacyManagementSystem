package com.pharmacy.entity.converter;

import com.pharmacy.entity.enums.ProductStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ProductStatusConverter extends BaseEnumConverter<ProductStatus, Short> {
    public ProductStatusConverter() {
        super(ProductStatus.class);
    }
}
