package com.thinkitive.primus.notification.repository;

import com.thinkitive.primus.notification.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findByUserIdAndTenantIdAndArchiveFalse(String userId, Long tenantId);

    List<DeviceToken> findByUserIdAndIsActiveTrueAndArchiveFalse(String userId);

    Optional<DeviceToken> findByTokenAndArchiveFalse(String token);

    Optional<DeviceToken> findByTenantIdAndUuid(Long tenantId, String uuid);
}
