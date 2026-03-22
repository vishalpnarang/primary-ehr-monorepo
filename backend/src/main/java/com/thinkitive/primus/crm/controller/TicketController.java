package com.thinkitive.primus.crm.controller;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.service.TicketService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/crm/tickets")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ADMIN_ROLE)
public class TicketController extends BaseController {

    private final TicketService ticketService;

    /** GET /api/v1/crm/tickets */
    @GetMapping
    public ResponseEntity<ApiResponse> getTickets(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(ticketService.getTickets(status, pageable)));
    }

    /** GET /api/v1/crm/tickets/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getTicket(@PathVariable String uuid) {
        return ok(ticketService.getTicket(uuid));
    }

    /** POST /api/v1/crm/tickets */
    @PostMapping
    public ResponseEntity<ApiResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        return created(ticketService.createTicket(request), "Ticket created");
    }

    /** PUT /api/v1/crm/tickets/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateTicket(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateTicketRequest request) {
        return ok(ticketService.updateTicket(uuid, request), "Ticket updated");
    }

    /** DELETE /api/v1/crm/tickets/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteTicket(@PathVariable String uuid) {
        ticketService.deleteTicket(uuid);
        return noContent();
    }

    /** GET /api/v1/crm/tickets/{uuid}/comments */
    @GetMapping("/{uuid}/comments")
    public ResponseEntity<ApiResponse> getComments(@PathVariable String uuid) {
        return ok(ticketService.getComments(uuid));
    }

    /** POST /api/v1/crm/tickets/{uuid}/comments */
    @PostMapping("/{uuid}/comments")
    public ResponseEntity<ApiResponse> addComment(
            @PathVariable String uuid,
            @Valid @RequestBody AddCommentRequest request) {
        return created(ticketService.addComment(uuid, request), "Comment added");
    }
}
