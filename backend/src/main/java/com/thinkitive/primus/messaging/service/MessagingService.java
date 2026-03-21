package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MessagingService {

    Page<ThreadDto> listThreads(Pageable pageable);

    ThreadDto createThread(CreateThreadRequest request);

    ThreadDto getThread(UUID uuid);

    MessageDto sendMessage(UUID threadUuid, SendMessageRequest request);

    ThreadDto markThreadRead(UUID threadUuid);

    UnreadCountDto getUnreadCount();
}
