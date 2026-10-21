package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "\"action\"", columnDefinition = "tinyint not null")
    private Short action;

    @Size(max = 60)
    @NotNull
    @Column(name = "entity_name", nullable = false, length = 60)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Nationalized
    @Lob
    @Column(name = "old_value")
    private String oldValue;

    @Nationalized
    @Lob
    @Column(name = "new_value")
    private String newValue;

    @Size(max = 45)
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}