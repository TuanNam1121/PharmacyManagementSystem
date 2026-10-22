package com.pharmacy.dto.supplier;

import com.pharmacy.entity.Supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder 
public record UpdateSupplierRequest(
    @NotBlank(message = "Supplier name is required")
    String name,
    String contactPerson,
    @NotBlank(message = "Phone number is required")
    String phone,
    @Email(message = "Invalid email format")
    String email,
    String address,
    @Pattern(regexp = "^$|^[0-9]{10}(-[0-9]{3})?$", message = "Tax code must be 10 or 13 digits")
    String taxCode,
    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    String note
) {
    public Supplier toEntity(){
        return Supplier.builder()
        .name(this.name)
        .contactPerson(this.contactPerson)
        .phone(this.phone)
        .email(this.email)
        .address(this.address)
        .taxCode(this.taxCode)
        .note(this.note)
        .build();
    }
}
