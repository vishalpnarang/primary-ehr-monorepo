package com.thinkitive.primus.inbox.service;

import com.thinkitive.primus.inbox.dto.InboxActionRequest;
import com.thinkitive.primus.inbox.dto.InboxCountDto;
import com.thinkitive.primus.inbox.dto.InboxItemDto;
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
 * Phase-0 stub. Phase 4+: pull from real lab results, messaging, PA queues.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InboxServiceImpl implements InboxService {

    @Override
    public Page<InboxItemDto> listInbox(Pageable pageable) {
        List<InboxItemDto> items = List.of(
                buildMockItem(UUID.randomUUID(), "LAB_RESULT", "CBC Result", "All values within normal range", "NORMAL"),
                buildMockItem(UUID.randomUUID(), "REFILL_REQUEST", "Lisinopril Refill", "Patient requesting 30-day supply", "NORMAL"),
                buildMockItem(UUID.randomUUID(), "PRIOR_AUTH", "PA: MRI Lumbar Spine", "Prior auth required by BCBS", "URGENT"),
                buildMockItem(UUID.randomUUID(), "MESSAGE", "Patient Question", "James Anderson sent a message about his medication side effects", "NORMAL"),
                buildMockItem(UUID.randomUUID(), "TASK", "Sign Encounter", "Encounter ENC-00123 pending signature", "URGENT")
        );
        return new PageImpl<>(items, pageable, items.size());
    }

    @Override
    public InboxCountDto getInboxCounts() {
        return InboxCountDto.builder()
                .labResults(3)
                .messages(2)
                .refillRequests(4)
                .priorAuths(1)
                .tasks(2)
                .total(12)
                .build();
    }

    @Override
    @Transactional
    public InboxItemDto actionItem(UUID uuid, InboxActionRequest request) {
        log.info("Actioning inbox item uuid={} action={}", uuid, request.getAction());
        InboxItemDto item = buildMockItem(uuid, "TASK", "Task", "Task body", "NORMAL");
        item.setStatus("ACTIONED");
        item.setActionedAt(Instant.now());
        return item;
    }

    @Override
    @Transactional
    public InboxItemDto archiveItem(UUID uuid) {
        log.info("Archiving inbox item uuid={}", uuid);
        InboxItemDto item = buildMockItem(uuid, "TASK", "Task", "Task body", "NORMAL");
        item.setStatus("ARCHIVED");
        item.setActionedAt(Instant.now());
        return item;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private InboxItemDto buildMockItem(UUID uuid, String type, String title, String summary, String priority) {
        return InboxItemDto.builder()
                .uuid(uuid)
                .itemType(type)
                .title(title)
                .summary(summary)
                .patientName("James Anderson")
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .priority(priority)
                .status("PENDING")
                .referenceUuid(UUID.randomUUID().toString())
                .receivedAt(Instant.now().minusSeconds(3600))
                .build();
    }
}
