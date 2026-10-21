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
@Table(name = "email_logs")
public class EmailLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 150)
    @NotNull
    @Column(name = "to_email", nullable = false, length = 150)
    private String toEmail;

    @Size(max = 300)
    @NotNull
    @Nationalized
    @Column(name = "subject", nullable = false, length = 300)
    private String subject;

    @Nationalized
    @Lob
    @Column(name = "body")
    private String body;

    @Size(max = 40)
    @Column(name = "ref_type", length = 40)
    private String refType;

    @Column(name = "ref_id")
    private Long refId;

    @ColumnDefault("0")
    @Column(name = "status", columnDefinition = "tinyint not null")
    private Short status;

    @Size(max = 1000)
    @Nationalized
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

}