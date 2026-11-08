package com.pharmacy.dto.customer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long customerId;

    @JsonProperty("id")
    public Long getId() {
        return customerId;
    }
    private String customerCode;
    private String fullName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private Short genderCode;
    private String address;
    private BigDecimal totalSpent;
    private Short status;
    private Boolean hasAllergies;
    private String allergies;
    private LocalDateTime createdAt;
}

