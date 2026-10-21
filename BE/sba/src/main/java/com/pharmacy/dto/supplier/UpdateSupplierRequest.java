package com.pharmacy.dto.supplier;

import com.pharmacy.entity.Supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder 
public record UpdateSupplierRequest(
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    String name,
    String contactPerson,
    @NotBlank(message = "Số điện thoại không được để trống")
    String phone,
    @Email(message = "Email không đúng định dạng")
    String email,
    String address,
    @Pattern(regexp = "^$|^[0-9]{10}(-[0-9]{3})?$", message = "Mã số thuế phải gồm 10 số hoặc 13 số")
    String taxCode,
    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
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
