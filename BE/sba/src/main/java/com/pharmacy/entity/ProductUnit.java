package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_units")
public class ProductUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Size(max = 50)
    @NotNull
    @Nationalized
    @Column(name = "unit_name", nullable = false, length = 50)
    private String unitName;

    @NotNull
    @Builder.Default
    @ColumnDefault("1")
    @Column(name = "conversion_factor", nullable = false)
    private Integer conversionFactor = 1;

    @NotNull
    @Column(name = "selling_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice;

    @NotNull
    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "is_base_unit", nullable = false)
    private Boolean isBaseUnit = false;

    @Size(max = 50)
    @Column(name = "barcode", length = 50)
    private String barcode;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.conversionFactor == null || this.conversionFactor <= 0) {
            this.conversionFactor = 1;
        }
        if (this.isBaseUnit == null) {
            this.isBaseUnit = false;
        }
    }
}
