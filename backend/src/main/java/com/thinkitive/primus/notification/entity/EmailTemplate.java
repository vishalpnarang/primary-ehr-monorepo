package com.thinkitive.primus.notification.entity;

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
    name = "email_templates",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_email_templates_tenant_name",
        columnNames = {"tenant_id", "name"}
    )
)
public class EmailTemplate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "subject_template", nullable = false, length = 500)
    private String subjectTemplate;

    @Column(name = "body_template", nullable = false, columnDefinition = "TEXT")
    private String bodyTemplate;

    @Column(name = "category", length = 50)
    private String category;
}
