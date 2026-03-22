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
@Table(name = "device_tokens")
public class DeviceToken extends TenantAwareEntity {

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 20)
    private Platform platform;

    @Column(name = "device_name", length = 255)
    private String deviceName;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public enum Platform {
        WEB, IOS, ANDROID
    }
}
