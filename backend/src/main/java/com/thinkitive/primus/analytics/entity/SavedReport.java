package com.thinkitive.primus.analytics.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "saved_reports")
public class SavedReport extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "query_sql", nullable = false, columnDefinition = "TEXT")
    private String querySql;

    @Column(name = "parameters", columnDefinition = "JSONB")
    private String parameters;

    @Column(name = "created_by_user", length = 36)
    private String createdByUser;

    @Column(name = "is_shared", nullable = false)
    private boolean isShared = false;

    @Column(name = "last_run_at")
    private Instant lastRunAt;
}
