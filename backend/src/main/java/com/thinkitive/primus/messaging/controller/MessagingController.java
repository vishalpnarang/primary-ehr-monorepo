package com.thinkitive.primus.messaging.controller;

import com.thinkitive.primus.messaging.dto.*;
import com.thinkitive.primus.messaging.service.MessagingService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessagingController extends BaseController {

    private final MessagingService messagingService;

    /** GET /api/v1/messages/threads */
    @GetMapping("/threads")
    public ResponseEntity<ApiResponse> listThreads(@PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(messagingService.listThreads(pageable)));
    }

    /** POST /api/v1/messages/threads */
    @PostMapping("/threads")
    public ResponseEntity<ApiResponse> createThread(@Valid @RequestBody CreateThreadRequest request) {
        return created(messagingService.createThread(request), "Thread created");
    }

    /** GET /api/v1/messages/threads/{uuid} */
    @GetMapping("/threads/{uuid}")
    public ResponseEntity<ApiResponse> getThread(@PathVariable UUID uuid) {
        return ok(messagingService.getThread(uuid));
    }

    /** POST /api/v1/messages/threads/{uuid}/messages */
    @PostMapping("/threads/{uuid}/messages")
    public ResponseEntity<ApiResponse> sendMessage(
            @PathVariable UUID uuid,
            @Valid @RequestBody SendMessageRequest request) {
        return created(messagingService.sendMessage(uuid, request), "Message sent");
    }

    /** PATCH /api/v1/messages/threads/{uuid}/read */
    @PatchMapping("/threads/{uuid}/read")
    public ResponseEntity<ApiResponse> markThreadRead(@PathVariable UUID uuid) {
        return ok(messagingService.markThreadRead(uuid), "Thread marked as read");
    }

    /** GET /api/v1/messages/unread-count */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount() {
        return ok(messagingService.getUnreadCount());
    }
}
