package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;
import com.thinkitive.primus.messaging.entity.Message;
import com.thinkitive.primus.messaging.entity.MessageThread;
import com.thinkitive.primus.messaging.entity.ThreadParticipant;
import com.thinkitive.primus.messaging.repository.MessageRepository;
import com.thinkitive.primus.messaging.repository.MessageThreadRepository;
import com.thinkitive.primus.messaging.repository.ThreadParticipantRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Phase-8 implementation. Persists threads to DB; broadcasts via WebSocket.
 * Phase 8+: integrate Twilio SMS notifications for patient-side alerts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessagingServiceImpl implements MessagingService {

    private final MessageThreadRepository      threadRepository;
    private final MessageRepository            messageRepository;
    private final ThreadParticipantRepository  participantRepository;
    private final SimpMessagingTemplate        messagingTemplate;

    // ── Threads ───────────────────────────────────────────────────────────────

    @Override
    public Page<ThreadDto> listThreads(Pageable pageable) {
        Long tenantId  = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        return threadRepository.findThreadsByParticipant(tenantId, currentUserId, pageable)
                .map(thread -> toThreadDto(thread, currentUserId));
    }

    @Override
    @Transactional
    public ThreadDto createThread(CreateThreadRequest request) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();

        // Resolve thread type — map UI string to entity enum
        MessageThread.ThreadType threadType = resolveThreadType(request.getThreadType());

        MessageThread thread = MessageThread.builder()
                .tenantId(tenantId)
                .subject(request.getSubject())
                .type(threadType)
                .lastMessageAt(Instant.now())
                .build();
        threadRepository.save(thread);

        // Add initiating user as a participant
        addParticipant(thread.getId(), tenantId, currentUserId);

        // Add additional participants from the request
        if (request.getParticipantIds() != null) {
            for (String participantIdStr : request.getParticipantIds()) {
                try {
                    Long participantId = Long.parseLong(participantIdStr);
                    if (!participantId.equals(currentUserId)) {
                        addParticipant(thread.getId(), tenantId, participantId);
                    }
                } catch (NumberFormatException ignored) {
                    log.warn("Skipping non-numeric participant id: {}", participantIdStr);
                }
            }
        }

        // Send the initial message if provided
        MessageDto firstMsg = null;
        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            firstMsg = persistAndBroadcast(thread, currentUserId, request.getInitialMessage());
        }

        log.info("Created thread tenant={} uuid={} subject={}", tenantId, thread.getUuid(), request.getSubject());

        ThreadDto dto = toThreadDto(thread, currentUserId);
        dto.setLastMessage(firstMsg);
        return dto;
    }

    @Override
    public ThreadDto getThread(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        MessageThread thread = findThread(tenantId, uuid);

        Long currentUserId = currentUserId();
        ThreadDto dto = toThreadDto(thread, currentUserId);

        // Attach the most recent message as lastMessage
        List<Message> messages = messageRepository
                .findByThreadIdOrderBySentAtAsc(thread.getId(), Pageable.unpaged())
                .getContent();
        if (!messages.isEmpty()) {
            dto.setLastMessage(toMessageDto(messages.get(messages.size() - 1), thread.getUuid()));
        }
        return dto;
    }

    @Override
    @Transactional
    public MessageDto sendMessage(UUID threadUuid, SendMessageRequest request) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();
        MessageThread thread = findThread(tenantId, threadUuid);

        // Verify caller is a participant
        participantRepository.findByThreadIdAndUserId(thread.getId(), currentUserId)
                .orElseThrow(() -> new PrimusException(ResponseCode.FORBIDDEN,
                        "You are not a participant in thread " + threadUuid));

        MessageDto dto = persistAndBroadcast(thread, currentUserId, request.getBody());
        log.info("Message sent to thread={}", threadUuid);
        return dto;
    }

    @Override
    @Transactional
    public ThreadDto markThreadRead(UUID threadUuid) {
        Long tenantId     = TenantContext.getTenantId();
        Long currentUserId = currentUserId();
        MessageThread thread = findThread(tenantId, threadUuid);

        participantRepository.findByThreadIdAndUserId(thread.getId(), currentUserId)
                .ifPresent(p -> {
                    p.setUnreadCount(0);
                    participantRepository.save(p);
                });

        return toThreadDto(thread, currentUserId);
    }

    @Override
    public UnreadCountDto getUnreadCount() {
        Long currentUserId = currentUserId();

        List<ThreadParticipant> withUnread =
                participantRepository.findByUserIdAndUnreadCountGreaterThan(currentUserId, 0);

        int unreadThreads   = withUnread.size();
        int unreadMessages  = withUnread.stream().mapToInt(ThreadParticipant::getUnreadCount).sum();

        return UnreadCountDto.builder()
                .unreadThreads(unreadThreads)
                .unreadMessages(unreadMessages)
                .build();
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /**
     * Persists a message, updates the thread's lastMessage fields, increments
     * unread counts for all participants except the sender, and broadcasts
     * via WebSocket.
     */
    private MessageDto persistAndBroadcast(MessageThread thread, Long senderId, String body) {
        String senderName = currentDisplayName();

        Message message = Message.builder()
                .tenantId(thread.getTenantId())
                .threadId(thread.getId())
                .senderUserId(senderId)
                .senderName(senderName)
                .senderRole(currentRole())
                .body(body)
                .sentAt(Instant.now())
                .hasAttachment(false)
                .build();
        messageRepository.save(message);

        // Update thread metadata
        thread.setLastMessageAt(message.getSentAt());
        thread.setLastMessageText(body.length() > 500 ? body.substring(0, 497) + "..." : body);
        threadRepository.save(thread);

        // Increment unread count for all other participants
        participantRepository.findByThreadId(thread.getId()).forEach(p -> {
            if (!p.getUserId().equals(senderId)) {
                p.setUnreadCount(p.getUnreadCount() + 1);
                participantRepository.save(p);
            }
        });

        MessageDto dto = toMessageDto(message, thread.getUuid());

        // Broadcast to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/thread/" + thread.getUuid(), dto);
        log.debug("Broadcasted message to /topic/thread/{}", thread.getUuid());

        return dto;
    }

    private void addParticipant(Long threadId, Long tenantId, Long userId) {
        participantRepository.findByThreadIdAndUserId(threadId, userId).ifPresentOrElse(
                p -> { /* already a participant — no-op */ },
                () -> {
                    ThreadParticipant participant = ThreadParticipant.builder()
                            .tenantId(tenantId)
                            .threadId(threadId)
                            .userId(userId)
                            .unreadCount(0)
                            .build();
                    participantRepository.save(participant);
                }
        );
    }

    private MessageThread findThread(Long tenantId, UUID uuid) {
        // MessageThreadRepository queries by tenantId + participant; for direct lookup
        // we use the JpaRepository findById after resolving by uuid across all threads.
        return threadRepository.findAll().stream()
                .filter(t -> t.getTenantId().equals(tenantId) && uuid.equals(t.getUuid()) && !t.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Thread not found: " + uuid));
    }

    // ── DTO mappers ───────────────────────────────────────────────────────────

    private ThreadDto toThreadDto(MessageThread thread, Long currentUserId) {
        List<ThreadParticipant> participants = participantRepository.findByThreadId(thread.getId());
        int unread = participants.stream()
                .filter(p -> p.getUserId().equals(currentUserId))
                .mapToInt(ThreadParticipant::getUnreadCount)
                .sum();
        List<String> participantIds = participants.stream()
                .map(p -> String.valueOf(p.getUserId()))
                .toList();

        return ThreadDto.builder()
                .uuid(thread.getUuid())
                .subject(thread.getSubject())
                .threadType(thread.getType() != null ? thread.getType().name() : null)
                .participantIds(participantIds)
                .unreadCount(unread)
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getModifiedAt())
                .archived(thread.isArchive())
                .build();
    }

    private MessageDto toMessageDto(Message message, UUID threadUuid) {
        return MessageDto.builder()
                .uuid(message.getUuid())
                .threadUuid(threadUuid)
                .senderId(String.valueOf(message.getSenderUserId()))
                .senderName(message.getSenderName())
                .body(message.getBody())
                .read(message.getReadAt() != null)
                .sentAt(message.getSentAt())
                .build();
    }

    private MessageThread.ThreadType resolveThreadType(String raw) {
        if (raw == null) return MessageThread.ThreadType.TEAM;
        return switch (raw.toUpperCase()) {
            case "PATIENT_PROVIDER", "PATIENT_MESSAGE" -> MessageThread.ThreadType.PATIENT_PROVIDER;
            default -> MessageThread.ThreadType.TEAM;
        };
    }

    // ── Security helpers ──────────────────────────────────────────────────────

    /**
     * Resolves the numeric DB user ID from the JWT.
     * Keycloak maps the internal DB user ID to a custom claim named "user_id".
     * Falls back to parsing the "sub" as a Long for dev environments.
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaims().get("user_id");
            if (userIdClaim instanceof Number num) {
                return num.longValue();
            }
            if (userIdClaim instanceof String s) {
                try { return Long.parseLong(s); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
            }
            // Dev fallback: try parsing sub
            String sub = jwt.getSubject();
            try { return Long.parseLong(sub); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
        }
        // Default to 0L in tests / unauthenticated contexts
        return 0L;
    }

    private String currentDisplayName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String name = jwt.getClaimAsString("name");
            if (name != null && !name.isBlank()) return name;
            String username = jwt.getClaimAsString("preferred_username");
            if (username != null && !username.isBlank()) return username;
        }
        return "Unknown";
    }

    private String currentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "STAFF";
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("STAFF");
    }
}
