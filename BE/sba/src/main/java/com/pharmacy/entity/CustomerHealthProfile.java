package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "customer_health_profiles")
public class CustomerHealthProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "height_cm", precision = 5, scale = 1)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 1)
    private BigDecimal weightKg;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "allergies", length = 1000)
    private String allergies;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "medical_conditions", length = 1000)
    private String medicalConditions;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "current_medications", length = 1000)
    private String currentMedications;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}