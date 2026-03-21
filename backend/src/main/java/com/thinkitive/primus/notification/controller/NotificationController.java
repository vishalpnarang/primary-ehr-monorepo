package com.thinkitive.primus.notification.controller;

import com.thinkitive.primus.notification.service.NotificationService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    /** GET /api/v1/notifications */
    @GetMapping
    public ResponseEntity<ApiResponse> listNotifications(@PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(notificationService.listNotifications(pageable)));
    }

    /** PATCH /api/v1/notifications/{uuid}/read */
    @PatchMapping("/{uuid}/read")
    public ResponseEntity<ApiResponse> markRead(@PathVariable String uuid) {
        return ok(notificationService.markRead(uuid), "Notification marked as read");
    }

    /** PATCH /api/v1/notifications/read-all */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllRead() {
        notificationService.markAllRead();
        return ok(null, "All notifications marked as read");
    }

    /** GET /api/v1/notifications/unread-count */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount() {
        return ok(notificationService.getUnreadCount());
    }
}
