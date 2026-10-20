package com.pharmacy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Builder 
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Nationalized
    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @Nationalized
    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Nationalized
    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "tax_code", length = 20)
    private String taxCode;

    @ColumnDefault("1")
    @Column(name = "status", columnDefinition = "tinyint not null")
    @Builder.Default
    private Short status = 1;

    @Nationalized
    @Column(name = "note", length = 1000)
    private String note;

    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp 
    private LocalDateTime createdAt;

}