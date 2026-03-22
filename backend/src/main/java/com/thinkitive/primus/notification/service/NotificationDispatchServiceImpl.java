package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.*;
import com.thinkitive.primus.notification.entity.*;
import com.thinkitive.primus.notification.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Placeholder implementation for FCM (push), SES (email), and SNS (SMS).
 * All dispatch methods log the outbound attempt and persist a NotificationLog
 * with status SENT. Real integrations are wired in Phase 8 hardening.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationDispatchServiceImpl implements NotificationDispatchService {

    private final DeviceTokenRepository          deviceTokenRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationLogRepository      notificationLogRepository;
    private final EmailTemplateRepository        emailTemplateRepository;

    // ── Device Tokens ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public DeviceTokenDto registerDevice(RegisterDeviceRequest request) {
        Long tenantId = TenantContext.getTenantId();

        // Deactivate any existing token with the same value
        deviceTokenRepository.findByTokenAndArchiveFalse(request.getToken())
                .ifPresent(existing -> {
                    existing.setActive(false);
                    deviceTokenRepository.save(existing);
                });

        DeviceToken.Platform platform = parsePlatform(request.getPlatform());

        DeviceToken token = DeviceToken.builder()
                .tenantId(tenantId)
                .userId(request.getUserId())
                .token(request.getToken())
                .platform(platform)
                .deviceName(request.getDeviceName())
                .isActive(true)
                .build();

        DeviceToken saved = deviceTokenRepository.save(token);
        log.info("Device registered userId={} platform={}", request.getUserId(), platform);
        return toDeviceTokenDto(saved);
    }

    @Override
    @Transactional
    public void removeDevice(String deviceUuid) {
        Long tenantId = TenantContext.getTenantId();
        DeviceToken token = deviceTokenRepository.findByTenantIdAndUuid(tenantId, deviceUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Device token not found: " + deviceUuid));
        token.setActive(false);
        token.setArchive(true);
        deviceTokenRepository.save(token);
        log.info("Device removed uuid={}", deviceUuid);
    }

    // ── Preferences ───────────────────────────────────────────────────────────

    @Override
    public List<NotificationPreferenceDto> getPreferences() {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        return preferenceRepository.findByUserIdAndTenantIdAndArchiveFalse(userId, tenantId)
                .stream()
                .map(this::toPreferenceDto)
                .toList();
    }

    @Override
    @Transactional
    public NotificationPreferenceDto updatePreference(UpdatePreferenceRequest request) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        NotificationPreference.EventType eventType = parseEventType(request.getEventType());

        NotificationPreference pref = preferenceRepository
                .findByUserIdAndEventTypeAndTenantIdAndArchiveFalse(userId, eventType, tenantId)
                .orElseGet(() -> NotificationPreference.builder()
                        .tenantId(tenantId)
                        .userId(userId)
                        .eventType(eventType)
                        .build());

        if (request.getChannelEmail()  != null) pref.setChannelEmail(request.getChannelEmail());
        if (request.getChannelSms()    != null) pref.setChannelSms(request.getChannelSms());
        if (request.getChannelPush()   != null) pref.setChannelPush(request.getChannelPush());
        if (request.getChannelInApp()  != null) pref.setChannelInApp(request.getChannelInApp());

        NotificationPreference saved = preferenceRepository.save(pref);
        log.info("Preference updated userId={} eventType={}", userId, eventType);
        return toPreferenceDto(saved);
    }

    // ── Dispatch ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public NotificationLogDto sendPushNotification(String recipientId, String eventType, String title, String body) {
        log.info("[FCM-PLACEHOLDER] Push to recipientId={} eventType={} title={}", recipientId, eventType, title);
        return persistLog(recipientId, NotificationLog.Channel.PUSH, eventType, title, body, null);
    }

    @Override
    @Transactional
    public NotificationLogDto sendEmail(String recipientId, String eventType, String subject, String body) {
        log.info("[SES-PLACEHOLDER] Email to recipientId={} eventType={} subject={}", recipientId, eventType, subject);
        return persistLog(recipientId, NotificationLog.Channel.EMAIL, eventType, subject, body, null);
    }

    @Override
    @Transactional
    public NotificationLogDto sendSms(String recipientId, String eventType, String body) {
        log.info("[SNS-PLACEHOLDER] SMS to recipientId={} eventType={}", recipientId, eventType);
        return persistLog(recipientId, NotificationLog.Channel.SMS, eventType, null, body, null);
    }

    @Override
    @Transactional
    public NotificationLogDto logNotification(SendNotificationRequest request) {
        NotificationLog.Channel channel = parseChannel(request.getChannel());
        log.info("[DISPATCH] channel={} recipientId={} eventType={}",
                channel, request.getRecipientId(), request.getEventType());
        return persistLog(
                request.getRecipientId(),
                channel,
                request.getEventType(),
                request.getSubject(),
                request.getBody(),
                null
        );
    }

    @Override
    public Page<NotificationLogDto> getNotificationHistory(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        return notificationLogRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toLogDto);
    }

    // ── Email Templates ───────────────────────────────────────────────────────

    @Override
    public List<EmailTemplateDto> getEmailTemplates() {
        Long tenantId = TenantContext.getTenantId();
        return emailTemplateRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream()
                .map(this::toEmailTemplateDto)
                .toList();
    }

    @Override
    @Transactional
    public EmailTemplateDto createEmailTemplate(CreateEmailTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();

        emailTemplateRepository.findByTenantIdAndNameAndArchiveFalse(tenantId, request.getName())
                .ifPresent(existing -> {
                    throw new PrimusException(ResponseCode.CONFLICT,
                            "Email template already exists: " + request.getName());
                });

        EmailTemplate template = EmailTemplate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .subjectTemplate(request.getSubjectTemplate())
                .bodyTemplate(request.getBodyTemplate())
                .category(request.getCategory())
                .build();

        EmailTemplate saved = emailTemplateRepository.save(template);
        log.info("Email template created name={} tenantId={}", request.getName(), tenantId);
        return toEmailTemplateDto(saved);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private NotificationLogDto persistLog(
            String recipientId,
            NotificationLog.Channel channel,
            String eventType,
            String subject,
            String body,
            String externalId) {

        Long tenantId = TenantContext.getTenantId();

        NotificationLog entry = NotificationLog.builder()
                .tenantId(tenantId)
                .recipientId(recipientId)
                .channel(channel)
                .eventType(eventType)
                .subject(subject)
                .body(body)
                .status(NotificationLog.DeliveryStatus.SENT)
                .externalId(externalId)
                .build();

        NotificationLog saved = notificationLogRepository.save(entry);
        return toLogDto(saved);
    }

    private DeviceTokenDto toDeviceTokenDto(DeviceToken t) {
        return DeviceTokenDto.builder()
                .uuid(t.getUuid())
                .userId(t.getUserId())
                .platform(t.getPlatform() != null ? t.getPlatform().name() : null)
                .deviceName(t.getDeviceName())
                .active(t.isActive())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private NotificationPreferenceDto toPreferenceDto(NotificationPreference p) {
        return NotificationPreferenceDto.builder()
                .uuid(p.getUuid())
                .userId(p.getUserId())
                .eventType(p.getEventType() != null ? p.getEventType().name() : null)
                .channelEmail(p.isChannelEmail())
                .channelSms(p.isChannelSms())
                .channelPush(p.isChannelPush())
                .channelInApp(p.isChannelInApp())
                .build();
    }

    private NotificationLogDto toLogDto(NotificationLog l) {
        return NotificationLogDto.builder()
                .uuid(l.getUuid())
                .recipientId(l.getRecipientId())
                .channel(l.getChannel() != null ? l.getChannel().name() : null)
                .eventType(l.getEventType())
                .subject(l.getSubject())
                .body(l.getBody())
                .status(l.getStatus() != null ? l.getStatus().name() : null)
                .errorMessage(l.getErrorMessage())
                .externalId(l.getExternalId())
                .createdAt(l.getCreatedAt())
                .build();
    }

    private EmailTemplateDto toEmailTemplateDto(EmailTemplate t) {
        return EmailTemplateDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .subjectTemplate(t.getSubjectTemplate())
                .bodyTemplate(t.getBodyTemplate())
                .category(t.getCategory())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private DeviceToken.Platform parsePlatform(String raw) {
        if (raw == null) return DeviceToken.Platform.WEB;
        try {
            return DeviceToken.Platform.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown platform '{}', defaulting to WEB", raw);
            return DeviceToken.Platform.WEB;
        }
    }

    private NotificationLog.Channel parseChannel(String raw) {
        if (raw == null) return NotificationLog.Channel.IN_APP;
        try {
            return NotificationLog.Channel.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown channel '{}', defaulting to IN_APP", raw);
            return NotificationLog.Channel.IN_APP;
        }
    }

    private NotificationPreference.EventType parseEventType(String raw) {
        try {
            return NotificationPreference.EventType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Unknown event type: " + raw);
        }
    }

    private String currentUserIdStr() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaims().get("user_id");
            if (userIdClaim != null) return userIdClaim.toString();
            String sub = jwt.getSubject();
            if (sub != null) return sub;
        }
        return "0";
    }
}
