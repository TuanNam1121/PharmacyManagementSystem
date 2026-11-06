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
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_proposals")
public class PurchaseProposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 30)
    @NotNull
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    /**
     * The purchase requests aggregated into this proposal (one or more).
     */
    @Builder.Default
    @OneToMany(mappedBy = "purchaseProposal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PurchaseProposalRequest> requests = new ArrayList<>();

    /**
     * Consolidated line items (product + summed quantity) across all aggregated
     * purchase requests. Snapshot used as the source of truth for RFQs.
     */
    @Builder.Default
    @OneToMany(mappedBy = "purchaseProposal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PurchaseProposalDetail> details = new ArrayList<>();

    /**
     * The supplier quotation selected for this proposal. Nullable because the
     * proposal is now created before RFQs/quotations exist; it is set once a
     * winning quotation has been chosen.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_quotation_id")
    private SupplierQuotation supplierQuotation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Account createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Account approvedBy;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Size(max = 500)
    @Nationalized
    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

}