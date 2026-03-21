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
@Table(name = "notifications")
public class Notification extends TenantAwareEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "body", nullable = false, length = 1000)
    private String body;

    @Column(name = "read", nullable = false)
    private boolean read = false;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    public enum NotificationType {
        INFO, WARNING, CRITICAL, SUCCESS
    }
}
