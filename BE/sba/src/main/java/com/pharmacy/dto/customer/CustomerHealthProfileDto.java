package com.pharmacy.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerHealthProfileDto {
    private Long id;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String allergies;
    private String chronicDiseases;
    private String currentMedications;
    private Boolean isPregnant;
    private Boolean isBreastfeeding;
    private String notes;
    private LocalDateTime updatedAt;
}
