package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.entity.Ticket;
import com.thinkitive.primus.crm.entity.TicketComment;
import com.thinkitive.primus.crm.repository.TicketCommentRepository;
import com.thinkitive.primus.crm.repository.TicketRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketServiceImpl implements TicketService {

    private final TicketRepository        ticketRepository;
    private final TicketCommentRepository commentRepository;

    @Override
    public Page<TicketDto> getTickets(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        if (status != null) {
            Ticket.TicketStatus ticketStatus = parseTicketStatus(status);
            return ticketRepository.findByTenantIdAndStatusAndArchiveFalse(tenantId, ticketStatus, pageable)
                    .map(t -> toTicketDto(t, false));
        }
        return ticketRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(t -> toTicketDto(t, false));
    }

    @Override
    public TicketDto getTicket(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Ticket ticket = requireTicket(tenantId, uuid);
        return toTicketDto(ticket, true);
    }

    @Override
    @Transactional
    public TicketDto createTicket(CreateTicketRequest request) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();

        Ticket ticket = Ticket.builder()
                .tenantId(tenantId)
                .subject(request.getSubject())
                .description(request.getDescription())
                .status(Ticket.TicketStatus.OPEN)
                .priority(parsePriority(request.getPriority()))
                .category(request.getCategory())
                .assignedTo(request.getAssignedTo())
                .patientId(request.getPatientId())
                .reporterId(userId)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        log.info("Ticket created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toTicketDto(saved, false);
    }

    @Override
    @Transactional
    public TicketDto updateTicket(String uuid, UpdateTicketRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Ticket ticket = requireTicket(tenantId, uuid);

        if (request.getStatus()      != null) ticket.setStatus(parseTicketStatus(request.getStatus()));
        if (request.getPriority()    != null) ticket.setPriority(parsePriority(request.getPriority()));
        if (request.getCategory()    != null) ticket.setCategory(request.getCategory());
        if (request.getAssignedTo()  != null) ticket.setAssignedTo(request.getAssignedTo());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());

        Ticket saved = ticketRepository.save(ticket);
        log.info("Ticket updated uuid={}", uuid);
        return toTicketDto(saved, false);
    }

    @Override
    @Transactional
    public void deleteTicket(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Ticket ticket = requireTicket(tenantId, uuid);
        ticket.setArchive(true);
        ticketRepository.save(ticket);
        log.info("Ticket archived uuid={}", uuid);
    }

    @Override
    public List<TicketCommentDto> getComments(String ticketUuid) {
        Long tenantId = TenantContext.getTenantId();
        Ticket ticket = requireTicket(tenantId, ticketUuid);
        return commentRepository.findByTicketIdAndArchiveFalseOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(c -> toCommentDto(c, ticketUuid))
                .toList();
    }

    @Override
    @Transactional
    public TicketCommentDto addComment(String ticketUuid, AddCommentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();
        Ticket ticket = requireTicket(tenantId, ticketUuid);

        TicketComment comment = TicketComment.builder()
                .tenantId(tenantId)
                .ticketId(ticket.getId())
                .userId(userId)
                .comment(request.getComment())
                .isInternal(request.isInternal())
                .build();

        TicketComment saved = commentRepository.save(comment);
        log.info("Comment added ticket={} user={}", ticketUuid, userId);
        return toCommentDto(saved, ticketUuid);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Ticket requireTicket(Long tenantId, String uuid) {
        return ticketRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(t -> !t.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Ticket not found: " + uuid));
    }

    private TicketDto toTicketDto(Ticket t, boolean includeComments) {
        List<TicketCommentDto> comments = includeComments
                ? commentRepository.findByTicketIdAndArchiveFalseOrderByCreatedAtAsc(t.getId())
                        .stream().map(c -> toCommentDto(c, t.getUuid())).toList()
                : List.of();

        return TicketDto.builder()
                .uuid(t.getUuid())
                .subject(t.getSubject())
                .description(t.getDescription())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .priority(t.getPriority() != null ? t.getPriority().name() : null)
                .category(t.getCategory())
                .assignedTo(t.getAssignedTo())
                .patientId(t.getPatientId())
                .reporterId(t.getReporterId())
                .comments(comments)
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private TicketCommentDto toCommentDto(TicketComment c, String ticketUuid) {
        return TicketCommentDto.builder()
                .uuid(c.getUuid())
                .ticketUuid(ticketUuid)
                .userId(c.getUserId())
                .comment(c.getComment())
                .internal(c.isInternal())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private Ticket.TicketStatus parseTicketStatus(String value) {
        if (value == null) return Ticket.TicketStatus.OPEN;
        try {
            return Ticket.TicketStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown ticket status '{}', defaulting to OPEN", value);
            return Ticket.TicketStatus.OPEN;
        }
    }

    private Ticket.TicketPriority parsePriority(String value) {
        if (value == null) return Ticket.TicketPriority.MEDIUM;
        try {
            return Ticket.TicketPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown priority '{}', defaulting to MEDIUM", value);
            return Ticket.TicketPriority.MEDIUM;
        }
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
}
