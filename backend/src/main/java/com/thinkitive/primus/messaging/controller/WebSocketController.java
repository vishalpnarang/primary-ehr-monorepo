package com.thinkitive.primus.messaging.controller;

import com.thinkitive.primus.messaging.dto.MessageDto;
import com.thinkitive.primus.messaging.dto.SendMessageRequest;
import com.thinkitive.primus.messaging.dto.TypingEvent;
import com.thinkitive.primus.messaging.service.MessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import com.thinkitive.primus.shared.security.Roles;

/**
 * Handles inbound STOMP WebSocket messages from connected clients.
 * Clients connect to: ws://host/ws (SockJS endpoint).
 * Clients subscribe to: /topic/thread/{threadUuid}
 * Clients send to:      /app/chat.send/{threadUuid}
 *                       /app/chat.typing/{threadUuid}
 */
@Slf4j
@Controller
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ANY_STAFF_ROLE)
public class WebSocketController {

    private final MessagingService messagingService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * @MessageMapping("/chat.send/{threadUuid}")
     * Receives a chat message over WebSocket and persists + broadcasts it.
     * Broadcasts to: /topic/thread/{threadUuid}
     */
    @MessageMapping("/chat.send/{threadUuid}")
    @SendTo("/topic/thread/{threadUuid}")
    public MessageDto handleMessage(
            @DestinationVariable String threadUuid,
            SendMessageRequest request) {
        log.debug("WS message received — thread={} bodyLength={}", threadUuid, request.getBody().length());
        return messagingService.sendMessage(threadUuid, request);
    }

    /**
     * @MessageMapping("/chat.typing/{threadUuid}")
     * Relays a typing indicator to all other subscribers of the thread.
     * Broadcasts to: /topic/thread/{threadUuid}/typing
     */
    @MessageMapping("/chat.typing/{threadUuid}")
    public void handleTyping(
            @DestinationVariable String threadUuid,
            TypingEvent event) {
        event.setThreadUuid(threadUuid);
        log.debug("Typing event — thread={} user={} typing={}", threadUuid, event.getUserId(), event.isTyping());
        messagingTemplate.convertAndSend("/topic/thread/" + threadUuid + "/typing", event);
    }
}
