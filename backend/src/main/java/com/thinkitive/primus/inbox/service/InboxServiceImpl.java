package com.thinkitive.primus.inbox.service;

import com.thinkitive.primus.encounter.entity.Encounter;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.inbox.dto.InboxActionRequest;
import com.thinkitive.primus.inbox.dto.InboxCountDto;
import com.thinkitive.primus.inbox.dto.InboxItemDto;
import com.thinkitive.primus.messaging.entity.MessageThread;
import com.thinkitive.primus.messaging.entity.ThreadParticipant;
import com.thinkitive.primus.messaging.repository.MessageThreadRepository;
import com.thinkitive.primus.messaging.repository.ThreadParticipantRepository;
import com.thinkitive.primus.notification.entity.Notification;
import com.thinkitive.primus.notification.repository.NotificationRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Aggregates inbox items from multiple sources:
 *  - Unread notifications (LAB_RESULT, WARNING, CRITICAL → maps to lab/PA types)
 *  - Unread message threads where current user is a participant
 *  - Unsigned (DRAFT/IN_PROGRESS) encounters assigned to current user
 *
 * Phase 4+: add refill requests from prescription table, prior auth queue.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InboxServiceImpl implements InboxService {

    private static final String STATUS_PENDING  = "PENDING";
    private static final String STATUS_ACTIONED = "ACTIONED";
    private static final String STATUS_ARCHIVED = "ARCHIVED";
    private static final String UNKNOWN_PATIENT = "Unknown";

    private final NotificationRepository      notificationRepository;
    private final MessageThreadRepository     threadRepository;
    private final ThreadParticipantRepository participantRepository;
    private final EncounterRepository         encounterRepository;
    private final PatientRepository           patientRepository;

    @Override
    public Page<InboxItemDto> listInbox(Pageable pageable) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        List<InboxItemDto> items = new ArrayList<>();

        // 1. Unread notifications → lab results, PA items, general tasks
        notificationRepository
                .findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(tenantId, currentUserId, Pageable.unpaged())
                .forEach(n -> items.add(notificationToInboxItem(n)));

        // 2. Message threads with unread messages for current user
        participantRepository.findByUserIdAndUnreadCountGreaterThan(currentUserId, 0)
                .forEach(participant -> {
                    threadRepository.findById(participant.getThreadId()).ifPresent(thread -> {
                        if (thread.getTenantId().equals(tenantId) && !thread.isArchive()) {
                            items.add(threadToInboxItem(thread));
                        }
                    });
                });

        // 3. Unsigned encounters (DRAFT / IN_PROGRESS) for current provider
        encounterRepository.findByTenantIdAndProviderIdAndStatusIn(
                        tenantId, currentUserId, List.of(Encounter.EncounterStatus.DRAFT,
                        Encounter.EncounterStatus.IN_PROGRESS))
                .forEach(enc -> items.add(encounterToInboxItem(enc)));

        // Sort by receivedAt descending, then page manually
        items.sort(Comparator.comparing(InboxItemDto::getReceivedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), items.size());
        List<InboxItemDto> pageContent = start >= items.size() ? List.of() : items.subList(start, end);

        return new PageImpl<>(pageContent, pageable, items.size());
    }

    @Override
    public InboxCountDto getInboxCounts() {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        // Lab results: notifications of type WARNING or CRITICAL (maps to lab/PA alerts)
        long labResults = notificationRepository
                .findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(tenantId, currentUserId, Pageable.unpaged())
                .stream()
                .filter(n -> n.getType() == Notification.NotificationType.WARNING
                          || n.getType() == Notification.NotificationType.CRITICAL)
                .count();

        // Messages: threads with unread count > 0
        long messages = participantRepository
                .findByUserIdAndUnreadCountGreaterThan(currentUserId, 0)
                .stream()
                .filter(p -> threadRepository.findById(p.getThreadId())
                        .map(t -> t.getTenantId().equals(tenantId) && t.getType() != null && !t.isArchive())
                        .orElse(false))
                .count();

        // Unsigned encounters
        long tasks = encounterRepository.findByTenantIdAndProviderIdAndStatusIn(
                        tenantId, currentUserId, List.of(Encounter.EncounterStatus.DRAFT,
                        Encounter.EncounterStatus.IN_PROGRESS))
                .size();

        // INFO notifications → general / refill / system
        long infoNotifs = notificationRepository
                .findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(tenantId, currentUserId, Pageable.unpaged())
                .stream()
                .filter(n -> n.getType() == Notification.NotificationType.INFO
                          || n.getType() == Notification.NotificationType.SUCCESS)
                .count();

        long total = labResults + messages + tasks + infoNotifs;

        return InboxCountDto.builder()
                .labResults((int) labResults)
                .messages((int) messages)
                .refillRequests(0)   // Phase 4: refill prescription queue
                .priorAuths(0)       // Phase 4: prior auth queue
                .tasks((int) (tasks + infoNotifs))
                .total((int) total)
                .build();
    }

    @Override
    @Transactional
    public InboxItemDto actionItem(UUID uuid, InboxActionRequest request) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        // Try to find as a notification and mark it read
        return notificationRepository
                .findByTenantIdAndUserIdAndUuid(tenantId, currentUserId, uuid)
                .map(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                    log.info("Inbox item actioned uuid={} action={}", uuid, request.getAction());
                    InboxItemDto item = notificationToInboxItem(notification);
                    item.setStatus(STATUS_ACTIONED);
                    item.setActionedAt(Instant.now());
                    return item;
                })
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Inbox item not found: " + uuid));
    }

    @Override
    @Transactional
    public InboxItemDto archiveItem(UUID uuid) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        return notificationRepository
                .findByTenantIdAndUserIdAndUuid(tenantId, currentUserId, uuid)
                .map(notification -> {
                    notification.setRead(true);
                    notification.setArchive(true);
                    notificationRepository.save(notification);
                    log.info("Inbox item archived uuid={}", uuid);
                    InboxItemDto item = notificationToInboxItem(notification);
                    item.setStatus(STATUS_ARCHIVED);
                    item.setActionedAt(Instant.now());
                    return item;
                })
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Inbox item not found: " + uuid));
    }

    // ── Converters ────────────────────────────────────────────────────────────

    private InboxItemDto notificationToInboxItem(Notification n) {
        String type = mapNotificationTypeToInboxType(n.getType());
        String priority = switch (n.getType()) {
            case CRITICAL -> "CRITICAL";
            case WARNING  -> "URGENT";
            default       -> "NORMAL";
        };
        return InboxItemDto.builder()
                .uuid(n.getUuid())
                .itemType(type)
                .title(n.getTitle())
                .summary(n.getBody())
                .priority(priority)
                .status(n.isRead() ? STATUS_ACTIONED : STATUS_PENDING)
                .referenceUuid(n.getUuid().toString())
                .receivedAt(n.getCreatedAt())
                .build();
    }

    private InboxItemDto threadToInboxItem(MessageThread thread) {
        return InboxItemDto.builder()
                .uuid(thread.getUuid())
                .itemType("MESSAGE")
                .title(thread.getSubject())
                .summary(thread.getLastMessageText())
                .priority("NORMAL")
                .status(STATUS_PENDING)
                .referenceUuid(thread.getUuid().toString())
                .receivedAt(thread.getLastMessageAt() != null ? thread.getLastMessageAt() : thread.getCreatedAt())
                .build();
    }

    private InboxItemDto encounterToInboxItem(Encounter enc) {
        Patient patient = patientRepository.findById(enc.getPatientId()).orElse(null);
        String patientName = patient != null ? patient.getFirstName() + " " + patient.getLastName() : UNKNOWN_PATIENT;

        return InboxItemDto.builder()
                .uuid(enc.getUuid())
                .itemType("TASK")
                .title("Sign Encounter")
                .summary("Encounter pending signature — " + (enc.getChiefComplaint() != null ? enc.getChiefComplaint() : ""))
                .patientName(patientName)
                .patientUuid(patient != null ? patient.getUuid() : null)
                .priority("URGENT")
                .status(STATUS_PENDING)
                .referenceUuid(enc.getUuid().toString())
                .receivedAt(enc.getCreatedAt())
                .build();
    }

    private String mapNotificationTypeToInboxType(Notification.NotificationType type) {
        return switch (type) {
            case WARNING, CRITICAL -> "LAB_RESULT";
            case SUCCESS           -> "TASK";
            default                -> "TASK";
        };
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
