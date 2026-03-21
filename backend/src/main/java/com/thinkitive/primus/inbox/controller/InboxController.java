package com.thinkitive.primus.inbox.controller;

import com.thinkitive.primus.inbox.dto.InboxActionRequest;
import com.thinkitive.primus.inbox.service.InboxService;
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
@RequestMapping("/api/v1/inbox")
@RequiredArgsConstructor
public class InboxController extends BaseController {

    private final InboxService inboxService;

    /** GET /api/v1/inbox — unified inbox (labs, messages, refills, PA, tasks) */
    @GetMapping
    public ResponseEntity<ApiResponse> listInbox(@PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(inboxService.listInbox(pageable)));
    }

    /** GET /api/v1/inbox/count — counts by type */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse> getInboxCounts() {
        return ok(inboxService.getInboxCounts());
    }

    /** PATCH /api/v1/inbox/{uuid}/action */
    @PatchMapping("/{uuid}/action")
    public ResponseEntity<ApiResponse> actionItem(
            @PathVariable UUID uuid,
            @Valid @RequestBody InboxActionRequest request) {
        return ok(inboxService.actionItem(uuid, request), "Item actioned");
    }

    /** PATCH /api/v1/inbox/{uuid}/archive */
    @PatchMapping("/{uuid}/archive")
    public ResponseEntity<ApiResponse> archiveItem(@PathVariable UUID uuid) {
        return ok(inboxService.archiveItem(uuid), "Item archived");
    }
}
