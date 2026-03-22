package com.thinkitive.primus.crm.entity;

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
@Table(name = "campaigns")
public class Campaign extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private CampaignType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @Column(name = "target_audience", columnDefinition = "JSONB")
    private String targetAudience;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "metrics", columnDefinition = "JSONB")
    private String metrics;

    public enum CampaignType {
        EMAIL, SMS, CALL
    }

    public enum CampaignStatus {
        DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED
    }
}
