package com.pharmacy.entity.converter;


import com.pharmacy.entity.enums.SupplierStatus;

import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SupplierStatusConverter extends BaseEnumConverter<SupplierStatus, Integer> {
    public SupplierStatusConverter() {
        super(SupplierStatus.class);
    }
}
