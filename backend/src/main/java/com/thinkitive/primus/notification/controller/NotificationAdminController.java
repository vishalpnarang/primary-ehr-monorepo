package com.thinkitive.primus.notification.controller;

import com.thinkitive.primus.notification.dto.*;
import com.thinkitive.primus.notification.service.NotificationDispatchService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/admin")
@RequiredArgsConstructor
public class NotificationAdminController extends BaseController {

    private final NotificationDispatchService notificationDispatchService;

    // ── Device Tokens ─────────────────────────────────────────────────────────

    /** POST /api/v1/notifications/admin/devices */
    @PostMapping("/devices")
    public ResponseEntity<ApiResponse> registerDevice(
            @Valid @RequestBody RegisterDeviceRequest request) {
        return created(notificationDispatchService.registerDevice(request), "Device registered");
    }

    /** DELETE /api/v1/notifications/admin/devices/{id} */
    @DeleteMapping("/devices/{id}")
    public ResponseEntity<ApiResponse> removeDevice(@PathVariable String id) {
        notificationDispatchService.removeDevice(id);
        return noContent();
    }

    // ── Preferences ───────────────────────────────────────────────────────────

    /** GET /api/v1/notifications/admin/preferences */
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse> getPreferences() {
        return ok(notificationDispatchService.getPreferences());
    }

    /** PUT /api/v1/notifications/admin/preferences */
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse> updatePreferences(
            @Valid @RequestBody UpdatePreferenceRequest request) {
        return ok(notificationDispatchService.updatePreference(request), "Preferences updated");
    }

    // ── Dispatch ──────────────────────────────────────────────────────────────

    /** POST /api/v1/notifications/admin/send */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        return created(notificationDispatchService.logNotification(request), "Notification dispatched");
    }

    // ── History ───────────────────────────────────────────────────────────────

    /** GET /api/v1/notifications/admin/log */
    @GetMapping("/log")
    public ResponseEntity<ApiResponse> getLog(
            @PageableDefault(size = 50) Pageable pageable) {
        return ok(PageResponse.from(notificationDispatchService.getNotificationHistory(pageable)));
    }

    // ── Email Templates ───────────────────────────────────────────────────────

    /** GET /api/v1/notifications/admin/email-templates */
    @GetMapping("/email-templates")
    public ResponseEntity<ApiResponse> getEmailTemplates() {
        return ok(notificationDispatchService.getEmailTemplates());
    }

    /** POST /api/v1/notifications/admin/email-templates */
    @PostMapping("/email-templates")
    public ResponseEntity<ApiResponse> createEmailTemplate(
            @Valid @RequestBody CreateEmailTemplateRequest request) {
        return created(notificationDispatchService.createEmailTemplate(request), "Email template created");
    }
}
