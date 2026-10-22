package com.pharmacy.entity.converter;

import com.pharmacy.entity.enums.CategoryStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CategoryStatusConverter extends BaseEnumConverter<CategoryStatus, Short> {
    public CategoryStatusConverter() {
        super(CategoryStatus.class);
    }
}
