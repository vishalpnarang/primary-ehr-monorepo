package com.thinkitive.primus.messaging.entity;

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
@Table(name = "messages")
public class Message extends TenantAwareEntity {

    @Column(name = "thread_id", nullable = false)
    private Long threadId;

    @Column(name = "sender_user_id", nullable = false)
    private Long senderUserId;

    @Column(name = "sender_name", nullable = false, length = 200)
    private String senderName;

    @Column(name = "sender_role", nullable = false, length = 50)
    private String senderRole;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "has_attachment", nullable = false)
    private boolean hasAttachment = false;
}
