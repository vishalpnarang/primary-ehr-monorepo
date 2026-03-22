package com.thinkitive.primus.messaging.controller;

import com.thinkitive.primus.messaging.dto.*;
import com.thinkitive.primus.messaging.service.EnhancedMessagingService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/messaging/enhanced")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ANY_STAFF_ROLE)
public class EnhancedMessagingController extends BaseController {

    private final EnhancedMessagingService enhancedMessagingService;

    // ── Attachments ───────────────────────────────────────────────────────────

    /** POST /api/v1/messaging/enhanced/attachments */
    @PostMapping("/attachments")
    public ResponseEntity<ApiResponse> attachMessage(
            @Valid @RequestBody AttachMessageRequest request) {
        return created(enhancedMessagingService.attachMessage(request), "Attachment added");
    }

    /** GET /api/v1/messaging/enhanced/messages/{messageUuid}/attachments */
    @GetMapping("/messages/{messageUuid}/attachments")
    public ResponseEntity<ApiResponse> getAttachments(@PathVariable String messageUuid) {
        return ok(enhancedMessagingService.getAttachments(messageUuid));
    }

    // ── Bookmarks ─────────────────────────────────────────────────────────────

    /** POST /api/v1/messaging/enhanced/messages/{messageUuid}/bookmark */
    @PostMapping("/messages/{messageUuid}/bookmark")
    public ResponseEntity<ApiResponse> bookmarkMessage(@PathVariable String messageUuid) {
        return created(enhancedMessagingService.bookmarkMessage(messageUuid), "Message bookmarked");
    }

    /** DELETE /api/v1/messaging/enhanced/messages/{messageUuid}/bookmark */
    @DeleteMapping("/messages/{messageUuid}/bookmark")
    public ResponseEntity<ApiResponse> removeBookmark(@PathVariable String messageUuid) {
        enhancedMessagingService.removeBookmark(messageUuid);
        return noContent();
    }

    /** GET /api/v1/messaging/enhanced/bookmarks */
    @GetMapping("/bookmarks")
    public ResponseEntity<ApiResponse> getBookmarks() {
        return ok(enhancedMessagingService.getBookmarks());
    }

    // ── Read Receipts ─────────────────────────────────────────────────────────

    /** POST /api/v1/messaging/enhanced/messages/{messageUuid}/read */
    @PostMapping("/messages/{messageUuid}/read")
    public ResponseEntity<ApiResponse> markRead(@PathVariable String messageUuid) {
        return ok(enhancedMessagingService.markRead(messageUuid), "Message marked as read");
    }

    /** GET /api/v1/messaging/enhanced/messages/{messageUuid}/read-receipts */
    @GetMapping("/messages/{messageUuid}/read-receipts")
    public ResponseEntity<ApiResponse> getReadReceipts(@PathVariable String messageUuid) {
        return ok(enhancedMessagingService.getReadReceipts(messageUuid));
    }

    /** GET /api/v1/messaging/enhanced/unread-count */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount() {
        return ok(enhancedMessagingService.getUnreadCount());
    }

    // ── Scheduled Messages ────────────────────────────────────────────────────

    /** POST /api/v1/messaging/enhanced/scheduled */
    @PostMapping("/scheduled")
    public ResponseEntity<ApiResponse> sendScheduledMessage(
            @Valid @RequestBody ScheduledMessageRequest request) {
        return created(enhancedMessagingService.sendScheduledMessage(request), "Message scheduled");
    }
}
