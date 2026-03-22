package com.thinkitive.primus.notification.repository;

import com.thinkitive.primus.notification.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    Page<NotificationLog> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<NotificationLog> findByRecipientIdAndTenantIdAndArchiveFalse(
            String recipientId, Long tenantId, Pageable pageable);
}
