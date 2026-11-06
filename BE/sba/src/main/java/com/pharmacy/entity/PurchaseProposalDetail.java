package com.pharmacy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A consolidated line item of a PurchaseProposal. Items are computed by summing
 * the requested quantities of the same product across all aggregated Purchase
 * Requests, so the proposal carries a stable snapshot used as the source of
 * truth for RFQs and supplier quotations.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_proposal_details")
public class PurchaseProposalDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_proposal_id", nullable = false)
    private PurchaseProposal purchaseProposal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}