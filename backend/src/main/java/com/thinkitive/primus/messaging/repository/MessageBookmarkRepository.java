package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.MessageBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageBookmarkRepository extends JpaRepository<MessageBookmark, Long> {

    List<MessageBookmark> findByUserIdAndTenantIdAndArchiveFalse(String userId, Long tenantId);

    Optional<MessageBookmark> findByMessageIdAndUserIdAndArchiveFalse(Long messageId, String userId);

    boolean existsByMessageIdAndUserIdAndArchiveFalse(Long messageId, String userId);
}
