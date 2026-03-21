package com.thinkitive.primus.notification.repository;

import com.thinkitive.primus.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByTenantIdAndUserIdOrderByCreatedAtDesc(
        Long tenantId, Long userId, Pageable pageable
    );

    long countByTenantIdAndUserIdAndReadFalse(Long tenantId, Long userId);

    Page<Notification> findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(
        Long tenantId, Long userId, Pageable pageable
    );
}
