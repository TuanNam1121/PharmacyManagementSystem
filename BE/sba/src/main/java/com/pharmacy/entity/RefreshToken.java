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

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "IX_refresh_tokens_account_id", columnList = "account_id"),
        @Index(name = "IX_refresh_tokens_token", columnList = "token", unique = true)
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @NotNull
    @Size(max = 500)
    @Column(name = "token", nullable = false, length = 500, unique = true)
    private String token;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_revoked", nullable = false)
    private boolean revoked;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Size(max = 500)
    @Column(name = "replaced_by_token", length = 500)
    private String replacedByToken;
}
