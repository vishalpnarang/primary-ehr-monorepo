package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {

    List<MessageAttachment> findByMessageIdAndArchiveFalse(Long messageId);

    List<MessageAttachment> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<MessageAttachment> findByTenantIdAndUuid(Long tenantId, String uuid);
}
