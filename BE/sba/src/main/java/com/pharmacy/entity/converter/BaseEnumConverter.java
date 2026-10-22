package com.pharmacy.entity.converter;

import java.util.Arrays;

import jakarta.persistence.AttributeConverter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class BaseEnumConverter<E extends Enum<E> & PersistenceEnum<T>, T> implements AttributeConverter<E, T> {
    private final Class<E> enumClass;

    @Override
    public T convertToDatabaseColumn(E attribute) {
        return attribute != null ? attribute.getValue() : null;
    }

    @Override
    public E convertToEntityAttribute(T dbData) {
        if (dbData == null)
            return null;
        return Arrays.stream(enumClass.getEnumConstants())
                .filter(e -> e.getValue().equals(dbData))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown value: " + dbData));
    }

}
