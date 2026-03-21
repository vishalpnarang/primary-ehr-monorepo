package com.thinkitive.primus.notification.service;

import com.thinkitive.primus.notification.dto.NotificationCountDto;
import com.thinkitive.primus.notification.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface NotificationService {

    Page<NotificationDto> listNotifications(Pageable pageable);

    NotificationDto markRead(String uuid);

    void markAllRead();

    NotificationCountDto getUnreadCount();
}
