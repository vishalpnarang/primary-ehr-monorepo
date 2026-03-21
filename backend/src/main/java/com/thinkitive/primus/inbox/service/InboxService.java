package com.thinkitive.primus.inbox.service;

import com.thinkitive.primus.inbox.dto.InboxActionRequest;
import com.thinkitive.primus.inbox.dto.InboxCountDto;
import com.thinkitive.primus.inbox.dto.InboxItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InboxService {

    Page<InboxItemDto> listInbox(Pageable pageable);

    InboxCountDto getInboxCounts();

    InboxItemDto actionItem(UUID uuid, InboxActionRequest request);

    InboxItemDto archiveItem(UUID uuid);
}
