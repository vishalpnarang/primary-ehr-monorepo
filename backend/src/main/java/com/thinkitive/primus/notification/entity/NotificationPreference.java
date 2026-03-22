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
    name = "notification_preferences",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_notification_prefs_user_event_tenant",
        columnNames = {"user_id", "event_type", "tenant_id"}
    )
)
public class NotificationPreference extends TenantAwareEntity {

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private EventType eventType;

    @Column(name = "channel_email", nullable = false)
    private boolean channelEmail = true;

    @Column(name = "channel_sms", nullable = false)
    private boolean channelSms = false;

    @Column(name = "channel_push", nullable = false)
    private boolean channelPush = true;

    @Column(name = "channel_in_app", nullable = false)
    private boolean channelInApp = true;

    public enum EventType {
        APPOINTMENT_REMINDER, LAB_RESULT, MESSAGE, TASK, BILLING
    }
}
