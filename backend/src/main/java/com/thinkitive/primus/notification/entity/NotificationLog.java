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
@Table(name = "notification_log")
public class NotificationLog extends TenantAwareEntity {

    @Column(name = "recipient_id", nullable = false, length = 36)
    private String recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private Channel channel;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DeliveryStatus status = DeliveryStatus.SENT;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "external_id", length = 255)
    private String externalId;

    public enum Channel {
        EMAIL, SMS, PUSH, IN_APP
    }

    public enum DeliveryStatus {
        PENDING, SENT, DELIVERED, FAILED, BOUNCED
    }
}
