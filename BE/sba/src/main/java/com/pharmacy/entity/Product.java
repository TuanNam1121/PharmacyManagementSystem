package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 50)
    @Column(name = "barcode", length = 50)
    private String barcode;

    @Size(max = 250)
    @NotNull
    @Nationalized
    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @Size(max = 30)
    @NotNull
    @Nationalized
    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Size(max = 250)
    @Nationalized
    @Column(name = "active_ingredient", length = 250)
    private String activeIngredient;

    @Size(max = 200)
    @Nationalized
    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_prescription", nullable = false)
    private Boolean isPrescription = false;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "cost_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal costPrice;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "selling_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice;

    @NotNull
    @ColumnDefault("20")
    @Column(name = "min_quantity", nullable = false)
    private Integer minQuantity;

    @Nationalized
    @Lob
    @Column(name = "description")
    private String description;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ColumnDefault("1")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}