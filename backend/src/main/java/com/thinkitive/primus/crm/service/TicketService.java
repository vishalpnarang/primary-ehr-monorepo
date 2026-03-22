package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TicketService {

    Page<TicketDto> getTickets(String status, Pageable pageable);

    TicketDto getTicket(String uuid);

    TicketDto createTicket(CreateTicketRequest request);

    TicketDto updateTicket(String uuid, UpdateTicketRequest request);

    void deleteTicket(String uuid);

    List<TicketCommentDto> getComments(String ticketUuid);

    TicketCommentDto addComment(String ticketUuid, AddCommentRequest request);
}
