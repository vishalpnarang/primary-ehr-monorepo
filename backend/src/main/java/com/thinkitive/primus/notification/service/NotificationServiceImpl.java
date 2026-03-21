package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.NotificationCountDto;
import com.thinkitive.primus.notification.dto.NotificationDto;
import com.thinkitive.primus.notification.entity.Notification;
import com.thinkitive.primus.notification.repository.NotificationRepository;
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

import java.time.Instant;
import java.util.UUID;

/**
 * Phase-8 implementation. Phase 8+: integrate Twilio SMS + SES email + in-app push.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Page<NotificationDto> listNotifications(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        Long userId   = currentUserId();

        return notificationRepository
                .findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional
    public NotificationDto markRead(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        Long userId   = currentUserId();

        Notification notification = notificationRepository
                .findByTenantIdAndUserIdAndUuid(tenantId, userId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Notification not found: " + uuid));

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }

        return toDto(notification);
    }

    @Override
    @Transactional
    public void markAllRead() {
        Long tenantId = TenantContext.getTenantId();
        Long userId   = currentUserId();

        notificationRepository
                .findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(tenantId, userId, Pageable.unpaged())
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });

        log.info("Marked all notifications as read for userId={} tenantId={}", userId, tenantId);
    }

    @Override
    public NotificationCountDto getUnreadCount() {
        Long tenantId = TenantContext.getTenantId();
        Long userId   = currentUserId();

        long unread = notificationRepository.countByTenantIdAndUserIdAndReadFalse(tenantId, userId);
        long total  = notificationRepository.countByTenantIdAndUserId(tenantId, userId);

        return NotificationCountDto.builder()
                .unread((int) unread)
                .total((int) total)
                .build();
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .uuid(n.getUuid())
                .recipientId(String.valueOf(n.getUserId()))
                .type(n.getType() != null ? n.getType().name() : null)
                .title(n.getTitle())
                .body(n.getBody())
                .actionUrl(n.getActionUrl())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                // Treat modifiedAt as readAt when the notification was last modified in a read state
                .readAt(n.isRead() ? n.getModifiedAt() : null)
                .build();
    }

    // ── Security helper ───────────────────────────────────────────────────────

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaims().get("user_id");
            if (userIdClaim instanceof Number num) return num.longValue();
            if (userIdClaim instanceof String s) {
                try { return Long.parseLong(s); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
            }
            try { return Long.parseLong(jwt.getSubject()); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
        }
        return 0L;
    }
}
