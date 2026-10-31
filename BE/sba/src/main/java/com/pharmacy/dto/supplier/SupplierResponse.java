package com.pharmacy.dto.supplier;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.enums.SupplierStatus;

import lombok.Builder;

@Builder
public record SupplierResponse(
        Long id,
        String code,
        String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        String taxCode,
        String note,
        SupplierStatus status,
        String createdAt) {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public static SupplierResponse fromEntityToDetail(Supplier supplier) {
        if (supplier == null)
            return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .taxCode(supplier.getTaxCode())
                .note(supplier.getNote())
                .status(supplier.getStatus())
                .createdAt(convertLocalDateTime(supplier.getCreatedAt()))
                .build();
    }

    public static SupplierResponse fromEntityToList(Supplier supplier) {
        if (supplier == null)
            return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .taxCode(supplier.getTaxCode())
                .status(supplier.getStatus())
                .createdAt(convertLocalDateTime(supplier.getCreatedAt()))
                .build();
    }

    public static SupplierResponse fromEntityToCreate(Supplier supplier) {
        if (supplier == null)
            return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .build();
    }

    public static SupplierResponse fromEntityToDelete(Supplier supplier) {
        if (supplier == null)
            return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .status(supplier.getStatus())
                .build();
    }

    public static SupplierResponse fromEntityToUpdate(Supplier supplier) {
        if (supplier == null)
            return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .taxCode(supplier.getTaxCode())
                .note(supplier.getNote())
                .status(supplier.getStatus())
                .build();
    }

    private static String convertLocalDateTime(LocalDateTime time) {
        if (time == null) {
            return null;
        }
        return time.format(DATE_FORMATTER);
    }
}
