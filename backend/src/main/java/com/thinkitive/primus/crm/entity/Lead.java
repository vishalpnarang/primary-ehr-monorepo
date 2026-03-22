package com.thinkitive.primus.crm.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "leads")
public class Lead extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 50)
    private LeadSource source;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LeadStatus status = LeadStatus.NEW;

    @Column(name = "assigned_to", length = 36)
    private String assignedTo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum LeadSource {
        WEBSITE, REFERRAL, WALK_IN, CAMPAIGN, OTHER
    }

    public enum LeadStatus {
        NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
    }
}
