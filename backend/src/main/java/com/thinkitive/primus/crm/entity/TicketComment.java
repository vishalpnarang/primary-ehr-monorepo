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
@Table(name = "ticket_comments")
public class TicketComment extends TenantAwareEntity {

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_internal", nullable = false)
    private boolean isInternal = false;
}
