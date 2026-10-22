package com.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(name = "sales_invoices")
public class SalesInvoice {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 30)
    @NotNull
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Size(max = 50)
    @Nationalized
    @Column(name = "prescription_code", length = 50)
    private String prescriptionCode;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "discount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "final_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal finalAmount;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Size(max = 500)
    @Nationalized
    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

}