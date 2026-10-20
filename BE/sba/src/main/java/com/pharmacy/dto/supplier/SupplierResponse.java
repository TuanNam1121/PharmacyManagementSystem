package com.pharmacy.dto.supplier;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pharmacy.entity.Supplier;

import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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
        String status,
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
                .status(convertStatus(supplier.getStatus()))
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
                .status(convertStatus(supplier.getStatus()))
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
                .status(convertStatus(supplier.getStatus()))
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
                .status(convertStatus(supplier.getStatus()))
                .build();
    }

    private static String convertStatus(Short status) {
        if (status == null)
            return null;
        switch (status) {
            case 0:
                return "Không hoạt động";
            case 1:
                return "Hoạt động";
            default:
                return "N/A";
        }
    }

    private static String convertLocalDateTime(LocalDateTime time) {
        if (time == null) {
            return null;
        }
        return time.format(DATE_FORMATTER);
    }
}
