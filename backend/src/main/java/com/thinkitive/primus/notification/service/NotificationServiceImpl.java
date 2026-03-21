package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.NotificationCountDto;
import com.thinkitive.primus.notification.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub. Phase 8: integrate Twilio SMS + SES email + in-app push.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    @Override
    public Page<NotificationDto> listNotifications(Pageable pageable) {
        List<NotificationDto> list = List.of(
                buildMockNotification(UUID.randomUUID(), "LAB_RESULT", "Lab Result Ready", "James Anderson's CBC results are in.", false),
                buildMockNotification(UUID.randomUUID(), "REFILL", "Refill Request", "Lisinopril refill requested by James Anderson.", false),
                buildMockNotification(UUID.randomUUID(), "APPOINTMENT", "Appointment Tomorrow", "Office visit with James Anderson at 10:00 AM.", true)
        );
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional
    public NotificationDto markRead(UUID uuid) {
        NotificationDto n = buildMockNotification(uuid, "SYSTEM", "Notification", "body", false);
        n.setRead(true);
        n.setReadAt(Instant.now());
        return n;
    }

    @Override
    @Transactional
    public void markAllRead() {
        log.info("Marking all notifications as read");
        // Phase 8: UPDATE notifications SET read = true, read_at = NOW() WHERE recipient_id = currentUser AND read = false
    }

    @Override
    public NotificationCountDto getUnreadCount() {
        return NotificationCountDto.builder().unread(2).total(3).build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private NotificationDto buildMockNotification(UUID uuid, String type, String title, String body, boolean read) {
        return NotificationDto.builder()
                .uuid(uuid)
                .recipientId("PRV-00001")
                .type(type)
                .title(title)
                .body(body)
                .read(read)
                .createdAt(Instant.now().minusSeconds(1800))
                .readAt(read ? Instant.now().minusSeconds(900) : null)
                .build();
    }
}
