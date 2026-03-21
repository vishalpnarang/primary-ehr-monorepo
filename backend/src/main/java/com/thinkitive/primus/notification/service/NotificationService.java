package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.NotificationCountDto;
import com.thinkitive.primus.notification.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    Page<NotificationDto> listNotifications(Pageable pageable);

    NotificationDto markRead(UUID uuid);

    void markAllRead();

    NotificationCountDto getUnreadCount();
}
