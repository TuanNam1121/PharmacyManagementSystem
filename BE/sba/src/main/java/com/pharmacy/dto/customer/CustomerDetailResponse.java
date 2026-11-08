package com.pharmacy.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailResponse {
    private Long customerId;
    private String customerCode;
    private String fullName;
    private String phone;
    private String gender;
    private Short genderCode;
    private LocalDate dateOfBirth;
    private Integer age;
    private String email;
    private String address;
    private BigDecimal totalSpent;
    private Integer totalOrders;
    private Short status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CustomerHealthProfileDto healthProfile;
    private List<CustomerRecentInvoiceDto> recentInvoices;
}
