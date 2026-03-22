package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;

import java.util.List;

public interface EnhancedMessagingService {

    /** Attach a file to an existing message. */
    MessageAttachmentDto attachMessage(AttachMessageRequest request);

    /** List all attachments on a message. */
    List<MessageAttachmentDto> getAttachments(String messageUuid);

    /** Bookmark a message for the current user. */
    BookmarkDto bookmarkMessage(String messageUuid);

    /** Remove bookmark from a message for the current user. */
    void removeBookmark(String messageUuid);

    /** List all bookmarked messages for the current user. */
    List<BookmarkDto> getBookmarks();

    /** Record a read receipt for a message. */
    ReadReceiptDto markRead(String messageUuid);

    /** Get all read receipts for a message. */
    List<ReadReceiptDto> getReadReceipts(String messageUuid);

    /** Get unread message count for the current user across all threads. */
    long getUnreadCount();

    /** Schedule a message to be sent at a future time. */
    MessageDto sendScheduledMessage(ScheduledMessageRequest request);
}
