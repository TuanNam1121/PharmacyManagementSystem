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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "warehouse_locations")
public class WarehouseLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Size(max = 30)
    @NotNull
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Size(max = 10)
    @Column(name = "aisle", length = 10)
    private String aisle;

    @Size(max = 10)
    @Column(name = "shelf", length = 10)
    private String shelf;

    @Size(max = 10)
    @Column(name = "bin", length = 10)
    private String bin;

    @ColumnDefault("1")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

}