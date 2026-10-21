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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "sales_returns")
public class SalesReturn {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 30)
    @NotNull
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "return_type", columnDefinition = "tinyint not null")
    private Short returnType;

    @Column(name = "refund_method", columnDefinition = "tinyint")
    private Short refundMethod;

    @NotNull
    @Column(name = "refund_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal refundAmount;

    @Size(max = 500)
    @NotNull
    @Nationalized
    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}