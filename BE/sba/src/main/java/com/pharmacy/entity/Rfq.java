package com.pharmacy.entity;

import com.pharmacy.entity.enums.RfqStatus;
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
@Table(name = "rfqs")
public class Rfq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    /**
     * Legacy link to a single purchase request. Kept nullable for backward
     * compatibility and set to the first request of the proposal when sent.
     * The authoritative source of this RFQ is {@link #purchaseProposal}.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id")
    private PurchaseRequest purchaseRequest;

    /**
     * The purchase proposal this RFQ is built from (aggregated PRs).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_proposal_id")
    private PurchaseProposal purchaseProposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Account createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sent_by")
    private Account sentBy;

    @Column(name = "token_hash", length = 64)
    private String tokenHash;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Nationalized
    @Column(name = "subject", length = 300)
    private String subject;

    @Nationalized
    @Lob
    @Column(name = "content")
    private String content;

    @Enumerated(EnumType.ORDINAL)
    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private RfqStatus status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

    @Nationalized
    @Column(name = "response_note", length = 1000)
    private String responseNote;

    @CreationTimestamp 
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}