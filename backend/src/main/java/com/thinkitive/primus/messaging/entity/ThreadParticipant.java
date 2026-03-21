package com.thinkitive.primus.messaging.entity;

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
    name = "thread_participants",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_thread_participant",
        columnNames = {"thread_id", "user_id"}
    )
)
public class ThreadParticipant extends TenantAwareEntity {

    @Column(name = "thread_id", nullable = false)
    private Long threadId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "unread_count", nullable = false)
    private Integer unreadCount = 0;
}
