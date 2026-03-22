package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.BookmarkDto;
import com.thinkitive.primus.messaging.dto.MessageAttachmentDto;
import com.thinkitive.primus.messaging.dto.ReadReceiptDto;
import com.thinkitive.primus.messaging.entity.*;
import com.thinkitive.primus.messaging.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.thinkitive.primus.messaging.dto.AttachMessageRequest;

@ExtendWith(MockitoExtension.class)
class EnhancedMessagingServiceTest {

    @Mock MessageRepository              messageRepository;
    @Mock MessageThreadRepository        threadRepository;
    @Mock ThreadParticipantRepository    participantRepository;
    @Mock MessageAttachmentRepository    attachmentRepository;
    @Mock MessageBookmarkRepository      bookmarkRepository;
    @Mock MessageReadReceiptRepository   readReceiptRepository;

    @InjectMocks
    EnhancedMessagingServiceImpl enhancedMessagingService;

    private Message testMessage;
    private final String messageUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testMessage = Message.builder()
                .tenantId(1L)
                .threadId(10L)
                .senderUserId(1L)
                .senderName("Dr. Alex Rivera")
                .senderRole("PROVIDER")
                .body("Patient labs are back. Please review.")
                .sentAt(Instant.now())
                .hasAttachment(false)
                .build();
        testMessage.setId(1L);
        testMessage.setUuid(messageUuid);

        // Clear SecurityContext to default (returns "0" as user ID)
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("attachFile saves attachment and marks message hasAttachment=true")
    void attachFile_savesAttachmentAndMarksMessage() {
        AttachMessageRequest request = new AttachMessageRequest();
        request.setMessageUuid(messageUuid);
        request.setFileName("lab_results.pdf");
        request.setFileUrl("https://s3.amazonaws.com/bucket/lab_results.pdf");
        request.setFileSize(204800L);
        request.setContentType("application/pdf");

        MessageAttachment savedAttachment = MessageAttachment.builder()
                .tenantId(1L)
                .messageId(1L)
                .fileName("lab_results.pdf")
                .fileUrl("https://s3.amazonaws.com/bucket/lab_results.pdf")
                .fileSize(204800L)
                .contentType("application/pdf")
                .build();
        savedAttachment.setId(1L);
        savedAttachment.setUuid(UUID.randomUUID().toString());

        when(messageRepository.findAll()).thenReturn(List.of(testMessage));
        when(attachmentRepository.save(any(MessageAttachment.class))).thenReturn(savedAttachment);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        MessageAttachmentDto result = enhancedMessagingService.attachMessage(request);

        assertThat(result).isNotNull();
        assertThat(result.getFileName()).isEqualTo("lab_results.pdf");
        assertThat(result.getContentType()).isEqualTo("application/pdf");
        // Message should be marked as having an attachment
        verify(messageRepository).save(argThat(m -> m.isHasAttachment()));
    }

    @Test
    @DisplayName("bookmarkMessage saves bookmark for current user")
    void bookmarkMessage_savesBookmark() {
        MessageBookmark savedBookmark = MessageBookmark.builder()
                .tenantId(1L)
                .messageId(1L)
                .userId("0")
                .build();
        savedBookmark.setId(1L);
        savedBookmark.setUuid(UUID.randomUUID().toString());

        when(messageRepository.findAll()).thenReturn(List.of(testMessage));
        when(bookmarkRepository.existsByMessageIdAndUserIdAndArchiveFalse(1L, "0")).thenReturn(false);
        when(bookmarkRepository.save(any(MessageBookmark.class))).thenReturn(savedBookmark);

        BookmarkDto result = enhancedMessagingService.bookmarkMessage(messageUuid);

        assertThat(result).isNotNull();
        assertThat(result.getMessageUuid()).isEqualTo(messageUuid);
        verify(bookmarkRepository).save(any(MessageBookmark.class));
    }

    @Test
    @DisplayName("bookmarkMessage throws CONFLICT when message is already bookmarked")
    void bookmarkMessage_alreadyBookmarked_throws() {
        when(messageRepository.findAll()).thenReturn(List.of(testMessage));
        when(bookmarkRepository.existsByMessageIdAndUserIdAndArchiveFalse(1L, "0")).thenReturn(true);

        assertThatThrownBy(() -> enhancedMessagingService.bookmarkMessage(messageUuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already bookmarked");
    }

    @Test
    @DisplayName("markAsRead creates read receipt when one does not exist")
    void markAsRead_createsNewReadReceipt() {
        MessageReadReceipt savedReceipt = MessageReadReceipt.builder()
                .tenantId(1L)
                .messageId(1L)
                .userId("0")
                .readAt(Instant.now())
                .build();
        savedReceipt.setId(1L);
        savedReceipt.setUuid(UUID.randomUUID().toString());

        when(messageRepository.findAll()).thenReturn(List.of(testMessage));
        when(readReceiptRepository.findByMessageIdAndUserId(1L, "0")).thenReturn(Optional.empty());
        when(readReceiptRepository.save(any(MessageReadReceipt.class))).thenReturn(savedReceipt);

        ReadReceiptDto result = enhancedMessagingService.markRead(messageUuid);

        assertThat(result).isNotNull();
        assertThat(result.getMessageUuid()).isEqualTo(messageUuid);
        assertThat(result.getReadAt()).isNotNull();
        verify(readReceiptRepository).save(any(MessageReadReceipt.class));
    }

    @Test
    @DisplayName("markAsRead returns existing receipt without creating duplicate")
    void markAsRead_existingReceiptReturned() {
        MessageReadReceipt existingReceipt = MessageReadReceipt.builder()
                .tenantId(1L)
                .messageId(1L)
                .userId("0")
                .readAt(Instant.now().minusSeconds(300))
                .build();
        existingReceipt.setId(1L);
        existingReceipt.setUuid(UUID.randomUUID().toString());

        when(messageRepository.findAll()).thenReturn(List.of(testMessage));
        when(readReceiptRepository.findByMessageIdAndUserId(1L, "0")).thenReturn(Optional.of(existingReceipt));

        ReadReceiptDto result = enhancedMessagingService.markRead(messageUuid);

        assertThat(result).isNotNull();
        verify(readReceiptRepository, never()).save(any(MessageReadReceipt.class));
    }
}
