package com.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Size(max = 30)
    @NotNull
    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "message", length = 1000)
    private String message;

    @Size(max = 40)
    @Column(name = "ref_type", length = 40)
    private String refType;

    @Column(name = "ref_id")
    private Long refId;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}