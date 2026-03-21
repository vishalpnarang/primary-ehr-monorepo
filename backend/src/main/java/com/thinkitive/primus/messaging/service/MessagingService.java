package com.thinkitive.primus.messaging.service;

import com.thinkitive.primus.messaging.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessagingService {

    Page<ThreadDto> listThreads(Pageable pageable);

    ThreadDto createThread(CreateThreadRequest request);

    ThreadDto getThread(String uuid);

    MessageDto sendMessage(String threadUuid, SendMessageRequest request);

    ThreadDto markThreadRead(String threadUuid);

    UnreadCountDto getUnreadCount();
}
