package com.pharmacy.entity.enums;

import com.pharmacy.entity.converter.PersistenceEnum;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter 
@RequiredArgsConstructor 
public enum SupplierStatus implements PersistenceEnum<Integer>{
    ACTIVE(1),
    INACTIVE(2),
    PENDING(3);

    private final Integer value;

    public static SupplierStatus fromValue(int value){
        for (SupplierStatus ss: SupplierStatus.values()){
            if(ss.value == value){
                return ss;
            }
        }
        throw new IllegalArgumentException("Error: Not found SupplierStatus with value: " + value);
    }
}
