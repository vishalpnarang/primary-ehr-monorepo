package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.*;
import com.thinkitive.primus.notification.entity.*;
import com.thinkitive.primus.notification.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationDispatchServiceTest {

    @Mock DeviceTokenRepository          deviceTokenRepository;
    @Mock NotificationPreferenceRepository preferenceRepository;
    @Mock NotificationLogRepository      notificationLogRepository;
    @Mock EmailTemplateRepository        emailTemplateRepository;

    @InjectMocks
    NotificationDispatchServiceImpl notificationDispatchService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("registerDevice deactivates existing token and saves new one")
    void registerDevice_deactivatesExistingAndSavesNew() {
        RegisterDeviceRequest request = new RegisterDeviceRequest();
        request.setUserId("user-uuid-001");
        request.setToken("fcm-token-abc123");
        request.setPlatform("IOS");
        request.setDeviceName("iPhone 15 Pro");

        DeviceToken existingToken = DeviceToken.builder()
                .tenantId(1L)
                .userId("user-uuid-001")
                .token("fcm-token-abc123")
                .platform(DeviceToken.Platform.IOS)
                .isActive(true)
                .build();
        existingToken.setId(1L);
        existingToken.setUuid(UUID.randomUUID().toString());

        DeviceToken savedToken = DeviceToken.builder()
                .tenantId(1L)
                .userId("user-uuid-001")
                .token("fcm-token-abc123")
                .platform(DeviceToken.Platform.IOS)
                .deviceName("iPhone 15 Pro")
                .isActive(true)
                .build();
        savedToken.setId(2L);
        savedToken.setUuid(UUID.randomUUID().toString());

        when(deviceTokenRepository.findByTokenAndArchiveFalse("fcm-token-abc123"))
                .thenReturn(Optional.of(existingToken));
        when(deviceTokenRepository.save(any(DeviceToken.class))).thenAnswer(inv -> {
            DeviceToken t = inv.getArgument(0);
            if (t.getId() == null) {
                t.setId(2L);
                t.setUuid(UUID.randomUUID().toString());
            }
            return t;
        });

        DeviceTokenDto result = notificationDispatchService.registerDevice(request);

        assertThat(result).isNotNull();
        assertThat(result.getPlatform()).isEqualTo("IOS");
        assertThat(result.isActive()).isTrue();
        // Save called twice: once to deactivate old, once to save new
        verify(deviceTokenRepository, times(2)).save(any(DeviceToken.class));
    }

    @Test
    @DisplayName("sendPushNotification persists a log entry with SENT status")
    void sendPushNotification_persistsLogWithSentStatus() {
        NotificationLog savedLog = NotificationLog.builder()
                .tenantId(1L)
                .recipientId("user-uuid-001")
                .channel(NotificationLog.Channel.PUSH)
                .eventType("LAB_RESULT")
                .subject("New Lab Results Available")
                .body("Your recent lab results are ready to view.")
                .status(NotificationLog.DeliveryStatus.SENT)
                .build();
        savedLog.setId(1L);
        savedLog.setUuid(UUID.randomUUID().toString());

        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        NotificationLogDto result = notificationDispatchService.sendPushNotification(
                "user-uuid-001", "LAB_RESULT",
                "New Lab Results Available",
                "Your recent lab results are ready to view.");

        assertThat(result).isNotNull();
        assertThat(result.getChannel()).isEqualTo("PUSH");
        assertThat(result.getStatus()).isEqualTo("SENT");
        assertThat(result.getEventType()).isEqualTo("LAB_RESULT");
        verify(notificationLogRepository).save(any(NotificationLog.class));
    }

    @Test
    @DisplayName("updatePreferences creates new preference when none exists for event type")
    void updatePreferences_createsNewPreference() {
        UpdatePreferenceRequest request = new UpdatePreferenceRequest();
        request.setEventType("APPOINTMENT_REMINDER");
        request.setChannelEmail(true);
        request.setChannelSms(true);
        request.setChannelPush(false);
        request.setChannelInApp(true);

        NotificationPreference savedPref = NotificationPreference.builder()
                .tenantId(1L)
                .userId("0")
                .eventType(NotificationPreference.EventType.APPOINTMENT_REMINDER)
                .channelEmail(true)
                .channelSms(true)
                .channelPush(false)
                .channelInApp(true)
                .build();
        savedPref.setId(1L);
        savedPref.setUuid(UUID.randomUUID().toString());

        when(preferenceRepository.findByUserIdAndEventTypeAndTenantIdAndArchiveFalse(
                eq("0"),
                eq(NotificationPreference.EventType.APPOINTMENT_REMINDER),
                eq(1L)))
                .thenReturn(Optional.empty());
        when(preferenceRepository.save(any(NotificationPreference.class))).thenReturn(savedPref);

        NotificationPreferenceDto result = notificationDispatchService.updatePreference(request);

        assertThat(result).isNotNull();
        assertThat(result.getEventType()).isEqualTo("APPOINTMENT_REMINDER");
        assertThat(result.isChannelSms()).isTrue();
        assertThat(result.isChannelPush()).isFalse();
        verify(preferenceRepository).save(any(NotificationPreference.class));
    }
}
