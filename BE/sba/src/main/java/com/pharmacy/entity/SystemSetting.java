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
@Table(name = "system_settings")
public class SystemSetting {
    @Id
    @Size(max = 60)
    @Column(name = "setting_key", nullable = false, length = 60)
    private String settingKey;

    @Size(max = 500)
    @NotNull
    @Nationalized
    @Column(name = "setting_value", nullable = false, length = 500)
    private String settingValue;

    @Size(max = 300)
    @Nationalized
    @Column(name = "description", length = 300)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Account updatedBy;

    @NotNull
    @ColumnDefault("sysdatetime()")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}