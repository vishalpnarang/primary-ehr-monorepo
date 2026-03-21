package com.thinkitive.primus.encounter.entity;

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
@Table(
    name = "smart_phrases",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_smart_phrase_tenant_trigger",
        columnNames = {"tenant_id", "trigger", "created_by_user_id"}
    )
)
public class SmartPhrase extends TenantAwareEntity {

    @Column(name = "trigger", nullable = false, length = 50)
    private String trigger;

    @Column(name = "expansion", nullable = false, columnDefinition = "TEXT")
    private String expansion;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;
}
