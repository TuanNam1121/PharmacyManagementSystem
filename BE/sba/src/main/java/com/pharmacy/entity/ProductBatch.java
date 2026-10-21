package com.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "product_batches")
public class ProductBatch {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}