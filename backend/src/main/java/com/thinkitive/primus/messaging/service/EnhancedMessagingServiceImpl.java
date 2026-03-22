package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;
import com.thinkitive.primus.messaging.entity.*;
import com.thinkitive.primus.messaging.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnhancedMessagingServiceImpl implements EnhancedMessagingService {

    private final MessageRepository              messageRepository;
    private final MessageThreadRepository        threadRepository;
    private final ThreadParticipantRepository    participantRepository;
    private final MessageAttachmentRepository    attachmentRepository;
    private final MessageBookmarkRepository      bookmarkRepository;
    private final MessageReadReceiptRepository   readReceiptRepository;

    // ── Attachments ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MessageAttachmentDto attachMessage(AttachMessageRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Message message = requireMessage(tenantId, request.getMessageUuid());

        MessageAttachment attachment = MessageAttachment.builder()
                .tenantId(tenantId)
                .messageId(message.getId())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileSize(request.getFileSize())
                .contentType(request.getContentType())
                .build();

        MessageAttachment saved = attachmentRepository.save(attachment);

        // Mark the message as having an attachment
        message.setHasAttachment(true);
        messageRepository.save(message);

        log.info("Attachment added message={} file={}", request.getMessageUuid(), request.getFileName());
        return toAttachmentDto(saved, request.getMessageUuid());
    }

    @Override
    public List<MessageAttachmentDto> getAttachments(String messageUuid) {
        Long tenantId = TenantContext.getTenantId();
        Message message = requireMessage(tenantId, messageUuid);
        return attachmentRepository.findByMessageIdAndArchiveFalse(message.getId())
                .stream()
                .map(a -> toAttachmentDto(a, messageUuid))
                .toList();
    }

    // ── Bookmarks ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookmarkDto bookmarkMessage(String messageUuid) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        Message message = requireMessage(tenantId, messageUuid);

        if (bookmarkRepository.existsByMessageIdAndUserIdAndArchiveFalse(message.getId(), userId)) {
            throw new PrimusException(ResponseCode.CONFLICT, "Message already bookmarked");
        }

        MessageBookmark bookmark = MessageBookmark.builder()
                .tenantId(tenantId)
                .messageId(message.getId())
                .userId(userId)
                .build();

        MessageBookmark saved = bookmarkRepository.save(bookmark);
        log.info("Message bookmarked message={} user={}", messageUuid, userId);
        return toBookmarkDto(saved, messageUuid);
    }

    @Override
    @Transactional
    public void removeBookmark(String messageUuid) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        Message message = requireMessage(tenantId, messageUuid);

        bookmarkRepository.findByMessageIdAndUserIdAndArchiveFalse(message.getId(), userId)
                .ifPresent(b -> {
                    b.setArchive(true);
                    bookmarkRepository.save(b);
                    log.info("Bookmark removed message={} user={}", messageUuid, userId);
                });
    }

    @Override
    public List<BookmarkDto> getBookmarks() {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        return bookmarkRepository.findByUserIdAndTenantIdAndArchiveFalse(userId, tenantId)
                .stream()
                .map(b -> {
                    String msgUuid = messageRepository.findById(b.getMessageId())
                            .map(m -> m.getUuid())
                            .orElse("unknown");
                    return toBookmarkDto(b, msgUuid);
                })
                .toList();
    }

    // ── Read Receipts ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ReadReceiptDto markRead(String messageUuid) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        Message message = requireMessage(tenantId, messageUuid);

        return readReceiptRepository
                .findByMessageIdAndUserId(message.getId(), userId)
                .map(existing -> toReadReceiptDto(existing, messageUuid))
                .orElseGet(() -> {
                    MessageReadReceipt receipt = MessageReadReceipt.builder()
                            .tenantId(tenantId)
                            .messageId(message.getId())
                            .userId(userId)
                            .readAt(Instant.now())
                            .build();
                    MessageReadReceipt saved = readReceiptRepository.save(receipt);
                    log.info("Read receipt created message={} user={}", messageUuid, userId);
                    return toReadReceiptDto(saved, messageUuid);
                });
    }

    @Override
    public List<ReadReceiptDto> getReadReceipts(String messageUuid) {
        Long tenantId = TenantContext.getTenantId();
        Message message = requireMessage(tenantId, messageUuid);
        return readReceiptRepository.findByMessageIdAndArchiveFalse(message.getId())
                .stream()
                .map(r -> toReadReceiptDto(r, messageUuid))
                .toList();
    }

    @Override
    public long getUnreadCount() {
        String userId = currentUserIdStr();
        return readReceiptRepository.countByUserIdAndArchiveFalse(userId);
    }

    // ── Scheduled Messages ────────────────────────────────────────────────────

    @Override
    @Transactional
    public MessageDto sendScheduledMessage(ScheduledMessageRequest request) {
        Long tenantId     = TenantContext.getTenantId();
        String currentUserId = currentUserIdStr();

        MessageThread thread = threadRepository.findAll().stream()
                .filter(t -> t.getTenantId().equals(tenantId)
                        && request.getThreadUuid().equals(t.getUuid())
                        && !t.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Thread not found: " + request.getThreadUuid()));

        Message message = Message.builder()
                .tenantId(tenantId)
                .threadId(thread.getId())
                .senderUserId(parseLongSafe(currentUserId))
                .senderName(currentDisplayName())
                .senderRole(currentRole())
                .body(request.getBody())
                .sentAt(request.getScheduledAt())
                .hasAttachment(false)
                .build();

        Message saved = messageRepository.save(message);
        log.info("Scheduled message saved thread={} scheduledAt={}", request.getThreadUuid(), request.getScheduledAt());

        return MessageDto.builder()
                .uuid(saved.getUuid())
                .threadUuid(thread.getUuid())
                .senderId(currentUserId)
                .senderName(saved.getSenderName())
                .body(saved.getBody())
                .read(false)
                .sentAt(saved.getSentAt())
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Message requireMessage(Long tenantId, String uuid) {
        return messageRepository.findAll().stream()
                .filter(m -> m.getTenantId().equals(tenantId) && uuid.equals(m.getUuid()) && !m.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Message not found: " + uuid));
    }

    private MessageAttachmentDto toAttachmentDto(MessageAttachment a, String messageUuid) {
        return MessageAttachmentDto.builder()
                .uuid(a.getUuid())
                .messageUuid(messageUuid)
                .fileName(a.getFileName())
                .fileUrl(a.getFileUrl())
                .fileSize(a.getFileSize())
                .contentType(a.getContentType())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private BookmarkDto toBookmarkDto(MessageBookmark b, String messageUuid) {
        return BookmarkDto.builder()
                .uuid(b.getUuid())
                .messageUuid(messageUuid)
                .userId(b.getUserId())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private ReadReceiptDto toReadReceiptDto(MessageReadReceipt r, String messageUuid) {
        return ReadReceiptDto.builder()
                .uuid(r.getUuid())
                .messageUuid(messageUuid)
                .userId(r.getUserId())
                .readAt(r.getReadAt())
                .build();
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

    private Long parseLongSafe(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
