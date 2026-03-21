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
@Table(name = "message_threads")
public class MessageThread extends TenantAwareEntity {

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ThreadType type;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "last_message_text", length = 500)
    private String lastMessageText;

    public enum ThreadType {
        PATIENT_PROVIDER, TEAM
    }
}
