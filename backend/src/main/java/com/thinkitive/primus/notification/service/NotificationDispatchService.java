package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationDispatchService {

    /** Register a new device token for push notifications. */
    DeviceTokenDto registerDevice(RegisterDeviceRequest request);

    /** Deactivate and archive a device token by UUID. */
    void removeDevice(String deviceUuid);

    /** Get all notification preferences for the current user. */
    List<NotificationPreferenceDto> getPreferences();

    /** Update or create a notification preference. */
    NotificationPreferenceDto updatePreference(UpdatePreferenceRequest request);

    /** Send a push notification (placeholder — logs only). */
    NotificationLogDto sendPushNotification(String recipientId, String eventType, String title, String body);

    /** Send an email notification (placeholder — logs only). */
    NotificationLogDto sendEmail(String recipientId, String eventType, String subject, String body);

    /** Send an SMS notification (placeholder — logs only). */
    NotificationLogDto sendSms(String recipientId, String eventType, String body);

    /** Dispatch a notification via specified channel. */
    NotificationLogDto logNotification(SendNotificationRequest request);

    /** Get notification history for tenant. */
    Page<NotificationLogDto> getNotificationHistory(Pageable pageable);

    /** Get all email templates for tenant. */
    List<EmailTemplateDto> getEmailTemplates();

    /** Create a new email template. */
    EmailTemplateDto createEmailTemplate(CreateEmailTemplateRequest request);
}
