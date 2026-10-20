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
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "method", columnDefinition = "tinyint not null")
    private Short method;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Size(max = 100)
    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @Nationalized
    @Lob
    @Column(name = "gateway_response")
    private String gatewayResponse;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}