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
@Table(name = "encounter_comments")
public class EncounterComment extends TenantAwareEntity {

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    /** UUID of the user who posted the comment (Keycloak sub). */
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;
}
