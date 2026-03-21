package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub. Phase 8: persist threads to DB, integrate Twilio for SMS notifications.
 * WebSocket broadcast: SimpMessagingTemplate sends to /topic/thread/{uuid}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessagingServiceImpl implements MessagingService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Page<ThreadDto> listThreads(Pageable pageable) {
        List<ThreadDto> threads = List.of(
                buildMockThread(UUID.randomUUID(), "Lab Results Review", "LAB_RESULT"),
                buildMockThread(UUID.randomUUID(), "Refill Request — Lisinopril", "REFILL_REQUEST")
        );
        return new PageImpl<>(threads, pageable, threads.size());
    }

    @Override
    @Transactional
    public ThreadDto createThread(CreateThreadRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating thread tenant={} subject={}", tenantId, request.getSubject());
        UUID threadUuid = UUID.randomUUID();
        ThreadDto thread = ThreadDto.builder()
                .uuid(threadUuid)
                .subject(request.getSubject())
                .threadType(request.getThreadType() != null ? request.getThreadType() : "INTERNAL")
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .participantIds(request.getParticipantIds() != null ? request.getParticipantIds() : List.of())
                .unreadCount(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .archived(false)
                .build();

        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            MessageDto firstMsg = buildMockMessage(threadUuid, request.getInitialMessage());
            thread.setLastMessage(firstMsg);
            broadcastMessage(threadUuid, firstMsg);
        }
        return thread;
    }

    @Override
    public ThreadDto getThread(UUID uuid) {
        ThreadDto thread = buildMockThread(uuid, "Lab Results Review", "LAB_RESULT");
        thread.setLastMessage(buildMockMessage(uuid, "Your CBC results look normal. No action needed."));
        return thread;
    }

    @Override
    @Transactional
    public MessageDto sendMessage(UUID threadUuid, SendMessageRequest request) {
        log.info("Sending message to thread={}", threadUuid);
        MessageDto message = buildMockMessage(threadUuid, request.getBody());
        // Broadcast via WebSocket to all thread subscribers
        broadcastMessage(threadUuid, message);
        return message;
    }

    @Override
    @Transactional
    public ThreadDto markThreadRead(UUID threadUuid) {
        ThreadDto thread = getThread(threadUuid);
        thread.setUnreadCount(0);
        return thread;
    }

    @Override
    public UnreadCountDto getUnreadCount() {
        return UnreadCountDto.builder()
                .unreadThreads(3)
                .unreadMessages(7)
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void broadcastMessage(UUID threadUuid, MessageDto message) {
        messagingTemplate.convertAndSend("/topic/thread/" + threadUuid, message);
        log.debug("Broadcasted message to /topic/thread/{}", threadUuid);
    }

    private ThreadDto buildMockThread(UUID uuid, String subject, String type) {
        return ThreadDto.builder()
                .uuid(uuid)
                .subject(subject)
                .threadType(type)
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .participantIds(List.of("PRV-00001", "staff-00002"))
                .unreadCount(2)
                .createdAt(Instant.now().minusSeconds(3600))
                .updatedAt(Instant.now())
                .archived(false)
                .build();
    }

    private MessageDto buildMockMessage(UUID threadUuid, String body) {
        return MessageDto.builder()
                .uuid(UUID.randomUUID())
                .threadUuid(threadUuid)
                .senderId("PRV-00001")
                .senderName("Dr. Sarah Mitchell")
                .body(body)
                .read(false)
                .sentAt(Instant.now())
                .build();
    }
}
