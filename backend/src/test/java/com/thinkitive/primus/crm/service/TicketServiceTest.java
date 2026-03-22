package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.entity.Ticket;
import com.thinkitive.primus.crm.entity.TicketComment;
import com.thinkitive.primus.crm.repository.TicketCommentRepository;
import com.thinkitive.primus.crm.repository.TicketRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class TicketServiceTest {

    @Mock TicketRepository        ticketRepository;
    @Mock TicketCommentRepository commentRepository;

    @InjectMocks
    TicketServiceImpl ticketService;

    private Ticket testTicket;
    private final String ticketUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);
        SecurityContextHolder.clearContext();

        testTicket = Ticket.builder()
                .tenantId(1L)
                .subject("Patient portal login issue")
                .description("Patient unable to log in after password reset.")
                .status(Ticket.TicketStatus.OPEN)
                .priority(Ticket.TicketPriority.HIGH)
                .category("PATIENT_PORTAL")
                .reporterId("0")
                .build();
        testTicket.setId(1L);
        testTicket.setUuid(ticketUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("createTicket persists ticket with OPEN status and returns DTO")
    void createTicket_persistsWithOpenStatus() {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setSubject("Patient portal login issue");
        request.setDescription("Patient unable to log in after password reset.");
        request.setPriority("HIGH");
        request.setCategory("PATIENT_PORTAL");

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            t.setId(1L);
            t.setUuid(ticketUuid);
            return t;
        });
        when(commentRepository.findByTicketIdAndArchiveFalseOrderByCreatedAtAsc(1L))
                .thenReturn(List.of());

        TicketDto result = ticketService.createTicket(request);

        assertThat(result).isNotNull();
        assertThat(result.getSubject()).isEqualTo("Patient portal login issue");
        assertThat(result.getStatus()).isEqualTo("OPEN");
        assertThat(result.getPriority()).isEqualTo("HIGH");
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    @DisplayName("updateTicketStatus updates status to IN_PROGRESS")
    void updateTicketStatus_updatesStatus() {
        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setStatus("IN_PROGRESS");
        request.setAssignedTo("support-agent-001");

        Ticket updated = Ticket.builder()
                .tenantId(1L)
                .subject("Patient portal login issue")
                .description("Patient unable to log in after password reset.")
                .status(Ticket.TicketStatus.IN_PROGRESS)
                .priority(Ticket.TicketPriority.HIGH)
                .assignedTo("support-agent-001")
                .reporterId("0")
                .build();
        updated.setId(1L);
        updated.setUuid(ticketUuid);

        when(ticketRepository.findByTenantIdAndUuid(1L, ticketUuid)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(updated);
        when(commentRepository.findByTicketIdAndArchiveFalseOrderByCreatedAtAsc(1L))
                .thenReturn(List.of());

        TicketDto result = ticketService.updateTicket(ticketUuid, request);

        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(result.getAssignedTo()).isEqualTo("support-agent-001");
    }

    @Test
    @DisplayName("addComment creates comment linked to ticket")
    void addComment_createsComment() {
        AddCommentRequest request = new AddCommentRequest();
        request.setComment("I have reset the account and sent the patient a new verification email.");
        request.setInternal(false);

        TicketComment savedComment = TicketComment.builder()
                .tenantId(1L)
                .ticketId(1L)
                .userId("0")
                .comment("I have reset the account and sent the patient a new verification email.")
                .isInternal(false)
                .build();
        savedComment.setId(1L);
        savedComment.setUuid(UUID.randomUUID().toString());

        when(ticketRepository.findByTenantIdAndUuid(1L, ticketUuid)).thenReturn(Optional.of(testTicket));
        when(commentRepository.save(any(TicketComment.class))).thenReturn(savedComment);

        TicketCommentDto result = ticketService.addComment(ticketUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getComment()).contains("reset the account");
        assertThat(result.isInternal()).isFalse();
        assertThat(result.getTicketUuid()).isEqualTo(ticketUuid);
        verify(commentRepository).save(any(TicketComment.class));
    }

    @Test
    @DisplayName("getTicket throws NOT_FOUND for unknown UUID")
    void getTicket_notFound_throws() {
        String unknownUuid = UUID.randomUUID().toString();
        when(ticketRepository.findByTenantIdAndUuid(1L, unknownUuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicket(unknownUuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Ticket not found");
    }
}
