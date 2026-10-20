package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "stores")
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 20)
    @NotNull
    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Size(max = 150)
    @NotNull
    @Nationalized
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @ColumnDefault("1")
    @Column(name = "type", columnDefinition = "tinyint not null")
    private Short type;

    @Size(max = 500)
    @Nationalized
    @Column(name = "address", length = 500)
    private String address;

    @Size(max = 20)
    @Column(name = "phone", length = 20)
    private String phone;

    @ColumnDefault("1")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}