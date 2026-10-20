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
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inventory_audits")
public class InventoryAudit {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 30)
    @NotNull
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Column(name = "audit_date")
    private LocalDate auditDate;

    @Size(max = 500)
    @Nationalized
    @Column(name = "review_note", length = 500)
    private String reviewNote;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

}