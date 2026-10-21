package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "daily_sales_reconciliations")
public class DailySalesReconciliation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @NotNull
    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "system_cash", nullable = false, precision = 18, scale = 2)
    private BigDecimal systemCash;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "system_bank", nullable = false, precision = 18, scale = 2)
    private BigDecimal systemBank;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "system_vnpay", nullable = false, precision = 18, scale = 2)
    private BigDecimal systemVnpay;

    @ColumnDefault("[system_cash]+[system_bank]+[system_vnpay]")
    @Column(name = "system_total", precision = 20, scale = 2)
    private BigDecimal systemTotal;

    @Column(name = "actual_cash", precision = 18, scale = 2)
    private BigDecimal actualCash;

    @ColumnDefault("[actual_cash]-[system_cash]")
    @Column(name = "difference", precision = 19, scale = 2)
    private BigDecimal difference;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "note", length = 1000)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciled_by")
    private Account reconciledBy;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

}